/* ───────────────────────── gui/src/services/ratings.ts
   Ratings API helpers – one-per-user constraint
────────────────────────────────────────────────────────── */
import { supabase } from './templates'

/* ---- write (INSERT … ON CONFLICT) ---------------------- */
export async function submitRating (
  templateId: string | number,
  stars     : number,
  comment   : string,
) {
  /* server-side uniqueness: (template_id,user_id) */
  const { error } = await supabase
    .from('ratings')
    .upsert(
      { template_id: templateId, stars, comment },
      { onConflict: 'template_id,user_id' },
    )
  if (error) throw error
}

/* ---- read: has current user already rated? -------------- */
export async function hasUserRated (
  templateId: string | number,
): Promise<boolean> {
  const uid = (await supabase.auth.getUser()).data.user?.id
  if (!uid) return false
  const { count } = await supabase
    .from('ratings')
    .select('*', { count: 'exact', head: true })
    .eq('template_id', templateId)
    .eq('user_id', uid)
  return (count ?? 0) > 0
}
