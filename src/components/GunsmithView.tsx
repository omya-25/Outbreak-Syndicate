import React, { useState } from 'react';
import { Weapon } from '../types/game';
import { WEAPONS_DATABASE } from '../data/gameData';
import { sound } from '../audio/soundEngine';
import { Crosshair, Zap, Shield, Flame, Target, Play } from 'lucide-react';

interface GunsmithViewProps {
  onEquipPrimary: (weapon: Weapon) => void;
  onEquipSecondary: (weapon: Weapon) => void;
  currentPrimary: Weapon;
  currentSecondary: Weapon;
}

export const GunsmithView: React.FC<GunsmithViewProps> = ({
  onEquipPrimary,
  onEquipSecondary,
  currentPrimary,
  currentSecondary
}) => {
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon>(WEAPONS_DATABASE[0]);
  const [selectedOptic, setSelectedOptic] = useState('Red Dot Sight');
  const [selectedMuzzle, setSelectedMuzzle] = useState('Monolithic Suppressor');
  const [selectedMag, setSelectedMag] = useState('Extended Mag');
  const [isTestFiring, setIsTestFiring] = useState(false);

  const handleTestFire = () => {
    setIsTestFiring(true);
    sound.playGunshot(selectedWeapon.category);
    setTimeout(() => {
      sound.playHitMarker(false);
      setIsTestFiring(false);
    }, 120);
  };

  const getRarityBadge = (rarity: Weapon['rarity']) => {
    switch (rarity) {
      case 'Mythic':
        return <span className="text-purple-400 font-bold">MYTHIC</span>;
      case 'Legendary':
        return <span className="text-amber-400 font-bold">LEGENDARY</span>;
      case 'Epic':
        return <span className="text-indigo-400 font-bold">EPIC</span>;
      default:
        return <span className="text-sky-400 font-bold">RARE</span>;
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Arsenal Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {WEAPONS_DATABASE.map((weapon) => {
          const isSelected = selectedWeapon.id === weapon.id;
          const isPrimary = currentPrimary.id === weapon.id;
          const isSecondary = currentSecondary.id === weapon.id;

          return (
            <button
              key={weapon.id}
              onClick={() => setSelectedWeapon(weapon)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-neutral-800 border-sky-500 shadow-md ring-1 ring-sky-500/50'
                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="text-[10px] font-mono">{getRarityBadge(weapon.rarity)}</div>
                <h4 className="text-sm font-bold text-white mt-1 leading-snug">{weapon.name}</h4>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-[10px] font-mono text-neutral-400">
                <span>{weapon.category}</span>
                {isPrimary && <span className="text-sky-400 font-bold">[PRI]</span>}
                {isSecondary && <span className="text-amber-400 font-bold">[SEC]</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Gunsmith Inspection Bench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Weapon Showcase & Ballistics Telemetry */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                  {getRarityBadge(selectedWeapon.rarity)}
                  <span>·</span>
                  <span>CALIBER & BALLISTICS</span>
                  <span>·</span>
                  <span>{selectedWeapon.category} CLASS</span>
                </div>
                <h2 className="text-2xl font-display font-bold text-white mt-1">
                  {selectedWeapon.name}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEquipPrimary(selectedWeapon)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono rounded transition-colors"
                >
                  Set as Primary
                </button>
                <button
                  onClick={() => onEquipSecondary(selectedWeapon)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono rounded transition-colors"
                >
                  Set as Secondary
                </button>
              </div>
            </div>

            <p className="text-sm text-neutral-300 mt-4 leading-relaxed">
              {selectedWeapon.description}
            </p>
          </div>

          {/* Weapon Silhouette Graphic & Interactive Firing Tester */}
          <div className="relative h-48 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center overflow-hidden">
            <div className="text-center">
              <div className={`p-4 rounded-full inline-block transition-transform duration-100 ${
                isTestFiring ? 'scale-125 bg-rose-500/20' : 'bg-neutral-900'
              }`}>
                {selectedWeapon.category === 'SNIPER' ? (
                  <Crosshair className="w-16 h-16 text-sky-400" />
                ) : selectedWeapon.category === 'MYTHIC_HORROR' ? (
                  <Flame className="w-16 h-16 text-purple-400" />
                ) : (
                  <Target className="w-16 h-16 text-amber-400" />
                )}
              </div>
              <div className="mt-2 text-xs font-mono text-neutral-400">
                {selectedWeapon.name} [{selectedOptic} · {selectedMuzzle}]
              </div>
            </div>

            {/* Test Fire Action */}
            <button
              onClick={handleTestFire}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 rounded text-xs font-mono transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Fire Sound & Impulse</span>
            </button>
          </div>

          {/* Performance Stat Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-800 font-mono text-xs">
            <div>
              <div className="flex justify-between text-neutral-400 mb-1">
                <span>DAMAGE:</span>
                <span className="text-white font-bold">{selectedWeapon.damage} HP</span>
              </div>
              <div className="h-1.5 bg-neutral-950 rounded overflow-hidden">
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${Math.min(100, (selectedWeapon.damage / 140) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-neutral-400 mb-1">
                <span>FIRE RATE:</span>
                <span className="text-white font-bold">{selectedWeapon.fireRate} rps</span>
              </div>
              <div className="h-1.5 bg-neutral-950 rounded overflow-hidden">
                <div
                  className="bg-sky-400 h-full"
                  style={{ width: `${Math.min(100, (selectedWeapon.fireRate / 20) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-neutral-400 mb-1">
                <span>EFFECTIVE RANGE:</span>
                <span className="text-white font-bold">{selectedWeapon.range}m</span>
              </div>
              <div className="h-1.5 bg-neutral-950 rounded overflow-hidden">
                <div
                  className="bg-amber-400 h-full"
                  style={{ width: `${Math.min(100, (selectedWeapon.range / 850) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-neutral-400 mb-1">
                <span>MAGAZINE:</span>
                <span className="text-white font-bold">{selectedWeapon.magSize} Rds</span>
              </div>
              <div className="h-1.5 bg-neutral-950 rounded overflow-hidden">
                <div
                  className="bg-emerald-400 h-full"
                  style={{ width: `${Math.min(100, (selectedWeapon.magSize / 45) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-neutral-400 mb-1">
                <span>RELOAD SPEED:</span>
                <span className="text-white font-bold">{selectedWeapon.reloadTime}s</span>
              </div>
              <div className="h-1.5 bg-neutral-950 rounded overflow-hidden">
                <div
                  className="bg-purple-400 h-full"
                  style={{ width: `${Math.min(100, (1 - (selectedWeapon.reloadTime / 3.5)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-neutral-400 mb-1">
                <span>BULLET SPEED:</span>
                <span className="text-white font-bold">{selectedWeapon.bulletSpeed * 40} m/s</span>
              </div>
              <div className="h-1.5 bg-neutral-950 rounded overflow-hidden">
                <div
                  className="bg-cyan-400 h-full"
                  style={{ width: `${Math.min(100, (selectedWeapon.bulletSpeed / 25) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Tactical Attachments Customizer */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col gap-5">
          <div className="pb-3 border-b border-neutral-800">
            <h3 className="text-base font-display font-bold text-white tracking-wide">
              Gunsmith Attachments
            </h3>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Tune handling, recoil stabilization, and optics
            </p>
          </div>

          {/* Optic Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-neutral-400">OPTIC SIGHT:</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {['Red Dot Sight', 'Holo Reflex', 'Variable Zoom 8x', 'Iron Sights'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedOptic(opt)}
                  className={`p-2 rounded border text-left transition-colors ${
                    selectedOptic === opt
                      ? 'bg-neutral-800 border-sky-500 text-white font-medium'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Muzzle Attachment */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-neutral-400">MUZZLE ATTACHMENT:</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {['Monolithic Suppressor', 'Compensator Brake', 'Flash Hider', 'Extended Barrel'].map((muz) => (
                <button
                  key={muz}
                  onClick={() => setSelectedMuzzle(muz)}
                  className={`p-2 rounded border text-left transition-colors ${
                    selectedMuzzle === muz
                      ? 'bg-neutral-800 border-sky-500 text-white font-medium'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {muz}
                </button>
              ))}
            </div>
          </div>

          {/* Magazine Capacity */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-neutral-400">AMMUNITION / MAG:</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {['Extended Mag', 'Fast Mag Pull', 'Armor Piercing Rounds', 'Standard Mag'].map((mag) => (
                <button
                  key={mag}
                  onClick={() => setSelectedMag(mag)}
                  className={`p-2 rounded border text-left transition-colors ${
                    selectedMag === mag
                      ? 'bg-neutral-800 border-sky-500 text-white font-medium'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {mag}
                </button>
              ))}
            </div>
          </div>

          {/* Combat Tip */}
          <div className="mt-auto p-3.5 bg-neutral-950 rounded-lg border border-neutral-800 text-xs font-mono text-neutral-400">
            <span className="text-sky-400 font-bold block mb-1">PRO COMBAT TIP:</span>
            Slide-canceling resets tactical sprint delay immediately. Pair Vector-Apex with Barrett .50 Cal for coverage across both dense skyscraper interiors and open jungle fields.
          </div>
        </div>
      </div>
    </div>
  );
};
