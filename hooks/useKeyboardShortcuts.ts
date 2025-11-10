import { useEffect } from 'react';

/**
 * useKeyboardShortcuts - Custom hook for application keyboard shortcuts
 *
 * Provides keyboard shortcuts for common actions:
 * - Ctrl/Cmd+E: Trigger export
 * - Ctrl/Cmd+I: Trigger import
 *
 * @param onExport Callback function when Ctrl/Cmd+E is pressed
 * @param onImport Callback function when Ctrl/Cmd+I is pressed
 */
export function useKeyboardShortcuts(
  onExport?: () => void,
  onImport?: () => void
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl (Windows/Linux) or Cmd (Mac) is pressed
      const isCmdOrCtrl = event.ctrlKey || event.metaKey;

      // Prevent triggering shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      const isTypingContext =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true';

      if (isTypingContext) {
        return;
      }

      // Ctrl/Cmd+E for export
      if (isCmdOrCtrl && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        onExport?.();
      }

      // Ctrl/Cmd+I for import
      if (isCmdOrCtrl && event.key.toLowerCase() === 'i') {
        event.preventDefault();
        onImport?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onExport, onImport]);
}
