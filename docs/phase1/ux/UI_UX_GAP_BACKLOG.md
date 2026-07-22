# UI/UX GAP BACKLOG
**Project:** Q-Sight Command Center  
**Phase:** Phase 1A  
**Reviewer:** Frontend Architecture Reviewer  

## 1. Architectural Gaps
- **GAP-ARCH-01:** `App.tsx` Monolith. Map logic, websocket connections, state management, and layout grid are intertwined in a single 800+ line file. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*
- **GAP-ARCH-02:** Lack of Global State Management. Heavy reliance on prop drilling and scattered `useState` hooks. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*
- **GAP-ARCH-03:** Hardcoded Styles. Extensive use of inline styles (e.g., `CommandBar`, `ExecutiveOverlay`) bypassing the central CSS file. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*
- **GAP-ARCH-04:** Missing Design Token System. No CSS variables for spacing, typography, borders, or shadows. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*

## 2. Map & Geospatial Gaps
- **GAP-MAP-01:** Default Cesium Widgets. Home, scene picker, and base layer widgets are visible in production. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*
- **GAP-MAP-02:** Fallback Imagery. Uses OpenStreetMap (street map) instead of a dark satellite imagery fallback. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*
- **GAP-MAP-03:** Point Primitives. All entities use identical circle points; no custom SVG billboards for distinct entity types. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*
- **GAP-MAP-04:** No Clustering. High entity density will crash the renderer and clutter the UI. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*
- **GAP-MAP-05:** Hardcoded Satellite Altitude. Satellites placed at 400km placeholder. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*
- **GAP-MAP-06:** No Entity Highlight. Selecting an entity in the UI does not highlight it on the Cesium canvas. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*

## 3. Workflow & IA Gaps
- **GAP-IA-01:** Destructive Context Switching. Clicking a tab in the `MissionRail` replaces the right panel entirely, destroying selected entity context. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*
- **GAP-IA-02:** Alert Workflow Disconnect. Alert cards lack a "Locate on Map" action. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*
- **GAP-IA-03:** Scattered Status Indicators. System health is spread across top header badges rather than unified in an operational dashboard. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*
- **GAP-IA-04:** Exposed Developer Artifacts. `DEMO MODE: OFF`, `MODE: DEVELOPMENT`, and internal database IDs are visible to users. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*

## 4. Visual & Accessibility Gaps
- **GAP-VIS-01:** Unreadable Typography. Extensive use of 8px, 9px, and 10px fonts. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*
- **GAP-VIS-02:** Color Overloading. Amber and orange colors are used for multiple conflicting semantic meanings. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*
- **GAP-VIS-03:** Missing Focus Styles. No `:focus-visible` states for keyboard navigation. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*
- **GAP-VIS-04:** Executive Overlay Design. Completely hides the map to show raw numbers; fails to deliver strategic value. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*
