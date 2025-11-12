// DeepSeek OCR main JavaScript
// Extracted from ocr_ui_refactored.html
// ...existing code from <script>...</script> in ocr_ui_refactored.html...// DeepSeek OCR main JavaScript
// Extracted from ocr_ui_refactored.html

// ====================================
// App.js - Main Application Logic
// This file contains remaining functionality not in modules
// Depends on: config.js, state.js, utils.js, dom.js, toast.js, validation.js,
//             advanced-settings.js, html-rendering.js, logs.js, mode-selector.js, templates.js
// ====================================

// Use window.i18n from external i18n.js
const t = window.i18n.t;
const switchLanguage = window.i18n.switchLanguage;
const updateUILanguage = window.i18n.updateUILanguage;
const initI18n = window.i18n.initI18n;
let currentLang = window.i18n.getCurrentLang();

// Custom UI language updater that extends the base i18n functionality
const originalUpdateUILanguage = updateUILanguage;
function customUpdateUILanguage() {
    currentLang = window.i18n.getCurrentLang();
    originalUpdateUILanguage();
}

// Note: advancedSettings, loadAdvancedSettings, saveAdvancedSettings, updateAdvancedUI,
// updateSliderBackground, setupAdvancedSettings, appendAdvancedSettings, validateAdvancedSettings
// are defined in advanced-settings.js

// Note: detectHTML, sanitizeHTML, displayResult, updateResultView, setupViewToggle
// are defined in html-rendering.js

