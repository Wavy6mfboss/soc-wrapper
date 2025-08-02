/* ───────────────────────── gui/src/services/marketplace.ts
   Public-template helpers – with fresh rating aggregates
────────────────────────────────────────────────────────────────── */
import { supabase, type TemplateJSON } from './templates'

/* ---------- extra helper ---------------------------------------------- */
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

  /* reduce to { id: { count, avg } } */
  const out: Record<string, { count: number; avg: number }> = {}
  data!.forEach(({ template_id, stars }) => {
    const key = String(template_id)
    const obj = out[key] ?? (out[key] = { count: 0, avg: 0 })
    obj.count += 1
    obj.avg = ((obj.avg * (obj.count - 1)) + stars) / obj.count
  })
  return out
}

/* ---------- types ------------------------------------------------------ */
export type MarketplaceTemplate = TemplateJSON & {
  avgStars:    number
  ratingCount: number
}

/* ---------- API -------------------------------------------------------- */
export async function fetchPublicTemplates (
  sort: 'new' | 'top' = 'new',
): Promise<MarketplaceTemplate[]> {
  /* ① fetch rows */
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_public', true)

  if (error) {
    console.error('[marketplace] fetch templates error →', error)
    return []
  }

  const rows = data ?? []

  /* ② fetch live rating aggregates */
  const stats = await fetchRatingStats(rows.map(r => r.id!))

  /* ③ enrich rows */
  const enriched: MarketplaceTemplate[] = rows.map(r => ({
    ...r,
    avgStars:    stats[String(r.id)]?.avg   ?? 0,
    ratingCount: stats[String(r.id)]?.count ?? 0,
  }))

  /* ④ sort client-side */
  enriched.sort(sort === 'top'
    ? (a, b) => b.avgStars - a.avgStars || b.ratingCount - a.ratingCount
    : (a, b) => new Date(b.created_at ?? '').getTime()
              - new Date(a.created_at ?? '').getTime())

  return enriched
}
