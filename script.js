// Performance timing system (inspired by Google Docs)
var AK_timing = {};
AK_timing['start'] = new Date().getTime();

// Performance analytics tracking
var AK_analytics = {
    keystrokes: 0,
    fastKeystrokes: 0,
    slowKeystrokes: 0,
    headerParses: 0,
    slowParses: 0,
    autoSpaceInsertions: 0,
    caretUpdates: 0,
    slowCaretUpdates: 0,
    totalKeystrokeTime: 0,
    totalParseTime: 0,
    totalCaretTime: 0,
    sessionStart: performance.now()
};

class AKWriter {
    constructor() {
        AK_timing['constructor_start'] = new Date().getTime();
        this.editor = document.querySelector('.editor');
        this.customCaret = document.querySelector('.custom-caret');
        this.init();
        AK_timing['constructor_end'] = new Date().getTime();
    }
    
    init() {
        AK_timing['init_start'] = new Date().getTime();
        this.setupEventListeners();
        this.loadSavedContent();
        this.editor.focus();
        this.updateCaretPosition();
        AK_timing['init_end'] = new Date().getTime();
        
        // Log performance metrics
        this.logPerformanceMetrics();
    }
    
    setupEventListeners() {
        // Handle enter key - SEMANTIC VERSION
        this.editor.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                
                const selection = window.getSelection();
                const range = selection.getRangeAt(0);
                
                if (e.shiftKey) {
                    // Shift+Enter: insert line break within current paragraph
                    console.log('📄 Shift+Enter: Adding line break');
                    
                    // Cancel any pending header styling
                    clearTimeout(this.markdownTimeout);
                    
                    const br = document.createElement('br');
                    range.deleteContents();
                    range.insertNode(br);
                    
                    // Position cursor after the br
                    range.setStartAfter(br);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    // Update caret immediately, don't trigger header styling
                    setTimeout(() => this.updateCaretPosition(), 1);
                    return; // Don't continue to header processing
                } else {
                    // Enter: create new paragraph
                    this.createNewParagraph(range);
                }
                
                // Update caret position and process markdown
                setTimeout(() => {
                    this.updateCaretPosition();
                    // Only apply header styling for Enter, not Shift+Enter
                    if (!e.shiftKey) {
                        this.applyHeaderStyling();
                    }
                }, 1);
            }
        });
        
        // Track cursor and process markdown
        this.editor.addEventListener('keyup', (e) => {
            const keystrokeStart = performance.now();
            this.updateCaretPosition();
            const keystrokeEnd = performance.now();
            
            // Analytics tracking
            AK_analytics.keystrokes++;
            const keystrokeTime = keystrokeEnd - keystrokeStart;
            AK_analytics.totalKeystrokeTime += keystrokeTime;
            
            if (keystrokeTime > 16) {
                AK_analytics.slowKeystrokes++;
                console.warn(`⚠️ Slow keystroke: ${keystrokeTime.toFixed(2)}ms (key: ${e.key})`);
            } else {
                AK_analytics.fastKeystrokes++;
            }
            
            // Detailed keystroke logging every 50 keystrokes
            if (AK_analytics.keystrokes % 50 === 0) {
                this.logKeystrokeStats();
            }
            
            // Skip ALL processing for Shift+Enter - it's just a line break
            if (e.shiftKey && e.key === 'Enter') {
                return;
            }
            
            // Auto-add space after # when user types a letter or space
            if (e.key.match(/[a-zA-Z]/) || e.key === ' ') {
                const spaceStart = performance.now();
                const spaceInserted = this.autoAddSpaceAfterHash();
                const spaceEnd = performance.now();
                
                if (spaceInserted) {
                    AK_analytics.autoSpaceInsertions++;
                    console.log(`✨ Auto-space inserted after # (${(spaceEnd - spaceStart).toFixed(2)}ms)`);
                }
            }
            
            // Only process headers for specific keys that could affect header status
            if (e.key === '#' || e.key === ' ' || e.key === 'Backspace' || e.key === 'Delete') {
                clearTimeout(this.markdownTimeout);
                this.markdownTimeout = setTimeout(() => {
                    const parseStart = performance.now();
                    this.applyHeaderStyling();
                    const parseEnd = performance.now();
                    
                    // Analytics tracking
                    AK_analytics.headerParses++;
                    const parseTime = parseEnd - parseStart;
                    AK_analytics.totalParseTime += parseTime;
                    
                    if (parseTime > 10) {
                        AK_analytics.slowParses++;
                        console.warn(`⚠️ Slow header parsing: ${parseTime.toFixed(2)}ms (parse #${AK_analytics.headerParses})`);
                    }
                    
                    // Detailed parse logging every 10 parses
                    if (AK_analytics.headerParses % 10 === 0) {
                        this.logParseStats();
                    }
                }, 300);
            }
        });
        
        this.editor.addEventListener('click', () => {
            const caretStart = performance.now();
            this.updateCaretPosition();
            const caretEnd = performance.now();
            
            // Analytics tracking for caret updates
            AK_analytics.caretUpdates++;
            const caretTime = caretEnd - caretStart;
            AK_analytics.totalCaretTime += caretTime;
            
            if (caretTime > 5) {
                AK_analytics.slowCaretUpdates++;
                console.warn(`⚠️ Slow caret update: ${caretTime.toFixed(2)}ms`);
            }
        });
        this.editor.addEventListener('focus', () => this.showCaret());
        this.editor.addEventListener('blur', () => this.hideCaret());
        
        // Paste protection - strip all formatting and only allow plain text
        this.editor.addEventListener('paste', (e) => {
            e.preventDefault();
            console.log('🛡️ Intercepting paste - stripping all formatting');
            
            // Get plain text only from clipboard
            const text = (e.clipboardData || window.clipboardData).getData('text/plain');
            
            if (text) {
                // Insert plain text at cursor position
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(document.createTextNode(text));
                    
                    // Move cursor to end of inserted text
                    range.setStartAfter(range.endContainer);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    // Update caret position and apply our semantic processing
                    this.updateCaretPosition();
                    
                    // Apply header styling after paste to handle any # patterns
                    setTimeout(() => this.applyHeaderStyling(), 100);
                    
                    console.log('✅ Plain text pasted successfully');
                }
            }
        });
        
        // Focus editor when clicking anywhere in the container
        document.querySelector('.editor-container').addEventListener('click', (e) => {
            if (e.target === e.currentTarget || e.target.classList.contains('editor-wrapper')) {
                this.editor.focus();
                // Position cursor at end of content
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(this.editor);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                this.updateCaretPosition();
            }
        });
        
        // File operations and debug shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.metaKey && e.key === 's') {
                e.preventDefault();
                this.saveText();
            } else if (e.metaKey && e.key === 'o') {
                e.preventDefault();
                this.openFile();
            } else if (e.metaKey && e.shiftKey && e.key === 'D') {
                // Cmd+Shift+D: Show debug performance summary
                e.preventDefault();
                this.logSessionSummary();
            } else if (e.metaKey && e.shiftKey && e.key === 'K') {
                // Cmd+Shift+K: Show keystroke stats
                e.preventDefault();
                this.logKeystrokeStats();
            } else if (e.metaKey && e.shiftKey && e.key === 'P') {
                // Cmd+Shift+P: Show parse stats
                e.preventDefault();
                this.logParseStats();
            }
        });
        
        // Auto-save
        window.addEventListener('beforeunload', () => this.saveContent());
    }
    
    
    createNewParagraph(range) {
        console.log('📄 Creating new paragraph');
        
        // Find the current paragraph element
        let currentParagraph = range.startContainer;
        while (currentParagraph && currentParagraph !== this.editor && 
               !['P', 'H1', 'H2', 'H3'].includes(currentParagraph.tagName)) {
            currentParagraph = currentParagraph.parentElement;
        }
        
        // If we're not in a paragraph, create one
        if (!currentParagraph || currentParagraph === this.editor) {
            console.log('📄 Not in paragraph, wrapping current content');
            const newP = document.createElement('p');
            
            // Get any selected content
            if (!range.collapsed) {
                newP.appendChild(range.extractContents());
            }
            
            // Insert the new paragraph
            range.insertNode(newP);
            
            // Create another paragraph for cursor
            const nextP = document.createElement('p');
            nextP.innerHTML = '<br>'; // Empty paragraph needs br for cursor positioning
            this.editor.insertBefore(nextP, newP.nextSibling);
            
            // Position cursor in new paragraph
            range.setStart(nextP, 0);
            range.collapse(true);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            return;
        }
        
        console.log('📄 In paragraph:', currentParagraph.tagName);
        
        // Split the current paragraph at cursor position
        const beforeCursor = range.cloneRange();
        beforeCursor.setStartBefore(currentParagraph);
        const beforeContent = beforeCursor.extractContents();
        
        const afterCursor = range.cloneRange();
        afterCursor.setEndAfter(currentParagraph);
        const afterContent = afterCursor.extractContents();
        
        // Create new paragraph for content after cursor
        const newParagraph = document.createElement('p');
        if (afterContent.textContent.trim()) {
            newParagraph.appendChild(afterContent);
        } else {
            newParagraph.innerHTML = '<br>'; // Empty paragraph needs br for cursor
        }
        
        // Insert new paragraph after current one
        this.editor.insertBefore(newParagraph, currentParagraph.nextSibling);
        
        // Clean up current paragraph with content before cursor
        if (beforeContent.textContent.trim()) {
            currentParagraph.innerHTML = '';
            currentParagraph.appendChild(beforeContent);
        }
        
        // Position cursor at start of new paragraph
        range.setStart(newParagraph, 0);
        range.collapse(true);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        console.log('✅ Created new paragraph');
    }

    applyHeaderStyling() {
        // Don't process if editor is empty or only has empty paragraphs
        const textContent = this.editor.textContent.trim();
        if (!textContent || textContent === '') {
            console.log('🔍 Skipping header styling - editor is empty');
            return;
        }
        
        
        // Save cursor position only if we're about to modify elements
        const selection = window.getSelection();
        let needsRestore = false;
        let cursorOffset = 0;
        let targetElement = null;
        
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            cursorOffset = range.startOffset;
            
            // Check if cursor is in an element that will be converted
            let container = range.startContainer;
            while (container && !['P', 'H1'].includes(container.tagName)) {
                container = container.parentElement;
            }
            
            if (container) {
                const text = container.textContent.trim();
                const isP = container.tagName === 'P';
                const isH1 = container.tagName === 'H1';
                
                // Will this element be converted?
                if ((isP && text.startsWith('# ') && !text.startsWith('## ')) ||
                    (isH1 && !text.startsWith('# '))) {
                    needsRestore = true;
                    targetElement = container;
                }
            }
        }
        
        // h1 elements should stay as h1 unless user explicitly removes the # (we'll handle this differently)
        
        // Update existing h1 elements with current styles
        this.editor.querySelectorAll('h1').forEach(h1 => {
            h1.style.cssText = `
                font-size: 18px !important;
                font-weight: 550 !important;
                text-transform: uppercase !important;
                letter-spacing: 0 !important;
                line-height: 1.7 !important;
                color: #555555 !important;
                margin: 4em 0 1em 0 !important;
                padding: 0 !important;
                position: relative !important;
                -webkit-font-smoothing: subpixel-antialiased !important;
                text-rendering: optimizeLegibility !important;
            `;
        });

        // Find paragraphs that should be headers
        this.editor.querySelectorAll('p').forEach(p => {
            const text = p.textContent.trim();
            if (text.startsWith('# ') && !text.startsWith('## ')) {
                console.log('✨ Converting p to h1:', text);
                const h1 = document.createElement('h1');
                // Remove the "# " from the content since we'll add it with CSS
                const headerText = text.substring(2);
                
                // Apply header styles directly with !important-level specificity
                h1.style.cssText = `
                    font-size: 18px !important;
                    font-weight: 550 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0 !important;
                    line-height: 1.7 !important;
                    color: #555555 !important;
                    margin: 4em 0 1em 0 !important;
                    padding: 0 !important;
                    position: relative !important;
                    -webkit-font-smoothing: subpixel-antialiased !important;
                    text-rendering: optimizeLegibility !important;
                `;
                
                // Set text content
                h1.textContent = headerText;
                
                // Create a wrapper div that will contain both hash and h1
                const wrapper = document.createElement('div');
                wrapper.style.cssText = `
                    position: relative !important;
                    margin: 4em 0 1em 0 !important;
                `;
                
                // Create hash span that appears outside the h1
                const hashSpan = document.createElement('span');
                hashSpan.textContent = '#';
                hashSpan.style.cssText = `
                    position: absolute !important;
                    left: -4em !important;
                    top: 0 !important;
                    color: red !important;
                    font-weight: 300 !important;
                    font-size: 20px !important;
                    background: yellow !important;
                    z-index: 1000 !important;
                    pointer-events: none !important;
                `;
                
                // Reset h1 margin since wrapper handles it
                h1.style.margin = '0 !important';
                
                // Assemble: wrapper contains both hash and h1
                wrapper.appendChild(hashSpan);
                wrapper.appendChild(h1);
                
                console.log('🔍 === DETAILED HASH DEBUG ===');
                console.log('🔍 Wrapper element:', wrapper);
                console.log('🔍 Hash span element:', hashSpan);
                console.log('🔍 Hash span styles:', hashSpan.style.cssText);
                console.log('🔍 Hash span bounding rect before insert:', hashSpan.getBoundingClientRect());
                
                p.parentElement.replaceChild(wrapper, p);
                
                // Debug after insertion
                setTimeout(() => {
                    console.log('🔍 Hash span bounding rect after insert:', hashSpan.getBoundingClientRect());
                    console.log('🔍 Hash span computed style:', window.getComputedStyle(hashSpan));
                    console.log('🔍 Hash span offsetParent:', hashSpan.offsetParent);
                    console.log('🔍 Hash span offsetLeft:', hashSpan.offsetLeft);
                    console.log('🔍 Hash span offsetTop:', hashSpan.offsetTop);
                    console.log('🔍 Wrapper bounding rect:', wrapper.getBoundingClientRect());
                    console.log('🔍 Is hash span in DOM?', document.contains(hashSpan));
                    console.log('🔍 === END HASH DEBUG ===');
                }, 100);
                if (p === targetElement) targetElement = h1;
            }
        });
        
        // Restore cursor only if an element was actually converted
        if (needsRestore && targetElement) {
            try {
                const range = document.createRange();
                const textNode = this.getFirstTextNode(targetElement);
                if (textNode) {
                    const safeOffset = Math.min(cursorOffset, textNode.textContent.length);
                    range.setStart(textNode, safeOffset);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    console.log('🔧 Restored cursor after element conversion');
                }
            } catch (e) {
                console.log('⚠️ Could not restore cursor');
            }
        }
        
    }
    
    getFirstTextNode(element) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        return walker.nextNode();
    }
    
    autoAddSpaceAfterHash() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return false;
        
        const range = selection.getRangeAt(0);
        const node = range.startContainer;
        
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            const pos = range.startOffset;
            
            // Look for #word pattern (at start of line or after whitespace)
            const textBeforeCursor = text.substring(0, pos);
            const hashWordMatch = textBeforeCursor.match(/(^|\s)(#[a-zA-Z]+)$/);
            
            if (hashWordMatch) {
                console.log('🔧 Auto-adding space after #');
                
                // Insert space after the #
                const hashStart = hashWordMatch.index + hashWordMatch[1].length + 1; // Position after #
                const newText = text.substring(0, hashStart) + ' ' + text.substring(hashStart);
                node.textContent = newText;
                
                // Move cursor to after the inserted space
                range.setStart(node, pos + 1);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Trigger header processing after space is added
                clearTimeout(this.markdownTimeout);
                this.markdownTimeout = setTimeout(() => this.applyHeaderStyling(), 100);
                
                return true;
            }
        }
        
        return false;
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
        const textContent = this.editor.textContent.trim();
        if (textContent) {
            localStorage.setItem('akwriter-content', this.editor.innerHTML);
        } else {
            // If content is empty, clear localStorage
            localStorage.removeItem('akwriter-content');
            console.log('🗑️ Cleared empty content from localStorage');
        }
    }
    
    loadSavedContent() {
        const savedContent = localStorage.getItem('akwriter-content');
        if (savedContent) {
            this.editor.innerHTML = savedContent;
            // Convert any existing content to semantic structure
            setTimeout(() => {
                this.convertToSemanticStructure();
                this.applyHeaderStyling();
            }, 100);
        } else {
            // Initialize with empty paragraph
            this.editor.innerHTML = '<p><br></p>';
        }
    }
    
    convertToSemanticStructure() {
        console.log('🔄 Converting to semantic structure');
        
        // If editor only has text nodes or br tags, wrap in paragraphs
        const content = this.editor.innerHTML;
        
        // Split by double br tags (old paragraph breaks)
        const paragraphs = content.split(/<br\s*\/?>\s*<br\s*\/?>/i);
        
        if (paragraphs.length > 1) {
            console.log('🔄 Found br-based content, converting to paragraphs');
            let newHTML = '';
            
            paragraphs.forEach(para => {
                const cleanPara = para.replace(/<br\s*\/?>/gi, '<br>').trim();
                if (cleanPara) {
                    const text = cleanPara.replace(/<[^>]*>/g, '').trim();
                    if (text.startsWith('# ') && !text.startsWith('## ')) {
                        newHTML += `<h1>${cleanPara}</h1>`;
                    } else {
                        newHTML += `<p>${cleanPara || '<br>'}</p>`;
                    }
                }
            });
            
            if (newHTML) {
                this.editor.innerHTML = newHTML;
                console.log('✅ Converted to semantic structure');
            }
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
    
    logPerformanceMetrics() {
        const constructorTime = AK_timing['constructor_end'] - AK_timing['constructor_start'];
        const initTime = AK_timing['init_end'] - AK_timing['init_start'];
        const totalTime = AK_timing['init_end'] - AK_timing['start'];
        
        console.log('🚀 AKWriter Performance Metrics:');
        console.log(`   Constructor: ${constructorTime}ms`);
        console.log(`   Initialization: ${initTime}ms`);
        console.log(`   Total Load: ${totalTime}ms`);
        
        // Warn if load time is slow
        if (totalTime > 200) {
            console.warn(`⚠️ Load time exceeded target: ${totalTime}ms > 200ms`);
        } else {
            console.log(`✅ Load time within target: ${totalTime}ms < 200ms`);
        }
    }
    
    logKeystrokeStats() {
        const avgKeystroke = AK_analytics.totalKeystrokeTime / AK_analytics.keystrokes;
        const slowPercentage = (AK_analytics.slowKeystrokes / AK_analytics.keystrokes * 100).toFixed(1);
        
        console.log('⌨️ Keystroke Performance Analysis:');
        console.log(`   Total Keystrokes: ${AK_analytics.keystrokes}`);
        console.log(`   Average Response: ${avgKeystroke.toFixed(2)}ms`);
        console.log(`   Fast Keystrokes: ${AK_analytics.fastKeystrokes} (${(100 - slowPercentage)}%)`);
        console.log(`   Slow Keystrokes: ${AK_analytics.slowKeystrokes} (${slowPercentage}%)`);
        console.log(`   Auto-Space Insertions: ${AK_analytics.autoSpaceInsertions}`);
        console.log(`   Caret Updates: ${AK_analytics.caretUpdates} (${AK_analytics.slowCaretUpdates} slow)`);
        
        if (avgKeystroke > 10) {
            console.warn(`⚠️ Average keystroke response is slow: ${avgKeystroke.toFixed(2)}ms`);
        }
    }
    
    logParseStats() {
        const avgParse = AK_analytics.totalParseTime / AK_analytics.headerParses;
        const slowParsePercentage = (AK_analytics.slowParses / AK_analytics.headerParses * 100).toFixed(1);
        
        console.log('📄 Header Parse Performance:');
        console.log(`   Total Parses: ${AK_analytics.headerParses}`);
        console.log(`   Average Parse Time: ${avgParse.toFixed(2)}ms`);
        console.log(`   Slow Parses: ${AK_analytics.slowParses} (${slowParsePercentage}%)`);
        
        if (avgParse > 5) {
            console.warn(`⚠️ Average parse time is slow: ${avgParse.toFixed(2)}ms`);
        }
    }
    
    logSessionSummary() {
        const sessionTime = (performance.now() - AK_analytics.sessionStart) / 1000;
        const keystrokesPerMinute = (AK_analytics.keystrokes / (sessionTime / 60)).toFixed(1);
        
        console.log('📊 Session Summary:');
        console.log(`   Session Duration: ${sessionTime.toFixed(1)}s`);
        console.log(`   Keystrokes/Minute: ${keystrokesPerMinute}`);
        console.log(`   Total Operations: ${AK_analytics.keystrokes + AK_analytics.headerParses + AK_analytics.caretUpdates}`);
        console.log(`   Performance Score: ${this.calculatePerformanceScore()}/100`);
    }
    
    calculatePerformanceScore() {
        let score = 100;
        
        // Deduct for slow keystrokes
        const slowKeystrokeRatio = AK_analytics.slowKeystrokes / Math.max(AK_analytics.keystrokes, 1);
        score -= slowKeystrokeRatio * 30;
        
        // Deduct for slow parses
        const slowParseRatio = AK_analytics.slowParses / Math.max(AK_analytics.headerParses, 1);
        score -= slowParseRatio * 20;
        
        // Deduct for slow caret updates
        const slowCaretRatio = AK_analytics.slowCaretUpdates / Math.max(AK_analytics.caretUpdates, 1);
        score -= slowCaretRatio * 15;
        
        return Math.max(0, Math.round(score));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AKWriter();
});