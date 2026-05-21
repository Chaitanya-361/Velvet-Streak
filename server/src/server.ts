import { createApp } from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

const app = createApp();

connectDB().then(() => {
  app.listen(env.PORT, () => {
    console.log(`
    🦚 Velvet Streak API Server
    ────────────────────────────
    Environment : ${env.NODE_ENV}
    Port        : ${env.PORT}
    CORS        : ${env.CORS_ALLOWED_ORIGINS.join(', ')}
    Store       : MongoDB Connected
    ────────────────────────────
    API Base    : http://localhost:${env.PORT}/api
    Health      : http://localhost:${env.PORT}/api/health
    `);
  });
});
