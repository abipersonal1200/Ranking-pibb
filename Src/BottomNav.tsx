import { Home, Trophy, Users, PlusCircle, User } from 'lucide-react';

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1C1C2E] border-t border-gray-800 px-6 py-3 flex justify-between items-center z-50">
      <button className="flex flex-col items-center text-purple-500">
        <Home className="w-6 h-6" />
        <span className="text-[10px] mt-1">Inicio</span>
      </button>
      <button className="flex flex-col items-center text-gray-400">
        <Trophy className="w-6 h-6" />
        <span className="text-[10px] mt-1">Torneos</span>
      </button>
      <button className="flex flex-col items-center text-gray-400">
        <Users className="w-6 h-6" />
        <span className="text-[10px] mt-1">Jugadores</span>
      </button>
      <button className="flex flex-col items-center text-gray-400">
        <PlusCircle className="w-6 h-6" />
        <span className="text-[10px] mt-1">Partido</span>
      </button>
      <button className="flex flex-col items-center text-gray-400">
        <User className="w-6 h-6" />
        <span className="text-[10px] mt-1">Sesión</span>
      </button>
    </nav>
  );
}
