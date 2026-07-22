# Screenshot Evidence Record

All screenshot states are marked as **MISSING — NOT REPRODUCIBLE**.

## Attempted Screenshot Capture Diagnostics
To attempt controlled browser evidence capture:
1. **Start all required local services:** Executed `npm.cmd run dev:api` and `npm.cmd run dev:web`. Confirmed the API port 4000 and the Web port 5173 were already occupied by active background node processes.
2. **Confirm frontend URL:** Read and verified http://localhost:5173/ responds with the Q-Sight Command Center index page.
3. **Confirm API health:** Read and verified http://localhost:4000/health responds with `{"status":"ok","timestamp":"...","app":"q-sight-api"}`.
4. **Open the application in browser integration:** Attempted to trigger browser rendering or screenshot capture.
5. **Exact Blocker & Errors:**
   - **Attempted Command:** CLI browser screenshot script or native browser agent tools.
   - **URL:** http://localhost:5173/
   - **Error:** No command/tool available for screenshot generation.
   - **Missing Dependency:** `playwright` or `puppeteer` is not declared in root or app dependency packages, and no automated headless browser package is globally installed.
   - **Exact Blocker:** The current execution sandbox does not expose a browser automation tool (like `read_browser_page`) or any headless capture capability.

## Records

| Expected Filename | State | Commit SHA | Route/State | Viewport | Browser | Date/Time | Relevant UX Gaps |
|-------------------|-------|------------|-------------|----------|---------|-----------|------------------|
| `01_initial_load_1920x1080.png` | PLANNED EVIDENCE — NOT YET CAPTURED | HEAD | `/` (Initial Load) | 1920x1080 | Chromium | 2026-07-17T13:58:33+05:30 | GAP-MAP-01, GAP-MAP-02 |
| `02_full_globe_1920x1080.png` | PLANNED EVIDENCE — NOT YET CAPTURED | HEAD | `/` (Globe View) | 1920x1080 | Chromium | 2026-07-17T13:58:33+05:30 | GAP-MAP-01, GAP-MAP-02, GAP-VIS-02 |
| `03_dense_telemetry_1920x1080.png` | PLANNED EVIDENCE — NOT YET CAPTURED | HEAD | `/` (Globe View) | 1920x1080 | Chromium | 2026-07-17T13:58:33+05:30 | GAP-MAP-04 |
| `04_selected_aircraft.png` | PLANNED EVIDENCE — NOT YET CAPTURED | HEAD | `/` (Aircraft Selected) | 1920x1080 | Chromium | 2026-07-17T13:58:33+05:30 | GAP-MAP-03, GAP-MAP-06, GAP-IA-01 |
| `05_selected_satellite.png` | PLANNED EVIDENCE — NOT YET CAPTURED | HEAD | `/` (Satellite Selected) | 1920x1080 | Chromium | 2026-07-17T13:58:33+05:30 | GAP-MAP-05 |
| `06_selected_seismic.png` | PLANNED EVIDENCE — NOT YET CAPTURED | HEAD | `/` (Seismic Selected) | 1920x1080 | Chromium | 2026-07-17T13:58:33+05:30 | GAP-VIS-02 |
| `07_alert_queue.png` | PLANNED EVIDENCE — NOT YET CAPTURED | HEAD | `/` (Alert Inbox) | 1920x1080 | Chromium | 2026-07-17T13:58:33+05:30 | GAP-IA-01, GAP-IA-02 |
| `08_degraded_source.png` | PLANNED EVIDENCE — NOT YET CAPTURED | HEAD | `/` (Sources & Layers) | 1920x1080 | Chromium | 2026-07-17T13:58:33+05:30 | GAP-IA-01, GAP-IA-03 |
| `09_empty_state.png` | PLANNED EVIDENCE — NOT YET CAPTURED | HEAD | `/` (No Selection) | 1920x1080 | Chromium | 2026-07-17T13:58:33+05:30 | GAP-IA-01 |
| `10_loading_state.png` | PLANNED EVIDENCE — NOT YET CAPTURED | HEAD | `/` (Loading) | 1920x1080 | Chromium | 2026-07-17T13:58:33+05:30 | GAP-VIS-01 |
| `11_viewport_1366x768.png` | PLANNED EVIDENCE — NOT YET CAPTURED | HEAD | `/` (Globe View) | 1366x768 | Chromium | 2026-07-17T13:58:33+05:30 | GAP-ARCH-03 |
| `12_viewport_1920x1080.png` | PLANNED EVIDENCE — NOT YET CAPTURED | HEAD | `/` (Globe View) | 1920x1080 | Chromium | 2026-07-17T13:58:33+05:30 | GAP-ARCH-03 |
| `13_executive_overlay.png` | PLANNED EVIDENCE — NOT YET CAPTURED | HEAD | `/` (Executive View) | 1920x1080 | Chromium | 2026-07-17T13:58:33+05:30 | GAP-VIS-04, GAP-ARCH-03 |
| `14_panel_context_switch.png` | PLANNED EVIDENCE — NOT YET CAPTURED | HEAD | `/` (MissionRail Toggle) | 1920x1080 | Chromium | 2026-07-17T13:58:33+05:30 | GAP-IA-01 |
| `15_default_cesium_widgets.png` | PLANNED EVIDENCE — NOT YET CAPTURED | HEAD | `/` (Globe View) | 1920x1080 | Chromium | 2026-07-17T13:58:33+05:30 | GAP-MAP-01 |
| `16_current_fallback_imagery.png` | PLANNED EVIDENCE — NOT YET CAPTURED | HEAD | `/` (Globe View) | 1920x1080 | Chromium | 2026-07-17T13:58:33+05:30 | GAP-MAP-02 |
