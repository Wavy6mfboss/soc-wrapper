/* ───────────────────────── electron-preload.cjs
   Secure bridge → renderer.
   • Each “onFoo” now returns a clean-up function (unsub) so
     `const unsub = onFoo(cb)` works and React can call `unsub()`.
───────────────────────────────────────────────────────────────── */
const { contextBridge, ipcRenderer } = require('electron');

/** subscribe once, return an off() helper */
const sub = (channel, cb) => {
  const handler = (_e, ...a) => cb(...a);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
};

/* minimal, safe wrapper */
const safeIpc = {
  on   : (ch, fn) => ipcRenderer.on(ch, fn),
  off  : (ch, fn) => ipcRenderer.removeListener(ch, fn),
  invoke: (ch, ...a) => ipcRenderer.invoke(ch, ...a),
};

contextBridge.exposeInMainWorld('electron', {
  /* one-shot actions */
  runCli   : (args) => ipcRenderer.invoke('run-cli',  args),
  stopCli  : ()     => ipcRenderer.invoke('stop-cli'),
  getConfig: ()     => ipcRenderer.invoke('getConfig'),

  /* realtime CLI status – return unsub functions 👇 */
  onCliStarted: (cb) => sub('cli-started', cb),
  onCliEnded  : (cb) => sub('cli-ended',  cb),
  onCliExited : (cb) => sub('cli-ended',  cb),      // legacy alias

  ipcRenderer : safeIpc,
});
