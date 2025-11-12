// ====================================
// Parameter Validation
// ====================================

function validateAdvancedSettings() {
    const errors = [];
    
    if (advancedSettings.baseSize < 512 || advancedSettings.baseSize > 2048) {
        errors.push(`Base Size must be between 512 and 2048 (current: ${advancedSettings.baseSize})`);
    }
    
    if (advancedSettings.imageSize < 224 || advancedSettings.imageSize > 1280) {
        errors.push(`Image Size must be between 224 and 1280 (current: ${advancedSettings.imageSize})`);
    }
    
    if (errors.length > 0) {
        showToast(`Validation Error: ${errors.join(', ')}`, 'error');
        return false;
    }
    
    return true;
}
