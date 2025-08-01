/* ───────────────────────── gui/electron-preload.cjs
   Bridge – full API + _EDITOR_DATA injection
────────────────────────────────────────────────────────── */
const { contextBridge, ipcRenderer } = require('electron')

/* one-shot listener helper */
const sub = (ch, cb) => {
  const h = (_e, ...a) => cb(...a)
  ipcRenderer.on(ch, h)
  return () => ipcRenderer.removeListener(ch, h)
}

contextBridge.exposeInMainWorld('electron', {
  /* CLI controls */
  runCli   : args => ipcRenderer.invoke('run-cli', args),
  stopCli  : ()   => ipcRenderer.invoke('stop-cli'),
  getConfig: ()   => ipcRenderer.invoke('getConfig'),

  /* CLI lifecycle hooks */
  onCliStarted: cb => sub('cli-started', cb),
  onCliEnded  : cb => sub('cli-ended',  cb),
  onCliExited : cb => sub('cli-ended',  cb),

  /* editor helpers */
  openEditor : tpl => ipcRenderer.invoke('open-editor', tpl),
  focusWindow: ()  => ipcRenderer.invoke('focus-window'),

  /* raw access */
  ipcRenderer: {
    on    : (...a) => ipcRenderer.on(...a),
    off   : (...a) => ipcRenderer.removeListener(...a),
    invoke: (...a) => ipcRenderer.invoke(...a),
  },
})

/* Inject template JSON for the modal editor (if present) */
try {
  const idx = process.argv.findIndex(a => a === '--editor')
  if (idx !== -1 && process.argv[idx + 1]) {
    contextBridge.exposeInMainWorld('_EDITOR_DATA', process.argv[idx + 1])
  }
} catch {/* ignore */}
