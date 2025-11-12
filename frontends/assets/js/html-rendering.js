// ====================================
// HTML Detection and Rendering
// ====================================

function detectHTML(text) {
    // Check for HTML tags (especially tables which DeepSeek-OCR outputs)
    return /<\s*(table|html|div|p|span|h[1-6]|ul|ol|li)\s*[^>]*>/i.test(text);
}

function sanitizeHTML(html) {
    // Basic XSS prevention - remove script and dangerous tags
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remove script tags
    const scripts = temp.querySelectorAll('script, iframe, object, embed');
    scripts.forEach(el => el.remove());
    
    // Remove dangerous attributes
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(el => {
        Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('on')) {
                el.removeAttribute(attr.name);
            }
        });
    });
    
    return temp.innerHTML;
}

function displayResult(text, rawText = '') {
    currentResultData.text = text;
    currentResultData.rawText = rawText || text;
    currentResultData.hasHTML = detectHTML(text);
    
    const viewToggle = document.getElementById('viewToggle');
    const resultText = document.getElementById('resultText');
    
    // Show view toggle only if HTML detected
    if (currentResultData.hasHTML) {
        viewToggle.style.display = 'flex';
    } else {
        viewToggle.style.display = 'none';
    }
    
    // Display based on current view
    updateResultView();
}

function updateResultView() {
    const resultText = document.getElementById('resultText');
    const text = currentResultData.text;
    const rawText = currentResultData.rawText;
    
    switch (currentView) {
        case 'formatted':
            // Clean text without HTML
            resultText.className = 'result-text';
            resultText.textContent = text;
            break;
            
        case 'raw':
            // Show raw text with all markers
            resultText.className = 'result-text';
            resultText.textContent = rawText;
            break;
            
        case 'html':
            // Render HTML (if present)
            resultText.className = 'result-text result-html';
            if (currentResultData.hasHTML) {
                resultText.innerHTML = sanitizeHTML(text);
            } else {
                resultText.textContent = text;
            }
            break;
    }
}

function setupViewToggle() {
    const viewToggle = document.getElementById('viewToggle');
    const buttons = viewToggle.querySelectorAll('.view-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            currentView = view;
            
            // Update active state
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update display
            updateResultView();
        });
    });
}
