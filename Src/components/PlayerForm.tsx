import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Shield, Rocket, Info, AlertTriangle } from 'lucide-react';

export function PlayerForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Mantenemos tus estados originales intactos
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    playerNumber: '',
    equipment: 'STIGA',
    hand: 'DERECHO',
    pin: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // --- NUEVA PROTECCIÓN: VERIFICAR SI YA EXISTE EL USUARIO ---
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('auth_id', user?.id)
        .maybeSingle();

      if (existingPlayer) {
        throw new Error('Ya tienes un perfil de batalla vinculado. No puedes crear otro.');
      }
      // ---------------------------------------------------------

      // Obtener el total para asignar la posición inicial en el ranking
      const { count } = await supabase.from('players').select('*', { count: 'exact', head: true });
      const nextRank = (count || 0) + 1;

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
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random().toString(36).substring(7)}`
      }]);

      if (error) throw error;

      setMessage({ type: 'success', text: '¡Perfil de Atleta creado con éxito!' });
      // Aquí puedes resetear el form o redirigir
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#0F0F1A] min-h-screen pb-24 animate-in fade-in duration-500">
      {/* Tu encabezado original */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-600/20">
          <UserPlus className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none">Registro de Atleta</h1>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1 italic">Únete a la Élite PIBB</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Aquí van tus inputs de nombre, apellido, ficha, etc. */}
        {/* Asegúrate de incluir este bloque de mensajes para que el usuario vea el error de duplicado */}
        
        {message.text && (
          <div className={`p-5 rounded-[2rem] text-[10px] font-black text-center uppercase border-2 flex items-center justify-center gap-3 ${
            message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'
          }`}>
            {message.type === 'error' ? <AlertTriangle size={14} /> : <Rocket size={14} />}
            {message.text}
          </div>
        )}

        <button 
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-6 rounded-[2rem] shadow-[0_15px_40px_rgba(234,88,12,0.3)] transition-all active:scale-95 disabled:opacity-50 uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-2"
        >
          {loading ? 'Creando Atleta...' : 'Comenzar Carrera'}
        </button>
      </form>
    </div>
  );
}
