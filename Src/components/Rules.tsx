import { Trophy, Target, ShieldAlert, Zap } from 'lucide-react';

export function Rules() {
  return (
    <div className="p-6 bg-[#0F0F1A] min-h-screen text-white space-y-6 animate-in">
      <div className="flex items-center gap-3 border-b border-orange-600/30 pb-4">
        <Trophy className="text-orange-500 w-8 h-8" />
        <h1 className="text-2xl font-black italic uppercase">Reglamento Oficial PIBB</h1>
      </div>

      <section className="space-y-4">
        <h2 className="text-orange-500 font-bold flex items-center gap-2 italic">
          <Zap className="w-4 h-4 fill-current" /> PUNTUACIÓN POR VICTORIA
        </h2>
        <div className="grid gap-3">
          <div className="bg-[#161625] p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400">RIVAL SUPERIOR</span>
            <span className="text-green-500 font-black">+25 PTS</span>
          </div>
          <div className="bg-[#161625] p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400">RIVAL SIMILAR (±2 Puestos)</span>
            <span className="text-blue-500 font-black">+15 PTS</span>
          </div>
          <div className="bg-[#161625] p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400">RIVAL INFERIOR</span>
            <span className="text-gray-500 font-black">+10 PTS</span>
          </div>
        </div>
      </section>

      <section className="bg-orange-600/10 border border-orange-600/20 p-5 rounded-[2rem] space-y-2">
        <h2 className="text-orange-500 font-black text-sm uppercase tracking-widest flex items-center gap-2">
          <Target className="w-4 h-4" /> REGLA DEL "GOLDEN SET"
        </h2>
        <p className="text-[11px] text-gray-400 font-medium">
          Si ganas sin perder ni un solo set (ej. 2-0 o 3-0), recibes un bono extra de <span className="text-white font-bold">+5 PTS</span> por "Blanqueada".
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-red-500 font-bold flex items-center gap-2 italic">
          <ShieldAlert className="w-4 h-4" /> PENALIZACIONES
        </h2>
        <ul className="space-y-2">
          <li className="text-[11px] text-gray-500 bg-[#161625] p-3 rounded-xl border border-red-900/20">
            • <strong className="text-white">Derrota normal:</strong> -5 PTS.
          </li>
          <li className="text-[11px] text-gray-500 bg-[#161625] p-3 rounded-xl border border-red-900/20">
            • <strong className="text-white">Top 3 vs Fondo:</strong> -15 PTS si el líder pierde contra los últimos puestos.
          </li>
          <li className="text-[11px] text-gray-500 bg-[#161625] p-3 rounded-xl border border-red-900/20">
            • <strong className="text-white">Inactividad:</strong> 1 semana sin jugar = -10 PTS y bajas 1 puesto.
          </li>
        </ul>
      </section>
    </div>
  );
}
