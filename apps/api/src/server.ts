import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import { config } from './config';
import { registerRoutes } from './routes';
import { pool } from './db';
import { runDevMigrations } from './db/migrations';

// Initialize Fastify server with logging enabled
const server = Fastify({
  logger: true,
});

// Bootstrap application
const start = async () => {
  try {
    // Register WebSocket plugin (required for /ws/realtime route)
    await server.register(fastifyWebsocket);

    // Run development migrations to expand schema
    await runDevMigrations(pool);

    // Register routes (including WebSocket route)
    await server.register(registerRoutes);

    // Listen on configured port
    await server.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`🚀 Q-Sight API Server listening on port ${config.port}`);
    console.log(`🔌 WebSocket endpoint: ws://localhost:${config.port}/ws/realtime`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

start();

