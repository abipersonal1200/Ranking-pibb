import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Users, Zap, Star, Clock, Activity } from 'lucide-react';

export function Home() {
  const [players, setPlayers] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    // 1. Cargar Ranking ordenado por el sistema Ladder
    const { data: pData } = await supabase
      .from('players')
      .select('*')
      .order('rank_position', { ascending: true });

    // 2. Cargar Últimas Partidas (asumiendo que tienes una tabla 'matches')
    const { data: mData } = await supabase
      .from('matches')
      .select('*, winner:players!winner_id(first_name), loser:players!loser_id(first_name)')
      .order('created_at', { ascending: false })
      .limit(3);

    if (pData) setPlayers(pData);
    if (mData) setRecentMatches(mData);
    setLoading(false);
  }

  return (
    <div className="p-6 bg-[#0F0F1A] min-h-screen pb-24 animate-in fade-in duration-700">
      {/* Header con Título de la Liga */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 to-orange-800 rounded-[2.5rem] p-8 mb-8 shadow-[0_20px_40px_rgba(234,88,12,0.3)]">
        <div className="relative z-10">
          <h1 className="text-4xl font-black italic text-white tracking-tighter leading-none mb-1">
            LIGA PIBB
          </h1>
          <p className="text-orange-100 text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">
            OFFICIAL PING PONG RANKING
          </p>
        </div>
        <Trophy className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-white/10 -rotate-12" />
      </div>

      {/* Stats Principales: Players y Status */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-[#161625] border border-gray-800/50 p-6 rounded-[2rem] flex flex-col items-center shadow-lg">
          <Users className="text-orange-500 mb-3 w-6 h-6" />
          <div className="text-3xl font-black text-white leading-none mb-1">{players.length}</div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Players</div>
        </div>
        <div className="bg-[#161625] border border-gray-800/50 p-6 rounded-[2rem] flex flex-col items-center shadow-lg text-center">
          <Activity className="text-orange-500 mb-3 w-6 h-6" />
          <div className="text-xl font-black text-orange-500 leading-none mb-1 tracking-tighter">LIVE</div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</div>
        </div>
      </div>

      {/* Sección Ranking Global */}
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-white font-black italic uppercase tracking-tighter flex items-center gap-2">
          <Star className="text-orange-500 w-4 h-4 fill-current" /> Ranking Global
        </h2>
        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Temporada 2026</span>
      </div>

      <div className="space-y-4 mb-12">
        {players.slice(0, 5).map((player, index) => (
          <div 
            key={player.id}
            className={`group relative flex items-center bg-[#161625] p-5 rounded-[2rem] border transition-all duration-300 ${
              index === 0 ? 'border-orange-500/40 bg-orange-600/5' : 'border-gray-800/50'
            }`}
          >
            <div className="w-8 text-center">
              <span className={`text-2xl font-black italic ${index === 0 ? 'text-orange-500' : 'text-gray-700'}`}>
                {index + 1}
              </span>
            </div>
            <div className="flex-1 ml-4">
              <h3 className="text-sm font-black text-white uppercase tracking-tight leading-tight">
                {player.first_name}
              </h3>
              <div className="flex gap-3 mt-0.5">
                <span className="text-[9px] font-bold text-gray-500 uppercase">W: <span className="text-green-500">{player.wins || 0}</span></span>
                <span className="text-[9px] font-bold text-gray-500 uppercase">L: <span className="text-red-500">{player.losses || 0}</span></span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-white leading-none">{player.points || 0}</div>
              <div className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Puntos</div>
            </div>
          </div>
        ))}
      </div>

      {/* Sección Últimas Partidas */}
      <div className="flex items-center gap-2 mb-6 px-2">
        <Clock className="text-orange-500 w-4 h-4" />
        <h2 className="text-white font-black italic uppercase tracking-tighter">Últimas Partidas</h2>
      </div>

      <div className="bg-[#161625]/40 border border-gray-800/30 rounded-[2.5rem] p-8 text-center">
        {recentMatches.length > 0 ? (
          <div className="space-y-4">
             {/* Mapeo de partidas aquí */}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 opacity-40">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center">
               <Clock size={20} className="text-gray-700" />
            </div>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Sin actividad reciente</span>
          </div>
        )}
      </div>
    </div>
  );
}
