/* ───────────────────────── electron-main.cjs
   Main-process bootstrap
────────────────────────────────────────────────────────── */
const { app, BrowserWindow, ipcMain } = require('electron')
const path  = require('node:path')
const { spawn } = require('node:child_process')

/* ------------------------------------------------ window helpers */
function createMainWindow () {
  const win = new BrowserWindow({
    width:1024,height:768,
    webPreferences:{
      preload : path.join(__dirname,'electron-preload.cjs'),
      contextIsolation:true,nodeIntegration:false,
      nativeWindowOpen:true,      // required for child windows
    },
  })
  const url = process.env.VITE_DEV_SERVER_URL
    ? process.env.VITE_DEV_SERVER_URL
    : `file://${path.join(__dirname,'..','dist','index.html')}`
  win.loadURL(url)
  if (process.env.VITE_DEV_SERVER_URL) win.webContents.openDevTools()
  return win
}

function createEditorWindow (tplJson) {
  const win = new BrowserWindow({
    width:740,height:760,parent:mainWindow,
    webPreferences:{
      preload : path.join(__dirname,'electron-preload.cjs'),
      contextIsolation:true,nodeIntegration:false,
    },
  })
  const hash = tplJson ? '#/editor/'+encodeURIComponent(JSON.stringify(tplJson)) : '#/editor'
  const base = process.env.VITE_DEV_SERVER_URL
    ? process.env.VITE_DEV_SERVER_URL
    : `file://${path.join(__dirname,'..','dist','index.html')}`
  win.loadURL(base + hash)
}

/* ------------------------------------------------ CLI runner */
let child=null
function launchCli(args=[]){
  if(child) return
  const exe = path.join(__dirname,'dist','operate_runner.exe')
  child = spawn(exe,args,{stdio:'ignore'})
  mainWindow?.webContents.send('cli-started')
  child.on('exit',code=>{
    mainWindow?.webContents.send('cli-ended',code)
    child=null
  })
}
function killCli(){ if(child) try{ child.kill() }catch{} }

/* ------------------------------------------------ main entry */
let mainWindow=null
app.whenReady().then(()=>{ mainWindow=createMainWindow() })

/* ------------------------------------------------ IPC routes */
ipcMain.handle('run-cli',(_e,a)=>launchCli(a))
ipcMain.handle('stop-cli',()=>killCli())
ipcMain.handle('getConfig',()=>({
  env:process.env.NODE_ENV??'production',
  userData:app.getPath('userData'),
}))
ipcMain.handle('open-editor',(_e,tpl)=>createEditorWindow(tpl))

/* relay “template-saved” from any renderer back to mainWindow */
ipcMain.on('template-saved',(_e)=>{
  mainWindow?.webContents.send('template-saved')
})

app.on('window-all-closed',()=>{ if(process.platform!=='darwin') app.quit() })
