import { app, BrowserWindow, ipcMain } from 'electron';
import { spawn } from 'child_process';
import path from 'path';

// Forge‐injected constants
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

/* ------------------------------------------------------------------ */
/* IPC bridge – run wrapper.py wherever the app lives                 */
/* ------------------------------------------------------------------ */
function findWrapper(): string {
  // 1) next to compiled code  →  resources/app/wrapper.py
  const local = path.resolve(__dirname, '../wrapper.py');
  // 2) dev / repo root        →  ../../../../wrapper.py
  const repo  = path.resolve(__dirname, '../../../../wrapper.py');
  return require('fs').existsSync(local) ? local : repo;
}

ipcMain.handle('run-goal', async (_e, goal: string): Promise<string> => {
  const wrapper = findWrapper();
  const cwd = path.dirname(wrapper);

  return new Promise((resolve, reject) => {
    const child = spawn('python', [wrapper, goal], { cwd });

    let output = '';
    child.stdout.on('data', d => (output += d.toString()));
    child.stderr.on('data', d => (output += d.toString()));
    child.on('close', code =>
      code === 0 ? resolve(output) : reject(output),
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
