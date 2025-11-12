// ====================================
// Toast Notification
// ====================================

function showToast(message, type = 'info') {
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };

    elements.toastIcon.textContent = icons[type] || icons.info;
    elements.toastMessage.textContent = message;
    elements.toast.className = `toast ${type} active`;

    setTimeout(() => {
        elements.toast.classList.remove('active');
    }, 3000);
}
