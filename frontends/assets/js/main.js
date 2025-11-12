// ====================================
// Main.js - Application Initialization
// ====================================

// Initialize i18n
const t = window.i18n.t;
const switchLanguage = window.i18n.switchLanguage;
const updateUILanguage = window.i18n.updateUILanguage;
const initI18n = window.i18n.initI18n;
let currentLang = window.i18n.getCurrentLang();

// Main initialization function
function init() {
    // Inject HTML templates
    injectHTML();
    
    // Initialize all modules
    setupModeSelector();
    setupUploadHandlers();
    setupButtons();
    setupAdvancedSettings();
    setupViewToggle();
    
    // Show logs section
    if (elements.logSection) {
        elements.logSection.classList.add('active');
    }
    
    // Add initial log
    addLog('System Init', 'info', '🚀 DeepSeek OCR system ready!', {
        'Version': 'v3.3.3',
        'Service': getServiceAddress(),
        'Formats': 'Images: JPG, PNG, JPEG, BMP, GIF, WEBP | PDF',
        'Modes': '7 recognition modes available'
    });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        init();
        initI18n();
        updateUILanguage();
    });
} else {
    init();
    initI18n();
    updateUILanguage();
}
