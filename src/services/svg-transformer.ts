/**
 * SVG Transformer Service
 * Requirements: 1.3, 1.4, 2.3, 2.5, 3.1-3.7, 4.3, 7.1
 * 
 * Transforms SVG color values based on theme mode and accent color settings.
 * Uses regex-based pattern matching for performance.
 */

// ============================================================================
// Color Maps and Constants
// ============================================================================

export interface ColorMap {
  from: string;
  to: string;
}

export interface ColorPreset {
  id: string;
  name: string;
  value: string;
}

export interface TransformOptions {
  themeMode: 'light' | 'dark';
  accentColor: string;
  preserveGradients?: boolean;
}

/** Default accent color (blue) */
export const DEFAULT_ACCENT_COLOR = '#3B82F6';

/** Default layout theme */
export const DEFAULT_LAYOUT_THEME: 'light' | 'dark' = 'light';

/** 8 color presets covering common brand colors */
export const COLOR_PRESETS: ColorPreset[] = [
  { id: 'blue', name: 'Blue', value: '#3B82F6' },
  { id: 'purple', name: 'Purple', value: '#8B5CF6' },
  { id: 'green', name: 'Green', value: '#10B981' },
  { id: 'red', name: 'Red', value: '#EF4444' },
  { id: 'orange', name: 'Orange', value: '#F97316' },
  { id: 'pink', name: 'Pink', value: '#EC4899' },
  { id: 'teal', name: 'Teal', value: '#14B8A6' },
  { id: 'indigo', name: 'Indigo', value: '#6366F1' },
];

/** Light to dark background color mappings */
export const LIGHT_TO_DARK_BACKGROUNDS: ColorMap[] = [
  { from: '#FFFFFF', to: '#0F172A' },
  { from: '#F8FAFC', to: '#1E293B' },
  { from: '#F1F5F9', to: '#334155' },
  { from: '#E2E8F0', to: '#475569' },
  { from: '#FAFAFA', to: '#18181B' },
  { from: '#F5F5F5', to: '#27272A' },
  { from: '#F9F9F9', to: '#1C1C1C' },
  { from: '#EAEAEA', to: '#3F3F46' },
  { from: '#FFF', to: '#0F172A' },
];

/** Light to dark text color mappings */
export const LIGHT_TO_DARK_TEXT: ColorMap[] = [
  { from: '#000000', to: '#FFFFFF' },
  { from: '#0F172A', to: '#F8FAFC' },
  { from: '#1E293B', to: '#E2E8F0' },
  { from: '#334155', to: '#CBD5E1' },
  { from: '#111', to: '#FFF' },
  { from: '#222', to: '#EEE' },
  { from: '#111111', to: '#FFFFFF' },
  { from: '#1a1a1a', to: '#F5F5F5' },
  { from: '#000', to: '#FFF' },
];

/** Known accent colors to replace */
export const ACCENT_COLORS_TO_REPLACE: string[] = [
  '#3B82F6',
  '#0099FF',
  '#0066CC',
  '#007ACC',
  '#2563EB',
  '#1D4ED8',
];

// Sets for O(1) lookup
const BACKGROUND_COLORS_SET = new Set(
  LIGHT_TO_DARK_BACKGROUNDS.map(m => m.from.toUpperCase())
);
const TEXT_COLORS_SET = new Set(
  LIGHT_TO_DARK_TEXT.map(m => m.from.toUpperCase())
);
const ACCENT_COLORS_SET = new Set(
  ACCENT_COLORS_TO_REPLACE.map(c => c.toUpperCase())
);


// ============================================================================
// Color Utility Functions
// ============================================================================

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '');
  let fullHex = normalized;
  
  // Handle shorthand hex (e.g., #FFF -> #FFFFFF)
  if (normalized.length === 3) {
    const c0 = normalized[0] ?? '0';
    const c1 = normalized[1] ?? '0';
    const c2 = normalized[2] ?? '0';
    fullHex = c0 + c0 + c1 + c1 + c2 + c2;
  }
  
  if (fullHex.length !== 6) return null;
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  if (!result || !result[1] || !result[2] || !result[3]) return null;
  
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Calculate relative luminance for a color
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  };
  const rs = toLinear(r);
  const gs = toLinear(g);
  const bs = toLinear(b);
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Normalize hex color to uppercase 6-digit format
 */
