import { createClient } from '@supabase/supabase-js';

// --- REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS ---
const SUPABASE_URL = "https://vyczgsyevmaraktbuyij.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_SAU3KUFo7SQ-XZSVvHyAUA_1SvqVii1";
// -----------------------------------------------------------

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
