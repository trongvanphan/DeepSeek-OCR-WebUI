// ====================================
// Internationalization (i18n)
// ====================================

const translations = {
    'zh-CN': {
        // Header
        headerSubtitle: '智能图像识别 · 批量处理 · 多模式支持',
        
        // Mode selection
        modeTitle: '选择识别模式（增强版：新增 Find 和 Freeform）',
        modes: {
            document: '文档转Markdown',
            ocr: '通用OCR',
            free: '纯文本提取',
            figure: '图表解析',
            describe: '图像描述',
            find: '查找定位',
            freeform: '自定义提示'
        },
        
        // Find Mode
        findMode: {
            title: '查找定位',
            uploadText: '点击或拖拽上传图片',
            uploadHint: '支持 JPG, PNG, JPEG, BMP, GIF',
            inputLabel: '输入查找内容',
            inputPlaceholder: '例如：Total, Invoice #, 金额, 姓名',
            inputHint: '输入图片中需要查找的文字，系统会自动定位并标注',
            btnProcess: '开始查找',
            btnChange: '更换图片',
            btnClear: '清空重置',
            resultTitle: '识别结果',
            emptyText: '等待识别',
            emptyHint: '上传图片并输入查找词，点击"开始查找"即可',
            matchesTitle: '找到的匹配项',
            statsFound: '找到',
            statsItems: '个匹配项',
            searchTerm: '查找词:',
            noMatch: '未找到匹配项'
        },
        
        // Batch Mode
        batchMode: {
            freeformLabel: '自定义提示词',
            freeformPlaceholder: '输入自定义提示词（如：提取所有日期和金额）',
            freeformHint: '描述你想要的识别效果，AI 会按照你的要求处理每张图片',
            uploadTitle: '上传图片',
            uploadText: '点击或拖拽上传图片',
            uploadHint: '支持批量上传多张图片',
            imagesTitle: '已上传图片',
            imagesDragHint: '拖动图片可调整顺序',
            btnProcess: '开始识别',
            btnAddMore: '继续添加',
            btnClear: '清空全部',
            progressTitle: '识别进度',
            processed: '已处理:',
            total: '总计:',
            resultTitle: '识别结果',
            btnCopy: '复制文本',
            btnDownload: '下载文本',
            logTitle: '操作日志',
            logCount: '共',
            logRecords: '条记录'
        },
        
        // Toast messages
        toast: {
            uploadSuccess: '上传成功',
            uploadError: '上传失败',
            copySuccess: '已复制到剪贴板',
            copyError: '复制失败',
            clearSuccess: '已清空',
            processing: '处理中...',
            completed: '识别完成'
        },
        
        // GitHub & Footer
        github: {
            starButton: '⭐ Star on GitHub',
            bannerTitle: '⭐ 喜欢这个项目？给我们一个 Star！⭐',
            bannerDesc: '如果这个项目对你有帮助，请在 GitHub 上给我们一个 Star 支持一下！',
            bannerButton: '⭐ 在 GitHub 上给我们 Star',
            linkHome: '🏠 项目主页',
            linkIssues: '🐛 问题反馈',
            linkDocs: '📖 使用文档',
            linkChangelog: '📝 更新日志',
            madeWith: 'Made with ❤️ by',
            poweredBy: 'Powered by DeepSeek-OCR'
        },
        
        // Log messages
        logMessages: {
            'systemInit': '系统初始化',
            'modeSwitch': '切换模式',
            'modeChanged': '切换识别模式',
            'uploadFailed': '文件上传失败',
            'filesIgnored': '部分文件已忽略',
            'uploadStarted': '开始上传图片',
            'uploadComplete': '图片上传完成',
            'imageLoadFailed': '图片加载失败',
            'pdfConversionStarted': 'PDF 转换开始',
            'pdfConverting': 'PDF 转换进度',
            'pdfConversionComplete': 'PDF 转换完成',
            'pdfConversionFailed': 'PDF 转换失败',
            'dragStarted': '开始拖动图片',
            'orderChanged': '图片顺序已调整',
            'imageUploaded': '图片上传成功',
            'imagesCleared': '清空图片',
            'cannotStart': '无法开始识别',
            'batchRecognitionStarted': '开始批量识别',
            'processingImage': '识别图片',
            'recognitionSuccess': '✓ 识别成功',
            'recognitionFailed': '✗ 识别失败',
            'batchComplete': '批量识别完成',
            'findStarted': '开始查找定位',
            'findSuccess': '✓ 查找定位成功',
            'findComplete': '查找完成',
            'findFailed': '✗ 查找失败',
            'copyFailed': '复制操作失败',
            'copiedToClipboard': '复制到剪贴板',
            'downloadFailed': '下载操作失败',
            'downloaded': '下载识别结果',
            'queueCleared': '清空队列',
            'formatNotSupported': '文件格式不支持',
            'pdfConverted': 'PDF 转换成功',
            'findModeReset': '重置 Find 模式'
        },
        
        // Log types
        logTypes: {
            'info': '信息',
            'success': '成功',
            'warning': '警告',
            'error': '错误'
        }
    },
    
    'zh-TW': {
        headerSubtitle: '智能圖像識別 · 批量處理 · 多模式支援',
        modeTitle: '選擇識別模式（增強版：新增 Find 和 Freeform）',
        modes: {
            document: '文檔轉Markdown',
            ocr: '通用OCR',
            free: '純文本提取',
            figure: '圖表解析',
            describe: '圖像描述',
            find: '查找定位',
            freeform: '自定義提示'
        },
        findMode: {
            title: '查找定位',
            uploadText: '點擊或拖拽上傳圖片',
            uploadHint: '支援 JPG, PNG, JPEG, BMP, GIF',
            inputLabel: '輸入查找內容',
            inputPlaceholder: '例如：Total, Invoice #, 金額, 姓名',
            inputHint: '輸入圖片中需要查找的文字，系統會自動定位並標註',
            btnProcess: '開始查找',
            btnChange: '更換圖片',
            btnClear: '清空重置',
            resultTitle: '識別結果',
            emptyText: '等待識別',
            emptyHint: '上傳圖片並輸入查找詞，點擊"開始查找"即可',
            matchesTitle: '找到的匹配項',
            statsFound: '找到',
            statsItems: '個匹配項',
            searchTerm: '查找詞:',
            noMatch: '未找到匹配項'
        },
        batchMode: {
            freeformLabel: '自定義提示詞',
            freeformPlaceholder: '輸入自定義提示詞（如：提取所有日期和金額）',
            freeformHint: '描述你想要的識別效果，AI 會按照你的要求處理每張圖片',
            uploadTitle: '上傳圖片',
            uploadText: '點擊或拖拽上傳圖片',
            uploadHint: '支援批量上傳多張圖片',
            imagesTitle: '已上傳圖片',
            imagesDragHint: '拖動圖片可調整順序',
            btnProcess: '開始識別',
            btnAddMore: '繼續添加',
            btnClear: '清空全部',
            progressTitle: '識別進度',
            processed: '已處理:',
            total: '總計:',
            resultTitle: '識別結果',
            btnCopy: '複製文本',
            btnDownload: '下載文本',
            logTitle: '操作日誌',
            logCount: '共',
            logRecords: '條記錄'
        },
        toast: {
            uploadSuccess: '上傳成功',
            uploadError: '上傳失敗',
            copySuccess: '已複製到剪貼板',
            copyError: '複製失敗',
            clearSuccess: '已清空',
            processing: '處理中...',
            completed: '識別完成'
        },
        
        github: {
            starButton: '⭐ Star on GitHub',
            bannerTitle: '⭐ 喜歡這個項目？給我們一個 Star！⭐',
            bannerDesc: '如果這個項目對你有幫助，請在 GitHub 上給我們一個 Star 支持一下！',
            bannerButton: '⭐ 在 GitHub 上給我們 Star',
            linkHome: '🏠 項目主頁',
            linkIssues: '🐛 問題反饋',
            linkDocs: '📖 使用文檔',
            linkChangelog: '📝 更新日誌',
            madeWith: 'Made with ❤️ by',
            poweredBy: 'Powered by DeepSeek-OCR'
        },
        
        // Log messages
        logMessages: {
            'systemInit': '系統初始化',
            'modeSwitch': '切換模式',
            'modeChanged': '切換識別模式',
            'uploadFailed': '文件上傳失敗',
            'filesIgnored': '部分文件已忽略',
            'uploadStarted': '開始上傳圖片',
            'uploadComplete': '圖片上傳完成',
            'imageLoadFailed': '圖片加載失敗',
            'pdfConversionStarted': 'PDF 轉換開始',
            'pdfConverting': 'PDF 轉換進度',
            'pdfConversionComplete': 'PDF 轉換完成',
            'pdfConversionFailed': 'PDF 轉換失敗',
            'dragStarted': '開始拖動圖片',
            'orderChanged': '圖片順序已調整',
            'imageUploaded': '圖片上傳成功',
            'imagesCleared': '清空圖片',
            'cannotStart': '無法開始識別',
            'batchRecognitionStarted': '開始批量識別',
            'processingImage': '識別圖片',
            'recognitionSuccess': '✓ 識別成功',
            'recognitionFailed': '✗ 識別失敗',
            'batchComplete': '批量識別完成',
            'findStarted': '開始查找定位',
            'findSuccess': '✓ 查找定位成功',
            'findComplete': '查找完成',
            'findFailed': '✗ 查找失敗',
            'copyFailed': '複製操作失敗',
            'copiedToClipboard': '複製到剪貼板',
            'downloadFailed': '下載操作失敗',
            'downloaded': '下載識別結果',
            'queueCleared': '清空隊列',
            'formatNotSupported': '文件格式不支持',
            'pdfConverted': 'PDF 轉換成功',
            'findModeReset': '重置 Find 模式'
        },
        
        // Log types
        logTypes: {
            'info': '信息',
            'success': '成功',
            'warning': '警告',
            'error': '錯誤'
        }
    },
    
    'en-US': {
        headerSubtitle: 'Intelligent Image Recognition · Batch Processing · Multi-Mode Support',
        modeTitle: 'Select Recognition Mode (Enhanced: New Find & Freeform)',
        modes: {
            document: 'Doc to Markdown',
            ocr: 'General OCR',
            free: 'Plain Text',
            figure: 'Chart Parser',
            describe: 'Image Description',
            find: 'Find & Locate',
            freeform: 'Custom Prompt'
        },
        findMode: {
            title: 'Find & Locate',
            uploadText: 'Click or drag to upload image',
            uploadHint: 'Support JPG, PNG, JPEG, BMP, GIF',
            inputLabel: 'Enter search term',
            inputPlaceholder: 'e.g.: Total, Invoice #, Amount, Name',
            inputHint: 'Enter text to find in image, system will locate automatically',
            btnProcess: 'Start Search',
            btnChange: 'Change Image',
            btnClear: 'Clear & Reset',
            resultTitle: 'Recognition Result',
            emptyText: 'Waiting',
            emptyHint: 'Upload image and enter search term, then click "Start Search"',
            matchesTitle: 'Found Matches',
            statsFound: 'Found',
            statsItems: 'matches',
            searchTerm: 'Search term:',
            noMatch: 'No matches found'
        },
        batchMode: {
            freeformLabel: 'Custom Prompt',
            freeformPlaceholder: 'Enter custom prompt (e.g.: Extract all dates and amounts)',
            freeformHint: 'Describe what you want, AI will process each image accordingly',
            uploadTitle: 'Upload Images',
            uploadText: 'Click or drag to upload images',
            uploadHint: 'Support batch upload',
            imagesTitle: 'Uploaded Images',
            imagesDragHint: 'Drag to reorder',
            btnProcess: 'Start Recognition',
            btnAddMore: 'Add More',
            btnClear: 'Clear All',
            progressTitle: 'Progress',
            processed: 'Processed:',
            total: 'Total:',
            resultTitle: 'Result',
            btnCopy: 'Copy Text',
            btnDownload: 'Download',
            logTitle: 'Operation Log',
            logCount: 'Total',
            logRecords: 'records'
        },
        toast: {
            uploadSuccess: 'Upload successful',
            uploadError: 'Upload failed',
            copySuccess: 'Copied to clipboard',
            copyError: 'Copy failed',
            clearSuccess: 'Cleared',
            processing: 'Processing...',
            completed: 'Completed'
        },
        
        github: {
            starButton: '⭐ Star on GitHub',
            bannerTitle: '⭐ Like this project? Give us a Star! ⭐',
            bannerDesc: 'If this project helps you, please give us a Star on GitHub to show your support!',
            bannerButton: '⭐ Star us on GitHub',
            linkHome: '🏠 Home',
            linkIssues: '🐛 Issues',
            linkDocs: '📖 Documentation',
            linkChangelog: '📝 Changelog',
            madeWith: 'Made with ❤️ by',
            poweredBy: 'Powered by DeepSeek-OCR'
        },
        
        // Log messages
        logMessages: {
            'systemInit': 'System Init',
            'modeSwitch': 'Mode Switch',
            'modeChanged': 'Mode Changed',
            'uploadFailed': 'Upload Failed',
            'filesIgnored': 'Files Ignored',
            'uploadStarted': 'Upload Started',
            'uploadComplete': 'Upload Complete',
            'imageLoadFailed': 'Image Load Failed',
            'pdfConversionStarted': 'PDF Conversion Started',
            'pdfConverting': 'PDF Converting',
            'pdfConversionComplete': 'PDF Conversion Complete',
            'pdfConversionFailed': 'PDF Conversion Failed',
            'dragStarted': 'Drag Started',
            'orderChanged': 'Order Changed',
            'imageUploaded': 'Image Uploaded',
            'imagesCleared': 'Images Cleared',
            'cannotStart': 'Cannot Start',
            'batchRecognitionStarted': 'Batch Recognition Started',
            'processingImage': 'Processing Image',
            'recognitionSuccess': '✓ Success',
            'recognitionFailed': '✗ Failed',
            'batchComplete': 'Batch Complete',
            'findStarted': 'Find Started',
            'findSuccess': '✓ Find Success',
            'findComplete': 'Find Complete',
            'findFailed': '✗ Find Failed',
            'copyFailed': 'Copy Failed',
            'copiedToClipboard': 'Copied to Clipboard',
            'downloadFailed': 'Download Failed',
            'downloaded': 'Downloaded',
            'queueCleared': 'Queue Cleared',
            'formatNotSupported': 'Format Not Supported',
            'pdfConverted': 'PDF Converted',
            'findModeReset': 'Find Mode Reset'
        },
        
        // Log types
        logTypes: {
            'info': 'INFO',
            'success': 'SUCCESS',
            'warning': 'WARNING',
            'error': 'ERROR'
        }
    },
    
    'en-US': {
        // Header
        headerSubtitle: 'Intelligent Image Recognition · Batch Processing · Multi-Mode Support',
        
        // Mode selection
        modeTitle: 'Select Recognition Mode (Enhanced: Find & Freeform Added)',
        modes: {
            document: 'Document to Markdown',
            ocr: 'General OCR',
            free: 'Plain Text Extraction',
            figure: 'Chart Analysis',
            describe: 'Image Description',
            find: 'Find & Locate',
            freeform: 'Custom Prompt'
        },
        
        // Find Mode
        findMode: {
            title: 'Find & Locate',
            uploadText: 'Click or drag to upload image',
            uploadHint: 'Supports JPG, PNG, JPEG, BMP, GIF',
            inputLabel: 'Enter search term',
            inputPlaceholder: 'e.g.: Total, Invoice #, Amount, Name',
            inputHint: 'Enter the text you want to find in the image, the system will automatically locate it',
            btnProcess: 'Start Search',
            btnChange: 'Change Image',
            btnClear: 'Clear & Reset',
            resultTitle: 'Recognition Results',
            emptyText: 'Waiting for recognition',
            emptyHint: 'Upload an image and enter a search term, then click "Start Search"',
            matchesTitle: 'Matches Found',
            statsFound: 'Found',
            statsItems: 'matches',
            searchTerm: 'Search term:',
            noMatch: 'No matches found'
        },
        
        // Batch Mode
        batchMode: {
            freeformLabel: 'Custom Prompt',
            freeformPlaceholder: 'Enter custom prompt (e.g.: Extract all dates and amounts)',
            freeformHint: 'Describe the recognition effect you want, AI will process each image according to your requirements',
            uploadTitle: 'Upload Images',
            uploadText: 'Click or drag to upload images',
            uploadHint: 'Supports batch upload of multiple images',
            imagesTitle: 'Uploaded Images',
            imagesDragHint: 'Drag to adjust order',
            btnProcess: 'Start Recognition',
            btnAddMore: 'Add More',
            btnClear: 'Clear All',
            progressTitle: 'Recognition Progress',
            processed: 'Processed:',
            total: 'Total:',
            resultTitle: 'Recognition Results',
            btnCopy: 'Copy Text',
            btnDownload: 'Download',
            logTitle: 'Operation Log',
            logCount: 'Total',
            logRecords: 'records'
        },
        toast: {
            uploadSuccess: 'Upload successful',
            uploadError: 'Upload failed',
            copySuccess: 'Copied to clipboard',
            copyError: 'Copy failed',
            clearSuccess: 'Cleared',
            processing: 'Processing...',
            completed: 'Recognition completed'
        },
        
        github: {
            starButton: '⭐ Star on GitHub',
            bannerTitle: '⭐ Like this project? Give it a star! ⭐',
            bannerDesc: 'If this project is helpful to you, please support us by giving it a star on GitHub!',
            bannerButton: '⭐ Star on GitHub',
            linkHome: '🏠 Home',
            linkIssues: '🐛 Report Issue',
            linkDocs: '📖 Documentation',
            linkChangelog: '📝 Changelog',
            madeWith: 'Made with ❤️ by',
            poweredBy: 'Powered by DeepSeek-OCR'
        },
        
        // Log messages
        logMessages: {
            'systemInit': 'System Init',
            'modeSwitch': 'Mode Switch',
            'modeChanged': 'Mode Changed',
            'uploadFailed': 'Upload Failed',
            'filesIgnored': 'Files Ignored',
            'uploadStarted': 'Upload Started',
            'uploadComplete': 'Upload Complete',
            'imageLoadFailed': 'Image Load Failed',
            'pdfConversionStarted': 'PDF Conversion Started',
            'pdfConverting': 'PDF Converting',
            'pdfConversionComplete': 'PDF Conversion Complete',
            'pdfConversionFailed': 'PDF Conversion Failed',
            'dragStarted': 'Drag Started',
            'orderChanged': 'Order Changed',
            'imageUploaded': 'Image Uploaded',
            'imagesCleared': 'Images Cleared',
            'cannotStart': 'Cannot Start',
            'batchRecognitionStarted': 'Batch Recognition Started',
            'processingImage': 'Processing Image',
            'recognitionSuccess': '✓ Success',
            'recognitionFailed': '✗ Failed',
            'batchComplete': 'Batch Complete',
            'findStarted': 'Find Started',
            'findSuccess': '✓ Find Success',
            'findComplete': 'Find Complete',
            'findFailed': '✗ Find Failed',
            'copyFailed': 'Copy Failed',
            'copiedToClipboard': 'Copied to Clipboard',
            'downloadFailed': 'Download Failed',
            'downloaded': 'Downloaded',
            'queueCleared': 'Queue Cleared',
            'formatNotSupported': 'Format Not Supported',
            'pdfConverted': 'PDF Converted',
            'findModeReset': 'Find Mode Reset'
        },
        
        // Log types
        logTypes: {
            'info': 'INFO',
            'success': 'SUCCESS',
            'warning': 'WARNING',
            'error': 'ERROR'
        }
    },
    
    'ja-JP': {
        headerSubtitle: 'インテリジェント画像認識 · バッチ処理 · マルチモードサポート',
        modeTitle: '認識モードを選択（拡張版：Find と Freeform を追加）',
        modes: {
            document: 'ドキュメントをMarkdownへ',
            ocr: '汎用OCR',
            free: 'プレーンテキスト抽出',
            figure: 'チャート解析',
            describe: '画像説明',
            find: '検索と位置特定',
            freeform: 'カスタムプロンプト'
        },
        findMode: {
            title: '検索と位置特定',
            uploadText: 'クリックまたはドラッグして画像をアップロード',
            uploadHint: 'JPG, PNG, JPEG, BMP, GIF をサポート',
            inputLabel: '検索内容を入力',
            inputPlaceholder: '例：Total, Invoice #, 金額, 名前',
            inputHint: '画像内で検索したいテキストを入力すると、システムが自動的に位置を特定します',
            btnProcess: '検索開始',
            btnChange: '画像を変更',
            btnClear: 'クリアしてリセット',
            resultTitle: '認識結果',
            emptyText: '認識待ち',
            emptyHint: '画像をアップロードして検索語を入力し、「検索開始」をクリックしてください',
            matchesTitle: '見つかった一致項目',
            statsFound: '見つかりました',
            statsItems: '件',
            searchTerm: '検索語:',
            noMatch: '一致項目が見つかりませんでした'
        },
        batchMode: {
            freeformLabel: 'カスタムプロンプト',
            freeformPlaceholder: 'カスタムプロンプトを入力（例：すべての日付と金額を抽出）',
            freeformHint: '希望する認識効果を説明すると、AIが要求に応じて各画像を処理します',
            uploadTitle: '画像をアップロード',
            uploadText: 'クリックまたはドラッグして画像をアップロード',
            uploadHint: '一括アップロードをサポート',
            imagesTitle: 'アップロード済み画像',
            imagesDragHint: 'ドラッグして順序を調整',
            btnProcess: '認識開始',
            btnAddMore: 'さらに追加',
            btnClear: 'すべてクリア',
            progressTitle: '認識進捗',
            processed: '処理済み:',
            total: '合計:',
            resultTitle: '認識結果',
            btnCopy: 'テキストをコピー',
            btnDownload: 'ダウンロード',
            logTitle: '操作ログ',
            logCount: '合計',
            logRecords: '件の記録'
        },
        toast: {
            uploadSuccess: 'アップロード成功',
            uploadError: 'アップロード失敗',
            copySuccess: 'クリップボードにコピーしました',
            copyError: 'コピー失敗',
            clearSuccess: 'クリアしました',
            processing: '処理中...',
            completed: '認識完了'
        },
        
        github: {
            starButton: '⭐ Star on GitHub',
            bannerTitle: '⭐ このプロジェクトが気に入りましたか？Starをください！⭐',
            bannerDesc: 'このプロジェクトがお役に立ちましたら、GitHubでStarをつけてサポートしてください！',
            bannerButton: '⭐ GitHubでStarをつける',
            linkHome: '🏠 ホーム',
            linkIssues: '🐛 問題報告',
            linkDocs: '📖 ドキュメント',
            linkChangelog: '📝 更新履歴',
            madeWith: 'Made with ❤️ by',
            poweredBy: 'Powered by DeepSeek-OCR'
        },
        
        // Log messages
        logMessages: {
            'systemInit': 'システム初期化',
            'modeSwitch': 'モード切替',
            'modeChanged': '認識モードを切替',
            'uploadFailed': 'ファイルアップロード失敗',
            'filesIgnored': '一部のファイルを無視',
            'uploadStarted': '画像アップロード開始',
            'uploadComplete': '画像アップロード完了',
            'imageLoadFailed': '画像読込失敗',
            'pdfConversionStarted': 'PDF変換開始',
            'pdfConverting': 'PDF変換進行中',
            'pdfConversionComplete': 'PDF変換完了',
            'pdfConversionFailed': 'PDF変換失敗',
            'dragStarted': '画像ドラッグ開始',
            'orderChanged': '画像順序を調整',
            'imageUploaded': '画像アップロード成功',
            'imagesCleared': '画像をクリア',
            'cannotStart': '認識を開始できません',
            'batchRecognitionStarted': 'バッチ認識開始',
            'processingImage': '画像認識中',
            'recognitionSuccess': '✓ 認識成功',
            'recognitionFailed': '✗ 認識失敗',
            'batchComplete': 'バッチ認識完了',
            'findStarted': '検索定位開始',
            'findSuccess': '✓ 検索定位成功',
            'findComplete': '検索完了',
            'findFailed': '✗ 検索失敗',
            'copyFailed': 'コピー操作失敗',
            'copiedToClipboard': 'クリップボードにコピー',
            'downloadFailed': 'ダウンロード操作失敗',
            'downloaded': '認識結果をダウンロード',
            'queueCleared': 'キューをクリア',
            'formatNotSupported': 'ファイル形式非サポート',
            'pdfConverted': 'PDF変換成功',
            'findModeReset': 'Findモードをリセット'
        },
        
        // Log types
        logTypes: {
            'info': '情報',
            'success': '成功',
            'warning': '警告',
            'error': 'エラー'
        }
    }
};

