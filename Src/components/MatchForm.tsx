import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sword, ShieldCheck, Trophy, AlertCircle, Zap, Sparkles, User, Minus, Plus } from 'lucide-react';

export function MatchForm() {
  const { user } = useAuth();
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
  }, [user]);

  async function fetchPlayers() {
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('rank_position', { ascending: true });
    
    if (data) {
      setPlayers(data);
      const currentUser = data.find(p => p.auth_id === user?.id);
      if (currentUser) setPlayer1Id(currentUser.id);
    }
  }

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
    
    const scoreError = validateScores(score1, score2);
    if (scoreError) return setMessage({ type: 'error', text: scoreError });
    if (!player2Id) return setMessage({ type: 'error', text: 'Selecciona un oponente' });
    if (opponentPin.length < 4) return setMessage({ type: 'error', text: 'Ingresa el PIN de seguridad' });

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const opponent = players.find(p => p.id === player2Id);
      const challenger = players.find(p => p.id === player1Id);

      if (!challenger || !opponent) throw new Error("Error al identificar a los jugadores.");

      const isWinnerP1 = score1 > score2;
      const pinToValidate = isWinnerP1 ? opponent.pin : challenger.pin;

      if (opponentPin !== pinToValidate) {
        throw new Error(isWinnerP1 
          ? 'PIN del oponente incorrecto. Autorización denegada.' 
          : 'Tu PIN es incorrecto. Debes autorizar tu propia derrota.');
      }

      const winner = isWinnerP1 ? challenger : opponent;
      const loser = isWinnerP1 ? opponent : challenger;
      
      const winnerPos = winner.rank_position;
      const loserPos = loser.rank_position;

      // --- CÁLCULO DE PUNTOS SEGÚN REGLAMENTO (IMÁGENES) ---
      let pointsGained = 0;
      let loserPenalty = 5; 

      if (winnerPos > loserPos) {
        pointsGained = 25; 
      } else if (Math.abs(winnerPos - loserPos) <= 2) {
        pointsGained = 15; 
      } else {
        pointsGained = 10; 
      }

      const isGoldenSet = (isWinnerP1 ? score2 : score1) === 0;
      if (isGoldenSet) pointsGained += 5; 

      if (loserPos <= 3 && (winnerPos - loserPos) >= 10) {
        loserPenalty = 15; 
      }

      const now = new Date().toISOString();

      // 1. Guardar Match
      const { error: matchError } = await supabase.from('matches').insert([{ 
        winner_id: winner.id, 
        loser_id: loser.id, 
        winner_score: Math.max(score1, score2), 
        loser_score: Math.min(score1, score2),
        points_exchanged: pointsGained, 
        is_golden_set: isGoldenSet
      }]);
      if (matchError) throw new Error("Error al guardar el registro.");

      // 2. Actualizar Ganador (Resetea inactividad con last_match_at)
      const { error: winUpdateError } = await supabase
        .from('players')
        .update({ 
          points: (winner.points || 0) + pointsGained, 
          wins: (winner.wins || 0) + 1,
          last_match_at: now
        })
        .eq('id', winner.id);
      if (winUpdateError) throw new Error("Error al actualizar puntos del ganador.");

      // 3. Actualizar Perdedor (Resetea inactividad con last_match_at)
      const { error: loseUpdateError } = await supabase
        .from('players')
        .update({ 
          points: Math.max(0, (loser.points || 0) - loserPenalty), 
          losses: (loser.losses || 0) + 1,
          last_match_at: now
        })
        .eq('id', loser.id);
      if (loseUpdateError) throw new Error("Error al actualizar puntos del perdedor.");

      // 4. Lógica de Intercambio (The Ladder)
      if (winnerPos > loserPos && (winnerPos - loserPos) <= 3) {
        await supabase.from('players').update({ rank_position: loserPos }).eq('id', winner.id);
        await supabase.from('players').update({ rank_position: winnerPos }).eq('id', loser.id);
      }

      setMessage({ 
        type: 'success', 
        text: isWinnerP1 ? `¡Victoria sellada! +${pointsGained} pts.` : `Derrota registrada. -${loserPenalty} pts.`
      });
      
      setScore1(0); setScore2(0); setOpponentPin('');
      await fetchPlayers();
      
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

        <div className="bg-[#161625] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative">
          <div className="flex items-center justify-center gap-8 z-10 relative">
            <div className="flex flex-col items-center gap-4">
              <button type="button" onClick={() => setScore1(s => s + 1)} className="p-2 bg-gray-800 rounded-full text-white active:scale-90 transition-all"><Plus size={16}/></button>
              <input type="number" value={score1} readOnly className="w-24 bg-transparent text-center text-6xl font-black text-white outline-none" />
              <button type="button" onClick={() => setScore1(s => Math.max(0, s - 1))} className="p-2 bg-gray-800 rounded-full text-white active:scale-90 transition-all"><Minus size={16}/></button>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${score1 > score2 ? 'bg-orange-600 border-orange-400' : 'bg-gray-800 border-gray-700'}`}>
                <Zap className={`w-5 h-5 ${score1 > score2 ? 'text-white fill-white' : 'text-gray-600'}`} />
              </div>
              <span className="text-[10px] font-black text-gray-700 mt-2 uppercase tracking-widest">VS</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <button type="button" onClick={() => setScore2(s => s + 1)} className="p-2 bg-gray-800 rounded-full text-white active:scale-90 transition-all"><Plus size={16}/></button>
              <input type="number" value={score2} readOnly className="w-24 bg-transparent text-center text-6xl font-black text-white outline-none" />
              <button type="button" onClick={() => setScore2(s => Math.max(0, s - 1))} className="p-2 bg-gray-800 rounded-full text-white active:scale-90 transition-all"><Minus size={16}/></button>
            </div>
          </div>
        </div>

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

        <div className="bg-orange-600/5 border border-orange-600/10 p-8 rounded-[3rem] text-center">
          <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.4em] mb-4 italic">
            {score1 > score2 ? 'Confirmación del Rival (PIN de él)' : 'Confirmación de Derrota (Tu PIN)'}
          </p>
          <input 
            type="password" maxLength={4} placeholder="PIN"
            value={opponentPin} onChange={(e) => setOpponentPin(e.target.value)}
            className="w-full bg-[#0F0F1A] border-2 border-gray-800 text-center text-white p-5 rounded-2xl font-mono text-4xl tracking-[0.5em] focus:border-orange-500 outline-none shadow-inner"
          />
        </div>

        {message.text && (
          <div className={`p-5 rounded-2xl text-[10px] font-black text-center uppercase border-2 animate-in zoom-in-95 duration-300 ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
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
