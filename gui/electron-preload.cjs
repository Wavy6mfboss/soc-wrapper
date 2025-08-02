/* ───────────────────────── electron-preload.cjs
   Secure bridge: renderer  ↔︎  main
────────────────────────────────────────────────────────── */
const { contextBridge, ipcRenderer } = require('electron')

/* subscribe once, return unsub */
const sub = (ch, cb) => {
  const h = (_e, ...a) => cb(...a)
  ipcRenderer.on(ch, h)
  return () => ipcRenderer.removeListener(ch, h)
}

contextBridge.exposeInMainWorld('electron', {
  /* one-shot actions */
  runCli       : (args) => ipcRenderer.invoke('run-cli', args),
  stopCli      : ()     => ipcRenderer.invoke('stop-cli'),
  getConfig    : ()     => ipcRenderer.invoke('getConfig'),
  openEditor   : (tpl)  => ipcRenderer.invoke('open-editor', tpl),   // NEW
  templateSaved: ()     => ipcRenderer.send  ('template-saved'),

  /* realtime */
  onCliStarted   : (cb) => sub('cli-started',    cb),
  onCliEnded     : (cb) => sub('cli-ended',      cb),
  onTemplateSaved: (cb) => sub('template-saved', cb),

  /* give renderers safe direct access when needed */
  ipcRenderer,
})
