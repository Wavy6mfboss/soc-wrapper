/* ───────────────────────── gui/src/services/marketplace.ts
   Marketplace helpers – anonymous Download goes to localStorage
──────────────────────────────────────────────────────────────── */

import { supabase, type TemplateJSON } from './templates'
import { fetchRatingStats } from './ratings'

/* ---------- localStorage helpers (reuse same key as templates.ts) ------- */
const LOCAL_KEY = 'soc-wrapper-templates-v1'
function saveLocal (tpl: TemplateJSON) {
  const list: TemplateJSON[] = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]')
  tpl.id = Date.now()        // local id
  list.push(tpl)
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
}

export type MarketplaceTemplate = TemplateJSON & {
  avgStars: number
  ratingCount: number
}

/* ---------- utils ------------------------------------------------------- */
const ver = (v:any)=> typeof v==='number'?v||1:parseInt(String(v??'1').split('.')[0],10)||1

/* ---------- owner Publish (free) --------------------------------------- */
export const publishTemplate = (tpl: TemplateJSON) =>
  supabase.from('templates').insert([{ ...tpl, price_cents:0, version:ver(tpl.version), is_public:true }])

/* ---------- user Download / Buy ---------------------------------------- */
export async function publishLocalCopy (tpl: MarketplaceTemplate, ownerId: string | null) {
  if (!ownerId) {
    /* anonymous → local copy */
    saveLocal({
      ...tpl,
      id        : undefined,
      source_id : tpl.id,
      is_public : false,
      owner_id  : null,
    })
    return { error: null }
  }
  /* logged-in → Supabase copy */
  return supabase.from('templates').insert([{
    title        : tpl.title,
    prompt       : tpl.prompt,
    instructions : tpl.instructions,
    tags         : tpl.tags,
    price_cents  : tpl.price_cents,
    version      : ver(tpl.version),
    is_public    : false,
    owner_id     : ownerId,
    source_id    : tpl.id,
  }])
}

/* ---------- list public templates (optionally hide my own) -------------- */
export async function fetchPublicTemplates (
  sort:'new'|'top', exclude?:string|null,
){
  let q = supabase.from('templates').select('*').eq('is_public', true)
  if (exclude) q = q.neq('owner_id', exclude)
  const { data } = await q
  if (!data) return []
  const stats = await fetchRatingStats(data.map(t => t.id!))
  const rows  = data.map(t => ({
    ...t,
    avgStars   : stats[t.id!]?.avg   ?? 0,
    ratingCount: stats[t.id!]?.count ?? 0,
  })) as MarketplaceTemplate[]
  rows.sort(sort==='new'
    ? (a,b)=>+new Date(b.created_at??0)-+new Date(a.created_at??0)
    : (a,b)=>b.avgStars-a.avgStars || b.ratingCount-a.ratingCount)
  return rows
}
