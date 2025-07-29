/* ──────────── gui/src/services/templates.ts
   Local + Supabase CRUD helpers (edit persist fixed)
────────────────────────────────────────────────────────── */
import { createClient } from '@supabase/supabase-js'

/* env ------------------------------------------------------------------- */
const g = (k: string) =>
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.[k]) ??
  (typeof process    !== 'undefined' && process.env[k]) ??
  (typeof window     !== 'undefined' && (window as any).ENV?.[k])

const URL  = g('VITE_SUPABASE_URL')
const ANON = g('VITE_SUPABASE_ANON_KEY')
if (!URL || !ANON) throw new Error('Missing VITE_SUPABASE_*')

export const supabase = createClient(URL, ANON)

/* ---------- types ------------------------------------------------------ */
export interface TemplateJSON {
  id?: string
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
const KEY = 'soc-wrapper-templates-v1'
const locals = (): TemplateJSON[] => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') }
  catch { return [] }
}
const writeLocals = (arr: TemplateJSON[]) =>
  localStorage.setItem(KEY, JSON.stringify(arr))

function upsertLocal (tpl: TemplateJSON) {
  tpl.id ??= Date.now().toString()
  const list = locals()
  const i = list.findIndex(x => x.id === tpl.id)
  if (i >= 0) list[i] = tpl
  else list.push(tpl)
  writeLocals(list)
}

/* ---------- save / update ---------------------------------------------- */
export async function saveTemplate (tpl: TemplateJSON) {
  if (tpl.id && tpl.id.length === 36) {
    // Update remote row
    const { error } = await supabase
      .from('templates')
      .update({
        title:        tpl.title,
        prompt:       tpl.prompt,
        instructions: tpl.instructions,
        tags:         tpl.tags,
        price_cents:  tpl.price_cents,
        version:      tpl.version,
      })
      .eq('id', tpl.id)
    if (error) {
      console.error('[templates] update error →', error)
    }
  }
  // Sync local copy
  upsertLocal(tpl)
}

/* ---------- delete ------------------------------------------------------ */
export async function deleteTemplate (tpl: TemplateJSON) {
  if (tpl.id && tpl.id.length === 36) {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', tpl.id)
    if (error) {
      console.error('[templates] delete error →', error)
    }
  }
  writeLocals(
    locals().filter(t => t.id !== tpl.id && t.source_id !== tpl.id),
  )
}

/* ---------- fetch & de-duplicate --------------------------------------- */
export async function fetchTemplates () {
  const [local, remote] = await Promise.all([
    Promise.resolve(locals()),
    supabase.from('templates').select('*').then(r => r.data ?? []),
  ])

  const map = new Map<string, TemplateJSON>()
  remote.forEach(r => map.set(String(r.id), r))  // remote first
  local .forEach(l => map.set(String(l.id), l))  // local overrides
  return Array.from(map.values())
}

/* alias */
export const createTemplate = saveTemplate
