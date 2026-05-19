import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`
  🦚 Velvet Streak API Server
  ────────────────────────────
  Environment : ${env.NODE_ENV}
  Port        : ${env.PORT}
  CORS        : ${env.CORS_ALLOWED_ORIGINS.join(', ')}
  Store       : In-Memory (MongoDB not connected)
  ────────────────────────────
  API Base    : http://localhost:${env.PORT}/api
  Health      : http://localhost:${env.PORT}/api/health
  `);
});
