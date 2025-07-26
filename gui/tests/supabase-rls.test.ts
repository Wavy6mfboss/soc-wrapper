import { createClient } from '@supabase/supabase-js';

const url  = process.env.VITE_SUPABASE_URL!;
const anon = process.env.VITE_SUPABASE_ANON_KEY!;

describe('RLS – public.templates', () => {
  it('allows anonymous SELECT (returns 200)', async () => {
    const supabase = createClient(url, anon);

    const { status, error } = await supabase
      .from('templates')
      .select('*')
      .limit(1);

    expect(status).toBe(200);         // RLS lets anon read
    expect(error).toBeNull();         // no auth error
  });
});
