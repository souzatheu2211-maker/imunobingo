import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nmkipfrfonfvpbtrpfjd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2n_qPmAWvYhn5U3KTjf-9A_KyLEn3Ol';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);