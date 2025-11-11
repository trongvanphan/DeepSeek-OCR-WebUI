"""
Post-Processing Utilities for DeepSeek-OCR

This module provides utilities for post-processing OCR results:
- Image extraction from PDFs
- Bounding box and reference marker parsing
- Content cleaning and formatting
- Special token removal
"""

import re
import io
from typing import List, Dict, Any, Tuple, Optional
from pathlib import Path
from PIL import Image
import fitz  # PyMuPDF


class OCRPostProcessor:
    """
    Post-processor for DeepSeek-OCR output with image extraction and content cleaning.
    """
    
    def __init__(self, extract_images: bool = True, images_dir: str = "output/images"):
        """
        Initialize the post-processor.
        
        Args:
            extract_images: Whether to extract and save images
            images_dir: Directory to save extracted images
        """
        self.extract_images = extract_images
        self.images_dir = Path(images_dir)
        if self.extract_images:
            self.images_dir.mkdir(parents=True, exist_ok=True)
    
    def clean_content(self, content: str) -> str:
        """
        Clean OCR content by removing special tokens and formatting.
        
        Args:
            content: Raw OCR output
            
        Returns:
            Cleaned content
        """
        if not content:
            return ""
        
        # Remove grounding markers
        content = re.sub(r"<\|grounding\|>", "", content)
        
        # Remove reference and detection marker pairs
        content = re.sub(
            r"<\|ref\|>(.*?)<\|/ref\|>\s*<\|det\|>\s*\[.*?\]\s*<\|/det\|>",
            r"\1",
            content,
            flags=re.DOTALL
        )
        
        # Remove any remaining special tokens
        content = re.sub(r"<\|[^>]+\|>", "", content)
        
        # Clean up extra whitespace
        content = re.sub(r"\n{3,}", "\n\n", content)
        
        return content.strip()
    
    def parse_references(self, text: str) -> Tuple[List, List, List]:
        """
        Parse reference markers from OCR output.
        
        Format: <|ref|>label<|/ref|><|det|>[x1,y1,x2,y2]<|/det|>
        
        Args:
            text: OCR output with reference markers
            
        Returns:
            Tuple of (text_list, ref_list, box_list)
        """
        # Pattern to match reference markers with detection boxes
        pattern = r"<\|ref\|>(.*?)<\|/ref\|><\|det\|>(.*?)<\|/det\|>"
        matches = re.findall(pattern, text, re.DOTALL)
        
        text_list = []
        ref_list = []
        box_list = []
        
        for text_match, det_match in matches:
            text_list.append(text_match.strip())
            ref_list.append(text_match.strip())
            
            # Parse bounding box coordinates
            try:
                coords = re.findall(r'\d+', det_match)
                if len(coords) >= 4:
                    box = [int(coords[0]), int(coords[1]), int(coords[2]), int(coords[3])]
                    box_list.append(box)
                else:
                    box_list.append(None)
            except (ValueError, IndexError):
                box_list.append(None)
        
        return text_list, ref_list, box_list
    
    def extract_coordinates_and_label(self, ref_text: Tuple) -> Optional[Tuple[str, List]]:
        """
        Extract coordinates and label from reference text.
        
        Args:
            ref_text: Tuple of (label, detection_string)
            
        Returns:
            Tuple of (label, [x1, y1, x2, y2]) or None
        """
        if not ref_text or len(ref_text) < 2:
            return None
        
        label, det_string = ref_text
        
        try:
            # Extract numbers from detection string
            coords = re.findall(r'\d+', det_string)
            if len(coords) >= 4:
                box = [int(coords[0]), int(coords[1]), int(coords[2]), int(coords[3])]
                return (label, box)
        except (ValueError, IndexError):
            pass
        
        return None
    
    def extract_and_save_images(
        self,
        pdf_path: str,
        content: str,
        page_idx: int,
        base_filename: str
    ) -> Tuple[str, int]:
        """
        Extract images from PDF based on reference markers and save them.
        
        Args:
            pdf_path: Path to the PDF file
            content: OCR content with reference markers
            page_idx: Page index (0-based)
            base_filename: Base name for saved images
            
        Returns:
            Tuple of (cleaned_content, num_images_extracted)
        """
        if not self.extract_images:
            return content, 0
        
        # Parse references from content
        text_list, ref_list, box_list = self.parse_references(content)
        
        if not box_list:
            return content, 0
        
        try:
            # Open PDF and get the page
            pdf_document = fitz.open(pdf_path)
            page = pdf_document[page_idx]
            
            # Get page dimensions
            page_rect = page.rect
            page_width = page_rect.width
            page_height = page_rect.height
            
            # Convert page to image
            zoom = 2.0  # Higher quality for extraction
            matrix = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=matrix, alpha=False)
            
            # Convert to PIL Image
            img_data = pix.tobytes("png")
            page_image = Image.open(io.BytesIO(img_data))
            img_width, img_height = page_image.size
            
            # Extract and save each detected region
            num_saved = 0
            for idx, (label, box) in enumerate(zip(ref_list, box_list)):
                if box is None:
                    continue
                
                # Convert normalized coordinates (0-999) to pixel coordinates
                x1 = int((box[0] / 1000.0) * img_width)
                y1 = int((box[1] / 1000.0) * img_height)
                x2 = int((box[2] / 1000.0) * img_width)
                y2 = int((box[3] / 1000.0) * img_height)
                
                # Ensure coordinates are within image bounds
                x1 = max(0, min(x1, img_width))
                y1 = max(0, min(y1, img_height))
                x2 = max(0, min(x2, img_width))
                y2 = max(0, min(y2, img_height))
                
                # Skip invalid boxes
                if x2 <= x1 or y2 <= y1:
                    continue
                
                # Crop and save image
                try:
                    cropped = page_image.crop((x1, y1, x2, y2))
                    
                    # Generate filename
                    safe_label = re.sub(r'[^\w\-_]', '_', label)[:50]  # Sanitize filename
                    image_filename = f"{base_filename}_page{page_idx+1}_img{idx+1}_{safe_label}.png"
                    image_path = self.images_dir / image_filename
                    
                    # Save image
                    cropped.save(image_path)
                    num_saved += 1
                    
                except Exception as e:
                    print(f"Warning: Failed to save image {idx+1}: {e}")
                    continue
            
            pdf_document.close()
            return content, num_saved
            
        except Exception as e:
            print(f"Warning: Image extraction failed: {e}")
            return content, 0
    
    def process_page_content(
        self,
        pdf_path: str,
        content: str,
        page_idx: int,
        base_filename: str = None
    ) -> Dict[str, Any]:
        """
        Process a single page's OCR content with full post-processing.
        
        Args:
            pdf_path: Path to the PDF file
            content: Raw OCR output
            page_idx: Page index (0-based)
            base_filename: Base filename for image extraction
            
        Returns:
            Dictionary with processed content and metadata
        """
        if not content:
            return {
                "content": "",
                "cleaned_content": "",
                "images_extracted": 0,
                "references": []
            }
        
        # Extract images if enabled
        images_extracted = 0
        if self.extract_images and pdf_path and base_filename:
            content, images_extracted = self.extract_and_save_images(
                pdf_path, content, page_idx, base_filename
            )
        
        # Parse references
        text_list, ref_list, box_list = self.parse_references(content)
        references = []
        for text, ref, box in zip(text_list, ref_list, box_list):
            references.append({
                "text": text,
                "label": ref,
                "box": box
            })
        
        # Clean content
        cleaned_content = self.clean_content(content)
        
        return {
            "content": content,  # Original with markers
            "cleaned_content": cleaned_content,  # Cleaned version
            "images_extracted": images_extracted,
            "references": references
        }
    
    def add_page_markers(self, pages_content: List[str]) -> str:
        """
        Combine multiple pages with page split markers.
        
        Args:
            pages_content: List of page contents
            
        Returns:
            Combined content with page markers
        """
        if not pages_content:
            return ""
        
        combined = []
        for idx, content in enumerate(pages_content):
            combined.append(content)
            if idx < len(pages_content) - 1:  # Don't add marker after last page
                combined.append("\n\n<--- Page Split --->\n\n")
        
        return "".join(combined)


