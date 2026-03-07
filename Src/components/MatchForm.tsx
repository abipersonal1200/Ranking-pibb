import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function MatchForm({ onBack, onSuccess, players }: any) {
  const { user } = useAuth(); // Verifica que el registrador esté logeado
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [opponentPin, setOpponentPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user) return alert("Debes iniciar sesión para registrar");
    if (p1 === p2) return alert("No puedes jugar contra ti mismo");

    // Lógica de 11 puntos profesional
    if ((score1 < 11 && score2 < 11) || Math.abs(score1 - score2) < 2) {
      return alert("Resultado inválido: Mínimo 11 pts y diferencia de 2");
    }

    setLoading(true);

    // --- VALIDACIÓN DE SINCERIDAD ---
    // Verificamos si el PIN ingresado coincide con el del Jugador 2 en la DB
    const { data: player2, error: pinError } = await supabase
      .from('players')
      .select('pin')
      .eq('id', p2)
      .single();

    if (pinError || player2.pin !== opponentPin) {
      setLoading(false);
      return alert("PIN del oponente incorrecto. El oponente debe autorizar el registro.");
    }

    const winnerId = score1 > score2 ? p1 : p2;

    const { error } = await supabase.from('matches').insert([
      { 
        player1_id: p1, 
        player2_id: p2, 
        score1, 
        score2, 
        winner_id: winnerId,
        is_validated: true 
      }
    ]);

    if (!error) {
      alert("¡Partido validado y registrado exitosamente!");
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#1C1C2E] p-4 rounded-xl border border-purple-500/30">
      <h2 className="text-xl font-bold text-white mb-4 text-center">Registrar Batalla</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between items-center gap-2">
          {/* Jugador 1 (Tú) */}
          <select className="bg-[#252538] text-white p-2 rounded w-1/2 text-sm" onChange={(e)=>setP1(e.target.value)} required>
            <option value="">Tú (P1)</option>
            {players.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <span className="text-gray-500">VS</span>
          {/* Jugador 2 (Oponente) */}
          <select className="bg-[#252538] text-white p-2 rounded w-1/2 text-sm" onChange={(e)=>setP2(e.target.value)} required>
            <option value="">Oponente (P2)</option>
            {players.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="flex gap-4">
          <input type="number" placeholder="Pts P1" className="w-1/2 bg-[#252538] text-white p-3 text-center rounded-lg text-2xl" onChange={(e)=>setScore1(parseInt(e.target.value))} />
          <input type="number" placeholder="Pts P2" className="w-1/2 bg-[#252538] text-white p-3 text-center rounded-lg text-2xl" onChange={(e)=>setScore2(parseInt(e.target.value))} />
        </div>

        {/* CAMPO DE SEGURIDAD */}
        <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20">
          <p className="text-[10px] text-purple-300 mb-2 text-center uppercase tracking-widest">Autorización del Oponente</p>
          <input 
            type="password" 
            placeholder="PIN de 4 dígitos del oponente" 
            maxLength={4}
            className="w-full bg-[#1C1C2E] text-white p-2 text-center rounded border border-purple-500/50"
            onChange={(e) => setOpponentPin(e.target.value)}
            required
          />
        </div>

        <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-xl font-bold text-white transition-all">
          {loading ? 'Verificando PIN...' : 'Confirmar Resultado'}
        </button>
      </form>
    </div>
  );
}
