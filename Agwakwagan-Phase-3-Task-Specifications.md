# Agwakwagan Phase 3: Data Persistence - Task Specifications

**Phase:** 3 of 7  
**Phase Name:** Data Persistence  
**Estimated Time:** 5.5 hours  
**Dependencies:** Phase 2 (Drag & Drop) complete  
**Status:** Ready for Implementation

---

## Phase Overview

**Goal:** Enable users to save/load boards via JSON export/import and provide localStorage persistence with auto-save.

**Deliverables:**
1. Export board to JSON file
2. Import board from JSON file
3. localStorage auto-save with visual indicator
4. Data validation on import

**Why This Matters:**
- Users can backup their boards
- Share boards between devices/users
- Persist work between sessions
- Foundation for future cloud sync

---

## Task Breakdown

### Task 3.1: Export to JSON (1.5 hours)

**Goal:** Let users download complete board as JSON file.

**Implementation Steps:**

#### Step 1: Create Export Utility (30 min)

Create `src/utils/export.ts`:

```typescript
import { Board } from '@/types/board';

export interface ExportMetadata {
  exportedAt: string;
  version: string;
  appName: string;
}

export interface ExportedBoard {
  metadata: ExportMetadata;
  board: Board;
}

/**
 * Export board to JSON file with metadata
 */
export function exportBoard(board: Board): void {
  const exportData: ExportedBoard = {
    metadata: {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      appName: 'Agwakwagan'
    },
    board
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  // Generate filename with date
  const dateStr = new Date().toISOString().split('T')[0];
  const boardName = board.name.toLowerCase().replace(/\s+/g, '-');
  const filename = `agwakwagan-${boardName}-${dateStr}.json`;
  
  // Trigger download
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename from board
 */
export function generateExportFilename(board: Board): string {
  const dateStr = new Date().toISOString().split('T')[0];
  const boardName = board.name.toLowerCase().replace(/\s+/g, '-');
  return `agwakwagan-${boardName}-${dateStr}.json`;
}
```

**Why this design:**
- Metadata wrapper enables version detection for future format changes
- Date in filename prevents accidental overwrites
- Blob API handles large boards efficiently
- Clean URL cleanup prevents memory leaks

#### Step 2: Add Export Button to BoardHeader (45 min)

Update `src/components/BoardHeader.tsx`:

```typescript
import { exportBoard } from '@/utils/export';
import { Download } from 'lucide-react'; // Or your icon library

interface BoardHeaderProps {
  board: Board;
  onBoardUpdate: (board: Board) => void;
}

export function BoardHeader({ board, onBoardUpdate }: BoardHeaderProps) {
  const handleExport = () => {
    try {
      exportBoard(board);
      // Optional: Show success toast
      console.log('Board exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export board. Please try again.');
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-maroon-600">
          {board.name}
        </h1>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Export board to JSON"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </header>
  );
}
```

**Styling Notes:**
- Button follows Ozhiaki secondary button style
- Icon provides visual affordance
- Hover state gives feedback
- Title attribute for accessibility

#### Step 3: Add Keyboard Shortcut (15 min)

Add to your keyboard shortcut hook (create if needed):

```typescript
// src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';
import { Board } from '@/types/board';
import { exportBoard } from '@/utils/export';

interface UseKeyboardShortcutsProps {
  board: Board;
  // ... other props
}

export function useKeyboardShortcuts({ board }: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + E for Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportBoard(board);
      }
      
      // ... other shortcuts
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board]);
}
```

**Testing Checklist:**
- [ ] Export button appears in header
- [ ] Clicking button downloads JSON file
- [ ] Filename includes board name and date
- [ ] Keyboard shortcut (Ctrl+E) works
- [ ] File opens correctly in text editor
- [ ] JSON is properly formatted (indented)
- [ ] Export works with empty board
- [ ] Export works with large board (50+ cards)

---

### Task 3.2: Import from JSON (2 hours)

**Goal:** Let users upload and restore boards from JSON files.

#### Step 1: Create Import Utility (45 min)

Add to `src/utils/export.ts`:

