// gui/src/index.ts  (main-process)
// ────────────────────────────────────────────────────────────────────
import path from "path";
import { app, BrowserWindow, ipcMain } from "electron";
import { spawnSync } from "child_process";

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,

      // 👇 ADD THIS LINE – gives the renderer its `require` back
      nodeIntegration: true
    }
  });

  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
}

app.whenReady().then(createWindow);

/* existing ipcMain.handle("run-goal", …) stays unchanged */
