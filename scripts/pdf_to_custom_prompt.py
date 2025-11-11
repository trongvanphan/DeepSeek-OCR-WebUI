#!/usr/bin/env python3
"""
PDF to Custom Prompt Processor

This script processes PDFs using a custom prompt loaded from custom_prompt.yaml
file. Allows for flexible, user-defined OCR behavior.

Features:
- Custom prompt support via YAML configuration
- Full post-processing with image extraction
- Progress tracking and logging

Usage:
    1. Edit custom_prompt.yaml with your desired prompt
    2. Run: python pdf_to_custom_prompt.py

Prerequisites:
    - DeepSeek OCR API running at http://localhost:8000
    - PDF files in the ./data folder
    - custom_prompt.yaml in the project root
"""

import os
import sys
import logging
import requests
import yaml
from pathlib import Path
from typing import List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('pdf_custom_processor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class PDFToCustomPromptProcessor:
    """Processor for converting PDFs using custom prompts"""
    
    def __init__(
        self,
        data_folder: str = "data",
        api_base_url: str = "http://localhost:8000",
        custom_prompt_file: str = "custom_prompt.yaml"
    ):
        """
        Initialize the PDF processor with custom prompt
        
        Args:
            data_folder: Path to the folder containing PDF files
            api_base_url: Base URL of the DeepSeek OCR API
            custom_prompt_file: Path to YAML file with custom prompt
        """
        self.data_folder = Path(data_folder)
        self.data_folder.mkdir(exist_ok=True)
        self.api_base_url = api_base_url
        self.custom_prompt_file = custom_prompt_file
        
        # Load custom prompt
        self.custom_prompt = self._load_custom_prompt()
        
        # Test API connection
        if not self._test_api_connection():
            raise ConnectionError(f"Cannot connect to API at {api_base_url}")
    
    def _load_custom_prompt(self) -> str:
        """Load custom prompt from YAML file"""
        try:
            yaml_path = Path(self.custom_prompt_file)
            if yaml_path.exists():
                with open(yaml_path, 'r', encoding='utf-8') as f:
                    data = yaml.safe_load(f)
                    prompt = data.get('prompt', '<image>\n<|grounding|>Convert the document to markdown.')
                    logger.info(f"✅ Loaded custom prompt from {self.custom_prompt_file}")
                    logger.info(f"📝 Prompt: {prompt[:100]}...")
                    return prompt
            else:
                logger.warning(f"Custom prompt file not found: {self.custom_prompt_file}")
                logger.info("Using default markdown prompt")
                return '<image>\n<|grounding|>Convert the document to markdown.'
        except Exception as e:
            logger.error(f"Error loading custom prompt: {str(e)}")
            logger.info("Using default markdown prompt")
            return '<image>\n<|grounding|>Convert the document to markdown.'
    
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
        Call the OCR API to process a PDF file using the custom prompt
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            OCR content or None if processing failed
        """
        try:
            endpoint = "/ocr/pdf"
            url = f"{self.api_base_url}{endpoint}"
            
            logger.info(f"Processing PDF with custom prompt")
            
            with open(pdf_path, 'rb') as pdf_file:
                files = {'file': (os.path.basename(pdf_path), pdf_file, 'application/pdf')}
                
                # Use custom prompt
                data = {
                    'prompt': self.custom_prompt,
                    'extract_images': 'true'
                }
                
                response = requests.post(url, files=files, data=data, timeout=300)
                
                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"Successfully processed PDF")
                    
                    # Extract content from response
                    if isinstance(result, dict):
                        total_images = result.get("total_images_extracted", 0)
                        if total_images > 0:
                            logger.info(f"📷 Extracted {total_images} images")
                        
                        if "results" in result and isinstance(result["results"], list):
                            # Combine all page results
                            content = ""
                            for page_result in result["results"]:
                                if isinstance(page_result, dict) and "result" in page_result:
                                    page_content = page_result["result"]
                                    if page_content:
                                        content += page_content + "\n\n<--- Page Split --->\n\n"
                            return content.strip()
                        
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
    
    def convert_pdf_to_custom(self, pdf_path: str) -> Optional[str]:
        """
        Convert a single PDF file using custom prompt
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Path to the generated file, or None if conversion failed
        """
        try:
            logger.info(f"📄 Processing PDF: {pdf_path}")
            
            # Call OCR API
            content = self._call_ocr_api(pdf_path)
            
            if not content:
                logger.error(f"Failed to get content for {pdf_path}")
                return None
            
            # Save file with -CUSTOM suffix
            pdf_path_obj = Path(pdf_path)
            output_path = pdf_path_obj.with_name(f"{pdf_path_obj.stem}-CUSTOM.md")
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            logger.info(f"✅ Saved output to: {output_path}")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Error converting PDF: {str(e)}")
            return None
    
    def scan_and_process_all_pdfs(self) -> List[str]:
        """
        Scan the data folder for PDF files and process them all
        
        Returns:
            List of paths to generated files
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
            result = self.convert_pdf_to_custom(str(pdf_file))
            if result:
                results.append(result)
            logger.info(f"{'=' * 60}\n")
        
        return results


def main():
    """Main function to run the PDF processor"""
    print("\n" + "=" * 60)
    print("📚 PDF to Custom Prompt Processor")
    print("=" * 60 + "\n")
    
    try:
        # Initialize processor
        processor = PDFToCustomPromptProcessor(
            data_folder="data",
            api_base_url="http://localhost:8000",
            custom_prompt_file="custom_prompt.yaml"
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
        
        print("\n💡 Tips:")
        print("  - Edit custom_prompt.yaml to change the prompt")
        print("  - Check output/images/ folder for extracted images")
        print("\n" + "=" * 60 + "\n")
        
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
