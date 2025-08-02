/* ───────────────────────── electron-preload.cjs
   Secure bridge: renderer  ↔︎  main
────────────────────────────────────────────────────────── */
const { contextBridge, ipcRenderer } = require('electron')

/* helper: subscribe once, return unsub */
const sub = (ch, cb) => {
  const h = (_e, ...a) => cb(...a)
  ipcRenderer.on(ch, h)
  return () => ipcRenderer.removeListener(ch, h)
}

/* minimal, safe “ipcRenderer” façade */
const safeIpc = {
  on            : (c, fn) => ipcRenderer.on(c, fn),
  once          : (c, fn) => ipcRenderer.once(c, fn),
  removeListener: (c, fn) => ipcRenderer.removeListener(c, fn),
  send          : (c, ...a) => ipcRenderer.send(c, ...a),
  invoke        : (c, ...a) => ipcRenderer.invoke(c, ...a),
}

/* expose API to all renderer windows */
contextBridge.exposeInMainWorld('electron', {
  /* one-shot actions */
  runCli       : (args) => ipcRenderer.invoke('run-cli', args),
  stopCli      : ()     => ipcRenderer.invoke('stop-cli'),
  getConfig    : ()     => ipcRenderer.invoke('getConfig'),
  openEditor   : (tpl)  => ipcRenderer.invoke('open-editor', tpl),
  templateSaved: ()     => ipcRenderer.send  ('template-saved'),

  /* realtime streams */
  onCliStarted   : (cb) => sub('cli-started',    cb),
  onCliEnded     : (cb) => sub('cli-ended',      cb),
  onTemplateSaved: (cb) => sub('template-saved', cb),

  /* drop-in replacement for legacy calls */
  ipcRenderer: safeIpc,
})
