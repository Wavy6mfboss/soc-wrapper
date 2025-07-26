import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';

import { loadConfig, saveConfig, decrementFreeRuns } from './config.ts';
import { createWebhookServer } from './licenseManager.ts';
import { runCli } from './cliRunner.ts';
import Stripe from 'stripe';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  createWebhookServer(mainWindow);

  /* ---------- IPC handlers ---------- */

  ipcMain.handle('get-config', async () => await loadConfig());

  ipcMain.handle('set-config', async (_e, partial) => {
    await saveConfig(partial);
    mainWindow?.webContents.send('config-updated', partial);
  });

  ipcMain.handle('decrement-run', async () => await decrementFreeRuns());

  ipcMain.handle('launch-checkout', async () => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2023-10-16',
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: 'http://localhost:3000/paid',
      cancel_url: 'http://localhost:3000/cancel',
    });
    await shell.openExternal(session.url!);
  });

  ipcMain.handle('run-cli', async (_e, args: string[]) => {
    try {
      const output = await runCli(args);
      return { ok: true, output };
    } catch (err) {
      console.error('[run-cli] fatal', err);
      return { ok: false, error: String(err) };
    }
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
