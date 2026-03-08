import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, ShieldCheck, Hash, BarChart3, LogOut, Eye, EyeOff, RefreshCw, Sparkles } from 'lucide-react';

export function PlayerProfile() {
  const { user } = useAuth();
  const [playerData, setPlayerData] = useState<any>(null);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) fetchPlayerData();
  }, [user]);

  async function fetchPlayerData() {
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('auth_id', user?.id)
      .single();
    
    if (data) setPlayerData(data);
    setLoading(false);
  }

  // FUNCIÓN PARA CAMBIAR AVATAR AL INSTANTE
  const handleShuffleAvatar = async () => {
    if (!playerData || updating) return;
    setUpdating(true);
    
    // Generamos un nuevo estilo aleatorio
    const newSeed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${newSeed}`;

    const { error } = await supabase
      .from('players')
      .update({ avatar_url: newAvatar })
      .eq('id', playerData.id);

    if (!error) {
      setPlayerData({ ...playerData, avatar_url: newAvatar });
    }
    setUpdating(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F0F1A]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500 mb-4"></div>
      <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest">Sincronizando Perfil...</p>
    </div>
  );

  return (
    <div className="p-6 bg-[#0F0F1A] min-h-screen pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* HEADER DE PERFIL CON AVATAR INTERACTIVO */}
      <div className="flex flex-col items-center mb-10 pt-4">
        <div className="relative mb-6 group">
          {/* Contenedor del Avatar */}
          <div className="w-32 h-32 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-[2.8rem] p-1 shadow-[0_20px_50px_rgba(234,88,12,0.3)] relative overflow-hidden">
            <div className="w-full h-full bg-[#161625] rounded-[2.5rem] overflow-hidden">
              {playerData?.avatar_url ? (
                <img src={playerData.avatar_url} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700">
                  <User size={48} />
                </div>
              )}
            </div>
          </div>

          {/* Botón Flotante para cambiar Avatar */}
          <button 
            onClick={handleShuffleAvatar}
            disabled={updating}
            className="absolute -bottom-2 -right-2 bg-white text-black p-3 rounded-2xl shadow-2xl hover:scale-110 active:scale-90 transition-all z-10 border-4 border-[#0F0F1A]"
          >
            <RefreshCw size={20} className={`${updating ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Decoración de Estrellas */}
          <Sparkles className="absolute -top-4 -right-4 text-orange-500/30 w-8 h-8 animate-pulse" />
        </div>

        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-2 text-center">
          {playerData?.first_name} <br/>
          <span className="text-orange-500">{playerData?.last_name}</span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-4 bg-orange-500/50"></div>
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em]">Miembro Oficial PIBB</span>
          <div className="h-[1px] w-4 bg-orange-500/50"></div>
        </div>
      </div>

      <div className="space-y-6">
        {/* TARJETA DE SEGURIDAD (PIN) - DISEÑO MEJORADO */}
        <div className="bg-[#161625] border border-white/5 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck size={80} className="text-orange-500" />
          </div>
          
          <div className="flex items-center justify-between mb-5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-orange-600/20 p-2 rounded-lg">
                <ShieldCheck className="text-orange-500 w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Código de Autorización</span>
            </div>
            <button 
              onClick={() => setShowPin(!showPin)} 
              className="p-2 bg-[#0F0F1A] rounded-xl text-gray-500 hover:text-white transition-all"
            >
              {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="bg-[#0F0F1A] py-6 rounded-2xl border border-gray-800 shadow-inner flex items-center justify-center relative z-10">
            <span className={`text-4xl font-mono font-black tracking-[0.6em] transition-all duration-500 ${showPin ? 'text-white' : 'text-gray-800 blur-[2px]'}`}>
              {showPin ? playerData?.pin : '0000'}
            </span>
          </div>
          <p className="text-[9px] text-gray-600 mt-4 text-center font-medium leading-relaxed uppercase tracking-tighter">
            Este PIN es personal. Solo entrégalo cuando <span className="text-red-500/50">pierdas</span> un partido.
          </p>
        </div>

        {/* ESTADÍSTICAS RÁPIDAS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#161625] border border-white/5 p-6 rounded-[2.2rem] flex flex-col items-center">
            <div className="bg-gray-800/50 p-2 rounded-xl mb-3">
              <Hash className="text-gray-400 w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white italic tracking-tighter">
              #{playerData?.player_number || playerData?.jersey_number || '00'}
            </div>
            <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">Nro de Ficha</div>
          </div>

          <div className="bg-[#161625] border border-white/5 p-6 rounded-[2.2rem] flex flex-col items-center">
            <div className="bg-orange-600/20 p-2 rounded-xl mb-3">
              <BarChart3 className="text-orange-500 w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white italic tracking-tighter">
              {playerData?.points || 0}
            </div>
            <div className="text-[8px] font-black text-orange-600 uppercase tracking-widest mt-1">Puntos Totales</div>
          </div>
        </div>

        {/* BOTÓN CERRAR SESIÓN - MÁS DISCRETO PERO ESTÉTICO */}
        <button 
          onClick={() => supabase.auth.signOut()}
          className="w-full mt-8 bg-transparent border border-red-500/20 text-red-500/60 font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all uppercase text-[10px] tracking-[0.2em] active:scale-95"
        >
          <LogOut size={16} />
          Finalizar Sesión
        </button>
      </div>
    </div>
  );
}
