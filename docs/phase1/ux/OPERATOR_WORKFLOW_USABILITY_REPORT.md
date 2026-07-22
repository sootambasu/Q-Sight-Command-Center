# OPERATOR WORKFLOW USABILITY REPORT
**Project:** Q-Sight Command Center  
**Version:** v0.8.0-prototype  
**Auditor:** Operator Workflow Usability Reviewer  

## 1. Audit Methodology
This audit evaluates the usability of Q-Sight Command Center by tracing 10 core operator workflows against the current UI architecture. Workflows are graded on a scale of 1-10 based on efficiency, cognitive load, and success rate, focusing heavily on context preservation and spatial awareness.

## 2. Workflow Traces & Usability Scoring

### Workflow 1: Understand Current Operational Status
- **Goal:** Determine if the system is healthy and if there are active incidents.
- **Trace:** User loads app → Scans `OperatingModeBanner` → Scans `CommandBar` badges (API, DB, RT, MAP) → Manually counts dots on the globe.
- **Failure Point:** No unified health dashboard or mission brief. Status badges are scattered.
- **Time Estimate:** 30-60 seconds (Target: <5s).
- **Score:** 2/10 (FAIL)

### Workflow 2: Find High-Priority Alert
- **Goal:** Identify the most critical active issue.
- **Trace:** Notice pulsing badge → Click badge → `AlertInbox` overlay appears.
- **Failure Point:** List is not sortable by priority, only recency. User must manually scan for severity text/emojis.
- **Time Estimate:** 15-30 seconds.
- **Score:** 3/10 (FAIL)

### Workflow 3: Locate Alert on Map
- **Goal:** View the spatial context of an alert.
- **Trace:** Open `AlertInbox` → Read alert → *Dead End*. User must close the inbox and manually pan/zoom the globe to find the matching entity.
- **Failure Point:** No "Locate on Map" action. No search function.
- **Time Estimate:** 1-3 minutes.
- **Score:** 1/10 (CRITICAL FAIL)

### Workflow 4: Inspect Associated Object
- **Goal:** Understand details about a selected entity.
- **Trace:** Click entity on globe → Read `EntityDetailPanel`.
- **Failure Point:** Data presented is developer-centric (e.g., raw TLE lines for satellites, UUIDs for assets) rather than operator-centric actionable intelligence.
- **Score:** 4/10 (PARTIAL)

### Workflow 5: Understand Source Freshness
- **Goal:** Determine if data on the map is current.
- **Trace:** Switch to 'Sources & Layers' tab → Read `SourceHealthPanel`.
- **Failure Point:** Tab switch destroys the selected entity context. No visual indicator of staleness on the map itself.
- **Score:** 2/10 (FAIL)

### Workflow 6: Filter Unrelated Layers
- **Goal:** Declutter the map.
- **Trace:** Switch to 'Sources & Layers' tab → Toggle switches.
- **Failure Point:** Requires context-destroying tab switch.
- **Score:** 4/10 (POOR)

### Workflow 7: Acknowledge an Alert
- **Goal:** Take ownership of an alert.
- **Trace:** Open `AlertInbox` → Click 'Mark Viewed'.
- **Failure Point:** No state machine for alerts (New → Ack → Resolved). 'Clear All' deletes everything without confirmation.
- **Score:** 2/10 (INCOMPLETE)

### Workflow 8: Return to Global Operational View
- **Goal:** Reset view after investigating an incident.
- **Trace:** Click 'Globe' tab.
- **Failure Point:** The camera remains zoomed in; the user must manually zoom out. The `flyToCoords` helper exists in code but is not exposed in the UI.
- **Score:** 3/10 (POOR)

### Workflow 9: Detect Degraded Data Source
- **Goal:** Notice when a data feed fails.
- **Trace:** *Hidden Action*. User must be actively viewing the 'Sources & Layers' tab.
- **Failure Point:** Seismic source is hardcoded to 'DEGRADED'. No proactive map-level notification.
- **Score:** 1/10 (FAIL)

### Workflow 10: Distinguish Data Quality States
- **Goal:** Know if an entity is LIVE or simulated (MOCK/DATABASE).
- **Trace:** *Hidden Action*. 
- **Failure Point:** No entity-level freshness indicators. LIVE and DATABASE entities look identical on the map.
- **Score:** 1/10 (FAIL)

## 3. Cognitive Load Analysis
Cognitive load is dangerously high because the UI requires users to maintain state in their working memory. Because navigating to 'Sources' or 'Alerts' hides the map or entity details, the operator must remember the spatial context while interacting with tabular data.

## 4. Context Loss Points
The primary context loss occurs when interacting with the `MissionRail`. Switching tabs fundamentally alters the UI structure, replacing the right panel rather than overlaying tools atop a persistent map.

## 5. Missing Workflow Primitives
- **Acknowledge:** No way to accept or assign an alert.
- **Search:** No way to find an entity by ID or name.
- **Locate:** No camera fly-to action from lists.
- **Filter:** No temporal or property-based filtering on the map.

## 6. Top 5 Operator Workflow Defects
1. No "Locate on Map" action from the Alert Inbox.
2. Tab switching destroys spatial context.
3. No proactive system health/freshness indicators on the main view.
4. Alerts cannot be sorted by priority or acknowledged.
5. Entity details expose internal database IDs instead of operational intelligence.

## 7. Recommended Workflow Redesign Priorities
1. **P0:** Implement "Locate on Map" (camera fly-to) for all alerts and events.
2. **P0:** Move layer controls and source health out of exclusive tabs and into non-blocking overlays.
3. **P1:** Implement a true Alert State Machine (New, Acknowledged, Resolved).
4. **P1:** Add global search and filtering capabilities.
