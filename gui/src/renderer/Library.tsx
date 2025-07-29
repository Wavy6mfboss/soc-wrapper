/* ──────────── gui/src/services/templates.ts
   Local + Supabase CRUD helpers (compile-safe)
────────────────────────────────────────────────────────── */
import { createClient } from '@supabase/supabase-js'

/* env ------------------------------------------------------------------- */
const env = (k: string) =>
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.[k]) ??
  (typeof process    !== 'undefined' && process.env[k]) ??
  (typeof window     !== 'undefined' && (window as any).ENV?.[k])

const URL  = env('VITE_SUPABASE_URL')
const ANON = env('VITE_SUPABASE_ANON_KEY')
if (!URL || !ANON) throw new Error('Missing VITE_SUPABASE_* env vars')

export const supabase = createClient(URL, ANON)

/* ---------- types ------------------------------------------------------ */
export interface TemplateJSON {
  id?: string               // uuid (remote) or local string id
  title: string
  prompt: string
  instructions: string
  tags: string[]
  price_cents: number
  version: number | string
  is_public: boolean
  owner_id?: string | null
  source_id?: string | null
  created_at?: string
}

/* ---------- local helpers ---------------------------------------------- */
const LOCAL_KEY = 'soc-wrapper-templates-v1'
const locals = (): TemplateJSON[] => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]') }
  catch { return [] }
}
const writeLocals = (arr: TemplateJSON[]) =>
  localStorage.setItem(LOCAL_KEY, JSON.stringify(arr))

function saveLocal (tpl: TemplateJSON) {
  tpl.id ??= Date.now().toString()
  const list = locals()
  const idx  = list.findIndex(x => x.id === tpl.id)
  idx >= 0 ? (list[idx] = tpl) : list.push(tpl)
  writeLocals(list)
}

/* ---------- public API -------------------------------------------------- */
export async function saveTemplate (tpl: TemplateJSON) {
  if (tpl.id && tpl.id.length === 36) {
    /* remote row – update */
    await supabase
      .from('templates')
      .update({
        title: tpl.title,
        prompt: tpl.prompt,
        instructions: tpl.instructions,
        tags: tpl.tags,
        price_cents: tpl.price_cents,
        version: tpl.version,
      })
      .eq('id', tpl.id)
  } else {
    saveLocal(tpl)
  }
}

export async function deleteTemplate (tpl: TemplateJSON) {
  if (tpl.id && tpl.id.length === 36) {
    await supabase.from('templates').delete().eq('id', tpl.id)
  }
  writeLocals(locals().filter(t => t.id !== tpl.id))
}

export async function fetchTemplates () {
  const [local, remote] = await Promise.all([
    Promise.resolve(locals()),
    supabase.from('templates').select('*').then(r => r.data ?? []),
  ])

  /* de-dup by id (prefer remote) */
  const map = new Map<string, TemplateJSON>()
  remote.forEach(r => map.set(String(r.id), r))
  local.forEach(l => { if (!map.has(String(l.id))) map.set(String(l.id), l) })
  return Array.from(map.values())
}

/* aliases */
export const createTemplate = saveTemplate
