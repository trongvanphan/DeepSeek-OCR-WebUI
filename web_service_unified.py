#!/usr/bin/env python3
"""
DeepSeek-OCR Web Service - Unified Multi-Platform

A FastAPI-based OCR service that automatically detects the platform and uses the optimal backend:
- Apple Silicon (M1/M2/M3) -> MPS (Metal Performance Shaders)
- NVIDIA GPU -> CUDA
- CPU fallback for systems without GPU acceleration

Features:
- Multi-platform support with automatic backend selection
- Multiple OCR modes (document, general, find, freeform, etc.)
- PDF to image conversion
- Bounding box detection for grounding mode
- RESTful API with FastAPI
- Responsive Web UI
"""

# Standard library imports
import os
import re
import tempfile
import io
import base64
import platform
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager
from pathlib import Path

# Third-party imports
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps
import uvicorn
import fitz  # PyMuPDF for PDF processing
from decouple import config  # Environment configuration

# ==============================================================================
# Global State
# ==============================================================================
backend = None  # Will hold the OCR backend instance
backend_type = None  # Will store the detected backend type (mps/cuda/cpu)

# ==============================================================================
# Platform Detection
# ==============================================================================

def detect_platform() -> str:
    """
    Detect the execution platform and return the appropriate backend type.
    
    Detection logic:
    1. Check for FORCE_BACKEND environment variable (manual override)
    2. Detect Apple Silicon with MPS support
    3. Detect NVIDIA GPU with CUDA support
    4. Fallback to CPU
    
    Returns:
        str: Backend type - "mps", "cuda", or "cpu"
    
    Environment Variables:
        FORCE_BACKEND: Override auto-detection (values: mps, cuda, cpu)
    """
    system = platform.system()
    machine = platform.machine()
    
    # Manual backend override via environment variable
    force_backend = config("FORCE_BACKEND", default="").lower()
    if force_backend in ["mps", "cuda", "cpu"]:
        print(f"🔧 Forced backend: {force_backend.upper()}")
        return force_backend
    
    # Apple Silicon with MPS (Metal Performance Shaders) support
    if system == "Darwin" and machine == "arm64":
        try:
            import torch
            if torch.backends.mps.is_available():
                print("✅ Detected Apple Silicon with MPS support")
                return "mps"
        except ImportError:
            pass
        print("⚠️  Apple Silicon detected but MPS not available, falling back...")
    
    # NVIDIA GPU with CUDA support
    try:
        import torch
        if torch.cuda.is_available():
            gpu_name = torch.cuda.get_device_name(0)
            print(f"✅ Detected NVIDIA GPU: {gpu_name}")
            return "cuda"
    except ImportError:
        pass
    
    # CPU fallback
    print("⚠️  No GPU detected, using CPU mode (slower performance)")
    return "cpu"

