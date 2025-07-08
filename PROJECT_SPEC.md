# AK Writer - Comprehensive Project Specification

## Project Vision
Create a clean, distraction-free writing application inspired by iA Writer, optimized for macOS users who want a minimalist, beautiful writing experience with excellent typography and subtle markdown support.

## CRITICAL DEVELOPMENT RULES
1. **Any changes made to the application code MUST be documented in this spec file at the same time.** This ensures consistency across multiple developers and prevents implementation drift. All visual specifications, functional requirements, and technical architecture notes must be kept up-to-date with the actual implementation.

2. **NO BLOAT ALLOWED.** Every feature, function, and line of code must serve a clear purpose. Remove any unnecessary debugging code, unused functions, or redundant features. The app must remain minimal and focused.

## Core Design Philosophy
- **Minimalism First**: Interface should be nearly invisible - just text and a big blue cursor. There should be no toolbars, no menus, no distractions, BUT features that we add later could be added in a way that does not interfere with the writing experience, and the features hide away
- **Typography Excellence**: Beautiful, readable text that's comfortable for long writing sessions. 
- **Everything is right where you want it, In Situ**: EXTREMELY IMPORTANT: controls are where you reach for them, and appear and disappear magically when relevant
- **Low Contrast**: Easy on the eyes for extended use, avoid harsh black-on-white
- **Focus Mode**: Writing should feel immersive and distraction-free
- **Subtle Enhancement**: Markdown styling should enhance readability without being intrusive. In fact, where possible, hide of de-emphasize markdown elements that wouldnt appear in a regular document
- **Performance First**: App must load instantly and respond immediately to every keystroke
- **Debug Console Philosophy**: CRITICAL - Console logging is the ONLY acceptable "messy" element of the app. Verbose debugging should be preserved indefinitely to aid development and troubleshooting. Never remove debug logging without explicit user permission. The console is our diagnostic tool and should remain comprehensive.

## Visual Design Specifications

### Typography
- **Body Text**: 18px San Francisco system font
- **Font Weight**: 300 (light but readable)
- **Line Height**: 1.7 (generous spacing for readability)
- **Letter Spacing**: 0.005em (slight opening for clarity)
- **Line Length**: Max 720px width (~60-80 characters per line)

### Color Scheme
- **Background**: #ffffff (clean white)
- **Text**: #333333 (dark gray, readable but not harsh)
- **Dark Mode**: 
  - Background: #2a2a2a (soft dark gray)
  - Text: #aaaaaa (light gray)

### Caret Design
- **Color**: #007aff (iOS blue)
- **Width**: 3px (thin, elegant line)
- **Height**: 25px (follows line height)
- **Style**: Custom animated div overlay (native caret hidden)
- **Animation**: 1s blink cycle
- **Positioning**: Tracks cursor position in real-time
- **Implementation**: Custom CSS + JavaScript solution (caret-width not universally supported)

### Heading Styles
- **Size**: 17px (slightly smaller than body text)
- **Weight**: 450 (slightly thicker than body)
- **Transform**: ALL CAPS
- **Spacing Above**: 4 × line-height (massive section breaks)
- **Letter Spacing**: 0.075em (optimized spacing for readability)
- **Color**: #333333 (same as body text for consistency)
- **Hash Mark**: #f5f5f5 (nearly invisible, positioned in left margin)

## Functional Requirements

### Core Text Editing
1. **Normal Typing**: Smooth, responsive text input with no lag
2. **Cursor Positioning**: Click anywhere to position cursor, no jumping
3. **Text Selection**: Standard selection behavior
4. **Copy/Paste**: Standard clipboard operations

### Enter Key Behavior
- **Enter**: Creates paragraph break (double line break)
- **Shift+Enter**: Creates line break (single line break)
- Must preserve this distinction through all operations

### Markdown Support (CRITICAL REQUIREMENTS)
#### Heading Syntax
- **Input**: `#header` (no space)
- **Auto-format**: Becomes `# header` (space added automatically)
- **Styling**: Text becomes ALL CAPS with 4 line-heights spacing above
- **Containment**: Header styling must ONLY apply to that specific line
- **Reversion**: If # is removed or text moved away, reverts to normal case

#### Bold/Italic
- **Bold**: `*text*` shows * characters but styles text as bold
- **Italic**: `_text_` shows _ characters but styles text as italic
- Characters remain visible for editing

#### Critical Parsing Rules
1. **Line Isolation**: Headers can NEVER consume multiple lines
2. **No Bleeding**: Styling cannot spread to other paragraphs
3. **Real-time**: Parsing happens as user types (with debouncing)
4. **Cursor Safety**: Parsing must never interfere with cursor position
5. **Preservation**: Line breaks and paragraph structure must be preserved

