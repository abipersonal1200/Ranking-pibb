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
import { MatchForm } from './components/MatchForm';

type Page = 'home' | 'players' | 'player-detail' | 'player-form' | 'match-center' | 'match-form';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (user) {
      const fetchPlayers = async () => {
        const { data } = await supabase.from('players').select('*').order('name');
        if (data) setPlayers(data);
      };
      fetchPlayers();
    }
  }, [user]);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    if (page !== 'player-detail') setSelectedPlayer(null);
    if (page !== 'player-form') setEditingPlayer(null);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'match-form':
        return (
          <MatchForm 
            players={players} 
            onBack={() => setCurrentPage('match-center')} 
            onSuccess={() => setCurrentPage('match-center')} 
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
          <PlayerDetail player={selectedPlayer} onBack={() => setCurrentPage('players')} onEdit={(p) => { setEditingPlayer(p); setCurrentPage('player-form'); }} />
        ) : null;
      case 'player-form':
        return <PlayerForm player={editingPlayer} onBack={() => setCurrentPage('players')} onSuccess={() => { setCurrentPage('players'); setEditingPlayer(null); }} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1C1C2E] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth onSuccess={() => setCurrentPage('home')} />;
  }

  return (
    /* Contenedor principal: min-h-screen evita el fondo blanco y max-w-md lo mantiene compacto en PC */
    <div className="min-h-screen w-full bg-[#1C1C2E] text-white flex justify-center overflow-x-hidden">
      <div className="w-full max-w-md md:max-w-lg flex flex-col relative shadow-2xl shadow-black">
        <Layout currentPage={currentPage} onNavigate={handleNavigate}>
          <main className="flex-1 container mx-auto px-4 py-6 pb-28">
            {renderContent()}
          </main>
        </Layout>
        <BottomNav activePage={currentPage} onNavigate={handleNavigate} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
