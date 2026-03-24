# Requirements Document

## Introduction

This feature adds comprehensive theme and color customization capabilities to the Framer UI Vault plugin. Users will be able to toggle between dark and light modes that affect all layout previews, and customize accent/primary colors of layouts before inserting them into Framer. The SVG layouts will be dynamically transformed to reflect the selected theme and color preferences, providing a real-time preview of how components will look with the chosen styling.

## Glossary

- **Theme_Mode**: The overall appearance mode of layouts, either "light" or "dark", affecting background colors, text colors, and contrast levels
- **Accent_Color**: The primary highlight color used for buttons, links, and interactive elements within layouts
- **SVG_Transformer**: A utility service that processes SVG strings to replace color values based on theme and accent color settings
- **Color_Preset**: A predefined accent color option from a curated palette
- **Color_Picker**: An interactive UI component allowing users to select custom colors
- **Layout_Preview**: The SVG thumbnail displayed in the component grid showing how a layout will appear
- **Theme_Settings_Panel**: A UI panel containing theme mode toggle and color customization controls
- **Color_Map**: A mapping of original SVG colors to their themed/customized replacements

## Requirements

### Requirement 1: Theme Mode Toggle

**User Story:** As a designer, I want to toggle between dark and light mode for all layouts, so that I can preview and insert components that match my project's theme.

#### Acceptance Criteria

1. THE Theme_Settings_Panel SHALL display a toggle control for switching between light and dark Theme_Mode
2. WHEN the user toggles Theme_Mode, THE SVG_Transformer SHALL update all visible Layout_Preview elements within 100ms
3. WHEN Theme_Mode is set to dark, THE SVG_Transformer SHALL replace light background colors with dark equivalents and adjust text colors for proper contrast
4. WHEN Theme_Mode is set to light, THE SVG_Transformer SHALL replace dark background colors with light equivalents and adjust text colors for proper contrast
5. THE Theme_Settings_Panel SHALL persist the selected Theme_Mode to localStorage
6. WHEN the plugin loads, THE Theme_Settings_Panel SHALL restore the previously selected Theme_Mode from localStorage

### Requirement 2: Accent Color Selection

**User Story:** As a designer, I want to customize the accent/primary color of layouts, so that I can match my brand colors before inserting components.

#### Acceptance Criteria

1. THE Theme_Settings_Panel SHALL display a set of Color_Preset options as clickable color swatches
2. THE Theme_Settings_Panel SHALL include at least 8 Color_Preset options covering common brand colors (blue, purple, green, red, orange, pink, teal, indigo)
3. WHEN the user selects a Color_Preset, THE SVG_Transformer SHALL update all Layout_Preview elements to use the selected Accent_Color
4. THE Theme_Settings_Panel SHALL display a Color_Picker for selecting custom Accent_Color values
5. WHEN the user selects a custom color via Color_Picker, THE SVG_Transformer SHALL update all Layout_Preview elements to use the custom Accent_Color
6. THE Theme_Settings_Panel SHALL persist the selected Accent_Color to localStorage
7. WHEN the plugin loads, THE Theme_Settings_Panel SHALL restore the previously selected Accent_Color from localStorage

### Requirement 3: SVG Color Transformation

**User Story:** As a designer, I want the SVG layouts to accurately reflect my theme and color choices, so that I can see exactly how components will look before inserting them.

#### Acceptance Criteria

1. THE SVG_Transformer SHALL identify and categorize colors in SVG strings as background, text, accent, or neutral
2. WHEN transforming for dark Theme_Mode, THE SVG_Transformer SHALL convert light backgrounds (#FFFFFF, #F8FAFC, #F1F5F9) to dark equivalents (#0F172A, #1E293B, #334155)
3. WHEN transforming for dark Theme_Mode, THE SVG_Transformer SHALL convert dark text colors (#000000, #0F172A, #1E293B) to light equivalents (#FFFFFF, #F8FAFC, #E2E8F0)
4. THE SVG_Transformer SHALL replace accent colors (#3B82F6, #0099FF) with the user-selected Accent_Color
5. THE SVG_Transformer SHALL preserve gradient structures while updating gradient stop colors
6. THE SVG_Transformer SHALL handle both fill and stroke color attributes
7. THE SVG_Transformer SHALL process inline style color values

### Requirement 4: Inserted Component Color Application

**User Story:** As a designer, I want the components I insert to use my selected theme and colors, so that they integrate seamlessly into my Framer project.

#### Acceptance Criteria

1. WHEN the user inserts a component, THE SVG_Transformer SHALL apply the current Theme_Mode and Accent_Color transformations to the SVG before insertion
2. THE inserted component SHALL reflect the exact colors shown in the Layout_Preview
3. IF the user has not customized colors, THEN THE SVG_Transformer SHALL insert the original SVG without modifications

### Requirement 5: Theme Settings UI

**User Story:** As a designer, I want an intuitive interface for theme and color settings, so that I can quickly customize layouts without disrupting my workflow.

#### Acceptance Criteria

1. THE Theme_Settings_Panel SHALL be accessible from the plugin header area
2. THE Theme_Settings_Panel SHALL display as a collapsible panel or popover to conserve space
3. THE Theme_Settings_Panel SHALL include a "Reset to Default" button to restore original colors
4. WHEN the user clicks "Reset to Default", THE Theme_Settings_Panel SHALL clear custom color settings and restore the default Accent_Color
5. THE Theme_Settings_Panel SHALL provide visual feedback indicating the currently selected Theme_Mode and Accent_Color
6. THE Theme_Settings_Panel SHALL be keyboard accessible with proper focus management

### Requirement 6: Real-time Preview Updates

**User Story:** As a designer, I want to see color changes reflected immediately in all layouts, so that I can quickly evaluate different color options.

#### Acceptance Criteria

1. WHEN Theme_Mode or Accent_Color changes, THE Layout_Preview elements SHALL update without requiring page refresh
2. THE SVG_Transformer SHALL cache transformed SVGs to optimize performance when switching between previously used color combinations
3. WHEN scrolling through the component grid, THE Layout_Preview elements SHALL display with the current Theme_Mode and Accent_Color applied
4. THE plugin SHALL maintain smooth scrolling performance (60fps) while displaying transformed SVGs

### Requirement 7: Color Accessibility

**User Story:** As a designer, I want the theme system to maintain readable contrast ratios, so that the layouts remain accessible.

#### Acceptance Criteria

1. WHEN transforming colors for dark Theme_Mode, THE SVG_Transformer SHALL ensure text elements maintain a minimum contrast ratio of 4.5:1 against their backgrounds
2. THE Color_Preset options SHALL include colors that work well in both light and dark Theme_Mode
3. IF a custom Accent_Color results in poor contrast, THEN THE Theme_Settings_Panel SHALL display a warning indicator
