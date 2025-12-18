const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { fork } = require('child_process');

const DEFAULT_BACKEND_PORT = 59201;
let backendProcess = null;

function startBackend() {
  const isDev = !app.isPackaged;
  const backendPort = process.env.BACKEND_PORT || DEFAULT_BACKEND_PORT;
  const backendDir = isDev
    ? path.join(__dirname, '../../backend')
    : path.join(process.resourcesPath, 'backend');
  const serverPath = path.join(backendDir, 'src', 'server.js');

  const child = fork(serverPath, [], {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: String(backendPort),
      NODE_ENV: isDev ? 'development' : 'production',
    },
    stdio: 'inherit',
  });
  return child;
}

function createWindow() {
  const isDev = !app.isPackaged;
  const backendPort = process.env.BACKEND_PORT || DEFAULT_BACKEND_PORT;
  process.env.BACKEND_PORT = String(backendPort);

  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.once('ready-to-show', () => win.show());

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
    win.loadFile(indexPath);
  }

  // open external links in default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  backendProcess = startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

function shutdownBackend() {
  if (backendProcess) {
    try { backendProcess.kill(); } catch (_) {}
    backendProcess = null;
  }
}

app.on('before-quit', shutdownBackend);
app.on('will-quit', shutdownBackend);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