```typescript
export interface ImportValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate imported board structure
 */
export function validateImportedBoard(data: unknown): ImportValidation {
  const result: ImportValidation = {
    valid: true,
    errors: [],
    warnings: []
  };

  try {
    // Check if data is object
    if (typeof data !== 'object' || data === null) {
      result.valid = false;
      result.errors.push('Invalid file format: expected JSON object');
      return result;
    }

    const exportedData = data as ExportedBoard;

    // Check metadata
    if (!exportedData.metadata) {
      result.warnings.push('Missing metadata - file may be from older version');
    }

    // Check board structure
    const board = exportedData.board;
    if (!board) {
      result.valid = false;
      result.errors.push('Missing board data');
      return result;
    }

    // Required fields
    if (!board.id || typeof board.id !== 'string') {
      result.valid = false;
      result.errors.push('Missing or invalid board.id');
    }

    if (!board.name || typeof board.name !== 'string') {
      result.valid = false;
      result.errors.push('Missing or invalid board.name');
    }

    if (!board.cards || typeof board.cards !== 'object') {
      result.valid = false;
      result.errors.push('Missing or invalid board.cards');
    }

    if (!board.columns || typeof board.columns !== 'object') {
      result.valid = false;
      result.errors.push('Missing or invalid board.columns');
    }

    if (!Array.isArray(board.columnOrder)) {
      result.valid = false;
      result.errors.push('Missing or invalid board.columnOrder');
    }

    // Validate column references
    if (board.columnOrder && board.columns) {
      board.columnOrder.forEach(colId => {
        if (!board.columns[colId]) {
          result.warnings.push(`Column "${colId}" in columnOrder not found in columns`);
        }
      });
    }

    // Validate card-column relationships
    if (board.cards && board.columns) {
      Object.entries(board.cards).forEach(([cardId, card]) => {
        if (!board.columns[card.columnId]) {
          result.warnings.push(`Card "${cardId}" references non-existent column "${card.columnId}"`);
        }
      });
    }

    // Version compatibility check
    if (exportedData.metadata?.version && exportedData.metadata.version !== '1.0') {
      result.warnings.push(`File version ${exportedData.metadata.version} may not be fully compatible`);
    }

  } catch (error) {
    result.valid = false;
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Import board from JSON file
 */
export function importBoard(file: File): Promise<Board> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const data = JSON.parse(result);
        
        // Validate structure
        const validation = validateImportedBoard(data);
        
        if (!validation.valid) {
          reject(new Error(`Invalid board file:\n${validation.errors.join('\n')}`));
          return;
        }

        // Show warnings to console
        if (validation.warnings.length > 0) {
          console.warn('Import warnings:', validation.warnings);
        }

        // Extract board (handle both old and new formats)
        const board = (data as ExportedBoard).board || data;
        
        // Ensure dates are Date objects
        if (typeof board.metadata.createdAt === 'string') {
          board.metadata.createdAt = new Date(board.metadata.createdAt);
        }
        if (typeof board.metadata.updatedAt === 'string') {
          board.metadata.updatedAt = new Date(board.metadata.updatedAt);
        }

        // Convert card dates
        Object.values(board.cards).forEach((card: Card) => {
          if (typeof card.createdAt === 'string') {
            card.createdAt = new Date(card.createdAt);
          }
          if (typeof card.updatedAt === 'string') {
            card.updatedAt = new Date(card.updatedAt);
          }
        });

        resolve(board);
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}
```

**Why this validation:**
- Prevents corrupted data from crashing app
- Helpful error messages for users
- Warnings for non-critical issues
- Handles date serialization properly
- Forward/backward compatibility support

#### Step 2: Add Import UI (1 hour)

Update `src/components/BoardHeader.tsx`:

```typescript
import { useState, useRef } from 'react';
import { importBoard } from '@/utils/export';
import { Upload, X } from 'lucide-react';

export function BoardHeader({ board, onBoardUpdate }: BoardHeaderProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      setImportError('Please select a JSON file');
      return;
    }

    // Confirm replacement
    const confirmed = window.confirm(
      'This will replace your current board. Your current board will be lost unless you export it first.\n\nContinue?'
    );
    
    if (!confirmed) {
      // Reset input
      e.target.value = '';
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const importedBoard = await importBoard(file);
      
      // Update board state
      onBoardUpdate(importedBoard);
      
      console.log('Board imported successfully');
      // Optional: Show success toast
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setImportError(message);
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  const dismissError = () => {
    setImportError(null);
  };

  return (
    <header className="relative flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      {/* ... existing header content ... */}
      
      <div className="flex items-center gap-3">
        {/* Import Button */}
        <button
          onClick={handleImportClick}
          disabled={isImporting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Import board from JSON"
        >
          <Upload className="w-4 h-4" />
          {isImporting ? 'Importing...' : 'Import'}
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Import board file"
        />

        {/* Export button from Task 3.1 */}
        {/* ... */}
      </div>

      {/* Error Banner */}
      {importError && (
        <div className="absolute top-full left-0 right-0 mt-2 mx-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between shadow-sm">
          <div>
            <h4 className="text-sm font-semibold text-red-800 mb-1">
              Import Failed
            </h4>
            <p className="text-sm text-red-700 whitespace-pre-line">
              {importError}
            </p>
          </div>
          <button
            onClick={dismissError}
            className="text-red-400 hover:text-red-600"
            aria-label="Dismiss error"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </header>
  );
}
```

