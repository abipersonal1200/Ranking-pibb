import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, ShieldCheck, Hash, BarChart3, LogOut, Eye, EyeOff } from 'lucide-react';

export function PlayerProfile() {
  const { user } = useAuth();
  const [playerData, setPlayerData] = useState<any>(null);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchPlayerData();
  }, [user]);

  async function fetchPlayerData() {
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('auth_id', user.id) // Vinculamos con el ID de autenticación
      .single();
    
    if (data) setPlayerData(data);
    setLoading(false);
  }

  if (loading) return <div className="p-10 text-center text-gray-500 uppercase text-xs font-black animate-pulse">Cargando Perfil...</div>;

  return (
    <div className="p-6 bg-[#0F0F1A] min-h-screen pb-24 animate-in slide-in-from-bottom-4 duration-500">
      {/* Encabezado de Perfil */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-[2.5rem] flex items-center justify-center shadow-[0_15px_35px_rgba(234,88,12,0.4)] mb-4">
          <User size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
          {playerData?.first_name || 'Jugador'}
        </h2>
        <span className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em]">Miembro Oficial PIBB</span>
      </div>

      <div className="space-y-4">
        {/* Tarjeta de Seguridad (PIN) */}
        <div className="bg-[#161625] border border-orange-500/20 p-6 rounded-[2rem] shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-orange-500 w-5 h-5" />
              <span className="text-[10px] font-black text-white uppercase">Mi Código de Autorización</span>
            </div>
            <button onClick={() => setShowPin(!showPin)} className="text-gray-500 hover:text-white transition-colors">
              {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="bg-[#0F0F1A] p-4 rounded-xl border border-gray-800 text-center">
            <span className={`text-3xl font-mono font-black tracking-[0.5em] ${showPin ? 'text-white' : 'text-gray-800'}`}>
              {showPin ? playerData?.pin : '****'}
            </span>
          </div>
          <p className="text-[9px] text-gray-500 mt-3 text-center leading-relaxed italic">
            Comparte este PIN con tu oponente para que pueda registrar la victoria si pierdes.
          </p>
        </div>

        {/* Estadísticas Personales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#161625] border border-gray-800 p-5 rounded-[2rem]">
            <Hash className="text-gray-500 mb-2 w-4 h-4" />
            <div className="text-xl font-black text-white">#{playerData?.number}</div>
            <div className="text-[9px] font-bold text-gray-500 uppercase">Ficha</div>
          </div>
          <div className="bg-[#161625] border border-gray-800 p-5 rounded-[2rem]">
            <BarChart3 className="text-orange-500 mb-2 w-4 h-4" />
            <div className="text-xl font-black text-white">{playerData?.points}</div>
            <div className="text-[9px] font-bold text-gray-500 uppercase">Puntos</div>
          </div>
        </div>

        {/* Botón de Salida */}
        <button 
          onClick={() => supabase.auth.signOut()}
          className="w-full mt-6 bg-red-500/5 border border-red-500/20 text-red-500 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all uppercase text-[10px] tracking-widest"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
