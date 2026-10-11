import React, { useState } from 'react';
import { FACTIONS_LORE } from '../data/gameData';
import { sound } from '../audio/soundEngine';
import { Shield, Skull, Radio, Volume2, Flame } from 'lucide-react';

export const DossierView: React.FC = () => {
  const [selectedFaction, setSelectedFaction] = useState(FACTIONS_LORE[0]);

  const playFactionAudio = (factionId: string) => {
    if (factionId === 'police') {
      sound.playPoliceSiren();
    } else if (factionId === 'mercs') {
      sound.playGunshot('AR');
    } else {
      sound.playBeastRoar(true);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Intro Header */}
      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl">
        <h2 className="text-xl font-display font-bold text-white tracking-wide">
          Republic of Isla Nova · Threat Dossier
        </h2>
        <p className="text-xs text-neutral-400 font-mono mt-1">
          Tactical intelligence on municipal authorities, jungle cartels, and gothic parasitic monstrosities.
        </p>
      </div>

      {/* 3 Major Pillars of Outbreak Syndicate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FACTIONS_LORE.map((faction) => {
          const isSelected = selectedFaction.id === faction.id;
          return (
            <button
              key={faction.id}
              onClick={() => setSelectedFaction(faction)}
              className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between gap-4 ${
                isSelected
                  ? 'bg-neutral-800 border-amber-500 shadow-lg ring-1 ring-amber-500/50'
                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest">
                    {faction.zone}
                  </span>
                  <div className="p-1.5 bg-neutral-950 rounded border border-neutral-800">
                    {faction.id === 'police' && <Shield className="w-4 h-4 text-sky-400" />}
                    {faction.id === 'mercs' && <Radio className="w-4 h-4 text-emerald-400" />}
                    {faction.id === 'gothic_cult' && <Skull className="w-4 h-4 text-purple-400" />}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mt-2 leading-snug">
                  {faction.title}
                </h3>
              </div>

              <div className="pt-3 border-t border-neutral-800/80 text-xs font-mono text-neutral-400 flex items-center justify-between">
                <span className="text-amber-400 font-semibold">{faction.threatLevel}</span>
                <span className="text-[10px] text-neutral-500">INSPECT INTEL →</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Dossier Detail Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
              FACTION CLASSIFICATION · {selectedFaction.zone}
            </span>
            <h3 className="text-2xl font-display font-bold text-white mt-1">
              {selectedFaction.title}
            </h3>
          </div>

          <button
            onClick={() => playFactionAudio(selectedFaction.id)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-200 transition-colors w-fit"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Play Audio Transmission</span>
          </button>
        </div>

        {/* Narrative & Mechanics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-mono text-amber-400 font-semibold tracking-wider uppercase">
              OPERATIONAL OVERVIEW & LORE:
            </h4>
            <p className="text-sm text-neutral-300 leading-relaxed bg-neutral-950 p-4 rounded-lg border border-neutral-800/80">
              {selectedFaction.overview}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-mono text-sky-400 font-semibold tracking-wider uppercase">
              RECOMMENDED SQUAD TACTICS & COUNTER-MEASURES:
            </h4>
            <p className="text-sm text-neutral-300 leading-relaxed bg-neutral-950 p-4 rounded-lg border border-neutral-800/80">
              {selectedFaction.tactic}
            </p>
          </div>
        </div>

        {/* Mechanics Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-neutral-800 font-mono text-xs">
          <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
            <span className="text-neutral-500 block mb-1">TERRAIN INFLUENCE:</span>
            <span className="text-neutral-200">
              {selectedFaction.id === 'police' ? 'Urban City & High-Speed Highway' : selectedFaction.id === 'mercs' ? 'Dense Canopy & Winding Rivers' : 'Sub-zero Mist & Ancient Graveyard'}
            </span>
          </div>

          <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
            <span className="text-neutral-500 block mb-1">UNIQUE INTERACTION:</span>
            <span className="text-neutral-200">
              {selectedFaction.id === 'police' ? 'Dynamic 1-5 Star Heat AI' : selectedFaction.id === 'mercs' ? 'Radio Towers & Caged Predators' : 'Boss Drops Mythic Weapon'}
            </span>
          </div>

          <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
            <span className="text-neutral-500 block mb-1">SURVIVAL DIFFICULTY:</span>
            <span className="text-amber-400 font-bold">
              {selectedFaction.id === 'police' ? 'Moderate (Escalating)' : selectedFaction.id === 'mercs' ? 'High Firepower' : 'Extreme Survival Dread'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
