/* ───────────────────────── gui/src/services/marketplace.ts
   Public Marketplace helpers – Sprint-10 (coerce version → int)
────────────────────────────────────────────────────────────────── */

import { supabase, type TemplateJSON } from './templates'
import { fetchRatingStats } from './ratings'

/* ---------- types ------------------------------------------------------- */
export type MarketplaceTemplate = TemplateJSON & {
  avgStars:    number
  ratingCount: number
}

/* ---------- utils ------------------------------------------------------- */
function coerceVersion (v: any): number {
  if (typeof v === 'number') return v || 1
  const first = String(v ?? '1').split('.')[0]     // '1.0.0' → '1'
  const n     = parseInt(first, 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

function toDbRow (tpl: TemplateJSON) {
  const {
    title,
    prompt,
    instructions,
    tags,
    price_cents,
    version,
  } = tpl

  return {
    title,
    prompt,
    instructions,
    tags,
    price_cents: 0,            // free
    version: coerceVersion(version),
    is_public: true,
  }
}

/* ---------- API --------------------------------------------------------- */
export async function publishTemplate (
  tpl: TemplateJSON,
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('templates').insert([toDbRow(tpl)])
  return { error }
}

export async function fetchPublicTemplates (
  sort: 'new' | 'top' = 'new',
): Promise<MarketplaceTemplate[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_public', true)
    .eq('price_cents', 0)

  if (error) {
    console.error('[marketplace] fetch error →', error)
    return []
  }

  const rows  = data ?? []
  const stats = await fetchRatingStats(rows.map((t) => t.id!))

  const enriched: MarketplaceTemplate[] = rows.map((t) => ({
    ...t,
    avgStars:    stats[t.id!]?.avg   ?? 0,
    ratingCount: stats[t.id!]?.count ?? 0,
  }))

  /* sort client-side */
  if (sort === 'new') {
    enriched.sort(
      (a, b) =>
        new Date(b.created_at ?? '').getTime() -
        new Date(a.created_at ?? '').getTime(),
    )
  } else {
    enriched.sort(
      (a, b) => b.avgStars - a.avgStars || b.ratingCount - a.ratingCount,
    )
  }

  return enriched
}
