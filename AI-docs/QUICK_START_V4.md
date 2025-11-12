# 🚀 Quick Start Guide - DeepSeek-OCR-WebUI v4.0

## What's New in v4.0

✨ **Advanced Settings Panel** - Fine-tune processing parameters  
🎨 **HTML Rendering** - Beautiful table rendering from OCR output  
✅ **Validation System** - Parameter range checking  
🌍 **Full i18n Support** - 4 languages (中文/繁體/English/日本語)  
💾 **Settings Persistence** - Your preferences are saved

---

## Installation

### 1. Install Dependencies
```bash
# Standard installation
pip install -r requirements.txt

# macOS with Apple Silicon
pip install -r requirements-mac.txt
```

### 2. Optional Configuration
```bash
# Copy environment template (optional - good defaults provided)
cp .env.example .env

# Edit if needed
nano .env
```

### 3. Start Server
```bash
python web_service_unified.py
```

### 4. Open Browser
```
http://localhost:8001
```

---

## Using Advanced Settings

### 1. Open Advanced Settings
Click the **⚙️ 高级设置** panel below the mode selection.

### 2. Adjust Parameters

**Base Size (基础分辨率)**: 512 - 2048
- Lower = Faster processing
- Higher = Better quality
- Default: 1024 (recommended)

**Image Size (切片大小)**: 224 - 1280
- Lower = Less memory
- Higher = More detail
- Default: 640 (recommended)

**Crop Mode (裁剪模式)**
- ✅ ON = Better for complex layouts (recommended)
- ❌ OFF = Faster for simple images

**Include Caption (包含描述)**
- ✅ ON = Add image description to output
- ❌ OFF = Text-only output (default)

### 3. Reset to Defaults
Click **重置默认值** button to restore optimal settings.

---

## HTML Rendering

### When to Use
- Processing invoices with tables
- Documents with structured data
- Receipts with line items

### How to Use
1. Upload image with table
2. Select "文档转Markdown" or "图表解析" mode
3. Process image
4. If HTML detected, view toggle appears
5. Click **HTML 渲染** to see styled table

### View Options
- **格式化** (Formatted): Clean text output
- **原始文本** (Raw): Text with markers
- **HTML 渲染** (HTML): Styled table view

---

## Parameter Recommendations

### Fast Processing (Low Resources)
```
Base Size: 512
Image Size: 320
Crop Mode: OFF
Include Caption: OFF
```

### Balanced (Default - Recommended)
```
Base Size: 1024
Image Size: 640
Crop Mode: ON
Include Caption: OFF
```

### High Quality (Slow, Best Results)
```
Base Size: 2048
Image Size: 1024
Crop Mode: ON
Include Caption: ON
```

### Low Memory Devices
```
Base Size: 512
Image Size: 224
Crop Mode: OFF
Include Caption: OFF
```

---

## Validation Errors

### "Base Size must be between 512 and 2048"
- Your base_size is out of range
- Adjust the slider to valid range

### "Image Size must be between 224 and 1280"
- Your image_size is out of range
- Adjust the slider to valid range

### Solution
Click **重置默认值** (Reset to Defaults) to restore working settings.

---

## Language Switching

### Supported Languages
- 🇨🇳 简体中文 (Simplified Chinese)
- 🇹🇼 繁體中文 (Traditional Chinese)
- 🇺🇸 English
- 🇯🇵 日本語 (Japanese)

### How to Switch
Use the language dropdown in the top-right corner of the page.

All UI elements, including advanced settings and view toggles, will update automatically.

---

## API Usage

### Basic Request
```bash
curl -X POST http://localhost:8001/ocr \
  -F "file=@image.jpg" \
  -F "prompt_type=document"
```

### With Advanced Settings
```bash
curl -X POST http://localhost:8001/ocr \
  -F "file=@image.jpg" \
  -F "prompt_type=document" \
  -F "base_size=2048" \
  -F "image_size=1024" \
  -F "crop_mode=true" \
  -F "include_caption=true"
```

### Response
```json
{
  "success": true,
  "text": "Cleaned text...",
  "raw_text": "Raw text with markers...",
  "boxes": [...],
  "image_dims": {"w": 1920, "h": 1080},
  "prompt_type": "document",
  "metadata": {
    "mode": "document",
    "backend": "mps",
    "has_boxes": false
  }
}
```

---

## Tips & Tricks

### 1. Settings Persistence
Your advanced settings are automatically saved in your browser. They'll be restored when you return.

### 2. Batch Processing
Advanced settings apply to ALL images in batch mode. Set them before clicking "开始识别".

### 3. Find Mode
Advanced settings work in Find mode too. Higher settings = better bounding box accuracy.

### 4. Caption Generation
Enable "Include Caption" for document analysis tasks that need context understanding.

### 5. Memory Management
If processing fails due to memory:
1. Reduce Base Size to 512
2. Reduce Image Size to 320
3. Turn OFF Crop Mode

---

## Troubleshooting

### Problem: Settings not saving
**Solution**: Check browser localStorage is enabled. Try incognito mode to test.

### Problem: View toggle not appearing
**Solution**: The output doesn't contain HTML. Only tables/structured data show HTML.

### Problem: Validation errors on every try
**Solution**: Click "重置默认值" to restore factory settings.

### Problem: Processing too slow
**Solution**: Lower Base Size to 512, reduce Image Size to 320.

### Problem: Poor quality results
**Solution**: Increase Base Size to 2048, enable Crop Mode.

---

## Performance Guide

### Processing Time (estimates)
| Settings | Time per Image | Quality |
|----------|---------------|---------|
| Fast (512/320) | 5-10s | Good |
| Balanced (1024/640) | 10-20s | Very Good |
| High (2048/1024) | 20-40s | Excellent |

### Memory Usage
| Settings | RAM Required | VRAM (GPU) |
|----------|-------------|------------|
| Fast | ~2GB | ~4GB |
| Balanced | ~4GB | ~6GB |
| High | ~8GB | ~10GB |

### Recommendations by Hardware
- **MacBook Air M1**: Balanced (1024/640)
- **MacBook Pro M1/M2**: High (2048/1024)
- **NVIDIA RTX 3060**: High (2048/1024)
- **NVIDIA RTX 4090**: High (2048/1280)
- **CPU Only**: Fast (512/320)

---

## Getting Help

### Documentation
- **FULL_IMPLEMENTATION_COMPLETE.md** - Complete feature documentation
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details
- **TASKS.md** - Development tasks and progress
- **README.md** - General project information

### Issues
Report bugs or request features:
https://github.com/neosun100/DeepSeek-OCR-WebUI/issues

### Community
Join discussions and get help from other users.

---

## Summary

✅ **Installation**: `pip install -r requirements.txt`  
✅ **Start**: `python web_service_unified.py`  
✅ **Access**: http://localhost:8001  
✅ **Configure**: Click ⚙️ Advanced Settings  
✅ **Process**: Upload, adjust settings, recognize  
✅ **View**: Switch between Formatted/Raw/HTML  

**Enjoy the enhanced DeepSeek-OCR-WebUI! 🎉**

---

*Last Updated: November 11, 2025*  
*Version: 4.0*  
*Features: Advanced Settings | HTML Rendering | Validation | i18n*
