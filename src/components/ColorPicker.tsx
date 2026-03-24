/**
 * ColorPicker Component
 * Requirements: 2.4, 5.6, 7.3
 * 
 * Custom color picker for selecting accent colors with:
 * - Native color input
 * - Hex value display/input
 * - Contrast warning indicator
 * - Keyboard accessibility
 */

import React, { useState, useCallback, useEffect } from 'react';
import { themes } from '../theme';
import { getContrastRatio } from '../services/svg-transformer';

interface ColorPickerProps {
  /** Current selected color */
  value: string;
  /** Callback when color changes */
  onChange: (color: string) => void;
  /** Current UI theme for styling */
  theme: 'light' | 'dark';
  /** Accessible label */
  ariaLabel?: string;
}

/** Minimum contrast ratio for WCAG AA compliance */
const MIN_CONTRAST_RATIO = 4.5;

/** Background colors to check contrast against */
const CONTRAST_CHECK_BACKGROUNDS = {
  light: '#FFFFFF',
  dark: '#0F172A',
};

/**
 * Validate hex color format
 */
function isValidHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Warning icon for low contrast
 */
function WarningIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/**
 * ColorPicker component for selecting custom accent colors
 */
export function ColorPicker({ value, onChange, theme, ariaLabel = 'Select accent color' }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const [hasLowContrast, setHasLowContrast] = useState(false);
  const colors = themes[theme];

  // Update input when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Check contrast ratio when color changes
  useEffect(() => {
    if (isValidHex(value)) {
      const bgColor = CONTRAST_CHECK_BACKGROUNDS[theme];
      const ratio = getContrastRatio(value, bgColor);
      setHasLowContrast(ratio < MIN_CONTRAST_RATIO);
    }
  }, [value, theme]);

  /**
   * Handle native color picker change
   */
  const handleColorInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value.toUpperCase();
    setInputValue(newColor);
    if (isValidHex(newColor)) {
      onChange(newColor);
    }
  }, [onChange]);

  /**
   * Handle hex text input change
   */
  const handleTextInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.toUpperCase();
    
    // Add # prefix if missing
    if (newValue && !newValue.startsWith('#')) {
      newValue = '#' + newValue;
    }
    
    setInputValue(newValue);
    
    // Only update if valid hex
    if (isValidHex(newValue)) {
      onChange(newValue);
    }
  }, [onChange]);

  /**
   * Handle blur - reset to last valid value if invalid
   */
  const handleBlur = useCallback(() => {
    if (!isValidHex(inputValue)) {
      setInputValue(value);
    }
  }, [inputValue, value]);

  return (
    <div style={styles.container}>
      <div style={styles.pickerRow}>
        {/* Native color picker */}
        <div style={styles.colorInputWrapper}>
          <input
            type="color"
            value={value}
            onChange={handleColorInputChange}
            aria-label={ariaLabel}
            style={styles.colorInput}
          />
          <div
            style={{
              ...styles.colorPreview,
              backgroundColor: value,
              border: `1px solid ${colors.border}`,
            }}
          />
        </div>

        {/* Hex input */}
        <input
          type="text"
          value={inputValue}
          onChange={handleTextInputChange}
          onBlur={handleBlur}
          placeholder="#3B82F6"
          maxLength={7}
          aria-label="Hex color value"
          style={{
            ...styles.hexInput,
            background: colors.bgHover,
            color: colors.textPrimary,
            borderColor: colors.border,
          }}
        />

        {/* Contrast warning */}
        {hasLowContrast && (
          <div
            style={styles.warningContainer}
            title="Low contrast - may be hard to see"
            role="alert"
          >
            <WarningIcon color="#F59E0B" />
          </div>
        )}
      </div>

      {/* Contrast warning message */}
      {hasLowContrast && (
        <p style={{ ...styles.warningText, color: '#F59E0B' }}>
          Low contrast with {theme} backgrounds
        </p>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  pickerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  colorInputWrapper: {
    position: 'relative' as const,
    width: '32px',
    height: '32px',
  },
  colorInput: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
  },
  colorPreview: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    pointerEvents: 'none' as const,
  },
  hexInput: {
    flex: 1,
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '13px',
    fontFamily: 'monospace',
    outline: 'none',
    transition: 'border-color 200ms ease',
  },
  warningContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
  },
  warningText: {
    margin: 0,
    fontSize: '11px',
    fontWeight: 500,
  },
};

export default ColorPicker;
