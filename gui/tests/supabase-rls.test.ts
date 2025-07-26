/* ───────────────────────── gui/tests/supabase-rls.test.ts
   Basic sanity check – anonymous read must NOT 40x
──────────────────────────────────────────────────────── */

import { createClient } from "@supabase/supabase-js";

const url  = process.env.VITE_SUPABASE_URL!;
const anon = process.env.VITE_SUPABASE_ANON_KEY!;

describe("RLS – public.templates", () => {
  it("allows anonymous SELECT (200 OK or empty array)", async () => {
    const supabase = createClient(url, anon);
    const { error, status } = await supabase
      .from("templates")
      .select("*")
      .limit(1);

    if (error) throw error;       // will fail the test w/ proper message
    expect(status).toBe(200);
  });
});
