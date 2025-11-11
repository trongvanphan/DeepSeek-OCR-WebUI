# Implementation Tasks - DeepSeek-OCR-WebUI Improvements

Based on analysis of https://github.com/rdumasia303/deepseek_ocr_app

## Task Overview
Implementing advanced features and improvements from the reference repository to enhance user experience and functionality.

---

## ✅ Task 1: Add Advanced Settings Panel to UI
**Priority**: HIGH  
**Status**: ✅ COMPLETED

### Objectives:
- Add collapsible "Advanced Settings" section in the UI
- Expose model parameters to users for fine-tuning
- Maintain clean UI with settings hidden by default

### Parameters to Add:
- `base_size` (default: 1024) - Base processing resolution
  - Higher = better quality but slower
  - Range: 512-2048
  
- `image_size` (default: 640) - Tile size for dynamic cropping
  - Affects memory usage
  - Range: 320-1280
  
- `crop_mode` (default: true) - Enable dynamic cropping for large images
  - Checkbox toggle
  
- `include_caption` (default: false) - Add image description to output
  - Checkbox toggle

### Implementation:
1. Update `ocr_ui_modern.html`:
   - Add advanced settings section (collapsible)
   - Add sliders/inputs for numeric parameters
   - Add checkboxes for boolean parameters
   - Add info tooltips explaining each parameter
   - Use existing i18n system for labels

2. Update JavaScript:
   - Add state management for settings
   - Send settings with API requests
   - Store user preferences in localStorage

3. Update i18n translations:
   - Add translation keys for all new labels
   - Add help text for each parameter

### Files to Modify:
- `ocr_ui_modern.html` - Add UI elements
- `i18n.js` - Add translations

---

## ✅ Task 2: Add HTML Rendering Support
**Priority**: HIGH  
**Status**: ✅ COMPLETED

### Objectives:
- Properly detect and render HTML output (especially tables)
- DeepSeek-OCR outputs HTML, not Markdown
- Maintain security with proper sanitization

### Implementation:
1. Update result display logic:
   - Detect if output contains HTML tags (`<table>`, `<html>`, etc.)
   - If HTML detected, render using `innerHTML`
   - If plain text, display as-is
   - Add option to toggle between HTML and plain text view

2. Add HTML detection function:
   ```javascript
   function isHTML(str) {
     return /<[a-z][\s\S]*>/i.test(str);
   }
   ```

3. Add view toggle:
   - Button to switch between "Formatted" and "Raw" view
   - Show raw HTML for debugging

### Files to Modify:
- `ocr_ui_modern.html` - Update result rendering logic

---

## ✅ Task 3: Expose Backend Parameters to API
**Priority**: HIGH  
**Status**: ✅ COMPLETED

### Objectives:
- Add new parameters to `/ocr` endpoint
- Pass parameters to model inference
- Maintain backward compatibility

### New Parameters:
```python
base_size: int = Form(1024)
image_size: int = Form(640)
crop_mode: bool = Form(True)
include_caption: bool = Form(False)
```

### Implementation:
1. Update `web_service_unified.py`:
   - Add new Form parameters to `/ocr` endpoint
   - Update docstrings with parameter descriptions
   - Pass parameters to backend.infer()

2. Update backend modules:
   - `backends/mps_backend.py` - Add parameter support
   - `backends/cuda_backend.py` - Add parameter support
   - `backends/cpu_backend.py` - Add parameter support

3. Update build_prompt():
   - Add include_caption logic
   - Append caption instruction when enabled

### Files to Modify:
- `web_service_unified.py` - API endpoint
- `backends/mps_backend.py` - MPS inference
- `backends/cuda_backend.py` - CUDA inference
- `backends/cpu_backend.py` - CPU inference

---

## ✅ Task 4: Add python-decouple for Environment Configuration
**Priority**: MEDIUM  
**Status**: ✅ COMPLETED

### Objectives:
- Better environment variable management
- Type casting and defaults
- Cleaner configuration code

### Implementation:
1. Add python-decouple to requirements:
   ```
   python-decouple==3.8
   ```

2. Create `.env.example` file:
   ```
   PORT=8001
   MODEL_NAME=deepseek-ai/DeepSeek-OCR
   BASE_SIZE=1024
   IMAGE_SIZE=640
   CROP_MODE=true
   FORCE_BACKEND=  # Optional: mps, cuda, cpu
   ```

