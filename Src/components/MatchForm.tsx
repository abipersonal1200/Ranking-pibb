import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Sword, ShieldCheck, Trophy, AlertCircle } from 'lucide-react';

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
    // Obtenemos los jugadores ordenados por puntos (ranking)
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('points', { ascending: false });
    if (data) setPlayers(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (player1Id === player2Id) return setMessage({ type: 'error', text: 'No puedes jugar contra ti mismo' });
    
    setLoading(true);
    try {
      // 1. Validar PIN del Oponente
      const opponent = players.find(p => p.id === player2Id);
      if (opponent.pin !== opponentPin) {
        throw new Error('PIN del oponente incorrecto. Autorización denegada.');
      }

      // 2. Calcular Rango (Posición en la lista)
      const p1Index = players.findIndex(p => p.id === player1Id);
      const p2Index = players.findIndex(p => p.id === player2Id);
      
      // 3. Lógica de Puntos según Reglamento
      let pointsGained = 0;
      const isWinnerP1 = score1 > score2;
      const winner = isWinnerP1 ? players[p1Index] : players[p2Index];
      const loser = isWinnerP1 ? players[p2Index] : players[p1Index];
      const winnerRank = isWinnerP1 ? p1Index : p2Index;
      const loserRank = isWinnerP1 ? p2Index : p1Index;

      // Cálculo por nivel de rival
      if (winnerRank > loserRank) pointsGained = 25; // Ganó a alguien superior
      else if (Math.abs(winnerRank - loserRank) <= 2) pointsGained = 15; // Rival similar
      else pointsGained = 10; // Rival inferior

      // Bono Golden Set (5-0 o similar sin perder sets)
      if ((isWinnerP1 && score2 === 0) || (!isWinnerP1 && score1 === 0)) {
        pointsGained += 5;
      }

      // 4. Actualizar Base de Datos
      // Sumar puntos al ganador
      await supabase.from('players').update({ 
        points: winner.points + pointsGained,
        wins: winner.wins + 1 
      }).eq('id', winner.id);

      // Restar puntos al perdedor (-5 pts)
      await supabase.from('players').update({ 
        points: Math.max(0, loser.points - 5),
        losses: loser.losses + 1 
      }).eq('id', loser.id);

      setMessage({ type: 'success', text: `¡Resultado guardado! Ganador suma +${pointsGained} pts.` });
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
        <Sword className="text-orange-500 w-6 h-6" />
        <h1 className="text-xl font-black italic uppercase text-white">Registrar Batalla</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Jugador 1 (Tú) */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase ml-2">Tú (Jugador 1)</label>
          <select 
            value={player1Id} 
            onChange={(e) => setPlayer1Id(e.target.value)}
            className="w-full bg-[#161625] border border-gray-800 text-white p-4 rounded-2xl font-bold outline-none focus:border-orange-500"
          >
            <option value="">Selecciona tu nombre</option>
            {players.map(p => <option key={p.id} value={p.id}>{p.first_name} (#{p.number})</option>)}
          </select>
        </div>

        <div className="flex items-center justify-between gap-4">
          <input 
            type="number" value={score1} onChange={(e) => setScore1(Number(e.target.value))}
            className="w-20 bg-[#161625] border border-gray-800 text-center text-3xl font-black text-white p-4 rounded-2xl"
          />
          <span className="text-orange-500 font-black italic text-2xl">VS</span>
          <input 
            type="number" value={score2} onChange={(e) => setScore2(Number(e.target.value))}
            className="w-20 bg-[#161625] border border-gray-800 text-center text-3xl font-black text-white p-4 rounded-2xl"
          />
        </div>

        {/* Jugador 2 (Oponente) */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase ml-2">Oponente (Jugador 2)</label>
          <select 
            value={player2Id} 
            onChange={(e) => setPlayer2Id(e.target.value)}
            className="w-full bg-[#161625] border border-gray-800 text-white p-4 rounded-2xl font-bold outline-none focus:border-orange-500"
          >
            <option value="">Selecciona al oponente</option>
            {players.map(p => <option key={p.id} value={p.id}>{p.first_name} (#{p.number})</option>)}
          </select>
        </div>

        {/* Validación con PIN */}
        <div className="bg-orange-600/5 border border-orange-600/20 p-6 rounded-[2rem] space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-orange-500 w-4 h-4" />
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Autorización Requerida</p>
          </div>
          <input 
            type="password" maxLength={4} placeholder="PIN DE 4 DÍGITOS DEL OPONENTE"
            value={opponentPin} onChange={(e) => setOpponentPin(e.target.value)}
            className="w-full bg-[#0F0F1A] border border-gray-800 text-center text-white p-4 rounded-xl font-mono text-xl tracking-[1em] focus:border-orange-500 outline-none"
          />
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl text-[10px] font-bold text-center uppercase border ${message.type === 'error' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-green-500/10 border-green-500 text-green-500'}`}>
            {message.text}
          </div>
        )}

        <button 
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50 uppercase text-xs tracking-widest"
        >
          {loading ? 'Procesando...' : 'Confirmar Resultado'}
        </button>
      </form>
    </div>
  );
}
