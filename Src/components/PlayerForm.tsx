import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Shield, Rocket, AlertTriangle, ChevronRight, RefreshCw } from 'lucide-react';

export function PlayerForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Mantenemos tus estados originales y recuperamos el control del avatar
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    playerNumber: '',
    equipment: 'STIGA',
    hand: 'DERECHO',
    pin: '',
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random().toString(36).substring(7)}`
  });

  // Función para cambiar el avatar manualmente antes de registrar
  const refreshAvatar = () => {
    setFormData({
      ...formData,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random().toString(36).substring(7)}`
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. VALIDACIÓN: Usuario ya registrado
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('auth_id', user?.id)
        .maybeSingle();

      if (existingPlayer) {
        throw new Error('Ya tienes un perfil de batalla vinculado.');
      }

      // 2. VALIDACIÓN: Número de ficha duplicado
      const { data: duplicateNumber } = await supabase
        .from('players')
        .select('id')
        .eq('player_number', formData.playerNumber)
        .maybeSingle();

      if (duplicateNumber) {
        throw new Error(`La ficha #${formData.playerNumber} ya está ocupada.`);
      }

      const { count } = await supabase.from('players').select('*', { count: 'exact', head: true });
      const nextRank = (count || 0) + 1;

      // 3. INSERCIÓN: Usamos el avatarUrl del estado
      const { error } = await supabase.from('players').insert([{
        auth_id: user?.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        player_number: formData.playerNumber,
        equipment: formData.equipment,
        hand: formData.hand,
        pin: formData.pin,
        points: 0,
        wins: 0,
        losses: 0,
        rank_position: nextRank,
        avatar_url: formData.avatarUrl // Ahora se guarda el que el usuario ve
      }]);

      if (error) throw error;
      setMessage({ type: 'success', text: '¡Atleta registrado con éxito!' });
      
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#0F0F1A] min-h-screen pb-24 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-600/20">
          <UserPlus className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none">Registro de Atleta</h1>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1 italic">Personaliza tu perfil</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* SECCIÓN DE AVATAR RECUPERADA */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-orange-500/30 bg-[#161625] shadow-2xl">
              <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <button 
              type="button"
              onClick={refreshAvatar}
              className="absolute -bottom-2 -right-2 p-2 bg-orange-600 rounded-xl text-white shadow-lg hover:scale-110 transition-transform active:rotate-180"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          <p className="text-[8px] font-black text-orange-500 uppercase tracking-[0.3em]">Toca la flecha para cambiar de estilo</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Nombre</label>
            <input required type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full bg-[#161625] border border-gray-800 text-white p-4 rounded-2xl font-bold focus:border-orange-500 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Apellido</label>
            <input required type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full bg-[#161625] border border-gray-800 text-white p-4 rounded-2xl font-bold focus:border-orange-500 outline-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest flex items-center gap-2">
            <Shield size={10} className="text-orange-500" /> Número de Ficha
          </label>
          <input required type="number" value={formData.playerNumber} onChange={(e) => setFormData({...formData, playerNumber: e.target.value})} className="w-full bg-[#161625] border border-gray-800 text-white p-4 rounded-2xl font-black text-xl focus:border-orange-500 outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Equipamiento</label>
            <select value={formData.equipment} onChange={(e) => setFormData({...formData, equipment: e.target.value})} className="w-full bg-[#161625] border border-gray-800 text-white p-4 rounded-2xl font-bold focus:border-orange-500 outline-none">
              <option value="STIGA">STIGA</option>
              <option value="BUTTERFLY">BUTTERFLY</option>
              <option value="DONIC">DONIC</option>
              <option value="DHS">DHS</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Mano Dominante</label>
            <select value={formData.hand} onChange={(e) => setFormData({...formData, hand: e.target.value})} className="w-full bg-[#161625] border border-gray-800 text-white p-4 rounded-2xl font-bold focus:border-orange-500 outline-none">
              <option value="DERECHO">DERECHO</option>
              <option value="ZURDO">ZURDO</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">PIN de Autorización (4 dígitos)</label>
          <input required type="password" maxLength={4} value={formData.pin} onChange={(e) => setFormData({...formData, pin: e.target.value})} className="w-full bg-[#161625] border border-gray-800 text-white p-4 rounded-2xl font-mono text-center text-2xl tracking-[0.5em] focus:border-orange-500 outline-none" />
        </div>

        {message.text && (
          <div className={`p-5 rounded-[2rem] text-[10px] font-black text-center uppercase border-2 flex items-center justify-center gap-3 ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
            {message.type === 'error' ? <AlertTriangle size={14} /> : <Rocket size={14} />}
            {message.text}
          </div>
        )}

        <button disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-6 rounded-[2rem] shadow-[0_15px_40px_rgba(234,88,12,0.3)] transition-all active:scale-95 disabled:opacity-50 uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-2">
          {loading ? 'Sincronizando...' : <>Comenzar Carrera <ChevronRight size={16} /></>}
        </button>
      </form>
    </div>
  );
}