def normalize_bbox(box: List[int], image_width: int, image_height: int) -> List[int]:
    """
    Convert normalized bounding box (0-999) to pixel coordinates.
    
    Args:
        box: Normalized bounding box [x1, y1, x2, y2]
        image_width: Image width in pixels
        image_height: Image height in pixels
        
    Returns:
        Pixel coordinates [x1, y1, x2, y2]
    """
    x1 = int((box[0] / 1000.0) * image_width)
    y1 = int((box[1] / 1000.0) * image_height)
    x2 = int((box[2] / 1000.0) * image_width)
    y2 = int((box[3] / 1000.0) * image_height)
    
    return [x1, y1, x2, y2]


def extract_pdf_images(pdf_path: str, dpi: int = 144) -> List[Image.Image]:
    """
    Extract all pages from a PDF as PIL Images.
    
    Args:
        pdf_path: Path to PDF file
        dpi: Resolution for rendering
        
    Returns:
        List of PIL Images
    """
    images = []
    
    try:
        pdf_document = fitz.open(pdf_path)
        zoom = dpi / 72.0
        matrix = fitz.Matrix(zoom, zoom)
        
        for page_num in range(pdf_document.page_count):
            page = pdf_document[page_num]
            pixmap = page.get_pixmap(matrix=matrix, alpha=False)
            
            # Convert to PIL Image
            img_data = pixmap.tobytes("png")
            img = Image.open(io.BytesIO(img_data))
            images.append(img)
        
        pdf_document.close()
        
    except Exception as e:
        print(f"Error extracting images from PDF: {e}")
    
    return images