**UI/UX Notes:**
- File input hidden, styled button triggers it
- Confirmation dialog prevents accidental data loss
- Disabled state during import
- Error banner shows validation failures
- Accept attribute limits file picker to JSON

#### Step 3: Add Keyboard Shortcut (15 min)

Update keyboard shortcuts hook:

```typescript
// Ctrl/Cmd + I for Import
if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
  e.preventDefault();
  // Trigger file input click
  document.querySelector('input[type="file"]')?.click();
}
```

**Testing Checklist:**
- [ ] Import button appears in header
- [ ] File picker only shows JSON files
- [ ] Confirmation dialog appears before import
- [ ] Valid JSON file imports successfully
- [ ] Board renders correctly after import
- [ ] Invalid JSON shows error message
- [ ] Corrupted file shows helpful error
- [ ] Error can be dismissed
- [ ] Keyboard shortcut works
- [ ] Import works with empty board
- [ ] Import works with large board
- [ ] Dates are properly restored
- [ ] Card-column relationships intact

---

### Task 3.3: localStorage Auto-Save (1.5 hours)

**Goal:** Automatically persist board to localStorage with visual feedback.

#### Step 1: Create Storage Hook (45 min)

Create `src/hooks/useLocalStorage.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'agwakwagan-board';
const SAVE_DEBOUNCE_MS = 1000; // 1 second

export interface StorageStatus {
  lastSaved: Date | null;
  saving: boolean;
  error: string | null;
}

/**
 * Hook for auto-saving board to localStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, StorageStatus] {
  
  // Initialize state from localStorage or default
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return initialValue;
    }
  });

  const [status, setStatus] = useState<StorageStatus>({
    lastSaved: null,
    saving: false,
    error: null
  });

  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Save to localStorage (debounced)
  const setValue = useCallback((value: T) => {
    setStoredValue(value);
    
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set saving state
    setStatus(prev => ({ ...prev, saving: true, error: null }));

    // Debounce save
    const timeout = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        setStatus({
          lastSaved: new Date(),
          saving: false,
          error: null
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        setStatus({
          lastSaved: null,
          saving: false,
          error: `Failed to save: ${message}`
        });
        console.error('Failed to save to localStorage:', error);
      }
    }, SAVE_DEBOUNCE_MS);

    setSaveTimeout(timeout);
  }, [key, saveTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  return [storedValue, setValue, status];
}

/**
 * Simple hook for board-specific storage
 */
export function useBoardStorage(initialBoard: Board) {
  return useLocalStorage<Board>(STORAGE_KEY, initialBoard);
}
```

**Why this design:**
- Debouncing prevents excessive writes during drag operations
- Status tracking enables UI feedback
- Error handling for quota exceeded scenarios
- Cleanup prevents memory leaks

#### Step 2: Integrate with Board State (30 min)

Update `src/app/page.tsx` (or wherever board state lives):

```typescript
import { useBoardStorage } from '@/hooks/useLocalStorage';

export default function Home() {
  // Replace useState with useBoardStorage
  const [board, setBoard, storageStatus] = useBoardStorage(DEFAULT_BOARD);

  return (
    <div className="min-h-screen bg-gray-50">
      <BoardHeader 
        board={board} 
        onBoardUpdate={setBoard}
        storageStatus={storageStatus}  // Pass to header
      />
      
      {/* ... rest of app ... */}
    </div>
  );
}
```

#### Step 3: Add Save Indicator (15 min)

Update `src/components/BoardHeader.tsx`:

```typescript
import { StorageStatus } from '@/hooks/useLocalStorage';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

interface BoardHeaderProps {
  board: Board;
  onBoardUpdate: (board: Board) => void;
  storageStatus: StorageStatus;
}

export function BoardHeader({ board, onBoardUpdate, storageStatus }: BoardHeaderProps) {
  const formatSaveTime = (date: Date) => {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-maroon-600">
          {board.name}
        </h1>

        {/* Save Status Indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {storageStatus.saving && (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          )}
          
          {!storageStatus.saving && storageStatus.lastSaved && !storageStatus.error && (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span>Saved {formatSaveTime(storageStatus.lastSaved)}</span>
            </>
          )}
          
          {storageStatus.error && (
            <>
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-red-600">Save failed</span>
            </>
          )}
        </div>
      </div>

      {/* ... import/export buttons ... */}
    </header>
  );
}
```

