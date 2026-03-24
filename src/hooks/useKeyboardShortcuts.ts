import { useEffect, useCallback, RefObject } from 'react';

/**
 * Keyboard shortcuts configuration
 * Note: These shortcuts are designed to not conflict with Framer's native shortcuts
 * Framer uses: Cmd+Z (undo), Cmd+C (copy), Cmd+V (paste), Cmd+X (cut), Cmd+S (save), etc.
 * We use: Cmd/Ctrl+F (search focus), Escape (clear search/selection)
 */

interface UseKeyboardShortcutsOptions {
  /** Ref to the search input element */
  searchInputRef: RefObject<HTMLInputElement>;
  /** Current search query value */
  searchQuery: string;
  /** Function to clear the search query */
  onClearSearch: () => void;
  /** Function to clear grid selection (optional) */
  onClearSelection?: () => void;
  /** Whether keyboard shortcuts are enabled (default: true) */
  enabled?: boolean;
}

/**
 * Hook to handle keyboard shortcuts for the plugin
 * 
 * Shortcuts:
 * - Cmd/Ctrl+F: Focus the search input (prevents default browser find)
 * - Escape: Clear search/selection and return focus to search input
 * 
 * Requirements:
 * - 17.1: Cmd/Ctrl+F focuses Search_Input
 * - 17.2: Escape clears search and blurs input while searching
 * - 17.5: No conflicts with Framer's native shortcuts
 * - 6.5: Escape clears selection and returns focus to Search_Input
 */
export function useKeyboardShortcuts({
  searchInputRef,
  searchQuery,
  onClearSearch,
  onClearSelection,
  enabled = true,
}: UseKeyboardShortcutsOptions): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Cmd/Ctrl+F: Focus search input (Requirement 17.1)
      if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
        event.preventDefault(); // Prevent browser's default find behavior
        searchInputRef.current?.focus();
        // Select all text in the input for easy replacement
        searchInputRef.current?.select();
        return;
      }

      // Escape: Clear search/selection and return focus to search input
      // Requirements: 17.2, 6.5
      if (event.key === 'Escape') {
        const isSearchFocused = document.activeElement === searchInputRef.current;
        const hasSearchContent = searchQuery.length > 0;

        // If search input is focused and has content, clear it
        if (isSearchFocused && hasSearchContent) {
          event.preventDefault();
          onClearSearch();
          return;
        }

        // If focus is elsewhere (e.g., on a card), clear selection and return to search
        // Requirement 6.5: Clear selection and return focus to Search_Input
        if (!isSearchFocused) {
          event.preventDefault();
          onClearSelection?.();
          searchInputRef.current?.focus();
          return;
        }

        // If search is focused but empty, just blur
        if (isSearchFocused && !hasSearchContent) {
          event.preventDefault();
          searchInputRef.current?.blur();
          return;
        }
      }
    },
    [enabled, searchInputRef, searchQuery, onClearSearch, onClearSelection]
  );

  useEffect(() => {
    if (!enabled) return;

    // Add event listener to the document for global keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}

export default useKeyboardShortcuts;
