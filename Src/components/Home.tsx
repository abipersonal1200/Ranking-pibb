import React, { useEffect, useState } from 'react';
import { Trophy, Users, Activity, Clock, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Icono local para evitar errores de importación en Vercel
const PingPongIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
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
      const { count } = await supabase.from('players').select('*', { count: 'exact', head: true });
      setTotalPlayers(count || 0);

      let query = supabase.from('matches').select(`
        id, created_at, score_p1, score_p2,
        p1:players!player1_id(first_name),
        p2:players!player2_id(first_name)
      `);
      
      if (dateFilter !== 'all') {
        const now = new Date();
        const days = dateFilter === 'week' ? 7 : 30;
        const filterDate = new Date(now.setDate(now.getDate() - days)).toISOString();
        query = query.gte('created_at', filterDate);
      }

      const { data: matches } = await query.order('created_at', { ascending: false }).limit(4);
      setRecentMatches(matches || []);

      const { data: players } = await supabase.from('players').select('*').order('wins', { ascending: false }).limit(3);
      setTopPlayers(players || []);
    };
    fetchData();
  }, [dateFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 px-2">
      {/* FILTROS */}
      <div className="flex bg-[#161625] p-1 rounded-2xl border border-gray-800">
        {(['all', 'week', 'month'] as const).map((f) => (
          <button key={f} onClick={() => setDateFilter(f)} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${dateFilter === f ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500'}`}>
            {f === 'all' ? 'Todo' : f === 'week' ? '7 Días' : '30 Días'}
          </button>
        ))}
      </div>

      {/* STATS */}
      <div className="flex gap-4">
        <div className="flex-1 bg-[#252538] border border-orange-500/10 rounded-3xl p-4 flex items-center gap-3">
          <Users size={20} className="text-orange-500" />
          <div><p className="text-[9px] text-gray-500 font-black">PLAYERS</p><p className="text-lg font-black text-white">{totalPlayers}</p></div>
        </div>
        <div className="flex-1 bg-[#252538] border border-orange-500/10 rounded-3xl p-4 flex items-center gap-3">
          <Activity size={20} className="text-orange-500" />
          <div><p className="text-[9px] text-gray-500 font-black">STATUS</p><p className="text-lg font-black text-orange-500">LIVE</p></div>
        </div>
      </div>

      {/* TOP 3 */}
      <section>
        <h2 className="text-xs font-black uppercase text-white mb-3 flex items-center gap-2 px-1">
          <Trophy size={14} className="text-orange-500" /> Ranking Global
        </h2>
        <div className="bg-[#161625] border border-gray-800 rounded-3xl overflow-hidden">
          {topPlayers.map((p, i) => (
            <div key={p.id} className={`flex items-center justify-between p-4 ${i !== 2 ? 'border-b border-gray-800/50' : ''}`}>
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-500'}`}>{i+1}</span>
                <span className="text-sm font-bold text-white uppercase">{p.first_name}</span>
              </div>
              <span className="text-xs font-black text-orange-500">{p.wins}W</span>
            </div>
          ))}
        </div>
      </section>

      {/* ACTIVIDAD */}
      <section>
        <h2 className="text-xs font-black uppercase text-white mb-3 flex items-center gap-2 px-1">
          <Clock size={14} className="text-orange-500" /> Últimas Partidas
        </h2>
        <div className="space-y-3">
          {recentMatches.length > 0 ? (
            recentMatches.map((m) => (
              <div key={m.id} className="bg-[#252538] border border-gray-800 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
                    {m.p1?.first_name} <span className="text-orange-500 italic text-[10px]">VS</span> {m.p2?.first_name}
                  </div>
                  <span className="text-[9px] text-gray-600 font-bold">{new Date(m.created_at).toLocaleDateString()}</span>
                </div>
                <div className="bg-orange-600/10 px-3 py-1 rounded-xl border border-orange-500/20 text-sm font-black text-orange-500">
                  {m.score_p1} - {m.score_p2}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-[#161625] rounded-3xl border border-dashed border-gray-800">
              <Calendar size={20} className="mx-auto text-gray-700 mb-2" />
              <p className="text-[10px] text-gray-500 font-black uppercase">Sin actividad</p>
            </div>
          )}
        </div>
      </section>
      <div className="fixed bottom-24 right-6 opacity-5 pointer-events-none"><PingPongIcon className="w-24 h-24" /></div>
    </div>
  );
}
      
