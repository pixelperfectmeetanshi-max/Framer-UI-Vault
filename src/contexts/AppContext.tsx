/**
 * AppContext - Context provider for managing application state
 * Requirements: 9.1, 9.4, 15.4, 16.1, 16.2, 16.3, 16.4
 * 
 * Manages:
 * - Theme preference (light/dark)
 * - Active category selection
 * - Search query (persisted within session)
 * - Favorites list (persisted to localStorage)
 * - Recently used components (persisted to localStorage)
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Theme, RecentItem, ComponentItem } from '../types';
import { storageService } from '../services/storage';

/**
 * Maximum number of recently used items to track
 * Requirement 9.1: Track the last 10 inserted components
 */
const MAX_RECENTLY_USED = 10;

/**
 * Application state interface
 */
interface AppState {
  theme: Theme;
  activeCategory: string;
  searchQuery: string;
  favorites: string[];
  recentlyUsed: RecentItem[];
  isHelpOpen: boolean;
}

/**
 * Context value interface extending state with actions
 */
interface AppContextValue extends AppState {
  setTheme: (theme: Theme) => void;
  setActiveCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  toggleFavorite: (id: string) => void;
  addToRecentlyUsed: (item: ComponentItem) => void;
  clearRecentlyUsed: () => void;
  toggleHelp: () => void;
  closeHelp: () => void;
  resetPreferences: () => void;
}

// Create context with undefined default (will be provided by AppProvider)
const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * Props for the AppProvider component
 */
interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * AppProvider - Provides application state and actions to the component tree
 * 
 * Requirement 16.4: Restore user's last view state when plugin opens
 * 
 * @example
 * ```tsx
 * <AppProvider>
 *   <App />
 * </AppProvider>
 * ```
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Initialize state from localStorage
  // Requirement 16.4: Restore user's last view state when plugin opens
  const [state, setState] = useState<AppState>(() => {
    const preferences = storageService.getPreferences();
    return {
      theme: preferences.theme,
      activeCategory: preferences.lastCategory,
      searchQuery: '', // Search query is session-only per Requirement 16.3
      favorites: preferences.favorites,
      recentlyUsed: preferences.recentlyUsed,
      isHelpOpen: false, // Help panel starts closed
    };
  });

  /**
   * Set theme and persist to localStorage
   * Requirement 16.2: Remember user's theme preference across sessions
   */
  const setTheme = useCallback((theme: Theme) => {
    setState((prev) => ({ ...prev, theme }));
    storageService.saveTheme(theme);
  }, []);

  /**
   * Set active category and persist to localStorage
   * Requirement 16.1: Remember last selected category across sessions
   */
  const setActiveCategory = useCallback((category: string) => {
    setState((prev) => ({ ...prev, activeCategory: category }));
    storageService.saveLastCategory(category);
  }, []);

  /**
   * Set search query (session-only, not persisted)
   * Requirement 16.3: Remember search query when switching categories within a session
   */
  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  /**
   * Toggle favorite status for a component
   * Requirement 15.4: Persist favorites in localStorage
   */
  const toggleFavorite = useCallback((id: string) => {
    setState((prev) => {
      const isFavorite = prev.favorites.includes(id);
      const newFavorites = isFavorite
        ? prev.favorites.filter((favId) => favId !== id)
        : [...prev.favorites, id];
      
      // Persist to localStorage
      storageService.saveFavorites(newFavorites);
      
      return { ...prev, favorites: newFavorites };
    });
  }, []);

  /**
   * Add a component to recently used list
   * Requirement 9.1: Track the last 10 inserted components
   * Requirement 9.4: Persist recently used components in localStorage
   */
  const addToRecentlyUsed = useCallback((item: ComponentItem) => {
    setState((prev) => {
      // Remove existing entry for this item if present
      const filtered = prev.recentlyUsed.filter((recent) => recent.id !== item.id);
      
      // Add new entry at the beginning
      const newRecentItem: RecentItem = {
        id: item.id,
        timestamp: Date.now(),
      };
      
      // Keep only the last MAX_RECENTLY_USED items
      const newRecentlyUsed = [newRecentItem, ...filtered].slice(0, MAX_RECENTLY_USED);
      
      // Persist to localStorage
      storageService.saveRecentlyUsed(newRecentlyUsed);
      
      return { ...prev, recentlyUsed: newRecentlyUsed };
    });
  }, []);

  /**
   * Clear the recently used list
   * Requirement 9.5: Provide option to clear the recently used list
   */
  const clearRecentlyUsed = useCallback(() => {
    setState((prev) => ({ ...prev, recentlyUsed: [] }));
    storageService.saveRecentlyUsed([]);
  }, []);

  /**
   * Toggle help panel visibility
   * Requirement 1.2: Display Help_Panel when user clicks help icon
   */
  const toggleHelp = useCallback(() => {
    setState((prev) => ({ ...prev, isHelpOpen: !prev.isHelpOpen }));
  }, []);

  /**
   * Close help panel
   * Requirement 1.6: Close Help_Panel on click outside or Escape key
   */
  const closeHelp = useCallback(() => {
    setState((prev) => ({ ...prev, isHelpOpen: false }));
  }, []);

  /**
   * Reset all preferences to defaults
   * Requirement 16.5: Provide option to reset all preferences to defaults
   */
  const resetPreferences = useCallback(() => {
    storageService.clearAll();
    const defaults = storageService.getPreferences();
    setState({
      theme: defaults.theme,
      activeCategory: defaults.lastCategory,
      searchQuery: '',
      favorites: defaults.favorites,
      recentlyUsed: defaults.recentlyUsed,
      isHelpOpen: false,
    });
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AppContextValue>(
    () => ({
      ...state,
      setTheme,
      setActiveCategory,
      setSearchQuery,
      toggleFavorite,
      addToRecentlyUsed,
      clearRecentlyUsed,
      toggleHelp,
      closeHelp,
      resetPreferences,
    }),
    [
      state,
      setTheme,
      setActiveCategory,
      setSearchQuery,
      toggleFavorite,
      addToRecentlyUsed,
      clearRecentlyUsed,
      toggleHelp,
      closeHelp,
      resetPreferences,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Custom hook to access app context
 * Throws an error if used outside of AppProvider
 * 
 * @example
 * ```tsx
 * const { theme, setTheme, favorites, toggleFavorite } = useApp();
 * ```
 */
export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
};

// Export context for testing purposes
export { AppContext };
export type { AppState, AppContextValue };
