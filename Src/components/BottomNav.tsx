import { Home, Trophy, Users, Swords, User } from 'lucide-react';

interface BottomNavProps {
  activePage: string;
  onNavigate: (page: any) => void;
}

export function BottomNav({ activePage, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1C1C2E] border-t border-gray-800 px-6 py-3 flex justify-between items-center z-50">
      <button 
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center ${activePage === 'home' ? 'text-purple-500' : 'text-gray-400'}`}
      >
        <Home className="w-6 h-6" />
        <span className="text-[10px] mt-1 font-medium">Inicio</span>
      </button>

      <button 
        onClick={() => onNavigate('match-center')}
        className={`flex flex-col items-center ${activePage === 'match-center' ? 'text-purple-500' : 'text-gray-400'}`}
      >
        <Trophy className="w-6 h-6" />
        <span className="text-[10px] mt-1 font-medium">Resultados</span>
      </button>

      <button 
        onClick={() => onNavigate('players')}
        className={`flex flex-col items-center ${activePage === 'players' ? 'text-purple-500' : 'text-gray-400'}`}
      >
        <Users className="w-6 h-6" />
        <span className="text-[10px] mt-1 font-medium">Jugadores</span>
      </button>

      {/* Botón Central: Registrar Partido */}
      <button 
        onClick={() => onNavigate('match-form')}
        className={`flex flex-col items-center ${activePage === 'match-form' ? 'text-orange-500 scale-110' : 'text-gray-400'}`}
      >
        <Swords className="w-7 h-7" />
        <span className="text-[10px] mt-1 font-bold">Partido</span>
      </button>

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
