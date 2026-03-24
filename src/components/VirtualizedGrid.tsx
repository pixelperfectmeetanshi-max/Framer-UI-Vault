import React, { useCallback, useMemo, useRef, useState } from "react";
import { FixedSizeGrid as Grid } from "react-window";
import Card from "./Card";
import { ErrorBoundary } from "./ErrorBoundary";
import { themes } from "../theme";
import { useApp } from "../contexts/AppContext";
import type { ComponentItem, Theme } from "../types";

/**
 * Props for the VirtualizedGrid component
 * Requirements: 5.5 - Use virtualization for lists exceeding 20 items
 * Requirements: 6.4 - Support arrow key navigation within grid
 * Requirements: 8.4 - Support search text highlighting
 */
export interface VirtualizedGridProps {
  items: ComponentItem[];
  onInsert: (item: ComponentItem) => Promise<void>;
  theme: Theme;
  columnCount?: number;
  rowHeight?: number;
  containerWidth?: number;
  containerHeight?: number;
  /** Search query for text highlighting (Requirement 8.4) */
  searchQuery?: string;
}

/**
 * Cell props for the virtualized grid (react-window v2 API)
 * These props are passed via cellProps and merged with built-in props
 */
interface GridCellProps {
  items: ComponentItem[];
  columnCount: number;
  onInsert: (item: ComponentItem) => Promise<void>;
  theme: Theme;
  focusedIndex: number;
  onKeyDown: (e: React.KeyboardEvent, item: ComponentItem, index: number) => void;
  onFocus: (index: number) => void;
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  searchQuery: string;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

/**
 * Full cell component props including built-in props from react-window
 */
interface CellComponentProps {
  ariaAttributes: {
    "aria-colindex": number;
    role: "gridcell";
  };
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  items: ComponentItem[];
  columnCount: number;
  onInsert: (item: ComponentItem) => Promise<void>;
  theme: Theme;
  focusedIndex: number;
  onKeyDown: (e: React.KeyboardEvent, item: ComponentItem, index: number) => void;
  onFocus: (index: number) => void;
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  searchQuery: string;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

/**
 * Cell renderer for the virtualized grid
 * Renders individual Card components within the grid with keyboard navigation support
 * Requirements: 6.1, 6.2, 6.3, 6.4 - Keyboard navigation and focus indicators
 * Requirements: 15.1, 15.2, 15.5 - Favorite functionality on cards
 */
function CellComponent({
  columnIndex,
  rowIndex,
  style,
  items,
  columnCount,
  onInsert,
  theme,
  focusedIndex,
  onKeyDown,
  onFocus,
  cardRefs,
  searchQuery,
  favorites,
  toggleFavorite,
}: CellComponentProps): React.ReactElement | null {
  const index = rowIndex * columnCount + columnIndex;

  // Return empty cell if index is out of bounds
  if (index >= items.length) {
    return <div style={style} />;
  }

  const item = items[index];
  
  // Safety check for item
  if (!item) {
    return <div style={style} />;
  }

  return (
    <div 
      style={{ ...style, padding: 8 }}
      ref={(el) => { cardRefs.current[index] = el; }}
      onFocus={() => onFocus(index)}
    >
      <ErrorBoundary level="card">
        <Card 
          item={item} 
          onInsert={onInsert} 
          theme={theme}
          isFavorite={favorites.includes(item.id)}
          onToggleFavorite={toggleFavorite}
          tabIndex={focusedIndex === -1 && index === 0 ? 0 : focusedIndex === index ? 0 : -1}
          onKeyDown={(e, cardItem) => onKeyDown(e, cardItem, index)}
          searchQuery={searchQuery}
        />
      </ErrorBoundary>
    </div>
  );
}

/**
 * VirtualizedGrid component for efficient rendering of large component lists
 * Requirements: 5.5 - Use react-window for lists exceeding 20 items
 * Requirements: 6.4 - Support arrow key navigation within grid
 * Requirements: 15.1, 15.2, 15.5 - Favorite functionality on cards
 *
 * This component uses react-window's FixedSizeGrid to virtualize the rendering
 * of component cards, only rendering items that are currently visible in the viewport.
 */
export function VirtualizedGrid({
  items,
  onInsert,
  theme,
  columnCount = 4,
  rowHeight = 180,
  containerWidth = 600,
  containerHeight = 500,
  searchQuery = '',
}: VirtualizedGridProps) {
  const colors = themes[theme];
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Get favorites and toggle function from AppContext (Requirements 15.2, 15.5)
  const { favorites, toggleFavorite } = useApp();

  // Calculate the number of rows needed
  const rowCount = useMemo(
    () => Math.ceil(items.length / columnCount),
    [items.length, columnCount]
  );

  // Calculate column width based on container width and column count
  const columnWidth = useMemo(
    () => Math.floor(containerWidth / columnCount),
    [containerWidth, columnCount]
  );

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

  // Memoize the cell props to prevent unnecessary re-renders
  const cellPropsData = useMemo<GridCellProps>(
    () => ({
      items,
      columnCount,
      onInsert,
      theme,
      focusedIndex,
      onKeyDown: handleCardKeyDown,
      onFocus: handleCardFocus,
      cardRefs,
      searchQuery,
      favorites,
      toggleFavorite,
    }),
    [items, columnCount, onInsert, theme, focusedIndex, handleCardKeyDown, handleCardFocus, searchQuery, favorites, toggleFavorite]
  );

  // Memoize the insert handler
  const handleInsert = useCallback(
    async (item: ComponentItem) => {
      await onInsert(item);
    },
    [onInsert]
  );

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
    <Grid
      columnCount={columnCount}
      columnWidth={columnWidth}
      rowCount={rowCount}
      rowHeight={rowHeight}
      width={containerWidth}
      height={containerHeight}
      style={{
        overflowX: "hidden",
      }}
      itemData={cellPropsData}
    >
      {({ columnIndex, rowIndex, style, data }: { columnIndex: number; rowIndex: number; style: React.CSSProperties; data: GridCellProps }) => {
        const index = rowIndex * data.columnCount + columnIndex;
        if (index >= data.items.length) {
          return <div style={style} />;
        }
        const item = data.items[index];
        if (!item) {
          return <div style={style} />;
        }
        return (
          <div 
            style={{ ...style, padding: 8 }}
            ref={(el) => { data.cardRefs.current[index] = el; }}
            onFocus={() => data.onFocus(index)}
          >
            <ErrorBoundary level="card">
              <Card 
                item={item} 
                onInsert={data.onInsert} 
                theme={data.theme}
                isFavorite={data.favorites.includes(item.id)}
                onToggleFavorite={data.toggleFavorite}
                tabIndex={data.focusedIndex === -1 && index === 0 ? 0 : data.focusedIndex === index ? 0 : -1}
                onKeyDown={(e, cardItem) => data.onKeyDown(e, cardItem, index)}
                searchQuery={data.searchQuery}
              />
            </ErrorBoundary>
          </div>
        );
      }}
    </Grid>
  );
}

export default VirtualizedGrid;
