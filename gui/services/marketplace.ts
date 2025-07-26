/**
 * marketplace.ts – Sprint 09 cloud hook-up
 *
 * All interactions with the remote Marketplace live here.
 * – publishTemplate      → POST   /functions/v1/publish-template
 * – fetchPublicTemplates → GET    /rest/v1/templates_public_view
 *
 * Env vars must be exposed to Vite with the `VITE_` prefix.
 */

import { createClient } from '@supabase/supabase-js';
import type { TemplateJSON } from '~/shared/types';   // adjust if the path differs

/* -------------------------------------------------------------------------- */
/*  Supabase client                                                           */
/* -------------------------------------------------------------------------- */

const supabaseUrl: string  = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnon: string = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnon);

/* -------------------------------------------------------------------------- */
/*  API helpers                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Uploads a template the user created locally to the Marketplace.
 * Returns the row that Supabase inserts.
 */
export async function publishTemplate(tpl: TemplateJSON) {
  const { data, error } = await supabase
    .from('templates')
    .insert([tpl])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetches every public-and-free template (price_cents = 0) that users have
 * shared.  The call is read-only, so the anon key is fine.
 */
export async function fetchPublicTemplates(): Promise<TemplateJSON[]> {
  const { data, error } = await supabase
    .from('templates_public_view')   // use a RLS-safe view
    .select('*')
    .eq('price_cents', 0)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
