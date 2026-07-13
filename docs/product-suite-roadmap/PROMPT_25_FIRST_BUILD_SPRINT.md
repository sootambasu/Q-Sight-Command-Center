# Prompt 25 — Execute Phase 0 Stabilization Sprint

Copy the content below to start the first implementation sprint.

```markdown
<USER_REQUEST>
Prompt 25 — Execute Phase 0 Stabilization Sprint

You are working inside:
d:/Q-Sight Command Center

Context:
Prompt 24 completed the roadmap review, gap analysis, and prioritization for Q-Sight Command Center, choosing Phase 0 Stabilization Sprint as the first implementation sprint. We must now execute this sprint to secure the codebase before starting security and feature additions.

Goal:
Implement the Phase 0 Baseline Stabilization Sprint. This sprint is focused strictly on developer tooling, Git readiness, local CI validation scripts, versioning mechanics, dependency updates, and environment cleanliness.

Strict Exclusions:
Do not implement, modify, or configure:
* Azure AD / Entra ID, JWT middleware, or WebSocket authentication.
* Prometheus, OpenTelemetry, Datadog, or centralized logging.
* Server-side alert persistence, schema migrations, or database tables.
* Admin console frontend pages or config CRUD APIs.
* Camera stream playback, RTSP, HLS, or WebRTC.
* Person tracking, facial recognition, or AI assistant/chatbots.
* SGP4 orbital rendering or satellite coordinate calculations.
* Kubernetes charts or Helm templates.

Staged Execution Plan:

Stage 1: Repository Onboarding and Contributing Guide
1. Create a `docs/CONTRIBUTING.md` guide specifying:
   * Branching rules: `main` (production), `develop` (integration), `feature/*` (epics).
   * Commit message conventions (e.g., conventional commits: feat, fix, chore).
   * Local verification requirements before pushing code.
2. Create a `.gitattributes` file at the repository root to normalize line endings (LF for code, CRLF if necessary for scripts).

Stage 2: Standardized Verification & Local CI Baseline
1. Create a PowerShell script `scripts/ci_verify.ps1` that performs:
   * Clean npm install validation.
   * `npm run build` of all workspaces.
   * `npm run typecheck` across API, Web, and Workers.
   * Run the safety scanner: `node scripts/verify_safety_guardrails.js`.
   * Exit with `0` on success and `1` on any failure.
2. Add a new npm script in the root `package.json` called `"verify:ci"` pointing to `powershell -ExecutionPolicy Bypass -File scripts/ci_verify.ps1`.

Stage 3: Workspace Dependency Audit and Upgrades
1. Perform a safe, non-breaking upgrade of `esbuild` to version `^0.21.5` in all workspace layers to clear security warnings.
2. Run `npm install` to update the lockfile.
3. Validate that Vite builds and Fastify endpoints work correctly under the new package versions.
4. Run `npm audit --omit=dev` and confirm runtime vulnerabilities are assessed and documented.

Stage 4: Docker Image Version Tagging
1. Create a powershell script `scripts/build_docker.ps1` that reads the package version from `package.json` (root) and runs Docker build commands for API and Web tagging the images with that version instead of mutable names.
2. Update references to built images in the docker-compose prototype file to use variables or explicit version numbers.

Stage 5: Environment Cleanup
1. Consolidate `.env.example`, `.env.live.example`, `.env.staging.example`, and `.env.demo.example` to ensure that all polling intervals and server configurations match the verified safe parameters (120s aircraft, 300s seismic, 86400s satellite).

Verification:
Execute the following commands to confirm that the stabilization has been successfully implemented and has caused no regressions:
1. `npm install`
2. `npm run verify:ci`
3. `npm run build`
4. `npm run typecheck`
5. `npm run safety:verify`
6. `powershell -ExecutionPolicy Bypass -File scripts/build_docker.ps1`

Documentation Updates:
1. Update `walkthrough.md` in the root workspace to summarize the Stabilization sprint execution.
2. Update `task.md` in the root workspace, marking all Phase 0 tasks as completed.
3. Create a release evidence file `docs/audit/v1.1-RELEASE_EVIDENCE.md` listing the command execution traces and dependency audit results.

Completion Report:
Once finished, provide a completion report detailing:
1. Final Status (should be "Phase 0 Stabilization Complete — Staging Baseline v1.1 Frozen")
2. Files Created
3. Files Modified
4. Dependency Upgrade Audit Summary
5. Verification Command Logs
6. Next Phase Recommendation
</USER_REQUEST>
```
