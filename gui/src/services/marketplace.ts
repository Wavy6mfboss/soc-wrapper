/* ───────────────────────── gui/src/services/marketplace.ts
   Marketplace helpers – Download / Buy + rating stats
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
  const first = String(v ?? '1').split('.')[0]
  const n     = parseInt(first, 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

function toDbRow (tpl: TemplateJSON) {
  const { title, prompt, instructions, tags, price_cents, version } = tpl
  return {
    title,
    prompt,
    instructions,
    tags,
    price_cents,
    version: coerceVersion(version),
    is_public: true,
  }
}

/* ---------- API: owner Publish (free) ---------------------------------- */
export async function publishTemplate (
  tpl: TemplateJSON,
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('templates').insert([toDbRow(tpl)])
  return { error }
}

/* ---------- API: user Download / Buy ----------------------------------- */
export async function publishLocalCopy (
  tpl: MarketplaceTemplate,
  ownerId: string,
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('templates').insert([
    {
      title:        tpl.title,
      prompt:       tpl.prompt,
      instructions: tpl.instructions,
      tags:         tpl.tags,
      price_cents:  tpl.price_cents,
      version:      coerceVersion(tpl.version),
      is_public:    false,
      owner_id:     ownerId,
      source_id:    tpl.id,
    },
  ])
  return { error }
}

/* ---------- API: list public templates --------------------------------- */
export async function fetchPublicTemplates (
  sort: 'new' | 'top' = 'new',
): Promise<MarketplaceTemplate[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_public', true)

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

  if (sort === 'new') {
    enriched.sort(
      (a, b) =>
        new Date(b.created_at ?? '').valueOf() -
        new Date(a.created_at ?? '').valueOf(),
    )
  } else {
    enriched.sort(
      (a, b) => b.avgStars - a.avgStars || b.ratingCount - a.ratingCount,
    )
  }
  return enriched
}
