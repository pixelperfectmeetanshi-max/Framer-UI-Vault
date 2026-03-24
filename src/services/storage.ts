/**
 * Storage service for localStorage persistence
 * Requirements: 16.1, 16.2, 16.5
 * 
 * Handles persisting user preferences including:
 * - Theme preference (light/dark)
 * - Last selected category
 * - Favorite components
 * - Recently used components
 */

import type { Theme, UserPreferences, RecentItem } from '../types';

/**
 * Storage keys for localStorage
 * Using namespaced keys to avoid conflicts with other plugins
 */
const STORAGE_KEYS = {
  THEME: 'framer-ui-vault-theme',
  LAST_CATEGORY: 'framer-ui-vault-last-category',
  FAVORITES: 'framer-ui-vault-favorites',
  RECENTLY_USED: 'framer-ui-vault-recently-used',
  // Theme color customization keys (Requirements 1.5, 1.6, 2.6, 2.7)
  LAYOUT_THEME: 'framer-ui-vault-layout-theme',
  ACCENT_COLOR: 'framer-ui-vault-accent-color',
} as const;

/**
 * Default user preferences
 */
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  lastCategory: 'All',
  favorites: [],
  recentlyUsed: [],
};

/**
 * Safely parse JSON from localStorage
 * Returns null if parsing fails or value doesn't exist
 */
function safeJsonParse<T>(value: string | null): T | null {
  if (value === null) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Check if localStorage is available
 * Some environments may not support localStorage
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Storage service for persisting user preferences
 * Requirement 16.1: Remember last selected category across sessions
 * Requirement 16.2: Remember user's theme preference across sessions
 * Requirement 16.5: Provide option to reset all preferences to defaults
 */
export const storageService = {
  /**
   * Get all user preferences from localStorage
   * Returns default preferences for any missing values
   */
  getPreferences(): UserPreferences {
    if (!isLocalStorageAvailable()) {
      return { ...DEFAULT_PREFERENCES };
    }

    const theme = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null;
    const lastCategory = localStorage.getItem(STORAGE_KEYS.LAST_CATEGORY);
    const favorites = safeJsonParse<string[]>(localStorage.getItem(STORAGE_KEYS.FAVORITES));
    const recentlyUsed = safeJsonParse<RecentItem[]>(localStorage.getItem(STORAGE_KEYS.RECENTLY_USED));

    return {
      theme: theme && (theme === 'light' || theme === 'dark') ? theme : DEFAULT_PREFERENCES.theme,
      lastCategory: lastCategory ?? DEFAULT_PREFERENCES.lastCategory,
      favorites: Array.isArray(favorites) ? favorites : DEFAULT_PREFERENCES.favorites,
      recentlyUsed: Array.isArray(recentlyUsed) ? recentlyUsed : DEFAULT_PREFERENCES.recentlyUsed,
    };
  },

  /**
   * Save theme preference to localStorage
   * Requirement 16.2: Remember user's theme preference across sessions
   */
  saveTheme(theme: Theme): void {
    if (!isLocalStorageAvailable()) {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  /**
   * Save last selected category to localStorage
   * Requirement 16.1: Remember last selected category across sessions
   */
  saveLastCategory(category: string): void {
    if (!isLocalStorageAvailable()) {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.LAST_CATEGORY, category);
  },

  /**
   * Save favorites list to localStorage
   * Requirement 15.4: Persist favorites in localStorage
   */
  saveFavorites(favorites: string[]): void {
    if (!isLocalStorageAvailable()) {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  },

  /**
   * Save recently used items to localStorage
   * Requirement 9.4: Persist recently used components in localStorage
   */
  saveRecentlyUsed(items: RecentItem[]): void {
    if (!isLocalStorageAvailable()) {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.RECENTLY_USED, JSON.stringify(items));
  },

  /**
   * Clear all stored preferences and reset to defaults
   * Requirement 16.5: Provide option to reset all preferences to defaults
   */
  clearAll(): void {
    if (!isLocalStorageAvailable()) {
      return;
    }
    localStorage.removeItem(STORAGE_KEYS.THEME);
    localStorage.removeItem(STORAGE_KEYS.LAST_CATEGORY);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(STORAGE_KEYS.RECENTLY_USED);
    localStorage.removeItem(STORAGE_KEYS.LAYOUT_THEME);
    localStorage.removeItem(STORAGE_KEYS.ACCENT_COLOR);
  },

  // ============================================================================
  // Theme Color Customization Methods (Requirements 1.5, 1.6, 2.6, 2.7)
  // ============================================================================

  /**
   * Save layout theme preference (for SVG transformations)
   * Requirement 1.5: Persist selected Theme_Mode to localStorage
   */
  saveLayoutTheme(layoutTheme: 'light' | 'dark'): void {
    if (!isLocalStorageAvailable()) {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.LAYOUT_THEME, layoutTheme);
  },

  /**
   * Get layout theme preference
   * Requirement 1.6: Restore previously selected Theme_Mode from localStorage
   */
  getLayoutTheme(): 'light' | 'dark' {
    if (!isLocalStorageAvailable()) {
      return 'light';
    }
    const value = localStorage.getItem(STORAGE_KEYS.LAYOUT_THEME);
    return value === 'dark' ? 'dark' : 'light';
  },

  /**
   * Save accent color preference
   * Requirement 2.6: Persist selected Accent_Color to localStorage
   */
  saveAccentColor(color: string): void {
    if (!isLocalStorageAvailable()) {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.ACCENT_COLOR, color);
  },

  /**
   * Get accent color preference
   * Requirement 2.7: Restore previously selected Accent_Color from localStorage
   */
  getAccentColor(): string {
    if (!isLocalStorageAvailable()) {
      return '#3B82F6'; // Default blue
    }
    const value = localStorage.getItem(STORAGE_KEYS.ACCENT_COLOR);
    // Validate hex color format
    if (value && /^#[0-9A-Fa-f]{6}$/.test(value)) {
      return value;
    }
    return '#3B82F6'; // Default blue
  },

  /**
   * Clear only theme color settings (for reset functionality)
   * Requirement 5.4: Reset to default colors
   */
  clearThemeColorSettings(): void {
    if (!isLocalStorageAvailable()) {
      return;
    }
    localStorage.removeItem(STORAGE_KEYS.LAYOUT_THEME);
    localStorage.removeItem(STORAGE_KEYS.ACCENT_COLOR);
  },
};

// Export storage keys for testing purposes
export { STORAGE_KEYS, DEFAULT_PREFERENCES };
