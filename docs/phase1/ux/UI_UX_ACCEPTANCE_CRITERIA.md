# UI/UX ACCEPTANCE CRITERIA
**Project:** Q-Sight Command Center  
**Phase:** Phase 1A  
**Reviewer:** Frontend Architecture Reviewer  

## 1. Architectural Refactoring (AC-ARCH)
- **AC-ARCH-01:** `App.tsx` must be deconstructed. Map initialization, layout, and state must be moved to separate, dedicated components/providers.
- **AC-ARCH-02:** All inline styles (`style={{...}}`) must be removed from `CommandBar.tsx`, `MissionRail.tsx`, and `ExecutiveOverlay.tsx` and replaced with CSS classes.
- **AC-ARCH-03:** A comprehensive CSS custom property token system must be implemented in `styles.css` (Colors, Spacing, Typography, Radii).

## 2. Map Rendering Polish (AC-MAP)
- **AC-MAP-01:** `homeButton`, `sceneModePicker`, and `baseLayerPicker` must be set to `false` in Cesium initialization.
- **AC-MAP-02:** OpenStreetMap fallback imagery must be replaced with a dark-themed satellite/terrain fallback (e.g., Esri World Imagery Dark).
- **AC-MAP-03:** Cesium Point primitives must be replaced with custom SVG billboards for Aircraft, Satellites, Assets, and Cameras.
- **AC-MAP-04:** Selection state in React must visually highlight the corresponding entity on the Cesium globe (e.g., outline glow or color change).
- **AC-MAP-05:** Map labels must use `distanceDisplayCondition` to prevent text overlap at high altitudes.

## 3. Workflow & IA Improvements (AC-IA)
- **AC-IA-01:** Developer controls (`DEMO MODE` toggle, `MODE: DEVELOPMENT` badge) must be hidden from the primary user interface.
- **AC-IA-02:** The right panel architecture must be refactored so that "Sources & Layers" and "Alerts" can overlay or coexist without unmounting the currently selected entity details.
- **AC-IA-03:** Alert cards must include a "Locate" button that calls the Cesium camera `flyToCoords` function.
- **AC-IA-04:** The `ExecutiveOverlay` must use a blurred, semi-transparent background that retains the spatial context of the globe beneath it.

## 4. Accessibility & Visuals (AC-VIS)
- **AC-VIS-01:** No typography in the application may be smaller than 11px. Base labels should be 12px or 13px.
- **AC-VIS-02:** The `styles.css` file must contain explicit `:focus-visible` rules for keyboard navigation.
- **AC-VIS-03:** All infinite pulsing animations must be wrapped in a `@media (prefers-reduced-motion: reduce)` block.
- **AC-VIS-04:** Emojis (📷, 🔔, ⚠️) must be entirely removed from the UI and replaced with a standard SVG icon library.