### File Operations
- **Auto-save**: Content saved to localStorage continuously
- **Export**: ⌘S exports as .txt file with timestamp
- **Open**: ⌘O opens text files (.txt, .md, .rtf)
- **Drag & Drop**: Files can be dragged into editor
- **Session Restore**: Content restored on page reload

### Layout & Spacing
- **Editor Container**: Centered, generous padding (100px top, 30px sides)
- **Height**: 70% of viewport height
- **No Scrollbars**: Hidden but content scrollable
- **No Toolbars**: Completely minimal interface

## Technical Architecture

### File Structure
```
/AKWriter/
├── index.html          # Main application shell
├── styles.css          # All styling and typography
├── script.js           # Application logic
└── PROJECT_SPEC.md     # This specification
```

### JavaScript Architecture
```javascript
class AKWriter {
    // Core initialization
    constructor()
    init()
    setupEventListeners()
    
    // Text editing
    handleEnterKey(isShiftPressed)
    
    // Markdown processing
    autoFormatHashtags()      // Auto-add spaces after #
    parseMarkdown()           // Apply styling safely
    
    // File operations
    saveText()
    openFile()
    loadFile(file)
}
```

### CSS Architecture
- **Base Styles**: Body, app container, editor setup
- **Typography**: Font sizing, spacing, weights
- **Markdown Styles**: Header classes (.h1, .h2, .h3), bold, italic
- **Responsive**: Dark mode support
- **Caret**: Custom thick blue caret styling

## Current Issues to Fix

### Critical Bugs
1. **ALL CAPS Spreading**: Header styling consuming entire document
2. **Enter Key Interference**: New paragraphs being added to previous headers
3. **Cursor Jumping**: Markdown parsing interfering with cursor position
4. **Existing Headers**: Lines with # not being recognized as headers

### Root Cause Analysis
- Markdown parsing is too aggressive and destroys document structure
- HTML manipulation is interfering with contenteditable behavior
- Event timing is causing race conditions between typing and parsing
- Line break preservation is failing during DOM reconstruction

## Implementation Strategy

### Phase 1: Stabilize Core Editor
1. Strip out all markdown functionality completely
2. Ensure basic typing, cursor positioning, and enter keys work perfectly
3. Verify file operations work correctly
4. Confirm typography and styling are correct

### Phase 2: Safe Markdown Implementation
1. Implement CSS-only markdown styling that doesn't require DOM manipulation
2. Use regex-based approach that preserves document structure
3. Add debounced parsing that only triggers when user stops typing
4. Implement cursor position preservation techniques

### Phase 3: Header Auto-formatting
1. Add space insertion after # characters
2. Implement line-by-line parsing that can't spread beyond single lines
3. Add reversion logic when # is removed
4. Test extensively with edge cases

### Testing Checklist (Current Status)
- [x] Type normally without any styling interference ✅
- [x] Click anywhere and continue typing ✅ 
- [x] Enter creates paragraph breaks correctly ✅
- [x] Shift+Enter creates line breaks correctly ✅
- [x] Headers work only on their specific lines ✅
- [x] Removing # reverts to normal text ✅
- [x] File save/load preserves all formatting ✅
- [x] No ALL CAPS spreading under any circumstances ✅
- [x] Cursor never jumps unexpectedly ✅
- [x] Performance remains smooth during long documents ✅
- [x] Auto-space insertion after # works ✅
- [x] Click in margins focuses editor ✅

## Performance Requirements

### Load Time
- **Initial Load**: < 200ms (app must be usable immediately)
- **File Size**: Keep total bundle < 50KB (HTML + CSS + JS)
- **Dependencies**: Zero external dependencies (no frameworks, libraries)
- **Caching**: Aggressive browser caching for repeat visits

### Runtime Performance
- **Keystroke Response**: < 16ms (60fps smooth typing)
- **Scroll Performance**: Buttery smooth on large documents
- **Memory Usage**: Minimal footprint, no memory leaks
- **CPU Usage**: Idle when not typing

### Optimization Strategies
- **Minimal DOM**: Avoid unnecessary DOM manipulation
- **Debounced Operations**: Auto-save, parsing throttled appropriately  
- **Event Efficiency**: Use passive event listeners where possible
- **CSS Optimization**: Avoid expensive properties (shadows, filters)
- **JavaScript Efficiency**: Minimal event handler overhead

