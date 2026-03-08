import { Users, Trophy, Zap, Activity } from 'lucide-react';

// 1. Definimos el icono de las raquetas cruzadas (SVG personalizado)
const TableTennisIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="18" r="3" />
    <path d="M12 15V9" />
    <path d="M5.5 11a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Z" transform="rotate(-45 10 11)" />
    <path d="M9.5 11a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0Z" transform="rotate(45 14 11)" />
  </svg>
);

interface HomeProps {
  onNavigate: (page: any) => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="animate-in fade-in duration-500">
      {/* SECCIÓN DE BIENVENIDA */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-700 rounded-3xl mb-6 shadow-xl shadow-orange-900/30">
          <span className="text-5xl font-black text-white italic">P</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight uppercase">
          Bienvenido a PIBB
        </h1>
        <p className="text-sm text-gray-400 max-w-xs mx-auto font-medium">
          Sistema de gestión de jugadores de la <span className="text-orange-500 font-bold">Liga de Ping Pong PIBB</span>
        </p>
      </div>

      {/* TARJETAS DE FUNCIONES RÁPIDAS */}
      <div className="grid grid-cols-1 gap-4 mb-10">
        <FeatureCard
          icon={<Users className="w-6 h-6" />}
          title="Gestión de Jugadores"
          description="Administra perfiles completos, fotos y biografía de los retadores."
          onClick={() => onNavigate('players')}
        />
        <FeatureCard
          icon={<Activity className="w-6 h-6" />}
          title="Estadísticas de Juego"
          description="Visualiza el Win Rate, puntos a favor y efectividad en cada set."
          onClick={() => onNavigate('players')}
        />
        <FeatureCard
          icon={<TableTennisIcon className="w-6 h-6" />}
          title="Match Center"
          description="Registra batallas en tiempo real y consulta el historial de resultados."
          onClick={() => onNavigate('match-center')}
        />
      </div>

      {/* BANNER DE ACCIÓN PRINCIPAL */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#252538] to-[#1C1C2E] border border-orange-500/20 rounded-3xl p-8 text-center shadow-2xl">
        <div className="absolute top-2 right-2 opacity-10 text-orange-500">
           <TableTennisIcon className="w-20 h-20"/>
        </div>

        <Trophy className="w-12 h-12 text-orange-500 mx-auto mb-4 opacity-80" />
        <h2 className="text-xl font-black text-white mb-2 uppercase tracking-wide">
          Domina la Mesa
        </h2>
        <p className="text-gray-400 text-xs mb-6 leading-relaxed">
          Crea tu perfil, desafía a tus amigos y escala en el ranking oficial de la liga PIBB.
        </p>
        
        <button
          onClick={() => onNavigate('match-form')}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-2xl transition-all font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20 active:scale-95"
        >
          <TableTennisIcon className="w-5 h-5" />
          REGISTRAR BATALLA
        </button>
      </div>
    </div>
  );
}

// ESTO ES EL "FEATURE CARD" QUE FALTABA (El diseño de los botones individuales)
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function FeatureCard({ icon, title, description, onClick }: FeatureCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-[#161625] border border-gray-800 rounded-2xl p-5 hover:border-orange-500/50 transition-all cursor-pointer group flex items-start gap-4 active:scale-[0.98]"
    >
      <div className="bg-[#252538] p-3 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-[11px] text-gray-500 font-medium leading-snug">{description}</p>
      </div>
    </div>
  );
}
