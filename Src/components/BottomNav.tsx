import { Home, Trophy, Users, Swords, User, BookOpen } from 'lucide-react';

interface BottomNavProps {
  activePage: string;
  onNavigate: (page: any) => void;
}

export function BottomNav({ activePage, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0F0F1A] border-t border-gray-800/50 px-4 py-3 flex justify-between items-center z-50 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      
      {/* Inicio */}
      <button 
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center flex-1 transition-all ${activePage === 'home' ? 'text-orange-500' : 'text-gray-500'}`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Inicio</span>
      </button>

      {/* Resultados (Match Center) */}
      <button 
        onClick={() => onNavigate('match-center')}
        className={`flex flex-col items-center flex-1 transition-all ${activePage === 'match-center' ? 'text-orange-500' : 'text-gray-500'}`}
      >
        <Trophy className="w-5 h-5" />
        <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Resultados</span>
      </button>

      {/* Jugadores */}
      <button 
        onClick={() => onNavigate('players')}
        className={`flex flex-col items-center flex-1 transition-all ${activePage === 'players' ? 'text-orange-500' : 'text-gray-500'}`}
      >
        <Users className="w-5 h-5" />
        <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Jugadores</span>
      </button>

      {/* Botón Central: Registrar Partido */}
      <button 
        onClick={() => onNavigate('match-form')}
        className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl -mt-8 transition-all shadow-2xl ${
          activePage === 'match-form' 
            ? 'bg-orange-600 text-white rotate-12 scale-110 shadow-orange-600/30' 
            : 'bg-[#161625] text-gray-400 border border-gray-800'
        }`}
      >
        <Swords className="w-7 h-7" />
      </button>

      {/* REGLAS (Nueva Pestaña) */}
      <button 
        onClick={() => onNavigate('rules')}
        className={`flex flex-col items-center flex-1 transition-all ${activePage === 'rules' ? 'text-orange-500' : 'text-gray-500'}`}
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Reglas</span>
      </button>

      {/* Sesión */}
      <button 
        onClick={() => onNavigate('home')} // Cambiar a la ruta de perfil si existe
        className="flex flex-col items-center flex-1 text-gray-500"
      >
        <User className="w-5 h-5" />
        <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Sesión</span>
      </button>
      
    </nav>
  );
}
