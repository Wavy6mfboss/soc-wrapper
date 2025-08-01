/* ───────────────────────── gui/src/services/marketplace.ts
   Public Marketplace helpers – now clones with a fresh local id
────────────────────────────────────────────────────────── */
import { supabase, type TemplateJSON } from '../services/templates'
import { v4 as uuid } from 'uuid'                     // ← new

/* ---------- download / buy ------------------------------------------------ */
export async function publishLocalCopy (
  remote: TemplateJSON,
  currentUserId: string,
): Promise<void> {
  const localRow: TemplateJSON = {
    ...remote,
    id       : uuid(),          // brand-new local UUID so it never clashes
    owner_id : currentUserId,
    source_id: remote.id,       // remember origin
    is_public: false,
  }

  // Store only in Supabase (remote) so it syncs to all devices
  const { error } = await supabase
    .from('templates')
    .insert([localRow])

  if (error) throw error
}

/* ---------- existing helpers unchanged ----------------------------------- */
// ... (fetchPublicTemplates, publishTemplate, etc – keep your previous code)
