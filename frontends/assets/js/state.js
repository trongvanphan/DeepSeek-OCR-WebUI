// ====================================
// Application State
// ====================================

// Main application state
const state = {
    mode: 'document',
    images: [],
    results: [],
    isProcessing: false,
    singleImage: null  // For Find mode single image
};

// Find mode specific state
const findState = {
    image: null,
    imageData: null,
    processing: false
};

// Advanced Settings State
const advancedSettings = {
    baseSize: 1024,
    imageSize: 640,
    cropMode: true,
    includeCaption: false
};

// Current view state for HTML rendering
let currentView = 'formatted';
let currentResultData = { text: '', rawText: '', hasHTML: false };
