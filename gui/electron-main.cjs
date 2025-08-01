/* ───────────────────────── gui/electron-main.cjs */
const { app, BrowserWindow, ipcMain } = require('electron')
const path   = require('node:path')
const { spawn } = require('node:child_process')

let mainWindow, child=null

function launchCli(args=[]){
  if(child) return
  const exe=path.join(__dirname,'dist','operate_runner.exe')
  child=spawn(process.execPath,[exe,...args],{windowsHide:true,stdio:'ignore'})
  mainWindow.webContents.send('cli-started',args)
  child.on('exit',code=>{ mainWindow.webContents.send('cli-ended',code); child=null })
}
const stopCli=()=>{ if(child){try{child.kill('SIGTERM')}catch{};child=null} }

function createWindow(){
  mainWindow=new BrowserWindow({
    width:1024,height:768,
    webPreferences:{preload:path.join(__dirname,'electron-preload.cjs'),
                    contextIsolation:true,nodeIntegration:false},
  })
  if(process.env.VITE_DEV_SERVER_URL){
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  }else{
    mainWindow.loadFile(path.join(__dirname,'..','dist','index.html'))
  }
}

app.whenReady().then(createWindow)

/* IPC */
ipcMain.handle('run-cli',(_e,args)=>launchCli(args))
ipcMain.handle('stop-cli',()=>stopCli())
ipcMain.handle('focus-window',()=>{
  if(mainWindow){
    mainWindow.focus()               // window-level focus
    mainWindow.webContents.focus()   // web-contents focus
  }
})
ipcMain.handle('getConfig',()=>({userData:app.getPath('userData'),
                                 env:process.env.NODE_ENV??'production'}))
app.on('window-all-closed',()=>{ if(process.platform!=='darwin') app.quit() })
