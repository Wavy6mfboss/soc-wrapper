import { app, BrowserWindow, ipcMain } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

/* ───────────────────────────────────────────────────────────── */
/* IPC: Call frozen operate_runner.exe or fallback to Python     */
/* ───────────────────────────────────────────────────────────── */
function buildCommand(goal: string): { cmd: string; args: string[]; cwd: string } {
  const inResources = path.join(process.resourcesPath, 'bin', 'operate_runner.exe');
  const fallbackDev = path.resolve(__dirname, '../../../dist/operate_runner.exe');

  const exe = fs.existsSync(inResources) ? inResources : fallbackDev;
  const cwd = path.dirname(exe);

  return { cmd: exe, args: [goal], cwd };
}

ipcMain.handle('run-goal', async (_e, goal: string): Promise<string> => {
  const { cmd, args, cwd } = buildCommand(goal);

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd });

    let out = '';
    child.stdout.on('data', d => (out += d.toString()));
    child.stderr.on('data', d => (out += d.toString()));
    child.on('close', code =>
      code === 0 ? resolve(out) : reject(out),
    );
  });
});

/* ───────────────────────────────────────────────────────────── */
/* Window Boilerplate                                            */
/* ───────────────────────────────────────────────────────────── */
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