## Success Criteria
1. **Stability**: Never breaks normal typing behavior
2. **Beauty**: Typography is gorgeous and easy to read
3. **Functionality**: Markdown works but stays contained
4. **Performance**: Instant load, 60fps typing, zero lag
5. **Preservation**: Document structure always maintained
6. **Usability**: Intuitive and distraction-free

## Critical Bug Fixes Applied (December 2024)

### Shift+Enter Cursor Jumping (COMPLETELY FIXED) ✅
**Issue**: After Shift+Enter line breaks, cursor would jump back 25+ characters into previous paragraph
**Root Cause**: Header styling was running after Shift+Enter and interfering with cursor position
**Solution**: 
- Eliminated all header processing after Shift+Enter
- Cleared pending timeouts to prevent delayed interference
- Added surgical cursor restoration only when elements actually convert

### Auto-Space Insertion (WORKING) ✅
**Feature**: `#header` automatically becomes `# header`
**Implementation**: Detects hash followed immediately by letter and inserts space
**Triggers**: Only when typing letters after `#` character

### Header Conversion (WORKING) ✅
**Feature**: `# text` becomes uppercase headers, removing `#` reverts to normal case
**Implementation**: Semantic `<p>` ↔ `<h1>` conversion with CSS `text-transform: uppercase`
**Cursor Management**: Smart restoration only when elements are actually converted

### Performance Optimization (IMPROVED) ✅
**Issue**: Header styling running on every keystroke causing lag
**Solution**: 
- Only trigger on specific keys: `#`, space, backspace, delete
- Reduced timeout from 500ms to 300ms
- Eliminated unnecessary processing during normal typing

### Hash Mark Implementation (DEFERRED) ⏸️
**Goal**: Display `#` character in left margin for headers
**Current Status**: Headers work perfectly without hash marks, feature deferred

**Technical Challenges Encountered**:
1. **Container Clipping**: Hash marks positioned at `-4em` are outside visible container bounds
2. **CSS Timing**: `::before` pseudo-elements not reliably applying to dynamically created elements
3. **DOM Complexity**: Multiple approaches tried (CSS pseudo-elements, inline positioning, wrapper divs)

**Debugging Results**:
- Hash spans ARE created and positioned correctly (`offsetLeft: -80px`)
- Elements exist in DOM with proper styling (`x: 429, width: 12px`)
- Issue is container clipping, not positioning logic

**Potential Solutions for Future Implementation**:
1. **Expand Container Approach**: 
   - Increase `.editor-container` left padding beyond current 120px
   - Ensure `.editor-wrapper` and `.editor` have `overflow: visible`
   - Test with padding of 140-160px to accommodate hash positioning

2. **Alternative Container Architecture**:
   ```css
   .editor-with-margin {
     position: relative;
     margin-left: 3em;
   }
   .hash-container {
     position: absolute;
     left: -2.5em;
     width: 2em;
   }
   ```

3. **CSS Grid/Flexbox Approach**:
   - Two-column layout with hash column and text column
   - More predictable positioning but requires architectural changes

4. **JavaScript Canvas/Overlay**:
   - Render hash marks on separate positioned overlay
   - More complex but guarantees visibility

**Current Header Implementation (Working)**:
- Font: 16px, weight 600, uppercase
- Color: #555555 (darker than body text)
- Letter-spacing: 0 (neutral spacing)
- Semantic `<h1>` elements with CSS text-transform
- Auto-space insertion: `#header` → `# header`
- Enhanced text rendering: antialiased with optimizeLegibility

### Typography Enhancement (COMPLETED) ✅
**Enhancement**: Applied smooth text rendering to all text elements
**Implementation**: 
- Added `-webkit-font-smoothing: antialiased` to body and paragraph text
- Added `text-rendering: optimizeLegibility` for optimal clarity
- Enhanced caret size by 10% (3.3px width, 27.5px height)

## URGENT FIX NEEDED: Header Conversion System (v1.3) 🚨

### Problem Summary
The current header conversion system has critical flaws that break the writing experience:

1. **Line Break Headers Don't Work**: Headers after Shift+Enter (line breaks) don't convert
2. **Cursor Jumping**: When typing second header, cursor jumps into previous header  
3. **Element Displacement**: Headers jump around document, DOM manipulation disrupts structure
4. **Mixed Content Failure**: Can't handle `paragraph text<br># header<br>more text`

### Root Cause
Current system processes entire `<p>` elements as atomic units, but headers can exist as lines within paragraphs (after `<br>` tags). Need **line-by-line processing** instead of paragraph-by-paragraph.

### Solution Architecture (v1.3)

#### **Phase 1: Line-by-Line Content Parser**
```javascript
parseDocumentLines() {
    // Split all content into logical lines
    // Handle both <br> separators and paragraph boundaries
    // Return array of line objects: { content, type, element, position }
}
```

