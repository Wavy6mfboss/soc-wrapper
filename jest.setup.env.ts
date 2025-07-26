/**  Load .env so tests get Supabase creds  */
import { config } from 'dotenv';

// looks for a .env file in the repo root
config({ path: '.env' });

/* fallback aliases for the GUI build vars ---------------------------- */
process.env.VITE_SUPABASE_URL       ??= process.env.SUPABASE_URL       ?? '';
process.env.VITE_SUPABASE_ANON_KEY  ??= process.env.SUPABASE_ANON_KEY  ?? '';
