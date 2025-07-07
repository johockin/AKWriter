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

### Testing Checklist
- [ ] Type normally without any styling interference
- [ ] Click anywhere and continue typing
- [ ] Enter creates paragraph breaks correctly
- [ ] Shift+Enter creates line breaks correctly
- [ ] Headers work only on their specific lines
- [ ] Removing # reverts to normal text
- [ ] File save/load preserves all formatting
- [ ] No ALL CAPS spreading under any circumstances
- [ ] Cursor never jumps unexpectedly
- [ ] Performance remains smooth during long documents

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

## Recent Fixes Applied (Current Implementation)

### Enter Key Behavior (FIXED)
- **Shift+Enter**: Now properly inserts single `<br>` tag for line breaks
- **Enter**: Now properly inserts double `<br>` tags for paragraph breaks (was incorrectly using triple breaks)
- **Header Mode**: Fixed "stuck in header mode" issue - headers now only apply to the current cursor line

### Markdown Processing (REWRITTEN)
- **Function**: Replaced `checkForHeaders()` with `applyHeaderStyling()`
- **Approach**: Simple cursor-based detection instead of complex DOM manipulation
- **Timing**: 300ms debounce to prevent typing interference
- **Isolation**: Headers are strictly line-isolated and cannot bleed to other lines

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

## Handoff Notes
- This is a web-based application designed for macOS users
- Focus on the writing experience above all else
- Any feature that interferes with smooth typing should be removed
- The thick blue caret is a core feature - don't change it
- Typography settings have been carefully tuned - preserve them
- ALL CAPS headers are the goal, but they must stay contained to single lines
- When in doubt, prioritize stability over features