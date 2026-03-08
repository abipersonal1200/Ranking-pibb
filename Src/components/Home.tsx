import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Users, Zap, Star, ArrowUpRight } from 'lucide-react';

export function Home() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  async function fetchRanking() {
    // ORDEN CLAVE: Por rank_position para el sistema Ladder
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('rank_position', { ascending: true });

    if (!error && data) {
      setPlayers(data);
    }
    setLoading(false);
  }

  return (
    <div className="p-6 bg-[#0F0F1A] min-h-screen pb-24 animate-in fade-in duration-500">
      {/* Header Principal */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 to-orange-800 rounded-[2.5rem] p-8 mb-8 shadow-[0_20px_40px_rgba(234,88,12,0.3)]">
        <div className="relative z-10">
          <h1 className="text-4xl font-black italic text-white tracking-tighter leading-none mb-2">
            LIGA PIBB
          </h1>
          <p className="text-orange-100 text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">
            Official Ping Pong Ranking
          </p>
        </div>
        <Trophy className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-white/10 -rotate-12" />
      </div>

      {/* Stats Rápidas */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#161625] border border-gray-800 p-5 rounded-3xl">
          <Users className="text-orange-500 mb-2 w-5 h-5" />
          <div className="text-2xl font-black text-white">{players.length}</div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Jugadores</div>
        </div>
        <div className="bg-[#161625] border border-gray-800 p-5 rounded-3xl">
          <Zap className="text-yellow-500 mb-2 w-5 h-5" />
          <div className="text-2xl font-black text-white">
            {players.reduce((acc, p) => acc + (p.wins || 0) + (p.losses || 0), 0)}
          </div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Partidos</div>
        </div>
      </div>

      {/* Título del Ranking */}
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-white font-black italic uppercase tracking-tighter flex items-center gap-2">
          <Star className="text-orange-500 w-4 h-4 fill-current" /> Ranking Global
        </h2>
        <span className="text-[10px] font-bold text-gray-500 uppercase">Temporada 2026</span>
      </div>

      {/* Lista de Jugadores (The Ladder) */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-gray-600 font-bold uppercase text-xs animate-pulse">
            Cargando Escalera...
          </div>
        ) : (
          players.map((player, index) => (
            <div 
              key={player.id}
              className={`relative flex items-center bg-[#161625] p-4 rounded-2xl border transition-all ${
                index === 0 ? 'border-orange-500/50 bg-orange-500/5' : 'border-gray-800'
              }`}
            >
              {/* Posición */}
              <div className="w-10 flex flex-col items-center">
                <span className={`text-xl font-black italic ${
                  index === 0 ? 'text-orange-500' : index < 3 ? 'text-white' : 'text-gray-700'
                }`}>
                  {index + 1}
                </span>
                {index === 0 && <Trophy className="w-3 h-3 text-orange-500 mt-1" />}
              </div>

              {/* Info Jugador */}
              <div className="flex-1 ml-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">
                    {player.first_name}
                  </h3>
                  <span className="text-[9px] font-bold text-gray-600 bg-gray-900 px-2 py-0.5 rounded-full border border-gray-800">
                    #{player.number}
                  </span>
                </div>
                <div className="flex gap-3 mt-1">
                  <span className="text-[9px] font-bold text-gray-500 uppercase">
                    W: <span className="text-green-500">{player.wins || 0}</span>
                  </span>
                  <span className="text-[9px] font-bold text-gray-500 uppercase">
                    L: <span className="text-red-500">{player.losses || 0}</span>
                  </span>
                </div>
              </div>

              {/* Puntos */}
              <div className="text-right">
                <div className="text-lg font-black text-white leading-none">
                  {player.points || 0}
                </div>
                <div className="text-[8px] font-bold text-orange-500 uppercase tracking-widest">
                  Puntos
                </div>
              </div>

              {/* Indicador visual de Top 1 */}
              {index === 0 && (
                <div className="absolute top-[-5px] right-[-5px]">
                  <ArrowUpRight className="text-orange-500 w-5 h-5 drop-shadow-[0_0_8px_rgba(234,88,12,0.8)]" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
