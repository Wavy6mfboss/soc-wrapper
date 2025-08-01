/* ───────────────────────── gui/src/services/marketplace.ts
   Public Marketplace helpers
────────────────────────────────────────────────────────── */
import { supabase, type TemplateJSON } from '../services/templates'

/* ---------- 1. publish your own template ------------------------------ */
export async function publishTemplate (
  tpl: TemplateJSON,
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('templates')
    .insert([{
      ...tpl,
      is_public : true,
      price_cents: 0,
      version   : typeof tpl.version === 'number'
        ? tpl.version
        : Number(String(tpl.version).split('.')[0]) || 1,
    }])
  return { error }
}

/* ---------- 2. clone OR reuse one local copy per source --------------- */
export async function publishLocalCopy (
  remote: TemplateJSON,
  currentUserId: string,
): Promise<void> {
  /* already have a private copy for this source_id? */
  const { data: existing } = await supabase
    .from('templates')
    .select('*')
    .eq('owner_id', currentUserId)
    .eq('source_id', remote.id)
    .limit(1)
    .maybeSingle()

  if (existing) return               // user already owns it

  /* otherwise insert new row with fresh UUID */
  const localRow: TemplateJSON = {
    ...remote,
    id       : crypto.randomUUID(),
    source_id: remote.id,
    owner_id : currentUserId,
    is_public: false,
  }

  const { error } = await supabase.from('templates').insert([localRow])
  if (error) throw error
}

/* ---------- 3. fetch public templates --------------------------------- */
export async function fetchPublicTemplates (
  sort: 'new' | 'top' = 'new',
): Promise<TemplateJSON[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_public', true)

  if (error) {
    console.error('[marketplace] fetch error →', error)
    return []
  }

  const rows = data ?? []
  if (sort === 'new') {
    rows.sort((a, b) =>
      new Date(b.created_at ?? '').getTime() -
      new Date(a.created_at ?? '').getTime())
  }
  return rows
}
