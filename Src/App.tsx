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

// Definición de las páginas (añadimos match-form)
type Page = 'home' | 'players' | 'player-detail' | 'player-form' | 'match-center' | 'match-form';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Cargar jugadores para los selectores del formulario
  useEffect(() => {
    if (user) {
      const fetchPlayers = async () => {
        const { data } = await supabase.from('players').select('*').order('name');
        if (data) setPlayers(data);
      };
      fetchPlayers();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1C1C2E] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth onSuccess={() => setCurrentPage('home')} />;
  }

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
