import { useState } from 'react';
import { ArrowLeft, ShieldCheck, User, Sparkles } from 'lucide-react';
import { supabase, Player } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PlayerFormProps {
  player?: Player | null;
  onBack: () => void;
  onSuccess: () => void;
}

export function PlayerForm({ player, onBack, onSuccess }: PlayerFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    first_name: player?.first_name || '',
    last_name: player?.last_name || '',
    player_number: player?.player_number?.toString() || '',
    dominant_hand: player?.dominant_hand || 'Derecho',
    racket_brand: player?.racket_brand || '',
    pin: player?.pin || '', // Campo para el PIN de seguridad
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validación de PIN para nuevos registros
    if (!player && (!formData.pin || formData.pin.length !== 4)) {
      return setError('El PIN debe ser de exactamente 4 dígitos.');
    }

    setError('');
    setLoading(true);

    try {
      let finalRankPosition = player?.rank_position;
      let finalNumber = formData.player_number;

      // LÓGICA AUTOMÁTICA PARA NUEVOS JUGADORES
      if (!player) {
        const { count } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true });
        
        const nextPos = (count || 0) + 1;
        finalRankPosition = nextPos;
        // Si no puso número, se asigna su posición en formato "01"
        if (!finalNumber) {
          finalNumber = nextPos.toString().padStart(2, '0');
        }
      }

      const playerData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        player_number: finalNumber ? parseInt(finalNumber) : null,
        dominant_hand: formData.dominant_hand,
        racket_brand: formData.racket_brand || null,
        pin: formData.pin, // Guardar PIN
        rank_position: finalRankPosition, // Posición en la escalera
        auth_id: !player ? user.id : undefined, // Vincular a cuenta solo en creación
        created_by: user.id,
      };

      if (player) {
        const { error: updateError } = await supabase
          .from('players')
          .update(playerData)
          .eq('id', player.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('players')
          .insert([playerData]);
        if (insertError) throw insertError;
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el jugador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center space-x-2 text-gray-500 hover:text-orange-500 transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Volver</span>
        </button>
      </div>

      <div className="bg-[#161625] border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-600/20">
            <User className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">
              {player ? 'Editar Perfil' : 'Registro Oficial'}
            </h1>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">Temporada 2026</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 tracking-widest">Nombre *</label>
              <input
                type="text" required value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-5 py-4 bg-[#0F0F1A] border border-gray-800 rounded-2xl text-white focus:border-orange-500 outline-none transition-all placeholder:text-gray-700"
                placeholder="Nombre del atleta"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 tracking-widest">Apellido *</label>
              <input
                type="text" required value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-5 py-4 bg-[#0F0F1A] border border-gray-800 rounded-2xl text-white focus:border-orange-500 outline-none transition-all placeholder:text-gray-700"
                placeholder="Apellido del atleta"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 tracking-widest">Nro de Ficha (Opcional)</label>
              <input
                type="number" value={formData.player_number}
                onChange={(e) => setFormData({ ...formData, player_number: e.target.value })}
                className="w-full px-5 py-4 bg-[#0F0F1A] border border-gray-800 rounded-2xl text-white focus:border-orange-500 outline-none transition-all"
                placeholder="Ej: 07"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 tracking-widest">Mano Dominante</label>
              <select
                value={formData.dominant_hand}
                onChange={(e) => setFormData({ ...formData, dominant_hand: e.target.value })}
                className="w-full px-5 py-4 bg-[#0F0F1A] border border-gray-800 rounded-2xl text-white focus:border-orange-500 outline-none transition-all appearance-none"
              >
                <option value="Derecho">Derecho</option>
                <option value="Izquierdo">Izquierdo</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 tracking-widest">Marca de Raqueta</label>
              <input
                type="text" value={formData.racket_brand}
                onChange={(e) => setFormData({ ...formData, racket_brand: e.target.value })}
                className="w-full px-5 py-4 bg-[#0F0F1A] border border-gray-800 rounded-2xl text-white focus:border-orange-500 outline-none transition-all"
                placeholder="Ej: Butterfly, Stiga..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-orange-500 uppercase ml-2 mb-2 tracking-widest flex items-center gap-1">
                <ShieldCheck size={12} /> PIN de Seguridad (4 dígitos) *
              </label>
              <input
                type="password" maxLength={4} required
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                className="w-full px-5 py-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl text-white focus:border-orange-500 outline-none transition-all text-center font-mono text-xl tracking-[0.5em]"
                placeholder="0000"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onBack} 
              className="flex-1 px-6 py-4 bg-gray-900 hover:bg-gray-800 text-gray-500 font-black rounded-2xl transition-all uppercase text-[10px] tracking-widest"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-[2] px-6 py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-800 text-white font-black rounded-2xl transition-all shadow-lg shadow-orange-600/20 uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
            >
              {loading ? 'Sincronizando...' : (
                <>
                  <Sparkles size={14} />
                  {player ? 'Actualizar Perfil' : 'Finalizar Registro'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
