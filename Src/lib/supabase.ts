import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Player = {
  id: string;
  name: string;
  jersey_number: number | null;
  position: string | null;
  height: string | null;
  weight: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  team: string | null;
  status: 'active' | 'inactive' | 'injured';
  photo_url: string | null;
  stats_points_avg: number;
  stats_rebounds_avg: number;
  stats_assists_avg: number;
  bio: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'member';
  created_at: string;
  updated_at: string;
};
