/* ───────────────────────── gui/electron-preload.cjs
   Safe bridge – full API (original + modal editor helpers)
────────────────────────────────────────────────────────── */
const { contextBridge, ipcRenderer } = require('electron')

/* helper: subscribe once, return unsub */
const sub = (channel, cb) => {
  const h = (_e, ...a) => cb(...a)
  ipcRenderer.on(channel, h)
  return () => ipcRenderer.removeListener(channel, h)
}

contextBridge.exposeInMainWorld('electron', {
  /* ---------- original one-shot actions ------------------------------ */
  runCli   : args => ipcRenderer.invoke('run-cli', args),
  stopCli  : ()   => ipcRenderer.invoke('stop-cli'),
  getConfig: ()   => ipcRenderer.invoke('getConfig'),

  /* ---------- original realtime CLI hooks ---------------------------- */
  onCliStarted: cb => sub('cli-started', cb),
  onCliEnded  : cb => sub('cli-ended',  cb),   // legacy alias still used
  onCliExited : cb => sub('cli-ended',  cb),

  /* ---------- new helpers -------------------------------------------- */
  openEditor : tpl => ipcRenderer.invoke('open-editor', tpl),
  focusWindow: ()  => ipcRenderer.invoke('focus-window'),

  /* ---------- low-level access if ever needed ------------------------ */
  ipcRenderer: {
    on    : (...a) => ipcRenderer.on   (...a),
    off   : (...a) => ipcRenderer.removeListener(...a),
    invoke: (...a) => ipcRenderer.invoke(...a),
  },
})
