/**
 * Framer Design System Color Palette
 * Requirement 11.1: Use Framer's standard color palette for UI elements
 * Requirement 11.5: Support both light and dark themes matching Framer's appearance
 * 
 * Uses Framer's built-in CSS variables that automatically adjust based on
 * the light/dark mode setting in Framer:
 * - --framer-color-bg: Background color
 * - --framer-color-bg-secondary: Secondary background
 * - --framer-color-bg-tertiary: Tertiary background
 * - --framer-color-text: Primary text color
 * - --framer-color-text-secondary: Secondary text
 * - --framer-color-text-tertiary: Tertiary text
 * - --framer-color-divider: Border/divider color
 * - --framer-color-tint: Accent/tint color
 */

/**
 * Helper to detect if we're in dark mode using Framer's CSS
 * This checks the computed style of the document
 */
export function getFramerTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  // Check if Framer's dark mode class is present
  const isDark = document.documentElement.classList.contains('framer-dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  return isDark ? 'dark' : 'light';
}

/**
 * Colors that use Framer's CSS variables for automatic theme switching
 * These will automatically update when Framer's theme changes
 */
export const framerColors = {
  // Use CSS variables directly - these auto-switch with Framer's theme
  background: "var(--framer-color-bg, #ffffff)",
  backgroundSecondary: "var(--framer-color-bg-secondary, #fafafa)",
  backgroundTertiary: "var(--framer-color-bg-tertiary, #f5f5f5)",
  text: "var(--framer-color-text, #1a1a1a)",
  textSecondary: "var(--framer-color-text-secondary, #666666)",
  textTertiary: "var(--framer-color-text-tertiary, #999999)",
  divider: "var(--framer-color-divider, #e5e5e5)",
  tint: "var(--framer-color-tint, #0099ff)",
  tintDimmed: "var(--framer-color-tint-dimmed, #0077cc)",
};

/**
 * Theme colors - kept for backward compatibility but now both themes
 * use the same values since Framer handles the switching via CSS variables
 */
export const themes = {
  light: {
    // Primary colors - Framer blue accent
    primary: "var(--framer-color-tint, #0099FF)",
    primaryHover: "var(--framer-color-tint-dimmed, #007ACC)",
    secondary: "var(--framer-color-bg, #ffffff)",
    
    // Background colors - using Framer CSS variables
    background: "var(--framer-color-bg, #ffffff)",
    foreground: "var(--framer-color-text, #1a1a1a)",
    sidebarBg: "var(--framer-color-bg-secondary, #FAFAFA)",
    cardBg: "var(--framer-color-bg-tertiary, #F5F5F5)",
    
    // Border colors - Framer divider
    border: "var(--framer-color-divider, #E5E5E5)",
    borderLight: "var(--framer-color-divider, #EBEBEB)",
    
    // Text colors - Framer typography
    textPrimary: "var(--framer-color-text, #1a1a1a)",
    textSecondary: "var(--framer-color-text-secondary, #666666)",
    textTertiary: "var(--framer-color-text-tertiary, #999999)",
    
    // Interactive states
    bgHover: "var(--framer-color-bg-tertiary, #F0F0F0)",
    bgActive: "var(--framer-color-tint, #0099FF)",
    textActive: "#ffffff",
    
    // Shadows - Framer elevation system
    shadow: "0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.04)",
    shadowHover: "0 4px 8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
    shadowElevated: "0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)",
    
    // Toast state colors - Framer semantic colors
    successBg: "#E6F9F0",
    successText: "#0D7D4D",
    successBorder: "#34D399",
    errorBg: "#FEE9E9",
    errorText: "#D92D20",
    errorBorder: "#F87171",
    infoBg: "#E6F4FF",
    infoText: "#0066CC",
    infoBorder: "#60A5FA",
    
    // Focus indicator - Framer accessibility
    focusRing: "var(--framer-color-tint, #0099FF)",
    focusRingOffset: "var(--framer-color-bg, #ffffff)",
  },
  dark: {
    // Dark theme now uses the same CSS variables - Framer handles the switching
    primary: "var(--framer-color-tint, #0099FF)",
    primaryHover: "var(--framer-color-tint-dimmed, #33ADFF)",
    secondary: "var(--framer-color-bg, #1a1a1a)",
    
    // Background colors - using Framer CSS variables
    background: "var(--framer-color-bg, #111111)",
    foreground: "var(--framer-color-text, #ffffff)",
    sidebarBg: "var(--framer-color-bg-secondary, #161616)",
    cardBg: "var(--framer-color-bg-tertiary, #1C1C1C)",
    
    // Border colors - Framer divider
    border: "var(--framer-color-divider, #2A2A2A)",
    borderLight: "var(--framer-color-divider, #222222)",
    
    // Text colors - Framer typography
    textPrimary: "var(--framer-color-text, #ffffff)",
    textSecondary: "var(--framer-color-text-secondary, #A0A0A0)",
    textTertiary: "var(--framer-color-text-tertiary, #666666)",
    
    // Interactive states
    bgHover: "var(--framer-color-bg-tertiary, #252525)",
    bgActive: "var(--framer-color-tint, #0099FF)",
    textActive: "#ffffff",
    
    // Shadows - Framer elevation system (dark)
    shadow: "0 1px 2px rgba(0, 0, 0, 0.2), 0 1px 4px rgba(0, 0, 0, 0.2)",
    shadowHover: "0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)",
    shadowElevated: "0 8px 24px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3)",
    
    // Toast state colors - Framer semantic colors (dark)
    successBg: "#0D3D2D",
    successText: "#34D399",
    successBorder: "#059669",
    errorBg: "#3D1D1D",
    errorText: "#F87171",
    errorBorder: "#DC2626",
    infoBg: "#1D2D4D",
    infoText: "#60A5FA",
    infoBorder: "#2563EB",
    
    // Focus indicator - Framer accessibility
    focusRing: "var(--framer-color-tint, #0099FF)",
    focusRingOffset: "var(--framer-color-bg, #111111)",
  }
};

/**
 * Spacing scale based on 4px grid
 * Requirement 11.2: Use consistent 4px-based spacing throughout the interface
 */
export const spacing = {
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 12,   // 12px
  lg: 16,   // 16px
  xl: 20,   // 20px
  xxl: 24,  // 24px
  xxxl: 32, // 32px
} as const;

/**
 * Transition presets for interactive elements
 * Requirement 11.3: Include subtle transition animations on interactive elements
 */
export const transitions = {
  fast: "150ms ease",
  normal: "200ms ease",
  slow: "300ms ease",
  // Specific transitions
  hover: "all 200ms ease",
  focus: "all 150ms ease",
  transform: "transform 200ms ease",
  opacity: "opacity 200ms ease",
  shadow: "box-shadow 200ms ease",
  background: "background-color 200ms ease",
  color: "color 150ms ease",
  border: "border-color 200ms ease",
} as const;

export type Theme = "light" | "dark";