3. Update `web_service_unified.py`:
   - Import: `from decouple import config`
   - Replace `os.environ.get()` with `config()`
   - Add type casting where needed

### Files to Modify:
- `requirements.txt` - Add dependency
- `requirements-mac.txt` - Add dependency
- `web_service_unified.py` - Use decouple
- Create `.env.example` - Template file

---

## ✅ Task 5: Improve Prompt Building
**Priority**: MEDIUM  
**Status**: ✅ COMPLETED

### Objectives:
- Add include_caption functionality
- Better grounding logic
- More flexible prompt construction

### Implementation:
1. Update `build_prompt()` function:
   - Add `include_caption` parameter
   - Append description request when enabled
   - Improve grounding marker logic

2. Add caption support:
   ```python
   if include_caption and mode not in {"describe"}:
       instruction += " Also provide a brief image description."
   ```

3. Improve mode-specific prompts:
   - Better instructions for each mode
   - Clearer output format specifications

### Files to Modify:
- `web_service_unified.py` - build_prompt() function

---

## ✅ Task 6: Add Better Error Handling and Validation
**Priority**: MEDIUM  
**Status**: ✅ COMPLETED

### Objectives:
- Validate input parameters
- Better error messages
- User-friendly error display

### Implementation:
1. Add parameter validation:
   - Validate base_size range (512-2048)
   - Validate image_size range (320-1280)
   - Validate file size and type

2. Add validation function:
   ```python
   def validate_parameters(base_size, image_size):
       if not 512 <= base_size <= 2048:
           raise HTTPException(400, "base_size must be 512-2048")
       if not 320 <= image_size <= 1280:
           raise HTTPException(400, "image_size must be 320-1280")
   ```

3. Improve error responses:
   - Include parameter name in error
   - Suggest valid values
   - Add error codes

4. Update UI error display:
   - Show validation errors clearly
   - Add field-specific error messages

### Files to Modify:
- `web_service_unified.py` - Add validation
- `ocr_ui_modern.html` - Improve error display

---

## ✅ Task 7: Update i18n Translations for New Features
**Priority**: LOW  
**Status**: ✅ COMPLETED

### Objectives:
- Add translations for new features
- Maintain consistency across all languages

### New Translation Keys Needed:
```javascript
advancedSettings: {
  title: 'Advanced Settings',
  baseSize: 'Base Size',
  baseSizeHint: 'Base processing resolution (512-2048)',
  imageSize: 'Image Size',
  imageSizeHint: 'Tile size for cropping (320-1280)',
  cropMode: 'Crop Mode',
  cropModeHint: 'Enable dynamic cropping for large images',
  includeCaption: 'Include Caption',
  includeCaptionHint: 'Add image description to output'
},
viewToggle: {
  formatted: 'Formatted View',
  raw: 'Raw Text',
  html: 'HTML View'
}
```

### Implementation:
- Add translations for all 4 languages (zh-CN, zh-TW, en-US, ja-JP)
- Test language switching with new features

### Files to Modify:
- `i18n.js` - Add new translation keys

---

## 📋 Implementation Order

1. **Task 4** - Add python-decouple (foundation)
2. **Task 3** - Expose backend parameters (backend first)
3. **Task 5** - Improve prompt building (enhance backend)
4. **Task 7** - Update i18n translations (prepare UI)
5. **Task 1** - Add advanced settings panel (UI)
6. **Task 2** - Add HTML rendering (UI enhancement)
7. **Task 6** - Add validation (polish)

---

## Testing Checklist

After implementation:
- [ ] Test all 4 OCR modes with new parameters
- [ ] Test advanced settings panel (show/hide)
- [ ] Test HTML rendering with table images
- [ ] Test all 4 languages with new features
- [ ] Test parameter validation (invalid values)
- [ ] Test localStorage persistence
- [ ] Test on all backends (MPS/CUDA/CPU)
- [ ] Verify backward compatibility
- [ ] Test error handling
- [ ] Performance test with different settings

---

## Notes
- Maintain backward compatibility
- Keep existing functionality intact
- Follow established code patterns
- Document new features
- Update REFACTORING_SUMMARY.md after completion
