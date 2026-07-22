# PHASE 1A ENTERPRISE EXPERIENCE PLAN
**Project:** Q-Sight Command Center  
**Phase:** Phase 1A (UI/UX Refactoring)  
**Author:** Phase 1A Planner  

## 1. Strategy & Objective
**Objective:** Elevate Q-Sight Command Center from a functional technical prototype to a visually credible, executive-ready enterprise geospatial platform.

**Constraint:** Do NOT alter backend architecture, telemetry contracts, or database schemas. This is strictly a frontend UI/UX and Cesium map rendering refactor.

## 2. Workstreams

### WS-1: Design System & Styling Foundation
- **Tasks:** 
  - Eradicate inline styles across `CommandBar`, `MissionRail`, and `ExecutiveOverlay`.
  - Implement a rigorous CSS Custom Property system in `styles.css` (Spacing, Colors, Typography).
  - Fix color semantic overloading (separate Entity colors from Status colors).
  - Eliminate all emojis; implement a standard SVG icon system.

### WS-2: Component Deconstruction
- **Tasks:**
  - Break down the 824-line `App.tsx` monolith.
  - Extract Cesium initialization into a dedicated map component.
  - Create a UI state management context to handle active tabs and selected entities, reducing prop drilling.

### WS-3: Information Architecture & Layout
- **Tasks:**
  - Redesign the layout grid to allow floating side panels rather than rigid block panels.
  - Fix the `MissionRail` tab switching so that opening 'Sources & Layers' or 'Alerts' does not unmount the `EntityDetailPanel`.
  - Remove developer badges from the UI (Demo Mode, Mode: Development).

### WS-4: Cesium Map Rendering Polish
- **Tasks:**
  - Turn off default Cesium widgets (`homeButton`, etc.).
  - Implement custom SVG billboards for entities instead of primitive points.
  - Add entity selection highlighting (visual feedback on the map).
  - Implement basic `distanceDisplayCondition` for labels to prevent overlap.
  - Swap the OSM fallback for a dark terrain/satellite fallback.

### WS-5: Workflow Enhancements
- **Tasks:**
  - Add a "Locate on Map" (`flyToCoords`) button to Alert cards.
  - Redesign the `ExecutiveOverlay` to function as a glass-pane dashboard over the map, rather than a solid black screen.

## 3. Execution Sequencing
1. **WS-1 (Design System)** must happen first. Without standard tokens, UI refactors will remain brittle.
2. **WS-4 (Cesium Polish)** can happen in parallel, as it primarily affects the map instance configuration.
3. **WS-2 & WS-3 (Architecture & IA)** should follow, utilizing the new tokens.
4. **WS-5 (Workflows)** acts as the final integration and polish step.
