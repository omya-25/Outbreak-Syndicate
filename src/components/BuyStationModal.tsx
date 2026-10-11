import React from 'react';
import { PlayerInventory, BuyStationItem } from '../types/game';
import { BUY_STATION_CATALOG } from '../data/gameData';
import { sound } from '../audio/soundEngine';
import { X, DollarSign, Box, Radio, Crosshair, HeartPulse, Shield, Package, Check } from 'lucide-react';

interface BuyStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: PlayerInventory;
  setInventory: React.Dispatch<React.SetStateAction<PlayerInventory>>;
}

export const BuyStationModal: React.FC<BuyStationModalProps> = ({
  isOpen,
  onClose,
  inventory,
  setInventory
}) => {
  if (!isOpen) return null;

  const handlePurchase = (item: BuyStationItem) => {
    if (inventory.cash < item.cost) return;

    sound.playCashChime();

    setInventory((prev) => {
      const nextCash = prev.cash - item.cost;
      let nextState = { ...prev, cash: nextCash };

      if (item.id === 'armor_satchel') {
        nextState.armorPlates = Math.min(8, prev.armorPlates + 5);
        nextState.activeArmor = 150;
      } else if (item.id === 'munitions_box') {
        nextState.currentAmmo = {
          AR: 240,
          SMG: 300,
          SNIPER: 40,
          SHOTGUN: 60,
          MYTHIC_HORROR: 150
        };
      } else if (item.id === 'self_revive') {
        nextState.hasSelfRevive = true;
      } else if (item.id === 'uav_radar') {
        nextState.uavActiveUntil = Date.now() + 35000;
      } else if (item.id === 'loadout_drop') {
        nextState.activeArmor = 150;
        nextState.armorPlates = 5;
      }

      return nextState;
    });
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'box': return <Box className="w-5 h-5 text-amber-400" />;
      case 'radio': return <Radio className="w-5 h-5 text-sky-400" />;
      case 'crosshair': return <Crosshair className="w-5 h-5 text-rose-400" />;
      case 'heart-pulse': return <HeartPulse className="w-5 h-5 text-emerald-400" />;
      case 'shield': return <Shield className="w-5 h-5 text-blue-400" />;
      case 'package': return <Package className="w-5 h-5 text-orange-400" />;
      default: return <DollarSign className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950/60 border border-emerald-500/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white tracking-wide">
                Underground Buy Station
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                Isla Nova Black Market Logistics Terminal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded font-mono text-emerald-400 text-sm font-bold">
              <span>AVAILABLE FUNDS:</span>
              <span className="tabular-nums">${inventory.cash.toLocaleString()}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
          {BUY_STATION_CATALOG.map((item) => {
            const canAfford = inventory.cash >= item.cost;
            const isOwnedSelfRevive = item.id === 'self_revive' && inventory.hasSelfRevive;

            return (
              <div
                key={item.id}
                className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg flex flex-col justify-between gap-3 hover:border-neutral-700 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-neutral-900 rounded-lg shrink-0">
                    {getIcon(item.iconName)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                  <span className="font-mono text-xs font-bold text-emerald-400 tabular-nums">
                    ${item.cost.toLocaleString()}
                  </span>

                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford || isOwnedSelfRevive}
                    className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-colors ${
                      isOwnedSelfRevive
                        ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                        : canAfford
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {isOwnedSelfRevive ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> EQUIPPED
                      </span>
                    ) : (
                      'Purchase'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/80 flex justify-between items-center text-xs font-mono text-neutral-500">
          <span>Press [ESC] or [B] to return to active combat</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors"
          >
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
