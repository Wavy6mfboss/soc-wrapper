// gui/electron-main.cjs  –- Electron’s main-process entry
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 960,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'), // <- same folder
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Vite dev server in dev mode / bundled file in prod
  const url =
    process.env.VITE_DEV_SERVER_URL ||
    `file://${path.join(__dirname, 'dist', 'renderer', 'index.html')}`;

  win.loadURL(url);
  win.on('closed', () => (win = null));
}

/* ----------------  secure IPC hooks ---------------- */
ipcMain.on('get-user-data-path', (e) => {
  e.returnValue = app.getPath('userData');
});

ipcMain.on('open-external', (_, url) => shell.openExternal(url));
/* --------------------------------------------------- */

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (win === null) createWindow();
});
