#!/usr/bin/env python3
"""
DeepSeek OCR Python Client

A Python client library for integrating with the DeepSeek OCR API.
Provides easy-to-use methods for processing images and PDFs.

Example Usage:
    from python_client import DeepSeekOCRClient
    
    client = DeepSeekOCRClient(base_url="http://localhost:8000")
    
    # Process a single image
    result = client.process_image("document.jpg")
    print(result["result"])
    
    # Process a PDF
    pdf_result = client.process_pdf("document.pdf")
    for page in pdf_result["results"]:
        print(f"Page {page['page_number']}: {page['result'][:100]}...")
"""

import requests
from typing import Dict, Any, Optional, List
from pathlib import Path


class DeepSeekOCRClient:
    """Client for interacting with DeepSeek OCR API"""
    
    def __init__(self, base_url: str = "http://localhost:8000", timeout: int = 300):
        """
        Initialize the OCR client
        
        Args:
            base_url: Base URL of the DeepSeek OCR API
            timeout: Request timeout in seconds (default: 300)
        """
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
    
    def health_check(self) -> Dict[str, Any]:
        """
        Check API health status
        
        Returns:
            Health status information
        """
        response = requests.get(f"{self.base_url}/health", timeout=5)
        response.raise_for_status()
        return response.json()
    
    def process_image(
        self,
        image_path: str,
        prompt: Optional[str] = None,
        prompt_type: str = "document",
        base_size: int = 1024,
        image_size: int = 640,
        crop_mode: bool = True
    ) -> Dict[str, Any]:
        """
        Process a single image file
        
        Args:
            image_path: Path to the image file
            prompt: Optional custom prompt (overrides prompt_type)
            prompt_type: OCR mode - "document", "ocr", "free", "figure", "describe", "find"
            base_size: Base resolution for processing (512-2048)
            image_size: Patch size for vision encoder (224-1024)
            crop_mode: Enable cropping optimization
            
        Returns:
            Dictionary with OCR results:
            {
                "success": bool,
                "result": str,
                "page_count": int,
                "mode": str,
                "prompt_used": str
            }
        """
        with open(image_path, 'rb') as f:
            files = {'file': (Path(image_path).name, f, 'image/jpeg')}
            data = {
                'prompt_type': prompt_type,
                'base_size': base_size,
                'image_size': image_size,
                'crop_mode': crop_mode
            }
            
            if prompt:
                data['prompt'] = prompt
            
            response = requests.post(
                f"{self.base_url}/ocr/image",
                files=files,
                data=data,
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
    
    def process_pdf(
        self,
        pdf_path: str,
        prompt: Optional[str] = None,
        prompt_type: str = "document",
        base_size: int = 1024,
        image_size: int = 640,
        crop_mode: bool = True,
        extract_images: bool = True
    ) -> Dict[str, Any]:
        """
        Process a PDF file
        
        Args:
            pdf_path: Path to the PDF file
            prompt: Optional custom prompt (overrides prompt_type)
            prompt_type: OCR mode - "document", "ocr", "free", etc.
            base_size: Base resolution for processing
            image_size: Patch size for vision encoder
            crop_mode: Enable cropping optimization
            extract_images: Extract and save detected images
            
        Returns:
            Dictionary with batch OCR results:
            {
                "success": bool,
                "results": [
                    {
                        "success": bool,
                        "result": str,
                        "page_number": int,
                        "images_extracted": int,
                        "references": []
                    },
                    ...
                ],
                "total_pages": int,
                "filename": str,
                "mode": str,
                "prompt_used": str,
                "total_images_extracted": int
            }
        """
        with open(pdf_path, 'rb') as f:
            files = {'file': (Path(pdf_path).name, f, 'application/pdf')}
            data = {
                'prompt_type': prompt_type,
                'base_size': base_size,
                'image_size': image_size,
                'crop_mode': crop_mode,
                'extract_images': extract_images
            }
            
            if prompt:
                data['prompt'] = prompt
            
            response = requests.post(
                f"{self.base_url}/ocr/pdf",
                files=files,
                data=data,
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
    
    def process_image_with_custom_prompt(
        self,
        image_path: str,
        custom_prompt: str
    ) -> Dict[str, Any]:
        """
        Process an image with a custom prompt
        
        Args:
            image_path: Path to the image file
            custom_prompt: Custom prompt string
            
        Returns:
            OCR results dictionary
        """
        return self.process_image(image_path, prompt=custom_prompt)
    
    def extract_text_from_pdf(
        self,
        pdf_path: str,
        mode: str = "free"
    ) -> str:
        """
        Extract plain text from a PDF (convenience method)
        
        Args:
            pdf_path: Path to the PDF file
            mode: OCR mode (default: "free" for plain text)
            
        Returns:
            Combined text from all pages
        """
        result = self.process_pdf(pdf_path, prompt_type=mode)
        
        if not result.get("success"):
            raise Exception(f"PDF processing failed: {result.get('error')}")
        
        # Combine all page results
        text_parts = []
        for page_result in result.get("results", []):
            if page_result.get("success") and page_result.get("result"):
                text_parts.append(page_result["result"])
        
        return "\n\n<--- Page Split --->\n\n".join(text_parts)
    
    def convert_pdf_to_markdown(self, pdf_path: str) -> str:
        """
        Convert a PDF to Markdown format (convenience method)
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Markdown content
        """
        result = self.process_pdf(pdf_path, prompt_type="document")
        
        if not result.get("success"):
            raise Exception(f"PDF processing failed: {result.get('error')}")
        
        # Combine all page results
        markdown_parts = []
        for page_result in result.get("results", []):
            if page_result.get("success") and page_result.get("result"):
                markdown_parts.append(page_result["result"])
        
        return "\n\n<--- Page Split --->\n\n".join(markdown_parts)


# ==============================================================================
# Example Usage
# ==============================================================================

def example_basic_usage():
    """Example: Basic OCR operations"""
    print("=" * 60)
    print("Example 1: Basic Image OCR")
    print("=" * 60)
    
    client = DeepSeekOCRClient()
    
    # Check API health
    health = client.health_check()
    print(f"API Status: {health['status']}")
    print(f"Backend: {health['backend']}")
    
    # Process an image
    # result = client.process_image("path/to/image.jpg")
    # print(f"OCR Result: {result['result'][:200]}...")
    

def example_custom_prompts():
    """Example: Using custom prompts"""
    print("\n" + "=" * 60)
    print("Example 2: Custom Prompts")
    print("=" * 60)
    
    client = DeepSeekOCRClient()
    
    # Custom prompt for table extraction
    # custom_prompt = "<image>\n<|grounding|>Extract all tables and format as CSV."
    # result = client.process_image_with_custom_prompt("table.jpg", custom_prompt)
    # print(f"Table Data:\n{result['result']}")


def example_pdf_processing():
    """Example: PDF batch processing"""
    print("\n" + "=" * 60)
    print("Example 3: PDF Processing")
    print("=" * 60)
    
    client = DeepSeekOCRClient()
    
    # Process PDF and get structured results
    # pdf_result = client.process_pdf("document.pdf", extract_images=True)
    # 
    # print(f"Total Pages: {pdf_result['total_pages']}")
    # print(f"Images Extracted: {pdf_result['total_images_extracted']}")
    # 
    # for page_result in pdf_result["results"]:
    #     page_num = page_result['page_number']
    #     success = page_result['success']
    #     print(f"Page {page_num}: {'✓' if success else '✗'}")


def example_convenience_methods():
    """Example: Using convenience methods"""
    print("\n" + "=" * 60)
    print("Example 4: Convenience Methods")
    print("=" * 60)
    
    client = DeepSeekOCRClient()
    
    # Extract plain text
    # text = client.extract_text_from_pdf("document.pdf")
    # print(f"Plain Text:\n{text[:500]}...")
    
    # Convert to markdown
    # markdown = client.convert_pdf_to_markdown("document.pdf")
    # print(f"\nMarkdown:\n{markdown[:500]}...")


def example_error_handling():
    """Example: Error handling"""
    print("\n" + "=" * 60)
    print("Example 5: Error Handling")
    print("=" * 60)
    
    client = DeepSeekOCRClient()
    
    try:
        # Attempt to process non-existent file
        result = client.process_image("nonexistent.jpg")
    except FileNotFoundError as e:
        print(f"❌ File not found: {e}")
    except requests.exceptions.RequestException as e:
        print(f"❌ API request failed: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("DeepSeek OCR Python Client - Examples")
    print("=" * 60)
    
    # Run examples (uncomment the ones you want to try)
    example_basic_usage()
    # example_custom_prompts()
    # example_pdf_processing()
    # example_convenience_methods()
    # example_error_handling()
    
    print("\n" + "=" * 60)
    print("✅ Examples completed")
    print("=" * 60 + "\n")
