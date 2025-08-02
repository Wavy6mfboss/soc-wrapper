/* ───────────────────────── gui/src/services/marketplace.ts
   Public-template helpers – live rating aggregates + local-copy helper
────────────────────────────────────────────────────────────────── */
import { supabase, type TemplateJSON } from './templates'

/* ---------- rating aggregates ---------------------------------------- */
async function fetchRatingStats (ids: (number | string)[]) {
  if (!ids.length) return {}
  const { data, error } = await supabase
    .from('ratings')
    .select('template_id, stars')
    .in('template_id', ids)

  if (error) {
    console.error('[marketplace] rating stats error →', error)
    return {}
  }
  const out: Record<string, { count: number; avg: number }> = {}
  data!.forEach(({ template_id, stars }) => {
    const k = String(template_id)
    const o = out[k] ?? (out[k] = { count: 0, avg: 0 })
    o.count += 1
    o.avg = ((o.avg * (o.count - 1)) + stars) / o.count
  })
  return out
}

/* ---------- types ----------------------------------------------------- */
export type MarketplaceTemplate = TemplateJSON & {
  avgStars:    number
  ratingCount: number
}

/* ---------- fetch list ------------------------------------------------ */
export async function fetchPublicTemplates (
  sort: 'new' | 'top' = 'new',
): Promise<MarketplaceTemplate[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_public', true)

  if (error) {
    console.error('[marketplace] fetch templates error →', error)
    return []
  }

  const rows  = data ?? []
  const stats = await fetchRatingStats(rows.map(r => r.id!))

  const enriched: MarketplaceTemplate[] = rows.map(r => ({
    ...r,
    avgStars:    stats[String(r.id)]?.avg   ?? 0,
    ratingCount: stats[String(r.id)]?.count ?? 0,
  }))

  enriched.sort(sort === 'top'
    ? (a, b) => b.avgStars - a.avgStars || b.ratingCount - a.ratingCount
    : (a, b) => new Date(b.created_at ?? '').getTime()
              - new Date(a.created_at ?? '').getTime())

  return enriched
}

/* ---------- publish a private copy to My Library --------------------- */
/**
 * Download / buy → insert a private clone.
 * • owner_id = current user
 * • source_id = original template id
 * • is_public = false
 * Returns `{ error }` so callers can check.
 */
export async function publishLocalCopy (
  original   : TemplateJSON,
  ownerId    : string,
): Promise<{ error: Error | null }> {
  const clone = {
    ...original,
    id        : undefined,            // let Supabase generate new PK
    owner_id  : ownerId,
    source_id : original.id,
    is_public : false,
    created_at: new Date().toISOString(),
  }
  const { error } = await supabase.from('templates').insert([clone])
  return { error }
}
