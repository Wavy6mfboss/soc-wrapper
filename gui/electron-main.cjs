/* ───────────────────────── gui/electron-main.cjs */
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')

let mainWindow
function createMain () {
  mainWindow = new BrowserWindow({
    width: 1024, height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.cjs'),
      contextIsolation: true, nodeIntegration: false,
    },
  })
  const url = process.env.VITE_DEV_SERVER_URL ||
              `file://${path.join(__dirname, '..', 'dist', 'index.html')}`
  mainWindow.loadURL(url)
  if (process.env.VITE_DEV_SERVER_URL) mainWindow.webContents.openDevTools()
}
app.whenReady().then(createMain)

/* ---------- modal editor window -------------------------------------- */
let editorWin = null
ipcMain.handle('open-editor', (_e, tplJson) => {
  if (editorWin) { editorWin.focus(); return }

  editorWin = new BrowserWindow({
    width: 640, height: 720, parent: mainWindow, modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.cjs'),
      contextIsolation: true, nodeIntegration: false,
      additionalArguments: ['--editor', JSON.stringify(tplJson)],
    },
  })

  const base = process.env.VITE_DEV_SERVER_URL
    || `file://${path.join(__dirname, '..', 'dist', 'index.html')}`

  editorWin.loadURL(`${base}#/editor`)        // ← load the editor route
  editorWin.on('closed', () => { editorWin = null })
})

/* ---------- misc IPC -------------------------------------------------- */
ipcMain.handle('run-cli',      () => {/* omitted for brevity */})
ipcMain.handle('stop-cli',     () => {/* omitted for brevity */})
ipcMain.handle('focus-window', () => { mainWindow?.focus(); mainWindow?.webContents.focus() })
ipcMain.handle('getConfig',    () => ({ userData: app.getPath('userData'),
                                        env:      process.env.NODE_ENV ?? 'production' }))

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
