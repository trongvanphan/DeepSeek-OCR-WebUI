#!/usr/bin/env python3
"""
PDF to Markdown Processor - Basic Version

This script scans a data folder for PDF files and converts them to Markdown format
using the DeepSeek OCR API. Each PDF file is converted to a Markdown file with
the same name in the same folder.

Features:
- Batch processing of PDFs
- Automatic API endpoint detection
- Progress tracking
- Error handling and logging

Usage:
    python pdf_to_markdown_processor.py

Prerequisites:
    - DeepSeek OCR API running at http://localhost:8000
    - PDF files in the ./data folder
"""

import os
import sys
import glob
import logging
import requests
from pathlib import Path
from typing import List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('pdf_processor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class PDFToMarkdownProcessor:
    """Processor for converting PDF files to Markdown using DeepSeek OCR API"""
    
    def __init__(self, data_folder: str = "data", api_base_url: str = "http://localhost:8000"):
        """
        Initialize the PDF processor
        
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
        Call the OCR API to process a PDF file
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Markdown content or None if processing failed
        """
        try:
            # Use the enhanced PDF endpoint
            endpoint = "/ocr/pdf"
            url = f"{self.api_base_url}{endpoint}"
            
            logger.info(f"Processing PDF with API endpoint: {url}")
            
            # Prepare the file for multipart/form-data upload
            with open(pdf_path, 'rb') as pdf_file:
                files = {'file': (os.path.basename(pdf_path), pdf_file, 'application/pdf')}
                
                # Use markdown-specific prompt
                data = {
                    'prompt': '<image>\n<|grounding|>Convert the document to markdown.',
                    'prompt_type': 'document'
                }
                
                response = requests.post(url, files=files, data=data, timeout=300)
                
                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"Successfully processed PDF")
                    
                    # Extract markdown content from BatchOCRResponse
                    if isinstance(result, dict):
                        # Check if this is a batch response with results
                        if "results" in result and isinstance(result["results"], list):
                            # Combine all page results into a single markdown
                            markdown_content = ""
                            for page_result in result["results"]:
                                if isinstance(page_result, dict) and "result" in page_result:
                                    page_content = page_result["result"]
                                    if page_content:
                                        markdown_content += page_content + "\n\n<--- Page Split --->\n\n"
                            return markdown_content.strip()
                        
                        # Try common response field names
                        for field in ["result", "text", "content", "markdown"]:
                            if field in result and result[field]:
                                return result[field]
                    
                    logger.error(f"Unexpected response format: {result}")
                    return None
                else:
                    logger.error(f"API request failed with status {response.status_code}: {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error calling OCR API: {str(e)}")
            return None
    
    def convert_pdf_to_markdown(self, pdf_path: str) -> Optional[str]:
        """
        Convert a single PDF file to Markdown
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Path to the generated Markdown file, or None if conversion failed
        """
        try:
            logger.info(f"📄 Processing PDF: {pdf_path}")
            
            # Call OCR API
            markdown_content = self._call_ocr_api(pdf_path)
            
            if not markdown_content:
                logger.error(f"Failed to get markdown content for {pdf_path}")
                return None
            
            # Save markdown file with -MD suffix
            pdf_path_obj = Path(pdf_path)
            markdown_path = pdf_path_obj.with_name(f"{pdf_path_obj.stem}-MD.md")
            
            with open(markdown_path, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            
            logger.info(f"✅ Saved markdown to: {markdown_path}")
            return str(markdown_path)
            
        except Exception as e:
            logger.error(f"Error converting PDF: {str(e)}")
            return None
    
    def scan_and_process_all_pdfs(self) -> List[str]:
        """
        Scan the data folder for PDF files and process them all
        
        Returns:
            List of paths to generated markdown files
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
            result = self.convert_pdf_to_markdown(str(pdf_file))
            if result:
                results.append(result)
            logger.info(f"{'=' * 60}\n")
        
        return results


def main():
    """Main function to run the PDF processor"""
    print("\n" + "=" * 60)
    print("📚 PDF to Markdown Processor - Basic Version")
    print("=" * 60 + "\n")
    
    try:
        # Initialize processor
        processor = PDFToMarkdownProcessor(
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
        
        print("\n" + "=" * 60 + "\n")
        
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
