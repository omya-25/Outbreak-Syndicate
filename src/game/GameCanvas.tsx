import React, { useEffect, useRef, useState } from 'react';
import {
  Weapon,
  PlayerInventory,
  Entity,
  Vehicle,
  RadioTower,
  AnimalCage,
  BankVault,
  KillFeedEntry,
  GameContract,
  StormCircle
} from '../types/game';
import { WEAPONS_DATABASE, BUY_STATION_CATALOG, DEFAULT_CONTRACTS } from '../data/gameData';
import { sound } from '../audio/soundEngine';

interface GameCanvasProps {
  onOpenBuyStation: () => void;
  onSelectContract?: (contract: GameContract) => void;
  inventory: PlayerInventory;
  setInventory: React.Dispatch<React.SetStateAction<PlayerInventory>>;
  killCount: number;
  setKillCount: React.Dispatch<React.SetStateAction<number>>;
  playersAlive: number;
  setPlayersAlive: React.Dispatch<React.SetStateAction<number>>;
  activeContract: GameContract | null;
  setActiveContract: React.Dispatch<React.SetStateAction<GameContract | null>>;
  killFeed: KillFeedEntry[];
  setKillFeed: React.Dispatch<React.SetStateAction<KillFeedEntry[]>>;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
}

interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  rangeRemaining: number;
  isPlayer: boolean;
  color: string;
  weaponCategory: Weapon['category'];
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onOpenBuyStation,
  inventory,
  setInventory,
  killCount,
  setKillCount,
  playersAlive,
  setPlayersAlive,
  activeContract,
  setActiveContract,
  setKillFeed
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game World Coordinates (Map is 2400 x 2400)
  const [playerPos, setPlayerPos] = useState({ x: 1200, y: 1900, angle: 0 });
  const [playerHealth, setPlayerHealth] = useState(100);
  const [inVehicle, setInVehicle] = useState<string | null>(null);
  const [heatLevel, setHeatLevel] = useState(0); // 0 to 5 Wanted stars
  const [interactPrompt, setInteractPrompt] = useState<string | null>(null);
  const [isSliding, setIsSliding] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // References to keep game loop running at 60fps without React state latency
  const stateRef = useRef({
    keys: {} as Record<string, boolean>,
    mousePos: { x: 0, y: 0, worldX: 1200, worldY: 1900, isDown: false, isRightDown: false },
    player: {
      x: 1200,
      y: 1900,
      vx: 0,
      vy: 0,
      angle: 0,
      health: 100,
      maxHealth: 100,
      speed: 4.8,
      slideTime: 0,
      slideCooldown: 0,
      inVehicleId: null as string | null,
      reloadEndTime: 0
    },
    camera: { x: 1200, y: 1900 },
    storm: {
      centerX: 1200,
      centerY: 1200,
      currentRadius: 1500,
      targetRadius: 750,
      targetCenterX: 1100,
      targetCenterY: 1050,
      shrinkRate: 0.35,
      phase: 1,
      nextShrinkTime: 45,
      isShrinking: false,
      damagePerSec: 6
    } as StormCircle,
    bullets: [] as Bullet[],
    particles: [] as Particle[],
    entities: [] as Entity[],
    vehicles: [] as Vehicle[],
    radioTowers: [] as RadioTower[],
    animalCages: [] as AnimalCage[],
    vaults: [] as BankVault[],
    lastShotTime: 0,
    radarPingTime: 0,
    aliveCount: 100
  });

  // Setup initial world entities: Vehicles, Towers, Cages, Vaults, Bots, Mutants, Wildlife
  useEffect(() => {
    const s = stateRef.current;

    // 1. Vehicles
    s.vehicles = [
      {
        id: 'car_super_1',
        x: 1100,
        y: 1850,
        vx: 0,
        vy: 0,
        angle: 0,
        speed: 0,
        maxSpeed: 10.5,
        health: 250,
        maxHealth: 250,
        name: 'Pegassi Infernus GT',
        type: 'supercar',
        driverId: null,
        color: '#f43f5e'
      },
      {
        id: 'car_muscle_1',
        x: 1350,
        y: 2050,
        vx: 0,
        vy: 0,
        angle: Math.PI / 2,
        speed: 0,
        maxSpeed: 9.0,
        health: 320,
        maxHealth: 320,
        name: 'Vapid Dominator 500',
        type: 'muscle',
        driverId: null,
        color: '#f59e0b'
      },
      {
        id: 'car_police_1',
        x: 850,
        y: 1600,
        vx: 0,
        vy: 0,
        angle: 0,
        speed: 0,
        maxSpeed: 8.5,
        health: 280,
        maxHealth: 280,
        name: 'NMPD Interceptor Cruiser',
        type: 'patrol_cruiser',
        driverId: null,
        color: '#3b82f6'
      },
      {
        id: 'car_buggy_1',
        x: 750,
        y: 1100,
        vx: 0,
        vy: 0,
        angle: -Math.PI / 4,
        speed: 0,
        maxSpeed: 8.0,
        health: 220,
        maxHealth: 220,
        name: 'Jungle Outpost Buggy 4x4',
        type: 'jungle_buggy',
        driverId: null,
        color: '#10b981'
      }
    ];

    // 2. Radio Towers (Far Cry jungle mechanic)
    s.radioTowers = [
      { id: 'tower_1', x: 650, y: 950, captured: false, captureProgress: 0, name: 'Western Jungle Relay Station' },
      { id: 'tower_2', x: 1500, y: 800, captured: false, captureProgress: 0, name: 'Eastern Canopy Watchtower' }
    ];

    // 3. Animal Cages (Far Cry tactical mechanic)
    s.animalCages = [
      { id: 'cage_1', x: 920, y: 1050, isOpen: false, animalType: 'wildlife_tiger', health: 100 },
      { id: 'cage_2', x: 1400, y: 1100, isOpen: false, animalType: 'wildlife_bear', health: 120 }
    ];

    // 4. Bank of Nova Vault (GTA heist mechanic)
    s.vaults = [
      { id: 'vault_main', name: 'Bank of Nova Main Vault', x: 1250, y: 1750, blown: false, blowProgress: 0, cashReward: 8500 }
    ];

    // 5. Populate Island with 100 initial players & threats
    const initialEntities: Entity[] = [];

    // Metro Police units
    initialEntities.push(
      { id: 'pol_1', x: 800, y: 1620, vx: 0, vy: 0, rotation: 0, health: 90, maxHealth: 90, type: 'police', state: 'patrol', name: 'NMPD Officer Higgins' },
      { id: 'pol_2', x: 900, y: 1650, vx: 0, vy: 0, rotation: 0, health: 90, maxHealth: 90, type: 'police', state: 'patrol', name: 'NMPD Sergeant Ramos' }
    );

    // Far Cry Jungle Mercenaries
    initialEntities.push(
      { id: 'merc_1', x: 620, y: 980, vx: 0, vy: 0, rotation: 0, health: 110, maxHealth: 110, type: 'mercenary', state: 'patrol', name: 'Talon Raider #01' },
      { id: 'merc_2', x: 700, y: 930, vx: 0, vy: 0, rotation: 0, health: 110, maxHealth: 110, type: 'mercenary', state: 'patrol', name: 'Talon Gunner #02' },
      { id: 'merc_3', x: 1530, y: 820, vx: 0, vy: 0, rotation: 0, health: 110, maxHealth: 110, type: 'mercenary', state: 'patrol', name: 'Talon Enforcer #03' }
    );

    // Roaming Jungle Wildlife
    initialEntities.push(
      { id: 'tiger_wild_1', x: 1150, y: 1100, vx: 0, vy: 0, rotation: 0, health: 130, maxHealth: 130, type: 'wildlife_tiger', state: 'idle', name: 'Wild Bengal Tiger' },
      { id: 'bear_wild_1', x: 1650, y: 950, vx: 0, vy: 0, rotation: 0, health: 220, maxHealth: 220, type: 'wildlife_bear', state: 'idle', name: 'Highland Grizzly Bear' }
    );

    // Resident Evil Gothic Mount Tenebris Horrors & Boss
    initialEntities.push(
      { id: 'lycan_1', x: 1150, y: 480, vx: 0, vy: 0, rotation: 0, health: 120, maxHealth: 120, type: 'lycan', state: 'patrol', name: 'Feral Tenebris Lycan' },
      { id: 'lycan_2', x: 1300, y: 420, vx: 0, vy: 0, rotation: 0, health: 120, maxHealth: 120, type: 'lycan', state: 'patrol', name: 'Village Stalker Beast' },
      // Towering Boss Monstrosity
      {
        id: 'boss_urias',
        x: 1200,
        y: 280,
        vx: 0,
        vy: 0,
        rotation: 0,
        health: 850,
        maxHealth: 850,
        type: 'boss_mutant',
        state: 'idle',
        name: 'Urias the Parasitic Behemoth'
      }
    );

    // 25 Rival Battle Royale Squads (roaming Isla Nova)
    const botNames = [
      'GhostRider_77', 'ApexPhantom', 'ViperNova', 'ShadowKilla', 'Reaper99', 'NeonDrifter',
      'BulletStorm', 'FrostByte', 'ZeroGravity', 'IronClad', 'SilentEcho', 'RogueSniper',
      'TitanStrike', 'CrimsonWolf', 'StormSurge', 'NovaKing', 'DarkSamurai', 'VortexPrime'
    ];

    for (let i = 0; i < 28; i++) {
      const bx = 400 + Math.random() * 1600;
      const by = 500 + Math.random() * 1700;
      const randomWeapon = WEAPONS_DATABASE[Math.floor(Math.random() * (WEAPONS_DATABASE.length - 2))];
      initialEntities.push({
        id: `bot_${i}`,
        x: bx,
        y: by,
        vx: 0,
        vy: 0,
        rotation: Math.random() * Math.PI * 2,
        health: 100,
        maxHealth: 100,
        type: 'enemy_bot',
        squadId: Math.floor(i / 4) + 1,
        name: botNames[i % botNames.length] + `_${Math.floor(Math.random() * 90 + 10)}`,
        state: 'patrol',
        weapon: randomWeapon,
        shootCooldown: Math.random() * 60
      });
    }

    s.entities = initialEntities;
    s.aliveCount = 99; // 99 opponents + player = 100 players
    setPlayersAlive(100);
  }, [setPlayersAlive]);

  // Keyboard and Mouse Event Listeners
  useEffect(() => {
    const s = stateRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      s.keys[key] = true;

      // 'Shift' or 'Space' -> Tactical Slide-Cancel
      if ((e.code === 'Space' || e.shiftKey) && !isSliding && s.player.slideCooldown <= 0 && !s.player.inVehicleId) {
        setIsSliding(true);
        s.player.slideTime = 22; // frames of slide
        s.player.slideCooldown = 45; // cooldown
        sound.playSlideCancel();
        // Spawn slide particles
        for (let i = 0; i < 8; i++) {
          s.particles.push({
            x: s.player.x,
            y: s.player.y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            color: '#94a3b8',
            size: Math.random() * 4 + 2,
            alpha: 0.7,
            decay: 0.05
          });
        }
      }

      // 'R' -> Tactical Reload
      if (key === 'r' && !isReloading && !s.player.inVehicleId) {
        triggerReload();
      }

      // '1' / '2' -> Weapon switch
      if (key === '1') {
        setInventory(prev => ({ ...prev, activeWeaponSlot: 1 }));
      } else if (key === '2') {
        setInventory(prev => ({ ...prev, activeWeaponSlot: 2 }));
      }

      // '3' -> Insert Armor Plate
      if (key === '3') {
        applyArmorPlate();
      }

      // 'B' -> Open Buy Station
      if (key === 'b') {
        onOpenBuyStation();
      }

      // 'E' -> Tactical Interact (Enter/Exit vehicle, Rob vault, Hack tower, Shoot cage)
      if (key === 'e') {
        handleInteract();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      s.keys[e.key.toLowerCase()] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseScreenX = e.clientX - rect.left;
      const mouseScreenY = e.clientY - rect.top;
      s.mousePos.x = mouseScreenX;
      s.mousePos.y = mouseScreenY;

      // Convert screen pos to world pos
      const worldX = mouseScreenX - canvas.width / 2 + s.camera.x;
      const worldY = mouseScreenY - canvas.height / 2 + s.camera.y;
      s.mousePos.worldX = worldX;
      s.mousePos.worldY = worldY;

      // Player rotation points towards mouse
      s.player.angle = Math.atan2(worldY - s.player.y, worldX - s.player.x);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) s.mousePos.isDown = true;
      if (e.button === 2) s.mousePos.isRightDown = true;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) s.mousePos.isDown = false;
      if (e.button === 2) s.mousePos.isRightDown = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSliding, isReloading, onOpenBuyStation]);

  // Insert Armor Plate function
  const applyArmorPlate = () => {
    setInventory(prev => {
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

  // Weapon Reload function
  const triggerReload = () => {
    const curWeapon = inventory.activeWeaponSlot === 1 ? inventory.primaryWeapon : inventory.secondaryWeapon;
    const curMag = inventory.magAmmo[inventory.activeWeaponSlot];
    const reserves = inventory.currentAmmo[curWeapon.category];

    if (curMag < curWeapon.magSize && reserves > 0) {
      setIsReloading(true);
      sound.playReload();
      stateRef.current.player.reloadEndTime = Date.now() + curWeapon.reloadTime * 1000;

      setTimeout(() => {
        setInventory(prev => {
          const needed = curWeapon.magSize - prev.magAmmo[prev.activeWeaponSlot];
          const toAdd = Math.min(needed, prev.currentAmmo[curWeapon.category]);
          return {
            ...prev,
            magAmmo: {
              ...prev.magAmmo,
              [prev.activeWeaponSlot]: prev.magAmmo[prev.activeWeaponSlot] + toAdd
            },
            currentAmmo: {
              ...prev.currentAmmo,
              [curWeapon.category]: Math.max(0, prev.currentAmmo[curWeapon.category] - toAdd)
            }
          };
        });
        setIsReloading(false);
      }, curWeapon.reloadTime * 1000);
    }
  };

  // Interaction key handler ('E')
  const handleInteract = () => {
    const s = stateRef.current;
    const px = s.player.x;
    const py = s.player.y;

    // 1. If currently inside a vehicle, exit vehicle!
    if (s.player.inVehicleId) {
      const v = s.vehicles.find(veh => veh.id === s.player.inVehicleId);
      if (v) {
        v.driverId = null;
        s.player.x = v.x + Math.cos(v.angle + Math.PI / 2) * 40;
        s.player.y = v.y + Math.sin(v.angle + Math.PI / 2) * 40;
      }
      s.player.inVehicleId = null;
      setInVehicle(null);
      return;
    }

    // 2. Check nearby Vehicles to Hijack
    for (const v of s.vehicles) {
      const dist = Math.hypot(v.x - px, v.y - py);
      if (dist < 60) {
        v.driverId = 'player';
        s.player.inVehicleId = v.id;
        setInVehicle(v.name);
        sound.playCarEngine();
        // If police car or stolen supercar in city, bump heat
        if (v.type === 'patrol_cruiser' || py > 1300) {
          setHeatLevel(prev => Math.min(5, prev + 1));
          sound.playPoliceSiren();
        }
        return;
      }
    }

    // 3. Check Bank Vault (Blow open with C4 / Heist)
    for (const vault of s.vaults) {
      const dist = Math.hypot(vault.x - px, vault.y - py);
      if (dist < 80 && !vault.blown) {
        vault.blown = true;
        sound.playExplosion();
        sound.playCashChime();
        setInventory(prev => ({ ...prev, cash: prev.cash + vault.cashReward }));
        setHeatLevel(prev => Math.min(5, prev + 2)); // High wanted level
        sound.playPoliceSiren();

        // Spawn gold/cash particles
        for (let i = 0; i < 30; i++) {
          s.particles.push({
            x: vault.x,
            y: vault.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            color: '#10b981',
            size: Math.random() * 5 + 3,
            alpha: 1,
            decay: 0.02
          });
        }

        // Add contract completion if active
        if (activeContract && activeContract.type === 'VAULT_HEIST') {
          setActiveContract(prev => prev ? { ...prev, completed: true } : null);
        }
        return;
      }
    }

    // 4. Check Radio Towers (Far Cry radar hack)
    for (const tower of s.radioTowers) {
      const dist = Math.hypot(tower.x - px, tower.y - py);
      if (dist < 90 && !tower.captured) {
        tower.captured = true;
        sound.playTowerCaptured();
        // Set UAV active for 45s (revealing all enemies)
        setInventory(prev => ({
          ...prev,
          uavActiveUntil: Date.now() + 45000,
          cash: prev.cash + 3000
        }));

        if (activeContract && activeContract.type === 'TOWER_HACK') {
          setActiveContract(prev => prev ? { ...prev, completed: true } : null);
        }
        return;
      }
    }

    // 5. Check Animal Cages (Shoot/Unlock cage to release beast)
    for (const cage of s.animalCages) {
      const dist = Math.hypot(cage.x - px, cage.y - py);
      if (dist < 80 && !cage.isOpen) {
        cage.isOpen = true;
        sound.playBeastRoar(false);
        // Spawn released aggressive animal
        s.entities.push({
          id: `beast_released_${Date.now()}`,
          x: cage.x + 20,
          y: cage.y,
          vx: 0,
          vy: 0,
          rotation: 0,
          health: 160,
          maxHealth: 160,
          type: cage.animalType,
          state: 'chase',
          name: cage.animalType === 'wildlife_tiger' ? 'Freed Bengal Tiger' : 'Rampaging Grizzly'
        });
        return;
      }
    }

    // 6. Check Underground Buy Station terminal
    const buyStationDist = Math.hypot(1200 - px, 1800 - py);
    if (buyStationDist < 80) {
      onOpenBuyStation();
    }
  };

  // Main 60FPS Game Loop
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const s = stateRef.current;
      const curWeapon = inventory.activeWeaponSlot === 1 ? inventory.primaryWeapon : inventory.secondaryWeapon;

      // Update Screen Dimensions
      if (canvas.width !== canvas.parentElement?.clientWidth || canvas.height !== canvas.parentElement?.clientHeight) {
        canvas.width = canvas.parentElement?.clientWidth || 1000;
        canvas.height = canvas.parentElement?.clientHeight || 650;
      }

      // ==========================================
      // 1. PLAYER & VEHICLE PHYSICS
      // ==========================================
      if (s.player.inVehicleId) {
        // Driving vehicle mode
        const v = s.vehicles.find(veh => veh.id === s.player.inVehicleId);
        if (v) {
          // Accelerate / Brake with W/S, Steer with A/D
          if (s.keys['w'] || s.keys['arrowup']) {
            v.speed = Math.min(v.maxSpeed, v.speed + 0.35);
          } else if (s.keys['s'] || s.keys['arrowdown']) {
            v.speed = Math.max(-v.maxSpeed * 0.4, v.speed - 0.3);
          } else {
            v.speed *= 0.96; // friction drag
          }

          if (Math.abs(v.speed) > 0.5) {
            const steerDir = (s.keys['a'] || s.keys['arrowleft']) ? -1 : (s.keys['d'] || s.keys['arrowright']) ? 1 : 0;
            v.angle += steerDir * 0.045 * (v.speed > 0 ? 1 : -1);
          }

          v.x += Math.cos(v.angle) * v.speed;
          v.y += Math.sin(v.angle) * v.speed;

          // Keep in bounds
          v.x = Math.max(100, Math.min(2300, v.x));
          v.y = Math.max(100, Math.min(2300, v.y));

          // Player follows vehicle
          s.player.x = v.x;
          s.player.y = v.y;
          s.player.angle = v.angle;

          // Tire smoke particles when speeding/drifting
          if (Math.abs(v.speed) > 5 && Math.random() < 0.4) {
            s.particles.push({
              x: v.x - Math.cos(v.angle) * 30,
              y: v.y - Math.sin(v.angle) * 30,
              vx: (Math.random() - 0.5) * 1.5,
              vy: (Math.random() - 0.5) * 1.5,
              color: '#64748b',
              size: Math.random() * 6 + 3,
              alpha: 0.5,
              decay: 0.04
            });
          }

          // Run over bots if moving fast
          if (Math.abs(v.speed) > 4) {
            for (const bot of s.entities) {
              if (bot.health > 0) {
                const bdist = Math.hypot(bot.x - v.x, bot.y - v.y);
                if (bdist < 35) {
                  bot.health -= Math.abs(v.speed) * 15;
                  sound.playHitMarker(false);
                  if (bot.health <= 0) {
                    handleEntityKilled('Player', bot);
                  }
                }
              }
            }
          }
        }
      } else {
        // On-foot infantry mode (COD slide-canceling, sprint, strafe)
        let moveX = 0;
        let moveY = 0;
        if (s.keys['w'] || s.keys['arrowup']) moveY -= 1;
        if (s.keys['s'] || s.keys['arrowdown']) moveY += 1;
        if (s.keys['a'] || s.keys['arrowleft']) moveX -= 1;
        if (s.keys['d'] || s.keys['arrowright']) moveX += 1;

        if (moveX !== 0 && moveY !== 0) {
          moveX *= 0.7071;
          moveY *= 0.7071;
        }

        // Slide mechanic speed boost
        let currentSpeed = s.player.speed;
        if (s.player.slideTime > 0) {
          s.player.slideTime--;
          currentSpeed *= 1.85; // slide boost!
          if (s.player.slideTime === 0) {
            setIsSliding(false);
          }
        }
        if (s.player.slideCooldown > 0) {
          s.player.slideCooldown--;
        }

        s.player.x += moveX * currentSpeed;
        s.player.y += moveY * currentSpeed;

        // Island boundaries
        s.player.x = Math.max(100, Math.min(2300, s.player.x));
        s.player.y = Math.max(100, Math.min(2300, s.player.y));
      }

      setPlayerPos({ x: s.player.x, y: s.player.y, angle: s.player.angle });

      // Smooth Camera follows player
      s.camera.x += (s.player.x - s.camera.x) * 0.1;
      s.camera.y += (s.player.y - s.camera.y) * 0.1;

      // ==========================================
      // 2. SHOOTING & COMBAT (MOUSE CLICK)
      // ==========================================
      if (s.mousePos.isDown && !s.player.inVehicleId && !isReloading && currentTime - s.lastShotTime > (1000 / curWeapon.fireRate)) {
        if (inventory.magAmmo[inventory.activeWeaponSlot] > 0) {
          s.lastShotTime = currentTime;
          sound.playGunshot(curWeapon.category);

          // Recoil spread angle (reduced when ADS right-clicking)
          const recoilAngle = (Math.random() - 0.5) * (s.mousePos.isRightDown ? curWeapon.recoil * 0.25 : curWeapon.recoil);
          const shootAngle = s.player.angle + recoilAngle;

          // Consume 1 ammo from mag
          setInventory(prev => ({
            ...prev,
            magAmmo: {
              ...prev.magAmmo,
              [prev.activeWeaponSlot]: prev.magAmmo[prev.activeWeaponSlot] - 1
            }
          }));

          // Bullet color
          const bulletColor = curWeapon.rarity === 'Mythic' ? '#a855f7' : (curWeapon.rarity === 'Legendary' ? '#eab308' : '#38bdf8');

          // Shotgun fires 5 buckshot pellets, other weapons fire 1 heavy bullet
          const pelletCount = curWeapon.category === 'SHOTGUN' ? 6 : 1;
          for (let p = 0; p < pelletCount; p++) {
            const spread = (Math.random() - 0.5) * (curWeapon.category === 'SHOTGUN' ? 0.35 : 0.05);
            s.bullets.push({
              id: `bullet_${Date.now()}_${p}`,
              x: s.player.x + Math.cos(s.player.angle) * 18,
              y: s.player.y + Math.sin(s.player.angle) * 18,
              vx: Math.cos(shootAngle + spread) * curWeapon.bulletSpeed,
              vy: Math.sin(shootAngle + spread) * curWeapon.bulletSpeed,
              damage: curWeapon.category === 'SHOTGUN' ? curWeapon.damage / 4 : curWeapon.damage,
              rangeRemaining: curWeapon.range,
              isPlayer: true,
              color: bulletColor,
              weaponCategory: curWeapon.category
            });
          }

          // Muzzle flash particle
          s.particles.push({
            x: s.player.x + Math.cos(s.player.angle) * 22,
            y: s.player.y + Math.sin(s.player.angle) * 22,
            vx: Math.cos(s.player.angle) * 2,
            vy: Math.sin(s.player.angle) * 2,
            color: '#fef08a',
            size: 6,
            alpha: 1,
            decay: 0.15
          });
        } else {
          // Trigger automatic reload if mag empty
          triggerReload();
        }
      }

      // ==========================================
      // 3. BULLETS SIMULATION & COLLISION
      // ==========================================
      for (let i = s.bullets.length - 1; i >= 0; i--) {
        const b = s.bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.rangeRemaining -= Math.hypot(b.vx, b.vy);

        if (b.rangeRemaining <= 0) {
          s.bullets.splice(i, 1);
          continue;
        }

        // Bullet hit check against entities
        if (b.isPlayer) {
          for (const ent of s.entities) {
            if (ent.health > 0) {
              const hitDist = Math.hypot(ent.x - b.x, ent.y - b.y);
              const hitRadius = ent.type === 'boss_mutant' ? 38 : 18;
              if (hitDist < hitRadius) {
                ent.health -= b.damage;
                sound.playHitMarker(hitDist < 8); // Headshot if close to center

                // Hit spark particle
                for (let p = 0; p < 4; p++) {
                  s.particles.push({
                    x: b.x,
                    y: b.y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    color: ent.type.includes('mutant') || ent.type === 'lycan' ? '#84cc16' : '#ef4444',
                    size: 3,
                    alpha: 1,
                    decay: 0.08
                  });
                }

                if (ent.health <= 0) {
                  handleEntityKilled('Player', ent);
                }

                s.bullets.splice(i, 1);
                break;
              }
            }
          }
        } else {
          // Enemy bullet hitting player
          const pdist = Math.hypot(s.player.x - b.x, s.player.y - b.y);
          if (pdist < 18) {
            applyDamageToPlayer(b.damage, 'Enemy Operator');
            s.bullets.splice(i, 1);
          }
        }
      }

      // ==========================================
      // 4. ENTITY AI & WILDLIFE BEHAVIORS
      // ==========================================
      for (const ent of s.entities) {
        if (ent.health <= 0) continue;

        const distToPlayer = Math.hypot(s.player.x - ent.x, s.player.y - ent.y);

        // A. Resident Evil Gothic Boss: Urias the Parasitic Behemoth
        if (ent.type === 'boss_mutant') {
          if (distToPlayer < 450) {
            // Roar and charge towards player
            ent.rotation = Math.atan2(s.player.y - ent.y, s.player.x - ent.x);
            ent.x += Math.cos(ent.rotation) * 2.8;
            ent.y += Math.sin(ent.rotation) * 2.8;

            if (distToPlayer < 55 && Math.random() < 0.05) {
              sound.playBeastRoar(true);
              applyDamageToPlayer(35, 'Urias the Parasitic Behemoth');
            }
          }
        }
        // B. Gothic Lycan Creatures (Fast leaping ambush)
        else if (ent.type === 'lycan') {
          if (distToPlayer < 380) {
            ent.rotation = Math.atan2(s.player.y - ent.y, s.player.x - ent.x);
            ent.x += Math.cos(ent.rotation) * 4.2; // Very fast
            ent.y += Math.sin(ent.rotation) * 4.2;

            if (distToPlayer < 35 && Math.random() < 0.08) {
              sound.playBeastRoar(false);
              applyDamageToPlayer(20, 'Feral Lycan');
            }
          }
        }
        // C. Roaming Wildlife Tigers & Bears
        else if (ent.type === 'wildlife_tiger' || ent.type === 'wildlife_bear') {
          // Hunt closest target (either player or nearby bots)
          if (distToPlayer < 320) {
            ent.rotation = Math.atan2(s.player.y - ent.y, s.player.x - ent.x);
            const animalSpeed = ent.type === 'wildlife_tiger' ? 3.8 : 2.5;
            ent.x += Math.cos(ent.rotation) * animalSpeed;
            ent.y += Math.sin(ent.rotation) * animalSpeed;

            if (distToPlayer < 35 && Math.random() < 0.06) {
              sound.playBeastRoar(false);
              applyDamageToPlayer(ent.type === 'wildlife_tiger' ? 24 : 32, ent.name || 'Predator');
            }
          }
        }
        // D. Police & Mercenaries & Battle Royale Bots (Firearms)
        else {
          // Chase player if in range or if player has heat
          if (distToPlayer < 400 || (ent.type === 'police' && heatLevel > 0 && distToPlayer < 700)) {
            ent.rotation = Math.atan2(s.player.y - ent.y, s.player.x - ent.x);

            // Move into tactical firing range (200px)
            if (distToPlayer > 220) {
              ent.x += Math.cos(ent.rotation) * 2.5;
              ent.y += Math.sin(ent.rotation) * 2.5;
            }

            // Shoot at player with realistic cooldown
            if (!ent.shootCooldown) ent.shootCooldown = 40;
            ent.shootCooldown--;

            if (ent.shootCooldown <= 0) {
              ent.shootCooldown = Math.floor(Math.random() * 35 + 25);
              const botSpread = (Math.random() - 0.5) * 0.2;
              s.bullets.push({
                id: `bot_bullet_${Date.now()}_${Math.random()}`,
                x: ent.x + Math.cos(ent.rotation) * 16,
                y: ent.y + Math.sin(ent.rotation) * 16,
                vx: Math.cos(ent.rotation + botSpread) * 11,
                vy: Math.sin(ent.rotation + botSpread) * 11,
                damage: 14,
                rangeRemaining: 400,
                isPlayer: false,
                color: ent.type === 'police' ? '#60a5fa' : '#f87171',
                weaponCategory: 'AR'
              });
            }
          } else {
            // Idle wander
            if (Math.random() < 0.02) {
              ent.rotation += (Math.random() - 0.5) * 1.5;
            }
            ent.x += Math.cos(ent.rotation) * 0.8;
            ent.y += Math.sin(ent.rotation) * 0.8;
          }
        }
      }

      // ==========================================
      // 5. TOXIC BIO-CHEMICAL STORM CIRCLE SHRINK
      // ==========================================
      const st = s.storm;
      st.nextShrinkTime -= dt;

      if (st.nextShrinkTime <= 0) {
        if (!st.isShrinking) {
          st.isShrinking = true;
          sound.playStormWarning();
        }

        // Shrink current radius towards target radius
        if (st.currentRadius > st.targetRadius) {
          st.currentRadius -= st.shrinkRate * 60 * dt;
          st.centerX += (st.targetCenterX - st.centerX) * 0.001;
          st.centerY += (st.targetCenterY - st.centerY) * 0.001;
        } else {
          // Advance to next circle phase
          st.phase++;
          st.isShrinking = false;
          st.nextShrinkTime = 40;
          st.targetRadius = Math.max(200, st.targetRadius * 0.65);
          // Pick randomized final circle epicenter (City, Jungle, or Gothic Peak!)
          st.targetCenterX = 600 + Math.random() * 1200;
          st.targetCenterY = 400 + Math.random() * 1400;
        }
      }

      // Check if player is caught outside the safe storm zone
      const distFromStormCenter = Math.hypot(s.player.x - st.centerX, s.player.y - st.centerY);
      if (distFromStormCenter > st.currentRadius) {
        // In the toxic bio-chemical gas
        applyDamageToPlayer(st.damagePerSec * dt, 'Toxic Bio-Chemical Storm');
      }

      // ==========================================
      // 6. CHECK PROXIMITY INTERACT PROMPTS
      // ==========================================
      updateInteractPrompt();

      // ==========================================
      // 7. RENDER FRAME ON CANVAS
      // ==========================================
      renderScene(ctx, canvas);

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [inventory, isReloading, heatLevel, activeContract]);

  // Apply damage with armor plate absorption
  const applyDamageToPlayer = (dmg: number, source: string) => {
    setInventory(prev => {
      let remainingDmg = dmg;
      let newArmor = prev.activeArmor;
      let newHealth = playerHealth;

      if (newArmor > 0) {
        if (newArmor >= remainingDmg) {
          newArmor -= remainingDmg;
          remainingDmg = 0;
        } else {
          remainingDmg -= newArmor;
          newArmor = 0;
        }
      }

      if (remainingDmg > 0) {
        newHealth = Math.max(0, newHealth - remainingDmg);
        setPlayerHealth(newHealth);

        if (newHealth <= 0) {
          if (prev.hasSelfRevive) {
            // Use self revive kit!
            sound.playArmorPlate();
            setPlayerHealth(50);
            return { ...prev, hasSelfRevive: false, activeArmor: 50 };
          } else {
            setGameOver(true);
          }
        }
      }

      return { ...prev, activeArmor: newArmor };
    });
  };

  // Handle entity defeat / drop loot
  const handleEntityKilled = (killerName: string, victim: Entity) => {
    victim.health = 0;
    const s = stateRef.current;

    // Drop loot particles and cash
    const cashGain = victim.type === 'boss_mutant' ? 10000 : (victim.type === 'police' ? 1200 : 800);
    setInventory(prev => ({ ...prev, cash: prev.cash + cashGain }));
    sound.playCashChime();

    // Killfeed entry
    const entry: KillFeedEntry = {
      id: `kill_${Date.now()}`,
      killer: killerName,
      victim: victim.name || victim.type,
      weaponName: inventory.activeWeaponSlot === 1 ? inventory.primaryWeapon.name : inventory.secondaryWeapon.name,
      timestamp: Date.now()
    };
    setKillFeed(prev => [entry, ...prev.slice(0, 5)]);

    if (killerName === 'Player') {
      setKillCount(prev => prev + 1);

      // If slain Boss Urias -> Drop Mythic Parasite Bane weapon!
      if (victim.type === 'boss_mutant') {
        const mythicWeapon = WEAPONS_DATABASE.find(w => w.id === 'mythic_parasite_rail');
        if (mythicWeapon) {
          setInventory(prev => ({
            ...prev,
            secondaryWeapon: mythicWeapon,
            magAmmo: { ...prev.magAmmo, 2: mythicWeapon.magSize },
            currentAmmo: { ...prev.currentAmmo, MYTHIC_HORROR: 120 }
          }));
        }
      }
    }

    // Decrement alive count
    s.aliveCount = Math.max(1, s.aliveCount - 1);
    setPlayersAlive(s.aliveCount);

    if (s.aliveCount === 1 && !gameOver) {
      setGameWon(true);
    }
  };

  // Determine HUD interaction hint
  const updateInteractPrompt = () => {
    const s = stateRef.current;
    const px = s.player.x;
    const py = s.player.y;

    if (s.player.inVehicleId) {
      setInteractPrompt('[E] Exit Vehicle');
      return;
    }

    // Check cars
    for (const v of s.vehicles) {
      if (Math.hypot(v.x - px, v.y - py) < 60) {
        setInteractPrompt(`[E] Hijack ${v.name}`);
        return;
      }
    }

    // Check Vault
    for (const v of s.vaults) {
      if (Math.hypot(v.x - px, v.y - py) < 80 && !v.blown) {
        setInteractPrompt(`[E] Blow ${v.name} ($${v.cashReward})`);
        return;
      }
    }

    // Check Radio Tower
    for (const t of s.radioTowers) {
      if (Math.hypot(t.x - px, t.y - py) < 90 && !t.captured) {
        setInteractPrompt(`[E] Hack ${t.name} (Radar Recon)`);
        return;
      }
    }

    // Check Cage
    for (const c of s.animalCages) {
      if (Math.hypot(c.x - px, c.y - py) < 80 && !c.isOpen) {
        setInteractPrompt(`[E] Shoot Open ${c.animalType === 'wildlife_tiger' ? 'Tiger' : 'Bear'} Cage`);
        return;
      }
    }

    // Check Buy Station
    if (Math.hypot(1200 - px, 1800 - py) < 80) {
      setInteractPrompt('[E / B] Access Underground Buy Station');
      return;
    }

    setInteractPrompt(null);
  };

  // Scene Rendering Function
  const renderScene = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const s = stateRef.current;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const curWeapon = inventory.activeWeaponSlot === 1 ? inventory.primaryWeapon : inventory.secondaryWeapon;

    ctx.save();
    // Clear canvas
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply Camera transform
    ctx.translate(cx - s.camera.x, cy - s.camera.y);

    // ==========================================
    // A. DRAW ISLA NOVA BIOME BACKGROUNDS
    // ==========================================
    // Zone 3: Northern Mount Tenebris (0 to 650) - Dark Gothic stone & horror fog
    ctx.fillStyle = '#0f0e17';
    ctx.fillRect(0, 0, 2400, 650);

    // Gothic castle walls & medieval village outlines
    ctx.fillStyle = '#1f1d2e';
    ctx.fillRect(1000, 150, 400, 260); // Castle fortress
    ctx.fillStyle = '#2d2b40';
    ctx.fillRect(1080, 200, 80, 80);
    ctx.fillRect(1240, 200, 80, 80);

    // Spooky graveyard tombstones
    ctx.fillStyle = '#4a4860';
    for (let gx = 850; gx < 1550; gx += 70) {
      for (let gy = 440; gy < 580; gy += 45) {
        ctx.fillRect(gx + ((gy * 13) % 25), gy, 14, 22);
      }
    }

    // Zone 2: Far Cry Untamed Jungles (650 to 1400) - Lush emerald rainforest & rivers
    ctx.fillStyle = '#062816';
    ctx.fillRect(0, 650, 2400, 750);

    // Winding Jungle River
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 48;
    ctx.beginPath();
    ctx.moveTo(0, 1050);
    ctx.bezierCurveTo(700, 950, 1400, 1150, 2400, 1000);
    ctx.stroke();

    // Jungle Trees & Foliage Canopy
    ctx.fillStyle = '#04431e';
    for (let tx = 200; tx < 2200; tx += 120) {
      for (let ty = 680; ty < 1380; ty += 110) {
        const jitter = (tx * 7 + ty * 3) % 40;
        ctx.beginPath();
        ctx.arc(tx + jitter, ty + jitter, 38, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Zone 1: Southern Neon Metropolis (1400 to 2400) - GTA City Grid & Skyscrapers
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 1400, 2400, 1000);

    // Asphalt Avenues & Neon Street Grid
    ctx.fillStyle = '#131926';
    // Horizontal streets
    ctx.fillRect(0, 1520, 2400, 80);
    ctx.fillRect(0, 1780, 2400, 90);
    ctx.fillRect(0, 2080, 2400, 80);
    // Vertical boulevards
    ctx.fillRect(550, 1400, 80, 1000);
    ctx.fillRect(1000, 1400, 90, 1000);
    ctx.fillRect(1500, 1400, 80, 1000);
    ctx.fillRect(1950, 1400, 80, 1000);

    // Neon road markings
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(0, 1825);
    ctx.lineTo(2400, 1825);
    ctx.moveTo(1045, 1400);
    ctx.lineTo(1045, 2400);
    ctx.stroke();
    ctx.setLineDash([]);

    // Skyscraper footprints with glowing neon roof edges
    const buildings = [
      { x: 150, y: 1620, w: 350, h: 140, name: 'Nova Grand Hotel' },
      { x: 670, y: 1620, w: 290, h: 140, name: 'Cyberdine Tech Tower' },
      { x: 1120, y: 1620, w: 340, h: 140, name: 'Bank of Nova HQ' },
      { x: 1620, y: 1620, w: 300, h: 140, name: 'Sunset Marina Condos' },
      { x: 670, y: 1890, w: 300, h: 160, name: 'Syndicate Underground Club' },
      { x: 1120, y: 1890, w: 340, h: 160, name: 'Metropolitan Mall' },
      { x: 1620, y: 1890, w: 300, h: 160, name: 'Omni Media Tower' }
    ];

    for (const b of buildings) {
      ctx.fillStyle = '#1a2233';
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    }

    // ==========================================
    // B. DRAW INTERACTIVE WORLD POIS
    // ==========================================
    // 1. Bank Vault
    for (const vault of s.vaults) {
      ctx.fillStyle = vault.blown ? '#1c1917' : '#eab308';
      ctx.fillRect(vault.x - 22, vault.y - 22, 44, 44);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.strokeRect(vault.x - 22, vault.y - 22, 44, 44);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Space Mono';
      ctx.fillText(vault.blown ? 'VAULT BLOWN' : 'BANK VAULT', vault.x - 30, vault.y - 28);
    }

    // 2. Radio Towers
    for (const tower of s.radioTowers) {
      ctx.fillStyle = tower.captured ? '#10b981' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulsing radio wave ring
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, 35 + ((Date.now() / 20) % 25), 0, Math.PI * 2);
      ctx.strokeStyle = tower.captured ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)';
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px Space Mono';
      ctx.fillText(tower.captured ? 'RELAY ONLINE' : 'RADIO TOWER', tower.x - 32, tower.y - 26);
    }

    // 3. Animal Cages
    for (const cage of s.animalCages) {
      ctx.fillStyle = cage.isOpen ? '#292524' : '#78350f';
      ctx.fillRect(cage.x - 18, cage.y - 18, 36, 36);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      // Cage bars
      for (let bar = -12; bar <= 12; bar += 6) {
        ctx.beginPath();
        ctx.moveTo(cage.x + bar, cage.y - 18);
        ctx.lineTo(cage.x + bar, cage.y + 18);
        ctx.stroke();
      }
      ctx.fillStyle = '#fdba74';
      ctx.font = '9px Space Mono';
      ctx.fillText(cage.isOpen ? 'CAGE BROKEN' : 'CAGED BEAST', cage.x - 28, cage.y - 24);
    }

    // 4. Underground Buy Station
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.arc(1200, 1800, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Space Mono';
    ctx.fillText('BUY STATION [$]', 1150, 1770);

    // ==========================================
    // C. DRAW VEHICLES
    // ==========================================
    for (const v of s.vehicles) {
      ctx.save();
      ctx.translate(v.x, v.y);
      ctx.rotate(v.angle);

      // Chassis
      ctx.fillStyle = v.color;
      ctx.fillRect(-26, -14, 52, 28);

      // Windshield & roof
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-8, -10, 22, 20);

      // Headlights
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(24, -12, 4, 6);
      ctx.fillRect(24, 6, 4, 6);

      // Police flasher if patrol cruiser
      if (v.type === 'patrol_cruiser') {
        const flash = Math.floor(Date.now() / 150) % 2 === 0;
        ctx.fillStyle = flash ? '#ef4444' : '#3b82f6';
        ctx.fillRect(-2, -6, 6, 12);
      }

      ctx.restore();
    }

    // ==========================================
    // D. DRAW ENTITIES (POLICE, MERCS, HORRORS, BOTS)
    // ==========================================
    for (const ent of s.entities) {
      if (ent.health <= 0) continue;

      ctx.save();
      ctx.translate(ent.x, ent.y);
      ctx.rotate(ent.rotation);

      if (ent.type === 'boss_mutant') {
        // Giant Urias Boss Monstrosity
        ctx.fillStyle = '#581c87';
        ctx.beginPath();
        ctx.arc(0, 0, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Parasite tentacles
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
          const ta = (i * Math.PI) / 2 + Math.sin(Date.now() / 200 + i) * 0.4;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ta) * 48, Math.sin(ta) * 48);
          ctx.stroke();
        }
      } else if (ent.type === 'lycan') {
        // Fast predatory Lycan
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444'; // Red glowing eyes
        ctx.fillRect(10, -5, 3, 3);
        ctx.fillRect(10, 2, 3, 3);
      } else if (ent.type === 'wildlife_tiger') {
        // Bengal tiger
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#18181b'; // Black stripes
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (ent.type === 'wildlife_bear') {
        // Grizzly bear
        ctx.fillStyle = '#713f12';
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Human operator (Police, Mercenary, Bot)
        const bodyColor = ent.type === 'police' ? '#1d4ed8' : (ent.type === 'mercenary' ? '#b91c1c' : '#475569');
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();

        // Gun barrel
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(6, 2, 14, 5);
      }

      ctx.restore();

      // Entity Health Bar
      const barWidth = ent.type === 'boss_mutant' ? 60 : 28;
      const barY = ent.type === 'boss_mutant' ? ent.y - 48 : ent.y - 24;
      const hpRatio = Math.max(0, ent.health / ent.maxHealth);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(ent.x - barWidth / 2, barY, barWidth, 4);
      ctx.fillStyle = ent.type === 'boss_mutant' ? '#a855f7' : (hpRatio > 0.4 ? '#22c55e' : '#ef4444');
      ctx.fillRect(ent.x - barWidth / 2, barY, barWidth * hpRatio, 4);

      if (ent.type === 'boss_mutant') {
        ctx.fillStyle = '#e9d5ff';
        ctx.font = '10px Space Mono';
        ctx.fillText('URIAS [BOSS]', ent.x - 34, barY - 6);
      }
    }

    // ==========================================
    // E. DRAW BULLETS
    // ==========================================
    for (const b of s.bullets) {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.isPlayer ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // ==========================================
    // F. DRAW PARTICLES
    // ==========================================
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        s.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ==========================================
    // G. DRAW PLAYER CHARACTER
    // ==========================================
    if (!s.player.inVehicleId) {
      ctx.save();
      ctx.translate(s.player.x, s.player.y);
      ctx.rotate(s.player.angle);

      // Ballistic vest body
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Weapon in hands
      const weaponColor = curWeapon.rarity === 'Mythic' ? '#c084fc' : '#e2e8f0';
      ctx.fillStyle = weaponColor;
      ctx.fillRect(6, 4, 18, 5);

      // Tactical helmet / laser sight
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(24, 6);
      ctx.lineTo(150, 6);
      ctx.stroke();

      ctx.restore();
    }

    // ==========================================
    // H. DRAW TOXIC BIO-CHEMICAL STORM CIRCLE
    // ==========================================
    const storm = s.storm;
    // Safe ring outline
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.arc(storm.centerX, storm.centerY, storm.currentRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Green toxic storm fog mask outside circle
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, 2400, 2400);
    ctx.arc(storm.centerX, storm.centerY, storm.currentRadius, 0, Math.PI * 2, true);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
    ctx.fill();
    ctx.restore();

    // Resident Evil Gothic fog overlay in the North
    ctx.fillStyle = 'rgba(30, 27, 75, 0.35)';
    ctx.fillRect(0, 0, 2400, 650);

    ctx.restore(); // Restore camera transform

    // ==========================================
    // I. DRAW SCREEN-SPACE HUD ELEMENTS
    // ==========================================
    // Crosshair
    if (!s.player.inVehicleId) {
      const mx = s.mousePos.x;
      const my = s.mousePos.y;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      const spread = s.mousePos.isRightDown ? 4 : 10;

      ctx.beginPath();
      ctx.moveTo(mx - spread - 8, my);
      ctx.lineTo(mx - spread, my);
      ctx.moveTo(mx + spread, my);
      ctx.lineTo(mx + spread + 8, my);
      ctx.moveTo(mx, my - spread - 8);
      ctx.lineTo(mx, my - spread);
      ctx.moveTo(mx, my + spread);
      ctx.lineTo(mx, my + spread + 8);
      ctx.stroke();
    }
  };

  return (
    <div className="relative w-full h-[620px] bg-black select-none overflow-hidden rounded-lg border border-neutral-800">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair block"
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Top Left: Republic of Isla Nova Zone Indicator */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <span className="text-amber-400 font-bold">
            {playerPos.y > 1400 ? 'ZONE 1 · NEON METROPOLIS' : playerPos.y > 650 ? 'ZONE 2 · UNTAMED JUNGLE' : 'ZONE 3 · MOUNT TENEBRIS'}
          </span>
          <span>·</span>
          <span>COORDS: {Math.round(playerPos.x)}, {Math.round(playerPos.y)}</span>
        </div>
        {inVehicle && (
          <div className="text-xs font-mono text-sky-400">
            DRIVING: {inVehicle}
          </div>
        )}
      </div>

      {/* Center Tactical Interaction Prompt */}
      {interactPrompt && !gameOver && !gameWon && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 bg-neutral-900/90 border border-amber-500/60 text-amber-300 px-4 py-2 rounded text-xs font-mono shadow-lg animate-pulse">
          {interactPrompt}
        </div>
      )}

      {/* Sliding feedback indicator */}
      {isSliding && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 text-sky-400 font-mono text-xs tracking-wider">
          TACTICAL SLIDE-CANCEL
        </div>
      )}

      {/* Reloading indicator */}
      {isReloading && (
        <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-20 text-amber-400 font-mono text-xs tracking-wider animate-pulse">
          RELOADING WEAPON...
        </div>
      )}

      {/* Heat Level Stars (Police Wanted Level) */}
      {heatLevel > 0 && (
        <div className="absolute top-4 right-52 z-10 flex items-center gap-1 bg-red-950/80 border border-red-500/40 px-3 py-1 rounded">
          <span className="text-xs font-mono text-red-300">WANTED:</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-xs ${i < heatLevel ? 'text-amber-400' : 'text-neutral-600'}`}>
              ★
            </span>
          ))}
        </div>
      )}

      {/* Game Over / Victory Overlays */}
      {gameOver && (
        <div className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center gap-4 text-center p-6">
          <h2 className="text-4xl font-display font-bold text-red-500 tracking-wider">
            SQUAD ELIMINATED
          </h2>
          <p className="text-neutral-300 text-sm max-w-md">
            You were eliminated on Isla Nova. The toxic bio-chemical storm claimed another operative.
          </p>
          <div className="flex gap-4 text-xs font-mono text-neutral-400">
            <span>KILLS: {killCount}</span>
            <span>·</span>
            <span>PLAYERS REMAINING: {playersAlive}</span>
          </div>
          <button
            onClick={() => {
              setGameOver(false);
              setPlayerHealth(100);
              stateRef.current.player.health = 100;
              stateRef.current.player.x = 1200;
              stateRef.current.player.y = 1900;
            }}
            className="mt-4 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs uppercase tracking-wider rounded transition-colors"
          >
            Deploy Fresh Match
          </button>
        </div>
      )}

      {gameWon && (
        <div className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center gap-4 text-center p-6">
          <h2 className="text-5xl font-display font-bold text-amber-400 tracking-wider">
            VICTORY ROYALE
          </h2>
          <p className="text-neutral-200 text-base font-medium max-w-md">
            OUTBREAK SYNDICATE CHAMPION · LAST SQUAD STANDING
          </p>
          <div className="flex gap-4 text-xs font-mono text-neutral-400">
            <span>TOTAL ELIMINATIONS: {killCount}</span>
            <span>·</span>
            <span>CASH EXTRACTED: ${inventory.cash}</span>
          </div>
          <button
            onClick={() => {
              setGameWon(false);
              setPlayersAlive(100);
              stateRef.current.aliveCount = 100;
              stateRef.current.player.x = 1200;
              stateRef.current.player.y = 1900;
            }}
            className="mt-4 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs uppercase tracking-wider rounded transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};
