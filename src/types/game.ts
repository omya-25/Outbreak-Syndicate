export type BiomeZone = 'METROPOLIS' | 'JUNGLE' | 'GOTHIC_PEAK';

export type WeaponCategory = 'AR' | 'SMG' | 'SNIPER' | 'SHOTGUN' | 'MYTHIC_HORROR';

export interface Weapon {
  id: string;
  name: string;
  category: WeaponCategory;
  damage: number;
  fireRate: number; // shots per sec
  magSize: number;
  reloadTime: number; // sec
  range: number;
  recoil: number;
  bulletSpeed: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  description: string;
  icon: string;
}

export interface PlayerInventory {
  primaryWeapon: Weapon;
  secondaryWeapon: Weapon;
  activeWeaponSlot: 1 | 2;
  currentAmmo: { [key in WeaponCategory]: number };
  magAmmo: { 1: number; 2: number };
  armorPlates: number; // current plates in inventory (up to 5)
  activeArmor: number; // 0 to 100 (each plate is 50, max 150)
  maxArmor: number;
  cash: number;
  killstreaks: string[];
  hasSelfRevive: boolean;
  uavActiveUntil: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  health: number;
  maxHealth: number;
  type: 'player' | 'enemy_bot' | 'police' | 'mercenary' | 'lycan' | 'boss_mutant' | 'wildlife_tiger' | 'wildlife_bear' | 'civilian';
  squadId?: number;
  name?: string;
  targetX?: number;
  targetY?: number;
  shootCooldown?: number;
  inVehicleId?: string | null;
  state?: 'idle' | 'patrol' | 'chase' | 'attack' | 'flee';
  color?: string;
  weapon?: Weapon;
}

export interface Vehicle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  maxSpeed: number;
  health: number;
  maxHealth: number;
  name: string;
  type: 'supercar' | 'muscle' | 'patrol_cruiser' | 'jungle_buggy' | 'armored_truck';
  driverId: string | null;
  color: string;
}

export interface RadioTower {
  id: string;
  x: number;
  y: number;
  captured: boolean;
  captureProgress: number; // 0 to 100
  name: string;
}

export interface AnimalCage {
  id: string;
  x: number;
  y: number;
  isOpen: boolean;
  animalType: 'wildlife_tiger' | 'wildlife_bear';
  health: number;
}

export interface BankVault {
  id: string;
  name: string;
  x: number;
  y: number;
  blown: boolean;
  blowProgress: number; // 0 to 100
  cashReward: number;
}

export interface BuyStationItem {
  id: string;
  name: string;
  cost: number;
  category: 'gear' | 'killstreak' | 'loadout';
  description: string;
  iconName: string;
}

export interface KillFeedEntry {
  id: string;
  killer: string;
  victim: string;
  weaponName: string;
  isHeadshot?: boolean;
  timestamp: number;
}

export interface GameContract {
  id: string;
  title: string;
  targetName: string;
  reward: number;
  type: 'BOUNTY' | 'VAULT_HEIST' | 'TOWER_HACK' | 'MONSTER_HUNT';
  targetX: number;
  targetY: number;
  completed: boolean;
  timeLimit: number;
  timeRemaining: number;
}

export interface StormCircle {
  centerX: number;
  centerY: number;
  currentRadius: number;
  targetRadius: number;
  targetCenterX: number;
  targetCenterY: number;
  shrinkRate: number;
  phase: number;
  nextShrinkTime: number; // in seconds
  isShrinking: boolean;
  damagePerSec: number;
}

export type AppTab = 'MATCH' | 'MAP' | 'GUNSMITH' | 'DOSSIER' | 'CONTRACTS';
