import { LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: any) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    // No es necesario onNavigate('login') si tu App.tsx ya maneja el estado !user
  };

  return (
    <div className="min-h-screen bg-[#1C1C2E] text-white flex flex-col">
      {/* NAVEGACIÓN SUPERIOR COMPACTA */}
      <nav className="bg-[#161625] border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* LOGO E IDENTIDAD - CAMBIO A PING PONG */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-orange-900/20">
                P
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-black leading-none tracking-tighter">PIBB</h1>
                <p className="text-[10px] text-orange-500 uppercase font-black tracking-widest mt-0.5">
                  Liga de Ping Pong
                </p>
              </div>
            </div>

            {/* SECCIÓN DE USUARIO */}
            {user && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-[11px] text-gray-300 font-bold truncate max-w-[100px]">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                  {profile?.role === 'admin' && (
                    <span className="text-[9px] text-orange-400 font-black uppercase">Admin</span>
                  )}
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="p-2.5 bg-gray-800/50 hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-xl border border-gray-700 transition-all active:scale-90"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL - ELIMINADO EL MARGEN EXCESIVO */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 pb-24">
        {children}
      </main>
    </div>
  );
}
