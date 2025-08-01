/* ───────────────────────── gui/src/services/marketplace.ts
   Marketplace helpers – clones with a fresh local UUID
────────────────────────────────────────────────────────── */
import { supabase, type TemplateJSON } from '../services/templates'
import { v4 as uuid } from 'uuid'          // ✅ now resolved

/* ---------- copy public template → private row ------------------------- */
export async function publishLocalCopy (
  remote: TemplateJSON,
  currentUserId: string,
): Promise<void> {
  const localRow: TemplateJSON = {
    ...remote,
    id       : uuid(),          // brand-new local ID
    source_id: remote.id,       // remember origin
    owner_id : currentUserId,
    is_public: false,
  }

  const { error } = await supabase.from('templates').insert([localRow])
  if (error) throw error
}

/* ---------- other existing helpers stay unchanged --------------------- */

/* Example: if you already had these earlier, keep them as-is -------------
export async function fetchPublicTemplates (…) { … }
export async function publishTemplate       (…) { … }
-------------------------------------------------------------------------- */