function normalizeHex(hex: string): string {
  const clean = hex.replace('#', '').toUpperCase();
  if (clean.length === 3) {
    return '#' + clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
  }
  return '#' + clean;
}

/**
 * Check if a color is a background color
 */
export function isBackgroundColor(color: string): boolean {
  return BACKGROUND_COLORS_SET.has(normalizeHex(color).toUpperCase());
}

/**
 * Check if a color is a text color
 */
export function isTextColor(color: string): boolean {
  return TEXT_COLORS_SET.has(normalizeHex(color).toUpperCase());
}

/**
 * Check if a color is an accent color
 */
export function isAccentColor(color: string): boolean {
  return ACCENT_COLORS_SET.has(normalizeHex(color).toUpperCase());
}

/**
 * Check if contrast ratio is sufficient (WCAG AA: 4.5:1)
 */
export function hasGoodContrast(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5;
}


// ============================================================================
// SVG Transformation Logic
// ============================================================================

/**
 * Build color replacement map based on theme mode
 */
function buildColorMap(options: TransformOptions): Map<string, string> {
  const map = new Map<string, string>();
  
  if (options.themeMode === 'dark') {
    // Light to dark transformations
    for (const { from, to } of LIGHT_TO_DARK_BACKGROUNDS) {
      map.set(normalizeHex(from), to);
    }
    for (const { from, to } of LIGHT_TO_DARK_TEXT) {
      map.set(normalizeHex(from), to);
    }
  } else {
    // Dark to light transformations (reverse mappings)
    for (const { from, to } of LIGHT_TO_DARK_BACKGROUNDS) {
      map.set(normalizeHex(to), from);
    }
    for (const { from, to } of LIGHT_TO_DARK_TEXT) {
      map.set(normalizeHex(to), from);
    }
  }
  
  // Accent color replacements
  for (const accentColor of ACCENT_COLORS_TO_REPLACE) {
    map.set(normalizeHex(accentColor), options.accentColor);
  }
  
  return map;
}

/**
 * Replace a color in the SVG string
 */
function replaceColor(svg: string, from: string, to: string): string {
  // Escape special regex characters in the color
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Match the color in various contexts (fill, stroke, style, stop-color)
  // Case-insensitive matching
  const regex = new RegExp(escaped, 'gi');
  return svg.replace(regex, to);
}

/**
 * Check if settings are at default values (no transformation needed)
 */
export function isDefaultSettings(options: TransformOptions): boolean {
  return (
    options.themeMode === DEFAULT_LAYOUT_THEME &&
    normalizeHex(options.accentColor) === normalizeHex(DEFAULT_ACCENT_COLOR)
  );
}

/**
 * Transform an SVG string with the given theme and color options
 * 
 * @param svg - The original SVG string
 * @param options - Transformation options (theme mode and accent color)
 * @returns The transformed SVG string
 */
export function transformSvg(svg: string, options: TransformOptions): string {
  // Return original if settings are at defaults
  if (isDefaultSettings(options)) {
    return svg;
  }
  
  // Return original if SVG is empty or invalid
  if (!svg || typeof svg !== 'string') {
    return svg;
  }
  
  const colorMap = buildColorMap(options);
  let result = svg;
  
  // Apply all color replacements
  for (const [from, to] of colorMap) {
    result = replaceColor(result, from, to);
    
    // Also handle shorthand hex (e.g., #FFF)
    const shortFrom = from.replace('#', '');
    if (shortFrom.length === 6) {
      const short = '#' + shortFrom[0] + shortFrom[2] + shortFrom[4];
      if (short.toUpperCase() !== from.toUpperCase()) {
        result = replaceColor(result, short, to);
      }
    }
  }
  
  return result;
}

// ============================================================================
// SVG Transformer Service Export
// ============================================================================

export const svgTransformerService = {
  transform: transformSvg,
  isBackgroundColor,
  isTextColor,
  isAccentColor,
  getContrastRatio,
  hasGoodContrast,
  isDefaultSettings,
};