# ==============================================================================
# Application Lifecycle Management
# ==============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan context manager for startup and shutdown events.
    
    Startup:
    - Detects platform and selects appropriate backend
    - Loads OCR model into memory
    - Initializes backend-specific configurations
    
    Shutdown:
    - Cleans up resources
    - Frees GPU memory if applicable
    
    Args:
        app: FastAPI application instance
    """
    global backend, backend_type
    
    # Startup
    print("=" * 50)
    print("🚀 DeepSeek-OCR Unified Service Starting...")
    print("=" * 50)
    
    # Detect platform and load appropriate backend
    backend_type = detect_platform()
    
    try:
        if backend_type == "mps":
            # Apple Silicon with Metal Performance Shaders
            from backends.mps_backend import MPSBackend
            backend = MPSBackend()
            backend.load_model()
            
        elif backend_type == "cuda":
            # NVIDIA GPU with CUDA
            from backends.cuda_backend import CUDABackend
            backend = CUDABackend()
            
            # Try HuggingFace Hub first, fallback to ModelScope if unavailable
            try:
                backend.load_model(source="huggingface", timeout=300)
            except Exception as e:
                print(f"⚠️  HuggingFace download failed: {e}")
                print("🔄 Switching to ModelScope mirror...")
                backend.load_model(source="modelscope")
                
        elif backend_type == "cpu":
            # CPU fallback
            from backends.cpu_backend import CPUBackend
            backend = CPUBackend()
            backend.load_model()
            
        else:
            raise RuntimeError(f"Unsupported backend type: {backend_type}")
        
        print(f"✅ Backend loaded successfully: {backend_type.upper()}")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Failed to load backend: {e}")
        raise
    
    # Yield control to FastAPI
    yield
    
    # Shutdown
    print("🛑 Service shutting down...")

# ==============================================================================
# FastAPI Application Setup
# ==============================================================================

app = FastAPI(
    title="DeepSeek-OCR Unified API",
    description="Multi-platform OCR service with automatic backend selection (MPS/CUDA/CPU)",
    version="4.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS middleware for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (adjust for production)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# ==============================================================================
# Prompt Engineering
# ==============================================================================

def build_prompt(mode: str, custom_prompt: str = "", find_term: str = "", include_caption: bool = False) -> str:
    """
    Build an OCR prompt based on the selected mode.
    
    DeepSeek-OCR supports various modes with different prompts that guide
    the model's output format and behavior.
    
    Args:
        mode: OCR mode - "document", "ocr", "free", "figure", "describe", "find", or "freeform"
        custom_prompt: Custom prompt text for freeform mode
        find_term: Search term for find mode (e.g., "Total", "Invoice #")
        include_caption: Add caption generation instruction to prompt
    
    Returns:
        str: Formatted prompt string for the model
    
    Available Modes:
        - document: Convert document to Markdown format
        - ocr: General OCR with grounding markers
        - free: Plain text extraction without formatting
        - figure: Parse charts and figures
        - describe: Generate detailed image description
        - find: Locate specific text with bounding boxes
        - freeform: Custom user-defined prompt
    """
    templates = {
        "document": "<image>\n<|grounding|>Convert the document to markdown.",
        "ocr": "<image>\n<|grounding|>OCR this image.",
        "free": "<image>\nFree OCR. Only output the raw text.",
        "figure": "<image>\nParse the figure.",
        "describe": "<image>\nDescribe this image in detail.",
        "find": "<image>\n<|grounding|>Locate <|ref|>{term}<|/ref|> in the image.",
        "freeform": "<image>\n{prompt}",
    }
    
    if mode == "find":
        term = find_term.strip() or "Total"  # Default to "Total" if empty
        prompt = templates["find"].replace("{term}", term)
    elif mode == "freeform":
        prompt_text = custom_prompt.strip() or "OCR this image."  # Default prompt
        prompt = templates["freeform"].replace("{prompt}", prompt_text)
    else:
        prompt = templates.get(mode, templates["document"])
    
    # Append caption instruction if requested
    if include_caption and mode not in ["describe", "figure"]:
        prompt += " Include a detailed caption describing the image content."
    
    return prompt

# ==============================================================================
# Text Processing & Bounding Box Parsing
# ==============================================================================

def clean_grounding_text(text: str) -> str:
    """
    Remove grounding markers from OCR output.
    
    DeepSeek-OCR uses special markers like <|ref|>, <|det|>, and <|grounding|>
    to indicate bounding box information. This function strips them out to
    get clean text output.
    
    Args:
        text: Raw OCR output with grounding markers
    
    Returns:
        str: Cleaned text without markers
    """
    # Remove reference and detection marker pairs: <|ref|>text<|/ref|><|det|>[coords]<|/det|>
    cleaned = re.sub(
        r"<\|ref\|>(.*?)<\|/ref\|>\s*<\|det\|>\s*\[.*?\]\s*<\|/det\|>",
        r"\1",
        text,
        flags=re.DOTALL
    )
    # Remove grounding marker
    cleaned = re.sub(r"<\|grounding\|>", "", cleaned)
    return cleaned.strip()


def parse_detections(text: str, image_width: int, image_height: int) -> List[Dict[str, Any]]:
    """
    Parse bounding boxes from grounding markers in OCR output.
    
    DeepSeek-OCR outputs bounding boxes in normalized coordinates (0-999)
    which need to be converted to actual pixel coordinates.
    
    Format: <|ref|>label<|/ref|><|det|>[x1,y1,x2,y2]<|/det|>
    
    Args:
        text: OCR output containing grounding markers
        image_width: Original image width in pixels
        image_height: Original image height in pixels
    
    Returns:
        List of dictionaries with format:
        [{"label": "text", "box": [x1, y1, x2, y2]}, ...]
        
    Example:
        Input: "<|ref|>Total<|/ref|><|det|>[100,200,300,250]<|/det|>"
        Output: [{"label": "Total", "box": [102, 204, 306, 255]}]
    """
    boxes = []
    # Pattern to match reference-detection pairs
    pattern = re.compile(
        r"<\|ref\|>(?P<label>.*?)<\|/ref\|>\s*<\|det\|>\s*(?P<coords>\[.*?\])\s*<\|/det\|>",
        re.DOTALL
    )
    
    for match in pattern.finditer(text or ""):
        label = match.group("label").strip()
        coords_str = match.group("coords").strip()
        
        try:
            import ast
            parsed = ast.literal_eval(coords_str)
            
            # Handle single box or list of boxes
            if isinstance(parsed, list) and len(parsed) == 4:
                box_coords = [parsed]
            elif isinstance(parsed, list):
                box_coords = parsed
            else:
                continue
            
            # Convert normalized coordinates (0-999) to pixel coordinates
            for box in box_coords:
                if isinstance(box, (list, tuple)) and len(box) >= 4:
                    x1 = int(float(box[0]) / 999 * image_width)
                    y1 = int(float(box[1]) / 999 * image_height)
                    x2 = int(float(box[2]) / 999 * image_width)
                    y2 = int(float(box[3]) / 999 * image_height)
                    boxes.append({
                        "label": label,
                        "box": [x1, y1, x2, y2]
                    })
        except Exception:
            # Skip malformed coordinates
            continue
    
    return boxes

# ==============================================================================
# API Endpoints
# ==============================================================================

@app.get("/", response_class=HTMLResponse)
async def root():
    """
    Serve the main web UI.
    
    Returns:
        HTML content of the OCR web interface
    """
    ui_file = Path(__file__).parent / "ocr_ui_modern.html"
    
    if ui_file.exists():
        return HTMLResponse(content=ui_file.read_text(encoding='utf-8'))
    
    # Fallback if UI file is missing
    return HTMLResponse(
        content="<h1>DeepSeek-OCR</h1><p>UI file not found. Please ensure ocr_ui_modern.html exists.</p>",
        status_code=404
    )


@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring and load balancers.
    
    Returns:
        JSON with service status and platform information
        
    Example Response:
        {
            "status": "healthy",
            "backend": "mps",
            "platform": "Darwin",
            "machine": "arm64",
            "model_loaded": true
        }
    """
    return {
        "status": "healthy",
        "backend": backend_type,
        "platform": platform.system(),
        "machine": platform.machine(),
        "model_loaded": backend is not None
    }

