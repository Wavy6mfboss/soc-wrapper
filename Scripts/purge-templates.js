/* ─────────────── scripts/purge-templates.js
   Delete dev templates older than 30 days
   Usage →  npm run purge-dev-templates
──────────────────────────────────────────────── */

require("dotenv").config({ path: ".env" });               // load env vars

const { createClient } = require("@supabase/supabase-js");

const url  = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error("✖  VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing in .env");
  process.exit(1);
}

const supabase = createClient(url, anon);

// 30-day cutoff
const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

(async () => {
  const { error, count } = await supabase
    .from("templates")
    .delete({ count: "exact" })
    .lt("created_at", cutoff);

  if (error) {
    console.error("✖  Supabase error:", error.message);
    process.exit(1);
  }

  console.log(
    `✔  Purged ${count ?? 0} dev template${count === 1 ? "" : "s"} older than 30 days`
  );
  process.exit(0);
})();
