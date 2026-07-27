import { createClient } from '@supabase/supabase-js';

const env = import.meta.env ?? {};
const url = env.VITE_SUPABASE_URL?.trim();
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const supabase = url && key
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
