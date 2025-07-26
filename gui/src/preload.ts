/* eslint-disable @typescript-eslint/no-var-requires */
import { contextBridge, ipcRenderer } from 'electron';

// Use CommonJS requires so ts-node compiles to CJS in place
const { loadConfig, saveConfig, decrementFreeRuns } = require('./Main/config');
const { runCli } = require('./Main/cliBridge');

contextBridge.exposeInMainWorld('electron', {
  /* ----- config helpers ----- */
  getConfig   : loadConfig,
  saveConfig  : saveConfig,
  decrementRun: async () => {
    const cfg = await decrementFreeRuns();
    return { freeRunsLeft: cfg.freeRuns };
  },

  /* ----- CLI launcher ----- */
  runCli,

  /* ----- listen-only IPC ----- */
  ipcRenderer: {
    on: (ch: string, fn: () => void) => ipcRenderer.on(ch, fn)
  }
});
