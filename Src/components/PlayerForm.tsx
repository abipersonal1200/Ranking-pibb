import { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, User, Sparkles, RefreshCw } from 'lucide-react';
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

  // LÓGICA DE AVATAR: Función para generar la URL de DiceBear
  const getAvatarUrl = (seed: string) => 
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc`;

  const [formData, setFormData] = useState({
    first_name: player?.first_name || '',
    last_name: player?.last_name || '',
    player_number: player?.player_number?.toString() || '',
    dominant_hand: player?.dominant_hand || 'Derecho',
    racket_brand: player?.racket_brand || '',
    pin: player?.pin || '',
    avatar_url: player?.avatar_url || getAvatarUrl(player?.first_name || 'Player' + Math.random()),
  });

  // Cambiar avatar aleatoriamente
  const handleShuffleAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setFormData({ ...formData, avatar_url: getAvatarUrl(randomSeed) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!player && (!formData.pin || formData.pin.length !== 4)) {
      return setError('El PIN debe ser de exactamente 4 dígitos.');
    }

    setError('');
    setLoading(true);

    try {
      let finalRankPosition = player?.rank_position;
      let finalNumber = formData.player_number;

      if (!player) {
        const { count } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true });
        
        const nextPos = (count || 0) + 1;
        finalRankPosition = nextPos;
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
        pin: formData.pin,
        avatar_url: formData.avatar_url, // Guardamos la imagen seleccionada
        rank_position: finalRankPosition,
        auth_id: !player ? user.id : undefined,
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center space-x-2 text-gray-500 hover:text-orange-500 transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Volver al Ranking</span>
        </button>
      </div>

      <div className="bg-[#161625] border border-gray-800 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

        <div className="flex flex-col items-center mb-10">
          {/* SELECTOR DE AVATAR MEJORADO */}
          <div className="relative group mb-4">
            <div className="w-32 h-32 bg-[#0F0F1A] rounded-[2rem] border-4 border-orange-500/20 group-hover:border-orange-500 transition-all p-1 overflow-hidden shadow-2xl shadow-orange-500/10">
              <img 
                src={formData.avatar_url} 
                alt="Player Avatar" 
                className="w-full h-full object-cover rounded-[1.8rem]" 
              />
            </div>
            <button
              type="button"
              onClick={handleShuffleAvatar}
              className="absolute -bottom-2 -right-2 bg-orange-600 hover:bg-orange-500 p-3 rounded-2xl text-white shadow-xl hover:scale-110 active:scale-90 transition-all"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
              {player ? 'Editar Atleta' : 'Nueva Ficha'}
            </h1>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mt-1">Identidad Digital PIBB</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-1">
              <label className="block text-[10px] font-black text-gray-600 uppercase ml-3 mb-2 tracking-widest">Primer Nombre</label>
              <input
                type="text" required value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-6 py-4 bg-[#0F0F1A] border border-gray-800 rounded-2xl text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-800 font-bold"
                placeholder="Nombre"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-[10px] font-black text-gray-600 uppercase ml-3 mb-2 tracking-widest">Apellido</label>
              <input
                type="text" required value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-6 py-4 bg-[#0F0F1A] border border-gray-800 rounded-2xl text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-800 font-bold"
                placeholder="Apellido"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-600 uppercase ml-3 mb-2 tracking-widest">Nro de Ficha</label>
              <input
                type="number" value={formData.player_number}
                onChange={(e) => setFormData({ ...formData, player_number: e.target.value })}
                className="w-full px-6 py-4 bg-[#0F0F1A] border border-gray-800 rounded-2xl text-white focus:border-orange-500 outline-none transition-all font-bold"
                placeholder="Auto-asignado"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-600 uppercase ml-3 mb-2 tracking-widest">Mano Hábil</label>
              <select
                value={formData.dominant_hand}
                onChange={(e) => setFormData({ ...formData, dominant_hand: e.target.value })}
                className="w-full px-6 py-4 bg-[#0F0F1A] border border-gray-800 rounded-2xl text-white focus:border-orange-500 outline-none transition-all appearance-none font-bold"
              >
                <option value="Derecho">Derecho (R)</option>
                <option value="Izquierdo">Izquierdo (L)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-gray-600 uppercase ml-3 mb-2 tracking-widest">Equipamiento (Marca Raqueta)</label>
              <input
                type="text" value={formData.racket_brand}
                onChange={(e) => setFormData({ ...formData, racket_brand: e.target.value })}
                className="w-full px-6 py-4 bg-[#0F0F1A] border border-gray-800 rounded-2xl text-white focus:border-orange-500 outline-none transition-all font-bold"
                placeholder="Ej: Butterfly, Donic, Xiom..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-orange-500 uppercase ml-3 mb-2 tracking-widest flex items-center gap-1">
                <ShieldCheck size={12} /> PIN Maestro de 4 Dígitos
              </label>
              <input
                type="password" maxLength={4} required
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                className="w-full px-6 py-5 bg-orange-500/5 border-2 border-orange-500/10 rounded-[1.5rem] text-white focus:border-orange-500 outline-none transition-all text-center font-mono text-2xl tracking-[0.8em] shadow-inner"
                placeholder="0000"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-2xl text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button 
              type="button" 
              onClick={onBack} 
              className="flex-1 px-8 py-5 bg-gray-900 hover:bg-red-500/10 hover:text-red-500 text-gray-600 font-black rounded-2xl transition-all uppercase text-[10px] tracking-widest"
            >
              Descartar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-[2] px-8 py-5 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-800 text-white font-black rounded-2xl transition-all shadow-xl shadow-orange-600/30 uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 active:scale-95"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles size={16} />
                  {player ? 'Actualizar Ficha' : 'Firmar Registro'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
