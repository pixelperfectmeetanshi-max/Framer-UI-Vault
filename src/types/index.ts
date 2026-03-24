/**
 * Core type definitions for the Framer UI Vault plugin
 * Requirements: 12.2, 12.3, 12.4, 13.1, 13.3
 */

// Re-export SVG parser types for convenience
export type {
  NodeType,
  NodeAttributes,
  ParsedNode,
  ParseError,
  ParseResult,
  StackProperties,
} from './svg-parser';

// Theme type for light/dark mode support
export type Theme = 'light' | 'dark';

// Toast notification types
export type ToastType = 'success' | 'error' | 'info';

/**
 * Represents a UI component item in the library
 * Requirement 13.1: ComponentItem interface with id, name, category, and svg properties
 */
export interface ComponentItem {
  id: string;
  name: string;
  category: string;
  svg: string;
}

/**
 * Represents a recently used component with timestamp
 * Used for tracking insertion history
 */
export interface RecentItem {
  id: string;
  timestamp: number;
}

/**
 * Represents a toast notification item
 * Requirement 13.3: Theme interface for theme configuration
 */
export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  createdAt: number;
}

/**
 * User preferences stored in localStorage
 * Requirements: 12.2, 12.3 - explicit interfaces for component props
 */
export interface UserPreferences {
  theme: Theme;
  lastCategory: string;
  favorites: string[];
  recentlyUsed: RecentItem[];
}

/**
 * Theme color palette for UI elements
 * Requirement 11.1: Use Framer's standard color palette for UI elements
 * Requirement 11.5: Support both light and dark themes matching Framer's appearance
 * Requirement 12.4: Replace all `any` types with proper type definitions
 */
export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryHover: string;
  secondary: string;
  
  // Background colors
  background: string;
  foreground: string;
  sidebarBg: string;
  cardBg: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  // Interactive states
  bgHover: string;
  bgActive: string;
  textActive: string;
  
  // Shadows - Framer elevation system
  shadow: string;
  shadowHover: string;
  shadowElevated: string;
  
  // Toast state colors - semantic colors
  successBg: string;
  successText: string;
  successBorder: string;
  errorBg: string;
  errorText: string;
  errorBorder: string;
  infoBg: string;
  infoText: string;
  infoBorder: string;
  
  // Focus indicator for accessibility
  focusRing: string;
  focusRingOffset: string;
}

/**
 * Theme configuration containing both light and dark theme colors
 * Requirement 13.3: Theme interface for theme configuration
 */
export interface ThemeConfig {
  light: ThemeColors;
  dark: ThemeColors;
}

/**
 * Category information for sidebar display
 */
export interface CategoryInfo {
  name: string;
  count: number;
}

/**
 * Props for the Card component
 * Requirement 13.4: Card component SHALL use typed props instead of `any`
 * Requirement 8.4: Support search text highlighting
 */
export interface CardProps {
  item: ComponentItem;
  onInsert: (item: ComponentItem) => void;
  theme?: Theme;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  isLoading?: boolean;
  tabIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent, item: ComponentItem) => void;
  /** Search query for text highlighting (Requirement 8.4) */
  searchQuery?: string;
}

/**
 * Props for the Sidebar component
 * Requirement 13.5: Sidebar component SHALL use typed props for the category parameter
 */
export interface SidebarProps {
  active: string;
  setActive: (category: string) => void;
  theme: Theme;
  categories?: CategoryInfo[];
  recentlyUsedCount?: number;
  favoritesCount?: number;
}

/**
 * Props for the PreviewTooltip component
 * Requirements: 10.2, 10.3 - Enlarged preview with component name and category
 */
export interface PreviewTooltipProps {
  item: ComponentItem;
  anchorRect: DOMRect;
  theme: Theme;
  onClose?: () => void;
}
