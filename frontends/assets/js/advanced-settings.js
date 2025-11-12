// ====================================
// Advanced Settings Management
// ====================================

// Load settings from localStorage
function loadAdvancedSettings() {
    const saved = localStorage.getItem('deepseek_ocr_advanced_settings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(advancedSettings, parsed);
        } catch (e) {
            console.error('Failed to load advanced settings:', e);
        }
    }
    updateAdvancedUI();
}

// Save settings to localStorage
function saveAdvancedSettings() {
    localStorage.setItem('deepseek_ocr_advanced_settings', JSON.stringify(advancedSettings));
}

// Update UI with current settings
function updateAdvancedUI() {
    document.getElementById('baseSize').value = advancedSettings.baseSize;
    document.getElementById('baseSizeValue').textContent = advancedSettings.baseSize;
    document.getElementById('imageSize').value = advancedSettings.imageSize;
    document.getElementById('imageSizeValue').textContent = advancedSettings.imageSize;
    document.getElementById('cropMode').checked = advancedSettings.cropMode;
    document.getElementById('includeCaption').checked = advancedSettings.includeCaption;
    updateSliderBackground('baseSize');
    updateSliderBackground('imageSize');
}

// Update slider background gradient
function updateSliderBackground(sliderId) {
    const slider = document.getElementById(sliderId);
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const val = parseFloat(slider.value);
    const percentage = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, var(--border) ${percentage}%, var(--border) 100%)`;
}

// Setup Advanced Settings
function setupAdvancedSettings() {
    const header = document.getElementById('advancedHeader');
    const content = document.getElementById('advancedContent');
    const toggle = header.querySelector('.advanced-toggle');
    const baseSize = document.getElementById('baseSize');
    const imageSize = document.getElementById('imageSize');
    const cropMode = document.getElementById('cropMode');
    const includeCaption = document.getElementById('includeCaption');
    const resetBtn = document.getElementById('resetAdvanced');

    // Toggle panel
    header.addEventListener('click', () => {
        content.classList.toggle('active');
        toggle.classList.toggle('active');
    });

    // Base Size slider
    baseSize.addEventListener('input', (e) => {
        advancedSettings.baseSize = parseInt(e.target.value);
        document.getElementById('baseSizeValue').textContent = advancedSettings.baseSize;
        updateSliderBackground('baseSize');
        saveAdvancedSettings();
    });

    // Image Size slider
    imageSize.addEventListener('input', (e) => {
        advancedSettings.imageSize = parseInt(e.target.value);
        document.getElementById('imageSizeValue').textContent = advancedSettings.imageSize;
        updateSliderBackground('imageSize');
        saveAdvancedSettings();
    });

    // Crop Mode checkbox
    cropMode.addEventListener('change', (e) => {
        advancedSettings.cropMode = e.target.checked;
        saveAdvancedSettings();
    });

    // Include Caption checkbox
    includeCaption.addEventListener('change', (e) => {
        advancedSettings.includeCaption = e.target.checked;
        saveAdvancedSettings();
    });

    // Reset button
    resetBtn.addEventListener('click', () => {
        advancedSettings.baseSize = 1024;
        advancedSettings.imageSize = 640;
        advancedSettings.cropMode = true;
        advancedSettings.includeCaption = false;
        updateAdvancedUI();
        saveAdvancedSettings();
        showToast(t('toast.clearSuccess') + ' - ' + t('advancedSettings.reset'), 'success');
    });

    // Load saved settings
    loadAdvancedSettings();
}

// Get advanced settings as FormData additions
function appendAdvancedSettings(formData) {
    formData.append('base_size', advancedSettings.baseSize);
    formData.append('image_size', advancedSettings.imageSize);
    formData.append('crop_mode', advancedSettings.cropMode);
    formData.append('include_caption', advancedSettings.includeCaption);
}
