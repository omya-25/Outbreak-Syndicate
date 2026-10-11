import { Weapon, BuyStationItem, GameContract } from '../types/game';

export const WEAPONS_DATABASE: Weapon[] = [
  {
    id: 'ar_m4',
    name: 'M4-Syndicate',
    category: 'AR',
    damage: 28,
    fireRate: 11, // shots per sec
    magSize: 30,
    reloadTime: 1.8,
    range: 480,
    recoil: 0.08,
    bulletSpeed: 14,
    rarity: 'Rare',
    description: 'Versatile all-around assault rifle tuned for mid-range skirmishes in the streets and jungle clearings.',
    icon: 'rifle'
  },
  {
    id: 'smg_vector',
    name: 'Vector-Apex',
    category: 'SMG',
    damage: 19,
    fireRate: 18,
    magSize: 35,
    reloadTime: 1.4,
    range: 320,
    recoil: 0.12,
    bulletSpeed: 16,
    rarity: 'Epic',
    description: 'Blistering fire rate built for slide-canceling close-quarters combat inside skyscrapers and tight alleys.',
    icon: 'zap'
  },
  {
    id: 'sniper_barrett',
    name: 'Barrett .50 Cal Nova',
    category: 'SNIPER',
    damage: 115,
    fireRate: 1.2,
    magSize: 5,
    reloadTime: 2.8,
    range: 850,
    recoil: 0.35,
    bulletSpeed: 24,
    rarity: 'Legendary',
    description: 'Anti-materiel heavy sniper rifle. Capable of knocking armored players and shredding vehicle engines across long sights.',
    icon: 'crosshair'
  },
  {
    id: 'shotgun_sweeper',
    name: 'Gothic Sweeper 12G',
    category: 'SHOTGUN',
    damage: 85,
    fireRate: 2.2,
    magSize: 8,
    reloadTime: 2.2,
    range: 220,
    recoil: 0.28,
    bulletSpeed: 12,
    rarity: 'Rare',
    description: 'Devastating close-range scattergun. Essential for fending off aggressive Lycan packs and jungle predators.',
    icon: 'target'
  },
  {
    id: 'mythic_parasite_rail',
    name: 'Parasite Bane Rail-AR',
    category: 'MYTHIC_HORROR',
    damage: 48,
    fireRate: 9,
    magSize: 45,
    reloadTime: 1.6,
    range: 650,
    recoil: 0.04,
    bulletSpeed: 22,
    rarity: 'Mythic',
    description: 'Forged from Mount Tenebris parasite-infused bio-alloys. Fires hyper-accelerated rounds with acidic toxic splash.',
    icon: 'flame'
  },
  {
    id: 'mythic_executioner',
    name: 'Tenebris Executioner',
    category: 'MYTHIC_HORROR',
    damage: 140,
    fireRate: 1.6,
    magSize: 10,
    reloadTime: 2.0,
    range: 750,
    recoil: 0.15,
    bulletSpeed: 25,
    rarity: 'Mythic',
    description: 'Exclusive drop from Urias the Parasitic Behemoth. Pierces heavy armor plates and disorients enemy squads.',
    icon: 'skull'
  }
];

export const BUY_STATION_CATALOG: BuyStationItem[] = [
  {
    id: 'loadout_drop',
    name: 'Custom Loadout Marker',
    cost: 7500,
    category: 'loadout',
    description: 'Calls in a tactical crate with your fully kitted Mythic/Legendary primary weapon and max armor satchel.',
    iconName: 'box'
  },
  {
    id: 'uav_radar',
    name: 'UAV Satellite Recon (30s)',
    cost: 4000,
    category: 'killstreak',
    description: 'Pings all remaining squads, enemy bots, and predators within a 600m radius on your tactical minimap.',
    iconName: 'radio'
  },
  {
    id: 'precision_airstrike',
    name: 'Precision Jet Airstrike',
    cost: 5000,
    category: 'killstreak',
    description: 'Calls in two fighter jets to strafe your targeted coordinate with high-explosive 30mm cannons.',
    iconName: 'crosshair'
  },
  {
    id: 'self_revive',
    name: 'Syndicate Self-Revive Kit',
    cost: 4500,
    category: 'gear',
    description: 'Automatically injects adrenaline stims to revive yourself from downed status if incapacitated.',
    iconName: 'heart-pulse'
  },
  {
    id: 'armor_satchel',
    name: 'Ballistic Armor Satchel (5x)',
    cost: 2000,
    category: 'gear',
    description: 'Restocks 5 composite armor plates to repair damaged plate carriers up to 150 total armor.',
    iconName: 'shield'
  },
  {
    id: 'munitions_box',
    name: 'Munitions Ammo Crate',
    cost: 2500,
    category: 'gear',
    description: 'Deploys an ammunition cache that immediately refills all primary and secondary weapon reserves to maximum.',
    iconName: 'package'
  }
];

export const FACTIONS_LORE = [
  {
    id: 'police',
    title: 'Nova Metropolitan Police Dept (NMPD)',
    zone: 'Southern Metropolis',
    threatLevel: 'Dynamic 1-5 Star Heat',
    overview: 'Heavily militarized city police corrupted by local cartels. When players rob banks or steal sports cars in the city, heat level increases, deploying high-speed cruisers and SWAT barricades.',
    tactic: 'Break line of sight in high-rise alleys or switch into a high-speed supercar to lose pursuit before the storm closes in.'
  },
  {
    id: 'mercs',
    title: 'Crimson Talon Mercenaries',
    zone: 'Northern Jungles',
    threatLevel: 'High Aggression Patrols',
    overview: 'Private military contractors guarding secret radio relay towers and illegal wildlife smuggling cages across the deep jungle canopy.',
    tactic: 'Hack their Radio Towers to reveal nearby squad positions, or snipe open animal cages from afar to let Bengal tigers maul their camps.'
  },
  {
    id: 'gothic_cult',
    title: 'Mount Tenebris Parasite Strain & Lycans',
    zone: 'Northern Peak & Medieval Castle',
    threatLevel: 'Survival Horror Dread (Boss Arena)',
    overview: 'A bio-tech corporation unleashed an ancient parasitic mutagen in the abandoned medieval village. The infected mutated into ferocious Lycans, stalkers, and the towering Behemoth Urias.',
    tactic: 'Ammo is scarce and visibility drops in the dense fog. Coordinate squad fire to bring down Urias and claim game-winning Mythic weapons.'
  }
];

export const DEFAULT_CONTRACTS: GameContract[] = [
  {
    id: 'contract_vault_1',
    title: 'Nova Reserve Bank Vault Heist',
    targetName: 'Bank of Nova Main Vault',
    reward: 8000,
    type: 'VAULT_HEIST',
    targetX: 620,
    targetY: 1550,
    completed: false,
    timeLimit: 120,
    timeRemaining: 120
  },
  {
    id: 'contract_tower_1',
    title: 'Merc Radio Relay Intercept',
    targetName: 'Jungle Outpost Relay #02',
    reward: 5500,
    type: 'TOWER_HACK',
    targetX: 850,
    targetY: 900,
    completed: false,
    timeLimit: 90,
    timeRemaining: 90
  },
  {
    id: 'contract_boss_1',
    title: 'Mount Tenebris Abomination Hunt',
    targetName: 'Urias the Parasitic Behemoth',
    reward: 12000,
    type: 'MONSTER_HUNT',
    targetX: 1000,
    targetY: 350,
    completed: false,
    timeLimit: 180,
    timeRemaining: 180
  }
];
