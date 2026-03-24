import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { VirtualizedGrid } from "./components/VirtualizedGrid";
import { KeyboardNavigableGrid } from "./components/KeyboardNavigableGrid";
import { SearchInput } from "./components/SearchInput";
import { EmptyState } from "./components/EmptyState";
import { HelpPanel } from "./components/HelpPanel";
import { ThemeSettingsPanel } from "./components/ThemeSettingsPanel";
import { useKeyboardShortcuts } from "./hooks";
import { useApp } from "./contexts/AppContext";
import { useThemeColor } from "./contexts/ThemeColorContext";
import { components } from "./data";
import { themes, type Theme } from "./theme";
import type { ComponentItem } from "./types";

// Threshold for using virtualized grid (Requirement 5.5)
const VIRTUALIZATION_THRESHOLD = 20;

// Special category name for recently used components (Requirement 9.2)
const RECENTLY_USED_CATEGORY = "Recently Used";

// Special category name for favorited components (Requirement 15.3)
const FAVORITES_CATEGORY = "Favorites";

export default function App({ onInsert }: { onInsert: (item: ComponentItem) => void }) {
  const [active, setActive] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  // Track the previous category before search (Requirement 8.6)
  const [previousCategory, setPreviousCategory] = useState("All");
  const [theme, setTheme] = useState<Theme>("light");
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 600, height: 500 });

  // Get recently used items and favorites from AppContext (Requirements 9.3, 15.3)
  const { recentlyUsed, favorites, isHelpOpen, toggleHelp, closeHelp } = useApp();
  
  // Get theme color context for SVG transformations
  const { getTransformedSvg } = useThemeColor();

  // ✅ Handle search query change (Requirement 8.1: real-time filtering)
  const handleSearchChange = useCallback((value: string) => {
    // Store current category before starting search (Requirement 8.6)
    if (searchQuery === "" && value !== "") {
      setPreviousCategory(active);
    }
    setSearchQuery(value);
  }, [searchQuery, active]);

  // ✅ Clear search handler (Requirement 8.6: restore previous category view)
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    // Restore previous category when search is cleared (Requirement 8.6)
    setActive(previousCategory);
  }, [previousCategory]);

  // ✅ Clear selection handler for Escape key (Requirement 6.5)
  const handleClearSelection = useCallback(() => {
    // This will be called when Escape is pressed to clear grid selection
    // The actual focus management is handled by the keyboard shortcuts hook
  }, []);

  // ✅ Keyboard shortcuts (Cmd/Ctrl+F for search, Escape to clear)
  useKeyboardShortcuts({
    searchInputRef,
    searchQuery,
    onClearSearch: handleClearSearch,
    onClearSelection: handleClearSelection,
  });

  // ✅ Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // ✅ Track container dimensions for virtualized grid
  useEffect(() => {
    const updateDimensions = () => {
      if (contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect();
        // Account for padding (32px on each side)
        setContainerDimensions({
          width: Math.max(rect.width - 64, 300),
          height: Math.max(rect.height - 200, 300),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // ✅ Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const colors = themes[theme];

  /**
   * Get recently used components in reverse chronological order
   * Requirement 9.3: Display recently inserted components in reverse chronological order
   */
  const recentlyUsedComponents = useMemo(() => {
    // recentlyUsed is already sorted by timestamp (most recent first) from AppContext
    return recentlyUsed
      .map(recent => components.find(c => c.id === recent.id))
      .filter((c): c is ComponentItem => c !== undefined);
  }, [recentlyUsed]);

  /**
   * Get favorited components
   * Requirement 15.3: Display favorited components in Favorites category
   */
  const favoritedComponents = useMemo(() => {
    return favorites
      .map(id => components.find(c => c.id === id))
      .filter((c): c is ComponentItem => c !== undefined);
  }, [favorites]);

  // ✅ Filter components by search AND category (Requirement 8.2: combined filtering)
  const filteredComponents = useMemo(() => {
    // Handle "Favorites" category (Requirement 15.3)
    if (active === FAVORITES_CATEGORY) {
      let filtered = favoritedComponents;
      
      // Apply search filter to favorited items
      if (searchQuery) {
        filtered = filtered.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      return filtered;
    }

    // Handle "Recently Used" category (Requirement 9.3)
    if (active === RECENTLY_USED_CATEGORY) {
      let filtered = recentlyUsedComponents;
      
      // Apply search filter to recently used items
      if (searchQuery) {
        filtered = filtered.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      return filtered;
    }

    let filtered = components;
    
    // Apply search filter (Requirement 8.1: real-time filtering)
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter (Requirement 8.2: combined search and category filtering)
    if (active !== "All") {
      filtered = filtered.filter((item) => item.category === active);
    }
    
    return filtered;
  }, [searchQuery, active, recentlyUsedComponents, favoritedComponents]);

  // ✅ Group by category (memoized)
  const groupedByCategory = useMemo(() => {
    return filteredComponents.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category]!.push(item);
      return acc;
    }, {} as Record<string, typeof components>);
  }, [filteredComponents]);

  // ✅ Auto-detect categories (memoized)
  const categories = useMemo(() => {
    return Array.from(new Set(components.map((c) => c.category)));
  }, []);

  // ✅ Insert into Framer canvas
  const handleInsert = useCallback(async (item: ComponentItem) => {
    try {
      await onInsert(item);
    } catch (error) {
      console.error("Insert failed:", error);
    }
  }, [onInsert]);

  // ✅ Calculate column count based on container width
  const columnCount = useMemo(() => {
    const minColumnWidth = 156; // 140px card + 16px gap
    return Math.max(1, Math.floor(containerDimensions.width / minColumnWidth));
  }, [containerDimensions.width]);

  // ✅ Category filter logic (Requirement 8.2: combined search and category filtering)
  // For "Recently Used" and "Favorites", we don't group by category - show as a single list
  const displayCategories = active === RECENTLY_USED_CATEGORY 
    ? [RECENTLY_USED_CATEGORY]
    : active === FAVORITES_CATEGORY
      ? [FAVORITES_CATEGORY]
      : active === "All" 
        ? categories 
        : [active];

  // ✅ Calculate total filtered results for aria-live announcement (Requirement 7.4)
  const totalFilteredResults = useMemo(() => {
    return filteredComponents.length;
  }, [filteredComponents]);

  // ✅ Previous results count for detecting changes
  const prevResultsRef = useRef(totalFilteredResults);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  // ✅ Announce result count changes to screen readers (Requirement 7.4)
  useEffect(() => {
    if (prevResultsRef.current !== totalFilteredResults) {
      const announcement = totalFilteredResults === 0
        ? "No components found"
        : totalFilteredResults === 1
        ? "1 component found"
        : `${totalFilteredResults} components found`;
      setLiveAnnouncement(announcement);
      prevResultsRef.current = totalFilteredResults;
    }
  }, [totalFilteredResults]);

  return (
    <div style={{ ...styles.container, background: colors.background }}>
      {/* Aria-live region for screen reader announcements (Requirement 7.4) */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={styles.visuallyHidden}
      >
        {liveAnnouncement}
      </div>

      <Sidebar
        active={active}
        setActive={setActive}
        theme={theme}
      />

      {/* Main content area - Requirement 7.6: semantic HTML */}
      <main ref={contentRef} style={{ ...styles.content, background: colors.background }}>
        {/* HEADER - Requirement 7.6: semantic HTML */}
        <header
          style={{
            ...styles.header,
            background: colors.background,
            borderBottomColor: colors.border,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <h1 style={{ ...styles.title, color: colors.textPrimary }}>
              Framer UI Vault
            </h1>

            {/* SEARCH - Requirement 8.1, 8.5: SearchInput with real-time filtering and clear button */}
            <SearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              theme={theme}
              inputRef={searchInputRef}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* THEME SETTINGS BUTTON - Requirements 5.1, 5.2 */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsThemeSettingsOpen(!isThemeSettingsOpen)}
                aria-label="Open layout theme settings"
                aria-expanded={isThemeSettingsOpen}
                aria-haspopup="dialog"
                style={{
                  ...styles.themeToggle,
                  background: colors.background,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              </button>
              <ThemeSettingsPanel
                isOpen={isThemeSettingsOpen}
                onClose={() => setIsThemeSettingsOpen(false)}
                theme={theme}
              />
            </div>

            {/* HELP BUTTON - Requirement 1.1: Display help icon button in header area */}
            <button
              onClick={toggleHelp}
              aria-label="Open help and documentation"
              aria-expanded={isHelpOpen}
              aria-haspopup="dialog"
              style={{
                ...styles.themeToggle,
                background: colors.background,
                color: colors.textPrimary,
                borderColor: colors.border,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>

            {/* THEME TOGGLE - Requirement 7.1: aria-label on interactive elements */}
            <button
              onClick={toggleTheme}
              aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
              style={{
                ...styles.themeToggle,
                background: colors.background,
                color: colors.textPrimary,
                borderColor: colors.border,
              }}
            >
            {theme === "light" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>
          </div>
        </header>

        {/* HELP PANEL - Requirements 1.2, 1.3, 1.4, 1.5, 1.6, 17.4 */}
        <HelpPanel
          isOpen={isHelpOpen}
          onClose={closeHelp}
          theme={theme}
        />

        {/* CONTENT - Requirement 7.6: semantic HTML with section elements */}
        <div style={styles.contentInner} role="region" aria-label="Component library">
          {/* Instructions Banner */}
          <div style={{
            padding: "12px 16px",
            marginBottom: "24px",
            borderRadius: "8px",
            background: theme === "light" ? "#F1F5F9" : "#1E293B",
            border: `1px solid ${colors.border}`,
            color: colors.textSecondary,
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            lineHeight: 1.5
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span><strong>Tip:</strong> Click any component below to instantly insert a highly customizable skeletal structure directly onto your canvas.</span>
          </div>

          {/* Empty state when search returns no results (Requirement 8.3) */}
          {totalFilteredResults === 0 && searchQuery ? (
            <EmptyState
              searchQuery={searchQuery}
              theme={theme}
              onClearSearch={handleClearSearch}
            />
          ) : active === FAVORITES_CATEGORY ? (
            /* Favorites category - display favorited components (Requirement 15.3) */
            filteredComponents.length > 0 ? (
              <section style={styles.section} aria-labelledby="category-favorites">
                <div style={styles.sectionHeader}>
                  <h2
                    id="category-favorites"
                    style={{
                      ...styles.sectionTitle,
                      color: colors.textPrimary,
                    }}
                  >
                    Favorites
                  </h2>

                  <span
                    style={{
                      ...styles.count,
                      color: colors.textSecondary,
                    }}
                  >
                    ({filteredComponents.length})
                  </span>
                </div>

                <div
                  style={{
                    ...styles.divider,
                    background: colors.border,
                  }}
                />

                {/* Use VirtualizedGrid for lists exceeding 20 items (Requirement 5.5) */}
                {filteredComponents.length > VIRTUALIZATION_THRESHOLD ? (
                  <VirtualizedGrid
                    items={filteredComponents}
                    onInsert={handleInsert}
                    theme={theme}
                    columnCount={columnCount}
                    rowHeight={180}
                    containerWidth={containerDimensions.width}
                    containerHeight={Math.min(
                      containerDimensions.height,
                      Math.ceil(filteredComponents.length / columnCount) * 180
                    )}
                    searchQuery={searchQuery}
                  />
                ) : (
                  <KeyboardNavigableGrid
                    items={filteredComponents}
                    onInsert={handleInsert}
                    theme={theme}
                    columnCount={columnCount}
                    onClearSelection={handleClearSelection}
                    searchQuery={searchQuery}
                  />
                )}
              </section>
            ) : (
              /* Empty state for Favorites when no items */
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 24px",
                textAlign: "center",
              }}>
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.textSecondary}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginBottom: 16, opacity: 0.5 }}
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <h3 style={{ 
                  margin: "0 0 8px 0", 
                  fontSize: 16, 
                  fontWeight: 600,
                  color: colors.textPrimary 
                }}>
                  No favorite components
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: 14, 
                  color: colors.textSecondary,
                  maxWidth: 300
                }}>
                  Click the bookmark icon on any component to add it to your favorites.
                </p>
              </div>
            )
          ) : active === RECENTLY_USED_CATEGORY ? (
            /* Recently Used category - display as single list in reverse chronological order (Requirement 9.3) */
            filteredComponents.length > 0 ? (
              <section style={styles.section} aria-labelledby="category-recently-used">
                <div style={styles.sectionHeader}>
                  <h2
                    id="category-recently-used"
                    style={{
                      ...styles.sectionTitle,
                      color: colors.textPrimary,
                    }}
                  >
                    Recently Used
                  </h2>

                  <span
                    style={{
                      ...styles.count,
                      color: colors.textSecondary,
                    }}
                  >
                    ({filteredComponents.length})
                  </span>
                </div>

                <div
                  style={{
                    ...styles.divider,
                    background: colors.border,
                  }}
                />

                {/* Use VirtualizedGrid for lists exceeding 20 items (Requirement 5.5) */}
                {filteredComponents.length > VIRTUALIZATION_THRESHOLD ? (
                  <VirtualizedGrid
                    items={filteredComponents}
                    onInsert={handleInsert}
                    theme={theme}
                    columnCount={columnCount}
                    rowHeight={180}
                    containerWidth={containerDimensions.width}
                    containerHeight={Math.min(
                      containerDimensions.height,
                      Math.ceil(filteredComponents.length / columnCount) * 180
                    )}
                    searchQuery={searchQuery}
                  />
                ) : (
                  <KeyboardNavigableGrid
                    items={filteredComponents}
                    onInsert={handleInsert}
                    theme={theme}
                    columnCount={columnCount}
                    onClearSelection={handleClearSelection}
                    searchQuery={searchQuery}
                  />
                )}
              </section>
            ) : (
              /* Empty state for Recently Used when no items */
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 24px",
                textAlign: "center",
              }}>
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.textSecondary}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginBottom: 16, opacity: 0.5 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <h3 style={{ 
                  margin: "0 0 8px 0", 
                  fontSize: 16, 
                  fontWeight: 600,
                  color: colors.textPrimary 
                }}>
                  No recently used components
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: 14, 
                  color: colors.textSecondary,
                  maxWidth: 300
                }}>
                  Components you insert will appear here for quick access.
                </p>
              </div>
            )
          ) : (
            displayCategories.map((category) => {
              const categoryItems = groupedByCategory[category] || [];
              if (categoryItems.length === 0) return null;
              
              return (
                <section key={category} style={styles.section} aria-labelledby={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div style={styles.sectionHeader}>
                    <h2
                      id={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                      style={{
                        ...styles.sectionTitle,
                        color: colors.textPrimary,
                      }}
                    >
                      {category}
                    </h2>

                    <span
                      style={{
                        ...styles.count,
                        color: colors.textSecondary,
                      }}
                    >
                      ({categoryItems.length})
                    </span>
                  </div>

                  <div
                    style={{
                      ...styles.divider,
                      background: colors.border,
                    }}
                  />

                  {/* Use VirtualizedGrid for lists exceeding 20 items (Requirement 5.5) */}
                  {categoryItems.length > VIRTUALIZATION_THRESHOLD ? (
                    <VirtualizedGrid
                      items={categoryItems}
                      onInsert={handleInsert}
                      theme={theme}
                      columnCount={columnCount}
                      rowHeight={180}
                      containerWidth={containerDimensions.width}
                      containerHeight={Math.min(
                        containerDimensions.height,
                        Math.ceil(categoryItems.length / columnCount) * 180
                      )}
                      searchQuery={searchQuery}
                    />
                  ) : (
                    <KeyboardNavigableGrid
                      items={categoryItems}
                      onInsert={handleInsert}
                      theme={theme}
                      columnCount={columnCount}
                      onClearSelection={handleClearSelection}
                      searchQuery={searchQuery}
                    />
                  )}
                </section>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

/**
 * App styles using 4px-based spacing grid
 * Requirement 11.2: Use consistent 4px-based spacing throughout the interface
 * Requirement 11.3: Include subtle transition animations on interactive elements
 */
const styles = {
  container: {
    display: "flex",
    width: "100%",
    height: "100vh",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  content: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    flexDirection: "column" as const,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 32px", // 20px = 5 * 4px, 32px = 8 * 4px
    borderBottom: "1px solid",
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: "-0.5px",
  },
  themeToggle: {
    padding: "8px", // 8px = 2 * 4px
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "4px", // 4px = 1 * 4px
    cursor: "pointer",
    fontSize: 16,
    transition: "all 200ms ease, background-color 200ms ease, border-color 200ms ease",
    border: "1px solid",
  },
  contentInner: {
    flex: 1,
    overflow: "auto",
    padding: 32, // 32px = 8 * 4px
  },
  section: {
    marginBottom: 48, // 48px = 12 * 4px
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8, // 8px = 2 * 4px
    marginBottom: 20, // 20px = 5 * 4px
  },
  sectionTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
    letterSpacing: "-0.3px",
  },
  count: {
    fontSize: 14,
    fontWeight: 500,
  },
  divider: {
    height: 1,
    marginBottom: 20, // 20px = 5 * 4px
    borderRadius: 1,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: 16, // 16px = 4 * 4px
  },
  // Visually hidden but accessible to screen readers (Requirement 7.3, 7.4)
  visuallyHidden: {
    position: "absolute" as const,
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap" as const,
    border: 0,
  },
};