#!/usr/bin/env python3
"""
PDF to OCR Processor - Enhanced Version

This script extracts plain text from PDFs using Free OCR mode with enhanced
post-processing including image extraction and content cleaning.

Features:
- Plain text OCR extraction (no markdown formatting)
- Image extraction from detected regions
- Special token cleanup
- Progress tracking and logging

Usage:
    python pdf_to_ocr_enhanced.py

Prerequisites:
    - DeepSeek OCR API running at http://localhost:8000
    - PDF files in the ./data folder
"""

import os
import sys
import logging
import requests
from pathlib import Path
from typing import List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('pdf_ocr_processor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class PDFToOCRProcessor:
    """Processor for extracting plain text from PDFs using DeepSeek OCR API"""
    
    def __init__(self, data_folder: str = "data", api_base_url: str = "http://localhost:8000"):
        """
        Initialize the PDF OCR processor
        
        Args:
            data_folder: Path to the folder containing PDF files
            api_base_url: Base URL of the DeepSeek OCR API
        """
        self.data_folder = Path(data_folder)
        self.data_folder.mkdir(exist_ok=True)
        self.api_base_url = api_base_url
        
        # Test API connection
        if not self._test_api_connection():
            raise ConnectionError(f"Cannot connect to API at {api_base_url}")
    
    def _test_api_connection(self) -> bool:
        """Test if the API is accessible"""
        try:
            response = requests.get(f"{self.api_base_url}/health", timeout=5)
            if response.status_code == 200:
                logger.info("✅ API connection successful")
                return True
            else:
                logger.error(f"API returned status code: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            logger.error(f"API connection failed: {str(e)}")
            return False
    
    def _call_ocr_api(self, pdf_path: str) -> Optional[str]:
        """
        Call the OCR API to process a PDF file using Free OCR mode
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            OCR text content or None if processing failed
        """
        try:
            endpoint = "/ocr/pdf"
            url = f"{self.api_base_url}{endpoint}"
            
            logger.info(f"Processing PDF with Free OCR mode: {url}")
            
            with open(pdf_path, 'rb') as pdf_file:
                files = {'file': (os.path.basename(pdf_path), pdf_file, 'application/pdf')}
                
                # Use Free OCR prompt for plain text extraction
                data = {
                    'prompt': '<image>\nFree OCR.',
                    'prompt_type': 'free',
                    'extract_images': 'true'
                }
                
                response = requests.post(url, files=files, data=data, timeout=300)
                
                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"Successfully processed PDF")
                    
                    # Extract OCR content from BatchOCRResponse
                    if isinstance(result, dict):
                        total_images = result.get("total_images_extracted", 0)
                        if total_images > 0:
                            logger.info(f"📷 Extracted {total_images} images")
                        
                        if "results" in result and isinstance(result["results"], list):
                            # Combine all page results
                            ocr_content = ""
                            for page_result in result["results"]:
                                if isinstance(page_result, dict) and "result" in page_result:
                                    page_content = page_result["result"]
                                    if page_content:
                                        ocr_content += page_content + "\n\n<--- Page Split --->\n\n"
                            return ocr_content.strip()
                        
                        # Try common response field names
                        for field in ["result", "text", "content"]:
                            if field in result and result[field]:
                                return result[field]
                    
                    logger.error(f"Unexpected response format: {result}")
                    return None
                else:
                    logger.error(f"API request failed with status {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error calling OCR API: {str(e)}")
            return None
    
    def convert_pdf_to_ocr(self, pdf_path: str) -> Optional[str]:
        """
        Convert a single PDF file to plain OCR text
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Path to the generated text file, or None if conversion failed
        """
        try:
            logger.info(f"📄 Processing PDF: {pdf_path}")
            
            # Call OCR API
            ocr_content = self._call_ocr_api(pdf_path)
            
            if not ocr_content:
                logger.error(f"Failed to get OCR content for {pdf_path}")
                return None
            
            # Save text file with -OCR suffix
            pdf_path_obj = Path(pdf_path)
            ocr_path = pdf_path_obj.with_name(f"{pdf_path_obj.stem}-OCR.md")
            
            with open(ocr_path, 'w', encoding='utf-8') as f:
                f.write(ocr_content)
            
            logger.info(f"✅ Saved OCR text to: {ocr_path}")
            return str(ocr_path)
            
        except Exception as e:
            logger.error(f"Error converting PDF: {str(e)}")
            return None
    
    def scan_and_process_all_pdfs(self) -> List[str]:
        """
        Scan the data folder for PDF files and process them all
        
        Returns:
            List of paths to generated text files
        """
        # Find all PDF files
        pdf_files = list(self.data_folder.glob("*.pdf"))
        
        if not pdf_files:
            logger.warning(f"No PDF files found in {self.data_folder}")
            return []
        
        logger.info(f"Found {len(pdf_files)} PDF files to process")
        
        # Process each PDF
        results = []
        for pdf_file in pdf_files:
            logger.info(f"\n{'=' * 60}")
            result = self.convert_pdf_to_ocr(str(pdf_file))
            if result:
                results.append(result)
            logger.info(f"{'=' * 60}\n")
        
        return results


def main():
    """Main function to run the PDF OCR processor"""
    print("\n" + "=" * 60)
    print("📚 PDF to OCR Processor - Enhanced Version")
    print("=" * 60 + "\n")
    
    try:
        # Initialize processor
        processor = PDFToOCRProcessor(
            data_folder="data",
            api_base_url="http://localhost:8000"
        )
        
        # Process all PDFs
        results = processor.scan_and_process_all_pdfs()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 Processing Summary")
        print("=" * 60)
        print(f"✅ Successfully processed: {len(results)} files")
        
        if results:
            print("\n📝 Generated files:")
            for result_file in results:
                print(f"  - {result_file}")
        
        print("\n💡 Tip: Check output/images/ folder for extracted images")
        print("\n" + "=" * 60 + "\n")
        
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
