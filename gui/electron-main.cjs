/* ───────────────────────── electron-main.cjs
   Main process – CLI + editor window launcher
────────────────────────────────────────────────────────── */
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const { spawn } = require('node:child_process')

/* ---------- CLI runner ------------------------------ */
let child = null
function launchCli (args = []) {
  if (child) return
  const exe = path.join(__dirname, 'dist', 'operate_runner.exe')
  child = spawn(exe, args, { stdio: 'inherit' })
  mainWindow.webContents.send('cli-started')
  child.on('exit', code => {
    mainWindow.webContents.send('cli-ended', code)
    child = null
  })
}
function killCli () { try { child?.kill() } catch (_) {} }

/* ---------- main window ----------------------------- */
let mainWindow
function createWindow () {
  mainWindow = new BrowserWindow({
    width:1024, height:768,
    webPreferences:{
      preload: path.join(__dirname,'electron-preload.cjs'),
      contextIsolation:true,
      nodeIntegration:false,
    },
  })
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname,'..','dist','index.html'))
  }
}
app.whenReady().then(createWindow)

/* ---------- editor popup ---------------------------- */
function launchEditor (tpl) {
  const hash = tpl ? '#'+encodeURIComponent(JSON.stringify(tpl)) : ''
  const url  = (process.env.VITE_DEV_SERVER_URL ??
               `file://${path.join(__dirname,'..','dist','index.html')}`)
               + `#` + '/editor' + hash

  const win = new BrowserWindow({
    width:740, height:760, parent:mainWindow, modal:false,
    webPreferences:{
      preload: path.join(__dirname,'electron-preload.cjs'),
      contextIsolation:true,
      nodeIntegration:false,
    },
  })
  win.loadURL(url)
}

/* ---------- IPC handlers ---------------------------- */
ipcMain.handle('run-cli',    (_e,a)=>launchCli(a))
ipcMain.handle('stop-cli',   ()=>killCli())
ipcMain.handle('getConfig',  ()=>({ userData:app.getPath('userData'),
                                    env:process.env.NODE_ENV??'production'}))
ipcMain.handle('open-editor',(_e,tpl)=>launchEditor(tpl))

ipcMain.on('template-saved', ()=>mainWindow.webContents.send('template-saved'))

app.on('window-all-closed',()=>{ if (process.platform!=='darwin') app.quit() })
