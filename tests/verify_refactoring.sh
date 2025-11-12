#!/bin/bash

# Test script to verify the refactoring changes

echo "=================================================="
echo "🧪 DeepSeek-OCR Refactoring Verification"
echo "=================================================="
echo ""

# Check if required files exist
echo "📁 Checking required files..."
files=("i18n.js" "ocr_ui_modern.html" "web_service_unified.py")
all_exist=true

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file not found"
        all_exist=false
    fi
done

echo ""

if [ "$all_exist" = false ]; then
    echo "❌ Some required files are missing. Please check your installation."
    exit 1
fi

# Check for i18n.js in HTML
echo "🔍 Checking i18n.js integration..."
if grep -q '<script src="i18n.js"></script>' ocr_ui_modern.html; then
    echo "  ✅ i18n.js is properly loaded in HTML"
else
    echo "  ⚠️  i18n.js reference not found in HTML"
fi

# Check for English translations
echo ""
echo "🌐 Checking language support..."
languages=("en-US" "zh-CN" "zh-TW" "ja-JP")
for lang in "${languages[@]}"; do
    if grep -q "'$lang':" i18n.js; then
        echo "  ✅ $lang translations found"
    else
        echo "  ❌ $lang translations missing"
    fi
done

# Check for log message translations
echo ""
echo "📝 Checking log message translations..."
if grep -q "logMessages:" i18n.js; then
    echo "  ✅ Log messages translations found"
else
    echo "  ⚠️  Log messages translations not found"
fi

# Check Python docstrings
echo ""
echo "📚 Checking Python documentation..."
if grep -q '"""' web_service_unified.py; then
    doc_count=$(grep -c '"""' web_service_unified.py)
    echo "  ✅ Found $doc_count docstring markers"
else
    echo "  ⚠️  No docstrings found"
fi

echo ""
echo "=================================================="
echo "✅ Verification complete!"
echo "=================================================="
echo ""
echo "To test the application:"
echo "  1. Start the server: python3 web_service_unified.py"
echo "  2. Open browser: http://localhost:8001"
echo "  3. Switch languages using the dropdown"
echo "  4. Upload an image and verify log messages"
echo ""
