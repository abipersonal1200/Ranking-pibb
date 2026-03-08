import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sword, ShieldCheck, Trophy, AlertCircle, Zap, Sparkles, User, Minus, Plus } from 'lucide-react';

export function MatchForm() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<any[]>([]);
  const [player1Id, setPlayer1Id] = useState(''); // Serás tú
  const [player2Id, setPlayer2Id] = useState(''); // Oponente
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [opponentPin, setOpponentPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPlayers();
  }, [user]);

  async function fetchPlayers() {
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('rank_position', { ascending: true });
    
    if (data) {
      setPlayers(data);
      // Auto-selección: Buscamos tu perfil por el auth_id
      const currentUser = data.find(p => p.auth_id === user?.id);
      if (currentUser) setPlayer1Id(currentUser.id);
    }
  }

  // --- LÓGICA DE VALIDACIÓN DE PUNTOS (Regla del 11 y Diferencia de 2) ---
  const validateScores = (s1: number, s2: number) => {
    const max = Math.max(s1, s2);
    const min = Math.min(s1, s2);
    const diff = max - min;

    if (max < 11) return "El ganador debe llegar al menos a 11 puntos.";
    if (max === 11 && diff < 2) return "Debe haber una diferencia de al menos 2 puntos (ej: 11-9).";
    if (max > 11 && diff !== 2) return "En muerte súbita (más de 11), la diferencia debe ser exactamente de 2 (ej: 13-11).";
    if (s1 === s2) return "No puede haber empate.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones Previas
    const scoreError = validateScores(score1, score2);
    if (scoreError) return setMessage({ type: 'error', text: scoreError });
    if (!player2Id) return setMessage({ type: 'error', text: 'Selecciona un oponente' });
    if (opponentPin.length < 4) return setMessage({ type: 'error', text: 'Ingresa el PIN de seguridad' });

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const opponent = players.find(p => p.id === player2Id);
      const challenger = players.find(p => p.id === player1Id);

      if (opponent.pin !== opponentPin) throw new Error('PIN incorrecto. Autorización denegada.');

      const isWinnerP1 = score1 > score2;
      const winner = isWinnerP1 ? challenger : opponent;
      const loser = isWinnerP1 ? opponent : challenger;
      
      const winnerListRank = players.findIndex(p => p.id === winner.id);
      const loserListRank = players.findIndex(p => p.id === loser.id);

      // Cálculo de Puntos
      let pointsGained = (winnerListRank > loserListRank) ? 25 : (Math.abs(winnerListRank - loserListRank) <= 2 ? 15 : 10);
      const isGoldenSet = (isWinnerP1 ? score2 : score1) === 0;
      if (isGoldenSet) pointsGained += 5;

      // 1. Guardar Match
      const { error: matchError } = await supabase.from('matches').insert([{ 
        winner_id: winner.id, loser_id: loser.id, 
        winner_score: Math.max(score1, score2), loser_score: Math.min(score1, score2),
        points_exchanged: pointsGained, is_golden_set: isGoldenSet
      }]);
      if (matchError) throw matchError;

      // 2. Lógica de Intercambio (The Ladder)
      let intercambio = false;
      if (winnerListRank > loserListRank && (winnerListRank - loserListRank) <= 3) {
        await supabase.from('players').update({ rank_position: loser.rank_position }).eq('id', winner.id);
        await supabase.from('players').update({ rank_position: winner.rank_position }).eq('id', loser.id);
        intercambio = true;
      }

      // 3. Update Stats
      await supabase.from('players').update({ points: (winner.points || 0) + pointsGained, wins: (winner.wins || 0) + 1 }).eq('id', winner.id);
      await supabase.from('players').update({ points: Math.max(0, (loser.points || 0) - 5), losses: (loser.losses || 0) + 1 }).eq('id', loser.id);

      setMessage({ type: 'success', text: `¡Victoria sellada! +${pointsGained} pts${intercambio ? ' e intercambio de puesto' : ''}.` });
      setScore1(0); setScore2(0); setOpponentPin('');
      fetchPlayers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const challenger = players.find(p => p.id === player1Id);

  return (
    <div className="p-6 bg-[#0F0F1A] min-h-screen pb-32 animate-in fade-in duration-700">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-orange-600 rounded-[1.5rem] shadow-[0_10px_20px_rgba(234,88,12,0.3)]">
          <Sword className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">Match Center</h1>
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mt-1 italic">Liga PIBB Oficial</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* RETADOR (TÚ) - BLOQUEADO VISUALMENTE */}
        <div className="space-y-3">
          <label className="text-[9px] font-black text-gray-600 uppercase ml-4 tracking-[0.2em] flex items-center gap-2">
            <User size={12} className="text-orange-500" /> Atleta Retador (Tú)
          </label>
          <div className="w-full bg-[#161625] border-2 border-orange-500/20 p-5 rounded-3xl flex items-center justify-between shadow-xl">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center font-black text-white">
                 #{challenger?.player_number || '00'}
               </div>
               <span className="font-black text-white uppercase italic">{challenger?.first_name || 'Cargando...'} {challenger?.last_name}</span>
             </div>
             <ShieldCheck size={18} className="text-orange-500 opacity-50" />
          </div>
        </div>

        {/* MARCADOR ESTILO ARCADE */}
        <div className="bg-[#161625] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative">
          <div className="flex items-center justify-center gap-8 z-10 relative">
            {/* Jugador 1 Score */}
            <div className="flex flex-col items-center gap-4">
              <button type="button" onClick={() => setScore1(s => Math.max(0, s + 1))} className="p-2 bg-gray-800 rounded-full text-white"><Plus size={16}/></button>
              <input type="number" value={score1} readOnly className="w-24 bg-transparent text-center text-6xl font-black text-white outline-none" />
              <button type="button" onClick={() => setScore1(s => Math.max(0, s - 1))} className="p-2 bg-gray-800 rounded-full text-white"><Minus size={16}/></button>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-600/10 rounded-full flex items-center justify-center border border-orange-500/20 animate-pulse">
                <Zap className="text-orange-500 fill-orange-500 w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-gray-700 mt-2 uppercase tracking-widest">VS</span>
            </div>

            {/* Jugador 2 Score */}
            <div className="flex flex-col items-center gap-4">
              <button type="button" onClick={() => setScore2(s => Math.max(0, s + 1))} className="p-2 bg-gray-800 rounded-full text-white"><Plus size={16}/></button>
              <input type="number" value={score2} readOnly className="w-24 bg-transparent text-center text-6xl font-black text-white outline-none" />
              <button type="button" onClick={() => setScore2(s => Math.max(0, s - 1))} className="p-2 bg-gray-800 rounded-full text-white"><Minus size={16}/></button>
            </div>
          </div>
        </div>

        {/* OPONENTE SELECTOR */}
        <div className="space-y-3">
          <label className="text-[9px] font-black text-gray-600 uppercase ml-4 tracking-[0.2em] flex items-center gap-2">
            <AlertCircle size={12} className="text-red-500" /> Seleccionar Oponente
          </label>
          <select 
            value={player2Id} onChange={(e) => setPlayer2Id(e.target.value)}
            className="w-full bg-[#161625] border border-gray-800 text-white p-5 rounded-3xl font-black outline-none focus:border-orange-500 appearance-none shadow-xl transition-all uppercase text-xs"
          >
            <option value="">Buscar en el Ranking...</option>
            {players.filter(p => p.id !== player1Id).map(p => (
              <option key={p.id} value={p.id}>{p.first_name} {p.last_name} (Pos: {p.rank_position})</option>
            ))}
          </select>
        </div>

        {/* PIN DE VALIDACIÓN */}
        <div className="bg-orange-600/5 border border-orange-600/10 p-8 rounded-[3rem] text-center">
          <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.4em] mb-4">Confirmación del Rival</p>
          <input 
            type="password" maxLength={4} placeholder="0000"
            value={opponentPin} onChange={(e) => setOpponentPin(e.target.value)}
            className="w-full bg-[#0F0F1A] border-2 border-gray-800 text-center text-white p-5 rounded-2xl font-mono text-4xl tracking-[0.5em] focus:border-orange-500 outline-none shadow-inner"
          />
        </div>

        {message.text && (
          <div className={`p-5 rounded-2xl text-[10px] font-black text-center uppercase border-2 animate-bounce ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
            {message.text}
          </div>
        )}

        <button 
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-7 rounded-[2.5rem] shadow-[0_20px_40px_rgba(234,88,12,0.4)] transition-all active:scale-95 disabled:opacity-50 uppercase text-xs tracking-[0.4em] flex items-center justify-center gap-3"
        >
          {loading ? 'Subiendo a la Nube...' : <><Sparkles size={18} /> Sellar Resultado</>}
        </button>
      </form>
    </div>
  );
}
