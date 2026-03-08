import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Mail, Lock, User, Hash, Zap } from 'lucide-react';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [pin, setPin] = useState(''); // Nuevo estado para el PIN
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Validar que el PIN sea de 4 números
        if (pin.length !== 4 || isNaN(Number(pin))) {
          throw new Error('El PIN debe ser de 4 números exactos');
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          // Insertar en la tabla 'players'. 
          // El campo 'number' se genera solo gracias al SQL que corrimos
          const { error: profileError } = await supabase
            .from('players')
            .insert([{ 
              id: authData.user.id, 
              first_name: firstName, 
              email, 
              pin, // Guardamos el PIN de seguridad
              wins: 0, 
              losses: 0 
            }]);
          
          if (profileError) throw profileError;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-[#161625] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl relative overflow-hidden">
        
        {/* Decoración de fondo */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-600/10 rounded-full blur-3xl"></div>
        
        <div className="text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-2xl mb-4 shadow-[0_0_20px_rgba(234,88,12,0.4)]">
            <Zap className="text-white w-8 h-8 fill-current" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter italic">PIBB</h1>
          <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
            Liga de Ping Pong Profesional
          </p>
        </div>

        <div className="flex bg-[#0F0F1A] p-1 rounded-2xl border border-gray-800">
          <button 
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all ${!isSignUp ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500'}`}
          >
            Entrar
          </button>
          <button 
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all ${isSignUp ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500'}`}
          >
            Unirse
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="NOMBRE DE JUGADOR"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[#0F0F1A] border border-gray-800 text-white px-12 py-4 rounded-2xl text-xs font-bold focus:border-orange-500 outline-none transition-all placeholder:text-gray-700"
                  required
                />
              </div>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  maxLength={4}
                  placeholder="PIN DE SEGURIDAD (4 DÍGITOS)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#0F0F1A] border border-gray-800 text-white px-12 py-4 rounded-2xl text-xs font-bold focus:border-orange-500 outline-none transition-all placeholder:text-gray-700"
                  required
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="email"
              placeholder="CORREO ELECTRÓNICO"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0F0F1A] border border-gray-800 text-white px-12 py-4 rounded-2xl text-xs font-bold focus:border-orange-500 outline-none transition-all placeholder:text-gray-700"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="password"
              placeholder="CONTRASEÑA"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0F0F1A] border border-gray-800 text-white px-12 py-4 rounded-2xl text-xs font-bold focus:border-orange-500 outline-none transition-all placeholder:text-gray-700"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] p-4 rounded-xl font-bold text-center uppercase tracking-wider">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl shadow-[0_10px_20px_rgba(234,88,12,0.3)] transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-widest"
          >
            {loading ? 'Procesando...' : isSignUp ? 'Crear Cuenta Oficial' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
