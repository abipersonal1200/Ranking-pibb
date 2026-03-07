import { useEffect, useState } from 'react';
import { Plus, Search, User as UserIcon, Edit, Trash2 } from 'lucide-react';
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
  const { user, profile } = useAuth();

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('first_name', { ascending: true });

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
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         player.player_number?.toString().includes(searchTerm);
    return matchesSearch;
  });

  const canModify = (player: Player) => {
    return user && (profile?.role === 'admin' || player.created_by === user.id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Ranking PIBB</h1>
          <p className="text-gray-400">Listado oficial de jugadores de Ping Pong</p>
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

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#252538] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Cargando ranking...</p>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-12 bg-[#252538] rounded-lg border border-gray-700">
          <UserIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No hay jugadores registrados en el ranking</p>
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
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center border-2 border-orange-500/30">
                    <span className="text-xl font-bold text-orange-400">
                      {player.player_number || '—'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">
                      {player.first_name} {player.last_name}
                    </h3>
                    <p className="text-gray-400 text-sm">Jugador PIBB</p>
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
                      <Edit className="w-4 h-4 text-white" />
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

              <div className="space-y-2 text-sm border-t border-gray-700 pt-4">
                <div className="flex justify-between text-gray-400">
                  <span>Mano Dominante:</span>
                  <span className="text-white font-medium">{player.dominant_hand || 'No definida'}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Raqueta:</span>
                  <span className="text-orange-400 font-medium">{player.racket_brand || 'Genérica'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