#### **Phase 2: Smart Content Splitter**
```javascript
splitMixedContent(paragraph) {
    // Split paragraphs containing headers
    // Example: "text<br># header<br>more" → [p, h1, p]
    // Preserve cursor position during splits
}
```

#### **Phase 3: Incremental Processing**
```javascript
processContentChanges() {
    // Only process changed lines, not entire document
    // Track what's been processed to avoid duplicates
    // Handle cursor restoration per change
}
```

#### **Phase 4: Advanced Cursor Management**
```javascript
preserveCursorContext() {
    // Save cursor position relative to document structure
    // Restore position after DOM changes
    // Handle edge cases like element splitting
}
```

### Key Design Principles
1. **Minimal DOM Changes**: Only modify what needs to change
2. **Incremental Processing**: Process changes as they happen
3. **Cursor-First Design**: Cursor position preserved through all changes
4. **Line-Based Logic**: Think in terms of lines, not paragraphs
5. **Rollback Capability**: Can revert changes if issues occur

### Implementation Decisions
- **Replacement System**: Replace current header logic entirely (no parallel system to avoid bloat)
- **Auto-Space Insertion**: Maintain `#header` → `# header` functionality
- **Processing Pause**: Allow temporary pause during conversion for robustness
- **Performance Target**: Handle 100+ lines smoothly (edge case but possible)

### Testing Requirements
- Headers after line breaks (Shift+Enter) ✅
- Multiple headers in sequence ✅
- Mixed content splitting ✅
- Cursor stability during conversions ✅
- Empty lines before headers ✅
- Performance with longer documents ✅

## NEXT MAJOR FEATURE: Semantic List Implementation (PLANNED) 📋

### Overview
Implement intelligent list functionality that mirrors the header system's elegance and semantic approach.

### User Experience Requirements
- **Trigger Pattern**: `- item` (dash + space + text)
- **Auto-Space**: `-item` automatically becomes `- item` 
- **Visual Style**: Tight left margin, proper indentation, minimal spacing
- **Enter Behavior**: Creates new list item (line break) instead of paragraph break
- **Semantic Structure**: Convert to proper `<ul>` and `<li>` elements

### Technical Implementation Plan

#### 1. Auto-Space Detection (Similar to Hash System)
```javascript
autoAddSpaceAfterDash() {
    // Detect `-word` patterns at line start
    // Insert space after dash: `-item` → `- item`
    // Trigger only when typing letters after dash
}
```

#### 2. List Detection and Conversion
```javascript
applyListStyling() {
    // Find paragraphs that start with `- ` (dash + space)
    // Convert `<p>- item</p>` to `<li>item</li>`
    // Wrap consecutive list items in `<ul>` container
    // Remove dash from content (similar to hash removal)
}
```

#### 3. Enter Key Behavior in Lists
```javascript
// In keydown handler for Enter key:
if (currentElementIsListItem) {
    // Create new <li> instead of <p>
    // Continue the list structure
    // Position cursor properly
}
```

#### 4. Semantic HTML Structure
```html
<!-- Input: - First item, - Second item -->
<!-- Output: -->
<ul>
    <li>First item</li>
    <li>Second item</li>
</ul>
```

#### 5. CSS Styling Requirements
```css
.editor ul {
    margin: 0 0 1.5em 0;
    padding-left: 1.5em; /* Tight indent */
    list-style: none; /* Custom bullets */
}

.editor li {
    margin: 0 0 0.5em 0; /* Tight spacing between items */
    position: relative;
}

.editor li::before {
    content: "•";
    position: absolute;
    left: -1.2em;
    color: #666666;
}
```

### Implementation Phases

#### Phase 1: Detection System ⏳
- Implement `autoAddSpaceAfterDash()` function
- Add dash pattern detection to keyup handler
- Test auto-space insertion: `-item` → `- item`

#### Phase 2: List Conversion ⏳
- Create `applyListStyling()` function
- Implement `<p>` to `<li>` conversion logic
- Add `<ul>` wrapper creation for consecutive items
- Preserve cursor position during conversion

#### Phase 3: Enter Key Integration ⏳
- Modify enter key handler to detect list context
- Implement list item creation instead of paragraph breaks
- Handle cursor positioning in new list items

#### Phase 4: Visual Polish ⏳
- Implement tight spacing and indentation CSS
- Create custom bullet styling
- Ensure consistent typography with body text
- Test with multiple list items and nested scenarios

### Technical Challenges Anticipated

