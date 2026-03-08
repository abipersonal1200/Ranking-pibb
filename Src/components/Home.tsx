import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Users, Star, Clock, Activity, History } from 'lucide-react';

export function Home() {
  const [players, setPlayers] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    // 1. Cargar Ranking con AVATAR_URL incluido
    const { data: pData } = await supabase
      .from('players')
      .select('id, first_name, points, wins, losses, avatar_url, rank_position')
      .order('points', { ascending: false });

    // 2. Cargar Últimas Partidas trayendo AVATARES de ambos jugadores
    const { data: mData } = await supabase
      .from('matches')
      .select(`
        *,
        winner:winner_id(first_name, avatar_url),
        loser:loser_id(first_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(3);

    if (pData) setPlayers(pData);
    if (mData) setRecentMatches(mData);
    setLoading(false);
  }

  return (
    <div className="p-6 bg-[#0F0F1A] min-h-screen pb-24 animate-in fade-in duration-700">
      {/* Header - Identidad Liga PIBB */}
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

      {/* Stats Rápidas */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-[#161625] border border-gray-800/50 p-6 rounded-[2rem] flex flex-col items-center shadow-lg">
          <Users className="text-orange-500 mb-2 w-6 h-6" />
          <div className="text-3xl font-black text-white leading-none mb-1">{players.length}</div>
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center">Inscritos</div>
        </div>
        <div className="bg-[#161625] border border-gray-800/50 p-6 rounded-[2rem] flex flex-col items-center shadow-lg text-center">
          <Activity className="text-orange-500 mb-2 w-6 h-6 animate-pulse" />
          <div className="text-xl font-black text-orange-500 leading-none mb-1 tracking-tighter italic">LIVE</div>
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Torneo 2026</div>
        </div>
      </div>

      {/* RANKING GLOBAL CON AVATARES */}
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-white font-black italic uppercase tracking-tighter flex items-center gap-2 text-lg">
          <Star className="text-orange-500 w-4 h-4 fill-current" /> Ranking Global
        </h2>
        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Top Players</span>
      </div>

      <div className="space-y-4 mb-12">
        {players.slice(0, 5).map((player, index) => (
          <div 
            key={player.id}
            className={`group relative flex items-center bg-[#161625] p-4 rounded-[2rem] border transition-all duration-300 ${
              index === 0 ? 'border-orange-500/40 bg-orange-600/5 shadow-lg shadow-orange-500/5' : 'border-gray-800/50'
            }`}
          >
            {/* Posición */}
            <div className={`w-8 text-center font-black italic text-xl ${index === 0 ? 'text-orange-500' : 'text-gray-700'}`}>
              {index + 1}
            </div>

            {/* AVATAR DEL JUGADOR */}
            <div className="w-12 h-12 rounded-2xl bg-gray-800 border-2 border-gray-700 overflow-hidden ml-2 shadow-inner">
              <img 
                src={player.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.first_name}`} 
                className="w-full h-full object-cover"
                alt="Avatar"
              />
            </div>

            <div className="flex-1 ml-4">
              <h3 className="text-sm font-black text-white uppercase tracking-tight">
                {player.first_name}
              </h3>
              <div className="flex gap-3 mt-0.5">
                <span className="text-[8px] font-bold text-gray-500 uppercase">Wins: <span className="text-green-500">{player.wins || 0}</span></span>
                <span className="text-[8px] font-bold text-gray-500 uppercase">Loss: <span className="text-red-500">{player.losses || 0}</span></span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-black text-white leading-none">{player.points || 0}</div>
              <div className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Pts</div>
            </div>
          </div>
        ))}
      </div>

      {/* ÚLTIMAS PARTIDAS CON AVATARES */}
      <div className="flex items-center gap-2 mb-6 px-2">
        <Clock className="text-orange-500 w-4 h-4" />
        <h2 className="text-white font-black italic uppercase tracking-tighter text-lg">Últimas Partidas</h2>
      </div>

      <div className="bg-[#161625]/40 border border-gray-800/30 rounded-[2.5rem] p-6">
        {recentMatches.length > 0 ? (
          <div className="space-y-4">
            {recentMatches.map((match) => (
              <div key={match.id} className="flex items-center justify-between bg-[#161625] p-4 rounded-3xl border border-gray-800/50">
                {/* Ganador */}
                <div className="flex flex-col items-center w-2/5">
                  <div className="w-10 h-10 rounded-xl overflow-hidden mb-2 border border-green-500/30">
                    <img 
                      src={match.winner?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.winner?.first_name}`} 
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <span className="text-[9px] font-black text-green-400 uppercase truncate w-full text-center">
                    {match.winner?.first_name}
                  </span>
                </div>

                {/* Marcador Central */}
                <div className="flex flex-col items-center">
                  <div className="text-lg font-black text-white flex items-center gap-2">
                    <span className="text-green-400">{match.winner_score}</span>
                    <span className="text-gray-700 text-xs">-</span>
                    <span className="text-gray-400">{match.loser_score}</span>
                  </div>
                  <History size={10} className="text-gray-700 mt-1" />
                </div>

                {/* Perdedor */}
                <div className="flex flex-col items-center w-2/5">
                  <div className="w-10 h-10 rounded-xl overflow-hidden mb-2 border border-gray-800">
                    <img 
                      src={match.loser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.loser?.first_name}`} 
                      className="w-full h-full object-cover opacity-60"
                      alt=""
                    />
                  </div>
                  <span className="text-[9px] font-black text-gray-500 uppercase truncate w-full text-center">
                    {match.loser?.first_name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 opacity-30 py-6">
            <Clock size={24} className="text-gray-700" />
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Sin resultados hoy</span>
          </div>
        )}
      </div>
    </div>
  );
}
