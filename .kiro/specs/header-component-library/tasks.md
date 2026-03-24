# Implementation Plan: Header Component Library

## Overview

This plan implements the Header component category for the Framer UI Vault plugin. The implementation follows the established pattern: define SVG assets in `svg-assets.ts`, map them to component objects in `data.ts`, and let the existing UI automatically discover the new category.

## Tasks

- [x] 1. Create Header SVG Assets
  - [x] 1.1 Add header array export to `src/svg-assets.ts` with 11 SVG string elements
    - Create skeletal SVG representations for each header variant
    - Use consistent viewBox (e.g., `viewBox="0 0 1200 100"`) appropriate for header dimensions
    - Follow existing visual style conventions (rounded rectangles, circles, color palette)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ]* 1.2 Write property test for header array count
    - **Property 1: Header Array Count**
    - Verify `header.length === 11`
    - **Validates: Requirements 1.1, 5.1-5.11**
  
  - [ ]* 1.3 Write property test for viewBox consistency
    - **Property 2: Header SVG ViewBox Consistency**
    - Verify all header SVGs have valid viewBox with width > height
    - **Validates: Requirements 1.4**

- [x] 2. Implement Header Variant SVGs
  - [x] 2.1 Create Header Minimal SVG (variant 1)
    - Logo + nav links + CTA button layout
    - _Requirements: 5.1_
  
  - [x] 2.2 Create Header Floating SVG (variant 2)
    - Contained in rounded pill container
    - _Requirements: 5.2_
  
  - [x] 2.3 Create Header Center Logo SVG (variant 3)
    - Nav links on both sides of centered logo
    - _Requirements: 5.3_
  
  - [x] 2.4 Create Header Glass SVG (variant 4)
    - Translucent/blur background style representation
    - _Requirements: 5.4_
  
  - [x] 2.5 Create Header Dark SVG (variant 5)
    - Dark theme variant using dark color palette
    - _Requirements: 5.5_
  
  - [x] 2.6 Create Header Underline SVG (variant 6)
    - Active state with underline indicator
    - _Requirements: 5.6_
  
  - [x] 2.7 Create Header Boxed SVG (variant 7)
    - Bordered container style
    - _Requirements: 5.7_
  
  - [x] 2.8 Create Header Gradient SVG (variant 8)
    - Gradient accent border/element
    - _Requirements: 5.8_
  
  - [x] 2.9 Create Header Sidebar SVG (variant 9)
    - Vertical sidebar navigation layout
    - _Requirements: 5.9_
  
  - [x] 2.10 Create Header Center CTA SVG (variant 10)
    - Prominent centered call-to-action
    - _Requirements: 5.10_
  
  - [x] 2.11 Create Header Thin SVG (variant 11)
    - Compact/minimal height variant
    - _Requirements: 5.11_

- [x] 3. Register Header Category in Data Module
  - [x] 3.1 Import header array in `src/data.ts`
    - Add `header` to the import statement from `./svg-assets`
    - _Requirements: 2.1_
  
  - [x] 3.2 Map header SVGs to component objects
    - Add spread mapping to components array
    - Use id format `header-{index}` (e.g., `header-1`, `header-2`)
    - Set category to "Header"
    - Assign descriptive names (e.g., "Header Minimal", "Header Floating")
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 3.3 Write property test for component structure integrity
    - **Property 3: Header Component Structure Integrity**
    - Verify header components have valid id, category "Header", non-empty name and svg
    - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 4. Checkpoint - Verify Header Components Display
  - Ensure all tests pass, ask the user if questions arise.
  - Verify "Header" category appears in sidebar
  - Verify header components render in grid

- [x] 5. Validate UI Integration
  - [ ]* 5.1 Write property test for category filter exclusivity
    - **Property 4: Category Filter Exclusivity**
    - Verify filtering by "Header" returns only header components
    - **Validates: Requirements 3.2**
  
  - [ ]* 5.2 Write property test for search inclusion
    - **Property 5: Search Inclusion**
    - Verify search queries containing "header" include header components
    - **Validates: Requirements 3.3**
  
  - [ ]* 5.3 Write property test for recently used tracking
    - **Property 6: Recently Used Tracking**
    - Verify inserted header components appear in recently used list
    - **Validates: Requirements 4.2**
  
  - [ ]* 5.4 Write property test for favorites persistence
    - **Property 7: Favorites Persistence Round-Trip**
    - Verify favorited header components persist correctly
    - **Validates: Requirements 4.3**

- [x] 6. Final Checkpoint - Complete Verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all 11 header variants are accessible
  - Verify insertion, favorites, and recently used functionality works

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The UI automatically discovers the "Header" category through `getUniqueCategories()` - no UI changes needed
- SVGs should follow existing conventions: skeletal style with rounded rectangles, circles, and consistent color palette
- Property tests should use `fast-check` library with minimum 100 iterations
