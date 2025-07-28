/* ─────────────── Templates helper – local-storage + Supabase ───────────── */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/* ---------- env helpers -------------------------------------------------- */
/* Works in Vite (import.meta.env), Node (process.env), and tests (window.ENV) */
type MaybeEnv = Record<string, any> | undefined
const iEnv: MaybeEnv =
  typeof import.meta !== 'undefined' && (import.meta as any).env
    ? (import.meta as any).env
    : undefined
const nEnv: MaybeEnv =
  typeof process !== 'undefined' && (process as any).env
    ? (process as any).env
    : undefined
const wEnv: MaybeEnv =
  typeof window !== 'undefined' && (window as any).ENV
    ? (window as any).ENV
    : undefined

function env (key: string): string | undefined {
  return iEnv?.[key] ?? nEnv?.[key] ?? wEnv?.[key]
}

const SUPABASE_URL  = env('VITE_SUPABASE_URL')
const SUPABASE_ANON = env('VITE_SUPABASE_ANON_KEY')

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error('[templates] Missing VITE_SUPABASE_* env vars')
}

/* ---------- singleton client --------------------------------------------- */
export const supabase: SupabaseClient =
  (globalThis as any).__SOC_SUPABASE__ ??
  ((globalThis as any).__SOC_SUPABASE__ = createClient(SUPABASE_URL, SUPABASE_ANON))

/* ---------- types -------------------------------------------------------- */
export interface TemplateJSON {
  id?: number
  title: string
  prompt: string
  instructions: string
  tags: string[]
  price_cents: number
  version: string
  is_public: boolean
  created_at?: string
}

/* ---------- local-storage helpers --------------------------------------- */
const LOCAL_KEY = 'soc-wrapper-templates-v1'

export function loadLocalTemplates (): TemplateJSON[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveLocalTemplate (tpl: TemplateJSON) {
  const list = loadLocalTemplates()
  if (tpl.id == null) tpl.id = Date.now()
  const idx = list.findIndex((t) => t.id === tpl.id)
  idx >= 0 ? (list[idx] = tpl) : list.push(tpl)
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
}

export function deleteTemplate (tpl: TemplateJSON) {
  if (tpl.is_public) {
    return supabase.from('templates').delete().eq('id', tpl.id)
  }
  const list = loadLocalTemplates().filter((t) => t.id !== tpl.id)
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
}

/* ---------- Supabase helpers ------------------------------------------- */
async function fetchPublicTemplates (): Promise<TemplateJSON[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[templates] supabase error →', error)
    return []
  }
  return data ?? []
}

async function upsertPublicTemplate (tpl: TemplateJSON) {
  const { error } = await supabase.from('templates').upsert(tpl).select()
  if (error) throw error
}

/* ---------- public API -------------------------------------------------- */
export async function fetchTemplates (): Promise<TemplateJSON[]> {
  const [local, remote] = await Promise.all([
    Promise.resolve(loadLocalTemplates()),
    fetchPublicTemplates(),
  ])
  return [...local, ...remote]
}

export async function saveTemplate (tpl: TemplateJSON) {
  return tpl.is_public ? upsertPublicTemplate(tpl) : saveLocalTemplate(tpl)
}

/* retained alias */
export const createTemplate = saveTemplate
