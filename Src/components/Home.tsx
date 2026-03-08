import React, { useEffect, useState } from 'react';
import { Trophy, Users, Activity, Clock, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Home() {
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    const fetchData = async () => {
      // 1. Obtener total de jugadores inscritos
      const { count } = await supabase.from('players').select('*', { count: 'exact', head: true });
      setTotalPlayers(count || 0);

      // 2. Configurar el rango de fecha para el Ranking y Noticias
      let query = supabase.from('matches').select(`*, p1:players!player1_id(first_name), p2:players!player2_id(first_name)`);
      
      if (dateFilter !== 'all') {
        const now = new Date();
        const days = dateFilter === 'week' ? 7 : 30;
        const filterDate = new Date(now.setDate(now.getDate() - days)).toISOString();
        query = query.gte('created_at', filterDate);
      }

      // 3. Obtener últimas 4 partidas según el filtro
      const { data: matches } = await query.order('created_at', { ascending: false }).limit(4);
      setRecentMatches(matches || []);

      // 4. Obtener Top 3 (siempre del ranking general para el podio)
      const { data: players } = await supabase.from('players').select('*').order('wins', { ascending: false }).limit(3);
      setTopPlayers(players || []);
    };
    fetchData();
  }, [dateFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      
      {/* SELECTOR DE FILTRO DE FECHA */}
      <div className="flex bg-[#161625] p-1 rounded-2xl border border-gray-800">
        {(['all', 'week', 'month'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setDateFilter(filter)}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
              dateFilter === filter ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {filter === 'all' ? 'Todo' : filter === 'week' ? '7 Días' : '30 Días'}
          </button>
        ))}
      </div>

      {/* 1. ESTADÍSTICAS RÁPIDAS */}
      <div className="flex gap-4">
        <div className="flex-1 bg-[#252538] border border-orange-500/10 rounded-3xl p-4 flex items-center gap-3">
          <div className="bg-orange-500/20 p-2 rounded-xl text-orange-500"><Users size={20} /></div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-black">Jugadores</p>
            <p className="text-lg font-black text-white">{totalPlayers}</p>
          </div>
        </div>
        <div className="flex-1 bg-[#252538] border border-orange-500/10 rounded-3xl p-4 flex items-center gap-3">
          <div className="bg-orange-500/20 p-2 rounded-xl text-orange-500"><Activity size={20} /></div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-black">Estado</p>
            <p className="text-lg font-black text-white">LIVE</p>
          </div>
        </div>
      </div>

      {/* 2. TOP 3 RANKING */}
      <section>
        <div className="flex items-center gap-2 mb-3 px-1">
          <Trophy size={16} className="text-orange-500" />
          <h2 className="text-xs font-black uppercase tracking-widest text-white">Podio de la Liga</h2>
        </div>
        <div className="bg-[#161625] border border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl">
          {topPlayers.map((player, index) => (
            <div key={player.id} className={`flex items-center justify-between p-5 ${index !== 2 ? 'border-b border-gray-800/50' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                  index === 0 ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/40' : 'bg-gray-800 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                <span className="text-sm font-bold text-white uppercase">{player.first_name}</span>
              </div>
              <span className="text-xs font-black text-orange-500">{player.wins}W</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ÚLTIMAS PARTIDAS (NEWS FEED) */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-orange-500" />
            <h2 className="text-xs font-black uppercase tracking-widest text-white">Actividad Reciente</h2>
          </div>
        </div>
        <div className="space-y-3">
          {recentMatches.length > 0 ? (
            recentMatches.map((match) => (
              <div key={match.id} className="bg-gradient-to-r from-[#252538] to-[#1C1C2E] border border-gray-800 rounded-2xl p-4 shadow-sm flex justify-between items-center transition-all active:scale-[0.97]">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase">{match.p1?.first_name}</span>
                    <span className="text-[10px] text-orange-500 font-black italic">VS</span>
                    <span className="text-xs font-bold text-white uppercase">{match.p2?.first_name}</span>
                  </div>
                  <span className="text-[9px] text-gray-600 font-medium">
                    {new Date(match.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="bg-orange-600/10 border border-orange-500/20 px-3 py-1.5 rounded-xl">
                  <span className="text-sm font-black text-orange-500">{match.score_p1} - {match.score_p2}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-[#161625] rounded-3xl border border-dashed border-gray-800">
              <Calendar className="mx-auto text-gray-700 mb-2" size={24} />
              <p className="text-xs text-gray-500 font-bold uppercase">Sin partidas en este periodo</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
