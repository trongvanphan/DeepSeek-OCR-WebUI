# Client Integration Examples

This directory contains example client implementations for integrating with the DeepSeek OCR API in different programming languages.

## Available Clients

### 1. Python Client (`python_client.py`)

**Features:**
- Full-featured Python client library
- Type hints and documentation
- Convenience methods for common tasks
- Error handling examples

**Usage:**

```python
from examples.python_client import DeepSeekOCRClient

# Initialize client
client = DeepSeekOCRClient(base_url="http://localhost:8000")

# Check API health
health = client.health_check()
print(f"Status: {health['status']}, Backend: {health['backend']}")

# Process an image
result = client.process_image("document.jpg")
print(result["result"])

# Process a PDF
pdf_result = client.process_pdf("document.pdf")
for page in pdf_result["results"]:
    print(f"Page {page['page_number']}: {page['result'][:100]}...")

# Use custom prompt
custom_result = client.process_image_with_custom_prompt(
    "table.jpg",
    "<image>\n<|grounding|>Extract all tables and format as CSV."
)
print(custom_result["result"])

# Convenience methods
text = client.extract_text_from_pdf("document.pdf")
markdown = client.convert_pdf_to_markdown("document.pdf")
```

### 2. JavaScript Client (`javascript_client.js`)

**Features:**
- Works in both Browser and Node.js
- FormData API for file uploads
- Async/await support
- Promise-based interface

**Browser Usage:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>DeepSeek OCR Demo</title>
</head>
<body>
    <input type="file" id="fileInput" accept="image/*,.pdf">
    <div id="result"></div>
    
    <script src="examples/javascript_client.js"></script>
    <script>
        const client = new DeepSeekOCR('http://localhost:8000');
        
        document.getElementById('fileInput').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            try {
                const result = await client.processImage(file);
                document.getElementById('result').innerHTML = `<pre>${result.result}</pre>`;
            } catch (error) {
                console.error('Error:', error);
            }
        });
    </script>
</body>
</html>
```

**Node.js Usage:**

```javascript
const DeepSeekOCR = require('./examples/javascript_client');

async function main() {
    const client = new DeepSeekOCR('http://localhost:8000');
    
    // Process an image
    const result = await client.processImage('document.jpg');
    console.log(result.result);
    
    // Process a PDF
    const pdfResult = await client.processPDF('document.pdf');
    console.log('Pages:', pdfResult.total_pages);
    
    // Extract plain text
    const text = await client.extractTextFromPDF('document.pdf');
    console.log(text);
}

main().catch(console.error);
```

## API Methods

### Common Methods (Both Clients)

#### `healthCheck()`
Check API health status

**Returns:**
```json
{
    "status": "healthy",
    "backend": "mps",
    "platform": "Darwin",
    "machine": "arm64",
    "model_loaded": true
}
```

#### `processImage(imagePathOrFile, options)`
Process a single image

**Options:**
- `prompt` (str): Custom prompt (optional)
- `promptType` (str): Mode - "document", "ocr", "free", "figure", "describe", "find"
- `baseSize` (int): Base resolution (512-2048, default: 1024)
- `imageSize` (int): Patch size (224-1024, default: 640)
- `cropMode` (bool): Enable cropping (default: true)

**Returns:**
```json
{
    "success": true,
    "result": "OCR text content...",
    "page_count": 1,
    "mode": "document",
    "prompt_used": "<image>\n<|grounding|>Convert the document to markdown."
}
```

#### `processPDF(pdfPathOrFile, options)`
Process a PDF file

**Options:**
- `prompt` (str): Custom prompt (optional)
- `promptType` (str): OCR mode
- `baseSize` (int): Base resolution
- `imageSize` (int): Patch size
- `cropMode` (bool): Enable cropping
- `extractImages` (bool): Extract detected images (default: true)

**Returns:**
```json
{
    "success": true,
    "results": [
        {
            "success": true,
            "result": "Page 1 content...",
            "page_number": 1,
            "images_extracted": 3,
            "references": [...]
        }
    ],
    "total_pages": 5,
    "filename": "document.pdf",
    "mode": "document",
    "prompt_used": "...",
    "total_images_extracted": 8
}
```

### Convenience Methods

#### `processImageWithCustomPrompt(image, prompt)`
Process with custom prompt (shortcut method)

#### `extractTextFromPDF(pdf)`
Extract plain text from PDF

#### `convertPDFToMarkdown(pdf)`
Convert PDF to Markdown format

## Error Handling

### Python

```python
from examples.python_client import DeepSeekOCRClient
import requests

client = DeepSeekOCRClient()

try:
    result = client.process_image("document.jpg")
    print(result["result"])
