Historical note: This document predates Phase 0 acceptance. Where this document conflicts with docs/audit/PHASE_0_ACCEPTANCE_NOTE.md, docs/phase1/PHASE_1_PLANNING_BRIEF.md, or docs/phase1/PHASE_1_DOCUMENTATION_CONSISTENCY_PREFLIGHT.md, the newer Phase 0/Phase 1 governance documents take precedence.

# E2E Functional Bug Register

This bug register lists the issues and functional gaps identified during the E2E Functional Test Rehearsal of the Q-Sight Command Center staging candidate.

| Bug ID | Feature Area | Severity | Role | Viewport | Expected | Actual | Repro Steps | Blocking? | Recommended Fix |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | Pilot Checklist Drawer | `Low` | All | All | Clicking the "CHECKLIST" button in the Command Bar opens a sliding checklist drawer. | The button toggles the `showPilotChecklist` state, but no drawer component is rendered on-screen. | 1. Load the web interface. <br>2. Click the "CHECKLIST" button in the header.<br>3. Observe that no drawer is displayed. | **No** | Create a `PilotChecklistDrawer` React component and render it conditionally in `App.tsx` under the condition `{showPilotChecklist && ...}`. |
| **BUG-002** | Timeline Panel | `Info` | All | All | Selecting the Timeline tab on the Mission Rail opens a full-screen or sidebar view of all historical events. | The panel renders a placeholder text: `Timeline events full view (WIP)`. | 1. Load the web interface. <br>2. Click the Activity/Timeline icon on the Mission Rail. <br>3. Observe the placeholder panel. | **No** | Implement a detailed timeline list component inside `apps/web/src/components/TimelineStrip.tsx` or a new component. |

## Bug Severity Classification
*   **Critical**: Exposes forbidden data (e.g. video streams, face recognition), leaks credentials, or breaks basic application boot.
*   **High**: Breaks a primary RBAC boundary or blocks core operational flow.
*   **Medium**: Partially breaks a feature or displays incorrect operational states.
*   **Low**: UX inconsistency, missing minor frontend component execution (non-blocking).
*   **Info**: Documentation placeholders or known features in development.

