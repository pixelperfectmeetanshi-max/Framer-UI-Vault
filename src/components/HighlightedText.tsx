/**
 * HighlightedText component for highlighting matching text in search results
 * Requirement 8.4: Highlight matching text in component names during search
 */

import React, { useMemo } from 'react';
import { themes } from '../theme';
import type { Theme } from '../types';

/**
 * Props for the HighlightedText component
 */
export interface HighlightedTextProps {
  text: string;
  highlight: string;
  theme: Theme;
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * HighlightedText - Renders text with matching portions highlighted
 * 
 * Requirement 8.4: Highlight matching text in component names during search
 * 
 * @example
 * ```tsx
 * <HighlightedText
 *   text="Hero Section"
 *   highlight="hero"
 *   theme="light"
 * />
 * // Renders: <span><mark>Hero</mark> Section</span>
 * ```
 */
export function HighlightedText({
  text,
  highlight,
  theme,
}: HighlightedTextProps) {
  const colors = themes[theme];

  /**
   * Split text into parts with highlighted matches
   * Uses case-insensitive matching
   */
  const parts = useMemo(() => {
    if (!highlight.trim()) {
      return [{ text, isHighlight: false }];
    }

    const escapedHighlight = escapeRegExp(highlight);
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const splitParts = text.split(regex);

    return splitParts
      .filter((part) => part !== '')
      .map((part) => ({
        text: part,
        isHighlight: part.toLowerCase() === highlight.toLowerCase(),
      }));
  }, [text, highlight]);

  // If no highlight or no matches, return plain text
  if (!highlight.trim() || parts.length === 1) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {parts.map((part, index) =>
        part.isHighlight ? (
          <mark
            key={index}
            style={{
              ...styles.highlight,
              background: theme === 'light' ? '#fef08a' : '#854d0e',
              color: colors.textPrimary,
            }}
          >
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </span>
  );
}

const styles = {
  highlight: {
    padding: '0 2px',
    borderRadius: '2px',
    fontWeight: 'inherit' as const,
  },
};

export default HighlightedText;
