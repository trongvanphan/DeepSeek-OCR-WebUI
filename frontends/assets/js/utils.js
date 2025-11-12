// ====================================
// Utility Functions
// ====================================

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getStatusText(status) {
    const texts = {
        pending: '等待中',
        processing: '⚙️ 识别中...',
        completed: '✅ 已完成',
        error: '❌ 失败'
    };
    return texts[status] || status;
}

function getModeDisplayName(mode) {
    const names = {
        'document': '文档转Markdown',
        'ocr': '通用OCR',
        'free': '纯文本提取',
        'figure': '图表解析',
        'describe': '图像描述',
        'find': '查找定位 (Find)',
        'freeform': '自定义 (Freeform)'
    };
    return names[mode] || mode;
}

function getModeDescription(mode) {
    const descriptions = {
        'document': '保留文档格式和布局',
        'ocr': '提取所有可见文字',
        'free': '纯文本不保留格式',
        'figure': '识别图表公式等',
        'describe': '生成详细图像描述',
        'find': '查找并定位特定内容',
        'freeform': '使用自定义提示词'
    };
    return descriptions[mode] || '未知';
}

function getServiceAddress() {
    // Prefer current page address
    const host = window.location.host;
    const protocol = window.location.protocol;
    if (host && host !== '') {
        return `${protocol}//${host}`;
    }
    // Fallback to config
    return CONFIG.apiUrl || 'http://localhost:8001';
}
