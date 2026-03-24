/**
 * EmptyState component for displaying when search returns no results
 * Requirement 8.3: Display empty state UI with suggestions when search returns no results
 */

import React from 'react';
import { themes } from '../theme';
import type { Theme } from '../types';

/**
 * Props for the EmptyState component
 */
export interface EmptyStateProps {
  searchQuery: string;
  theme: Theme;
  onClearSearch?: () => void;
  suggestions?: string[];
}

/**
 * Search icon for empty state illustration
 */
function SearchIllustration({ color }: { color: string }) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: 0.5 }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

/**
 * Default suggestions to show when no results found
 */
const DEFAULT_SUGGESTIONS = [
  'Try using fewer keywords',
  'Check for typos in your search',
  'Try searching for a category name',
  'Browse all components by selecting "All"',
];

/**
 * EmptyState - Displays a helpful message when search returns no results
 * 
 * Requirement 8.3: Display empty state UI with suggestions when search returns no results
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   searchQuery="nonexistent"
 *   theme="light"
 *   onClearSearch={() => setSearchQuery('')}
 * />
 * ```
 */
export function EmptyState({
  searchQuery,
  theme,
  onClearSearch,
  suggestions = DEFAULT_SUGGESTIONS,
}: EmptyStateProps) {
  const colors = themes[theme];

  return (
    <div
      style={styles.container}
      role="status"
      aria-label={`No results found for "${searchQuery}"`}
    >
      {/* Illustration */}
      <div style={styles.illustration}>
        <SearchIllustration color={colors.textSecondary} />
      </div>

      {/* Title */}
      <h3 style={{ ...styles.title, color: colors.textPrimary }}>
        No results found
      </h3>

      {/* Description */}
      <p style={{ ...styles.description, color: colors.textSecondary }}>
        We couldn't find any components matching{' '}
        <span style={{ ...styles.searchTerm, color: colors.textPrimary }}>
          "{searchQuery}"
        </span>
      </p>

      {/* Suggestions */}
      <div style={styles.suggestionsContainer}>
        <p style={{ ...styles.suggestionsTitle, color: colors.textSecondary }}>
          Suggestions:
        </p>
        <ul style={styles.suggestionsList}>
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              style={{ ...styles.suggestionItem, color: colors.textSecondary }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      {/* Clear search button */}
      {onClearSearch && (
        <button
          type="button"
          onClick={onClearSearch}
          style={{
            ...styles.clearButton,
            background: colors.bgActive,
            color: colors.textActive,
            borderColor: colors.border,
          }}
        >
          Clear search
        </button>
      )}
    </div>
  );
}

/**
 * EmptyState styles using 4px-based spacing grid
 * Requirement 11.2: Use consistent 4px-based spacing throughout the interface
 * Requirement 11.3: Include subtle transition animations on interactive elements
 */
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px', // 48px = 12 * 4px, 24px = 6 * 4px
    textAlign: 'center' as const,
  },
  illustration: {
    marginBottom: '24px', // 24px = 6 * 4px
  },
  title: {
    margin: '0 0 8px 0', // 8px = 2 * 4px
    fontSize: '18px',
    fontWeight: 600,
  },
  description: {
    margin: '0 0 24px 0', // 24px = 6 * 4px
    fontSize: '14px',
    lineHeight: 1.5,
  },
  searchTerm: {
    fontWeight: 500,
  },
  suggestionsContainer: {
    marginBottom: '24px', // 24px = 6 * 4px
    textAlign: 'left' as const,
  },
  suggestionsTitle: {
    margin: '0 0 8px 0', // 8px = 2 * 4px
    fontSize: '13px',
    fontWeight: 500,
  },
  suggestionsList: {
    margin: 0,
    padding: '0 0 0 20px', // 20px = 5 * 4px
    listStyle: 'disc',
  },
  suggestionItem: {
    fontSize: '13px',
    lineHeight: 1.6,
  },
  clearButton: {
    padding: '8px 20px', // 8px = 2 * 4px, 20px = 5 * 4px
    borderRadius: '4px', // 4px = 1 * 4px
    border: '1px solid',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 200ms ease, background-color 200ms ease, transform 150ms ease',
  },
};

export default EmptyState;
