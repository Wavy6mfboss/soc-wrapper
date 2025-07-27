/* ───────────────────────── gui/src/services/marketplace.ts
   Public-template helpers  (Sprint-10)
────────────────────────────────────────────────────────────────── */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { TemplateJSON } from '@/services/templates'
import { fetchRatingStats } from './ratings'   // ★ new

/* ---------- env ---------------------------------------------------------- */
const nEnv = (typeof process !== 'undefined' ? process.env : {}) as any
const wEnv = (typeof window  !== 'undefined' ? (window as any).ENV : {}) ?? {}

const SUPABASE_URL  = nEnv.VITE_SUPABASE_URL      || wEnv.VITE_SUPABASE_URL
const SUPABASE_ANON = nEnv.VITE_SUPABASE_ANON_KEY || wEnv.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error('[marketplace] Missing VITE_SUPABASE_* env vars')
}

/* ---------- singleton client --------------------------------------------- */
export const supabase: SupabaseClient =
  (globalThis as any).__SOC_WRAPPER_SBP__ ||
  ((globalThis as any).__SOC_WRAPPER_SBP__ = createClient(SUPABASE_URL, SUPABASE_ANON))

/* ---------- types --------------------------------------------------------- */
export type MarketplaceTemplate = TemplateJSON & {
  avgStars:    number
  ratingCount: number
}

/* ---------- API ----------------------------------------------------------- */

/** Owner publishes a template to *public*, price = 0 ¢. */
export async function publishTemplate (
  tpl: TemplateJSON,
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('templates')
    .insert([{ ...tpl, is_public: true }])
  return { error }
}

/**
 * Free public templates + rating stats.
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

  /* ---- attach rating averages ------------------------------------------ */
  const stats = await fetchRatingStats(rows.map(t => t.id))
  const enriched: MarketplaceTemplate[] = rows.map(t => ({
    ...t,
    avgStars:    stats[t.id]?.avg   ?? 0,
    ratingCount: stats[t.id]?.count ?? 0,
  }))

  /* ---- sort client-side ------------------------------------------------- */
  if (sort === 'new') {
    enriched.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  } else {
    enriched.sort((a, b) =>
      b.avgStars - a.avgStars || b.ratingCount - a.ratingCount,
    )
  }

  return enriched
}
