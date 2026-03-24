import { useCallback, useRef, useState } from 'react';
import type { ComponentItem } from '../types';

/**
 * Options for the useGridNavigation hook
 */
interface UseGridNavigationOptions {
  /** Array of items in the grid */
  items: ComponentItem[];
  /** Number of columns in the grid */
  columnCount: number;
  /** Callback when an item should be inserted */
  onInsert: (item: ComponentItem) => void;
  /** Callback when selection is cleared */
  onClearSelection?: () => void;
}

/**
 * Return type for the useGridNavigation hook
 */
interface UseGridNavigationReturn {
  /** Currently focused item index (-1 if none) */
  focusedIndex: number;
  /** Set the focused index */
  setFocusedIndex: (index: number) => void;
  /** Ref array for card elements */
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  /** Handle keyboard events on a card */
  handleCardKeyDown: (e: React.KeyboardEvent, item: ComponentItem, index: number) => void;
  /** Clear the current selection */
  clearSelection: () => void;
}

/**
 * Hook to handle arrow key navigation within the Component_Grid
 * 
 * Requirements:
 * - 6.4: Support up/down/left/right navigation within grid
 * - 6.5: Escape clears selection (handled via onClearSelection callback)
 * 
 * Navigation behavior:
 * - ArrowRight: Move to next item (wraps to next row)
 * - ArrowLeft: Move to previous item (wraps to previous row)
 * - ArrowDown: Move to item directly below
 * - ArrowUp: Move to item directly above
 * - Home: Move to first item
 * - End: Move to last item
 * - Enter: Insert the focused item
 */
export function useGridNavigation({
  items,
  columnCount,
  onInsert,
  onClearSelection,
}: UseGridNavigationOptions): UseGridNavigationReturn {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  /**
   * Clear the current selection
   * Requirement 6.5: Clear selection
   */
  const clearSelection = useCallback(() => {
    setFocusedIndex(-1);
    onClearSelection?.();
  }, [onClearSelection]);

  /**
   * Handle keyboard navigation on a card
   * Requirement 6.4: Arrow key navigation within grid
   */
  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent, item: ComponentItem, index: number) => {
      const totalItems = items.length;
      let newIndex = index;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          // Move to next item, wrap to next row if at end of row
          newIndex = Math.min(index + 1, totalItems - 1);
          break;

        case 'ArrowLeft':
          e.preventDefault();
          // Move to previous item, wrap to previous row if at start of row
          newIndex = Math.max(index - 1, 0);
          break;

        case 'ArrowDown':
          e.preventDefault();
          // Move to item directly below (same column, next row)
          newIndex = Math.min(index + columnCount, totalItems - 1);
          break;

        case 'ArrowUp':
          e.preventDefault();
          // Move to item directly above (same column, previous row)
          newIndex = Math.max(index - columnCount, 0);
          break;

        case 'Home':
          e.preventDefault();
          // Move to first item
          newIndex = 0;
          break;

        case 'End':
          e.preventDefault();
          // Move to last item
          newIndex = totalItems - 1;
          break;

        case 'Enter':
          e.preventDefault();
          // Insert the focused item (Requirement 6.3)
          onInsert(item);
          return;

        default:
          // Don't handle other keys
          return;
      }

      // Update focus if index changed
      if (newIndex !== index && newIndex >= 0 && newIndex < totalItems) {
        setFocusedIndex(newIndex);
        // Focus the new card element
        cardRefs.current[newIndex]?.focus();
      }
    },
    [items.length, columnCount, onInsert]
  );

  return {
    focusedIndex,
    setFocusedIndex,
    cardRefs,
    handleCardKeyDown,
    clearSelection,
  };
}

export default useGridNavigation;
