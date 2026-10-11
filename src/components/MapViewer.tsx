import React, { useState } from 'react';
import { BiomeZone } from '../types/game';
import { Radio, Shield, DollarSign, Crosshair, Skull, Layers, MapPin } from 'lucide-react';

interface MapPOI {
  id: string;
  name: string;
  zone: BiomeZone;
  x: number; // 0 to 100%
  y: number; // 0 to 100%
  type: 'VAULT' | 'TOWER' | 'BOSS' | 'CAGE' | 'BUY_STATION' | 'SUPERCAR';
  description: string;
}

const POIS: MapPOI[] = [
  // Southern Metropolis (GTA)
  { id: 'poi_bank', name: 'Bank of Nova Main Vault', zone: 'METROPOLIS', x: 52, y: 73, type: 'VAULT', description: 'High security underground bank vault containing $8,500+ cash. Blow with C4.' },
  { id: 'poi_infernus', name: 'Luxury Showroom - Infernus GT', zone: 'METROPOLIS', x: 46, y: 77, type: 'SUPERCAR', description: 'Pegassi Infernus GT supercar ready for high-speed escape across boulevards.' },
  { id: 'poi_mall', name: 'Metropolitan Commercial District', zone: 'METROPOLIS', x: 62, y: 82, type: 'BUY_STATION', description: 'Underground Buy Station logistics terminal for loadouts and UAVs.' },
  { id: 'poi_police', name: 'NMPD Central Precinct', zone: 'METROPOLIS', x: 35, y: 68, type: 'VAULT', description: 'Corrupt police department headquarters. High heat patrol cruisers spawn here.' },

  // Jungle Wilderness (Far Cry)
  { id: 'poi_tower_1', name: 'Western Jungle Relay Station', zone: 'JUNGLE', x: 27, y: 40, type: 'TOWER', description: 'Capture radio relay to reveal all enemy squads and loot caches on the radar.' },
  { id: 'poi_tower_2', name: 'Eastern Canopy Watchtower', zone: 'JUNGLE', x: 63, y: 34, type: 'TOWER', description: 'Mercenary communication spire offering a high-ground sniper vantage point.' },
  { id: 'poi_tiger_cage', name: 'Talon Merc Animal Poaching Cage', zone: 'JUNGLE', x: 38, y: 44, type: 'CAGE', description: 'Captured Bengal tiger in iron cage. Shoot open gate to unleash beast upon enemies.' },
  { id: 'poi_bear_den', name: 'Highland Bear Sanctuary', zone: 'JUNGLE', x: 68, y: 42, type: 'CAGE', description: 'Aggressive Grizzly bear den guarding military supply crates.' },

  // Gothic Mount Tenebris (Resident Evil)
  { id: 'poi_castle', name: 'Mount Tenebris Gothic Castle', zone: 'GOTHIC_PEAK', x: 50, y: 12, type: 'BOSS', description: 'Forbidden castle lair of Urias the Parasitic Behemoth. Drops Mythic weapons.' },
  { id: 'poi_village', name: 'Abandoned Medieval Village', zone: 'GOTHIC_PEAK', x: 42, y: 19, type: 'BOSS', description: 'Creeping fog, scarce ammo, and prowling Lycan packs. Extreme survival horror risk.' },
  { id: 'poi_cemetery', name: 'The Mourning Graveyard', zone: 'GOTHIC_PEAK', x: 58, y: 22, type: 'BOSS', description: 'Ancient tombstones where final circles often end in eerie close-range shotgun duels.' }
];

