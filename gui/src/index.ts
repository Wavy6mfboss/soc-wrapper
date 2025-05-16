import { app, BrowserWindow, ipcMain } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Forge‑injected constants
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

/* ------------------------------------------------------------------ */
/* IPC bridge – run wrapper.py (packaged or dev)                      */
/* ------------------------------------------------------------------ */
function locateWrapper(): string {
  // Packaged: %LOCALAPPDATA%\gui\app‑X.Y.Z\resources\wrapper.py
  const inResources = path.join(process.resourcesPath, 'wrapper.py');

  // Dev: <repo>/wrapper.py  (three dirs up from .webpack/main)
  const dev = path.resolve(__dirname, '../../../../wrapper.py');

  return fs.existsSync(inResources) ? inResources : dev;
}

ipcMain.handle('run-goal', async (_e, goal: string): Promise<string> => {
  const wrapper = locateWrapper();
  const cwd     = path.dirname(wrapper);

  return new Promise((resolve, reject) => {
    const child = spawn('python', [wrapper, goal], { cwd });

    let out = '';
    child.stdout.on('data', d => (out += d.toString()));
    child.stderr.on('data', d => (out += d.toString()));
    child.on('close', code =>
      code === 0 ? resolve(out) : reject(out),
    );
  });
});

/* ------------------------------------------------------------------ */
/* Main‑window boilerplate                                            */
/* ------------------------------------------------------------------ */
let win: BrowserWindow | null = null;

const createWindow = () => {
  win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: { preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY },
  });
  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

if (require('electron-squirrel-startup')) app.quit();
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
