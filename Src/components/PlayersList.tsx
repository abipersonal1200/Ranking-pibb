          import { useEffect, useState } from 'react';
import { Plus, Search, User as UserIcon, Edit, Trash2, Trophy, Medal, Star } from 'lucide-react';
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
    // MEJORA: Ahora ordena por puntos (Ranking Real) y no por nombre
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('points', { ascending: false });

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
    <div className="p-1 animate-in fade-in duration-500">
      {/* HEADER CON IDENTIDAD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="text-orange-500 w-5 h-5" />
            <span className="text-orange-500 font-black text-xs uppercase tracking-[0.2em]">Official Circuit</span>
          </div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter">RANKING PIBB</h1>
          <p className="text-gray-500 text-sm font-medium">Temporada 2026 • Barquisimeto</p>
        </div>
        
        {user && (
          <button
            onClick={onCreatePlayer}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-orange-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest">Inscribir Jugador</span>
          </button>
        )}
      </div>

      {/* BUSCADOR ESTILIZADO */}
      <div className="mb-8 group">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
          <input
            type="text"
            placeholder="Buscar por nombre o número de ranking..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[#161625] border border-gray-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-gray-600 font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500 mb-4"></div>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Sincronizando Ranking...</p>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-16 bg-[#161625] rounded-3xl border-2 border-dashed border-gray-800">
          <UserIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">No se encontraron jugadores</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlayers.map((player, index) => (
            <div
              key={player.id}
              onClick={() => onViewPlayer(player)}
              className={`relative bg-[#161625] border-2 rounded-3xl p-6 transition-all cursor-pointer group hover:scale-[1.02] ${
                index === 0 ? 'border-orange-500/40 shadow-xl shadow-orange-500/5' : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              {/* POSICIÓN FLOTANTE */}
              <div className={`absolute -top-3 -left-3 w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-lg ${
                index === 0 ? 'bg-orange-500 text-white' : 
                index === 1 ? 'bg-gray-400 text-black' : 
                index === 2 ? 'bg-amber-700 text-white' : 'bg-[#252538] text-gray-400'
              }`}>
                {index + 1}
              </div>

              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-700 overflow-hidden">
                      {player.avatar_url ? (
                        <img src={player.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-black text-gray-600">
                          {player.first_name[0]}
                        </span>
                      )}
                    </div>
                    {index === 0 && (
                      <div className="absolute -bottom-2 -right-2 bg-orange-500 rounded-lg p-1">
                        <Star size={12} className="text-white fill-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-white text-lg leading-tight uppercase">
                      {player.first_name}
                    </h3>
                    <p className="text-orange-500/80 text-[10px] font-black tracking-widest uppercase">
                      {player.racket_brand || 'PIBB Pro Player'}
                    </p>
                  </div>
                </div>

                {canModify(player) && (
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPlayer(player);
                      }}
                      className="p-2 bg-gray-800 hover:bg-orange-500/20 hover:text-orange-500 rounded-xl transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(player.id, e)}
                      className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* STATS DEL RANKING */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-800/50">
                <div className="bg-[#1f1f33] p-3 rounded-2xl text-center">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter mb-1">Puntos Liga</p>
                  <p className="text-xl font-black text-white">{player.points || 0}</p>
                </div>
                <div className="bg-[#1f1f33] p-3 rounded-2xl text-center">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter mb-1">Victorias</p>
                  <p className="text-xl font-black text-green-500">{player.wins || 0}</p>
                </div>
              </div>

              {/* DETALLE TÉCNICO INFERIOR */}
              <div className="flex justify-between items-center mt-4 px-1">
                <span className="text-[10px] font-bold text-gray-600 uppercase italic">
                  Hand: <span className="text-gray-400">{player.dominant_hand || 'R'}</span>
                </span>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`h-1 w-3 rounded-full ${index === 0 ? 'bg-orange-500/40' : 'bg-gray-800'}`} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