export const MapViewer: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'METROPOLIS' | 'JUNGLE' | 'GOTHIC_PEAK'>('ALL');
  const [selectedPOI, setSelectedPOI] = useState<MapPOI | null>(POIS[0]);
  const [showFlightPath, setShowFlightPath] = useState(true);
  const [showStormCircle, setShowStormCircle] = useState(true);

  const filteredPOIs = activeFilter === 'ALL' ? POIS : POIS.filter(p => p.zone === activeFilter);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-lg border border-neutral-800 text-xs font-mono">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeFilter === 'ALL' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All Island Zones
          </button>
          <button
            onClick={() => setActiveFilter('METROPOLIS')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeFilter === 'METROPOLIS' ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800/40' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Neon Metropolis
          </button>
          <button
            onClick={() => setActiveFilter('JUNGLE')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeFilter === 'JUNGLE' ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/40' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Far Cry Jungles
          </button>
          <button
            onClick={() => setActiveFilter('GOTHIC_PEAK')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeFilter === 'GOTHIC_PEAK' ? 'bg-purple-950 text-purple-300 font-bold border border-purple-800/40' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Mount Tenebris
          </button>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showFlightPath}
              onChange={(e) => setShowFlightPath(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span>Cargo Plane Drop Vector</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showStormCircle}
              onChange={(e) => setShowStormCircle(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span>Bio-Chemical Storm Ring</span>
          </label>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Intel Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Canvas Visualizer */}
        <div className="lg:col-span-2 relative aspect-[4/3] sm:aspect-[16/10] bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
          {/* Island Background Layers */}
          <div className="absolute inset-0 flex flex-col">
            {/* North: Mount Tenebris (0-28%) */}
            <div className="h-[28%] bg-gradient-to-b from-[#0b0a14] via-[#161426] to-[#121c17] relative border-b border-purple-900/40">
              <div className="absolute top-3 left-4 text-[11px] font-mono text-purple-400/80 tracking-widest uppercase">
                Zone 3 · Mount Tenebris & Castle Dread
              </div>
              {/* Spooky mist effect */}
              <div className="absolute inset-0 bg-radial-gradient from-purple-500/5 to-transparent pointer-events-none" />
            </div>

            {/* Middle: Far Cry Untamed Jungles (28-60%) */}
            <div className="h-[32%] bg-gradient-to-b from-[#0a2315] via-[#05361b] to-[#0c1a1f] relative border-b border-emerald-900/40">
              <div className="absolute top-3 left-4 text-[11px] font-mono text-emerald-400/80 tracking-widest uppercase">
                Zone 2 · Untamed Rainforest & Mercenary Outposts
              </div>
              {/* Winding river SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <path
                  d="M 0 50 Q 250 10, 500 70 T 1000 40"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="8"
                />
              </svg>
            </div>

            {/* South: Neon Metropolis (60-100%) */}
            <div className="h-[40%] bg-gradient-to-b from-[#0e1726] to-[#050811] relative">
              <div className="absolute top-3 left-4 text-[11px] font-mono text-rose-400/80 tracking-widest uppercase">
                Zone 1 · Isla Nova Neon Metropolis & Criminal Sandbox
              </div>
              {/* City Grid Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                <line x1="0" y1="40" x2="1000" y2="40" stroke="#f43f5e" strokeWidth="1" strokeDasharray="8 6" />
                <line x1="0" y1="80" x2="1000" y2="80" stroke="#f43f5e" strokeWidth="1" strokeDasharray="8 6" />
                <line x1="0" y1="130" x2="1000" y2="130" stroke="#f43f5e" strokeWidth="1" strokeDasharray="8 6" />
                <line x1="200" y1="0" x2="200" y2="200" stroke="#38bdf8" strokeWidth="1" strokeDasharray="8 6" />
                <line x1="500" y1="0" x2="500" y2="200" stroke="#38bdf8" strokeWidth="1" strokeDasharray="8 6" />
                <line x1="800" y1="0" x2="800" y2="200" stroke="#38bdf8" strokeWidth="1" strokeDasharray="8 6" />
              </svg>
            </div>
          </div>

          {/* Cargo Plane Flight Path Vector */}
          {showFlightPath && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <line
                x1="10%"
                y1="85%"
                x2="90%"
                y2="15%"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="6 6"
              />
              <circle cx="10%" cy="85%" r="6" fill="#f59e0b" />
              <circle cx="90%" cy="15%" r="6" fill="#f59e0b" />
              <text x="12%" y="83%" fill="#fef08a" fontSize="10" fontFamily="Space Mono">
                FLIGHT VECTOR INGRESS
              </text>
            </svg>
          )}

          {/* Bio-Chemical Storm Safe Ring */}
          {showStormCircle && (
            <div className="absolute top-[28%] left-[24%] w-[52%] h-[52%] rounded-full border-2 border-dashed border-emerald-400 pointer-events-none z-10 flex items-center justify-center">
              <span className="text-[10px] font-mono text-emerald-300 bg-black/60 px-2 py-0.5 rounded">
                SAFE ZONE
              </span>
            </div>
          )}

          {/* Interactive POI Markers */}
          {filteredPOIs.map((poi) => {
            const isSelected = selectedPOI?.id === poi.id;
            let markerColor = 'bg-neutral-800 text-white border-neutral-600';
            if (poi.type === 'VAULT') markerColor = 'bg-amber-950 text-amber-300 border-amber-500';
            if (poi.type === 'TOWER') markerColor = 'bg-sky-950 text-sky-300 border-sky-500';
            if (poi.type === 'BOSS') markerColor = 'bg-purple-950 text-purple-300 border-purple-500';
            if (poi.type === 'CAGE') markerColor = 'bg-orange-950 text-orange-300 border-orange-500';
            if (poi.type === 'SUPERCAR') markerColor = 'bg-rose-950 text-rose-300 border-rose-500';

            return (
              <button
                key={poi.id}
                onClick={() => setSelectedPOI(poi)}
                style={{ top: `${poi.y}%`, left: `${poi.x}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 p-2 rounded-full border shadow-xl transition-all duration-150 ${markerColor} ${
                  isSelected ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                }`}
                title={poi.name}
              >
                {poi.type === 'VAULT' && <DollarSign className="w-3.5 h-3.5" />}
                {poi.type === 'TOWER' && <Radio className="w-3.5 h-3.5" />}
                {poi.type === 'BOSS' && <Skull className="w-3.5 h-3.5" />}
                {poi.type === 'CAGE' && <Layers className="w-3.5 h-3.5" />}
                {poi.type === 'BUY_STATION' && <Shield className="w-3.5 h-3.5" />}
                {poi.type === 'SUPERCAR' && <Crosshair className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>

        {/* POI Intel Dossier Column */}
        <div className="flex flex-col gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <MapPin className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-display font-bold text-white tracking-wide">
              Tactical Island Intel
            </h3>
          </div>

          {selectedPOI ? (
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest">
                  {selectedPOI.zone.replace('_', ' ')} · {selectedPOI.type}
                </span>
                <h4 className="text-lg font-bold text-white mt-0.5">
                  {selectedPOI.name}
                </h4>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3.5 rounded-lg border border-neutral-800/80">
                {selectedPOI.description}
              </p>

              {/* Tactical Recommendations based on Type */}
              <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-xs font-mono">
                <span className="text-amber-400 font-semibold block mb-1">TACTICAL ADVANTAGE:</span>
                {selectedPOI.type === 'VAULT' && (
                  <p className="text-neutral-400">
                    Blowing the vault awards $8,500 cash. Beware: alerts NMPD police and increases wanted heat level.
                  </p>
                )}
                {selectedPOI.type === 'TOWER' && (
                  <p className="text-neutral-400">
                    Hacking reveals all 100 squad markers across a 600m sector. High mercenary presence on approach.
                  </p>
                )}
                {selectedPOI.type === 'BOSS' && (
                  <p className="text-neutral-400">
                    Killing Urias drops Tier-4 Mythic weapon (Parasite Bane Rail-AR). Extreme peril in zero-visibility fog.
                  </p>
                )}
                {selectedPOI.type === 'CAGE' && (
                  <p className="text-neutral-400">
                    Shoot open the cage from long range with a sniper rifle to turn apex predators against defending squads.
                  </p>
                )}
                {selectedPOI.type === 'SUPERCAR' && (
                  <p className="text-neutral-400">
                    High top speed enables rapid rotation out of the bio-chemical storm circle into urban high-ground.
                  </p>
                )}
                {selectedPOI.type === 'BUY_STATION' && (
                  <p className="text-neutral-400">
                    Purchase Custom Loadouts, UAV radar pings, and Precision Airstrikes with extracted robbery funds.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 font-mono">
              Select any Point of Interest marker on the Isla Nova map to inspect tactical intel.
            </p>
          )}

          {/* Island Coordinates Readout */}
          <div className="mt-auto pt-4 border-t border-neutral-800 text-xs font-mono text-neutral-500 flex justify-between">
            <span>ISLA NOVA SECTORS</span>
            <span>2,400 KM² TOTAL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
