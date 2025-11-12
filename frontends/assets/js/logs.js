// ====================================
// Logging System
// ====================================

// Add Log Entry (with i18n internationalization)
function addLog(message, type = 'info', detail = '', extraData = null) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString(currentLang === 'en-US' ? 'en-US' : 'zh-CN', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
    });

    // Map Chinese messages to i18n keys
    const messageKeyMap = {
        '系统初始化': 'systemInit',
        '切换模式': 'modeSwitch',
        '切换识别模式': 'modeChanged',
        '文件上传失败': 'uploadFailed',
        '部分文件已忽略': 'filesIgnored',
        '开始上传图片': 'uploadStarted',
        '图片上传完成': 'uploadComplete',
        '图片加载失败': 'imageLoadFailed',
        'PDF 转换开始': 'pdfConversionStarted',
        'PDF 转换进度': 'pdfConverting',
        'PDF 转换完成': 'pdfConversionComplete',
        'PDF 转换失败': 'pdfConversionFailed',
        '开始拖动图片': 'dragStarted',
        '图片顺序已调整': 'orderChanged',
        '图片上传成功': 'imageUploaded',
        '清空图片': 'imagesCleared',
        '无法开始识别': 'cannotStart',
        '开始批量识别': 'batchRecognitionStarted',
        '识别图片': 'processingImage',
        '✓ 识别成功': 'recognitionSuccess',
        '✗ 识别失败': 'recognitionFailed',
        '批量识别完成': 'batchComplete',
        '开始查找定位': 'findStarted',
        '✓ 查找定位成功': 'findSuccess',
        '查找完成': 'findComplete',
        '✗ 查找失败': 'findFailed',
        '复制操作失败': 'copyFailed',
        '复制到剪贴板': 'copiedToClipboard',
        '下载操作失败': 'downloadFailed',
        '下载识别结果': 'downloaded',
        '清空队列': 'queueCleared',
        '文件格式不支持': 'formatNotSupported',
        'PDF 转换成功': 'pdfConverted',
        '重置 Find 模式': 'findModeReset',
        '开始查找': 'findStarted',
        '✓ 查找成功': 'findSuccess'
    };

    // Get translated message using i18n
    const messageKey = messageKeyMap[message];
    const translatedMessage = messageKey ? t(`logMessages.${messageKey}`) : message;

    // Get translated type label
    const typeLabel = t(`logTypes.${type}`) || type;

    let extraHtml = '';
    if (extraData) {
        const extraItems = Object.entries(extraData).map(([key, value]) => 
            `${key}: ${value}`
        ).join(' | ');
        extraHtml = `<div class="log-detail">${extraItems}</div>`;
    } else if (detail) {
        extraHtml = `<div class="log-detail">${detail}</div>`;
    }

    const logItem = document.createElement('div');
    logItem.className = `log-item ${type}`;
    logItem.innerHTML = `
        <div class="log-item-header">
            <span class="log-time">${timeStr}</span>
            <span class="log-type ${type}">${typeLabel}</span>
        </div>
        <div class="log-message">${translatedMessage}</div>
        ${extraHtml}
    `;

    elements.logContent.insertBefore(logItem, elements.logContent.firstChild);

    // Update log count
    const logCount = elements.logContent.querySelectorAll('.log-item').length;
    elements.logCount.textContent = logCount;

    // Limit logs to 100 entries
    const logs = elements.logContent.querySelectorAll('.log-item');
    if (logs.length > 100) {
        logs[logs.length - 1].remove();
    }

    // Auto scroll to top to show latest log
    elements.logContent.scrollTop = 0;
}
