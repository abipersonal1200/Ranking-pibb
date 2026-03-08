import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Swords, Trophy, Calendar, History, Star, Activity } from 'lucide-react';

export function MatchCenter() {
  const [activeTab, setActiveTab] = useState<'cartelera' | 'resultados'>('cartelera');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [activeTab]); // Refrescar al cambiar de pestaña para asegurar datos frescos

  const fetchMatches = async () => {
    setLoading(true);
    // IMPORTANTE: Mantenemos tu lógica de winner_id y loser_id pero trayendo el avatar_url
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        p1:winner_id (first_name, last_name, avatar_url),
        p2:loser_id (first_name, last_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (data) setMatches(data);
    setLoading(false);
  };

  // Función de respaldo para el avatar si falla la URL
  const getAvatar = (player: any) => 
    player?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player?.first_name || 'Player'}`;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* HEADER CON IDENTIDAD PIBB */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-orange-600 p-3 rounded-2xl shadow-lg shadow-orange-600/20">
            <Swords className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Match Center</h1>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1">Circuito Oficial 2026</p>
          </div>
        </div>

        {/* SELECTOR DE PESTAÑAS MEJORADO */}
        <div className="flex bg-[#161625] p-1.5 rounded-2xl border border-gray-800 self-start md:self-center">
          <button 
            onClick={() => setActiveTab('cartelera')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${activeTab === 'cartelera' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Cartelera
          </button>
          <button 
            onClick={() => setActiveTab('resultados')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${activeTab === 'resultados' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Resultados
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600 font-bold text-[10px] uppercase tracking-widest">Sincronizando Batallas...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'cartelera' ? (
            matches.length > 0 ? (
              <div className="relative bg-gradient-to-br from-[#1c1c2e] to-[#0F0F1A] p-8 rounded-[3rem] border border-orange-500/20 shadow-2xl overflow-hidden group">
                {/* Badge de Partido Destacado */}
                <div className="absolute top-0 right-0 bg-orange-600 text-[10px] font-black px-6 py-2 rounded-bl-[1.5rem] italic shadow-lg">
                  SIGUIENTE DUELO
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mt-4 relative z-10">
                  {/* JUGADOR 1 */}
                  <div className="flex flex-col items-center w-full md:w-1/3">
                    <div className="relative mb-4">
                      <div className="w-24 h-24 bg-gray-800 rounded-[2rem] border-4 border-gray-700 overflow-hidden shadow-2xl group-hover:border-orange-500/50 transition-all">
                        <img src={getAvatar(matches[0].p1)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-[#252538] border border-gray-700 rounded-lg px-2 py-1 text-[8px] font-black text-orange-500 uppercase tracking-widest">Atleta 1</div>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter text-center">
                      {matches[0].p1?.first_name}
                    </h3>
                  </div>

                  {/* VS CENTRAL */}
                  <div className="flex flex-col items-center">
                    <div className="bg-orange-600/10 p-4 rounded-full mb-2">
                      <span className="text-4xl font-black italic text-orange-500 tracking-tighter">VS</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{new Date(matches[0].created_at).toLocaleDateString()}</span>
                      <Activity className="text-orange-600/40 w-4 h-4 mt-2 animate-pulse" />
                    </div>
                  </div>

                  {/* JUGADOR 2 */}
                  <div className="flex flex-col items-center w-full md:w-1/3">
                    <div className="relative mb-4">
                      <div className="w-24 h-24 bg-gray-800 rounded-[2rem] border-4 border-gray-700 overflow-hidden shadow-2xl group-hover:border-orange-500/50 transition-all">
                        <img src={getAvatar(matches[0].p2)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-2 -left-2 bg-[#252538] border border-gray-700 rounded-lg px-2 py-1 text-[8px] font-black text-orange-500 uppercase tracking-widest">Atleta 2</div>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter text-center">
                      {matches[0].p2?.first_name}
                    </h3>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-[#161625] rounded-[2.5rem] border-2 border-dashed border-gray-800">
                <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">No hay batallas programadas en cartelera</p>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {matches.map((match) => (
                <div key={match.id} className="bg-[#161625] p-5 rounded-[2rem] border border-gray-800/50 flex items-center justify-between hover:border-orange-500/30 transition-all group">
                  {/* GANADOR */}
                  <div className="flex items-center gap-4 w-[40%]">
                    <div className="w-12 h-12 bg-gray-800 rounded-2xl border border-green-500/20 overflow-hidden shadow-inner hidden sm:block">
                      <img src={getAvatar(match.p1)} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-green-500 uppercase tracking-[0.2em] mb-0.5">Winner</span>
                      <span className="text-sm font-black text-white uppercase truncate">{match.p1?.first_name}</span>
                    </div>
                  </div>
                  
                  {/* SCORE CENTRAL */}
                  <div className="flex flex-col items-center bg-[#0F0F1A] px-5 py-2 rounded-2xl border border-gray-800 shadow-inner min-w-[80px]">
                    <div className="text-lg font-black tracking-tighter flex items-center gap-2">
                      <span className="text-green-500">{match.winner_score}</span>
                      <span className="text-gray-700">-</span>
                      <span className="text-gray-500">{match.loser_score}</span>
                    </div>
                    <History size={10} className="text-gray-700 mt-1" />
                  </div>

                  {/* PERDEDOR */}
                  <div className="flex items-center gap-4 w-[40%] justify-end text-right">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-0.5">Runner-up</span>
                      <span className="text-sm font-black text-gray-400 uppercase truncate">{match.p2?.first_name}</span>
                    </div>
                    <div className="w-12 h-12 bg-gray-800 rounded-2xl border border-gray-800 overflow-hidden shadow-inner hidden sm:block opacity-40 group-hover:opacity-100 transition-opacity">
                      <img src={getAvatar(match.p2)} className="w-full h-full object-cover grayscale" alt="" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