# ==============================================================================
# Parameter Validation
# ==============================================================================

def validate_ocr_parameters(base_size: int, image_size: int) -> None:
    """
    Validate OCR processing parameters.
    
    Args:
        base_size: Base resolution for image processing
        image_size: Patch size for vision encoder
    
    Raises:
        HTTPException: If parameters are out of valid range
    """
    if not 512 <= base_size <= 2048:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid base_size: {base_size}. Must be between 512 and 2048."
        )
    
    if not 224 <= image_size <= 1280:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image_size: {image_size}. Must be between 224 and 1280."
        )

# ==============================================================================
# OCR Endpoint
# ==============================================================================

@app.post("/ocr")
async def ocr_endpoint(
    file: UploadFile = File(...),
    prompt_type: str = Form("document"),
    find_term: str = Form(""),
    custom_prompt: str = Form(""),
    grounding: bool = Form(False),
    base_size: int = Form(1024),
    image_size: int = Form(640),
    crop_mode: bool = Form(True),
    include_caption: bool = Form(False)
):
    """
    Main OCR endpoint for processing images.
    
    Accepts an image file and processes it using the selected OCR mode.
    Supports various modes including document conversion, text extraction,
    find & locate, and custom prompts.
    
    Args:
        file: Uploaded image file (JPG, PNG, JPEG, BMP, GIF)
        prompt_type: OCR mode - "document", "ocr", "free", "figure", "describe", "find", "freeform"
        find_term: Search term for find mode (e.g., "Total", "Invoice #")
        custom_prompt: Custom prompt text for freeform mode
        grounding: Whether to include bounding boxes (currently unused, auto-detected)
        base_size: Base resolution for image processing (default: 1024, range: 512-2048)
        image_size: Patch size for vision encoder (default: 640, range: 224-1024)
        crop_mode: Enable image cropping to improve accuracy (default: True)
        include_caption: Add caption generation instruction to prompt (default: False)
    
    Returns:
        JSON response with:
        {
            "success": bool,
            "text": str,              # Cleaned OCR text
            "raw_text": str,          # Original output with markers
            "boxes": List[Dict],      # Bounding boxes if detected
            "image_dims": Dict,       # Original image dimensions
            "prompt_type": str,       # Mode used
            "metadata": Dict          # Additional info
        }
    
    Raises:
        HTTPException: 503 if backend not loaded, 500 for processing errors
    """
    if backend is None:
        raise HTTPException(
            status_code=503,
            detail="OCR backend not loaded. Service may be starting up."
        )
    
    # Validate parameters
    validate_ocr_parameters(base_size, image_size)
    
    tmp_file = None
    
    try:
        # Save uploaded image to temporary file
        image_data = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png', mode='wb') as tmp:
            tmp.write(image_data)
            tmp_file = tmp.name
        
        # Load image and get dimensions
        with Image.open(tmp_file) as img:
            # Handle EXIF orientation and convert to RGB
            img = ImageOps.exif_transpose(img).convert('RGB')
            orig_w, orig_h = img.size
        
        # Build appropriate prompt based on mode
        prompt = build_prompt(prompt_type, custom_prompt, find_term, include_caption)
        
        # Run OCR inference (pass advanced parameters to backend)
        text = backend.infer(
            prompt=prompt,
            image_path=tmp_file,
            base_size=base_size,
            image_size=image_size,
            crop_mode=crop_mode
        )
        
        # Parse bounding boxes if grounding markers present
        boxes = parse_detections(text, orig_w, orig_h) if "<|det|>" in text else []
        
        # Clean text for display
        display_text = clean_grounding_text(text)
        # If no text but boxes exist, show box labels
        if not display_text and boxes:
            display_text = ", ".join([b["label"] for b in boxes])
        
        return JSONResponse({
            "success": True,
            "text": display_text,
            "raw_text": text,
            "boxes": boxes,
            "image_dims": {"w": orig_w, "h": orig_h},
            "prompt_type": prompt_type,
            "metadata": {
                "mode": prompt_type,
                "backend": backend_type,
                "has_boxes": len(boxes) > 0
            }
        })
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"❌ OCR Error:\n{error_trace}")
        return JSONResponse(
            {"success": False, "error": str(e)},
            status_code=500
        )
        
    finally:
        # Clean up temporary file
        if tmp_file and os.path.exists(tmp_file):
            os.remove(tmp_file)

