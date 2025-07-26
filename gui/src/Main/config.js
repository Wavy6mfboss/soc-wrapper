const fs   = require('fs/promises');
const path = require('path');
const { app } = require('electron');

/* ---------- defaults ---------- */
const DEFAULTS = { model: 'gpt-4o-mini', freeRuns: 5, isPaid: false };

/* ---------- storage path ---------- */
const CONFIG_PATH = path.join(app.getPath('userData'), 'user_data.json');

/* ---------- helpers ---------- */
async function loadConfig() {
  try {
    const raw = await fs.readFile(CONFIG_PATH, 'utf8');
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    await fs.writeFile(CONFIG_PATH, JSON.stringify(DEFAULTS, null, 2), 'utf8');
    return { ...DEFAULTS };
  }
}
exports.loadConfig = loadConfig;

async function saveConfig(partial) {
  const cur  = await loadConfig();
  const next = { ...cur, ...partial };
  await fs.writeFile(CONFIG_PATH, JSON.stringify(next, null, 2), 'utf8');
}
exports.saveConfig = saveConfig;

async function decrementFreeRuns() {
  const cfg = await loadConfig();
  if (!cfg.isPaid && cfg.freeRuns > 0) {
    cfg.freeRuns -= 1;
    await saveConfig({ freeRuns: cfg.freeRuns });
  }
  return cfg;
}
exports.decrementFreeRuns = decrementFreeRuns;
