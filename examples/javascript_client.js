/**
 * DeepSeek OCR JavaScript Client
 * 
 * A JavaScript/Node.js client library for integrating with the DeepSeek OCR API.
 * Provides easy-to-use methods for processing images and PDFs.
 * 
 * Usage (Node.js):
 *   const DeepSeekOCR = require('./javascript_client');
 *   const client = new DeepSeekOCR('http://localhost:8000');
 *   
 *   // Process an image
 *   const result = await client.processImage('document.jpg');
 *   console.log(result.result);
 * 
 * Usage (Browser):
 *   <script src="javascript_client.js"></script>
 *   <script>
 *     const client = new DeepSeekOCR('http://localhost:8000');
 *     document.getElementById('fileInput').addEventListener('change', async (e) => {
 *       const file = e.target.files[0];
 *       const result = await client.processImageFile(file);
 *       console.log(result.result);
 *     });
 *   </script>
 */

class DeepSeekOCR {
    /**
     * Initialize the OCR client
     * @param {string} baseUrl - Base URL of the DeepSeek OCR API
     * @param {number} timeout - Request timeout in milliseconds (default: 300000)
     */
    constructor(baseUrl = 'http://localhost:8000', timeout = 300000) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.timeout = timeout;
    }

    /**
     * Check API health status
     * @returns {Promise<Object>} Health status information
     */
    async healthCheck() {
        const response = await fetch(`${this.baseUrl}/health`);
        if (!response.ok) {
            throw new Error(`Health check failed: ${response.statusText}`);
        }
        return await response.json();
    }

    /**
     * Process a single image file (File object or path)
     * @param {File|string} imageFileOrPath - File object (browser) or path (Node.js)
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} OCR results
     */
    async processImage(imageFileOrPath, options = {}) {
        const {
            prompt = null,
            promptType = 'document',
            baseSize = 1024,
            imageSize = 640,
            cropMode = true
        } = options;

        const formData = new FormData();
        
        // Handle File object (browser) or path (Node.js)
        if (typeof imageFileOrPath === 'string') {
            // Node.js: Read file from path
            if (typeof require !== 'undefined') {
                const fs = require('fs');
                const path = require('path');
                const fileBuffer = fs.readFileSync(imageFileOrPath);
                const fileName = path.basename(imageFileOrPath);
                
                // Create Blob from buffer (Node.js)
                const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
                formData.append('file', blob, fileName);
            } else {
                throw new Error('File path processing only supported in Node.js');
            }
        } else {
            // Browser: Use File object directly
            formData.append('file', imageFileOrPath);
        }

        // Add parameters
        formData.append('prompt_type', promptType);
        formData.append('base_size', baseSize.toString());
        formData.append('image_size', imageSize.toString());
        formData.append('crop_mode', cropMode.toString());

        if (prompt) {
            formData.append('prompt', prompt);
        }

        const response = await fetch(`${this.baseUrl}/ocr/image`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`OCR request failed: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Process a PDF file
     * @param {File|string} pdfFileOrPath - File object (browser) or path (Node.js)
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} Batch OCR results
     */
    async processPDF(pdfFileOrPath, options = {}) {
        const {
            prompt = null,
            promptType = 'document',
            baseSize = 1024,
            imageSize = 640,
            cropMode = true,
            extractImages = true
        } = options;

        const formData = new FormData();
        
        // Handle File object (browser) or path (Node.js)
        if (typeof pdfFileOrPath === 'string') {
            if (typeof require !== 'undefined') {
                const fs = require('fs');
                const path = require('path');
                const fileBuffer = fs.readFileSync(pdfFileOrPath);
                const fileName = path.basename(pdfFileOrPath);
                
                const blob = new Blob([fileBuffer], { type: 'application/pdf' });
                formData.append('file', blob, fileName);
            } else {
                throw new Error('File path processing only supported in Node.js');
            }
        } else {
            formData.append('file', pdfFileOrPath);
        }

        // Add parameters
        formData.append('prompt_type', promptType);
        formData.append('base_size', baseSize.toString());
        formData.append('image_size', imageSize.toString());
        formData.append('crop_mode', cropMode.toString());
        formData.append('extract_images', extractImages.toString());

        if (prompt) {
            formData.append('prompt', prompt);
        }

        const response = await fetch(`${this.baseUrl}/ocr/pdf`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`PDF processing failed: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Process an image with a custom prompt
     * @param {File|string} imageFileOrPath - Image file or path
     * @param {string} customPrompt - Custom prompt string
     * @returns {Promise<Object>} OCR results
     */
    async processImageWithCustomPrompt(imageFileOrPath, customPrompt) {
        return await this.processImage(imageFileOrPath, { prompt: customPrompt });
    }

    /**
     * Extract plain text from a PDF (convenience method)
     * @param {File|string} pdfFileOrPath - PDF file or path
     * @returns {Promise<string>} Combined text from all pages
     */
    async extractTextFromPDF(pdfFileOrPath) {
        const result = await this.processPDF(pdfFileOrPath, { promptType: 'free' });
        
        if (!result.success) {
            throw new Error(`PDF processing failed: ${result.error}`);
        }

        // Combine all page results
        const textParts = result.results
            .filter(page => page.success && page.result)
            .map(page => page.result);

        return textParts.join('\n\n<--- Page Split --->\n\n');
    }

    /**
     * Convert a PDF to Markdown format (convenience method)
     * @param {File|string} pdfFileOrPath - PDF file or path
     * @returns {Promise<string>} Markdown content
     */
    async convertPDFToMarkdown(pdfFileOrPath) {
        const result = await this.processPDF(pdfFileOrPath, { promptType: 'document' });
        
        if (!result.success) {
            throw new Error(`PDF processing failed: ${result.error}`);
        }

        // Combine all page results
        const markdownParts = result.results
            .filter(page => page.success && page.result)
            .map(page => page.result);

        return markdownParts.join('\n\n<--- Page Split --->\n\n');
    }
}

// ==============================================================================
// Example Usage for Browser
// ==============================================================================

/**
 * Example HTML for browser usage:
 * 
 * <!DOCTYPE html>
 * <html>
 * <head>
 *     <title>DeepSeek OCR Client</title>
 * </head>
 * <body>
 *     <h1>DeepSeek OCR Demo</h1>
 *     
 *     <h2>Image Upload</h2>
 *     <input type="file" id="imageInput" accept="image/*">
 *     <div id="imageResult"></div>
 *     
 *     <h2>PDF Upload</h2>
 *     <input type="file" id="pdfInput" accept=".pdf">
 *     <div id="pdfResult"></div>
 *     
 *     <script src="javascript_client.js"></script>
 *     <script>
 *         const client = new DeepSeekOCR('http://localhost:8000');
 *         
 *         // Image processing
 *         document.getElementById('imageInput').addEventListener('change', async (e) => {
 *             const file = e.target.files[0];
 *             if (!file) return;
 *             
 *             try {
 *                 document.getElementById('imageResult').innerHTML = 'Processing...';
 *                 const result = await client.processImage(file);
 *                 document.getElementById('imageResult').innerHTML = `<pre>${result.result}</pre>`;
 *             } catch (error) {
 *                 document.getElementById('imageResult').innerHTML = `Error: ${error.message}`;
 *             }
 *         });
 *         
 *         // PDF processing
 *         document.getElementById('pdfInput').addEventListener('change', async (e) => {
 *             const file = e.target.files[0];
 *             if (!file) return;
 *             
 *             try {
 *                 document.getElementById('pdfResult').innerHTML = 'Processing...';
 *                 const result = await client.processPDF(file);
 *                 
 *                 let output = `<h3>Total Pages: ${result.total_pages}</h3>`;
 *                 output += `<h3>Images Extracted: ${result.total_images_extracted}</h3>`;
 *                 
 *                 result.results.forEach(page => {
 *                     output += `<h4>Page ${page.page_number}</h4>`;
 *                     output += `<pre>${page.result}</pre>`;
 *                 });
 *                 
 *                 document.getElementById('pdfResult').innerHTML = output;
 *             } catch (error) {
 *                 document.getElementById('pdfResult').innerHTML = `Error: ${error.message}`;
 *             }
 *         });
 *     </script>
 * </body>
 * </html>
 */

// ==============================================================================
// Example Usage for Node.js
// ==============================================================================

/**
 * Example Node.js usage:
 * 
 * const DeepSeekOCR = require('./javascript_client');
 * 
 * async function main() {
 *     const client = new DeepSeekOCR('http://localhost:8000');
 *     
 *     // Check API health
 *     const health = await client.healthCheck();
 *     console.log('API Status:', health.status);
 *     console.log('Backend:', health.backend);
 *     
 *     // Process an image
 *     const imageResult = await client.processImage('path/to/image.jpg');
 *     console.log('OCR Result:', imageResult.result);
 *     
 *     // Process a PDF
 *     const pdfResult = await client.processPDF('path/to/document.pdf');
 *     console.log('Total Pages:', pdfResult.total_pages);
 *     console.log('Images Extracted:', pdfResult.total_images_extracted);
 *     
 *     for (const page of pdfResult.results) {
 *         console.log(`Page ${page.page_number}:`, page.result.substring(0, 100) + '...');
 *     }
 *     
 *     // Use custom prompt
 *     const customResult = await client.processImageWithCustomPrompt(
 *         'table.jpg',
 *         '<image>\n<|grounding|>Extract all tables and format as CSV.'
 *     );
 *     console.log('Table Data:', customResult.result);
 * }
 * 
 * main().catch(console.error);
 */

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeepSeekOCR;
}
