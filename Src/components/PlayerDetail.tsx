import { ArrowLeft, User as UserIcon, CreditCard as Edit } from 'lucide-react';
import { Player } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PlayerDetailProps {
  player: Player;
  onBack: () => void;
  onEdit: (player: Player) => void;
}

export function PlayerDetail({ player, onBack, onEdit }: PlayerDetailProps) {
  const { user, profile } = useAuth();

  const canModify = user && (profile?.role === 'admin' || player.created_by === user.id);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a jugadores</span>
        </button>

        {canModify && (
          <button
            onClick={() => onEdit(player)}
            className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            <Edit className="w-5 h-5" />
            <span>Editar</span>
          </button>
        )}
      </div>

      <div className="bg-[#252538] border border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {player.photo_url ? (
              <img
                src={player.photo_url}
                alt={player.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-orange-500"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center border-4 border-orange-500">
                <UserIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}

            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">{player.name}</h1>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {player.jersey_number && (
                  <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium">
                    #{player.jersey_number}
                  </span>
                )}
                {player.position && (
                  <span className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm">
                    {player.position}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm ${
                  player.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  player.status === 'injured' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {player.status === 'active' ? 'Activo' :
                   player.status === 'injured' ? 'Lesionado' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Información Personal</h2>
              <div className="space-y-3">
                <InfoRow label="Equipo" value={player.team || 'N/A'} />
                <InfoRow label="Altura" value={player.height || 'N/A'} />
                <InfoRow label="Peso" value={player.weight || 'N/A'} />
                <InfoRow label="Fecha de Nacimiento" value={formatDate(player.date_of_birth)} />
                <InfoRow label="Nacionalidad" value={player.nationality || 'N/A'} />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Estadísticas</h2>
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Puntos" value={player.stats_points_avg} />
                <StatCard label="Rebotes" value={player.stats_rebounds_avg} />
                <StatCard label="Asistencias" value={player.stats_assists_avg} />
              </div>
            </div>
          </div>

          {player.bio && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Biografía</h2>
              <p className="text-gray-300 leading-relaxed">{player.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-700">
      <span className="text-gray-400">{label}:</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#1C1C2E] rounded-lg p-4 text-center">
      <p className="text-3xl font-bold text-orange-400">{value.toFixed(1)}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
}
