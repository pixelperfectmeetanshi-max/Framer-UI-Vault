# Implementation Plan: Theme Color Customization

## Overview

This implementation plan breaks down the theme color customization feature into incremental coding tasks. The approach starts with core services (SVG transformation, caching), then builds the state management layer (context), followed by UI components, and finally integrates everything with the existing Card component and insert flow.

## Tasks

- [x] 1. Create SVG Transformer Service
  - [x] 1.1 Create color maps and constants
    - Create `src/services/svg-transformer.ts`
    - Define `LIGHT_TO_DARK_BACKGROUNDS`, `LIGHT_TO_DARK_TEXT`, `ACCENT_COLORS_TO_REPLACE` color maps
    - Define `COLOR_PRESETS` array with 8 preset colors
    - Define `DEFAULT_ACCENT_COLOR` and `DEFAULT_LAYOUT_THEME` constants
    - _Requirements: 2.2, 3.2, 3.3_

  - [x] 1.2 Implement color utility functions
    - Implement `isBackgroundColor()` function to categorize background colors
    - Implement `isTextColor()` function to categorize text colors
    - Implement `isAccentColor()` function to categorize accent colors
    - Implement `getContrastRatio()` function for accessibility checks
    - Implement `hexToRgb()` and `getLuminance()` helper functions
    - _Requirements: 3.1, 7.1_

  - [x] 1.3 Implement SVG transformation logic
    - Implement `transform()` function with regex-based color replacement
    - Handle `fill` and `stroke` attributes
    - Handle inline `style` color values
    - Preserve gradient structures while updating stop colors
    - Return original SVG unchanged when at default settings
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.3_

  - [x] 1.4 Write property tests for SVG transformation
    - **Property 1: Dark Theme Transformation**
    - **Property 2: Light Theme Transformation**
    - **Property 4: Accent Color Replacement**
    - **Property 5: Color Categorization Consistency**
    - **Property 6: Gradient Structure Preservation**
    - **Property 8: No Modification When Uncustomized**
    - **Validates: Requirements 1.3, 1.4, 2.3, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.3**

- [x] 2. Create Transformed SVG Cache Service
  - [x] 2.1 Implement LRU cache for transformed SVGs
    - Create `src/services/transformed-svg-cache.ts`
    - Implement `CacheKey` interface with svgHash, themeMode, accentColor
    - Implement `get()`, `set()`, `has()`, `clear()` methods
    - Implement `clearForSettings()` method for selective cache invalidation
    - Use simple hash function for SVG content
    - Set max cache size (e.g., 500 entries)
    - _Requirements: 6.2_

  - [x] 2.2 Write property tests for cache
    - **Property 10: Cache Hit on Repeated Requests**
    - **Validates: Requirements 6.2**

- [x] 3. Checkpoint - Core services complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Extend Storage Service for Theme Settings
  - [x] 4.1 Add theme color storage methods
    - Add `LAYOUT_THEME` and `ACCENT_COLOR` storage keys to `src/services/storage.ts`
    - Implement `saveLayoutTheme()` and `getLayoutTheme()` methods
    - Implement `saveAccentColor()` and `getAccentColor()` methods
    - Handle localStorage errors gracefully with fallback to defaults
    - _Requirements: 1.5, 1.6, 2.6, 2.7_

  - [x] 4.2 Write property tests for storage persistence
    - **Property 3: Settings Persistence Round-Trip**
    - **Validates: Requirements 1.5, 1.6, 2.6, 2.7**

- [x] 5. Create ThemeColorContext
  - [x] 5.1 Implement ThemeColorContext provider
    - Create `src/contexts/ThemeColorContext.tsx`
    - Define `ThemeColorState` and `ThemeColorContextValue` interfaces
    - Implement `ThemeColorProvider` component with state management
    - Implement `setLayoutTheme()`, `setAccentColor()`, `resetToDefaults()` functions
    - Implement `getTransformedSvg()` function integrating transformer and cache
    - Load initial state from storage on mount
    - Persist state changes to storage
    - _Requirements: 1.2, 1.5, 1.6, 2.3, 2.5, 2.6, 2.7, 5.4, 6.1_

  - [x] 5.2 Write property tests for context
    - **Property 7: Preview Matches Inserted SVG**
    - **Property 9: Reset Restores Defaults**
    - **Validates: Requirements 4.1, 4.2, 5.4**

- [x] 6. Checkpoint - State management complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Create ColorPicker Component
  - [x] 7.1 Implement ColorPicker component
    - Create `src/components/ColorPicker.tsx`
    - Implement color input with hex value display
    - Add validation for hex color format
    - Style for both light and dark UI themes
    - Add keyboard accessibility and ARIA attributes
    - _Requirements: 2.4, 5.6_

  - [x] 7.2 Implement contrast warning indicator
    - Add contrast ratio calculation against common backgrounds
    - Display warning icon when contrast ratio < 4.5:1
    - _Requirements: 7.3_

  - [x] 7.3 Write property tests for contrast warning
    - **Property 12: Contrast Warning Detection**
    - **Validates: Requirements 7.3**

- [x] 8. Create ThemeSettingsPanel Component
  - [x] 8.1 Implement ThemeSettingsPanel component
    - Create `src/components/ThemeSettingsPanel.tsx`
    - Implement collapsible panel structure following HelpPanel pattern
    - Add theme mode toggle (light/dark) control
    - Display color preset swatches (8 colors)
    - Integrate ColorPicker for custom color selection
    - Add "Reset to Default" button
    - Show visual feedback for current selections
    - _Requirements: 1.1, 2.1, 2.2, 2.4, 5.1, 5.2, 5.3, 5.5_

  - [x] 8.2 Add keyboard accessibility
    - Implement proper focus management
    - Add keyboard navigation for color swatches
    - Ensure all controls are keyboard accessible
    - _Requirements: 5.6_

  - [x] 8.3 Write unit tests for ThemeSettingsPanel
    - Test toggle interactions
    - Test color preset selection
    - Test reset functionality
    - _Requirements: 1.1, 2.1, 5.3, 5.4_

- [x] 9. Integrate with App and Header
  - [x] 9.1 Add ThemeColorProvider to App
    - Wrap app content with `ThemeColorProvider` in `src/App.tsx`
    - _Requirements: 1.2, 6.1_

  - [x] 9.2 Add theme settings trigger to header
    - Add settings icon/button to header area
    - Implement panel open/close state management
    - Render ThemeSettingsPanel conditionally
    - _Requirements: 5.1, 5.2_

- [x] 10. Checkpoint - UI components complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Integrate with Card Component
  - [x] 11.1 Update Card component to use transformed SVGs
    - Import and use `useThemeColor` hook in Card component
    - Call `getTransformedSvg()` for layout preview rendering
    - Ensure previews update when theme/color changes
    - _Requirements: 1.2, 6.1, 6.3_

  - [x] 11.2 Write property tests for preview consistency
    - **Property 11: Contrast Ratio Maintenance**
    - **Validates: Requirements 7.1**

- [x] 12. Integrate with Insert Service
  - [x] 12.1 Apply transformations on component insert
    - Update insert flow to apply current theme/color transformations
    - Ensure inserted SVG matches preview exactly
    - Skip transformation when settings are at defaults
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 13. Final checkpoint - Feature complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify theme toggle updates all visible previews within 100ms
  - Verify smooth scrolling performance (60fps) with transformed SVGs
  - Verify settings persist across plugin reload

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The implementation follows the existing plugin architecture patterns
