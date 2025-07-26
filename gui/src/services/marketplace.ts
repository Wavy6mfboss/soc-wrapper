/* ───────────────────────── gui/src/services/marketplace.ts
   Community-template helpers (no import.meta; Jest-friendly)
────────────────────────────────────────────────────────────────── */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { TemplateJSON } from '@/services/templates';

/* ---------- env ---------------------------------------------------------- */
const nEnv  = (typeof process !== 'undefined' ? process.env : {}) as any;
const wEnv  = (typeof window  !== 'undefined' ? (window as any).ENV : {}) ?? {};

const SUPABASE_URL  = nEnv.VITE_SUPABASE_URL      || wEnv.VITE_SUPABASE_URL;
const SUPABASE_ANON = nEnv.VITE_SUPABASE_ANON_KEY || wEnv.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error('[marketplace] Missing VITE_SUPABASE_* env vars');
}

/* ---------- singleton client --------------------------------------------- */
export const supabase: SupabaseClient =
  (globalThis as any).__SOC_WRAPPER_SBP__ ||
  ((globalThis as any).__SOC_WRAPPER_SBP__ = createClient(SUPABASE_URL, SUPABASE_ANON));

/* ---------- API ----------------------------------------------------------- */

/** Insert a *public* row. Returns `{ error }` so the test can `expect(error).toBeNull()`. */
export async function publishTemplate(tpl: TemplateJSON): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('templates')
    .insert([{ ...tpl, is_public: true }]);
  return { error };
}

/** Read all public templates and return a **plain array** (what the test expects). */
export async function fetchPublicTemplates(): Promise<TemplateJSON[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[marketplace] fetch error →', error);
    return [];
  }
  return data ?? [];
}
