/* ───────────────────────── electron-main.cjs
   Main-process bootstrap (CommonJS)
───────────────────────────────────────────────────────────────── */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path   = require('node:path');
const { spawn } = require('node:child_process');

/* ------------------------------------------------ CLI runner */
let child = null;

function launchCli(args = []) {
  if (child) return;                                   // already running
  const exe = path.join(__dirname, 'dist', 'operate_runner.exe');
  child = spawn(exe, args, { stdio: 'inherit' });
  mainWindow.webContents.send('cli-started');

  child.on('exit', (code) => {
    mainWindow.webContents.send('cli-ended', code);
    child = null;
  });
}

function killCli() {
  if (child) {
    try   { process.platform === 'win32' ? child.kill('SIGTERM') : child.kill(); }
    catch (_) { /* noop */ }
  }
}

/* ------------------------------------------------ window     */
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

/* ------------------------------------------------ IPC        */
ipcMain.handle('run-cli', (_e, args) => launchCli(args));
ipcMain.handle('stop-cli', ()     => killCli());
ipcMain.handle('getConfig', ()   => ({
  userData: app.getPath('userData'),
  env:      process.env.NODE_ENV ?? 'production',
}));

/* graceful quit on all windows closed (except macOS default) */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
