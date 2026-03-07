import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase, Player } from './lib/supabase';

// Importación de componentes
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { PlayersList } from './components/PlayersList';
import { PlayerDetail } from './components/PlayerDetail';
import { PlayerForm } from './components/PlayerForm';
import { MatchCenter } from './components/MatchCenter';
import { BottomNav } from './components/BottomNav';

// Definición de las páginas disponibles en el Ranking PIBB
type Page = 'home' | 'players' | 'player-detail' | 'player-form' | 'match-center';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Pantalla de carga inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1C1C2E] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Si no hay sesión, mostrar login (Auth)
  if (!user) {
    return <Auth onSuccess={() => setCurrentPage('home')} />;
  }

  // Funciones de navegación y lógica
  const handleViewPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setCurrentPage('player-detail');
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setCurrentPage('player-form');
  };

  const handleCreatePlayer = () => {
    setEditingPlayer(null);
    setCurrentPage('player-form');
  };

  const handleFormSuccess = () => {
    setCurrentPage('players');
    setEditingPlayer(null);
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    // Limpiar estados al navegar para evitar basura visual
    if (page !== 'player-detail') setSelectedPlayer(null);
    if (page !== 'player-form') setEditingPlayer(null);
  };

  // Renderizado dinámico según la página seleccionada
  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'match-center':
        return <MatchCenter />;
      case 'players':
        return (
          <PlayersList
            onViewPlayer={handleViewPlayer}
            onEditPlayer={handleEditPlayer}
            onCreatePlayer={handleCreatePlayer}
          />
        );
      case 'player-detail':
        return selectedPlayer ? (
          <PlayerDetail
            player={selectedPlayer}
            onBack={() => setCurrentPage('players')}
            onEdit={handleEditPlayer}
          />
        ) : null;
      case 'player-form':
        return (
          <PlayerForm
            player={editingPlayer}
            onBack={() => setCurrentPage('players')}
            onSuccess={handleFormSuccess}
          />
        );
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1C2E] text-white">
      {/* El Layout envuelve el contenido principal */}
      <Layout 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
      >
        <main className="container mx-auto px-4 py-6 pb-24">
          {renderContent()}
        </main>
      </Layout>

      {/* Barra de navegación inferior fija (estilo Match Center) */}
      <BottomNav 
        activePage={currentPage} 
        onNavigate={handleNavigate} 
      />
    </div>
  );
}

// Componente principal con el Proveedor de Autenticación de Supabase
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
