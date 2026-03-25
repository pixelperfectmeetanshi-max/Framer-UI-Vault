# Requirements Document

## Introduction

This document specifies the requirements for removing the dark/light theme toggle functionality from the Layout Theme settings panel. The toggle allows users to switch between light and dark modes for SVG transformations. After removal, the system will use a fixed default theme mode (light) for all SVG transformations while preserving the accent color customization functionality.

## Glossary

- **Theme_Settings_Panel**: The collapsible UI panel that provides theme and color customization options, accessed via the palette icon in the header.
- **Layout_Theme_Mode**: The light/dark toggle setting that affects SVG background and text color transformations.
- **Accent_Color**: The customizable color used for interactive elements in SVG transformations (this functionality is preserved).
- **SVG_Transformer**: The service that applies theme and color transformations to SVG assets.
- **Storage_Service**: The service responsible for persisting user preferences to localStorage.
- **Theme_Color_Context**: The React context that manages layout theme and accent color state.

## Requirements

### Requirement 1: Remove Theme Mode Toggle UI

**User Story:** As a developer, I want to remove the light/dark toggle from the Theme Settings Panel, so that users have a simplified interface focused on accent color customization.

#### Acceptance Criteria

1. WHEN the Theme_Settings_Panel is opened, THE Theme_Settings_Panel SHALL NOT display the Mode toggle section (Light/Dark buttons).
2. THE Theme_Settings_Panel SHALL continue to display the Accent Color preset grid.
3. THE Theme_Settings_Panel SHALL continue to display the Custom Color picker.
4. THE Theme_Settings_Panel SHALL continue to display the Reset to Default button when colors are customized.

### Requirement 2: Remove Theme Mode State Management

**User Story:** As a developer, I want to remove the layout theme state from the Theme Color Context, so that the codebase no longer tracks or manages light/dark mode selection.

#### Acceptance Criteria

1. THE Theme_Color_Context SHALL NOT expose a layoutTheme state property.
2. THE Theme_Color_Context SHALL NOT expose a setLayoutTheme function.
3. THE Theme_Color_Context SHALL continue to expose accentColor state and setAccentColor function.
4. THE Theme_Color_Context SHALL continue to expose resetToDefaults function for accent color reset.
5. THE Theme_Color_Context SHALL continue to expose getTransformedSvg function.

### Requirement 3: Update SVG Transformation to Use Fixed Theme

**User Story:** As a developer, I want SVG transformations to use a fixed light theme, so that the system behaves consistently without user theme selection.

#### Acceptance Criteria

1. WHEN getTransformedSvg is called, THE SVG_Transformer SHALL apply transformations using the light theme mode.
2. THE SVG_Transformer SHALL continue to apply the user-selected accent color to SVG transformations.
3. THE SVG_Transformer SHALL continue to use caching for transformed SVGs.

### Requirement 4: Remove Theme Mode Storage

**User Story:** As a developer, I want to remove layout theme persistence from localStorage, so that no obsolete theme mode data is stored.

#### Acceptance Criteria

1. THE Storage_Service SHALL NOT save layout theme preferences to localStorage.
2. THE Storage_Service SHALL NOT read layout theme preferences from localStorage.
3. THE Storage_Service SHALL continue to save and restore accent color preferences.
4. WHEN clearThemeColorSettings is called, THE Storage_Service SHALL clear only accent color settings.
5. WHEN clearAll is called, THE Storage_Service SHALL NOT attempt to clear the layout theme key.

### Requirement 5: Update Reset Functionality

**User Story:** As a developer, I want the reset functionality to only reset accent color, so that it reflects the simplified customization options.

#### Acceptance Criteria

1. WHEN resetToDefaults is called, THE Theme_Color_Context SHALL reset only the accent color to the default value.
2. WHEN resetToDefaults is called, THE Theme_Color_Context SHALL clear the SVG transformation cache.
3. THE Theme_Settings_Panel SHALL display the Reset button only when the accent color differs from the default.

### Requirement 6: Clean Up Unused Code

**User Story:** As a developer, I want to remove all unused theme mode related code, so that the codebase remains clean and maintainable.

#### Acceptance Criteria

1. THE Theme_Settings_Panel SHALL NOT contain SunIcon or MoonIcon components.
2. THE Theme_Settings_Panel SHALL NOT contain handleThemeToggle function.
3. THE ThemeColorState interface SHALL NOT include layoutTheme property.
4. THE ThemeColorContextValue interface SHALL NOT include setLayoutTheme function.
5. THE Storage_Service SHALL NOT contain saveLayoutTheme or getLayoutTheme functions.
6. THE Storage_Service SHALL NOT contain the LAYOUT_THEME storage key constant.
