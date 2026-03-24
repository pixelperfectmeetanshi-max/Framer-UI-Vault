/**
 * Framer Design System Color Palette
 * Requirement 11.1: Use Framer's standard color palette for UI elements
 * Requirement 11.5: Support both light and dark themes matching Framer's appearance
 * 
 * Colors are based on Framer's official design language:
 * - Primary blues for interactive elements
 * - Neutral grays for backgrounds and borders
 * - Semantic colors for feedback states
 */
export const themes = {
  light: {
    // Primary colors - Framer blue accent
    primary: "#0099FF",
    primaryHover: "#007ACC",
    secondary: "#ffffff",
    
    // Background colors - Framer light theme
    background: "#ffffff",
    foreground: "#1a1a1a",
    sidebarBg: "#FAFAFA",
    cardBg: "#F5F5F5",
    
    // Border colors - Framer subtle borders
    border: "#E5E5E5",
    borderLight: "#EBEBEB",
    
    // Text colors - Framer typography
    textPrimary: "#1a1a1a",
    textSecondary: "#666666",
    textTertiary: "#999999",
    
    // Interactive states - Framer hover/active
    bgHover: "#F0F0F0",
    bgActive: "#0099FF",
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
    focusRing: "#0099FF",
    focusRingOffset: "#ffffff",
  },
  dark: {
    // Primary colors - Framer blue accent (brighter for dark mode)
    primary: "#0099FF",
    primaryHover: "#33ADFF",
    secondary: "#1a1a1a",
    
    // Background colors - Framer dark theme
    background: "#111111",
    foreground: "#ffffff",
    sidebarBg: "#161616",
    cardBg: "#1C1C1C",
    
    // Border colors - Framer subtle borders (dark)
    border: "#2A2A2A",
    borderLight: "#222222",
    
    // Text colors - Framer typography (dark)
    textPrimary: "#ffffff",
    textSecondary: "#A0A0A0",
    textTertiary: "#666666",
    
    // Interactive states - Framer hover/active (dark)
    bgHover: "#252525",
    bgActive: "#0099FF",
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
    
    // Focus indicator - Framer accessibility (dark)
    focusRing: "#0099FF",
    focusRingOffset: "#111111",
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