**Visual Design:**
- Spinner during save (1 second max due to debounce)
- Green checkmark when saved
- Red error icon if save fails
- Relative time format (just now, 5m ago, etc.)
- Subtle colors don't distract from main UI

**Testing Checklist:**
- [ ] Board saves to localStorage on changes
- [ ] Save indicator shows "Saving..." briefly
- [ ] Save indicator shows checkmark after save
- [ ] Changes persist after page reload
- [ ] Multiple rapid changes only save once (debounced)
- [ ] Large boards save successfully
- [ ] Error shown if quota exceeded
- [ ] Works offline (no network required)
- [ ] localStorage can be viewed in DevTools

---

### Task 3.4: Clear Storage Option (30 min)

**Goal:** Let users reset to default board (for testing/fresh start).

#### Implementation:

Update `src/components/BoardHeader.tsx`:

```typescript
import { Trash2 } from 'lucide-react';

export function BoardHeader(props: BoardHeaderProps) {
  const handleClearStorage = () => {
    const confirmed = window.confirm(
      'This will delete your current board and reset to default.\n\n' +
      'This action cannot be undone. Consider exporting your board first.\n\n' +
      'Continue?'
    );

    if (confirmed) {
      try {
        localStorage.removeItem('agwakwagan-board');
        window.location.reload(); // Reload to show default board
      } catch (error) {
        console.error('Failed to clear storage:', error);
        alert('Failed to clear storage. Please try again.');
      }
    }
  };

  return (
    <header>
      {/* ... other buttons ... */}
      
      {/* Clear Storage - only show in dev mode */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={handleClearStorage}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          title="Clear localStorage and reset board"
        >
          <Trash2 className="w-4 h-4" />
          Reset
        </button>
      )}
    </header>
  );
}
```

**Why dev-only:**
- Prevents accidental data loss in production
- Useful for testing/development
- Can be removed or moved to settings later

**Testing Checklist:**
- [ ] Button only visible in development
- [ ] Confirmation dialog appears
- [ ] Canceling dialog does nothing
- [ ] Confirming clears storage
- [ ] Page reloads with default board
- [ ] localStorage is empty after clear

---

## Integration Checklist

After completing all tasks:

- [ ] **Export works end-to-end**
  - [ ] Button clickable
  - [ ] File downloads
  - [ ] Keyboard shortcut works
  - [ ] Filename correct

- [ ] **Import works end-to-end**
  - [ ] Button clickable
  - [ ] File picker opens
  - [ ] Valid files import
  - [ ] Invalid files show errors
  - [ ] Confirmation prevents accidents
  - [ ] Keyboard shortcut works

- [ ] **Auto-save works**
  - [ ] Changes save automatically
  - [ ] Save indicator updates
  - [ ] Persists after reload
  - [ ] Debouncing prevents spam

- [ ] **Data integrity**
  - [ ] Export → Import preserves all data
  - [ ] Dates remain accurate
  - [ ] Card positions maintained
  - [ ] Column order preserved

- [ ] **Error handling**
  - [ ] Import validation catches issues
  - [ ] Helpful error messages shown
  - [ ] App doesn't crash on bad data
  - [ ] Storage quota errors handled

- [ ] **UX polish**
  - [ ] All buttons have hover states
  - [ ] All buttons have titles (tooltips)
  - [ ] Confirmation dialogs for destructive actions
  - [ ] Visual feedback for all actions

---

## Manual Testing Workflow

### Test 1: Export Flow
1. Create board with sample data
2. Add 3-5 cards across columns
3. Click Export button
4. Verify file downloads
5. Open file in text editor
6. Verify JSON is valid and formatted
7. Check metadata present
8. Check all cards present

### Test 2: Import Flow
1. Delete current board
2. Click Import button
3. Select exported file from Test 1
4. Confirm dialog
5. Verify board renders correctly
6. Check all cards present
7. Verify drag-drop still works

### Test 3: Round-Trip
1. Export board A
2. Make changes (add/remove cards)
3. Export board B
4. Import board A
5. Verify returns to state A
6. Import board B
7. Verify returns to state B

