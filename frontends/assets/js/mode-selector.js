// ====================================
// Mode Selector
// ====================================

function setupModeSelector() {
    document.querySelectorAll('.mode-option').forEach(option => {
        option.addEventListener('click', () => {
            const oldMode = state.mode;
            const newMode = option.dataset.mode;
            
            // If same mode, do nothing
            if (oldMode === newMode) return;
            
            document.querySelectorAll('.mode-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            state.mode = newMode;
            const modeName = option.querySelector('.mode-name').textContent;
            
            // Find mode switches to dedicated UI
            const isFindMode = (newMode === 'find');
            const findContainer = document.getElementById('findModeContainer');
            const batchContainer = document.getElementById('batchModeContainer');
            
            if (isFindMode) {
                // Switch to Find dedicated UI
                findContainer.classList.add('active');
                batchContainer.classList.add('hidden');
                addLog('Mode Switch', 'info', 'Switched to Find & Locate mode (single image)', {
                    'Mode': '🔍 Find Mode',
                    'Layout': 'Split view',
                    '特性': '边界框可视化'
                });
            } else {
                // Switch back to batch processing UI
                findContainer.classList.remove('active');
                batchContainer.classList.remove('hidden');
                
                // Show/hide Freeform batch mode input
                const freeformInputBatch = document.getElementById('freeformInputBatch');
                if (freeformInputBatch) {
                    freeformInputBatch.style.display = (newMode === 'freeform') ? 'block' : 'none';
                }
                
                addLog('Mode Switch', 'info', `Switched to ${modeName} mode (batch processing)`, {
                    'Mode': modeName,
                    'Type': 'Batch processing'
                });
            }
            
            // Check if recognition is already completed
            const hasCompletedImages = state.images.some(img => img.status === 'completed' || img.status === 'error');
            
            if (hasCompletedImages) {
                // Reset all image states to pending
                const completedCount = state.images.filter(img => img.status === 'completed').length;
                const errorCount = state.images.filter(img => img.status === 'error').length;
                
                state.images.forEach(img => {
                    img.status = 'pending';
                    img.result = null;
                });
                
                // Clear previous recognition results
                state.results = [];
                
                // Hide progress and result sections
                elements.progressSection.classList.remove('active');
                elements.resultSection.classList.remove('active');
                
                // Re-render images (clear status labels)
                renderImages();
                
                // Update UI state (make buttons clickable)
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
