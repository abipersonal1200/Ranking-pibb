import { Home, Trophy, Users, Swords, User } from 'lucide-react';

// Esta interfaz permite que el componente reciba la orden de cambiar de página
interface BottomNavProps {
  activePage: string;
  onNavigate: (page: any) => void;
}

export function BottomNav({ activePage, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1C1C2E] border-t border-gray-800 px-6 py-3 flex justify-between items-center z-50">
      {/* Botón Inicio */}
      <button 
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center ${activePage === 'home' ? 'text-purple-500' : 'text-gray-400'}`}
      >
        <Home className="w-6 h-6" />
        <span className="text-[10px] mt-1 font-medium">Inicio</span>
      </button>

      {/* Botón Torneos (puedes vincularlo a home o una futura página) */}
      <button 
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center ${activePage === 'tournaments' ? 'text-purple-500' : 'text-gray-400'}`}
      >
        <Trophy className="w-6 h-6" />
        <span className="text-[10px] mt-1 font-medium">Torneos</span>
      </button>

      {/* Botón Jugadores (Ranking) */}
      <button 
        onClick={() => onNavigate('players')}
        className={`flex flex-col items-center ${activePage === 'players' ? 'text-purple-500' : 'text-gray-400'}`}
      >
        <Users className="w-6 h-6" />
        <span className="text-[10px] mt-1 font-medium">Jugadores</span>
      </button>

      {/* Botón Partido (Match Center) */}
      <button 
        onClick={() => onNavigate('match-center')}
        className={`flex flex-col items-center ${activePage === 'match-center' ? 'text-purple-500' : 'text-gray-400'}`}
      >
        <Swords className="w-6 h-6" />
        <span className="text-[10px] mt-1 font-medium">Partido</span>
      </button>

      {/* Botón Sesión */}
      <button 
        onClick={() => onNavigate('home')}
        className="flex flex-col items-center text-gray-400"
      >
        <User className="w-6 h-6" />
        <span className="text-[10px] mt-1 font-medium">Sesión</span>
      </button>
    </nav>
  );
}
