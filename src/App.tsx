/**
 * Outbreak Syndicate
 * Seamless Hybrid of Battle Royale Survival, Open-World Crime, and Gothic Horror
 */

import React, { useState } from 'react';
import { AppTab, PlayerInventory, Weapon, GameContract, KillFeedEntry } from './types/game';
import { WEAPONS_DATABASE, DEFAULT_CONTRACTS } from './data/gameData';
import { sound } from './audio/soundEngine';
import { HeaderNav } from './components/HeaderNav';
import { GameCanvas } from './game/GameCanvas';
import { HUD } from './components/HUD';
import { BuyStationModal } from './components/BuyStationModal';
import { MapViewer } from './components/MapViewer';
import { GunsmithView } from './components/GunsmithView';
import { DossierView } from './components/DossierView';
import { ContractsView } from './components/ContractsView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('MATCH');
  const [isBuyStationOpen, setIsBuyStationOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Global Match & Inventory State
  const [inventory, setInventory] = useState<PlayerInventory>({
    primaryWeapon: WEAPONS_DATABASE[0], // M4-Syndicate
    secondaryWeapon: WEAPONS_DATABASE[1], // Vector-Apex
    activeWeaponSlot: 1,
    currentAmmo: {
      AR: 180,
      SMG: 210,
      SNIPER: 25,
      SHOTGUN: 40,
      MYTHIC_HORROR: 0
    },
    magAmmo: {
      1: WEAPONS_DATABASE[0].magSize,
      2: WEAPONS_DATABASE[1].magSize
    },
    armorPlates: 3,
    activeArmor: 100, // 2 full plates (50 each)
    maxArmor: 150, // 3 plates max
    cash: 4200,
    killstreaks: [],
    hasSelfRevive: false,
    uavActiveUntil: 0
  });

  const [killCount, setKillCount] = useState(0);
  const [playersAlive, setPlayersAlive] = useState(100);
  const [activeContract, setActiveContract] = useState<GameContract | null>(DEFAULT_CONTRACTS[0]);
  const [killFeed, setKillFeed] = useState<KillFeedEntry[]>([
    { id: 'kf_1', killer: 'ApexPhantom_82', victim: 'Talon Raider #01', weaponName: 'M4-Syndicate', timestamp: Date.now() - 5000 },
    { id: 'kf_2', killer: 'GhostRider_77', victim: 'Highland Grizzly', weaponName: 'Barrett .50 Cal', timestamp: Date.now() - 12000 }
  ]);

  const handleToggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleInsertPlate = () => {
    setInventory((prev) => {
      if (prev.armorPlates > 0 && prev.activeArmor < prev.maxArmor) {
        sound.playArmorPlate();
        const newArmor = Math.min(prev.maxArmor, prev.activeArmor + 50);
        return {
          ...prev,
          armorPlates: prev.armorPlates - 1,
          activeArmor: newArmor
        };
      }
      return prev;
    });
  };

  const handleSwitchWeapon = (slot: 1 | 2) => {
    setInventory((prev) => ({ ...prev, activeWeaponSlot: slot }));
  };

  const handleEquipPrimary = (weapon: Weapon) => {
    setInventory((prev) => ({
      ...prev,
      primaryWeapon: weapon,
      magAmmo: { ...prev.magAmmo, 1: weapon.magSize }
    }));
    sound.playReload();
  };

  const handleEquipSecondary = (weapon: Weapon) => {
    setInventory((prev) => ({
      ...prev,
      secondaryWeapon: weapon,
      magAmmo: { ...prev.magAmmo, 2: weapon.magSize }
    }));
    sound.playReload();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased">
      {/* Universal Top Bar Contract */}
      <HeaderNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onDeploy={() => {
          setCurrentTab('MATCH');
          setPlayersAlive(100);
          setKillCount(0);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* TAB 1: ACTIVE COMBAT MATCH */}
        {currentTab === 'MATCH' && (
          <div className="flex flex-col gap-4">
            {/* HUD Status Header */}
            <HUD
              inventory={inventory}
              killCount={killCount}
              playersAlive={playersAlive}
              killFeed={killFeed}
              activeContract={activeContract}
              onOpenBuyStation={() => setIsBuyStationOpen(true)}
              onOpenMap={() => setCurrentTab('MAP')}
              onInsertArmorPlate={handleInsertPlate}
              onSwitchWeapon={handleSwitchWeapon}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
            />

            {/* Playable 2D Canvas Game */}
            <GameCanvas
              onOpenBuyStation={() => setIsBuyStationOpen(true)}
              inventory={inventory}
              setInventory={setInventory}
              killCount={killCount}
              setKillCount={setKillCount}
              playersAlive={playersAlive}
              setPlayersAlive={setPlayersAlive}
              activeContract={activeContract}
              setActiveContract={setActiveContract}
              killFeed={killFeed}
              setKillFeed={setKillFeed}
            />

            {/* Tactical Controls & Keybinds Bar */}
            <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-400 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-white font-semibold">CONTROLS:</span>
                <span>[W,A,S,D] Move</span>
                <span>·</span>
                <span>[SPACE / SHIFT] Slide-Cancel</span>
                <span>·</span>
                <span>[L-CLICK] Shoot</span>
                <span>·</span>
                <span>[R-CLICK] Aim (ADS)</span>
                <span>·</span>
                <span>[E] Hijack / Rob / Hack / Cage</span>
                <span>·</span>
                <span>[R] Reload</span>
                <span>·</span>
                <span>[1 / 2] Switch Weapon</span>
                <span>·</span>
                <span>[3] Armor Plate</span>
                <span>·</span>
                <span>[B] Buy Station</span>
              </div>
              <div className="text-neutral-500">
                ISLA NOVA BATTLE ROYALE SIMULATION
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TACTICAL ISLAND MAP */}
        {currentTab === 'MAP' && <MapViewer />}

        {/* TAB 3: GUNSMITH & BALLISTICS BENCH */}
        {currentTab === 'GUNSMITH' && (
          <GunsmithView
            onEquipPrimary={handleEquipPrimary}
            onEquipSecondary={handleEquipSecondary}
            currentPrimary={inventory.primaryWeapon}
            currentSecondary={inventory.secondaryWeapon}
          />
        )}

        {/* TAB 4: THREAT DOSSIER */}
        {currentTab === 'DOSSIER' && <DossierView />}

        {/* TAB 5: MATCH CONTRACTS & BOUNTIES */}
        {currentTab === 'CONTRACTS' && (
          <ContractsView
            activeContract={activeContract}
            onSelectContract={(contract) => setActiveContract(contract)}
            onCancelContract={() => setActiveContract(null)}
          />
        )}
      </main>

      {/* Buy Station Modal Dialog */}
      <BuyStationModal
        isOpen={isBuyStationOpen}
        onClose={() => setIsBuyStationOpen(false)}
        inventory={inventory}
        setInventory={setInventory}
      />

      {/* Quiet Universal Clean Footer */}
      <footer className="w-full border-t border-neutral-900 bg-neutral-950 px-6 py-6 text-xs text-neutral-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span>Outbreak Syndicate</span>
          <span aria-hidden="true">·</span>
          <span>Republic of Isla Nova</span>
          <span aria-hidden="true">·</span>
          <span>100-Player Extraction Royale</span>
        </div>
        <div className="flex items-center gap-4 text-neutral-400">
          <span>Metropolis Sandbox</span>
          <span aria-hidden="true">·</span>
          <span>Far Cry Wilderness</span>
          <span aria-hidden="true">·</span>
          <span>Mount Tenebris Gothic Horror</span>
        </div>
      </footer>
    </div>
  );
}
