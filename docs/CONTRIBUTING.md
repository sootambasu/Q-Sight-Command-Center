# Contributing Guidelines — Q-Sight Command Center

This document outlines development practices, version control conventions, and safety guidelines for the Q-Sight Command Center project.

---

## 1. Project Overview & Status

Q-Sight Command Center is an Industrial Spatial Intelligence cockpit designed for monitoring non-human assets, logistics, emergency response, and safety operations. It coordinates aviation, orbital, and seismic feeds on a 3D CesiumJS globe.

*   **Current Status**: Pilot-frozen, pre-production.
*   **Target Staging Baseline**: v1.1.

---

## 2. Strict Safety & Ethical Boundaries (Forbidden Features)

The following capabilities are strictly prohibited from being implemented, integrated, or configured in this repository. All code submissions must pass automated safety scanner validation:

1.  **No Live Camera Streams / Video Playback**: Camera data remains metadata-only. Avoid RTCPeerConnection, WebRTC, RTSP, HLS, or `<video>` elements in frontend code.
2.  **No Public CCTV Scraping**: Direct connections to unauthenticated public camera directories (e.g. Shodan, Insecam) are banned.
3.  **No Facial Recognition / Biometrics**: Biometric identification, gait analysis, and face-mesh models are forbidden.
4.  **No Person Tracking**: Telemetry is restricted to mechanical assets (planes, satellites) and geophysical events (seismic data). No profiling of individuals or crowds is allowed.
5.  **No Predictive Policing / Social Profiling**: Behavioral prediction models or profiling tools are banned.

---

## 3. Branching Model

This project follows a structured git branch workflow. Since Git is not initialized in the local workspace, these guidelines must be configured in remote repository settings (e.g. branch protection rules) once a Git remote is created:

*   **`main`**: Mirrors production staging releases. Direct pushes are disabled. Releases are merged via Pull Request only.
*   **`develop`**: The main integration branch. All feature branches merge here after passing local and CI tests.
*   **`feature/*`**: Transient branches for implementing new epics or roadmap features.
*   **`hotfix/*`**: Emergency fixes directly targeting production stability.

---

## 4. Commit Message Convention

We enforce standard **Conventional Commits**:
*   `feat`: A new feature implementation.
*   `fix`: A bug fix (UI, API, or worker).
*   `chore`: Tooling updates, package overrides, documentation, or release configuration.
*   `docs`: Documentation-only updates.
*   `test`: Adding or correcting tests.
*   `refactor`: Code change that neither fixes a bug nor adds a feature.

Example:
```bash
chore: override esbuild to v0.25.0 to resolve dev server vulnerability
```

---

## 5. Local Verification Requirements

Before submitting any code for integration into `develop` or `main`, you **must** run the local CI suite. Any failure will block release readiness.

### Command Execution:
```bash
# Run full static verification suite (build, typecheck, safety scans, ws checks)
npm.cmd run verify:ci

# Run CI verification including Docker image building
npm.cmd run verify:ci:docker
```

---

## 6. Docker Prototype Workflow

To spin up the containerized prototype cluster locally:
1.  **Build staging images**:
    ```bash
    npm.cmd run pilot:docker:build
    ```
2.  **Launch services (PostgreSQL, Fastify API, Nginx Web Client)**:
    ```bash
    docker compose -f infra/docker-compose.prototype.yml up -d postgres api web
    ```
3.  **Verify endpoints**:
    *   API Health: `http://localhost:4000/health`
    *   API Readiness: `http://localhost:4000/ready`
    *   API Version: `http://localhost:4000/version`
    *   Web Endpoint: `http://localhost:5173`
4.  **Tear down services**:
    ```bash
    docker compose -f infra/docker-compose.prototype.yml down
    ```

---

## 7. Known Non-Blocking UI Issues

Do not implement fixes for these issues within stabilization sprints unless specifically tasked. They are carried forward as low-severity non-blocking bugs:
*   **BUG-001**: The "CHECKLIST" button toggles state in the Command Bar, but the sliding Checklist drawer component is not rendered in the TSX code.
*   **BUG-002**: The Timeline Mission Rail panel displays a WIP placeholder instead of the full historical activities list.
