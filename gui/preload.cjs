/* ───────────────────────── preload.cjs */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  /* config helpers */
  getConfig   : () => ipcRenderer.invoke('getConfig'),
  saveConfig  : (p) => ipcRenderer.invoke('saveConfig', p),
  decrementRun: () => ipcRenderer.invoke('decrementRun'),

  /* CLI */
  runCli: (args) => ipcRenderer.invoke('runCli', args),

  /* template + marketplace API */
  templateAPI: {
    getUserDataPath  : () => ipcRenderer.invoke('getUserDataPath'),
    loadTemplates    : () => ipcRenderer.invoke('loadTemplates'),
    saveTemplate     : (t) => ipcRenderer.invoke('saveTemplate', t),
    deleteTemplate   : (slug) => ipcRenderer.invoke('deleteTemplate', slug),
    publishTemplate  : (t) => ipcRenderer.invoke('publishTemplate', t),
    fetchPublicTemplates: () => ipcRenderer.invoke('fetchMarketplace'),
  },

  /* events */
  ipcRenderer: {
    on : (ch, fn) => ipcRenderer.on(ch, fn),
    off: (ch, fn) => ipcRenderer.removeListener(ch, fn)
  }
});
