/* ─── tiny helper to persist “is_paid” flag in the user’s app-data dir ─── */
import { app } from 'electron';
import fs from 'fs';
import path from 'path';

export interface UserData { is_paid: boolean }

const FILE = path.join(app.getPath('userData'), 'user_data.json');

export function loadUserData(): UserData {
  try   { return JSON.parse(fs.readFileSync(FILE, 'utf-8')); }
  catch { return { is_paid: false }; }
}

export function saveUserData(data: UserData) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}
