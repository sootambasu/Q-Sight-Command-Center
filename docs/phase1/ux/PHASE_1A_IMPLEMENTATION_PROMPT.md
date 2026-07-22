# PHASE 1A IMPLEMENTATION PROMPT
**Project:** Q-Sight Command Center  
**Target:** Execution Agent

## Context
You are tasked with executing **Phase 1A: Enterprise Experience Refactoring** for the Q-Sight Command Center. The application currently functions as a prototype but suffers from severe UI/UX, styling, and map rendering defects. Your goal is to elevate it to enterprise-ready status.

### Branching Control
- **Create branch:** `feature/phase1a/enterprise-experience-redesign`
- **Branch from:** `develop`
- **Rule:** No direct push to `develop` or `main`.
- **Review:** Use PR review process.

### Scope Boundary
- **Frontend-only implementation.**
- **No backend contract changes.**
- **No database changes.**
- **No authentication changes.**
- **No telemetry schema changes.**
- **No weakening of safety controls.**
- **No Phase 1B, 1C, 1D, or 1E work.**

---

## Scoped Backlog

### UX-P0 Required Scope
- **Remove Developer Controls:** Hide/remove all client-visible developer artefacts (e.g., `DEMO MODE`, `MODE: DEVELOPMENT` indicators, client-side role selectors).
- **Hide Default Cesium Widgets:** Disable default Cesium UI controls (e.g., `homeButton`, `sceneModePicker`, `baseLayerPicker`) or replace them with styled/branded integrations.
- **Design Tokens Integration:** Establish comprehensive token systems in CSS using custom properties (colors, layout scales, spacing).
- **Contrast & Typography:** Fix WCAG 2.1 AA contrast violations for normal text and eradicate all unreadably small font sizes (under 11px).
- **Preserve Selection Context:** Modify layout and tab state behavior so that switching panels in the navigation rail does not destroy active selection/inspection context.
- **Executive Overlay Glassmorph:** Redesign the opaque executive overview to render stats on top of a semi-transparent, blurred backdrop so that spatial map situational awareness remains intact.
- **Entity Highlights:** Render prominent selection styling on Cesium map entities when they are clicked/inspected.
- **Safe Imagery Defaults:** Implement default dark-themed satellite/terrain map sources and clear fallback configurations without relying on public OpenStreetMap raster endpoints.
- **Remove WIP Indicators:** Eliminate "Timeline events full view (WIP)" and other mock placeholders.
- **Responsive Layout Fixes:** Refactor the header and panels to ensure full usability at 1366x768 viewports without layout overlap.

### UX-P1 Required Scope
- **Custom SVG Billboards:** Replace primitive circle points and emoji labels with professionally-designed SVG icons representing distinct entity categories.
- **Clustering Strategy:** Implement entity clustering configurations to manage visual noise and browser resource load in high-density locations.
- **Label Collision & LOD:** Add distance display conditions and label collision handling so text doesn't overlap at wide zoom levels.
- **Alert "Locate on Map":** Add a click-to-focus action to alert cards that sweeps the camera smoothly to the corresponding asset coordinates.
- **Source Health Dashboard:** Surface clear, real-time indicators for data stream health, staleness, and degraded sensor sources.
- **Rail Usability:** Add labels or accessible text hints to the sidebar mission rail.
- **Responsive Command Bar:** Refactor the top status headers to collapse smoothly onto smaller viewports.
- **Focus States & ARIA:** Define clear visual `:focus-visible` styles and apply proper ARIA roles/tablists.
- **Reduced Motion Support:** Wrap infinite pulse animations in `@media (prefers-reduced-motion: reduce)` configuration blocks.
- **Architectural Deconstruction:** Deconstruct the massive monolithic state in `App.tsx` into decoupled domain components and introduce a dedicated state container.

---

## Measurable Acceptance Criteria

### Build Integrity
Every deployment build must execute and pass the following integrity sequence:
- `npm ci`
- `npm run build`
- `npm run typecheck`
- `npm test`
- `npm run verify:static`
- `node scripts/verify_safety_guardrails.js`

### Responsive Layout Criteria
At viewports `1366x768`, `1440x900`, `1920x1080`, and `2560x1440`, verified output must show:
- No horizontal scrollbars or page overflow.
- No clipped, overlapping, or hidden primary buttons/controls.
- No side panels blocking user interaction with the Cesium globe.
- Minimum normal-text size of `12px` (unless explicitly justified for tertiary technical metadata).
- Interactive touch targets must be at least `40x40px` (with a target of `44x44px`).

### Accessibility Criteria
- WCAG AA contrast ratio (4.5:1 minimum) for all normal body and label text.
- High-visibility keyboard focus rings.
- ARIA labels and roles on all icon-only interactive controls.
- Automatic deceleration/disabling of pulse animations if reduced-motion is requested in OS.
- No critical labels or system notifications rendered under `11px`.

### Map Rendering Criteria
- Default Cesium controls hidden or intentionally custom-styled.
- Selected entity clearly distinguishable via visual highlighting (color pulse or outline halo).
- Label Level of Detail (LOD) rules implemented via `distanceDisplayCondition`.
- Entity clustering activates automatically at dense zoom ranges.
- Distinct entity types must use unique visual symbols (no emoji text).
- **No OSM Raster Fallback:** Public OpenStreetMap raster endpoints must not be used as an enterprise production fallback because of public tile usage policies, rate limits, limited styling control, and external operational dependency.
  - *Public OSM raster endpoint:* not allowed as enterprise production fallback.
  - *Self-hosted OSM-derived raster/vector tiles:* allowed subject to attribution, ODbL obligations, and operational approval.
  - *Cesium Ion or another approved commercial provider:* enterprise-connected default.
  - *Self-hosted tile server/GeoServer:* offline or on-prem default.
- Globe viewport remains visible under blurred metrics overlay in Executive mode.

### Performance Criteria
Measurements must be taken and documented for:
- **First Meaningful Map Render:** Frame load completion time.
- **Dense Telemetry FPS:** Render rate under mock load conditions.
- **Max Entity Count:** Stable limit before rendering stutter.
- **Memory Consumption:** Profile memory overhead over a 10-minute active run.
- **Camera Transition Duration:** Standardized camera fly-to movement times.
- **Selection Response Time:** Visual state switch delay under 100ms.

---

## Data & Architecture Boundaries

### Satellite-Data Boundary
- **Phase 1A must not invent orbital position or altitude data.**
- If accurate satellite altitude is not available in the current frontend contract:
  - Do not fabricate a replacement or hardcode altitude values (e.g. 400km).
  - Mark the value as unavailable or hide altitude-dependent rendering.
  - Register a technical dependency for **Phase 1D: Realtime Ingestion Fix**.
  - Do not modify backend contracts or database structures in Phase 1A.

---

## Required Implementation Evidence Outputs
The execution of Phase 1A must output the following completed verification documents:
1. `docs/phase1/ux/PHASE_1A_IMPLEMENTATION_REPORT.md`
2. `docs/phase1/ux/PHASE_1A_COMMAND_EVIDENCE_LOG.md`
3. `docs/phase1/ux/PHASE_1A_RESPONSIVE_TEST_REPORT.md`
4. `docs/phase1/ux/PHASE_1A_MAP_PERFORMANCE_REPORT.md`
5. `docs/phase1/ux/PHASE_1A_ACCESSIBILITY_REPORT.md`
6. `docs/phase1/ux/PHASE_1A_EXECUTIVE_DEMO_REVIEW.md`
7. `docs/phase1/ux/PHASE_1A_BEFORE_AFTER_INDEX.md`
