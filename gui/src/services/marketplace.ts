/* ───────────────────────── gui/src/services/marketplace.ts
   Public Marketplace helpers – Sprint-10
   (now re-uses the supabase singleton from templates.ts)
────────────────────────────────────────────────────────────────── */

import { supabase, type TemplateJSON } from './templates'   // ★ reuse client
import { fetchRatingStats } from './ratings'

/* ---------- types ------------------------------------------------------- */
export type MarketplaceTemplate = TemplateJSON & {
  avgStars:    number
  ratingCount: number
}

/* ---------- API --------------------------------------------------------- */

/** Owner publishes a template publicly (price = 0 ¢). */
export async function publishTemplate (
  tpl: TemplateJSON,
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('templates')
    .insert([{ ...tpl, is_public: true, price_cents: 0 }])
  return { error }
}

/**
 * Fetch free public templates + rating stats.
 * sort: 'new' (default) → newest first
 *       'top'           → highest ★ first
 */
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

  const rows = data ?? []

  /* attach rating averages */
  const stats = await fetchRatingStats(rows.map(t => t.id!))
  const enriched: MarketplaceTemplate[] = rows.map(t => ({
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
