/* ───────────────────────── gui/src/services/marketplace.ts */
import { supabase, type TemplateJSON } from './templates'
import { fetchRatingStats } from './ratings'

export type MarketplaceTemplate = TemplateJSON & {
  avgStars:number; ratingCount:number;
}

function coerce(v:any){if(typeof v==='number')return v||1;const n=parseInt(String(v??'1').split('.')[0],10);return Number.isFinite(n)&&n>0?n:1}

/* publish (owner) */
export const publishTemplate= (tpl:TemplateJSON)=>supabase.from('templates').insert([{
  ...tpl, price_cents:0, version:coerce(tpl.version), is_public:true,
}])

/* download / buy – works even if uid==null */
export async function publishLocalCopy(tpl:MarketplaceTemplate,ownerId:string|null){
  const row:any={title:tpl.title,prompt:tpl.prompt,instructions:tpl.instructions,tags:tpl.tags,
    price_cents:tpl.price_cents,version:coerce(tpl.version),is_public:false,source_id:tpl.id}
  if(ownerId) row.owner_id=ownerId
  return supabase.from('templates').insert([row])
}

/* list public (optionally hide my own) */
export async function fetchPublicTemplates(sort:'new'|'top',exclude?:string|null){
  let q=supabase.from('templates').select('*').eq('is_public',true)
  if(exclude) q=q.neq('owner_id',exclude)
  const {data}=await q
  if(!data) return[]
  const stats=await fetchRatingStats(data.map(t=>t.id!))
  const rows=data.map(t=>({...t,avgStars:stats[t.id!]?.avg??0,ratingCount:stats[t.id!]?.count??0})) as MarketplaceTemplate[]
  rows.sort(sort==='new'
    ?(a,b)=>+new Date(b.created_at??0)-+new Date(a.created_at??0)
    :(a,b)=>b.avgStars-a.avgStars||b.ratingCount-a.ratingCount)
  return rows
}
