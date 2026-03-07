import { Users, Trophy, Calendar } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: 'players') => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div>
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-500 rounded-lg mb-6">
          <span className="text-5xl font-bold">P</span>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">
          Bienvenido a PIBB
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Sistema de gestión de jugadores de la Liga de Baloncesto PIBB
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <FeatureCard
          icon={<Users className="w-8 h-8" />}
          title="Gestión de Jugadores"
          description="Administra perfiles completos de jugadores con estadísticas y biografías"
          onClick={() => onNavigate('players')}
        />
        <FeatureCard
          icon={<Trophy className="w-8 h-8" />}
          title="Estadísticas"
          description="Visualiza promedios de puntos, rebotes y asistencias por jugador"
          onClick={() => onNavigate('players')}
        />
        <FeatureCard
          icon={<Calendar className="w-8 h-8" />}
          title="Estado de Jugadores"
          description="Mantén actualizado el estado de cada jugador (activo, inactivo, lesionado)"
          onClick={() => onNavigate('players')}
        />
      </div>

      <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Comienza a gestionar tu liga
        </h2>
        <p className="text-gray-300 mb-6">
          Crea perfiles de jugadores, actualiza estadísticas y mantén toda la información organizada en un solo lugar
        </p>
        <button
          onClick={() => onNavigate('players')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-md transition-colors font-medium"
        >
          Ver Jugadores
        </button>
      </div>
    </div>
  );
}

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
      className="bg-[#252538] border border-gray-700 rounded-lg p-6 hover:border-orange-500 transition-all cursor-pointer group"
    >
      <div className="text-orange-400 mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
