import React, { useEffect, useState } from 'react';
import { Trophy, Users, Activity, Clock, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Icono personalizado de Raquetas de Ping Pong
const TableTennisIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="18" r="3" />
    <path d="M12 15V9" />
    <path d="M5.5 11a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Z" transform="rotate(-45 10 11)" />
    <path d="M9.5 11a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0Z" transform="rotate(45 14 11)" />
  </svg>
);

export function Home() {
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    const fetchData = async () => {
      // 1. Total de inscritos
      const { count } = await supabase.from('players').select('*', { count: 'exact', head: true });
      setTotalPlayers(count || 0);

      // 2. Filtro de fecha para partidas
      let query = supabase.from('matches').select(`*, p1:players!player1_id(first_name), p2:players!player2_id(first_name)`);
      
      if (dateFilter !== 'all') {
        const now = new Date();
        const days = dateFilter === 'week' ? 7 : 30;
        const filterDate = new Date(now.setDate(now.getDate() - days)).toISOString();
        query = query.gte('created_at', filterDate);
      }

      const { data: matches } = await query.order('created_at', { ascending: false }).limit(4);
      setRecentMatches(matches || []);

      // 3. Top 3 General
      const { data: players } = await supabase.from('players').select('*').order('wins', { ascending: false }).limit(3);
      setTopPlayers(players || []);
    };
    fetchData();
  }, [dateFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 px-4">
      
      {/* SELECTOR DE FILTRO */}
      <div className="flex bg-[#161625] p-1 rounded-2xl border border-gray-800">
        {(['all', 'week', 'month'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setDateFilter(filter)}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
              dateFilter === filter ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500'
            }`}
          >
            {filter === 'all' ? 'Todo' : filter === 'week' ? '7 Días' : '30 Días'}
          </button>
        ))}
      </div>

      {/* ESTADÍSTICAS RÁPIDAS */}
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
            <p className="text-lg font-black text-white italic text-orange-500">LIVE</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN TOP 3 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={16} className="text-orange-500" />
          <h2 className="text-xs font-black uppercase tracking-widest text-white">Podio de la Liga</h2>
        </div>
        <div className="bg-[#161625] border border-gray-800 rounded-[2rem] overflow-hidden">
          {topPlayers.map((player, index) => (
            <div key={player.id} className={`flex items-center justify-between p-5 ${index !== 2 ? 'border-b border-gray-800/50' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                  index === 0 ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-500'
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

      {/* ACTIVIDAD RECIENTE */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-orange-500" />
          <h2 className="text-xs font-black uppercase tracking-widest text-white">Actividad Reciente</h2>
        </div>
        <div className="space-y-3">
          {recentMatches.length > 0 ? (
            recentMatches.map((match) => (
              <div key={match.id} className="bg-gradient-to-r from-[#252538] to-[#1C1C2E] border border-gray-800 rounded-2xl p-4 flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase">{match.p1?.first_name}</span>
                    <span className="text-[10px] text-orange-500 font-black italic">VS</span>
                    <span className="text-xs font-bold text-white uppercase">{match.p2?.first_name}</span>
                  </div>
                  <span className="text-[9px] text-gray-600 font-medium">
                    {new Date(match.created_at).toLocaleDateString()}
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
              <p className="text-xs text-gray-500 font-bold uppercase">Sin actividad reciente</p>
            </div>
          )}
        </div>
      </section>

      {/* ICONO DE FONDO DECORATIVO */}
      <div className="fixed bottom-20 right-4 opacity-5 pointer-events-none">
        <TableTennisIcon className="w-32 h-32" />
      </div>
    </div>
  );
}
