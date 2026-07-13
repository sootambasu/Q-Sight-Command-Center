import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';

export default defineConfig({
  plugins: [
    react(),
    cesium({
      cesiumBuildRootPath: '../../node_modules/cesium/Build',
      cesiumBuildPath: '../../node_modules/cesium/Build/Cesium'
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      // V0.6: WebSocket proxy for real-time telemetry
      // Note: frontend useRealtime hook connects directly to ws://localhost:4000
      // so no proxy is strictly needed, but having it here future-proofs same-origin WS.
      '/ws': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        ws: true
      }
    }
  }
});
