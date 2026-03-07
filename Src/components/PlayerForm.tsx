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
    name: player?.name || '',
    jersey_number: player?.jersey_number?.toString() || '',
    position: player?.position || '',
    height: player?.height || '',
    weight: player?.weight || '',
    date_of_birth: player?.date_of_birth || '',
    nationality: player?.nationality || '',
    team: player?.team || '',
    status: player?.status || 'active',
    photo_url: player?.photo_url || '',
    stats_points_avg: player?.stats_points_avg?.toString() || '0',
    stats_rebounds_avg: player?.stats_rebounds_avg?.toString() || '0',
    stats_assists_avg: player?.stats_assists_avg?.toString() || '0',
    bio: player?.bio || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    const playerData = {
      name: formData.name,
      jersey_number: formData.jersey_number ? parseInt(formData.jersey_number) : null,
      position: formData.position || null,
      height: formData.height || null,
      weight: formData.weight || null,
      date_of_birth: formData.date_of_birth || null,
      nationality: formData.nationality || null,
      team: formData.team || null,
      status: formData.status as 'active' | 'inactive' | 'injured',
      photo_url: formData.photo_url || null,
      stats_points_avg: parseFloat(formData.stats_points_avg) || 0,
      stats_rebounds_avg: parseFloat(formData.stats_rebounds_avg) || 0,
      stats_assists_avg: parseFloat(formData.stats_assists_avg) || 0,
      bio: formData.bio || null,
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
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Número de camiseta
              </label>
              <input
                type="number"
                value={formData.jersey_number}
                onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })}
                className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="23"
                min="0"
                max="99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Posición
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Seleccionar</option>
                <option value="Base">Base</option>
                <option value="Escolta">Escolta</option>
                <option value="Alero">Alero</option>
                <option value="Ala-Pívot">Ala-Pívot</option>
                <option value="Pívot">Pívot</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="injured">Lesionado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Equipo
              </label>
              <input
                type="text"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Lakers"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Altura
              </label>
              <input
                type="text"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="1.98m"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Peso
              </label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="95kg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nacionalidad
              </label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Venezuela"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL de foto
              </label>
              <input
                type="url"
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="https://ejemplo.com/foto.jpg"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Estadísticas Promedio</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Puntos por partido
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.stats_points_avg}
                  onChange={(e) => setFormData({ ...formData, stats_points_avg: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="15.5"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rebotes por partido
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.stats_rebounds_avg}
                  onChange={(e) => setFormData({ ...formData, stats_rebounds_avg: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="8.2"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Asistencias por partido
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.stats_assists_avg}
                  onChange={(e) => setFormData({ ...formData, stats_assists_avg: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="4.5"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Biografía
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-[#1C1C2E] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Información adicional sobre el jugador..."
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white rounded-md transition-colors"
            >
              {loading ? 'Guardando...' : player ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
