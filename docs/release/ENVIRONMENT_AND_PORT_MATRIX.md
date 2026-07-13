# Environment and Port Matrix

## Default Ports

| Service | Local Dev Port | Container Port | Description |
|---------|----------------|----------------|-------------|
| API     | 4000           | 4000           | Main REST API and WebSocket |
| Web     | 5173           | 8080           | Frontend Dashboard (Vite dev server uses 5173, Nginx prod uses 8080) |
| DB      | 5432           | 5432           | PostgreSQL/PostGIS database |

## Configuration
- .env files define WEB_PORT=5173, API_PORT=4000, WS_PORT=4000.
- Docker Compose files map these ports to the host environment.
