# INFORMATION ARCHITECTURE REDRAFT
**Project:** Q-Sight Command Center  
**Version:** v0.8.0-prototype  
**Auditor:** Command-Center Information Architecture Specialist  

## 1. Current Information Architecture Assessment
The current IA relies on a rigid grid and a tab-based right panel (`cc-details-panel`) that fundamentally misunderstands the purpose of a spatial command center. Crucial operational context is fragmented across isolated tabs rather than integrated into a unified situational view.

## 2. Five-Second Test Results
- **Q1: What is happening?** `FAIL` (No situational summary visible; no incident count or mission status.)
- **Q2: Where is it happening?** `PARTIAL` (Globe shows positions, but no alert-to-map highlight path.)
- **Q3: What requires attention?** `FAIL` (Alert badge shows count, but requires clicking into a separate tab/overlay to see priority.)
- **Q4: What data is trusted/stale?** `FAIL` (Source status buried in 'Sources & Layers'; no freshness timestamp on map entities.)
- **Q5: What action should the operator take next?** `FAIL` (No recommended actions or workflow beyond 'Mark Viewed'.)
- **Q6: Which object is currently selected?** `PARTIAL` (Title shown in right panel, but no visual highlight on map.)
- **Q7: What changed recently?** `PARTIAL` (TimelineStrip shows events, but lacks 'since last refresh' context.)

## 3. Navigation Flow Analysis
The primary navigation relies on the `MissionRail` (left sidebar). 
- **Flaw:** Switching tabs entirely replaces the right panel content. 
- **Impact:** An operator viewing a selected aircraft's details who needs to check layer status must switch tabs, destroying the aircraft context completely.

## 4. Alert Workflow Trace and Gaps
1. Alert received via WebSocket → Badge pulses in CommandBar.
2. User clicks badge → `AlertInbox` overlay appears over the map.
3. User sees alert list.
4. **GAP:** No "Locate on Map" action to fly the camera to the alert location.
5. **GAP:** No "Investigate" action to transition from alert triage to spatial analysis.
6. **GAP:** The overlay obscures the spatial canvas it refers to.

## 5. Layer Control Architecture Problems
- Layer toggles exist only in the 'Sources & Layers' tab.
- This creates a modal workflow for a non-modal task. Users should be able to toggle layers while viewing entity details on the map.
- There are no controls for layer opacity, property filtering, or temporal filtering.

## 6. Panel Conflict and Context Loss Analysis
The fundamental architectural flaw is treating the right panel as an exclusive content area managed by router-like state (`activeTab`). In a command center, Entity Details and Layer Controls should be treated as parallel, non-exclusive tool palettes or overlays that coexist over the spatial canvas.

## 7. Role-Based Architecture Assessment
- **Operator/Supervisor:** Needs spatial, alert, and source context.
- **Auditor:** Restricted to Timeline and Compliance.
- **Flaw:** The UI structure remains identical for all roles, simply disabling certain tabs. The CommandBar explicitly shows the role selector, exposing internal state and breaking immersion during client demos.

## 8. Proposed Revised Application Hierarchy
The interface must be flattened to prioritize the spatial canvas and eliminate destructive context switching.

1. **Global Header:** Brand, active mission/mode, global search.
2. **Operational Status Strip:** Persistent horizontal bar showing overall system health, alert counts by severity, and source degradation warnings.
3. **Spatial Canvas (Main):** Edge-to-edge Cesium globe.
4. **Floating Tool Palettes (Left/Right):**
   - *Left:* Mission Rail (collapsible), Layer Controls (overlay panel).
   - *Right:* Selected Object Details (overlay panel), Alert Queue (collapsible panel).
5. **Timeline/Command Surface (Bottom):** Expandable drawer for chronological events.

## 9. Priority Navigation Flows for Each Role
- **Operator Flow:** Map → Alert Queue → Selected Entity Details → Action. All panels coexist.
- **Executive Flow:** Map → Aggregated Metric Overlay (charts/trends, not just counts) → Strategic Summary.

## 10. Information Density and Cognitive Load
Current cognitive load is artificially high because users must remember state across tab views. By adopting a "glass pane" overlay approach, density is increased but cognitive load is reduced through persistent context.

## 11. Decision Support Gap Analysis
The UI currently acts as a passive data viewer. It provides raw TLE data and asset UUIDs instead of actionable intelligence (e.g., "Satellite overhead in 5 mins", "Asset boundary breached 30s ago"). Translating data into operator decisions is the primary missing capability.
