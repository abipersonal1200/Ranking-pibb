import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    const playerData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      player_number: formData.player_number ? parseInt(formData.player_number) : null,
      dominant_hand: formData.dominant_hand,
      racket_brand: formData.racket_brand || null,
      created_by: user.id,
    };

    try {
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
    <div>
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>
      </div>

      <div className="bg-[#252538] border border-gray-700 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-6">
          {player ? 'Editar Jugador' : 'Nuevo Jugador'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre *</label>
              <input
                type="text" required value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-orange-500"
                placeholder="Juan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Apellido *</label>
              <input
                type="text" required value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-orange-500"
                placeholder="Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Número de Jugador</label>
              <input
                type="number" value={formData.player_number}
                onChange={(e) => setFormData({ ...formData, player_number: e.target.value })}
                className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-orange-500"
                placeholder="23"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mano Dominante</label>
              <select
                value={formData.dominant_hand}
                onChange={(e) => setFormData({ ...formData, dominant_hand: e.target.value })}
                className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-orange-500"
              >
                <option value="Derecho">Derecho</option>
                <option value="Izquierdo">Izquierdo</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Marca de Raqueta</label>
              <input
                type="text" value={formData.racket_brand}
                onChange={(e) => setFormData({ ...formData, racket_brand: e.target.value })}
                className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-orange-500"
                placeholder="Ej: Wilson, Babolat, Head..."
              />
            </div>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-md">{error}</div>}

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onBack} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md">Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white rounded-md">
              {loading ? 'Guardando...' : player ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
