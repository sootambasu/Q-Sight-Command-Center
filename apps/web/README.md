# Q-Sight Web Client (apps/web)

This is the frontend dashboard application for the Q-Sight Command Center.

## Technologies
- **Core Framework**: React (Vite) + TypeScript
- **Mapping & 3D Engine**: CesiumJS (integrated with Google Photorealistic 3D Tiles)
- **Styling**: Vanilla CSS (highly customized dark theme designed for operations control rooms)

## Key Features
- High-fidelity 3D Earth terrain rendering.
- Real-time aircraft spatial visualization (data from OpenSky).
- Real-time satellite track and footprint projection (data from CelesTrak).
- Geohazard event alerts mapping (USGS Earthquakes).
- Authorized camera registry view overlays (explicit permissions required).

## Security Controls
- **No Client-side Biometrics/Facial Recognition**: The camera visualizer displays raw feeds only; it has no client-side overlays or AI models for biometric extraction.
- **Audit Logging Triggers**: The client triggers audit log calls to the API whenever an operator views high-resolution camera streams, logs in, or exports geographic views.
