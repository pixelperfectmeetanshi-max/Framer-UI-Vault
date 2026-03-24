import React, { useRef, useCallback, useState } from "react";
import Card from "./Card";
import { ErrorBoundary } from "./ErrorBoundary";
import { themes } from "../theme";
import { useApp } from "../contexts/AppContext";
import type { ComponentItem, Theme } from "../types";

/**
 * Props for the KeyboardNavigableGrid component
 */
export interface KeyboardNavigableGridProps {
  items: ComponentItem[];
  onInsert: (item: ComponentItem) => Promise<void>;
  theme: Theme;
  columnCount: number;
  /** Callback when selection is cleared (e.g., via Escape key) */
  onClearSelection?: () => void;
  /** Search query for text highlighting (Requirement 8.4) */
  searchQuery?: string;
}

/**
 * KeyboardNavigableGrid component with arrow key navigation support
 * 
 * Requirements:
 * - 6.1: Tab key navigation through all interactive elements
 * - 6.2: Visible focus indicator on focused Component_Cards
 * - 6.3: Enter key initiates insert operation
 * - 6.4: Arrow key navigation within the Component_Grid
 * - 15.1, 15.2, 15.5: Favorite functionality on cards
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
export function KeyboardNavigableGrid({
  items,
  onInsert,
  theme,
  columnCount,
  onClearSelection,
  searchQuery = '',
}: KeyboardNavigableGridProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const colors = themes[theme];
  
  // Get favorites and toggle function from AppContext (Requirements 15.2, 15.5)
  const { favorites, toggleFavorite } = useApp();

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
          newIndex = Math.min(index + 1, totalItems - 1);
          break;

        case 'ArrowLeft':
          e.preventDefault();
          newIndex = Math.max(index - 1, 0);
          break;

        case 'ArrowDown':
          e.preventDefault();
          newIndex = Math.min(index + columnCount, totalItems - 1);
          break;

        case 'ArrowUp':
          e.preventDefault();
          newIndex = Math.max(index - columnCount, 0);
          break;

        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;

        case 'End':
          e.preventDefault();
          newIndex = totalItems - 1;
          break;

        default:
          // Don't handle other keys - let Card handle Enter
          return;
      }

      if (newIndex !== index && newIndex >= 0 && newIndex < totalItems) {
        setFocusedIndex(newIndex);
        cardRefs.current[newIndex]?.focus();
      }
    },
    [items.length, columnCount]
  );

  /**
   * Handle focus on a card
   */
  const handleCardFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  if (items.length === 0) {
    return (
      <div
        style={{
          padding: 32,
          textAlign: "center",
          color: colors.textSecondary,
        }}
      >
        No components found
      </div>
    );
  }

  return (
    <div
      role="grid"
      aria-label="Component grid"
      style={styles.grid}
    >
      {items.map((item, index) => (
        <ErrorBoundary key={item.id} level="card">
          <div
            ref={(el) => { cardRefs.current[index] = el; }}
            role="gridcell"
            onFocus={() => handleCardFocus(index)}
          >
            <Card
              item={item}
              onInsert={onInsert}
              theme={theme}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={toggleFavorite}
              tabIndex={focusedIndex === -1 && index === 0 ? 0 : focusedIndex === index ? 0 : -1}
              onKeyDown={(e, cardItem) => handleCardKeyDown(e, cardItem, index)}
              searchQuery={searchQuery}
            />
          </div>
        </ErrorBoundary>
      ))}
    </div>
  );
}

/**
 * Grid styles using 4px-based spacing
 * Requirement 11.2: Use consistent 4px-based spacing throughout the interface
 */
const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: 16, // 16px = 4 * 4px
  },
};

export default KeyboardNavigableGrid;
