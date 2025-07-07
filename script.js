class AKWriter {
    constructor() {
        this.editor = document.querySelector('.editor');
        this.customCaret = document.querySelector('.custom-caret');
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadSavedContent();
        this.editor.focus();
        this.updateCaretPosition();
        
    }
    
    setupEventListeners() {
        // Handle enter key - ROBUST VERSION
        this.editor.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                
                const selection = window.getSelection();
                const range = selection.getRangeAt(0);
                
                if (e.shiftKey) {
                    // Shift+Enter: insert single line break
                    const br = document.createElement('br');
                    range.deleteContents();
                    range.insertNode(br);
                    range.setStartAfter(br);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else {
                    // Enter: insert paragraph break (double line break per spec)
                    const br1 = document.createElement('br');
                    const br2 = document.createElement('br');
                    range.deleteContents();
                    range.insertNode(br1);
                    range.setStartAfter(br1);
                    range.insertNode(br2);
                    range.setStartAfter(br2);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                
                // Update caret position and clear any header styling from new line
                setTimeout(() => {
                    this.updateCaretPosition();
                    this.applyHeaderStyling();
                }, 1);
            }
        });
        
        // Track cursor and process markdown
        this.editor.addEventListener('keyup', (e) => {
            this.updateCaretPosition();
            this.autoAddSpaceAfterHash();
            // Process markdown only when user stops typing
            clearTimeout(this.markdownTimeout);
            this.markdownTimeout = setTimeout(() => this.applyHeaderStyling(), 500);
        });
        
        this.editor.addEventListener('click', () => this.updateCaretPosition());
        this.editor.addEventListener('focus', () => this.showCaret());
        this.editor.addEventListener('blur', () => this.hideCaret());
        
        // File operations
        document.addEventListener('keydown', (e) => {
            if (e.metaKey && e.key === 's') {
                e.preventDefault();
                this.saveText();
            }
            if (e.metaKey && e.key === 'o') {
                e.preventDefault();
                this.openFile();
            }
        });
        
        // Auto-save
        window.addEventListener('beforeunload', () => this.saveContent());
    }
    
    autoAddSpaceAfterHash() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        const node = range.startContainer;
        
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            const pos = range.startOffset;
            
            // Look for #letter pattern
            if (pos > 0 && text[pos - 1].match(/[a-zA-Z]/) && text.substring(0, pos).match(/#[a-zA-Z]$/)) {
                // Insert space before the letter
                const newText = text.substring(0, pos - 1) + ' ' + text.substring(pos - 1);
                node.textContent = newText;
                
                // Move cursor
                range.setStart(node, pos + 1);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }
    
    applyHeaderStyling() {
        console.log('🔍 === HEADER STYLING DEBUG ===');
        
        // Clear all existing header classes
        const existingHeaders = this.editor.querySelectorAll('.header-1');
        console.log('🧹 Clearing', existingHeaders.length, 'existing headers');
        existingHeaders.forEach(el => {
            console.log('🧹 Removing .header-1 from:', el.tagName, el.textContent?.substring(0, 50));
            el.classList.remove('header-1');
        });
        
        // Find all text nodes that start with "# "
        const walker = document.createTreeWalker(
            this.editor,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        let headerCount = 0;
        const foundNodes = [];
        
        while (node = walker.nextNode()) {
            const text = node.textContent.trim();
            foundNodes.push(text);
            console.log('📝 Text node:', `"${text.substring(0, 50)}..."`);
            console.log('🏷️ Parent:', node.parentElement?.tagName, node.parentElement?.className);
            
            if (text.startsWith('# ') && !text.startsWith('## ')) {
                console.log('✨ FOUND HEADER:', `"${text}"`);
                
                if (node.parentElement) {
                    // ALWAYS create a new span wrapper for headers, regardless of parent
                    console.log('🎯 Creating individual span wrapper for header');
                    const span = document.createElement('span');
                    span.className = 'header-1';
                    
                    // Insert the new span before the text node
                    node.parentElement.insertBefore(span, node);
                    // Move ONLY this text node into the new span
                    span.appendChild(node);
                    headerCount++;
                    console.log('✅ Created individual span wrapper with .header-1');
                    console.log('🔍 Header span contains:', span.textContent);
                    
                    // Verify what happened
                    setTimeout(() => {
                        const allHeaders = this.editor.querySelectorAll('.header-1');
                        console.log('🔍 After processing, found', allHeaders.length, 'elements with .header-1');
                        allHeaders.forEach((el, i) => {
                            console.log(`📍 Header ${i+1}:`, el.tagName, el.textContent?.substring(0, 30));
                            if (el === this.editor) {
                                console.log('🚨 CRITICAL: Editor itself has .header-1 class!');
                            }
                        });
                    }, 10);
                } else {
                    console.log('❌ No parent element');
                }
            }
        }
        
        console.log('📊 Summary:');
        console.log('📊 Total text nodes:', foundNodes.length);
        console.log('📊 Headers processed:', headerCount);
        console.log('📊 All text nodes:', foundNodes.map(t => t.substring(0, 20)));
        console.log('🔍 === END HEADER DEBUG ===');
    }
    
    getAbsoluteOffset(node, offset) {
        let absoluteOffset = 0;
        const walker = document.createTreeWalker(
            this.editor,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let currentNode;
        while (currentNode = walker.nextNode()) {
            if (currentNode === node) {
                return absoluteOffset + offset;
            }
            absoluteOffset += currentNode.textContent.length;
        }
        return absoluteOffset;
    }
    
    setAbsoluteOffset(offset) {
        const walker = document.createTreeWalker(
            this.editor,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let currentOffset = 0;
        let node;
        
        while (node = walker.nextNode()) {
            const nodeLength = node.textContent.length;
            if (currentOffset + nodeLength >= offset) {
                try {
                    const range = document.createRange();
                    const selection = window.getSelection();
                    
                    range.setStart(node, Math.min(offset - currentOffset, nodeLength));
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    return;
                } catch (e) {
                    // If range creation fails, just focus the editor
                    this.editor.focus();
                    return;
                }
            }
            currentOffset += nodeLength;
        }
        
        // If we couldn't find the exact position, just focus the editor
        this.editor.focus();
    }
    
    updateCaretPosition() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) {
            this.hideCaret();
            return;
        }
        
        try {
            const range = selection.getRangeAt(0);
            let rect = range.getBoundingClientRect();
            const editorRect = this.editor.getBoundingClientRect();
            
            // If rect is invalid (all zeros), use a different approach
            if (!rect || (rect.left === 0 && rect.top === 0 && rect.width === 0 && rect.height === 0)) {
                // Create a temporary span to get position
                const tempSpan = document.createElement('span');
                tempSpan.style.display = 'inline';
                tempSpan.appendChild(document.createTextNode('\u200B')); // Zero-width space
                
                try {
                    range.insertNode(tempSpan);
                    rect = tempSpan.getBoundingClientRect();
                    tempSpan.remove();
                } catch (e) {
                    // If insertion fails, use fallback
                    rect = { left: editorRect.left, top: editorRect.top };
                }
            }
            
            // Calculate position relative to editor
            const left = Math.max(0, rect.left - editorRect.left + 2);
            const top = Math.max(0, rect.top - editorRect.top);
            
            this.customCaret.style.left = left + 'px';
            this.customCaret.style.top = top + 'px';
            this.showCaret();
        } catch (e) {
            console.warn('Caret positioning failed:', e);
            // Safe fallback - position at start of editor
            this.customCaret.style.left = '2px';
            this.customCaret.style.top = '0px';
            this.showCaret();
        }
    }
    
    showCaret() {
        this.customCaret.style.opacity = '1';
    }
    
    hideCaret() {
        this.customCaret.style.opacity = '0';
    }
    
    scanAndProcessAllContent() {
        console.log('Starting full content scan...');
        
        // Get current cursor position to restore later
        const selection = window.getSelection();
        let cursorOffset = 0;
        if (selection.rangeCount > 0) {
            cursorOffset = this.getAbsoluteOffset(selection.getRangeAt(0).startContainer, selection.getRangeAt(0).startOffset);
        }
        
        // Clear all existing header classes
        const existingHeaders = this.editor.querySelectorAll('.header-1');
        console.log('Clearing', existingHeaders.length, 'existing header elements');
        existingHeaders.forEach(el => {
            el.classList.remove('header-1');
        });
        
        // Get content and rebuild with proper structure
        const content = this.editor.textContent;
        const lines = content.split('\n');
        console.log('Found', lines.length, 'lines of content');
        
        // Rebuild HTML with proper header elements
        let newHTML = '';
        let headerCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            if (trimmedLine.startsWith('# ') && !trimmedLine.startsWith('## ')) {
                // Create header element
                newHTML += `<div class="header-1">${this.escapeHtml(line)}</div>`;
                headerCount++;
                console.log('✅ Created header element for:', trimmedLine);
            } else {
                // Regular line
                newHTML += `<div>${this.escapeHtml(line) || '<br>'}</div>`;
            }
        }
        
        // Update content with proper structure
        this.editor.innerHTML = newHTML;
        
        // Restore cursor position
        if (cursorOffset > 0) {
            this.setAbsoluteOffset(cursorOffset);
        }
        
        console.log(`Scan complete. Created ${headerCount} header elements.`);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    saveContent() {
        if (this.editor.textContent.trim()) {
            localStorage.setItem('akwriter-content', this.editor.innerHTML);
        }
    }
    
    loadSavedContent() {
        const savedContent = localStorage.getItem('akwriter-content');
        if (savedContent) {
            this.editor.innerHTML = savedContent;
            // Just apply header styling to existing content, don't rebuild
            setTimeout(() => this.applyHeaderStyling(), 100);
        }
    }
    
    openFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.md,.rtf,text/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) this.loadFile(file);
        };
        input.click();
    }
    
    loadFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.editor.textContent = e.target.result;
            this.saveContent();
        };
        reader.readAsText(file);
    }
    
    saveText() {
        const text = this.editor.textContent;
        if (!text.trim()) return;
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const date = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `akwriter-${date}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AKWriter();
});