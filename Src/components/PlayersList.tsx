import { useEffect, useState } from 'react';
import { Plus, Search, User as UserIcon, CreditCard as Edit, Trash2 } from 'lucide-react';
import { supabase, Player } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PlayersListProps {
  onViewPlayer: (player: Player) => void;
  onEditPlayer: (player: Player) => void;
  onCreatePlayer: () => void;
}

export function PlayersList({ onViewPlayer, onEditPlayer, onCreatePlayer }: PlayersListProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'injured'>('all');
  const { user, profile } = useAuth();

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data) {
      setPlayers(data);
    }
    setLoading(false);
  };

  const handleDelete = async (playerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Está seguro de que desea eliminar este jugador?')) return;

    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);

    if (!error) {
      setPlayers(players.filter(p => p.id !== playerId));
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.team?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || player.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const canModify = (player: Player) => {
    return user && (profile?.role === 'admin' || player.created_by === user.id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Jugadores</h1>
          <p className="text-gray-400">Listado de jugadores registrados en la liga</p>
        </div>
        {user && (
          <button
            onClick={onCreatePlayer}
            className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Jugador</span>
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o equipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#252538] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="px-4 py-2 bg-[#252538] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="injured">Lesionados</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Cargando datos...</p>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-12 bg-[#252538] rounded-lg border border-gray-700">
          <UserIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No se encontraron jugadores</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              onClick={() => onViewPlayer(player)}
              className="bg-[#252538] border border-gray-700 rounded-lg p-6 hover:border-orange-500 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {player.photo_url ? (
                    <img
                      src={player.photo_url}
                      alt={player.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-white text-lg">{player.name}</h3>
                    {player.jersey_number && (
                      <p className="text-orange-400 text-sm">#{player.jersey_number}</p>
                    )}
                  </div>
                </div>

                {canModify(player) && (
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPlayer(player);
                      }}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(player.id, e)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {player.position && (
                  <div className="flex justify-between text-gray-400">
                    <span>Posición:</span>
                    <span className="text-white">{player.position}</span>
                  </div>
                )}
                {player.team && (
                  <div className="flex justify-between text-gray-400">
                    <span>Equipo:</span>
                    <span className="text-white">{player.team}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>Estado:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    player.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    player.status === 'injured' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {player.status === 'active' ? 'Activo' :
                     player.status === 'injured' ? 'Lesionado' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {(player.stats_points_avg > 0 || player.stats_rebounds_avg > 0 || player.stats_assists_avg > 0) && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-orange-400 font-bold">{player.stats_points_avg}</p>
                      <p className="text-xs text-gray-400">PTS</p>
                    </div>
                    <div>
                      <p className="text-orange-400 font-bold">{player.stats_rebounds_avg}</p>
                      <p className="text-xs text-gray-400">REB</p>
                    </div>
                    <div>
                      <p className="text-orange-400 font-bold">{player.stats_assists_avg}</p>
                      <p className="text-xs text-gray-400">AST</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
