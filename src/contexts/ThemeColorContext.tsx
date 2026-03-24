/**
 * ThemeColorContext - Context provider for layout theme and color customization
 * Requirements: 1.2, 1.5, 1.6, 2.3, 2.5, 2.6, 2.7, 5.4, 6.1
 * 
 * Manages:
 * - Layout theme mode (light/dark) for SVG transformations
 * - Accent color selection
 * - SVG transformation with caching
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { storageService } from '../services/storage';
import { 
  transformSvg, 
  DEFAULT_ACCENT_COLOR, 
  DEFAULT_LAYOUT_THEME,
  isDefaultSettings,
} from '../services/svg-transformer';
import { transformedSvgCache } from '../services/transformed-svg-cache';

/**
 * Theme color state interface
 */
export interface ThemeColorState {
  /** Layout theme mode - affects SVG backgrounds and text colors */
  layoutTheme: 'light' | 'dark';
  /** Selected accent color for interactive elements */
  accentColor: string;
  /** Whether user has customized colors (for reset functionality) */
  isCustomized: boolean;
}

/**
 * Context value interface extending state with actions
 */
export interface ThemeColorContextValue extends ThemeColorState {
  /** Set the layout theme mode */
  setLayoutTheme: (theme: 'light' | 'dark') => void;
  /** Set the accent color */
  setAccentColor: (color: string) => void;
  /** Reset to default colors */
  resetToDefaults: () => void;
  /** Get transformed SVG with current theme/color settings */
  getTransformedSvg: (originalSvg: string) => string;
}

// Create context with undefined default
const ThemeColorContext = createContext<ThemeColorContextValue | undefined>(undefined);

/**
 * Props for the ThemeColorProvider component
 */
interface ThemeColorProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeColorProvider - Provides theme color state and actions to the component tree
 * 
 * Requirements:
 * - 1.5, 1.6: Persist and restore Theme_Mode from localStorage
 * - 2.6, 2.7: Persist and restore Accent_Color from localStorage
 * - 6.1: Update Layout_Preview elements without page refresh
 */
export const ThemeColorProvider: React.FC<ThemeColorProviderProps> = ({ children }) => {
  // Initialize state from localStorage
  const [state, setState] = useState<ThemeColorState>(() => {
    const layoutTheme = storageService.getLayoutTheme();
    const accentColor = storageService.getAccentColor();
    const isCustomized = layoutTheme !== DEFAULT_LAYOUT_THEME || 
                         accentColor.toUpperCase() !== DEFAULT_ACCENT_COLOR.toUpperCase();
    return {
      layoutTheme,
      accentColor,
      isCustomized,
    };
  });

  /**
   * Set layout theme and persist to localStorage
   * Requirement 1.5: Persist selected Theme_Mode to localStorage
   */
  const setLayoutTheme = useCallback((layoutTheme: 'light' | 'dark') => {
    setState((prev) => ({
      ...prev,
      layoutTheme,
      isCustomized: layoutTheme !== DEFAULT_LAYOUT_THEME || 
                    prev.accentColor.toUpperCase() !== DEFAULT_ACCENT_COLOR.toUpperCase(),
    }));
    storageService.saveLayoutTheme(layoutTheme);
  }, []);

  /**
   * Set accent color and persist to localStorage
   * Requirement 2.6: Persist selected Accent_Color to localStorage
   */
  const setAccentColor = useCallback((accentColor: string) => {
    // Validate hex color format
    if (!/^#[0-9A-Fa-f]{6}$/.test(accentColor)) {
      return;
    }
    setState((prev) => ({
      ...prev,
      accentColor,
      isCustomized: prev.layoutTheme !== DEFAULT_LAYOUT_THEME || 
                    accentColor.toUpperCase() !== DEFAULT_ACCENT_COLOR.toUpperCase(),
    }));
    storageService.saveAccentColor(accentColor);
  }, []);

  /**
   * Reset to default colors
   * Requirement 5.4: Clear custom color settings and restore defaults
   */
  const resetToDefaults = useCallback(() => {
    setState({
      layoutTheme: DEFAULT_LAYOUT_THEME,
      accentColor: DEFAULT_ACCENT_COLOR,
      isCustomized: false,
    });
    storageService.clearThemeColorSettings();
    transformedSvgCache.clear();
  }, []);

  /**
   * Get transformed SVG with current theme/color settings
   * Requirements: 1.2, 2.3, 2.5, 6.2
   */
  const getTransformedSvg = useCallback((originalSvg: string): string => {
    if (!originalSvg) return originalSvg;

    const options = {
      themeMode: state.layoutTheme,
      accentColor: state.accentColor,
    };

    // Return original if at default settings
    if (isDefaultSettings(options)) {
      return originalSvg;
    }

    // Check cache first
    const svgHash = transformedSvgCache.hashSvg(originalSvg);
    const cacheKey = {
      svgHash,
      themeMode: state.layoutTheme,
      accentColor: state.accentColor,
    };

    const cached = transformedSvgCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    // Transform and cache
    const transformed = transformSvg(originalSvg, options);
    transformedSvgCache.set(cacheKey, transformed);

    return transformed;
  }, [state.layoutTheme, state.accentColor]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<ThemeColorContextValue>(
    () => ({
      ...state,
      setLayoutTheme,
      setAccentColor,
      resetToDefaults,
      getTransformedSvg,
    }),
    [state, setLayoutTheme, setAccentColor, resetToDefaults, getTransformedSvg]
  );

  return (
    <ThemeColorContext.Provider value={contextValue}>
      {children}
    </ThemeColorContext.Provider>
  );
};

/**
 * Custom hook to access theme color context
 * Throws an error if used outside of ThemeColorProvider
 */
export const useThemeColor = (): ThemeColorContextValue => {
  const context = useContext(ThemeColorContext);
  
  if (context === undefined) {
    throw new Error('useThemeColor must be used within a ThemeColorProvider');
  }
  
  return context;
};

// Export context for testing purposes
export { ThemeColorContext };
