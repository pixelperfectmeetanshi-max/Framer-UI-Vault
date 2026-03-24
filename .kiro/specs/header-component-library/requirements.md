# Requirements Document

## Introduction

This feature adds a "Header" component category to the Framer UI Vault plugin. The plugin currently provides skeletal UI layouts across categories like Hero, Navbar, Footer, CTA/Banner, Blog/Article, Contact/Form, and Gallery/Portfolio. Users want to add 11 header variants from the existing `Header/` folder as SVG components that can be browsed, searched, filtered, favorited, and inserted into Framer projects—consistent with the existing component library experience.

## Glossary

- **Plugin**: The Framer UI Vault plugin that provides skeletal UI layouts for Framer projects
- **Header_Component**: An SVG representation of a header/navigation layout variant
- **SVG_Assets_Module**: The `src/svg-assets.ts` file that exports arrays of SVG strings for each component category
- **Data_Module**: The `src/data.ts` file that maps SVG assets to component objects with id, category, name, and svg properties
- **Component_Grid**: The UI grid that displays available components for users to browse and select
- **Category_Filter**: The sidebar filter that allows users to filter components by category

## Requirements

### Requirement 1: Create Header SVG Assets

**User Story:** As a plugin developer, I want to convert the 11 HTML header variants into SVG skeletal representations, so that they can be displayed and inserted as Framer components.

#### Acceptance Criteria

1. THE SVG_Assets_Module SHALL export a `header` array containing 11 SVG string elements
2. WHEN a header SVG is rendered, THE Header_Component SHALL display a skeletal representation matching the layout style of its corresponding HTML variant
3. THE Header_Component SHALL use the same visual style conventions as existing components (rounded rectangles for text placeholders, circles for icons/avatars, consistent color palette)
4. FOR ALL header SVGs, THE Header_Component SHALL use a consistent viewBox appropriate for header dimensions (e.g., `viewBox="0 0 1200 100"` or similar)

### Requirement 2: Register Header Category in Data Module

**User Story:** As a plugin developer, I want to register the Header components in the data module, so that they appear in the component library alongside existing categories.

#### Acceptance Criteria

1. THE Data_Module SHALL import the `header` array from SVG_Assets_Module
2. THE Data_Module SHALL map each header SVG to a component object with `id`, `category`, `name`, and `svg` properties
3. WHEN mapping header components, THE Data_Module SHALL use "Header" as the category value
4. WHEN mapping header components, THE Data_Module SHALL generate unique ids in the format `header-{index}` (e.g., `header-1`, `header-2`)
5. WHEN mapping header components, THE Data_Module SHALL assign descriptive names reflecting each variant's style (e.g., "Header Minimal", "Header Floating", "Header Glass")

### Requirement 3: Display Header Components in UI

**User Story:** As a plugin user, I want to see Header components in the component grid, so that I can browse and select header layouts for my Framer projects.

#### Acceptance Criteria

1. WHEN the Plugin loads, THE Component_Grid SHALL display Header components alongside existing categories
2. WHEN a user selects "Header" from the Category_Filter, THE Component_Grid SHALL display only Header components
3. WHEN a user searches for "header", THE Component_Grid SHALL include matching Header components in search results
4. THE Header_Component previews SHALL render correctly in the Component_Grid at thumbnail size

### Requirement 4: Insert Header Components

**User Story:** As a plugin user, I want to insert Header components into my Framer project, so that I can use them as starting points for my designs.

#### Acceptance Criteria

1. WHEN a user clicks on a Header_Component, THE Plugin SHALL insert the SVG into the Framer canvas
2. WHEN a Header_Component is inserted, THE Plugin SHALL add it to the user's recently used components list
3. WHEN a user favorites a Header_Component, THE Plugin SHALL persist the favorite status for future sessions

### Requirement 5: Header Variant Coverage

**User Story:** As a plugin user, I want access to diverse header styles, so that I can find a layout that matches my design needs.

#### Acceptance Criteria

1. THE header array SHALL include a minimal/simple header variant (logo + nav links + CTA)
2. THE header array SHALL include a floating/pill header variant (contained in rounded container)
3. THE header array SHALL include a center-logo header variant (nav links on both sides of logo)
4. THE header array SHALL include a glass/blur header variant (translucent background style)
5. THE header array SHALL include a dark theme header variant
6. THE header array SHALL include an underline-active header variant (active state indicator)
7. THE header array SHALL include a boxed/bordered header variant
8. THE header array SHALL include a gradient-accent header variant
9. THE header array SHALL include a sidebar navigation variant
10. THE header array SHALL include a center-CTA header variant
11. THE header array SHALL include a thin/compact header variant
