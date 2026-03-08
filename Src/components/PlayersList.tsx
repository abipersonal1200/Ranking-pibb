import { useEffect, useState } from 'react';
import { Plus, Search, User as UserIcon, Edit, Trash2, Trophy, Star } from 'lucide-react';
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
    // Mantenemos el orden por puntos para que el ranking sea real
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

  // RESTAURADO: Buscador por nombre completo Y por número de ficha
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
    <div className="p-1 animate-in fade-in duration-500 pb-20">
      {/* HEADER IDENTIDAD PIBB */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="text-orange-500 w-4 h-4" />
            <span className="text-orange-500 font-black text-[10px] uppercase tracking-widest text-orange-500">Official Circuit</span>
          </div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Ranking PIBB</h1>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Temporada 2026 • Barquisimeto</p>
        </div>
        
        {user && (
          <button
            onClick={onCreatePlayer}
            className="flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-500 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-orange-600/20 active:scale-95 text-xs uppercase tracking-widest"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Atleta</span>
          </button>
        )}
      </div>

      {/* BUSCADOR RESTAURADO */}
      <div className="mb-8 group">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
          <input
            type="text"
            placeholder="Buscar por nombre o nro de ficha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[#161625] border border-gray-800 rounded-2xl text-white focus:border-orange-500 outline-none transition-all placeholder:text-gray-700 font-bold"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500"></div></div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-16 bg-[#161625] rounded-3xl border-2 border-dashed border-gray-800">
          <UserIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">No hay registros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlayers.map((player, index) => (
            <div
              key={player.id}
              onClick={() => onViewPlayer(player)}
              className={`relative bg-[#161625] border-2 rounded-[2.5rem] p-6 transition-all cursor-pointer group hover:scale-[1.01] ${
                index === 0 ? 'border-orange-500/40 shadow-xl shadow-orange-500/5' : 'border-gray-800'
              }`}
            >
              {/* POSICIÓN FLOTANTE */}
              <div className={`absolute -top-3 -left-3 w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-lg ${
                index === 0 ? 'bg-orange-500 text-white' : 
                index === 1 ? 'bg-gray-400 text-black' : 
                index === 2 ? 'bg-amber-700 text-white' : 'bg-[#252538] text-gray-500'
              }`}>
                {index + 1}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gray-900 rounded-2xl border-2 border-gray-800 overflow-hidden p-0.5">
                    {/* AVATAR CON RESPALDO DE INICIAL */}
                    {player.avatar_url ? (
                      <img src={player.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 font-black text-xl uppercase">
                        {player.first_name[0]}
                      </div>
                    )}
                  </div>
                  {index === 0 && (
                    <div className="absolute -bottom-2 -right-2 bg-orange-500 rounded-lg p-1 shadow-lg">
                      <Star size={10} className="text-white fill-current" />
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-hidden">
                  <h3 className="font-black text-white text-lg leading-tight uppercase truncate">
                    {player.first_name} {player.last_name}
                  </h3>
                  <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">
                    Ficha: {player.player_number || '—'}
                  </p>
                </div>

                {canModify(player) && (
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onEditPlayer(player); }} className="p-2 bg-gray-800 hover:text-orange-500 rounded-xl transition-all">
                      <Edit size={14} />
                    </button>
                    <button onClick={(e) => handleDelete(player.id, e)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* STATS REALES DE SUPABASE */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-[#0F0F1A] p-3 rounded-2xl border border-gray-800/50 text-center">
                  <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Puntos</span>
                  <span className="text-xl font-black text-white italic">{player.points || 0}</span>
                </div>
                <div className="bg-[#0F0F1A] p-3 rounded-2xl border border-gray-800/50 text-center">
                  <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Victorias</span>
                  <span className="text-xl font-black text-green-500 italic">{player.wins || 0}</span>
                </div>
              </div>

              {/* MARCA DE RAQUETA (RESTAURADO) */}
              <div className="mt-5 flex justify-between items-center px-2 pt-4 border-t border-gray-800/30">
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Equipamiento</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase italic">
                    {player.racket_brand || 'PIBB Standard'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Mano</span>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase italic">
                    {player.dominant_hand || 'R'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
