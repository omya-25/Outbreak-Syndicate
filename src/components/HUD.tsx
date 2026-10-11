import React from 'react';
import { PlayerInventory, KillFeedEntry, GameContract } from '../types/game';
import { sound } from '../audio/soundEngine';
import { Shield, Crosshair, DollarSign, Volume2, VolumeX, ShoppingBag, Radio } from 'lucide-react';

interface HUDProps {
  inventory: PlayerInventory;
  killCount: number;
  playersAlive: number;
  killFeed: KillFeedEntry[];
  activeContract: GameContract | null;
  onOpenBuyStation: () => void;
  onOpenMap: () => void;
  onInsertArmorPlate: () => void;
  onSwitchWeapon: (slot: 1 | 2) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  inventory,
  killCount,
  playersAlive,
  killFeed,
  activeContract,
  onOpenBuyStation,
  onOpenMap,
  onInsertArmorPlate,
  onSwitchWeapon,
  isMuted,
  onToggleMute
}) => {
  const activeWeapon = inventory.activeWeaponSlot === 1 ? inventory.primaryWeapon : inventory.secondaryWeapon;
  const currentMag = inventory.magAmmo[inventory.activeWeaponSlot];
  const reserves = inventory.currentAmmo[activeWeapon.category];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Top Match Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono">
        <div className="flex items-center gap-4 text-neutral-300">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">ALIVE:</span>
            <span className="text-white font-bold text-sm tabular-nums">{playersAlive} / 100</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">KILLS:</span>
            <span className="text-rose-400 font-bold text-sm tabular-nums">{killCount}</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm tabular-nums">${inventory.cash.toLocaleString()}</span>
          </div>
        </div>

        {/* Dynamic Contract Kicker */}
        {activeContract && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-950/60 border border-amber-600/50 rounded text-amber-300">
            <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate max-w-xs">{activeContract.title}</span>
            <span className="text-amber-500 font-bold">+${activeContract.reward}</span>
          </div>
        )}

        {/* Match Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMap}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
            title="Open Tactical Island Map"
          >
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Map</span>
          </button>
          <button
            onClick={onOpenBuyStation}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-300 rounded transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Buy Station [B]</span>
          </button>
          <button
            onClick={onToggleMute}
            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Combat Bottom Dock: Health/Armor on Left, Weapon & Reserves on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left: Health & 3 Armor Plates Carrier */}
        <div className="flex flex-col gap-2 p-3 bg-neutral-900/90 border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              ARMOR CARRIER ({inventory.activeArmor}/150)
            </span>
            <button
              onClick={onInsertArmorPlate}
              disabled={inventory.armorPlates === 0 || inventory.activeArmor >= inventory.maxArmor}
              className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 rounded text-[11px] transition-colors"
            >
              [3] Insert Plate ({inventory.armorPlates} Left)
            </button>
          </div>

          {/* 3 Armor Plate Bars */}
          <div className="grid grid-cols-3 gap-1.5 h-2.5 bg-neutral-950 p-0.5 rounded">
            {[0, 1, 2].map((plateIndex) => {
              const plateFill = Math.min(50, Math.max(0, inventory.activeArmor - plateIndex * 50));
              const percent = (plateFill / 50) * 100;
              return (
                <div key={plateIndex} className="bg-neutral-800 rounded-sm overflow-hidden h-full">
                  <div
                    className="bg-sky-400 h-full transition-all duration-150"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Base Health Bar */}
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex justify-between text-[11px] font-mono text-neutral-400">
              <span>VITALS</span>
              <span className="tabular-nums">100 / 100 HP</span>
            </div>
            <div className="h-1.5 bg-neutral-950 rounded overflow-hidden">
              <div className="bg-emerald-500 h-full w-full" />
            </div>
          </div>
        </div>

        {/* Right: Active Weapons & Slide-Cancel Shortcuts */}
        <div className="flex items-center justify-between p-3 bg-neutral-900/90 border border-neutral-800 rounded-lg font-mono">
          <div className="flex items-center gap-3">
            {/* Primary Weapon Slot */}
            <button
              onClick={() => onSwitchWeapon(1)}
              className={`p-2 rounded text-left border transition-all ${
                inventory.activeWeaponSlot === 1
                  ? 'bg-neutral-800 border-sky-500 text-white shadow-sm'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className="text-[10px] text-neutral-400">[1] PRIMARY</div>
              <div className="text-xs font-bold truncate max-w-[110px]">{inventory.primaryWeapon.name}</div>
            </button>

            {/* Secondary Weapon Slot */}
            <button
              onClick={() => onSwitchWeapon(2)}
              className={`p-2 rounded text-left border transition-all ${
                inventory.activeWeaponSlot === 2
                  ? 'bg-neutral-800 border-sky-500 text-white shadow-sm'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className="text-[10px] text-neutral-400">[2] SECONDARY</div>
              <div className="text-xs font-bold truncate max-w-[110px]">{inventory.secondaryWeapon.name}</div>
            </button>
          </div>

          {/* Mag Ammo & Reserve Counter */}
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-display font-bold text-white tabular-nums">
                {currentMag}
              </span>
              <span className="text-neutral-500 text-sm">/</span>
              <span className="text-neutral-400 text-sm tabular-nums">
                {reserves}
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
              {activeWeapon.category} · [R] RELOAD
            </span>
          </div>
        </div>
      </div>

      {/* Kill Feed (Recent eliminations on Isla Nova) */}
      {killFeed.length > 0 && (
        <div className="flex flex-col gap-1 px-2 py-1 text-xs font-mono text-neutral-400">
          {killFeed.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <span className="text-sky-400 font-medium">{item.killer}</span>
              <span className="text-neutral-600">[{item.weaponName}]</span>
              <span className="text-neutral-300">{item.victim}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
