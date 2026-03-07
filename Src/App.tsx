import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase, Player } from './lib/supabase';

// Importación de componentes (Asegúrate de que estén en src/components)
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { PlayersList } from './components/PlayersList';
import { PlayerDetail } from './components/PlayerDetail';
import { PlayerForm } from './components/PlayerForm';
import { MatchCenter } from './components/MatchCenter';
import { BottomNav } from './components/BottomNav';
import { MatchForm } from './components/MatchForm';

// Definición de las páginas disponibles
type Page = 'home' | 'players' | 'player-detail' | 'player-form' | 'match-center' | 'match-form';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Efecto para cargar los jugadores reales desde Supabase
  useEffect(() => {
    if (user) {
      const fetchPlayers = async () => {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .order('name');
        if (data) setPlayers(data);
        if (error) console.error("Error cargando jugadores:", error);
      };
      fetchPlayers();
    }
  }, [user]);

  // Manejador de navegación limpia
  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    if (page !== 'player-detail') setSelectedPlayer(null);
    if (page !== 'player-form') setEditingPlayer(null);
  };

  // Renderizado condicional de las secciones
  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      
      case 'match-form':
        return (
          <MatchForm 
            players={players} 
            onBack={() => setCurrentPage('match-center')} 
            onSuccess={() => {
              // Refrescamos datos si es necesario y volvemos a resultados
              setCurrentPage('match-center');
            }} 
          />
        );

      case 'match-center':
        return <MatchCenter />;

      case 'players':
        return (
          <PlayersList
            onViewPlayer={(p) => { setSelectedPlayer(p); setCurrentPage('player-detail'); }}
            onEditPlayer={(p) => { setEditingPlayer(p); setCurrentPage('player-form'); }}
            onCreatePlayer={() => { setEditingPlayer(null); setCurrentPage('player-form'); }}
          />
        );

      case 'player-detail':
        return selectedPlayer ? (
          <PlayerDetail 
            player={selectedPlayer} 
            onBack={() => setCurrentPage('players')} 
            onEdit={(p) => { setEditingPlayer(p); setCurrentPage('player-form'); }} 
          />
        ) : null;

      case 'player-form':
        return (
          <PlayerForm 
            player={editingPlayer} 
            onBack={() => setCurrentPage('players')} 
            onSuccess={() => {
              setCurrentPage('players');
              setEditingPlayer(null);
            }} 
          />
        );

      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  // Pantalla de carga inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1C1C2E] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  // Si no hay sesión, mostramos el login
  if (!user) {
    return <Auth onSuccess={() => setCurrentPage('home')} />;
  }

  // Estructura principal con Layout y Navegación Inferior
  return (
    <div className="min-h-screen bg-[#1C1C2E] text-white">
      <Layout currentPage={currentPage} onNavigate={handleNavigate}>
        <main className="container mx-auto px-4 py-6 pb-24">
          {renderContent()}
        </main>
      </Layout>
      <BottomNav activePage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
}

// Componente Raíz con el Proveedor de Autenticación
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
