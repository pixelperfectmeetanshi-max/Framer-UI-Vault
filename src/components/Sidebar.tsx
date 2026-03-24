import React, { useRef, useCallback, useState, useMemo } from "react";
import { components } from "../data";
import { themes } from "../theme";
import type { SidebarProps } from "../types";
import { useApp } from "../contexts/AppContext";

/**
 * Dynamically extract unique categories from components array
 * Requirement 14.6: Sidebar automatically displays new categories when components are added
 */
const getUniqueCategories = (): string[] => {
  const categorySet = new Set<string>();
  components.forEach(component => categorySet.add(component.category));
  return Array.from(categorySet);
};

/**
 * Special category name for recently used components
 * Requirement 9.2: Display a "Recently Used" category when recent items exist
 */
const RECENTLY_USED_CATEGORY = "Recently Used";

/**
 * Special category name for favorited components
 * Requirement 15.3: Display a "Favorites" category when favorited items exist
 */
const FAVORITES_CATEGORY = "Favorites";

/**
 * Sidebar component with keyboard navigation support
 * Requirements: 6.1 - Tab key navigation through interactive elements
 * Requirements: 6.6 - Arrow key navigation for category items
 * Requirements: 7.5 - aria-pressed state indicating selection
 * Requirements: 7.6 - Semantic HTML with nav element
 * Requirements: 9.2 - Display "Recently Used" category when recent items exist
 * Requirements: 9.5 - Provide option to clear the recently used list
 * Requirements: 15.3 - Display "Favorites" category when favorited items exist
 */
export default function Sidebar({ active, setActive, theme }: SidebarProps) {
  const colors = themes[theme];
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { recentlyUsed, clearRecentlyUsed, favorites } = useApp();

  // Build the full category list including special categories if items exist
  // Requirement 9.2: Display "Recently Used" category when recent items exist
  // Requirement 15.3: Display "Favorites" category when favorited items exist
  // Requirement 14.6: Sidebar automatically displays new categories when components are added
  const allCategories = useMemo(() => {
    const specialCategories: string[] = [];
    
    // Add Favorites category if there are favorited items
    if (favorites.length > 0) {
      specialCategories.push(FAVORITES_CATEGORY);
    }
    
    // Add Recently Used category if there are recent items
    if (recentlyUsed.length > 0) {
      specialCategories.push(RECENTLY_USED_CATEGORY);
    }
    
    // Get dynamic categories from components array
    const dynamicCategories = getUniqueCategories();
    
    return [...specialCategories, "All", ...dynamicCategories];
  }, [favorites.length, recentlyUsed.length]);

  // Count components per category
  const getCount = (category: string): number => {
    if (category === FAVORITES_CATEGORY) return favorites.length;
    if (category === RECENTLY_USED_CATEGORY) return recentlyUsed.length;
    if (category === "All") return components.length;
    return components.filter((c) => c.category === category).length;
  };

  /**
   * Handle keyboard navigation within sidebar
   * Requirements: 6.6 - Support arrow key navigation for category items
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
      let newIndex = index;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          newIndex = Math.min(index + 1, allCategories.length - 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          newIndex = Math.max(index - 1, 0);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          const selectedCategory = allCategories[index];
          if (selectedCategory) {
            setActive(selectedCategory);
          }
          return;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = allCategories.length - 1;
          break;
        default:
          return;
      }

      if (newIndex !== index) {
        setFocusedIndex(newIndex);
        categoryRefs.current[newIndex]?.focus();
      }
    },
    [setActive, allCategories]
  );

  /**
   * Handle clear recently used button click
   * Requirement 9.5: Provide option to clear the recently used list
   */
  const handleClearRecentlyUsed = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering category selection
    clearRecentlyUsed();
    // If currently viewing Recently Used, switch to All
    if (active === RECENTLY_USED_CATEGORY) {
      setActive("All");
    }
  }, [clearRecentlyUsed, active, setActive]);

  return (
    <nav 
      style={{ ...styles.sidebar, background: colors.sidebarBg, borderRightColor: colors.border }}
      aria-label="Component categories"
    >
      <div style={{ ...styles.header, color: colors.textSecondary }}>
        <span style={styles.headerText}>LIBRARY</span>
      </div>
      <div role="group" aria-label="Category filters">
        {allCategories.map((cat, index) => (
          <div
            key={cat}
            ref={(el) => { categoryRefs.current[index] = el; }}
            role="button"
            aria-pressed={active === cat}
            aria-label={`${cat} category, ${getCount(cat)} components`}
            tabIndex={active === cat ? 0 : -1}
            onClick={() => setActive(cat)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={() => setFocusedIndex(index)}
            style={{
              ...styles.item,
              background: active === cat ? colors.bgActive : "transparent",
              color: active === cat ? colors.textActive : colors.textPrimary,
              outline: focusedIndex === index ? `2px solid ${colors.focusRing}` : 'none',
              outlineOffset: '2px',
            }}
          >
            <div style={styles.categoryRow}>
              {/* Bookmark icon for Favorites category - Requirement 15.3 */}
              {cat === FAVORITES_CATEGORY && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: 6, flexShrink: 0 }}
                  aria-hidden="true"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              )}
              {/* Clock icon for Recently Used category */}
              {cat === RECENTLY_USED_CATEGORY && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: 6, flexShrink: 0 }}
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              )}
              <span style={styles.categoryName}>{cat}</span>
            </div>
            <div style={styles.countRow}>
              <span style={styles.count} aria-hidden="true">({getCount(cat)})</span>
              {/* Clear button for Recently Used category */}
              {cat === RECENTLY_USED_CATEGORY && (
                <button
                  onClick={handleClearRecentlyUsed}
                  aria-label="Clear recently used components"
                  title="Clear recently used"
                  style={{
                    ...styles.clearButton,
                    color: active === cat ? colors.textActive : colors.textSecondary,
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

/**
 * Sidebar styles using 4px-based spacing grid
 * Requirement 11.2: Use consistent 4px-based spacing throughout the interface
 * Requirement 11.3: Include subtle transition animations on interactive elements
 */
const styles = {
  sidebar: {
    width: 220, // 220px = 55 * 4px
    borderRight: "1px solid",
    padding: "24px 16px", // 24px = 6 * 4px, 16px = 4 * 4px
    overflowY: "auto" as const,
    height: "100vh",
    boxSizing: "border-box" as const,
  },
  header: {
    fontSize: "11px",
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    marginBottom: "24px", // 24px = 6 * 4px
    paddingBottom: "12px", // 12px = 3 * 4px
    borderBottom: "1px solid",
  },
  headerText: {
    display: "block",
  },
  item: {
    padding: "8px 12px", // 8px = 2 * 4px, 12px = 3 * 4px
    cursor: "pointer",
    borderRadius: "4px", // 4px = 1 * 4px
    marginBottom: "4px", // 4px = 1 * 4px
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
    transition: "all 200ms ease, background-color 200ms ease, color 150ms ease",
  },
  categoryRow: {
    display: "flex",
    alignItems: "center",
  },
  categoryName: {
    fontWeight: "500" as const,
  },
  countRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px", // 8px = 2 * 4px
  },
  count: {
    fontSize: "11px",
    fontWeight: "400" as const,
    opacity: 0.7,
  },
  clearButton: {
    background: "none",
    border: "none",
    padding: "4px", // 4px = 1 * 4px
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "4px", // 4px = 1 * 4px
    opacity: 0.6,
    transition: "opacity 200ms ease, background-color 200ms ease",
  },
};