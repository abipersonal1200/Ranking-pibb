import { Swords, Trophy, Calendar } from 'lucide-react';

export function MatchCenter() {
  // Datos de ejemplo basados en tu referencia
  const matches = [
    { id: 1, p1: "Edwards Pérez", p2: "Karlos Herrera", highlighted: true, league: "Liga 1 - 2026", date: "12/03/2026" },
    { id: 2, p1: "Gabriel Are...", p2: "Yorgelis Lin...", highlighted: false, league: "Liga 1 - 2026", date: "12/03/2026" },
    { id: 3, p1: "Aaron Piña", p2: "Alejandro ...", highlighted: false, league: "Liga 1 - 2026", date: "12/03/2026" },
  ];

  return (
    <div className="p-4 mb-20">
      <div className="flex items-center space-x-2 mb-6">
        <div className="bg-blue-500/20 p-2 rounded-lg">
          <Swords className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Match Center</h2>
      </div>

      <div className="flex border-b border-gray-800 mb-6">
        <button className="pb-2 px-4 border-b-2 border-blue-500 text-blue-400 font-medium">Cartelera</button>
        <button className="pb-2 px-4 text-gray-500 font-medium">Últimos Resultados</button>
      </div>

      <div className="space-y-4">
        {matches.map((match) => (
          <div 
            key={match.id}
            className={`relative overflow-hidden rounded-xl border ${
              match.highlighted 
                ? 'bg-gradient-to-br from-blue-900/40 to-[#1C1C2E] border-blue-500/50 p-8' 
                : 'bg-[#252538] border-gray-800 p-6'
            }`}
          >
            {match.highlighted && (
              <span className="absolute top-0 right-0 bg-blue-500 text-[10px] font-bold px-3 py-1 rounded-bl-lg text-white uppercase tracking-wider">
                Partido Destacado
              </span>
            )}
            
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center justify-between w-full max-w-xs mx-auto">
                {/* Jugador 1 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full mb-2 mx-auto flex items-center justify-center border-2 border-orange-500/30">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${match.p1}`} alt="avatar" className="rounded-full" />
                  </div>
                  <p className="text-white font-semibold text-sm">{match.p1}</p>
                </div>

                <div className="text-center">
                  <span className="text-2xl font-black italic text-blue-400 opacity-80">VS</span>
                  <div className="flex items-center mt-2 text-[10px] text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {match.date}
                  </div>
                </div>

                {/* Jugador 2 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full mb-2 mx-auto flex items-center justify-center border-2 border-orange-500/30">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${match.p2}`} alt="avatar" className="rounded-full" />
                  </div>
                  <p className="text-white font-semibold text-sm">{match.p2}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800 w-full text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{match.league} | Octavos de Final</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
