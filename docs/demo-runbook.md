Historical note: This document predates Phase 0 acceptance. Where this document conflicts with docs/audit/PHASE_0_ACCEPTANCE_NOTE.md, docs/phase1/PHASE_1_PLANNING_BRIEF.md, or docs/phase1/PHASE_1_DOCUMENTATION_CONSISTENCY_PREFLIGHT.md, the newer Phase 0/Phase 1 governance documents take precedence.

# Q-Sight Command Center — Executive Demo Runbook

This runbook guides technical presenters and operators on how to initialize, verify, and run the Q-Sight Command Center v0.8 presentation environment.

## Prerequisites

1. **Node.js**: v18 or later installed.
2. **PostgreSQL / PostGIS**: Local instance running or configured in environment.
3. **Environment Configuration**: A configured `.env` file in the root workspace.

---

## Startup Sequence

Follow these steps to initialize the environment:

### Step 1: Start PostGIS
Start the PostgreSQL database service. If utilizing Docker:
```bash
npm.cmd run db:up
```

### Step 2: Run Verification Scripts
Ensure the WebSocket channels and data ingestion adapters are operating properly under static conditions:
```bash
node scripts/ws_verify.js
node scripts/verify_ingestion.js
```

### Step 3: Start the Backend API
Start the Fastify REST & WebSocket service:
```bash
npm.cmd run dev:api
```

### Step 4: Start the Frontend Web Dashboard
Start the Vite developer server for the Web SPA:
```bash
npm.cmd run dev:web
```

---

## Verification Checklist

Navigate to `http://localhost:5173` and check the following parameters:

*   **Globe Loading**: The Cesium 3D globe should render. (If no Ion Token is configured, it falls back to OpenStreetMap tiles gracefully).
*   **API / DB Badges**: Header badges should display `CONNECTED` for API and `CONNECTED` for DB.
*   **Role Switcher**: Verify that switching to the "auditor" role automatically hides operational maps, cleanses state variables, and renders the Audit Viewer.
*   **Demo Mode**: Activating the Demo Mode toggle will intercept polling networks and display deterministic scenarios.

---

## Stop Procedure

To terminate all services safely, issue `Ctrl + C` in each terminal window or spin down the container:
```bash
# If using docker
docker-compose down
```

