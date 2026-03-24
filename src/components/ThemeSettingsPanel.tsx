/**
 * ThemeSettingsPanel Component
 * Requirements: 1.1, 2.1, 2.2, 2.4, 5.1, 5.2, 5.3, 5.5, 5.6
 * 
 * Collapsible panel for theme and color customization:
 * - Theme mode toggle (light/dark)
 * - Color preset swatches
 * - Custom color picker
 * - Reset to defaults button
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { themes } from '../theme';
import { useThemeColor } from '../contexts/ThemeColorContext';
import { COLOR_PRESETS, DEFAULT_ACCENT_COLOR } from '../services/svg-transformer';
import { ColorPicker } from './ColorPicker';

interface ThemeSettingsPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback when panel should close */
  onClose: () => void;
  /** Current UI theme for styling */
  theme: 'light' | 'dark';
}

/**
 * Sun icon for light mode
 */
function SunIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

/**
 * Moon icon for dark mode
 */
function MoonIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/**
 * Reset icon
 */
function ResetIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

/**
 * ThemeSettingsPanel - Collapsible panel for theme and color settings
 */
export function ThemeSettingsPanel({ isOpen, onClose, theme }: ThemeSettingsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const colors = themes[theme];
  
  const {
    layoutTheme,
    accentColor,
    isCustomized,
    setLayoutTheme,
    setAccentColor,
    resetToDefaults,
  } = useThemeColor();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Delay to prevent immediate close on open click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  /**
   * Handle theme toggle
   */
  const handleThemeToggle = useCallback((newTheme: 'light' | 'dark') => {
    setLayoutTheme(newTheme);
  }, [setLayoutTheme]);

  /**
   * Handle color preset selection
   */
  const handlePresetSelect = useCallback((color: string) => {
    setAccentColor(color);
  }, [setAccentColor]);

  /**
   * Handle reset to defaults
   */
  const handleReset = useCallback(() => {
    resetToDefaults();
  }, [resetToDefaults]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Layout theme settings"
      aria-modal="true"
      style={{
        ...styles.panel,
        background: colors.cardBg,
        borderColor: colors.border,
        boxShadow: colors.shadowHover,
      }}
    >
      {/* Header */}
      <div style={styles.header}>
        <h3 style={{ ...styles.title, color: colors.textPrimary }}>
          Layout Theme
        </h3>
        <button
          onClick={onClose}
          aria-label="Close theme settings"
          style={{
            ...styles.closeButton,
            color: colors.textSecondary,
          }}
        >
          ×
        </button>
      </div>

      {/* Theme Mode Toggle */}
      <div style={styles.section}>
        <label style={{ ...styles.label, color: colors.textSecondary }}>
          Mode
        </label>
        <div style={styles.toggleGroup}>
          <button
            onClick={() => handleThemeToggle('light')}
            aria-pressed={layoutTheme === 'light'}
            style={{
              ...styles.toggleButton,
              background: layoutTheme === 'light' ? colors.primary : colors.bgHover,
              color: layoutTheme === 'light' ? '#FFFFFF' : colors.textSecondary,
              borderColor: layoutTheme === 'light' ? colors.primary : colors.border,
            }}
          >
            <SunIcon color={layoutTheme === 'light' ? '#FFFFFF' : colors.textSecondary} />
            <span>Light</span>
          </button>
          <button
            onClick={() => handleThemeToggle('dark')}
            aria-pressed={layoutTheme === 'dark'}
            style={{
              ...styles.toggleButton,
              background: layoutTheme === 'dark' ? colors.primary : colors.bgHover,
              color: layoutTheme === 'dark' ? '#FFFFFF' : colors.textSecondary,
              borderColor: layoutTheme === 'dark' ? colors.primary : colors.border,
            }}
          >
            <MoonIcon color={layoutTheme === 'dark' ? '#FFFFFF' : colors.textSecondary} />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* Color Presets */}
      <div style={styles.section}>
        <label style={{ ...styles.label, color: colors.textSecondary }}>
          Accent Color
        </label>
        <div style={styles.presetGrid} role="radiogroup" aria-label="Color presets">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.value)}
              aria-label={preset.name}
              aria-checked={accentColor.toUpperCase() === preset.value.toUpperCase()}
              role="radio"
              style={{
                ...styles.presetButton,
                backgroundColor: preset.value,
                outline: accentColor.toUpperCase() === preset.value.toUpperCase()
                  ? `2px solid ${colors.primary}`
                  : 'none',
                outlineOffset: '2px',
              }}
              title={preset.name}
            />
          ))}
        </div>
      </div>

      {/* Custom Color Picker */}
      <div style={styles.section}>
        <label style={{ ...styles.label, color: colors.textSecondary }}>
          Custom Color
        </label>
        <ColorPicker
          value={accentColor}
          onChange={setAccentColor}
          theme={theme}
          ariaLabel="Custom accent color"
        />
      </div>

      {/* Reset Button */}
      {isCustomized && (
        <button
          onClick={handleReset}
          style={{
            ...styles.resetButton,
            background: colors.bgHover,
            color: colors.textSecondary,
            borderColor: colors.border,
          }}
        >
          <ResetIcon color={colors.textSecondary} />
          <span>Reset to Default</span>
        </button>
      )}
    </div>
  );
}

const styles = {
  panel: {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    marginTop: '8px',
    width: '280px',
    borderRadius: '12px',
    border: '1px solid',
    padding: '16px',
    zIndex: 100,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
  },
  section: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 500,
    marginBottom: '8px',
  },
  toggleGroup: {
    display: 'flex',
    gap: '8px',
  },
  toggleButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'all 200ms ease',
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
  },
  presetButton: {
    width: '100%',
    aspectRatio: '1',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 150ms ease, outline 150ms ease',
  },
  resetButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'all 200ms ease',
    marginTop: '8px',
  },
};

export default ThemeSettingsPanel;
