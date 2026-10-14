import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// True when the Supabase env vars are missing — the app shows a setup screen instead of crashing
export const isMockMode = !supabaseUrl || !supabaseAnonKey;

export const supabase = isMockMode 
  ? null 
  : createClient(supabaseUrl, supabaseAnonKey);
