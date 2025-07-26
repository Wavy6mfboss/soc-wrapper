/* ───────────────────────── services/templates.ts
   Local-storage + Supabase helpers (singleton client)
────────────────────────────────────────────────────────────────── */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

/* ---------- env & client (singleton) ----------------------------------- */
const url =
  (import.meta as any).env?.VITE_SUPABASE_URL ??
  (window as any).ENV?.VITE_SUPABASE_URL;
const anon =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ??
  (window as any).ENV?.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient =
  (window as any).__SOC_WRAPPER_SUPABASE__ ||
  ((window as any).__SOC_WRAPPER_SUPABASE__ = createClient(url, anon));

/* ---------- types ------------------------------------------------------- */
export interface TemplateJSON {
  id?: number;
  title: string;
  prompt: string;
  instructions: string;
  tags: string[];
  price_cents: number;
  version: string;
  is_public: boolean;
  created_at?: string;
}

/* ---------- local-storage helpers -------------------------------------- */
/* We’ve used two different keys over time → accept either */
const LOCAL_KEYS = ["soc-wrapper-templates-v1", "soc-wrapper.localTemplates"];
const PRIMARY_KEY = LOCAL_KEYS[0];

export function loadLocalTemplates(): TemplateJSON[] {
  for (const key of LOCAL_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore bad JSON – fallthrough to next key */
    }
  }
  return [];
}

function writeLocalTemplates(list: TemplateJSON[]) {
  localStorage.setItem(PRIMARY_KEY, JSON.stringify(list));
}

function saveLocalTemplate(tpl: TemplateJSON) {
  const list = loadLocalTemplates();
  if (tpl.id == null) tpl.id = Date.now();

  const idx = list.findIndex((t) => t.id === tpl.id);
  idx >= 0 ? (list[idx] = tpl) : list.push(tpl);

  writeLocalTemplates(list);
}

export async function deleteTemplate(tpl: TemplateJSON) {
  if (tpl.is_public) {
    return supabase.from("templates").delete().eq("id", tpl.id);
  }
  const remaining = loadLocalTemplates().filter((t) => t.id !== tpl.id);
  writeLocalTemplates(remaining);
}

/* ---------- Supabase helpers ------------------------------------------- */
async function fetchPublicTemplates(): Promise<TemplateJSON[]> {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[templates] Supabase error →", error);
    return [];
  }
  return data ?? [];
}

async function upsertPublicTemplate(tpl: TemplateJSON) {
  const { error } = await supabase.from("templates").upsert(tpl).select();
  if (error) throw error;
}

/* ---------- public API -------------------------------------------------- */
export async function fetchTemplates(): Promise<TemplateJSON[]> {
  const [local, remote] = await Promise.all([
    Promise.resolve(loadLocalTemplates()),
    fetchPublicTemplates(),
  ]);
  return [...local, ...remote];
}

export async function saveTemplate(tpl: TemplateJSON) {
  return tpl.is_public ? upsertPublicTemplate(tpl) : saveLocalTemplate(tpl);
}

/* legacy aliases --------------------------------------------------------- */
export const createTemplate      = saveTemplate;
export const deleteLocalTemplate = deleteTemplate;
