import http from 'http';
import app from './app.js';
import { loadEnv } from './config/env.js';
import * as authService from './services/auth.service.js';

loadEnv();

const PORT = process.env.PORT || 5000;

async function boot() {
  // Seed or ensure Owner account exists BEFORE starting server to avoid race
  try {
    const ownerEmail = process.env.OWNER_EMAIL || 'qutaibah@mindspire.org';
    const ownerPassword = process.env.OWNER_PASSWORD || 'Qutaibah@123';
    const ownerName = process.env.OWNER_NAME || 'Mindspire Owner';
    await authService.ensureOwnerUser({ email: ownerEmail, password: ownerPassword, name: ownerName });
  } catch (_) {}

  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
}

boot();
