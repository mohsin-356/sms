const { contextBridge } = require('electron');

// Expose runtime config to the renderer in a safe way
try {
  const backendPort = process.env.BACKEND_PORT || 59201;
  const API_BASE_URL = `http://localhost:${backendPort}/api`;
  contextBridge.exposeInMainWorld('ELECTRON_CONFIG', {
    API_BASE_URL,
  });
} catch (_) {
  // no-op
}
