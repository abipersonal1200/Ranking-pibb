import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Sword, ShieldCheck, Trophy, AlertCircle, Zap, Sparkles } from 'lucide-react';

export function MatchForm() {
  const [players, setPlayers] = useState<any[]>([]);
  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [opponentPin, setOpponentPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPlayers();
  }, []);

  async function fetchPlayers() {
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('rank_position', { ascending: true });
    if (data) setPlayers(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player1Id || !player2Id) return setMessage({ type: 'error', text: 'Selecciona ambos jugadores' });
    if (player1Id === player2Id) return setMessage({ type: 'error', text: 'No puedes jugar contra ti mismo' });
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Validar PIN del Oponente
      const opponent = players.find(p => p.id === player2Id);
      if (opponent.pin !== opponentPin) {
        throw new Error('PIN del oponente incorrecto. Autorización denegada.');
      }

      // 2. Identificar Ganador y Perdedor
      const p1Index = players.findIndex(p => p.id === player1Id);
      const p2Index = players.findIndex(p => p.id === player2Id);
      
      const isWinnerP1 = score1 > score2;
      const winner = isWinnerP1 ? players[p1Index] : players[p2Index];
      const loser = isWinnerP1 ? players[p2Index] : players[p1Index];
      
      const winnerListRank = isWinnerP1 ? p1Index : p2Index;
      const loserListRank = isWinnerP1 ? p2Index : p1Index;

      // 3. Cálculo de Puntos (Reglamento PIBB)
      let pointsGained = 0;
      const rankDiff = loserListRank - winnerListRank; 

      if (winnerListRank > loserListRank) {
        pointsGained = 25; // Ganó a alguien superior
      } else if (Math.abs(rankDiff) <= 2) {
        pointsGained = 15; // Rival similar
      } else {
        pointsGained = 10; // Rival inferior
      }

      // Bono Golden Set (+5 pts)
      const setsLostByWinner = isWinnerP1 ? score2 : score1;
      const isGoldenSet = setsLostByWinner === 0 && (score1 > 0 || score2 > 0);
      if (isGoldenSet) {
        pointsGained += 5;
      }

      // 4. GUARDAR EN LA TABLA MATCHES (Para que se vea en el Historial)
      const { error: matchError } = await supabase
        .from('matches')
        .insert([{ 
          winner_id: winner.id, 
          loser_id: loser.id, 
          winner_score: isWinnerP1 ? score1 : score2, 
          loser_score: isWinnerP1 ? score2 : score1,
          points_exchanged: pointsGained,
          is_golden_set: isGoldenSet
        }]);

      if (matchError) throw matchError;

      // 5. LÓGICA DE INTERCAMBIO (The Ladder)
      let intercambioRealizado = false;
      if (winnerListRank > loserListRank && (winnerListRank - loserListRank) <= 3) {
        const winnerOldRankPos = winner.rank_position;
        const loserOldRankPos = loser.rank_position;

        await supabase.from('players').update({ rank_position: loserOldRankPos }).eq('id', winner.id);
        await supabase.from('players').update({ rank_position: winnerOldRankPos }).eq('id', loser.id);
        intercambioRealizado = true;
      }

      // 6. Actualizar Puntos y Estadísticas en la tabla Players
      await supabase.from('players').update({ 
        points: (winner.points || 0) + pointsGained,
        wins: (winner.wins || 0) + 1 
      }).eq('id', winner.id);

      await supabase.from('players').update({ 
        points: Math.max(0, (loser.points || 0) - 5),
        losses: (loser.losses || 0) + 1 
      }).eq('id', loser.id);

      // 7. Finalizar
      setMessage({ 
        type: 'success', 
        text: `¡Victoria sellada! +${pointsGained} pts${intercambioRealizado ? ' e intercambio de puesto' : ''}.` 
      });
      
      setScore1(0); setScore2(0); setOpponentPin('');
      fetchPlayers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#0F0F1A] min-h-screen pb-24 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-600/20">
          <Sword className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none">Registrar Batalla</h1>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">Sella tu resultado oficial</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest flex items-center gap-1">
            <Trophy size={10} className="text-orange-500" /> Retador (Tú)
          </label>
          <select 
            value={player1Id} onChange={(e) => setPlayer1Id(e.target.value)}
            className="w-full bg-[#161625] border border-gray-800 text-white p-4 rounded-2xl font-bold outline-none focus:border-orange-500 appearance-none shadow-xl transition-all"
          >
            <option value="">Selecciona tu nombre</option>
            {players.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} (#{p.player_number || p.rank_position})</option>)}
          </select>
        </div>

        <div className="flex items-center justify-around gap-4 bg-[#161625] p-8 rounded-[3rem] border border-gray-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none"></div>
          <div className="flex flex-col items-center gap-2 z-10">
            <input 
              type="number" value={score1} onChange={(e) => setScore1(Number(e.target.value))}
              className="w-20 bg-[#0F0F1A] border border-gray-700 text-center text-4xl font-black text-white p-4 rounded-2xl focus:border-orange-500 outline-none shadow-inner"
            />
          </div>
          <div className="flex flex-col items-center z-10">
            <Zap className="text-orange-500 fill-orange-500 w-6 h-6 animate-pulse" />
            <span className="text-gray-700 font-black italic text-xs mt-1">VS</span>
          </div>
          <div className="flex flex-col items-center gap-2 z-10">
            <input 
              type="number" value={score2} onChange={(e) => setScore2(Number(e.target.value))}
              className="w-20 bg-[#0F0F1A] border border-gray-700 text-center text-4xl font-black text-white p-4 rounded-2xl focus:border-orange-500 outline-none shadow-inner"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest flex items-center gap-1">
            <AlertCircle size={10} /> Oponente
          </label>
          <select 
            value={player2Id} onChange={(e) => setPlayer2Id(e.target.value)}
            className="w-full bg-[#161625] border border-gray-800 text-white p-4 rounded-2xl font-bold outline-none focus:border-orange-500 appearance-none shadow-xl transition-all"
          >
            <option value="">Selecciona al oponente</option>
            {players.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} (#{p.player_number || p.rank_position})</option>)}
          </select>
        </div>

        <div className="bg-orange-600/5 border border-orange-600/20 p-6 rounded-[2.5rem] space-y-4">
          <div className="flex items-center gap-2 justify-center">
            <ShieldCheck className="text-orange-500 w-4 h-4" />
            <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em]">Validación del Oponente</p>
          </div>
          <input 
            type="password" maxLength={4} placeholder="PIN"
            value={opponentPin} onChange={(e) => setOpponentPin(e.target.value)}
            className="w-full bg-[#0F0F1A] border border-gray-800 text-center text-white p-5 rounded-2xl font-mono text-3xl tracking-[0.6em] focus:border-orange-500 outline-none shadow-inner placeholder:text-[10px] placeholder:tracking-widest placeholder:font-sans placeholder:text-gray-700"
          />
        </div>

        {message.text && (
          <div className={`p-4 rounded-2xl text-[10px] font-black text-center uppercase border shadow-lg ${message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-green-500/10 border-green-500/30 text-green-500'}`}>
            {message.text}
          </div>
        )}

        <button 
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-6 rounded-[2rem] shadow-[0_15px_40px_rgba(234,88,12,0.3)] transition-all active:scale-95 disabled:opacity-50 uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-2"
        >
          {loading ? 'Sincronizando...' : (
            <>
              <Sparkles size={16} />
              Sellar Victoria
            </>
          )}
        </button>
      </form>
    </div>
  );
}
