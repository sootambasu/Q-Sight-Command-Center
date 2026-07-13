# Q-Sight Executive Demo Checklist

Use this checklist to ensure the environment is fully compliant and operational before conducting a live executive demo of Q-Sight Command Center v0.8:

- [ ] **Start PostGIS**: Run `npm.cmd run db:up` and ensure database containers/processes are running.
- [ ] **Start API**: Run `npm.cmd run dev:api` and confirm the Fastify server starts on port 4000.
- [ ] **Start Web**: Run `npm.cmd run dev:web` and verify the Vite dev server starts on port 5173.
- [ ] **Run Static Validation**: Run `npm.cmd run verify:static` to confirm all code builds and types check successfully.
- [ ] **Run WebSocket Verification**: Run `node scripts/ws_verify.js` to ensure the real-time channels and RBAC enforcement pass successfully.
- [ ] **Run Ingestion Verification**: Run `node scripts/verify_ingestion.js` to verify telemetry ingestors, fallbacks, and validation rules.
- [ ] **Open Browser**: Open `http://localhost:5173` and confirm the Cesium 3D globe loads.
- [ ] **Confirm Demo Mode**: Click the **📺 DEMO MODE** toggle in the header and verify that the warning banner appears and scenario controls are functional.
- [ ] **Confirm Role Selector**: Toggle between Operator, Supervisor, Auditor, and Admin, ensuring layer visibility and tabs update correctly.
- [ ] **Confirm Camera Streams Absent**: Verify that selecting a camera entity shows metadata details and privacy notices only. Confirm no video player or streaming feed UI is present.
- [ ] **Confirm Audit Viewer**: Switch to Auditor role and check that the operational map is hidden and the audit logs list matches recent actions.
- [ ] **Confirm Protected Fields**: Verify that credentials, stream hashes, and secret database fields are never exposed in browser developer tools or the dashboard UI.
