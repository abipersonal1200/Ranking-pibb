import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Swords, Trophy, Calendar, History } from 'lucide-react';

export function MatchCenter() {
  const [activeTab, setActiveTab] = useState<'cartelera' | 'resultados'>('cartelera');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    // Traemos los partidos uniendo la info de los nombres de los jugadores
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        p1:player1_id (name, avatar_url),
        p2:player2_id (name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (data) setMatches(data);
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-600/20 p-2 rounded-lg">
          <Swords className="text-purple-500 w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">MATCH CENTER</h1>
      </div>

      {/* TABS DE NAVEGACIÓN */}
      <div className="flex bg-[#161625] p-1 rounded-xl mb-6">
        <button 
          onClick={() => setActiveTab('cartelera')}
          className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'cartelera' ? 'bg-[#252538] text-purple-500 shadow-lg' : 'text-gray-500'}`}
        >
          CARTELERA
        </button>
        <button 
          onClick={() => setActiveTab('resultados')}
          className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'resultados' ? 'bg-[#252538] text-purple-500 shadow-lg' : 'text-gray-500'}`}
        >
          ÚLTIMOS RESULTADOS
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'cartelera' ? (
            // VISTA DE PRÓXIMOS O DESTACADOS
            matches.length > 0 ? (
              <div className="bg-gradient-to-br from-indigo-900/40 to-[#1C1C2E] p-6 rounded-3xl border border-indigo-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-500 text-[10px] font-black px-4 py-1 rounded-bl-xl">PARTIDO DESTACADO</div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-center w-1/3">
                    <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full mb-2 border-2 border-purple-500 p-1">
                      <img src={matches[0].p1?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${matches[0].p1?.name}`} alt="" className="rounded-full" />
                    </div>
                    <p className="text-sm font-bold truncate">{matches[0].p1?.name}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-black italic text-indigo-400">VS</span>
                    <p className="text-[10px] text-gray-500 mt-2">{new Date(matches[0].created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-center w-1/3">
                    <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full mb-2 border-2 border-purple-500 p-1">
                      <img src={matches[0].p2?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${matches[0].p2?.name}`} alt="" className="rounded-full" />
                    </div>
                    <p className="text-sm font-bold truncate">{matches[0].p2?.name}</p>
                  </div>
                </div>
              </div>
            ) : <p className="text-center text-gray-500 py-10">No hay batallas programadas</p>
          ) : (
            // VISTA DE RESULTADOS REALES CON PUNTAJES
            matches.map((match) => (
              <div key={match.id} className="bg-[#161625] p-4 rounded-2xl border border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3 w-2/5">
                  <span className={`text-xs font-bold truncate ${match.winner_id === match.player1_id ? 'text-green-400' : 'text-white'}`}>
                    {match.p1?.name}
                  </span>
                </div>
                
                <div className="flex flex-col items-center bg-[#252538] px-4 py-2 rounded-xl border border-gray-700">
                  <span className="text-lg font-black tracking-tighter text-orange-500">
                    {match.score1} - {match.score2}
                  </span>
                  <History size={10} className="text-gray-600 mt-1" />
                </div>

                <div className="flex items-center gap-3 w-2/5 justify-end">
                  <span className={`text-xs font-bold truncate ${match.winner_id === match.player2_id ? 'text-green-400' : 'text-white'}`}>
                    {match.p2?.name}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
