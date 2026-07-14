Historical note: This document predates Phase 0 acceptance. Where this document conflicts with docs/audit/PHASE_0_ACCEPTANCE_NOTE.md, docs/phase1/PHASE_1_PLANNING_BRIEF.md, or docs/phase1/PHASE_1_DOCUMENTATION_CONSISTENCY_PREFLIGHT.md, the newer Phase 0/Phase 1 governance documents take precedence.

# Q-Sight Command Center — Operator Walkthrough

This document outlines the user interface components of the Q-Sight Command Center and explains how a dashboard operator interacts with spatial telemetry.

---

## 1. Dashboard Layout

The interface is divided into five operational areas:
*   **Header Status Bar**: Displays API connection status, database connectivity status, WebSocket real-time subscription status, and the Simulated Role selector.
*   **Left Sidebar (Controls)**: Manages visible layers (Monitored Assets, Aviation/Orbital/Seismic Telemetry, Camera registries) and hosts the Guided Scenario controls.
*   **Center Globe (CesiumJS)**: Interactively renders 3D spatial entity points and geofence polygons.
*   **Right Detail Panel**: Displays granular metadata for the selected entity.
*   **Bottom Timeline Feed**: Feeds chronological operational alerts, telemetry events, and system notifications.

---

## 2. Interaction Walkthrough

### Switching Roles
Utilize the **Simulator** drop-down menu in the header to alternate access permissions:
*   **Operator**: Baseline operations view. Cannot see detailed camera owner IDs or precise camera coordinates. Restricted from viewing sensitive asset boundaries.
*   **Supervisor / Admin**: Granted access to view geofence boundaries and full camera coordinate details.
*   **Auditor**: Blocked from all operational telemetry layers. Tab switches to the **Compliance Audit Ledger** to inspect read access events and denied query logs.

### Layer Controls
Toggle visibility using the checkboxes in the **Layers Registry** panel. Telemetry items currently off-line or containing missing coordinates will automatically disable selection to prevent Cesium mapping errors.

### Selecting Telemetry
Click any marker on the Cesium globe:
*   Refinery or facility locations display asset details.
*   Aviation markers display Call Sign, Country of Origin, Speed, and Altitude.
*   USGS seismic pins show Richter magnitude, depth, and epicentral description.
*   Camera pins open metadata status with a disclaimer outlining privacy rules.

---

## 3. Scope and Intentional Limitations

*   **No Live Camera Streams**: In compliance with privacy guidelines, this console is strictly metadata-only. Video playback widgets, WebRTC endpoints, and public CCTV scraping are intentionally unsupported.
*   **Privacy Gating**: Detail fields are sanitized server-side. De-redaction is controlled strictly via role-based headers, preventing authorization bypass.