// Upload Setup
function setupUpload() {
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

        // Parameter Validation
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

        // HTML Detection and Rendering
        let currentView = 'formatted';
        let currentResultData = { text: '', rawText: '', hasHTML: false };

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

        // Initialize
        function init() {
            setupModeSelector();
            setupUpload();
            setupButtons();
            setupDragAndDrop();
            setupAdvancedSettings();
            setupViewToggle();
            
            // 显示日志区域
            elements.logSection.classList.add('active');
            
            // 初始化日志 - 获取实际服务地址
            const getServiceAddress = () => {
                // 优先使用当前页面的地址
                const host = window.location.host;
                const protocol = window.location.protocol;
                if (host && host !== '') {
                    return `${protocol}//${host}`;
                }
                // 如果无法获取，使用配置文件中的地址
                return CONFIG.apiUrl || 'http://localhost:8001';
            };
            
            addLog('System Init', 'info', '🚀 DeepSeek OCR system ready!', {
                'Version': 'v3.3.3',
                'Service': getServiceAddress(),
                'Formats': 'Images: JPG, PNG, JPEG, BMP, GIF, WEBP | PDF',
                'Modes': '7 recognition modes available'
            });
        }

        // Add Log Entry (使用 i18n 国际化)
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

            // 更新日志计数
            const logCount = elements.logContent.querySelectorAll('.log-item').length;
            elements.logCount.textContent = logCount;

            // 限制日志数量，最多保留100条
            const logs = elements.logContent.querySelectorAll('.log-item');
            if (logs.length > 100) {
                logs[logs.length - 1].remove();
            }

            // 自动滚动到顶部显示最新日志
            elements.logContent.scrollTop = 0;
        }

        // Mode Selector
        function setupModeSelector() {
            document.querySelectorAll('.mode-option').forEach(option => {
                option.addEventListener('click', () => {
                    const oldMode = state.mode;
                    const newMode = option.dataset.mode;
                    
                    // 如果模式相同，不做任何操作
                    if (oldMode === newMode) return;
                    
                    document.querySelectorAll('.mode-option').forEach(o => o.classList.remove('active'));
                    option.classList.add('active');
                    state.mode = newMode;
                    const modeName = option.querySelector('.mode-name').textContent;
                    
                    // Find 模式切换到专用界面
                    const isFindMode = (newMode === 'find');
                    const findContainer = document.getElementById('findModeContainer');
                    const batchContainer = document.getElementById('batchModeContainer');
                    
                    if (isFindMode) {
                        // 切换到 Find 专用界面
                        findContainer.classList.add('active');
                        batchContainer.classList.add('hidden');
                        addLog('Mode Switch', 'info', 'Switched to Find & Locate mode (single image)', {
                            'Mode': '🔍 Find Mode',
                            'Layout': 'Split view',
                            '特性': '边界框可视化'
                        });
                    } else {
                        // 切换回批量处理界面
                        findContainer.classList.remove('active');
                        batchContainer.classList.remove('hidden');
                        
                        // 显示/隐藏 Freeform 批量模式的输入框
                        const freeformInputBatch = document.getElementById('freeformInputBatch');
                        if (freeformInputBatch) {
                            freeformInputBatch.style.display = (newMode === 'freeform') ? 'block' : 'none';
                        }
                        
                        addLog('Mode Switch', 'info', `Switched to ${modeName} mode (batch processing)`, {
                            'Mode': modeName,
                            'Type': 'Batch processing'
                        });
                    }
                    
                    // 检查是否已经完成识别
                    const hasCompletedImages = state.images.some(img => img.status === 'completed' || img.status === 'error');
                    
                    if (hasCompletedImages) {
                        // 重置所有图片状态为待处理
                        const completedCount = state.images.filter(img => img.status === 'completed').length;
                        const errorCount = state.images.filter(img => img.status === 'error').length;
                        
                        state.images.forEach(img => {
                            img.status = 'pending';
                            img.result = null;
                        });
                        
                        // 清空之前的识别结果
                        state.results = [];
                        
                        // 隐藏进度和结果区域
                        elements.progressSection.classList.remove('active');
                        elements.resultSection.classList.remove('active');
                        
                        // 重新渲染图片（清除状态标签）
                        renderImages();
                        
                        // 更新UI状态（使按钮可点击）
                        updateUI();
                        
                        showToast(`已切换到: ${modeName}，可以重新识别`, 'info');
                        addLog('Mode Changed', 'success', `Switched from [${getModeDisplayName(oldMode)}] to [${modeName}], state reset`, {
                            'New Mode': modeName,
                            'Use Case': getModeDescription(state.mode),
                            '图片数量': `${state.images.length} 张`,
                            '已重置': `${completedCount} 张已完成，${errorCount} 张失败`,
                            '当前状态': '准备重新识别'
                        });
                    } else {
                        showToast(`已切换到: ${modeName}`, 'info');
                        addLog('Mode Changed', 'info', `从 [${getModeDisplayName(oldMode)}] 切换到 [${modeName}]`, {
                            'Current Mode': modeName,
                            'Use Case': getModeDescription(state.mode)
                        });
                    }
                });
            });
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

        // Upload Setup
        function setupUpload() {
            elements.uploadArea.addEventListener('click', () => {
                elements.fileInput.click();
            });

            elements.fileInput.addEventListener('change', (e) => {
                handleFiles(Array.from(e.target.files));
                e.target.value = '';
            });

            // Drag and drop
            elements.uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                elements.uploadArea.classList.add('dragover');
            });

            elements.uploadArea.addEventListener('dragleave', () => {
                elements.uploadArea.classList.remove('dragover');
            });

            elements.uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                elements.uploadArea.classList.remove('dragover');
                handleFiles(Array.from(e.dataTransfer.files));
            });
        }

        // Handle Files
        async function handleFiles(files) {
            const totalFiles = files.length;
            const imageFiles = [];
            const pdfFiles = [];
            const invalidFiles = [];
            
            // 分类文件
            files.forEach(file => {
                const fileType = file.type.toLowerCase();
                const fileName = file.name.toLowerCase();
                
                if (fileType.startsWith('image/') || 
                    fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
                    imageFiles.push(file);
                } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
                    pdfFiles.push(file);
                } else {
                    invalidFiles.push(file);
                }
            });
            
            // 检查是否有有效文件
            if (imageFiles.length === 0 && pdfFiles.length === 0) {
                const formats = invalidFiles.map(f => f.name.split('.').pop() || '未知').join(', ');
                showToast('请选择有效的图片或 PDF 文件', 'error');
                addLog('Upload Failed', 'error', 'All file formats not supported', {
                    'Attempted': `${totalFiles} 个文件`,
                    'Invalid Formats': formats,
                    'Supported': '图片: JPG, PNG, JPEG, BMP, GIF, WEBP\nPDF: PDF'
                });
                return;
            }
            
            // 处理无效文件提示
            if (invalidFiles.length > 0) {
                const invalidNames = invalidFiles.map(f => f.name).join(', ');
                showToast(`已忽略 ${invalidFiles.length} 个不支持的文件`, 'warning');
                addLog('Files Ignored', 'warning', `不支持的文件: ${invalidNames}`, {
                    'Ignored': `${invalidFiles.length} 个`,
                    'Supported': '图片或 PDF'
                });
            }
            
            // 处理图片文件
            if (imageFiles.length > 0) {
                const totalSize = imageFiles.reduce((sum, f) => sum + f.size, 0);
                addLog('开始上传图片', 'info', `正在处理 ${imageFiles.length} 张图片...`, {
                    '有效文件': `${imageFiles.length} 张`,
                    '总大小': formatFileSize(totalSize)
                });

                let loadedCount = 0;
                imageFiles.forEach((file, index) => {
                    const id = Date.now() + Math.random();
                    const reader = new FileReader();
                    
                    reader.onload = (e) => {
                        state.images.push({
                            id,
                            file,
                            name: file.name,
                            size: formatFileSize(file.size),
                            preview: e.target.result,
                            status: 'pending',
                            result: null
                        });
                        renderImages();
                        updateUI();
                        
                        loadedCount++;
                        if (loadedCount === imageFiles.length) {
                            addLog('图片上传完成', 'success', `所有图片已加载到队列`, {
                                '成功加载': `${imageFiles.length} 张`,
                                '当前队列': `${state.images.length} 张`,
                                '识别模式': getModeDisplayName(state.mode)
                            });
                        }
                    };
                    
                    reader.onerror = () => {
                        addLog(`图片加载失败`, 'error', `无法读取: ${file.name}`);
                    };
                    
                    reader.readAsDataURL(file);
                });
            }
            
            // 处理 PDF 文件
            if (pdfFiles.length > 0) {
                for (const pdfFile of pdfFiles) {
                    await handlePDFFile(pdfFile);
                }
            }
            
            if (imageFiles.length > 0) {
                showToast(`添加了 ${imageFiles.length} 张图片`, 'success');
            }
        }
        
        // Handle PDF File - 处理 PDF 文件并转换为图片
        async function handlePDFFile(pdfFile) {
            try {
                showToast(`正在转换 PDF: ${pdfFile.name}...`, 'info');
                addLog('PDF 转换开始', 'info', `正在处理 PDF 文件: ${pdfFile.name}`, {
                    '文件名': pdfFile.name,
                    '大小': formatFileSize(pdfFile.size),
                    '状态': '转换中...'
                });
                
                // 创建 FormData
                const formData = new FormData();
                formData.append('file', pdfFile);
                
                // 调用后端 PDF 转图片接口
                const response = await fetch(`${CONFIG.apiUrl}/pdf-to-images`, {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (!data.success) {
                    throw new Error(data.error || 'PDF 转换失败');
                }
                
                // 显示转换进度（如果后端返回了总页数）
                const totalPages = data.total_pages || data.images.length;
                const pageCount = data.images.length;
                
                // 添加开始转换的日志
                if (totalPages > 1) {
                    addLog('PDF 转换开始', 'info', `开始转换 PDF，共 ${totalPages} 页`, {
                        '总页数': `${totalPages} 页`,
                        '状态': '开始处理...'
                    });
                }
                
                // 为每页创建图片对象 - 使用异步处理确保实时显示进度
                for (let index = 0; index < data.images.length; index++) {
                    const imgData = data.images[index];
                    
                    // 添加进度日志（每页转换完成时）- 使用异步延迟确保实时显示
                    if (totalPages > 1) {
                        // 使用 setTimeout 让浏览器有时间渲染每条日志
                        await new Promise(resolve => {
                            setTimeout(() => {
                                addLog('PDF 转换进度', 'info', `正在处理第 ${index + 1}/${totalPages} 页`, {
                                    '当前页': `${index + 1}/${totalPages}`,
                                    '进度': `${Math.round((index + 1) / totalPages * 100)}%`
                                });
                                resolve();
                            }, index * 50); // 每页延迟50ms，确保日志实时显示
                        });
                    }
                    
                    const id = Date.now() + Math.random() + index;
                    
                    // 创建 Blob 对象用于后续处理
                    const base64Data = imgData.data.split(',')[1];
                    const byteCharacters = atob(base64Data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'image/png' });
                    const file = new File([blob], imgData.name, { type: 'image/png' });
                    
                    state.images.push({
                        id,
                        file,
                        name: imgData.name,
                        size: formatFileSize(byteArray.length),
                        preview: imgData.data, // base64 预览
                        status: 'pending',
                        result: null,
                        isFromPDF: true,
                        originalPDF: pdfFile.name,
                        pageNumber: imgData.page_number
                    });
                    
                    // 实时更新UI（每处理几页更新一次，避免过于频繁）
                    if ((index + 1) % 5 === 0 || index === data.images.length - 1) {
                        renderImages();
                        updateUI();
                    }
                }
                
                // 最终更新UI
                renderImages();
                updateUI();
                
                // 添加完成日志
                addLog('PDF 转换完成', 'success', `PDF 已成功转换为 ${pageCount} 张图片`, {
                    '原文件': data.original_filename,
                    '总页数': `${totalPages} 页`,
                    '已转换': `${pageCount} 页`,
                    '状态': '已添加到队列'
                });
                
                showToast(`PDF 转换完成，已添加 ${pageCount} 张图片`, 'success');
                
            } catch (error) {
                console.error('PDF 转换错误:', error);
                showToast(`PDF 转换失败: ${error.message}`, 'error');
                addLog('PDF 转换失败', 'error', `无法转换 PDF: ${pdfFile.name}`, {
                    '错误': error.message,
                    '文件名': pdfFile.name
                });
            }
        }

        // Render Images
        function renderImages() {
            elements.imagesGrid.innerHTML = state.images.map((img, index) => `
                <div class="image-card" draggable="true" data-id="${img.id}">
                    <div class="image-order">${index + 1}</div>
                    <button class="image-remove" onclick="removeImage('${img.id}')">×</button>
                    <img src="${img.preview}" alt="${img.name}" class="image-preview">
                    <div class="image-info">
                        <div class="image-name" title="${img.name}">${img.name}</div>
                        <div class="image-size">${img.size}</div>
                    </div>
                    ${img.status !== 'pending' ? `<div class="image-status status-${img.status}">${getStatusText(img.status)}</div>` : ''}
                </div>
            `).join('');

            setupImageDragAndDrop();
        }

        // Setup Image Drag and Drop for Reordering (修复版)
        function setupImageDragAndDrop() {
            const cards = document.querySelectorAll('.image-card');
            let draggedElement = null;
            let draggedId = null;

            cards.forEach(card => {
                card.addEventListener('dragstart', (e) => {
                    draggedElement = card;
                    draggedId = card.dataset.id;
                    const img = state.images.find(i => i.id == draggedId);
                    card.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/html', card.innerHTML);
                    
                    if (img) {
                        const currentIndex = state.images.findIndex(i => i.id == draggedId);
                        addLog('开始拖动图片', 'info', `正在调整 ${img.name} 的位置`, {
                            '当前位置': `第 ${currentIndex + 1} 张`,
                            '文件名': img.name
                        });
                    }
                });

                card.addEventListener('dragend', () => {
                    card.classList.remove('dragging');
                });

                card.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    
                    if (draggedElement && card !== draggedElement) {
                        // 获取所有卡片
                        const allCards = [...elements.imagesGrid.querySelectorAll('.image-card')];
                        const draggedIndex = allCards.indexOf(draggedElement);
                        const targetIndex = allCards.indexOf(card);
                        
                        // 判断应该插入到目标元素之前还是之后
                        if (draggedIndex < targetIndex) {
                            // 从前往后拖，插入到目标之后
                            card.parentNode.insertBefore(draggedElement, card.nextSibling);
                        } else {
                            // 从后往前拖，插入到目标之前
                            card.parentNode.insertBefore(draggedElement, card);
                        }
                    }
                });

                card.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateImageOrder();
                });
            });

            // 为容器添加dragover事件，防止默认行为
            elements.imagesGrid.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
        }

        function updateImageOrder() {
            const cards = [...document.querySelectorAll('.image-card')];
            const newOrder = cards.map(card => card.dataset.id);
            
            // 保存旧顺序用于对比
            const oldOrder = state.images.map(img => img.name);
            
            state.images.sort((a, b) => {
                return newOrder.indexOf(a.id.toString()) - newOrder.indexOf(b.id.toString());
            });
            
            const newOrderNames = state.images.map(img => img.name);
            
            renderImages();
            
            addLog('图片顺序已调整', 'success', `拖拽排序完成，已更新识别顺序`, {
                '总数量': `${state.images.length} 张`,
                '新顺序': newOrderNames.slice(0, 3).join(', ') + (newOrderNames.length > 3 ? '...' : ''),
                '操作提示': '将按照新顺序进行识别'
            });
        }

        // Remove Image
        window.removeImage = function(id) {
            state.images = state.images.filter(img => img.id != id);
            renderImages();
            updateUI();
            showToast('已移除图片', 'info');
        };

        // Setup Buttons
        function setupButtons() {
            elements.processBtn.addEventListener('click', startProcessing);
            elements.addMoreBtn.addEventListener('click', () => elements.fileInput.click());
            elements.clearBtn.addEventListener('click', clearAll);
            elements.copyBtn.addEventListener('click', copyResult);
            elements.downloadBtn.addEventListener('click', downloadResult);
            
            // 单图模式按钮
            document.getElementById('processSingleBtn').addEventListener('click', processSingleImage);
            document.getElementById('changeSingleBtn').addEventListener('click', () => {
                document.getElementById('singleImagePreview').click();
            });
            document.getElementById('clearSingleBtn').addEventListener('click', clearSingleImage);
            
            // 单图上传区域点击事件
            const singlePreview = document.getElementById('singleImagePreview');
            singlePreview.addEventListener('click', (e) => {
                if (e.target.closest('.preview-placeholder') || e.target === singlePreview) {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                        if (e.target.files && e.target.files[0]) {
                            handleSingleImageUpload(e.target.files[0]);
                        }
                    };
                    input.click();
                }
            });
            
            // 单图拖拽上传
            singlePreview.addEventListener('dragover', (e) => {
                e.preventDefault();
                singlePreview.classList.add('drag-over');
            });
            
            singlePreview.addEventListener('dragleave', () => {
                singlePreview.classList.remove('drag-over');
            });
            
            singlePreview.addEventListener('drop', (e) => {
                e.preventDefault();
                singlePreview.classList.remove('drag-over');
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleSingleImageUpload(e.dataTransfer.files[0]);
                }
            });
        }

        // Handle Single Image Upload（单图上传处理）
        function handleSingleImageUpload(file) {
            if (!file.type.startsWith('image/')) {
                showToast('请选择图片文件', 'error');
                return;
            }

            // 保存到 state
            state.singleImage = {
                file: file,
                name: file.name,
                size: formatFileSize(file.size)
            };

            // 显示预览
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgElement = document.getElementById('previewImage');
                const canvas = document.getElementById('boundingBoxCanvas');
                const placeholder = document.querySelector('.preview-placeholder');
                const container = document.getElementById('previewContainer');

                placeholder.style.display = 'none';
                container.style.display = 'block';
                
                imgElement.src = e.target.result;
                imgElement.onload = () => {
                    // 清除旧的边界框
                    const ctx = canvas.getContext('2d');
                    canvas.width = imgElement.offsetWidth;
                    canvas.height = imgElement.offsetHeight;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                };

                addLog('图片上传成功', 'success', `已加载: ${file.name}`, {
                    '文件名': file.name,
                    '文件大小': formatFileSize(file.size),
                    '模式': '单图查找定位'
                });
            };
            reader.readAsDataURL(file);
        }

        // Clear Single Image（清空单图）
        function clearSingleImage() {
            state.singleImage = null;
            
            const placeholder = document.querySelector('.preview-placeholder');
            const container = document.getElementById('previewContainer');
            const canvas = document.getElementById('boundingBoxCanvas');
            
            placeholder.style.display = 'block';
            container.style.display = 'none';
            
            // 清除 canvas
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 清除结果
            elements.resultSection.classList.remove('active');
            
            showToast('已清空图片', 'info');
            addLog('清空图片', 'info', '已清除当前图片和识别结果');
        }

        // Start Processing
        async function startProcessing() {
            if (state.images.length === 0) {
                showToast('请先上传图片', 'error');
                addLog('无法开始识别', 'error', '请先上传至少一张图片', {
                    '当前队列': '0 张图片',
                    '操作建议': '点击上传区域添加图片'
                });
                return;
            }
            
            // Validate advanced settings
            if (!validateAdvancedSettings()) {
                return;
            }

            const startTime = Date.now();
            state.isProcessing = true;
            state.results = [];
            elements.progressSection.classList.add('active');
            elements.resultSection.classList.remove('active');
            updateUI();

            addLog('开始批量识别', 'success', `准备处理 ${state.images.length} 张图片`, {
                '图片数量': `${state.images.length} 张`,
                '识别模式': getModeDisplayName(state.mode),
                '处理方式': '逐一顺序处理',
                '预计时间': `约 ${Math.ceil(state.images.length * 0.5)}-${state.images.length} 分钟`
            });

            const total = state.images.length;
            let processed = 0;
            let succeeded = 0;
            let failed = 0;

            for (let i = 0; i < state.images.length; i++) {
                const image = state.images[i];
                if (image.status === 'completed') continue;

                const imageStartTime = Date.now();
                image.status = 'processing';
                renderImages();
                
                addLog(`识别图片 [${i + 1}/${total}]`, 'info', `正在处理: ${image.name}`, {
                    '文件名': image.name,
                    '文件大小': image.size,
                    '当前位置': `第 ${i + 1} 张`,
                    '队列进度': `${processed}/${total}`,
                    '识别模式': getModeDisplayName(state.mode)
                });

                try {
                    const result = await processImage(image);
                    const processingTime = ((Date.now() - imageStartTime) / 1000).toFixed(1);
                    
                    image.status = 'completed';
                    image.result = result;
                    state.results.push({
                        name: image.name,
                        text: result
                    });
                    succeeded++;
                    
                    const textLength = result.length;
                    const wordCount = result.split(/\s+/).length;
                    
                    addLog(`✓ 识别成功 [${i + 1}/${total}]`, 'success', `${image.name} 处理完成`, {
                        '处理时间': `${processingTime} 秒`,
                        '识别字符': `${textLength} 个字符`,
                        '词数统计': `约 ${wordCount} 词`,
                        '当前进度': `${Math.round((processed + 1) / total * 100)}%`,
                        '剩余数量': `${total - processed - 1} 张`
                    });
                } catch (error) {
                    const processingTime = ((Date.now() - imageStartTime) / 1000).toFixed(1);
                    
                    image.status = 'error';
                    image.result = `识别失败: ${error.message}`;
                    failed++;
                    
                    addLog(`✗ 识别失败 [${i + 1}/${total}]`, 'error', `${image.name} 处理出错`, {
                        '错误信息': error.message,
                        '处理时间': `${processingTime} 秒`,
                        '文件名': image.name,
                        '当前进度': `${Math.round((processed + 1) / total * 100)}%`,
                        '建议': '检查图片格式或网络连接'
                    });
                }

                processed++;
                updateProgress(processed, total);
                renderImages();
            }

            const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
            const avgTime = (totalTime / total).toFixed(1);

            state.isProcessing = false;
            showResult();
            showToast('所有图片识别完成！', 'success');
            
            addLog('批量识别完成', 'success', `所有图片处理完毕，结果已生成`, {
                '总数量': `${total} 张`,
                '成功': `${succeeded} 张`,
                '失败': `${failed} 张`,
                '总耗时': `${totalTime} 秒`,
                '平均耗时': `${avgTime} 秒/张`,
                '识别模式': getModeDisplayName(state.mode),
                '结果长度': `${state.results.reduce((sum, r) => sum + r.text.length, 0)} 字符`
            });
        }

        // Process Single Image
        async function processImage(image) {
            const formData = new FormData();
            formData.append('file', image.file);
            formData.append('prompt_type', state.mode);
            
            // 添加 Find 模式的查找词
            if (state.mode === 'find') {
                const findTerm = document.getElementById('findTerm').value.trim();
                formData.append('find_term', findTerm || 'Total');
            }
            
            // 添加 Freeform 模式的自定义提示
            if (state.mode === 'freeform') {
                const customPromptInput = document.getElementById('customPromptBatch');
                const customPrompt = customPromptInput ? customPromptInput.value.trim() : '';
                formData.append('custom_prompt', customPrompt || 'OCR this image.');
            }
            
            // 可选：添加 grounding 参数
            formData.append('grounding', state.mode === 'find' || state.mode === 'document' || state.mode === 'ocr');
            
            // Add advanced settings
            appendAdvancedSettings(formData);

            const response = await fetch(`${CONFIG.apiUrl}/ocr`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || '识别失败');
            }
            
            // 如果有 boxes 信息，保存到 image 对象中
            if (data.boxes && data.boxes.length > 0) {
                image.boxes = data.boxes;
                image.imageDims = data.image_dims;
            }
            
            // Store raw text for later use
            image.rawText = data.raw_text || data.text;

            return data.text;
        }

        // Draw Bounding Boxes on Canvas（边界框绘制函数）
        function drawBoundingBoxes(imgElement, canvas, boxes, imageDims) {
            if (!boxes || boxes.length === 0) {
                console.log('❌ 没有边界框需要绘制');
                return;
            }

            console.log('🎨 开始绘制边界框:', boxes);

            const ctx = canvas.getContext('2d');
            
            // 设置 canvas 尺寸匹配图片显示尺寸
            canvas.width = imgElement.offsetWidth;
            canvas.height = imgElement.offsetHeight;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 计算缩放比例
            const scaleX = imgElement.offsetWidth / (imageDims?.w || imgElement.naturalWidth);
            const scaleY = imgElement.offsetHeight / (imageDims?.h || imgElement.naturalHeight);
            
            console.log('📏 缩放比例:', { scaleX, scaleY, canvasSize: { w: canvas.width, h: canvas.height } });
            
            // 颜色数组
            const colors = ['#00ff00', '#00ffff', '#ff00ff', '#ffff00', '#ff0066', '#00ff99'];
            
            // 绘制每个边界框
            boxes.forEach((box, idx) => {
                const [x1, y1, x2, y2] = box.box;
                const color = colors[idx % colors.length];
                
                // 缩放坐标
                const sx = x1 * scaleX;
                const sy = y1 * scaleY;
                const sw = (x2 - x1) * scaleX;
                const sh = (y2 - y1) * scaleY;
                
                console.log(`📦 Box ${idx} (${box.label}):`, {
                    original: [x1, y1, x2, y2],
                    scaled: [sx, sy, sw, sh]
                });
                
                // 半透明填充
                ctx.fillStyle = color + '33';
                ctx.fillRect(sx, sy, sw, sh);
                
                // 霓虹边框
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.shadowColor = color;
                ctx.shadowBlur = 10;
                ctx.strokeRect(sx, sy, sw, sh);
                ctx.shadowBlur = 0;
                
                // 标签背景和文字
                if (box.label) {
                    ctx.font = 'bold 14px Arial';
                    const metrics = ctx.measureText(box.label);
                    const padding = 8;
                    const labelHeight = 24;
                    
                    // 标签背景
                    ctx.fillStyle = color;
                    ctx.fillRect(sx, sy - labelHeight, metrics.width + padding * 2, labelHeight);
                    
                    // 标签文字
                    ctx.fillStyle = '#000';
                    ctx.fillText(box.label, sx + padding, sy - 7);
                }
            });
            
            console.log('✅ 完成绘制', boxes.length, '个边界框');
        }

        // Process Single Image for Find Mode（单图处理函数）
        async function processSingleImage() {
            const findTerm = document.getElementById('findTerm').value.trim();
            if (!findTerm) {
                showToast('请输入要查找的内容', 'error');
                return;
            }

            const singleImageData = state.singleImage;
            if (!singleImageData) {
                showToast('请先上传图片', 'error');
                return;
            }
            
            // Validate advanced settings
            if (!validateAdvancedSettings()) {
                return;
            }

            addLog('开始查找定位', 'info', `正在图片中查找: ${findTerm}`, {
                '查找词': findTerm,
                '图片名': singleImageData.name,
                '文件大小': singleImageData.size
            });

            try {
                const formData = new FormData();
                formData.append('file', singleImageData.file);
                formData.append('prompt_type', 'find');
                formData.append('find_term', findTerm);
                formData.append('grounding', true);
                
                // Add advanced settings
                appendAdvancedSettings(formData);

                const response = await fetch(`${CONFIG.apiUrl}/ocr`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || '识别失败');
                }

                // 显示结果
                elements.resultSection.classList.add('active');
                displayResult(data.text || '未找到匹配内容', data.raw_text || data.text);

                // 绘制边界框
                if (data.boxes && data.boxes.length > 0) {
                    const imgElement = document.getElementById('previewImage');
                    const canvas = document.getElementById('boundingBoxCanvas');
                    
                    // 保存到全局变量以便 resize 时重新绘制
                    window.lastDrawnBoxes = data.boxes;
                    window.lastImageDims = data.image_dims;
                    
                    // 等待图片完全加载后再绘制
                    if (imgElement.complete) {
                        drawBoundingBoxes(imgElement, canvas, data.boxes, data.image_dims);
                    } else {
                        imgElement.onload = () => {
                            drawBoundingBoxes(imgElement, canvas, data.boxes, data.image_dims);
                        };
                    }

                    addLog('✓ 查找定位成功', 'success', `找到 ${data.boxes.length} 个匹配项`, {
                        '查找词': findTerm,
                        '匹配数量': `${data.boxes.length} 个`,
                        '匹配项': data.boxes.map(b => b.label).join(', ')
                    });
                } else {
                    addLog('查找完成', 'info', '未找到匹配的内容', {
                        '查找词': findTerm,
                        '建议': '尝试使用不同的关键词'
                    });
                }

            } catch (error) {
                showToast('查找失败: ' + error.message, 'error');
                addLog('✗ 查找失败', 'error', error.message, {
                    '查找词': findTerm,
                    '建议': '检查网络连接或更换图片'
                });
            }
        }

        // Update Progress
        function updateProgress(processed, total) {
            const percentage = (processed / total) * 100;
            elements.progressBar.style.width = `${percentage}%`;
            elements.processedCount.textContent = processed;
            elements.totalCount.textContent = total;
        }

        // Show Result
        function showResult() {
            elements.resultSection.classList.add('active');
            
            if (state.results.length === 0) {
                elements.resultText.innerHTML = `
                    <div class="result-empty">
                        <div class="result-empty-icon">📭</div>
                        <div>暂无识别结果</div>
                    </div>
                `;
                return;
            }

            // Merge results with separators
            const mergedText = state.results.map((result, index) => {
                const separator = '='.repeat(60);
                return `${separator}\n图片 ${index + 1}: ${result.name}\n${separator}\n\n${result.text}\n\n`;
            }).join('\n');

            const mergedRawText = state.results.map((result, index) => {
                const separator = '='.repeat(60);
                return `${separator}\n图片 ${index + 1}: ${result.name}\n${separator}\n\n${result.rawText || result.text}\n\n`;
            }).join('\n');

            displayResult(mergedText, mergedRawText);
        }

        // Copy Result
        function copyResult() {
            const text = elements.resultText.textContent;
            if (!text || text.includes('暂无识别结果')) {
                showToast('没有可复制的内容', 'error');
                addLog('复制操作失败', 'error', '当前没有可复制的识别结果', {
                    '原因': '未进行识别或识别未完成',
                    '建议': '先上传图片并完成识别'
                });
                return;
            }

            navigator.clipboard.writeText(text).then(() => {
                const charCount = text.length;
                const lineCount = text.split('\n').length;
                
                showToast('已复制到剪贴板', 'success');
                addLog('复制到剪贴板', 'success', `识别结果已成功复制`, {
                    '字符数': `${charCount} 个字符`,
                    '行数': `${lineCount} 行`,
                    '图片数': `${state.results.length} 张`,
                    '操作': '可直接粘贴到其他应用'
                });
            }).catch((err) => {
                showToast('复制失败', 'error');
                addLog('复制操作失败', 'error', '无法访问剪贴板', {
                    '错误': err.message || '浏览器安全限制',
                    '建议': '尝试手动选择并复制文本'
                });
            });
        }

        // Download Result
        function downloadResult() {
            const text = elements.resultText.textContent;
            if (!text || text.includes('暂无识别结果')) {
                showToast('没有可下载的内容', 'error');
                addLog('下载操作失败', 'error', '当前没有可下载的识别结果', {
                    '原因': '未进行识别或识别未完成',
                    '建议': '先上传图片并完成识别'
                });
                return;
            }

            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const filename = `OCR_结果_${new Date().toISOString().slice(0,10)}.txt`;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);

            const fileSize = formatFileSize(blob.size);
            const charCount = text.length;
            const lineCount = text.split('\n').length;

            showToast('文件已下载', 'success');
            addLog('下载识别结果', 'success', `文件已保存到本地`, {
                '文件名': filename,
                '文件大小': fileSize,
                '字符数': `${charCount} 个字符`,
                '行数': `${lineCount} 行`,
                '包含图片': `${state.results.length} 张`,
                '保存位置': '浏览器默认下载文件夹'
            });
        }

        // Clear All
        function clearAll() {
            if (!confirm('确定要清空所有图片吗？')) return;

            const count = state.images.length;
            const resultCount = state.results.length;
            const completedCount = state.images.filter(i => i.status === 'completed').length;
            
            state.images = [];
            state.results = [];
            renderImages();
            updateUI();
            elements.progressSection.classList.remove('active');
            elements.resultSection.classList.remove('active');
            showToast('已清空', 'info');
            
            addLog('清空队列', 'info', `已清空所有图片和结果`, {
                '清空图片': `${count} 张`,
                '已完成': `${completedCount} 张`,
                '识别结果': `${resultCount} 条`,
                '当前状态': '队列已清空，可重新上传'
            });
        }

        // Update UI
        function updateUI() {
            const hasImages = state.images.length > 0;
            elements.imagesSection.classList.toggle('active', hasImages);
            elements.imageCount.textContent = state.images.length;
            elements.processBtn.disabled = state.isProcessing || !hasImages;
            elements.clearBtn.disabled = state.isProcessing || !hasImages;
        }

        // Setup Drag and Drop (not for reordering, but for new file drop)
        function setupDragAndDrop() {
            // Already handled in setupUpload
        }

        // Utility Functions
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

        // Window resize event - redraw bounding boxes
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // 如果是 Find 模式且有图片，重新绘制边界框
                if (state.mode === 'find' && state.singleImage) {
                    const imgElement = document.getElementById('previewImage');
                    const canvas = document.getElementById('boundingBoxCanvas');
                    const container = document.getElementById('previewContainer');
                    
                    if (container && container.style.display !== 'none' && imgElement.complete) {
                        // 尝试从结果中获取 boxes（如果已经处理过）
                        const resultText = elements.resultText.textContent;
                        if (resultText && window.lastDrawnBoxes) {
                            drawBoundingBoxes(imgElement, canvas, window.lastDrawnBoxes, window.lastImageDims);
                        }
                    }
                }
            }, 200);
        });

        // ====================================
        // Find Mode Functions (查找定位模式)
        // ====================================
        
        const findState = {
            image: null,
            imageData: null,
            processing: false
        };
        
        function initFindMode() {
            const uploadZone = document.getElementById('findUploadZone');
            const changeBtn = document.getElementById('findChangeBtn');
            const clearBtn = document.getElementById('findClearBtn');
            const processBtn = document.getElementById('findProcessBtn');
            const termInput = document.getElementById('findTermInput');
            
            // 上传区域点击
            uploadZone.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*,.pdf,application/pdf';
                input.onchange = (e) => {
                    if (e.target.files[0]) {
                        handleFindImageUpload(e.target.files[0]);
                    }
                };
                input.click();
            });
            
            // 拖拽上传
            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.classList.add('drag-over');
            });
            
            uploadZone.addEventListener('dragleave', () => {
                uploadZone.classList.remove('drag-over');
            });
            
            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('drag-over');
                if (e.dataTransfer.files[0]) {
                    handleFindImageUpload(e.dataTransfer.files[0]);
                }
            });
            
            // 按钮事件
            changeBtn.addEventListener('click', () => uploadZone.click());
            clearBtn.addEventListener('click', clearFindMode);
            processBtn.addEventListener('click', processFindMode);
            
            // 输入框变化
            termInput.addEventListener('input', updateFindButtons);
        }
        
        async function handleFindImageUpload(file) {
            const fileType = file.type.toLowerCase();
            const fileName = file.name.toLowerCase();
            
            // 检查是否为 PDF
            const isPDF = fileType === 'application/pdf' || fileName.endsWith('.pdf');
            
            if (!fileType.startsWith('image/') && !isPDF) {
                showToast('请选择图片或 PDF 文件', 'error');
                addLog('文件格式不支持', 'error', `不支持的文件格式: ${file.name}`, {
                    '文件类型': fileType || '未知',
                    'Supported': '图片或 PDF'
                });
                return;
            }
            
            // 如果是 PDF，先转换为图片（只取第一页）
            if (isPDF) {
                try {
                    showToast('正在转换 PDF...', 'info');
                    
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    const response = await fetch(`${CONFIG.apiUrl}/pdf-to-images`, {
                        method: 'POST',
                        body: formData
                    });
                    
                    const data = await response.json();
                    
                    if (!data.success || !data.images || data.images.length === 0) {
                        throw new Error(data.error || 'PDF 转换失败');
                    }
                    
                    // 使用第一页
                    const firstPage = data.images[0];
                    
                    // 创建 Blob 和 File 对象
                    const base64Data = firstPage.data.split(',')[1];
                    const byteCharacters = atob(base64Data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'image/png' });
                    const imageFile = new File([blob], firstPage.name, { type: 'image/png' });
                    
                    // 更新状态
                    findState.image = imageFile;
                    findState.imageData = firstPage.data;
                    
                    // 显示预览
                    const preview = document.getElementById('findUploadedPreview');
                    const img = document.getElementById('findUploadedImage');
                    const info = document.getElementById('findUploadedInfo');
                    const uploadZone = document.getElementById('findUploadZone');
                    
                    img.src = firstPage.data;
                    info.textContent = `📄 ${file.name} (第 1 页) - ${formatFileSize(byteArray.length)}`;
                    
                    uploadZone.style.display = 'none';
                    preview.classList.add('active');
                    
                    // 更新按钮状态
                    updateFindButtons();
                    
                    // 清除旧结果
                    document.getElementById('findResultEmpty').style.display = 'block';
                    document.getElementById('findResultContainer').classList.remove('active');
                    
                    addLog('PDF 转换成功', 'success', `Find 模式: ${file.name} (第 1 页)`, {
                        '原文件': file.name,
                        '页数': `${data.page_count} 页`,
                        '使用': '第 1 页',
                        '模式': '查找定位'
                    });
                    
                    showToast('PDF 已转换为图片', 'success');
                    
                } catch (error) {
                    console.error('PDF 转换错误:', error);
                    showToast(`PDF 转换失败: ${error.message}`, 'error');
                    addLog('PDF 转换失败', 'error', `无法转换 PDF: ${file.name}`, {
                        '错误': error.message
                    });
                }
                return;
            }
            
            // 处理普通图片文件
            findState.image = file;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                findState.imageData = e.target.result;
                
                // 显示预览
                const preview = document.getElementById('findUploadedPreview');
                const img = document.getElementById('findUploadedImage');
                const info = document.getElementById('findUploadedInfo');
                const uploadZone = document.getElementById('findUploadZone');
                
                img.src = e.target.result;
                info.textContent = `📁 ${file.name} (${formatFileSize(file.size)})`;
                
                uploadZone.style.display = 'none';
                preview.classList.add('active');
                
                // 更新按钮状态
                updateFindButtons();
                
                // 清除旧结果
                document.getElementById('findResultEmpty').style.display = 'block';
                document.getElementById('findResultContainer').classList.remove('active');
                
                addLog('图片上传成功', 'success', `Find 模式: ${file.name}`, {
                    '文件名': file.name,
                    '大小': formatFileSize(file.size),
                    '模式': '查找定位'
                });
                
                showToast('图片上传成功', 'success');
            };
            reader.readAsDataURL(file);
        }
        
        function clearFindMode() {
            findState.image = null;
            findState.imageData = null;
            
            // 重置 UI
            document.getElementById('findUploadZone').style.display = 'block';
            document.getElementById('findUploadedPreview').classList.remove('active');
            document.getElementById('findResultEmpty').style.display = 'block';
            document.getElementById('findResultContainer').classList.remove('active');
            document.getElementById('findTermInput').value = '';
            
            updateFindButtons();
            
            addLog('重置 Find 模式', 'info', '已清空图片和结果');
            showToast('已清空', 'info');
        }
        
        function updateFindButtons() {
            const hasImage = findState.image !== null;
            const hasTerm = document.getElementById('findTermInput').value.trim().length > 0;
            
            document.getElementById('findProcessBtn').disabled = !(hasImage && hasTerm) || findState.processing;
            document.getElementById('findChangeBtn').disabled = findState.processing;
            document.getElementById('findClearBtn').disabled = !hasImage || findState.processing;
        }
        
        async function processFindMode() {
            const findTerm = document.getElementById('findTermInput').value.trim();
            
            if (!findState.image || !findTerm) {
                showToast('请上传图片并输入查找词', 'error');
                return;
            }
            
            findState.processing = true;
            updateFindButtons();
            
            const processBtn = document.getElementById('findProcessBtn');
            const originalText = processBtn.innerHTML;
            processBtn.innerHTML = '<span>⏳</span><span>处理中...</span>';
            
            addLog('开始查找', 'info', `查找词: ${findTerm}`, {
                '图片': findState.image.name,
                '查找内容': findTerm,
                '模式': 'Find + Grounding'
            });
            
            try {
                const formData = new FormData();
                formData.append('file', findState.image);
                formData.append('prompt_type', 'find');
                formData.append('find_term', findTerm);
                formData.append('grounding', true);
                
                const response = await fetch(`${CONFIG.apiUrl}/ocr`, {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (!data.success) {
                    throw new Error(data.error || '识别失败');
                }
                
                // 显示结果
                displayFindResult(data, findTerm);
                
            } catch (error) {
                showToast('查找失败: ' + error.message, 'error');
                addLog('✗ 查找失败', 'error', error.message);
            } finally {
                findState.processing = false;
                processBtn.innerHTML = originalText;
                updateFindButtons();
            }
        }
        
        function displayFindResult(data, findTerm) {
            // 隐藏空状态，显示结果
            document.getElementById('findResultEmpty').style.display = 'none';
            document.getElementById('findResultContainer').classList.add('active');
            
            // 显示结果图片
            const resultImg = document.getElementById('findResultImage');
            const resultCanvas = document.getElementById('findResultCanvas');
            resultImg.src = findState.imageData;
            
            // 等待图片加载后绘制边界框
            resultImg.onload = () => {
                // 使用 requestAnimationFrame 确保图片已经渲染
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        if (data.boxes && data.boxes.length > 0) {
                            drawFindBoundingBoxes(resultImg, resultCanvas, data.boxes, data.image_dims);
                        } else {
                            // 清空 canvas
                            const ctx = resultCanvas.getContext('2d');
                            resultCanvas.width = resultImg.offsetWidth;
                            resultCanvas.height = resultImg.offsetHeight;
                            resultCanvas.style.width = resultImg.offsetWidth + 'px';
                            resultCanvas.style.height = resultImg.offsetHeight + 'px';
                            ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
                        }
                    }, 50);
                });
            };
            
            // 如果图片已经加载（来自缓存），立即绘制
            if (resultImg.complete && resultImg.naturalWidth > 0) {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        if (data.boxes && data.boxes.length > 0) {
                            drawFindBoundingBoxes(resultImg, resultCanvas, data.boxes, data.image_dims);
                        }
                    }, 50);
                });
            }
            
            // 显示统计信息
            const statsHtml = [];
            if (data.boxes && data.boxes.length > 0) {
                statsHtml.push(`<div class="find-stat-badge success">✓ 找到 ${data.boxes.length} 个匹配项</div>`);
                statsHtml.push(`<div class="find-stat-badge">🎯 查找词: ${findTerm}</div>`);
            } else {
                statsHtml.push(`<div class="find-stat-badge">❌ 未找到匹配项</div>`);
                statsHtml.push(`<div class="find-stat-badge">🎯 查找词: ${findTerm}</div>`);
            }
            document.getElementById('findResultStats').innerHTML = statsHtml.join('');
            
            // 显示识别文本
            document.getElementById('findResultText').textContent = data.text || '未识别到内容';
            
            // 显示匹配项列表
            if (data.boxes && data.boxes.length > 0) {
                displayFindMatches(data.boxes);
                addLog('✓ 查找成功', 'success', `找到 ${data.boxes.length} 个匹配项`, {
                    '查找词': findTerm,
                    '匹配数': data.boxes.length,
                    '匹配项': data.boxes.map(b => b.label).join(', ')
                });
            } else {
                document.getElementById('findMatchesList').style.display = 'none';
                addLog('查找完成', 'info', '未找到匹配内容', {
                    '查找词': findTerm,
                    '建议': '尝试其他关键词'
                });
            }
            
            showToast('识别完成', 'success');
        }
        
        function drawFindBoundingBoxes(imgElement, canvas, boxes, imageDims) {
            if (!boxes || boxes.length === 0) return;
            
            console.log('🎨 绘制边界框:', boxes);
            
            const ctx = canvas.getContext('2d');
            
            // 确保 Canvas 精确匹配图片显示尺寸
            const imgWidth = imgElement.offsetWidth;
            const imgHeight = imgElement.offsetHeight;
            
            canvas.width = imgWidth;
            canvas.height = imgHeight;
            canvas.style.width = imgWidth + 'px';
            canvas.style.height = imgHeight + 'px';
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 计算缩放比例（从原始图片尺寸到显示尺寸）
            const originalWidth = imageDims?.w || imgElement.naturalWidth;
            const originalHeight = imageDims?.h || imgElement.naturalHeight;
            const scaleX = imgWidth / originalWidth;
            const scaleY = imgHeight / originalHeight;
            
            console.log('📐 图片尺寸:', {
                display: { w: imgWidth, h: imgHeight },
                original: { w: originalWidth, h: originalHeight },
                scale: { x: scaleX, y: scaleY }
            });
            
            // 颜色方案
            const colors = ['#00ff00', '#00ffff', '#ff00ff', '#ffff00', '#ff0066', '#00ff99'];
            
            boxes.forEach((box, idx) => {
                const [x1, y1, x2, y2] = box.box;
                const color = colors[idx % colors.length];
                
                // 缩放坐标
                const sx = x1 * scaleX;
                const sy = y1 * scaleY;
                const sw = (x2 - x1) * scaleX;
                const sh = (y2 - y1) * scaleY;
                
                console.log(`📦 Box ${idx} (${box.label}):`, [sx, sy, sw, sh]);
                
                // 半透明填充
                ctx.fillStyle = color + '33';
                ctx.fillRect(sx, sy, sw, sh);
                
                // 霓虹边框
                ctx.strokeStyle = color;
                ctx.lineWidth = 4;
                ctx.shadowColor = color;
                ctx.shadowBlur = 15;
                ctx.strokeRect(sx, sy, sw, sh);
                ctx.shadowBlur = 0;
                
                // 标签
                if (box.label) {
                    ctx.font = 'bold 16px Arial';
                    const metrics = ctx.measureText(box.label);
                    const padding = 10;
                    const labelHeight = 28;
                    
                    // 标签背景
                    ctx.fillStyle = color;
                    ctx.fillRect(sx, sy - labelHeight, metrics.width + padding * 2, labelHeight);
                    
                    // 标签文字
                    ctx.fillStyle = '#000';
                    ctx.fillText(box.label, sx + padding, sy - 8);
                }
            });
            
            console.log('✅ 完成绘制', boxes.length, '个边界框');
        }
        
        function displayFindMatches(boxes) {
            const matchesList = document.getElementById('findMatchesList');
            const matchesContent = document.getElementById('findMatchesContent');
            
            const colors = ['#00ff00', '#00ffff', '#ff00ff', '#ffff00', '#ff0066', '#00ff99'];
            
            const matchesHtml = boxes.map((box, idx) => {
                const color = colors[idx % colors.length];
                const [x1, y1, x2, y2] = box.box;
                return `
                    <div class="find-match-item" style="border-color: ${color};">
                        <div class="find-match-color" style="background: ${color};"></div>
                        <div class="find-match-info">
                            <div class="find-match-label">${box.label}</div>
                            <div class="find-match-coords">[${x1}, ${y1}, ${x2}, ${y2}]</div>
                        </div>
                    </div>
                `;
            }).join('');
            
            matchesContent.innerHTML = matchesHtml;
            matchesList.style.display = 'block';
        }
        
        // 窗口 resize 事件 - 重绘边界框
        let findResizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(findResizeTimeout);
            findResizeTimeout = setTimeout(() => {
                if (state.mode === 'find' && findState.imageData) {
                    const resultImg = document.getElementById('findResultImage');
                    const resultCanvas = document.getElementById('findResultCanvas');
                    const resultContainer = document.getElementById('findResultContainer');
                    
                    if (resultContainer.classList.contains('active') && resultImg.complete && window.lastFindBoxes) {
                        drawFindBoundingBoxes(resultImg, resultCanvas, window.lastFindBoxes, window.lastFindImageDims);
                    }
                }
            }, 200);
        });
        
        // 保存边界框数据以便 resize 时重绘
        window.lastFindBoxes = null;
        window.lastFindImageDims = null;
        
        const originalDrawFindBoundingBoxes = drawFindBoundingBoxes;
        drawFindBoundingBoxes = function(imgElement, canvas, boxes, imageDims) {
            window.lastFindBoxes = boxes;
            window.lastFindImageDims = imageDims;
            originalDrawFindBoundingBoxes(imgElement, canvas, boxes, imageDims);
        };
        
        // ====================================
        // End of Find Mode Functions
        // ====================================

        // Initialize app
        init();
        initFindMode();
        
        // Initialize i18n from external i18n.js
        if (window.i18n && window.i18n.initI18n) {
            window.i18n.initI18n();
        }
        
        // Apply initial language
        if (window.i18n && window.i18n.updateUILanguage) {
            window.i18n.updateUILanguage();
        }
