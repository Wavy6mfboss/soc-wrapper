import { createClient } from '@supabase/supabase-js';
import type { TemplateJSON } from '@/shared/types';

/* -------------------------------------------------------------------------- */
/*  Client                                                                    */
/* -------------------------------------------------------------------------- */

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY!;
export const db    = createClient(supabaseUrl, supabaseKey);

/* -------------------------------------------------------------------------- */
/*  API                                                                       */
/* -------------------------------------------------------------------------- */

/** Fetch *public & free* templates.  
 *  (No join → works until FK is added)                                         */
export async function fetchPublicTemplates(): Promise<TemplateJSON[]> {
  const { data, error } = await db
    .from('templates')
    .select('id,title,prompt,instructions,tags,price_cents,version')
    .eq('is_public', true)
    .eq('price_cents', 0);

  if (error) throw error;
  return data as TemplateJSON[];
}

/** Publish a template (stub for now). */
export async function publishTemplate(t: TemplateJSON) {
  // TODO: edge-function call in Sprint-09
  console.log('publishTemplate stub', t);
}
