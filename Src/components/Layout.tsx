import { LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: 'players' | 'home';
  onNavigate: (page: 'players' | 'home' | 'login') => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onNavigate('login');
  };

  return (
    <div className="min-h-screen bg-[#1C1C2E] text-white">
      <nav className="bg-[#252538] border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-xl">
                  P
                </div>
                <div>
                  <h1 className="text-xl font-bold">PIBB</h1>
                  <p className="text-xs text-gray-400">Liga de Baloncesto</p>
                </div>
              </div>

              <div className="hidden md:flex space-x-6">
                <button
                  onClick={() => onNavigate('home')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'home'
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Inicio
                </button>
                <button
                  onClick={() => onNavigate('players')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'players'
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Jugadores
                </button>
              </div>
            </div>

            {user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="w-4 h-4" />
                  <span className="text-gray-300">{profile?.full_name || user.email}</span>
                  {profile?.role === 'admin' && (
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
