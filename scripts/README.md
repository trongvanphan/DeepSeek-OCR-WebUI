# PDF Processing Scripts

This directory contains standalone Python scripts for batch processing PDFs using the DeepSeek OCR API.

## Available Scripts

### 1. pdf_to_markdown_processor.py
**Purpose:** Basic PDF to Markdown conversion

**Features:**
- Converts PDFs to structured Markdown format
- Uses standard markdown prompt
- Simple batch processing
- Outputs files with `-MD.md` suffix

**Usage:**
```bash
python pdf_to_markdown_processor.py
```

### 2. pdf_to_ocr_enhanced.py
**Purpose:** Plain text OCR extraction with image extraction

**Features:**
- Extracts raw text without markdown formatting
- Uses "Free OCR" mode
- Extracts and saves images from detected regions
- Outputs files with `-OCR.md` suffix

**Usage:**
```bash
python pdf_to_ocr_enhanced.py
```

### 3. pdf_to_custom_prompt.py
**Purpose:** PDF processing with custom prompts

**Features:**
- Uses custom prompt loaded from `custom_prompt.yaml`
- Full post-processing with image extraction
- Flexible prompt customization
- Outputs files with `-CUSTOM.md` suffix

**Usage:**
1. Edit `custom_prompt.yaml` in the project root
2. Run the script:
```bash
python pdf_to_custom_prompt.py
```

## Setup

### Prerequisites
1. **DeepSeek OCR API running:**
   ```bash
   python web_service_unified.py
   ```
   API should be accessible at `http://localhost:8000`

2. **PDF files in data folder:**
   ```bash
   mkdir -p data
   cp your_documents.pdf data/
   ```

3. **Python dependencies:**
   All dependencies are already installed for the main service.

## Output File Naming

Scripts use different suffixes to distinguish output types:

| Script | Output Suffix | Example |
|--------|---------------|---------|
| pdf_to_markdown_processor.py | `-MD.md` | `document-MD.md` |
| pdf_to_ocr_enhanced.py | `-OCR.md` | `document-OCR.md` |
| pdf_to_custom_prompt.py | `-CUSTOM.md` | `document-CUSTOM.md` |

## Comparing Different Methods

Process the same PDF with different methods to compare results:

```bash
# Place your PDF in data folder
cp test_document.pdf data/

# Run all processors
python scripts/pdf_to_markdown_processor.py
python scripts/pdf_to_ocr_enhanced.py
python scripts/pdf_to_custom_prompt.py

# Compare outputs
ls -lh data/test_document-*.md
```

## Image Extraction

Scripts with image extraction enabled will save detected regions to:
```
output/images/
├── document_page1_img1_Total.png
├── document_page1_img2_InvoiceNumber.png
└── document_page2_img1_Table.png
```

## Custom Prompts

Edit `custom_prompt.yaml` to customize OCR behavior:

```yaml
# Example custom prompts

# For tables
prompt: '<image>\n<|grounding|>Extract all tables and format as CSV.'

# For figures
prompt: '<image>\nParse the figure and describe all data points.'

# For forms
prompt: '<image>\n<|grounding|>Extract all form fields and their values.'

# For layouts
prompt: '<image>\n<|grounding|>OCR this image with precise layout preservation.'
```

## Logging

Each script creates its own log file:
- `pdf_processor.log` - Markdown processor logs
- `pdf_ocr_processor.log` - OCR processor logs
- `pdf_custom_processor.log` - Custom prompt processor logs

## Troubleshooting

### API Connection Failed
```bash
# Check if API is running
curl http://localhost:8000/health

# Start the API if not running
python web_service_unified.py
```

### No PDF Files Found
```bash
# Create data folder and add PDFs
mkdir -p data
cp /path/to/your/*.pdf data/
```

### Import Errors
```bash
# Install missing dependencies
pip install requests pyyaml
```

## Advanced Usage

### Custom API URL
Modify the script to use a different API endpoint:

```python
processor = PDFToMarkdownProcessor(
    data_folder="data",
    api_base_url="http://your-server:8000"
)
```

### Processing Specific Files
Modify the `scan_and_process_all_pdfs()` method to filter files:

```python
# Process only files matching pattern
pdf_files = list(self.data_folder.glob("invoice_*.pdf"))
```

### Batch Processing with Progress Bar
Add tqdm for progress tracking:

```python
from tqdm import tqdm

for pdf_file in tqdm(pdf_files, desc="Processing PDFs"):
    result = self.convert_pdf_to_markdown(str(pdf_file))
```

## Examples

### Process a Single PDF
```python
from scripts.pdf_to_markdown_processor import PDFToMarkdownProcessor

processor = PDFToMarkdownProcessor()
result = processor.convert_pdf_to_markdown("data/document.pdf")
print(f"Saved to: {result}")
```

### Batch Process Multiple Folders
```bash
# Process multiple folders
for folder in data/*/; do
    python scripts/pdf_to_markdown_processor.py --data-folder "$folder"
done
```

## Performance Tips

1. **API Response Time:** Depends on PDF complexity and page count
2. **Concurrent Processing:** Run multiple script instances for different folders
3. **Image Quality:** Higher DPI (default 144) = better accuracy but slower
4. **Large PDFs:** Consider splitting into smaller chunks

## Support

For issues or questions:
1. Check the log files for detailed error messages
2. Verify API is running with `/health` endpoint
3. Ensure PDF files are valid and not corrupted
4. Check available disk space for image extraction
