// TradePilot 桌面版 — Electron 主进程
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

function resolveFrontendDir() {
  if (process.env.FRONTEND_DIR) return process.env.FRONTEND_DIR;
  // 生产：extraResources 解包到 resources/app/web/out
  const prod = path.join(process.resourcesPath, 'app', 'web', 'out');
  if (fs.existsSync(path.join(prod, 'index.html'))) return prod;
  // dev：web/out 未构建时回退 web/out 相对路径
  return path.resolve(__dirname, 'web', 'out');
}

app.whenReady().then(async () => {
  // API Key 存到 Electron userData，不进仓库
  process.env.CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');
  process.env.FRONTEND_DIR = resolveFrontendDir();

  const { createServer } = require(path.join(__dirname, 'server', 'src', 'app'));
  const { port } = await createServer();

  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    title: 'TradePilot',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.setMenuBarVisibility(false);

  const devUrl = process.env.DEV_URL;
  if (devUrl) {
    win.loadURL(devUrl);
  } else {
    win.loadURL(`http://127.0.0.1:${port}`);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