except FileNotFoundError as e:
    print(f"File not found: {e}")
except requests.exceptions.RequestException as e:
    print(f"API request failed: {e}")
except Exception as e:
    print(f"Error: {e}")
```

### JavaScript

```javascript
const client = new DeepSeekOCR('http://localhost:8000');

try {
    const result = await client.processImage('document.jpg');
    console.log(result.result);
} catch (error) {
    console.error('Error:', error.message);
}
```

## Advanced Examples

### Batch Processing with Python

```python
from pathlib import Path
from examples.python_client import DeepSeekOCRClient

client = DeepSeekOCRClient()

# Process all images in a directory
image_dir = Path("images")
for image_path in image_dir.glob("*.jpg"):
    try:
        result = client.process_image(str(image_path))
        output_path = image_path.with_suffix('.txt')
        output_path.write_text(result["result"])
        print(f"✓ Processed: {image_path.name}")
    except Exception as e:
        print(f"✗ Failed: {image_path.name} - {e}")
```

### Custom Prompts for Specific Tasks

```python
# Extract tables
table_prompt = "<image>\n<|grounding|>Extract all tables and format as CSV."
result = client.process_image("table.jpg", prompt=table_prompt)

# Extract form fields
form_prompt = "<image>\n<|grounding|>Extract all form fields and their values."
result = client.process_image("form.jpg", prompt=form_prompt)

# Describe charts
chart_prompt = "<image>\nParse the figure and describe all data points."
result = client.process_image("chart.jpg", prompt=chart_prompt)
```

### Progress Tracking for PDFs

```python
from tqdm import tqdm

# Process PDF with progress bar
pdf_result = client.process_pdf("large_document.pdf")
total_pages = pdf_result["total_pages"]

print(f"Processing {total_pages} pages...")
for page in tqdm(pdf_result["results"], desc="Extracting text"):
    if page["success"]:
        # Save or process each page
        pass
```

## Integration Patterns

### REST API Integration

Both clients use the DeepSeek OCR REST API endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Check API status |
| `/ocr/image` | POST | Process single image |
| `/ocr/pdf` | POST | Process PDF with batch results |

### Webhook Integration

Example webhook handler for async processing:

```python
from flask import Flask, request, jsonify
from examples.python_client import DeepSeekOCRClient

app = Flask(__name__)
client = DeepSeekOCRClient()

@app.route('/webhook/ocr', methods=['POST'])
def ocr_webhook():
    file = request.files['file']
    result = client.process_image(file)
    return jsonify(result)
```

### Queue-Based Processing

Example with Celery:

```python
from celery import Celery
from examples.python_client import DeepSeekOCRClient

app = Celery('ocr_tasks')
client = DeepSeekOCRClient()

@app.task
def process_document_async(file_path):
    result = client.process_pdf(file_path)
    return result
```

## Testing

### Python Unit Tests

```python
import unittest
from examples.python_client import DeepSeekOCRClient

class TestOCRClient(unittest.TestCase):
    def setUp(self):
        self.client = DeepSeekOCRClient()
    
    def test_health_check(self):
        health = self.client.health_check()
        self.assertEqual(health["status"], "healthy")
    
    def test_process_image(self):
        result = self.client.process_image("test_image.jpg")
        self.assertTrue(result["success"])
        self.assertIn("result", result)
```

### JavaScript Tests (Jest)

```javascript
const DeepSeekOCR = require('./javascript_client');

describe('DeepSeekOCR Client', () => {
    let client;
    
    beforeEach(() => {
        client = new DeepSeekOCR('http://localhost:8000');
    });
    
    test('health check returns status', async () => {
        const health = await client.healthCheck();
        expect(health.status).toBe('healthy');
    });
    
    test('process image returns result', async () => {
        const result = await client.processImage('test_image.jpg');
        expect(result.success).toBe(true);
        expect(result.result).toBeDefined();
    });
});
```

## Performance Tips

1. **Reuse client instances** - Create one client and reuse it
2. **Adjust timeout** for large files - Increase timeout for complex PDFs
3. **Batch processing** - Process multiple files concurrently
4. **Optimize image size** - Adjust `baseSize` and `imageSize` parameters
5. **Enable caching** - Cache results for repeated requests

## Troubleshooting

### Connection Errors
```bash
# Check if API is running
curl http://localhost:8000/health
```

### Import Errors (Python)
```bash
# Ensure requests is installed
pip install requests
```

### CORS Issues (Browser)
Add CORS headers or run API with appropriate CORS settings.

### File Size Limits
Large files may require increased timeout values.

## Support

For more examples and documentation:
- Check the main README.md
- View API docs at http://localhost:8000/docs
- See scripts/ directory for batch processing examples
