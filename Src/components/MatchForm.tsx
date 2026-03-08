import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Sword, ShieldCheck, Trophy, AlertCircle, Zap } from 'lucide-react';

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
    // Ordenamos por rank_position para que el intercambio sea visible
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
      
      // El "Rank" en la tabla es el índice (0 es el 1ero, 1 es el 2do...)
      const winnerListRank = isWinnerP1 ? p1Index : p2Index;
      const loserListRank = isWinnerP1 ? p2Index : p1Index;

      // 3. Cálculo de Puntos (Reglamento)
      let pointsGained = 0;
      const rankDiff = loserListRank - winnerListRank; // Negativo si el ganador estaba abajo

      if (winnerListRank > loserListRank) {
        pointsGained = 25; // Ganó a alguien superior (estaba en un índice mayor)
      } else if (Math.abs(rankDiff) <= 2) {
        pointsGained = 15; // Rival similar
      } else {
        pointsGained = 10; // Rival inferior
      }

      // Bono Golden Set (Blanqueada)
      const setsLostByWinner = isWinnerP1 ? score2 : score1;
      if (setsLostByWinner === 0 && (score1 > 0 || score2 > 0)) {
        pointsGained += 5;
      }

      // 4. LÓGICA DE INTERCAMBIO (The Ladder)
      // Si el ganador estaba abajo (índice mayor) y la diferencia es de 3 o menos
      let intercambioRealizado = false;
      if (winnerListRank > loserListRank && (winnerListRank - loserListRank) <= 3) {
        const winnerOldRankPos = winner.rank_position;
        const loserOldRankPos = loser.rank_position;

        await supabase.from('players').update({ rank_position: loserOldRankPos }).eq('id', winner.id);
        await supabase.from('players').update({ rank_position: winnerOldRankPos }).eq('id', loser.id);
        intercambioRealizado = true;
      }

      // 5. Actualizar Puntos y Estadísticas
      await supabase.from('players').update({ 
        points: (winner.points || 0) + pointsGained,
        wins: (winner.wins || 0) + 1 
      }).eq('id', winner.id);

      await supabase.from('players').update({ 
        points: Math.max(0, (loser.points || 0) - 5),
        losses: (loser.losses || 0) + 1 
      }).eq('id', loser.id);

      // 6. Finalizar
      setMessage({ 
        type: 'success', 
        text: `¡Resultado guardado! +${pointsGained} pts${intercambioRealizado ? ' e intercambio de puesto' : ''}.` 
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
    <div className="p-6 bg-[#0F0F1A] min-h-screen pb-24">
      <div className="flex items-center gap-2 mb-8">
        <div className="p-2 bg-orange-600 rounded-lg">
          <Sword className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-black italic uppercase text-white tracking-tighter">Registrar Batalla</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Retador (Tú)</label>
          <select 
            value={player1Id} onChange={(e) => setPlayer1Id(e.target.value)}
            className="w-full bg-[#161625] border border-gray-800 text-white p-4 rounded-2xl font-bold outline-none focus:border-orange-500 appearance-none shadow-inner"
          >
            <option value="">Selecciona tu nombre</option>
            {players.map(p => <option key={p.id} value={p.id}>{p.first_name} (#{p.number})</option>)}
          </select>
        </div>

        <div className="flex items-center justify-around gap-4 bg-[#161625] p-6 rounded-[2.5rem] border border-gray-800 shadow-xl">
          <div className="flex flex-col items-center gap-2">
            <input 
              type="number" value={score1} onChange={(e) => setScore1(Number(e.target.value))}
              className="w-16 bg-[#0F0F1A] border border-gray-700 text-center text-3xl font-black text-white p-3 rounded-xl focus:border-orange-500 outline-none"
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-orange-500 font-black italic text-xl">VS</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <input 
              type="number" value={score2} onChange={(e) => setScore2(Number(e.target.value))}
              className="w-16 bg-[#0F0F1A] border border-gray-700 text-center text-3xl font-black text-white p-3 rounded-xl focus:border-orange-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Oponente</label>
          <select 
            value={player2Id} onChange={(e) => setPlayer2Id(e.target.value)}
            className="w-full bg-[#161625] border border-gray-800 text-white p-4 rounded-2xl font-bold outline-none focus:border-orange-500 appearance-none shadow-inner"
          >
            <option value="">Selecciona al oponente</option>
            {players.map(p => <option key={p.id} value={p.id}>{p.first_name} (#{p.number})</option>)}
          </select>
        </div>

        <div className="bg-orange-600/5 border border-orange-600/20 p-6 rounded-[2rem] space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-orange-500 w-4 h-4" />
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Confirmación del Rival</p>
          </div>
          <input 
            type="password" maxLength={4} placeholder="PIN DE 4 DÍGITOS"
            value={opponentPin} onChange={(e) => setOpponentPin(e.target.value)}
            className="w-full bg-[#0F0F1A] border border-gray-800 text-center text-white p-4 rounded-2xl font-mono text-2xl tracking-[0.5em] focus:border-orange-500 outline-none placeholder:text-[10px] placeholder:tracking-normal placeholder:font-sans"
          />
        </div>

        {message.text && (
          <div className={`p-4 rounded-2xl text-[10px] font-black text-center uppercase border animate-bounce ${message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-green-500/10 border-green-500/30 text-green-500'}`}>
            {message.text}
          </div>
        )}

        <button 
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl shadow-[0_10px_30px_rgba(234,88,12,0.3)] transition-all active:scale-95 disabled:opacity-50 uppercase text-xs tracking-[0.2em]"
        >
          {loading ? 'Subiendo Resultado...' : 'Sellar Victoria'}
        </button>
      </form>
    </div>
  );
}
