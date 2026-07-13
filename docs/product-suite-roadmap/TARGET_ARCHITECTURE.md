# Target Architecture

This document describes the target-state architecture of the Q-Sight Command Center (v2.0), illustrating authentication, real-time message delivery, data ingestion pipelines, and observability.

---

## 1. System Component Block Diagram

```mermaid
graph TB
    subgraph Client Layer
        Web["Web Dashboard (React + Vite + CesiumJS)"]
    end

    subgraph Authentication Provider
        AzureAD["Azure AD / Entra ID"]
    end

    subgraph API & Gateway Layer
        Fastify["Fastify API Server"]
        WS["WebSocket Server"]
    end

    subgraph Background Processing
        Workers["Ingestion Workers (Adapter Framework)"]
    end

    subgraph Database Layer
        Postgres["PostgreSQL / PostGIS"]
    end

    subgraph Observability Stack
        Prom["Prometheus (Metrics)"]
        Logs["Centralized Log Sink (Datadog/ELK)"]
    end

    %% Interactions
    Web -->|Redirect Auth| AzureAD
    Web -->|REST API Calls| Fastify
    Web -->|WebSocket Stream| WS
    AzureAD -->|JWT Tokens| Web
    Fastify -->|Validate JWTs| AzureAD
    Fastify -->|Read/Write| Postgres
    Workers -->|Read Config / Ingest| Postgres
    WS -->|Verify JWT tickets| Fastify
    Fastify -->|Export JSON Logs| Logs
    Fastify -->|Pull metrics| Prom
    WS -->|Pull metrics| Prom
```

---

## 2. Authentication Flow

Authentication uses the OpenID Connect (OIDC) authorization code flow with PKCE, managed via Azure AD.

```mermaid
sequenceDiagram
    autonumber
    actor User as Operator Browser
    participant Web as React Web App
    participant Azure as Azure AD
    participant API as Fastify API

    User->>Web: Access Application URL
    Web->>Web: Check for Local session token
    Note over Web: Token missing or expired
    Web->>Azure: Redirect to /oauth2/authorize (PKCE challenge)
    User->>Azure: Submit Enterprise Credentials
    Azure->>Web: Redirect to App callback (Auth Code)
    Web->>Azure: Exchange Code for tokens (PKCE verifier)
    Azure->>Web: Return Access Token & ID Token (JWT)
    Web->>API: Fetch telemetry with bearer token
    API->>API: Verify token signature against JWKS
    API->>Web: Return telemetry data
```

---

## 3. WebSocket Handshake & Authentication

Because browsers do not support custom authorization headers in standard WebSocket connections, Q-Sight implements a **Single-Use Pre-Authentication Ticket** pattern.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Web Client
    participant API as REST API Endpoint
    participant WS as WebSocket Server

    Client->>API: POST /auth/ws-ticket (With REST JWT token)
    Note over API: Verify JWT and generate single-use ticket
    API->>Client: Return Ticket (UUID, expires in 60s)
    Client->>WS: Establish Connection (ws://server?ticket=UUID)
    Note over WS: Lookup ticket validity & map role roles
    WS->>Client: Connection Accepted (Websocket connected)
    Note over WS: Invalidate ticket
    WS->>Client: Telemetry stream starts
```

---

## 4. Ingestion Worker Pipeline

Background tasks execute on a non-overlapping scheduling interval, verifying database configuration tables before connecting to external data APIs.

```mermaid
graph LR
    Start([Task Scheduler Run]) --> QueryDB[Query config database]
    QueryDB --> CheckLive{Live Mode Enabled?}
    
    CheckLive -->|No| LoadMock[Load deterministic Mock telemetry]
    CheckLive -->|Yes| FetchAPI[Fetch telemetry from OpenSky/USGS]
    
    LoadMock --> Parse[Parse payload through Zod schemas]
    FetchAPI -->|HTTP Outage| LoadCache[Fetch last-known-good cache]
    LoadCache --> Parse
    FetchAPI -->|Success| Parse
    
    Parse --> DBWrite{Write to DB enabled?}
    DBWrite -->|Yes| SaveDB[(Write telemetry to PostGIS)]
    DBWrite -->|No| SkipDB[Skip writing to DB]
    
    SaveDB --> End([End Task Run])
    SkipDB --> End
```

---

## 5. Alert Lifecycle Workflow

Alerts are processed spatially in PostGIS and pushed to clients in real-time.

```mermaid
graph TD
    Ingest[Worker inserts telemetry] --> SpatialCheck[PostGIS spatial geofence intersection]
    SpatialCheck --> Intersects{Intersection found?}
    
    Intersects -->|Yes| AlertSchema[Write warning to persistent_alerts]
    Intersects -->|No| Exit([Exit])
    
    AlertSchema --> Broadcast[WebSocket broadcasts alert to active Operators]
    Broadcast --> Ack[Operator acknowledges alarm]
    Ack --> WriteAudit[Log operator ID & action to audit_logs]
```

---

## 6. Infrastructure Operations Model

### A. Observability Model
*   **Structured Logs**: Fastify and worker processes write structured logs to `stdout` in JSON format. A log shipper (e.g., Filebeat or Datadog Agent) parses these logs and routes them to a centralized SIEM platform.
*   **Performance Metrics**: Exporters expose standard performance counters (CPU, RAM, API request counts, WebSocket connection counts) in Prometheus format on port `9090/metrics`.

### B. Backup & Recovery Model
*   **Database Archiving**: A cron job triggers `pg_dump` daily, saving SQL backups to a local storage mount.
*   **Staging Replication**: Staging databases can be restored by running target recovery scripts against these compressed SQL files.
