/**
 * SearchInput component for filtering components
 * Requirements: 8.1 - Filter components in real-time as user types
 * Requirements: 8.5 - Include clear button when text is present
 * Requirements: 7.3 - Include aria-label and aria-describedby for search instructions
 */

import React, { useCallback } from 'react';
import { themes } from '../theme';
import type { Theme } from '../types';

// Search instructions ID for aria-describedby (Requirement 7.3)
const SEARCH_INSTRUCTIONS_ID = 'search-instructions';

/**
 * Props for the SearchInput component
 */
export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  theme: Theme;
  inputRef?: React.RefObject<HTMLInputElement>;
  placeholder?: string;
}

/**
 * Clear button icon component
 */
function ClearIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/**
 * Search icon component
 */
function SearchIcon({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/**
 * SearchInput - A search input component with real-time filtering and clear button
 * 
 * Requirement 8.1: Filter components in real-time as user types
 * Requirement 8.5: Include clear button when text is present
 * Requirement 7.3: Include aria-label and aria-describedby for search instructions
 * 
 * @example
 * ```tsx
 * <SearchInput
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   onClear={() => setSearchQuery('')}
 *   theme="light"
 *   inputRef={searchInputRef}
 * />
 * ```
 */
export function SearchInput({
  value,
  onChange,
  onClear,
  theme,
  inputRef,
  placeholder = 'Search components...',
}: SearchInputProps) {
  const colors = themes[theme];
  const hasValue = value.length > 0;

  /**
   * Handle input change - triggers real-time filtering
   * Requirement 8.1: Filter components in real-time as user types
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  /**
   * Handle clear button click
   * Requirement 8.5: Include clear button when text is present
   */
  const handleClear = useCallback(() => {
    onClear();
    // Focus the input after clearing
    inputRef?.current?.focus();
  }, [onClear, inputRef]);

  /**
   * Handle keyboard events for accessibility
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Escape key clears the search (handled by parent via keyboard shortcuts)
      // This is just for additional UX - clicking clear button
      if (e.key === 'Escape' && hasValue) {
        e.stopPropagation();
        handleClear();
      }
    },
    [hasValue, handleClear]
  );

  return (
    <div style={styles.container}>
      {/* Search icon */}
      <div style={styles.searchIcon}>
        <SearchIcon color={colors.textSecondary} />
      </div>

      {/* Search input - Requirement 7.3: aria-label and aria-describedby */}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-label="Search components"
        aria-describedby={SEARCH_INSTRUCTIONS_ID}
        style={{
          ...styles.input,
          background: colors.cardBg,
          color: colors.textPrimary,
          borderColor: colors.border,
        }}
      />

      {/* Hidden search instructions for screen readers (Requirement 7.3) */}
      <span id={SEARCH_INSTRUCTIONS_ID} style={styles.visuallyHidden}>
        Type to filter components by name. Press Escape to clear search. Use Cmd or Ctrl plus F to focus search.
      </span>

      {/* Clear button - Requirement 8.5: Show when text is present */}
      {hasValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          style={{
            ...styles.clearButton,
            background: colors.bgHover,
          }}
        >
          <ClearIcon color={colors.textSecondary} />
        </button>
      )}
    </div>
  );
}

/**
 * SearchInput styles using 4px-based spacing grid
 * Requirement 11.2: Use consistent 4px-based spacing throughout the interface
 * Requirement 11.3: Include subtle transition animations on interactive elements
 */
const styles = {
  container: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute' as const,
    left: '12px', // 12px = 3 * 4px
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none' as const,
  },
  input: {
    padding: '8px 36px 8px 36px', // 8px = 2 * 4px, 36px = 9 * 4px
    borderRadius: '4px', // 4px = 1 * 4px
    border: '1px solid',
    fontSize: '14px',
    outline: 'none',
    width: '220px', // 220px = 55 * 4px
    transition: 'border-color 200ms ease, box-shadow 200ms ease, background-color 200ms ease',
  },
  clearButton: {
    position: 'absolute' as const,
    right: '8px', // 8px = 2 * 4px
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px', // 4px = 1 * 4px
    border: 'none',
    borderRadius: '4px', // 4px = 1 * 4px
    cursor: 'pointer',
    transition: 'background-color 200ms ease, opacity 200ms ease',
  },
  visuallyHidden: {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap' as const,
    border: 0,
  },
};

export default SearchInput;