1. **List Grouping Logic**: Determining which consecutive `<li>` elements belong together
2. **Cursor Management**: Maintaining proper cursor position during list conversions
3. **Enter Key Context**: Detecting when cursor is in a list vs paragraph
4. **List Termination**: Handling when user wants to exit list mode
5. **Mixed Content**: Managing documents with both lists and headers

### Integration with Existing Systems

- **Follows Header Pattern**: Similar auto-space and semantic conversion approach
- **Cursor Restoration**: Use same surgical cursor management as headers
- **Performance**: Add dash/space to existing keystroke triggers
- **Debug Logging**: Comprehensive logging following established patterns

### Success Criteria

- [ ] `- item` patterns automatically get space inserted
- [ ] Text converts to proper semantic `<ul>/<li>` structure  
- [ ] Enter creates new list items, not paragraphs
- [ ] Visual styling matches design philosophy (tight, minimal)
- [ ] Cursor positioning remains stable during conversions
- [ ] Lists integrate seamlessly with existing header functionality

## MAJOR ARCHITECTURAL SHIFT: Semantic Structure (v2.0)

### Core Philosophy Change
**From**: Line break counting (`<br>` tags) → **To**: Semantic elements with identity
- **Paragraphs are entities**: Each `<p>` has semantic meaning and proper spacing
- **Headers are proper headings**: `<h1>` elements instead of styled spans
- **Professional behavior**: Matches Word, Google Docs, etc. in paragraph handling

### New Semantic Structure
```html
<!-- OLD (BR-based) -->
<div contenteditable>Text<br><br>More text<br><br>Header</div>

<!-- NEW (Semantic) -->
<div contenteditable>
  <p>Text</p>
  <p>More text</p>
  <h1># Header</h1>
</div>
```

### Technical Implementation (Current)
- **script.js:17-46**: Semantic enter key handling (Enter = new `<p>`, Shift+Enter = `<br>`)
- **script.js:103-176**: `createNewParagraph()` function with smart paragraph splitting
- **script.js:178-242**: Semantic header conversion (`<p>` ↔ `<h1>`)
- **script.js:254-284**: Auto-space insertion after `#` (detects `#header` → `# header`)
- **styles.css:85-111**: Semantic CSS (`.editor p`, `.editor h1`)

### Breakthrough Features
- **✅ Original Case Preservation**: CSS `text-transform: uppercase` preserves underlying text
- **✅ Cursor Position Stability**: No jumping when elements convert between p/h1
- **✅ Smart Auto-Formatting**: `#header` automatically becomes `# header`
- **✅ Clean Reversion**: Delete `#` and text reverts to original case automatically
- **✅ Migration Support**: Converts old BR-based content to semantic structure

### Typography Refinements
- **Letter Spacing**: 0.0375em (optimized for readability)
- **Semantic Margins**: `p { margin-bottom: 1.5em }`, `h1 { margin: 4em 0 1em 0 }`
- **Consistent Colors**: Headers match body text (#333333)
- **Professional Spacing**: Each element has proper identity-based spacing

## Development Pipeline - Next Features 

### Immediate Improvements (Easy Wins)
1. **CSS Custom Properties for Theming** 🎨
   - Add CSS variables for colors, fonts, and spacing
   - Improve maintainability and future theme support
   - Implementation: Add `:root` variables following Google Docs pattern

2. **Performance Timing Metrics** ⚡
   - Add Google Docs-style timing measurement
   - Track load time, keystroke response, parsing operations
   - Implementation: Add `AK_timing` object with milestone tracking

3. **Modular Architecture Separation** 🏗️
   - Separate text editing, markdown processing, and file operations
   - Follow Google Docs' approach of separating UI from content logic
   - Implementation: Refactor `AKWriter` class into focused modules

### Future Web App Considerations 🌐
When/if converting to a full web application, these items will need attention:

1. **Font Loading Strategy**
   - Implement web font loading with fallbacks
   - Add font caching and preloading
   - Consider Google Fonts integration or custom font hosting

2. **Accessibility Enhancements**
   - Proper ARIA labels and roles
   - Screen reader support
   - Keyboard navigation improvements
   - High contrast mode support

3. **Advanced Font System**
   - Move beyond system fonts to web fonts
   - Implement font variation support
   - Add typography fine-tuning controls

## Handoff Notes
- This is a web-based application designed for macOS users
- Focus on the writing experience above all else
- Any feature that interferes with smooth typing should be removed
- The thick blue caret is a core feature - don't change it
- Typography settings have been carefully tuned - preserve them
- ALL CAPS headers are the goal, but they must stay contained to single lines
- When in doubt, prioritize stability over features