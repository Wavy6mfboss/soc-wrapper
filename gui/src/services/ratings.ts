/* ───────────────────────── gui/src/services/ratings.ts
   Ratings API helpers – Sprint-10
────────────────────────────────────────────────────────────────── */

import { supabase } from './templates'   // ← re-use existing singleton

export type RatingStats = { avg: number; count: number }

/**
 * Submit a rating (1-5 stars, optional comment).
 * Supabase RLS allows anonymous INSERT.
 */
export async function submitRating (
  templateId: number,
  stars: number,
  comment: string = '',
): Promise<void> {
  const { error } = await supabase.from('ratings').insert({
    template_id: templateId,
    stars,
    comment,
  })
  if (error) throw error
}

/**
 * Return { [templateId]: { avg, count } } for the supplied IDs.
 */
export async function fetchRatingStats (
  templateIds: number[],
): Promise<Record<number, RatingStats>> {
  if (!templateIds.length) return {}

  const { data, error } = await supabase
    .from('ratings')
    .select('template_id, stars')
    .in('template_id', templateIds)

  if (error) throw error

  const buckets: Record<number, { total: number; count: number }> = {}
  data!.forEach(({ template_id, stars }) => {
    if (!buckets[template_id]) buckets[template_id] = { total: 0, count: 0 }
    buckets[template_id].total += stars
    buckets[template_id].count += 1
  })

  const stats: Record<number, RatingStats> = {}
  for (const [id, { total, count }] of Object.entries(buckets)) {
    stats[+id] = { avg: +(total / count).toFixed(1), count }
  }
  return stats
}
