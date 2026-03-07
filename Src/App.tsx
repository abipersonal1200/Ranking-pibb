import { BottomNav } from './components/BottomNav';
import { MatchCenter } from './components/MatchCenter';
import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { PlayersList } from './components/PlayersList';
import { PlayerDetail } from './components/PlayerDetail';
import { PlayerForm } from './components/PlayerForm';
import { Player } from './lib/supabase';

type Page = 'home' | 'players' | 'player-detail' | 'player-form' | 'login';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1C1C2E] flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth onSuccess={() => setCurrentPage('home')} />;
  }

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
    if (page !== 'player-detail') setSelectedPlayer(null);
    if (page !== 'player-form') setEditingPlayer(null);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={(page) => setCurrentPage(page)} />;
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
        return <Home onNavigate={(page) => setCurrentPage(page)} />;
    }
  };

  return (
    <Layout
      currentPage={currentPage === 'home' ? 'home' : 'players'}
      onNavigate={handleNavigate}
    >
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
function App() {
  return (
    <div className="min-h-screen bg-[#1C1C2E] text-white pb-20"> 
      <main className="container mx-auto px-4 py-8">
        <MatchCenter />   
      </main>
      <BottomNav />
    </div>
  );
}
