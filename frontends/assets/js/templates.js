// ====================================
// HTML Templates Generator
// ====================================

function generateHTML() {
    const headerHTML = `
        <div class="header-content">
            <div class="header-left">
                <h1 class="header-title">🤖 DeepSeek-OCR WebUI</h1>
                <span class="header-version">v3.3.3</span>
            </div>
            <div class="header-right">
                <select id="languageSelector" class="language-selector">
                    <option value="zh-CN">🇨🇳 简体中文</option>
                    <option value="zh-TW">🇹🇼 繁體中文</option>
                    <option value="ja-JP">🇯🇵 日本語</option>
                    <option value="en-US">🇺🇸 English</option>
                </select>
            </div>
        </div>
    `;

    const mainContentHTML = `
        <!-- Mode Selector -->
        <section class="mode-section">
            <h2 class="mode-title" data-i18n="mode.title">选择识别模式</h2>
            <div class="mode-grid">
                <div class="mode-option active" data-mode="document">
                    <span class="mode-icon">📄</span>
                    <div class="mode-name" data-i18n="mode.document">文档转Markdown</div>
                </div>
                <div class="mode-option" data-mode="ocr">
                    <span class="mode-icon">🔤</span>
                    <div class="mode-name" data-i18n="mode.ocr">通用OCR</div>
                </div>
                <div class="mode-option" data-mode="free">
                    <span class="mode-icon">📝</span>
                    <div class="mode-name" data-i18n="mode.free">纯文本提取</div>
                </div>
                <div class="mode-option" data-mode="figure">
                    <span class="mode-icon">📊</span>
                    <div class="mode-name" data-i18n="mode.figure">图表解析</div>
                </div>
                <div class="mode-option" data-mode="describe">
                    <span class="mode-icon">🖼️</span>
                    <div class="mode-name" data-i18n="mode.describe">图像描述</div>
                </div>
                <div class="mode-option" data-mode="find">
                    <span class="mode-icon">🔍</span>
                    <div class="mode-name" data-i18n="mode.find">查找定位</div>
                </div>
                <div class="mode-option" data-mode="freeform">
                    <span class="mode-icon">✨</span>
                    <div class="mode-name" data-i18n="mode.freeform">自定义</div>
                </div>
            </div>
        </section>

        <!-- Batch Mode Container (default) -->
        <div id="batchModeContainer">
            <!-- Upload Section -->
            <section class="upload-section">
                <div class="upload-area" id="uploadArea">
                    <div class="upload-icon">📁</div>
                    <div class="upload-text" data-i18n="upload.title">点击或拖拽上传图片/PDF</div>
                    <div class="upload-hint" data-i18n="upload.hint">支持 JPG, PNG, PDF 等格式</div>
                </div>
                <input type="file" id="fileInput" multiple accept="image/*,.pdf" style="display: none;">
            </section>

            <!-- Advanced Settings -->
            <section class="advanced-settings" id="advancedSettings">
                <div class="settings-toggle" id="advancedHeader">
                    <span data-i18n="advancedSettings.title">⚙️ 高级设置</span>
                    <span class="advanced-toggle">▼</span>
                </div>
                <div class="settings-content" id="advancedContent">
                    <div class="settings-grid">
                        <div class="setting-item">
                            <div class="setting-header">
                                <span class="setting-name" data-i18n="advancedSettings.baseSize">基础尺寸</span>
                                <span class="setting-reset" onclick="document.getElementById('baseSize').value=1024;document.getElementById('baseSizeValue').textContent=1024;">重置</span>
                            </div>
                            <div class="setting-description" data-i18n="advancedSettings.baseSizeDesc">图像处理基础尺寸</div>
                            <div class="setting-value">
                                <input type="range" id="baseSize" class="setting-slider" min="512" max="2048" step="64" value="1024">
                                <span class="setting-number" id="baseSizeValue">1024</span>
                            </div>
                        </div>
                        <div class="setting-item">
                            <div class="setting-header">
                                <span class="setting-name" data-i18n="advancedSettings.imageSize">图像尺寸</span>
                                <span class="setting-reset" onclick="document.getElementById('imageSize').value=640;document.getElementById('imageSizeValue').textContent=640;">重置</span>
                            </div>
                            <div class="setting-description" data-i18n="advancedSettings.imageSizeDesc">视觉处理尺寸</div>
                            <div class="setting-value">
                                <input type="range" id="imageSize" class="setting-slider" min="224" max="1280" step="32" value="640">
                                <span class="setting-number" id="imageSizeValue">640</span>
                            </div>
                        </div>
                        <div class="setting-item">
                            <div class="setting-header">
                                <span class="setting-name" data-i18n="advancedSettings.cropMode">裁剪模式</span>
                            </div>
                            <div class="setting-description" data-i18n="advancedSettings.cropModeDesc">自动裁剪图像边缘</div>
                            <div class="checkbox-group">
                                <input type="checkbox" id="cropMode" checked>
                                <label for="cropMode" data-i18n="advancedSettings.enable">启用</label>
                            </div>
                        </div>
                        <div class="setting-item">
                            <div class="setting-header">
                                <span class="setting-name" data-i18n="advancedSettings.includeCaption">包含描述</span>
                            </div>
                            <div class="setting-description" data-i18n="advancedSettings.includeCaptionDesc">生成图像描述信息</div>
                            <div class="checkbox-group">
                                <input type="checkbox" id="includeCaption">
                                <label for="includeCaption" data-i18n="advancedSettings.enable">启用</label>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 20px; text-align: center;">
                        <button class="btn btn-secondary" id="resetAdvanced" data-i18n="advancedSettings.resetAll">重置所有设置</button>
                    </div>
                </div>
            </section>

            <!-- Images Section -->
            <section class="images-section" id="imagesSection">
                <div class="section-header">
                    <h2 class="section-title">
                        <span data-i18n="images.title">待处理图片</span>
                        (<span id="imageCount">0</span>)
                    </h2>
                    <div class="action-buttons">
                        <button class="btn btn-success" id="processBtn" data-i18n="images.process">开始识别</button>
                        <button class="btn btn-secondary" id="addMoreBtn" data-i18n="images.addMore">继续添加</button>
                        <button class="btn btn-danger" id="clearBtn" data-i18n="images.clear">清空</button>
                    </div>
                </div>
                <div class="images-grid" id="imagesGrid"></div>
            </section>

            <!-- Progress Section -->
            <section class="progress-section" id="progressSection">
                <h2 class="section-title" data-i18n="progress.title">识别进度</h2>
                <div class="progress-bar-container">
                    <div class="progress-bar" id="progressBar">
                        <span id="processedCount">0</span>/<span id="totalCount">0</span>
                    </div>
                </div>
            </section>

            <!-- Result Section -->
            <section class="result-section" id="resultSection">
                <div class="section-header">
                    <h2 class="section-title" data-i18n="result.title">识别结果</h2>
                    <div class="action-buttons">
                        <button class="btn btn-primary" id="copyBtn" data-i18n="result.copy">复制</button>
                        <button class="btn btn-success" id="downloadBtn" data-i18n="result.download">下载</button>
                    </div>
                </div>
                <div class="html-toggle-container" id="viewToggle" style="display: none;">
                    <span class="html-toggle-label" data-i18n="result.viewMode">查看模式:</span>
                    <div class="view-buttons">
                        <button class="view-btn active" data-view="formatted" data-i18n="result.formatted">格式化</button>
                        <button class="view-btn" data-view="raw" data-i18n="result.raw">原始</button>
                        <button class="view-btn" data-view="html" data-i18n="result.html">HTML</button>
                    </div>
                </div>
                <div class="result-text" id="resultText"></div>
            </section>
        </div>

        <!-- Find Mode Container -->
        <div id="findModeContainer" class="find-mode-container" style="display: none;">
            <h2 data-i18n="findMode.title">🔍 查找定位模式</h2>
            <div class="find-mode-layout">
                <div class="find-upload-section">
                    <div id="findUploadZone" class="find-upload-zone">
                        <div class="upload-icon">📁</div>
                        <div data-i18n="findMode.uploadImage">上传图片</div>
                    </div>
                    <div id="findUploadedPreview" class="find-uploaded-preview">
                        <img id="findUploadedImage" alt="Uploaded">
                        <div id="findUploadedInfo" class="find-uploaded-info"></div>
                    </div>
                    <div class="find-controls">
                        <input type="text" id="findTermInput" placeholder="输入查找内容..." class="form-control">
                        <div class="find-buttons">
                            <button class="btn btn-success" id="findProcessBtn">🔍 开始查找</button>
                            <button class="btn btn-secondary" id="findChangeBtn">📁 更换图片</button>
                            <button class="btn btn-danger" id="findClearBtn">🗑️ 清空</button>
                        </div>
                    </div>
                </div>
                <div class="find-result-section">
                    <div id="findResultEmpty" class="find-result-empty">
                        <div class="empty-icon">🔍</div>
                        <div data-i18n="findMode.waitingForResult">等待识别结果...</div>
                    </div>
                    <div id="findResultContainer" class="find-result-container">
                        <div class="find-result-image">
                            <img id="findResultImage" alt="Result">
                            <canvas id="findResultCanvas"></canvas>
                        </div>
                        <div id="findResultStats" class="find-result-stats"></div>
                        <div id="findMatchesList" class="find-matches-list">
                            <h3 data-i18n="findMode.matches">匹配项:</h3>
                            <div id="findMatchesContent"></div>
                        </div>
                        <div class="find-result-text">
                            <h3 data-i18n="findMode.recognizedText">识别文本:</h3>
                            <div id="findResultText" class="result-text"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Logs Section -->
        <section class="logs-section active" id="logSection">
            <div class="logs-container">
                <div class="logs-header">
                    <h2 class="logs-title">
                        <span data-i18n="logs.title">操作日志</span>
                        (<span id="logCount">0</span>)
                    </h2>
                    <div class="logs-controls">
                        <button class="btn btn-secondary" onclick="document.getElementById('logContent').innerHTML='';document.getElementById('logCount').textContent='0';" data-i18n="logs.clear">清空</button>
                    </div>
                </div>
                <div class="logs-list" id="logContent"></div>
            </div>
        </section>
    `;

    const footerHTML = `
        <div style="max-width: 1200px; margin: 0 auto;">
            <!-- GitHub Star Banner -->
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; padding: 30px 50px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2)); border: 2px solid rgba(255,255,255,0.2); border-radius: 16px; backdrop-filter: blur(10px);">
                    <div style="font-size: 1.5em; font-weight: 700; color: white; margin-bottom: 15px;" data-i18n="github.bannerTitle">
                        ⭐ 喜欢这个项目？给我们一个 Star！⭐
                    </div>
                    <div style="font-size: 1em; color: rgba(255,255,255,0.8); margin-bottom: 20px;" data-i18n="github.bannerDesc">
                        如果这个项目对你有帮助，请在 GitHub 上给我们一个 Star 支持一下！
                    </div>
                    <a href="https://github.com/neosun100/DeepSeek-OCR-WebUI" target="_blank" rel="noopener noreferrer"
                       style="display: inline-flex; align-items: center; gap: 12px; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 12px; color: white; text-decoration: none; font-size: 1.1em; font-weight: 600; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); transition: all 0.3s ease;">
                        <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                        <span data-i18n="github.bannerButton">⭐ 在 GitHub 上给我们 Star</span>
                    </a>
                </div>
            </div>
            <div style="text-align: center; color: rgba(255,255,255,0.6); font-size: 0.9em; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <p style="margin: 5px 0;">
                    <span data-i18n="github.madeWith">Made with ❤️ by</span> <a href="https://github.com/neosun100" target="_blank" style="color: rgba(255,255,255,0.8); text-decoration: none;">@neosun100</a>
                </p>
                <p style="margin: 5px 0;">
                    DeepSeek-OCR-WebUI v3.3.3 | © 2025 | MIT License
                </p>
            </div>
        </div>
    `;

    return { headerHTML, mainContentHTML, footerHTML };
}

function injectHTML() {
    const { headerHTML, mainContentHTML, footerHTML } = generateHTML();
    document.getElementById('header').innerHTML = headerHTML;
    document.getElementById('mainContent').innerHTML = mainContentHTML;
    document.getElementById('footer').innerHTML = footerHTML;
}
