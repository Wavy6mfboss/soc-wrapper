/* ───────────────────────── electron-preload.cjs
   Secure bridge: renderer  ↔  main process
───────────────────────────────────────────────────────────────── */
const { contextBridge, ipcRenderer } = require('electron')

/* ---------- helper: subscribe once, return unsub -------------- */
const sub = (channel, cb) => {
  const handler = (_e, ...a) => cb(...a)
  ipcRenderer.on(channel, handler)
  return () => ipcRenderer.removeListener(channel, handler)
}

/* ---------- minimal, safe wrapper ----------------------------- */
const safeIpc = {
  on    : (ch, fn) => ipcRenderer.on(ch, fn),
  off   : (ch, fn) => ipcRenderer.removeListener(ch, fn),
  invoke: (ch, ...a) => ipcRenderer.invoke(ch, ...a),
}

/* ---------- API exposed to renderer windows ------------------- */
contextBridge.exposeInMainWorld('electron', {
  /* one-shot actions */
  runCli        : (args) => ipcRenderer.invoke('run-cli', args),
  stopCli       : ()     => ipcRenderer.invoke('stop-cli'),
  getConfig     : ()     => ipcRenderer.invoke('getConfig'),
  templateSaved : ()     => ipcRenderer.send  ('template-saved'),   // NEW

  /* realtime events – each returns an “unsub” */
  onCliStarted   : (cb) => sub('cli-started',    cb),
  onCliEnded     : (cb) => sub('cli-ended',      cb),
  onTemplateSaved: (cb) => sub('template-saved', cb),               // NEW

  ipcRenderer : safeIpc,
})