### Test 4: Auto-Save
1. Make a change
2. Watch save indicator
3. Wait for "Saved" message
4. Refresh page
5. Verify change persisted

### Test 5: Error Handling
1. Try importing text file (.txt)
2. Verify error shown
3. Try importing corrupted JSON
4. Verify validation catches it
5. Try importing with missing fields
6. Verify helpful error message

### Test 6: Large Boards
1. Create board with 50+ cards
2. Export
3. Verify file size reasonable (<1MB)
4. Import
5. Verify performance acceptable (<2 seconds)
6. Check auto-save still works

---

## Success Criteria

Phase 3 is complete when:

1. ✅ **Export works reliably**
   - Users can download board as JSON
   - File includes all data and metadata
   - Filename is descriptive and dated

2. ✅ **Import works reliably**
   - Users can upload and restore boards
   - Validation prevents bad data
   - Confirmation prevents accidents

3. ✅ **Auto-save works**
   - Changes persist automatically
   - Visual feedback shows save status
   - Debouncing prevents performance issues

4. ✅ **Data integrity**
   - Export → Import is lossless
   - All relationships preserved
   - Dates remain accurate

5. ✅ **Error handling**
   - Clear error messages
   - App remains stable on errors
   - Users can recover from mistakes

6. ✅ **UX polish**
   - Intuitive UI
   - Keyboard shortcuts work
   - Visual feedback for all actions

---

## Known Limitations & Future Work

**Current Limitations:**
- No version migration (will need when data model changes)
- No cloud backup (all data local)
- No conflict resolution (multiple devices)
- No partial import/export (all or nothing)
- Storage quota errors not handled gracefully

**Future Enhancements (Post-MVP):**
- Cloud sync (Phase 7-8 with API)
- Export specific columns/cards
- Import merge (add to existing board)
- Auto-export on interval
- Version migration system
- Backup history (keep last N exports)

---

## Files Modified

This phase touches:

**New Files:**
- `src/utils/export.ts` (export/import utilities)
- `src/hooks/useLocalStorage.ts` (storage hook)

**Modified Files:**
- `src/components/BoardHeader.tsx` (import/export UI)
- `src/app/page.tsx` (integrate storage hook)
- `src/hooks/useKeyboardShortcuts.ts` (add shortcuts)

**Total LOC:** ~500 lines

---

## Time Breakdown

- Task 3.1: Export to JSON - 1.5 hours
- Task 3.2: Import from JSON - 2 hours
- Task 3.3: Auto-save with indicator - 1.5 hours
- Task 3.4: Clear storage option - 30 minutes
- Testing & Polish - 30 minutes

**Total: 5.5 hours**

---

## Dependencies & Risks

**Dependencies:**
- Phase 2 must be complete (need working board)
- Board type definitions stable
- No breaking changes to data model

**Risks:**
- localStorage quota exceeded (5-10MB limit)
  - Mitigation: Show warning, suggest export
- Browser compatibility with File API
  - Mitigation: Feature detection, fallback message
- Data corruption from invalid imports
  - Mitigation: Comprehensive validation

**Blockers:**
- None (Phase 2 complete)

---

## Agent-Ready Considerations

While agent integration isn't until Phase 7-8, this phase sets foundation:

- **Export format includes board.id** - Enables identifying boards in API
- **Validation layer** - Can be reused for API data validation
- **Storage abstraction** - useLocalStorage hook can be swapped for API hook later
- **Metadata wrapper** - Version field enables future format changes

No additional work needed now, just good foundation for later.

---

## Notes for Implementer

**Architecture decisions:**
- Debouncing is critical - don't skip it or drag performance suffers
- Validation is verbose but necessary - prevents hours of debugging corrupted data
- Confirmation dialogs prevent support issues from accidental data loss
- Error messages need to be helpful - users won't read docs

**Testing priorities:**
1. Round-trip (export → import) - most critical
2. Auto-save - most used feature
3. Error handling - prevents frustration
4. Large boards - prevents performance issues

**Common pitfalls:**
- Forgetting to reset file input after use
- Not handling Date serialization properly
- Skipping debouncing (kills performance)
- Vague error messages
- Missing confirmation dialogs

**Time-saving tips:**
- Copy-paste validation code carefully - it's long but necessary
- Test with real data, not just empty boards
- Use browser DevTools Application tab to inspect localStorage
- Keep test export files handy for quick testing

---

**Phase 3 Complete! 🎉**

Next up: Phase 4 (Polish & Theme) - the final MVP phase!