// Current language
let currentLang = localStorage.getItem('ocr_language') || 'zh-CN';

// Get translation
function t(path) {
    const keys = path.split('.');
    let value = translations[currentLang];
    for (const key of keys) {
        value = value?.[key];
        if (value === undefined) {
            console.warn(`Translation missing: ${path} for ${currentLang}`);
            return path;
        }
    }
    return value;
}

// Switch language
function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('ocr_language', lang);
    updateUILanguage();
}

// Update all UI text
function updateUILanguage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        if (translation) {
            el.textContent = translation;
        }
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const translation = t(key);
        if (translation) {
            el.placeholder = translation;
        }
    });
    
    // Update titles
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        const translation = t(key);
        if (translation) {
            el.title = translation;
        }
    });
    
    // Update language switcher
    const switcher = document.getElementById('languageSwitcher');
    if (switcher) {
        switcher.value = currentLang;
    }
}

// Initialize i18n on page load
function initI18n() {
    // Set language switcher
    const switcher = document.getElementById('languageSwitcher');
    if (switcher) {
        switcher.value = currentLang;
        switcher.addEventListener('change', (e) => {
            switchLanguage(e.target.value);
        });
    }
    
    // Initial update
    updateUILanguage();
}

// Export for use in HTML
window.i18n = {
    t,
    switchLanguage,
    updateUILanguage,
    initI18n,
    getCurrentLang: () => currentLang
};
