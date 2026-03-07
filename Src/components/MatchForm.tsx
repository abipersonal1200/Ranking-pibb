import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Swords, ShieldCheck, X } from 'lucide-react';

interface MatchFormProps {
  players: any[];
  onBack: () => void;
  onSuccess: () => void;
}

export function MatchForm({ players, onBack, onSuccess }: MatchFormProps) {
  const { user } = useAuth();
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [score1, setScore1] = useState<number | ''>('');
  const [score2, setScore2] = useState<number | ''>('');
  const [opponentPin, setOpponentPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Debes iniciar sesión");
    if (!p1 || !p2 || score1 === '' || score2 === '') return alert("Completa todos los campos");
    if (p1 === p2) return alert("No puedes jugar contra ti mismo");

    // --- LÓGICA PROFESIONAL DE 11 PUNTOS ---
    const s1 = Number(score1);
    const s2 = Number(score2);
    
    if (s1 < 11 && s2 < 11) {
      return alert("El set mínimo es a 11 puntos");
    }
    if (Math.abs(s1 - s2) < 2) {
      return alert("¡Regla de diferencia de 2! (Ej: 12-10 o 11-9)");
    }

    setLoading(true);

    // --- VALIDACIÓN DE SINCERIDAD (PIN DEL OPONENTE) ---
    const { data: opponent, error: pinError } = await supabase
      .from('players')
      .select('pin')
      .eq('id', p2)
      .single();

    if (pinError || opponent.pin !== opponentPin) {
      setLoading(false);
      return alert("PIN del oponente incorrecto. Pídele su clave de 4 dígitos.");
    }

    const winnerId = s1 > s2 ? p1 : p2;

    const { error } = await supabase.from('matches').insert([
      { 
        player1_id: p1, 
        player2_id: p2, 
        score1: s1, 
        score2: s2, 
        winner_id: winnerId,
        is_validated: true 
      }
    ]);

    if (!error) {
      alert("¡Batalla registrada con éxito!");
      onSuccess();
    } else {
      alert("Error al guardar: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Swords className="text-orange-500" /> REGISTRAR BATALLA
        </h2>
        <button onClick={onBack} className="p-2 bg-gray-800 rounded-full text-gray-400">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SELECTORES DE JUGADORES CON NOMBRES REALES */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-widest ml-1">Tú (Jugador 1)</label>
            <select 
              className="w-full bg-[#252538] text-white p-4 rounded-xl border border-gray-700 focus:border-purple-500 outline-none appearance-none"
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              required
            >
              <option value="">Selecciona tu nombre</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="flex justify-center py-2">
            <span className="text-purple-500 font-black italic">VS</span>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-widest ml-1">Oponente (Jugador 2)</label>
            <select 
              className="w-full bg-[#252538] text-white p-4 rounded-xl border border-gray-700 focus:border-purple-500 outline-none appearance-none"
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              required
            >
              <option value="">Selecciona al oponente</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        {/* MARCADOR DE PUNTOS */}
        <div className="bg-[#161625] p-6 rounded-2xl border border-gray-800">
          <p className="text-center text-xs text-gray-500 mb-4 font-medium uppercase">Marcador Final (1 Set)</p>
          <div className="flex items-center justify-center gap-6">
            <input 
              type="number" 
              placeholder="00"
              className="w-20 h-20 bg-[#252538] text-white text-4xl font-black text-center rounded-2xl border-2 border-transparent focus:border-orange-500 transition-all outline-none"
              value={score1}
              onChange={(e) => setScore1(e.target.value === '' ? '' : parseInt(e.target.value))}
            />
            <span className="text-2xl text-gray-600 font-bold">-</span>
            <input 
              type="number" 
              placeholder="00"
              className="w-20 h-20 bg-[#252538] text-white text-4xl font-black text-center rounded-2xl border-2 border-transparent focus:border-orange-500 transition-all outline-none"
              value={score2}
              onChange={(e) => setScore2(e.target.value === '' ? '' : parseInt(e.target.value))}
            />
          </div>
        </div>

        {/* CLAVE DE SEGURIDAD */}
        <div className="bg-purple-900/10 p-5 rounded-2xl border border-purple-500/20">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="text-purple-400 w-4 h-4" />
            <span className="text-[10px] text-purple-300 uppercase font-bold tracking-widest">Autorización Requerida</span>
          </div>
          <input 
            type="password" 
            placeholder="PIN de 4 dígitos del oponente"
            maxLength={4}
            className="w-full bg-[#1C1C2E] text-white p-3 text-center rounded-lg border border-purple-500/40 focus:ring-2 focus:ring-purple-500 outline-none"
            value={opponentPin}
            onChange={(e) => setOpponentPin(e.target.value)}
            required
          />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-purple-900/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'VALIDANDO BATALLA...' : 'CONFIRMAR RESULTADO'}
        </button>
      </form>
    </div>
  );
}
