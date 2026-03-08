import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Player = {
  // --- TUS CAMPOS ORIGINALES (INTACTOS) ---
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

  // --- NUEVOS CAMPOS PARA LIGA PIBB (AGREGADOS) ---
  first_name: string;          // Usado en tus formularios actuales
  last_name: string | null;
  avatar_url?: string | null;  // La clave para los nuevos Avatares
  points?: number;             // Para el Ranking Global
  wins?: number;               // Para estadísticas de victoria
  losses?: number;             // Para estadísticas de derrota
  player_number?: number;      // Para el buscador por número
  rank_position?: number;      // Para la posición en el Ranking
  dominant_hand?: string;      // "Derecho" o "Izquierdo"
  racket_brand?: string;       // Marca de la raqueta
  pin?: string;                // PIN de seguridad de 4 dígitos
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'member';
  created_at: string;
  updated_at: string;
};
