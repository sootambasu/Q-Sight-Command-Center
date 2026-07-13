# Q-Sight Backend API (apps/api)

This is the backend server and WebSocket broker for the Q-Sight Command Center.

## Technologies
- **Core Framework**: Fastify + TypeScript
- **Database Access**: PostgreSQL/PostGIS (via Knex or pg)
- **WebSockets**: fastify-websocket or ws for real-time telemetry streaming

## Key Features
- **REST endpoints**:
  - `/api/auth`: Operator login and session management.
  - `/api/cameras`: CRUD for authorized industrial cameras (verified ownership required).
  - `/api/audit-logs`: Immutable logging of high-risk activities.
- **WebSockets**:
  - Live spatial feeds of aircraft, satellites, and earthquakes streamed as delta updates to clients.
- **Strict Authorization Check**: Verifies that any camera stream requested is registered and signed with valid credentials.
