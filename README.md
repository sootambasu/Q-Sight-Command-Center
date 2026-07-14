# Q-Sight Command Center

> [!WARNING]
> **Advisory-Only System** — Q-Sight provides advisory decision support only. It does NOT autonomously
> trigger emergency shutdowns, issue control commands to industrial equipment, or guarantee real-time data
> accuracy. Operators must verify all alerts independently before taking action.

> [!IMPORTANT]
> **Prototype Status** — This is a pre-production prototype (v0.1.0). It is NOT enterprise-ready or
> pilot-ready as of 2026-07-13. Phase 1 implementation remains unauthorized until formal sign-off.
> See [docs/CAPABILITY_STATUS.md](file:///d:/Q-Sight%20Command%20Center/docs/CAPABILITY_STATUS.md) for the authoritative implementation state.

Q-Sight Command Center is a **pre-production prototype** of an **Industrial Spatial Intelligence Command Center** designed for authorized asset tracking, logistics management, emergency response, infrastructure monitoring, environmental risk assessment, and industrial safety operations.

Q-Sight combines 3D terrain intelligence, aviation data, orbital telemetry, and environmental sensors into a unified operational cockpit.

---

## 🚫 Core Safety & Ethics Guardrails (Strictly Enforced)

This product is built solely for legitimate industrial operations, safety monitoring, and authorized assets. By design, the architecture incorporates hard technical and legal guardrails:

*   **No Facial Recognition / Biometric Identification**: All client-side and server-side processing of video feeds must not extract biometrics, scan faces, or reconstruct individual identities.
*   **No Public CCTV Scraping**: Strict technical block on integrating unauthenticated public streams (e.g., Shodan, Insecam).
*   **No Covert Recording**: All recording features require active user visibility, indicators showing recording status, and automated retention limits.
*   **No Person Tracking**: Design prohibits targeting, filtering, or search-by-identity of individual human beings or crowds.
*   **No Predictive Policing or Social Profiling**: Explicit ban on scoring, predicting, profiling, or analyzing human behavior.
*   **Explicit Sensor Authorization**: All sensor metadata must be explicitly authorized by asset owners before it can be configured in the registry.

---

## 📁 Monorepo Layout

```
d:/Q-Sight Command Center/
├── apps/
│   ├── web/                     # Frontend dashboard (React, Vite, CesiumJS, Vanilla CSS)
│   └── api/                     # Backend server (Fastify, TypeScript, PostGIS)
├── workers/
│   ├── opensky-ingestor/        # OpenSky aviation telemetry ingestion service
│   ├── satellite-ingestor/      # Orbital tracking TLE data ingestion service
│   └── earthquake-ingestor/     # USGS seismic hazard tracking service
├── packages/
│   └── shared/                  # Shared types, database schemas, and validation utilities
├── docs/                        # Specifications, security standards, and architectures
│   ├── product-requirements.md   # PRD and v0.1 - v0.6 roadmap
│   ├── architecture.md          # Systems design, WebSocket flows, PostGIS schemas
│   ├── data-sources.md          # Google 3D Tiles, CesiumJS, telemetry provider caveats
│   ├── security-guardrails.md   # Security mechanisms and safety audit controls
│   ├── decision-log.md          # Log of key architectural and product decisions
│   └── database-schema.md       # SQL schema DDL for PostGIS tables
├── infra/                       # Dev and deployment configurations
│   ├── docker-compose.yml       # PostGIS Docker Compose configuration
│   └── postgres/
│       └── init/                # Database initialization scripts folder
├── .editorconfig                # Coding standards configuration
├── .gitignore                   # Version control ignore files list
├── .env.example                 # Template for local environment configuration
├── tsconfig.base.json           # Shared TypeScript configuration
└── package.json                 # Monorepo workspaces definition
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 22 (LTS recommended — see `.nvmrc`)
*   npm (>= v9.0.0)
*   Docker & Docker Compose (for local PostGIS database)

### Prototype Operations

The prototype supports safe execution in both mock/demo mode and live data mode.

**Native Startup:**
```bash
npm run db:up
npm run dev:api
npm run dev:web
```

**Docker Startup:**
```bash
docker compose -f infra/docker-compose.prototype.yml up --build postgres api web
```

*Note on Live Data Activation:* The prototype runs in mock Demo Mode by default. To enable actual open-data ingestion (USGS, OpenSky, CelesTrak), you must explicitly copy `.env.live.example` to `.env` and restart the environment. 

**Safety Note:** No camera streams, video data, or biometric capabilities are included in this prototype. All Dockerfiles and environment templates are sanitized of credentials.

For detailed runbooks and validation scripts, refer to:
* [docs/prototype-operations-runbook.md](file:///d:/Q-Sight%20Command%20Center/docs/prototype-operations-runbook.md)
* [docs/live-prototype-runbook.md](file:///d:/Q-Sight%20Command%20Center/docs/live-prototype-runbook.md)
* [docs/final-handover.md](file:///d:/Q-Sight%20Command%20Center/docs/final-handover.md)

---

## 📄 Documentation Index
*   **Capability Status** (authoritative): Read [CAPABILITY_STATUS.md](file:///d:/Q-Sight%20Command%20Center/docs/CAPABILITY_STATUS.md) for what is actually implemented.
*   **Environment & Port Matrix**: Read [ENVIRONMENT_AND_PORT_MATRIX.md](file:///d:/Q-Sight%20Command%20Center/docs/ENVIRONMENT_AND_PORT_MATRIX.md) for verified port assignments.
*   **Product Requirements**: Read [product-requirements.md](file:///d:/Q-Sight%20Command%20Center/docs/product-requirements.md) for details on target users and roadmap.
*   **Architecture**: Read [architecture.md](file:///d:/Q-Sight%20Command%20Center/docs/architecture.md) to understand systems layout and WebSocket flows.
*   **Data Sources**: Read [data-sources.md](file:///d:/Q-Sight%20Command%20Center/docs/data-sources.md) for information on integration APIs.
*   **Security Guardrails**: Read [security-guardrails.md](file:///d:/Q-Sight%20Command%20Center/docs/security-guardrails.md) to review privacy compliance mechanisms.
*   **Decision Log**: Read [decision-log.md](file:///d:/Q-Sight%20Command%20Center/docs/decision-log.md) to review architecture choices.
*   **Database Schema**: Read [database-schema.md](file:///d:/Q-Sight%20Command%20Center/docs/database-schema.md) for SQL schemas.