@app.post("/pdf-to-images")
async def pdf_to_images_endpoint(file: UploadFile = File(...)):
    """
    Convert PDF file to image array for batch processing.
    
    Converts each page of a PDF into a high-resolution PNG image.
    Uses 144 DPI (2x zoom) for better OCR accuracy.
    
    Args:
        file: Uploaded PDF file
    
    Returns:
        JSON response with:
        {
            "success": bool,
            "images": List[Dict],     # Array of base64-encoded images
            "page_count": int,        # Total pages converted
            "original_filename": str  # Original PDF filename
        }
        
        Each image in the array contains:
        {
            "data": str,           # Base64-encoded PNG with data URL prefix
            "name": str,           # Page filename (e.g., "page_1.png")
            "width": int,          # Image width in pixels
            "height": int,         # Image height in pixels
            "page_number": int     # 1-indexed page number
        }
    
    Raises:
        HTTPException: 400 if file is not a PDF, 500 for conversion errors
    """
    tmp_file = None
    
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only PDF files are supported."
            )
        
        # Save uploaded PDF to temporary file
        pdf_data = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf', mode='wb') as tmp:
            tmp.write(pdf_data)
            tmp_file = tmp.name
        
        # Convert PDF pages to images
        images = []
        pdf_doc = fitz.open(tmp_file)
        
        # Use 2x zoom (144 DPI) for better quality
        zoom = 144 / 72.0  # 72 DPI is default, 144 DPI is 2x
        matrix = fitz.Matrix(zoom, zoom)
        
        for page_num in range(pdf_doc.page_count):
            page = pdf_doc[page_num]
            
            # Render page to pixmap (no alpha channel)
            pixmap = page.get_pixmap(matrix=matrix, alpha=False)
            img_data = pixmap.tobytes("png")
            img = Image.open(io.BytesIO(img_data)).convert('RGB')
            
            # Encode image to base64
            img_buffer = io.BytesIO()
            img.save(img_buffer, format='PNG', optimize=True)
            img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
            
            images.append({
                "data": f"data:image/png;base64,{img_base64}",
                "name": f"page_{page_num + 1}.png",
                "width": img.size[0],
                "height": img.size[1],
                "page_number": page_num + 1
            })
        
        pdf_doc.close()
        
        return JSONResponse({
            "success": True,
            "images": images,
            "page_count": len(images),
            "original_filename": file.filename
        })
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"❌ PDF Conversion Error:\n{error_trace}")
        return JSONResponse(
            {"success": False, "error": str(e)},
            status_code=500
        )
        
    finally:
        # Clean up temporary file
        if tmp_file and os.path.exists(tmp_file):
            os.remove(tmp_file)

# ==============================================================================
# Main Entry Point
# ==============================================================================

if __name__ == "__main__":
    # Get port from environment variable or use default
    port = config("PORT", default=8001, cast=int)
    
    # Display startup banner
    print(f"\n{'=' * 50}")
    print(f"🚀 DeepSeek-OCR Unified Service")
    print(f"{'=' * 50}")
    print(f"📍 Web UI:  http://0.0.0.0:{port}")
    print(f"📚 API Docs: http://0.0.0.0:{port}/docs")
    print(f"🔍 Health:   http://0.0.0.0:{port}/health")
    print(f"{'=' * 50}\n")
    
    # Start the server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True
    )
