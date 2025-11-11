# DeepSeek-OCR Enhancement Tasks
## Implementation Plan - Based on Bogdanovich77/DeekSeek-OCR---Dockerized-API Analysis

**Date:** November 11, 2025  
**Goal:** Enhance the DeepSeek-OCR-WebUI with improved features from the reference repository

---

## Task 1: Custom Prompt Support ✅
**Priority:** HIGH  
**Status:** Not Started

### Sub-tasks:
- [ ] 1.1: Add YAML configuration file for custom prompts (`custom_prompt.yaml`)
- [ ] 1.2: Update `build_prompt()` to support loading from YAML
- [ ] 1.3: Modify API endpoints to accept optional `prompt` parameter via Form
- [ ] 1.4: Update response models to include prompt information
- [ ] 1.5: Test custom prompt functionality

### Files to Modify:
- `web_service_unified.py` - Add prompt parameter to endpoints
- Create `custom_prompt.yaml` - Configuration file

### Expected Outcome:
Users can override default prompts per request or via config file

---

## Task 2: Enhanced PDF Processing ✅
**Priority:** HIGH  
**Status:** Not Started

### Sub-tasks:
- [ ] 2.1: Create enhanced response models (BatchOCRResponse with page-level status)
- [ ] 2.2: Implement image extraction from PDF pages
- [ ] 2.3: Add post-processing for special tokens and markers
- [ ] 2.4: Implement image saving functionality (output/images/)
- [ ] 2.5: Add content cleaning utilities
- [ ] 2.6: Add page split markers in output

### Files to Modify:
- `web_service_unified.py` - Enhanced PDF processing
- Create `utils/post_processor.py` - Post-processing utilities

### Expected Outcome:
Better structured PDF processing with image extraction and cleaner output

---

## Task 3: Configuration System ✅
**Priority:** MEDIUM  
**Status:** Not Started

### Sub-tasks:
- [ ] 3.1: Create `config.yaml` for global configuration
- [ ] 3.2: Add configurable default prompts for each mode
- [ ] 3.3: Add configuration loader utility
- [ ] 3.4: Support environment variable overrides
- [ ] 3.5: Document configuration options

### Files to Create:
- `config.yaml` - Main configuration file
- `utils/config_loader.py` - Configuration management

### Expected Outcome:
Centralized, flexible configuration system

---

## Task 4: Batch Processing Client Scripts ✅
**Priority:** MEDIUM  
**Status:** Not Started

### Sub-tasks:
- [ ] 4.1: Create `pdf_to_markdown_processor.py` - Basic PDF batch processor
- [ ] 4.2: Create `pdf_to_markdown_processor_enhanced.py` - With post-processing
- [ ] 4.3: Create `pdf_to_ocr_enhanced.py` - Plain OCR extraction
- [ ] 4.4: Create `pdf_to_custom_prompt.py` - Custom prompt support
- [ ] 4.5: Add output naming conventions (-MD.md, -OCR.md, -CUSTOM.md)
- [ ] 4.6: Create usage examples and documentation

### Files to Create:
- `scripts/pdf_to_markdown_processor.py`
- `scripts/pdf_to_markdown_processor_enhanced.py`
- `scripts/pdf_to_ocr_enhanced.py`
- `scripts/pdf_to_custom_prompt.py`
- `scripts/README.md` - Usage guide

### Expected Outcome:
Standalone scripts for batch PDF processing without UI

---

## Task 5: API Client Integration Examples ✅
**Priority:** LOW  
**Status:** Not Started

### Sub-tasks:
- [ ] 5.1: Create Python client class
- [ ] 5.2: Create JavaScript/Node.js client example
- [ ] 5.3: Add usage examples in documentation
- [ ] 5.4: Create test scripts for client examples

### Files to Create:
- `examples/python_client.py`
- `examples/javascript_client.js`
- `examples/README.md`

### Expected Outcome:
Easy-to-use client libraries and integration examples

---

## Task 6: Improved Error Handling & Logging ✅
**Priority:** MEDIUM  
**Status:** Not Started

### Sub-tasks:
- [ ] 6.1: Add structured logging with log levels
- [ ] 6.2: Improve error messages and status codes
- [ ] 6.3: Add request/response logging
- [ ] 6.4: Create error response models
- [ ] 6.5: Add timeout handling for long requests

### Files to Modify:
- `web_service_unified.py` - Enhanced error handling

### Expected Outcome:
Better debugging and error tracking

---

## Task 7: Performance Optimization ✅
**Priority:** MEDIUM  
**Status:** Not Started

### Sub-tasks:
- [ ] 7.1: Add request queuing for concurrent requests
- [ ] 7.2: Implement image caching for repeated requests
- [ ] 7.3: Optimize PDF to image conversion (parallel processing)
- [ ] 7.4: Add performance metrics endpoint
- [ ] 7.5: Memory usage optimization

### Files to Modify:
- `web_service_unified.py` - Performance improvements

### Expected Outcome:
Faster processing and better resource utilization

---

## Task 8: Testing & Documentation ✅
**Priority:** MEDIUM  
**Status:** Not Started

### Sub-tasks:
- [ ] 8.1: Create unit tests for core functions
- [ ] 8.2: Create integration tests for API endpoints
- [ ] 8.3: Update README with new features
- [ ] 8.4: Create API documentation examples
- [ ] 8.5: Add comparison guide (different prompts/modes)

### Files to Create:
- `tests/test_api.py`
- `tests/test_processing.py`
- Update `README.md`
- Create `docs/API_GUIDE.md`

### Expected Outcome:
Well-tested and documented codebase

---

## Implementation Order:

1. **Phase 1 (Core Features):** Tasks 1, 2
2. **Phase 2 (Configuration):** Task 3
3. **Phase 3 (Client Tools):** Tasks 4, 5
4. **Phase 4 (Optimization):** Tasks 6, 7
5. **Phase 5 (Quality):** Task 8

---

## Notes:
- Keep Docker functionality out as requested
- Maintain compatibility with existing web UI
- Ensure backward compatibility with current API
- Test each feature before moving to next task
