import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://mkwhrortcfhjjeghmtww.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_EvBHmkoczlaHCqcuXgCfkw_qtTviovL';

export const supabase = createClient(supabaseUrl, supabaseKey);
