import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';

export interface AppConfig {
  model: string;
  freeRuns: number;
  isPaid: boolean;
}

const defaultConfig: AppConfig = {
  model: 'gpt-4o-mini',
  freeRuns: 5,
  isPaid: false,
};

const cfgPath = path.join(app.getPath('userData'), 'config.json');

export async function loadConfig(): Promise<AppConfig> {
  try {
    const raw = await fs.readFile(cfgPath, 'utf8');
    return { ...defaultConfig, ...JSON.parse(raw) };
  } catch {
    await saveConfig(defaultConfig);
    return { ...defaultConfig };
  }
}

export async function saveConfig(partial: Partial<AppConfig>): Promise<void> {
  const current = await loadConfig();
  const merged = { ...current, ...partial };
  await fs.writeFile(cfgPath, JSON.stringify(merged, null, 2), 'utf8');
}

export async function decrementFreeRuns(): Promise<AppConfig> {
  const current = await loadConfig();
  if (current.freeRuns > 0) current.freeRuns -= 1;
  await saveConfig(current);
  return current;
}
