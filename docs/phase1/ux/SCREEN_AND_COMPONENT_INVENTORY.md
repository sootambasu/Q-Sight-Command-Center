# SCREEN AND COMPONENT INVENTORY & ACCESSIBILITY AUDIT
**Project:** Q-Sight Command Center  
**Version:** v0.8.0-prototype  
**Auditor:** Accessibility and Responsive UX Reviewer  

## SECTION A: Screen and Component Inventory

### 1. Routes & View States
Q-Sight is a single-page application (SPA) running entirely on a single route (`/`). View state is managed via React state (`activeTab`, `isExecutiveView`, `selectedEntityId`).

**Major View States:**
- **Initial Load:** Spinner/black screen until Cesium tiles load.
- **Globe View (Default):** Map + `EntityDetailPanel` (empty).
- **Entity Selected:** Map + populated `EntityDetailPanel`.
- **Sources & Layers:** Map + `SourceHealthPanel` (replaces detail panel).
- **Alert Inbox:** Map + `AlertInbox` component (replaces detail panel).
- **Timeline:** Shows WIP placeholder.
- **Compliance Audit:** Shows audit log viewer.
- **Executive View:** Opaque overlay hiding map with metric cards.
- **Alert Overlay:** Absolute positioned modal triggered from `CommandBar`.

### 2. Major Components
- `App.tsx`: Monolithic God component holding layout and map logic.
- `CommandBar.tsx`: Top header for navigation and status.
- `MissionRail.tsx`: Left sidebar for primary navigation tabs.
- `EntityDetailPanel.tsx`: Right panel for object inspection.
- `SourceHealthPanel.tsx`: Right panel for data stream toggles and health.
- `AlertInbox.tsx`: Right panel / overlay for alert management.
- `ExecutiveOverlay.tsx`: Full-screen modal for executive metrics.
- `TimelineStrip.tsx`: Bottom horizontal scrolling event viewer.
- `MetricCard.tsx`: Reusable stat card used in ExecutiveOverlay.

---

## SECTION B: Accessibility and Responsive UX Audit

### 1. WCAG 2.1 AA Compliance Gaps
- **Color Contrast:** FAILS. `--text-muted` (`#64748b`) on `--bg-dark` (`#0f1115`) provides a ~3.2:1 ratio, failing the 4.5:1 minimum for normal text. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*
- **Minimum Font Size:** FAILS. 8px and 9px text used in badges and timelines is entirely unreadable and violates accessibility standards. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*
- **Semantic HTML:** FAILS. `MissionRail` lacks `role="tablist"`, missing `aria-label`s on icon-only buttons.
- **Keyboard Navigation:** FAILS. While buttons are focusable, there are **no custom focus styles** defined in the CSS, meaning keyboard users have no reliable visual indicator of their current position.
- **Screen Reader Support:** FAILS. No `aria-live` regions for incoming WebSocket alerts.

### 2. Viewport Assessment
- **Responsive Architecture:** The application utilizes only *one* media query (`max-width: 1440px`), which merely shrinks the right panel from 320px to 280px.
- **2560x1440:** Map canvas is huge, layout holds up well.
- **1920x1080:** Ideal viewport, components fit comfortably.
- **1366x768 (Standard Corporate Laptop):** Critical failures begin. The 40px `CommandBar` contains 17+ interactive elements. At 1366px, this will cause severe cramping, overlap, or clipping. The 24px `SafetyFooter` becomes unreadably thin. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*
- **1280x800 & Below:** Layout breaks. The rigid grid structure (`100vw`, `overflow: hidden`) prevents scrolling, causing panels to eat into the map canvas and UI elements to collide. *(Ref: PLANNED EVIDENCE — NOT YET CAPTURED)*

### 3. Touch Target Assessment
- `MissionRail` buttons are 40x40px (just shy of the 44x44px WCAG recommendation).
- `CommandBar` badges and 'Mark Viewed' buttons possess extremely small padding (e.g., 2px 6px), resulting in touch targets as small as ~18x20px, making them nearly impossible to tap accurately on touch displays.

### 4. Reduced-Motion Gap
The application runs 3 simultaneous infinite CSS animations (`pulse-badge`, `border-pulse`, `pulse-bg-warning`) when in Demo Mode. There is no `@media (prefers-reduced-motion: reduce)` block anywhere in the codebase. This is a significant accessibility failure for users with vestibular disorders.

### 5. Remediation Priorities
1. Establish a strict CSS focus state (`:focus-visible`).
2. Fix color contrast ratios and eradicate sub-11px font sizes.
3. Implement `aria-label` attributes on all icon-only buttons.
4. Redesign the `CommandBar` to be responsive at 1366px (e.g., collapse status badges).
5. Wrap all infinite animations in `prefers-reduced-motion` media queries.
