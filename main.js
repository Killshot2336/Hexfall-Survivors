(() => {
'use strict';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const els = {
  hud: document.getElementById('hud'),
  hpText: document.getElementById('hpText'),
  hpBar: document.getElementById('hpBar'),
  pulseText: document.getElementById('pulseText'),
  pulseBar: document.getElementById('pulseBar'),
  slashText: document.getElementById('slashText'),
  slashBar: document.getElementById('slashBar'),
  waveText: document.getElementById('waveText'),
  eventText: document.getElementById('eventText'),
  scoreText: document.getElementById('scoreText'),
  creditsText: document.getElementById('creditsText'),
  comboText: document.getElementById('comboText'),
  shieldText: document.getElementById('shieldText'),
  sectorText: document.getElementById('sectorText'),
  archetypeText: document.getElementById('archetypeText'),
  contractText: document.getElementById('contractText'),
  synergyText: document.getElementById('synergyText'),
  bossHud: document.getElementById('bossHud'),
  bossBar: document.getElementById('bossBar'),
  bossName: document.getElementById('bossName'),
  momentOverlay: document.getElementById('momentOverlay'),
  comboBurst: document.getElementById('comboBurst'),
  menu: document.getElementById('menu'),
  startBtn: document.getElementById('startBtn'),
  howBtn: document.getElementById('howBtn'),
  howPanel: document.getElementById('howPanel'),
  closeHow: document.getElementById('closeHow'),
  pauseOverlay: document.getElementById('pauseOverlay'),
  resumeBtn: document.getElementById('resumeBtn'),
  pauseMenuBtn: document.getElementById('pauseMenuBtn'),
  upgradeOverlay: document.getElementById('upgradeOverlay'),
  upgradeChoices: document.getElementById('upgradeChoices'),
  relicOverlay: document.getElementById('relicOverlay'),
  relicChoices: document.getElementById('relicChoices'),
  gameOverOverlay: document.getElementById('gameOverOverlay'),
  retryBtn: document.getElementById('retryBtn'),
  menuBtn: document.getElementById('menuBtn'),
  waveBanner: document.getElementById('waveBanner'),
  toast: document.getElementById('toast'),
  metaShop: document.getElementById('metaShop'),
  achievementList: document.getElementById('achievementList'),
  tabMeta: document.getElementById('tabMeta'),
  tabAchievements: document.getElementById('tabAchievements'),
  metaPanel: document.getElementById('metaPanel'),
  achievementPanel: document.getElementById('achievementPanel'),
  bestScore: document.getElementById('bestScore'),
  bankedCredits: document.getElementById('bankedCredits'),
  bestWave: document.getElementById('bestWave'),
  bossesTotal: document.getElementById('bossesTotal'),
  finalScore: document.getElementById('finalScore'),
  finalWave: document.getElementById('finalWave'),
  finalCredits: document.getElementById('finalCredits'),
  finalCombo: document.getElementById('finalCombo'),
  finalTime: document.getElementById('finalTime'),
  gameOverTitle: document.getElementById('gameOverTitle'),
  runSummary: document.getElementById('runSummary'),
  touchControls: document.getElementById('touchControls'),
  touchPad: document.getElementById('touchPad'),
  touchStick: document.getElementById('touchStick'),
  slashBtn: document.getElementById('slashBtn'),
  pulseBtn: document.getElementById('pulseBtn'),
  fpsTag: document.getElementById('fpsTag'),
  continueAdBtn: document.getElementById('continueAdBtn'),
  doubleRewardBtn: document.getElementById('doubleRewardBtn'),
  tabCards: document.getElementById('tabCards'),
  cardPanel: document.getElementById('cardPanel'),
  cardInventory: document.getElementById('cardInventory'),
  moduleSlots: document.getElementById('moduleSlots'),
  tabSettings: document.getElementById('tabSettings'),
  settingsPanel: document.getElementById('settingsPanel'),
  qualitySetting: document.getElementById('qualitySetting'),
  shakeToggle: document.getElementById('shakeToggle'),
  masterVolume: document.getElementById('masterVolume'),
  musicVolume: document.getElementById('musicVolume'),
  sfxVolume: document.getElementById('sfxVolume'),
  hudColor: document.getElementById('hudColor'),
  shipColor: document.getElementById('shipColor'),
  bulletColor: document.getElementById('bulletColor'),
  exportSaveBtn: document.getElementById('exportSaveBtn'),
  importSaveBtn: document.getElementById('importSaveBtn'),
  resetSaveBtn: document.getElementById('resetSaveBtn'),
  moduleModal: document.getElementById('moduleModal'),
  closeModuleModal: document.getElementById('closeModuleModal'),
  moduleModalRarity: document.getElementById('moduleModalRarity'),
  moduleModalName: document.getElementById('moduleModalName'),
  moduleModalCard: document.getElementById('moduleModalCard'),
  moduleModalTitle: document.getElementById('moduleModalTitle'),
  moduleModalCategory: document.getElementById('moduleModalCategory'),
  moduleModalLevel: document.getElementById('moduleModalLevel'),
  moduleModalDesc: document.getElementById('moduleModalDesc'),
  moduleModalEffect: document.getElementById('moduleModalEffect'),
  moduleModalCopies: document.getElementById('moduleModalCopies'),
};

const SAVE_KEY = 'voidline-rift-reaper-release-save-v6';
const VERSION = 6;
const DEFAULT_SETTINGS = {
  quality: 'high',
  shake: true,
  masterVolume: 1,
  musicVolume: 1,
  sfxVolume: 1,
  hudColor: '#73f0ff',
  shipColor: '#73f0ff',
  bulletColor: '#8afbff',
};
const LEGACY_KEYS = [
  'voidline-rift-reaper-release-save-v5',
  'voidline-rift-reaper-release-save-v4',
  'voidline-rift-reaper-release-save-v3',
  'voidline-rift-reaper-save-v1',
  'voidline-rift-reaper-brand-final-v1',
];

const metaDefs = [
  { id: 'hull', name: 'Core Hull', desc: '+12 max hull per rank.', base: 12, max: 5 },
  { id: 'cannon', name: 'Focus Lens', desc: '+8% base damage per rank.', base: 14, max: 5 },
  { id: 'drive', name: 'Gyro Drive', desc: '+5% move speed per rank.', base: 12, max: 5 },
  { id: 'pulse', name: 'Pulse Coil', desc: '+10% pulse gain per rank.', base: 14, max: 5 },
  { id: 'salvage', name: 'Salvage Cache', desc: '+2 starting credits per rank.', base: 8, max: 8 },
  { id: 'slash', name: 'Rift Chamber', desc: '+10% slash damage per rank.', base: 16, max: 5 },
];

const achieveDefs = [
  { id: 'first_blood', name: 'First Blood', desc: 'Destroy 1 enemy in a run.', check: r => r.kills >= 1 },
  { id: 'boss_contact', name: 'Boss Contact', desc: 'Reach wave 10.', check: r => r.wave >= 10 },
  { id: 'deep_run', name: 'Deep Run', desc: 'Reach wave 20.', check: r => r.wave >= 20 },
  { id: 'boss_breaker', name: 'Boss Breaker', desc: 'Defeat 3 bosses across runs.', check: (r,s) => s.totalBosses >= 3 },
  { id: 'flow_state', name: 'Flow State', desc: 'Reach a x3.0 combo.', check: r => r.maxCombo >= 3 },
  { id: 'rift_lord', name: 'Rift Lord', desc: 'Reach wave 30.', check: r => r.wave >= 30 },
];

const runUpgrades = [
  { id: 'damage', name: 'Overclock', tag: 'Offense', tags:['projectile'], desc: '+22% cannon damage.', apply: p => p.damage *= 1.22 },
  { id: 'fire', name: 'Rapid Relay', tag: 'Offense', tags:['projectile'], desc: '+14% fire rate.', apply: p => p.fireDelay *= 0.86 },
  { id: 'speed', name: 'Impulse Drive', tag: 'Mobility', tags:['slash'], desc: '+12% move speed.', apply: p => p.speed *= 1.12 },
  { id: 'pierce', name: 'Phase Rounds', tag: 'Control', tags:['projectile'], desc: '+1 projectile pierce.', apply: p => p.pierce += 1 },
  { id: 'spread', name: 'Prism Split', tag: 'Offense', tags:['projectile'], desc: 'Adds side shots.', apply: p => p.multiShot = Math.min(2, p.multiShot + 1) },
  { id: 'magnet', name: 'Magnet Sweep', tag: 'Utility', tags:['drone'], desc: 'Pull credits from farther away.', apply: p => p.magnet += 30 },
  { id: 'regen', name: 'Nano Repair', tag: 'Defense', tags:['drone'], desc: 'Regenerate 0.8 hull per second.', apply: p => p.regen += 0.8 },
  { id: 'pulse', name: 'Capacitor Banks', tag: 'Burst', tags:['energy'], desc: '+20% pulse gain.', apply: p => p.pulseGain *= 1.2 },
  { id: 'slashDmg', name: 'Rift Edge', tag: 'Slash', tags:['slash'], desc: '+35% Rift Slash damage.', apply: p => p.slashDamage *= 1.35 },
  { id: 'slashCd', name: 'Snap Release', tag: 'Slash', tags:['slash'], desc: '-18% Rift Slash cooldown.', apply: p => p.slashCooldown *= 0.82 },
  { id: 'credit', name: 'Golden Fracture', tag: 'Economy', tags:['drone'], desc: '+25% credit drops.', apply: p => p.creditBoost += .25 },
  { id: 'shield', name: 'Mirror Skin', tag: 'Defense', tags:['drone'], desc: 'Gain a 1-hit shield each wave.', apply: p => p.waveShield += 1 },
  { id: 'ricochet', name: 'Ricochet Core', tag: 'Control', tags:['projectile'], desc: 'Shots bounce to another enemy.', apply: p => p.ricochet += 1 },
  { id: 'chain', name: 'Arc Coil', tag: 'Burst', tags:['energy'], desc: 'Shots chain lightning on hit.', apply: p => p.chain += 1 },
  { id: 'drone', name: 'Halo Drone', tag: 'Utility', tags:['drone'], desc: 'Adds an orbit drone.', apply: p => p.droneCount = Math.min(3, p.droneCount + 1) },
  { id: 'nova', name: 'Aftershock', tag: 'Slash', tags:['slash'], desc: 'Rift Slash releases a close-range nova.', apply: p => p.slashNova += 1 },
  { id: 'surge', name: 'Storm Feed', tag: 'Burst', tags:['energy'], desc: 'Pulse hits harder and charges from kills.', apply: p => { p.pulseGain *= 1.15; p.pulseDamageBonus = (p.pulseDamageBonus || 0) + 10; } },
  { id: 'thruster', name: 'Phantom Thrusters', tag: 'Mobility', tags:['slash'], desc: 'Move speed and slash gain rise together.', apply: p => { p.speed *= 1.08; p.slashGain *= 1.18; } },
];

const synergyDefs = [
  { id:'arc_reactor', name:'Arc Reactor', need:['energy','projectile'], apply:p=>{ p.synergyArc = true; p.chain += 1; p.pulseDamageBonus = (p.pulseDamageBonus||0) + 10; } },
  { id:'phantom_slash', name:'Phantom Slash', need:['slash','projectile'], apply:p=>{ p.synergyPhantom = true; p.speed *= 1.06; } },
  { id:'drone_swarm', name:'Drone Swarm', need:['drone','projectile'], apply:p=>{ p.synergyDrone = true; p.droneCount = Math.min(4, p.droneCount + 1); } },
  { id:'void_singularity', name:'Void Singularity', need:['energy','slash'], apply:p=>{ p.pulseVortex = Math.max(p.pulseVortex||0, 1); p.synergyVoid = true; } },
  { id:'shatter_core', name:'Shatter Core', need:['projectile','projectile','energy'], apply:p=>{ p.bulletSplash = Math.max(p.bulletSplash||0, 64); p.synergyShatter = true; } },
];
const events = ['Assault', 'Crossfire', 'Riftstorm', 'Bulwark', 'Low Gravity', 'Storm Field', 'Rift Fog', 'Magnetic Surge'];
const sectorNames = ['Sector I','Sector II','Sector III','Sector IV','Sector V'];
const zoneNames = ['Nebula Verge','Scarlet Storm','Glass Frontier','Null Expanse','Singularity Approach'];
const bossDefs = [
  { name:'Rift Sovereign', family:'rift', color:'#ff72cb', core:'#ffd7ff', title:'Dimensional Tyrant', intro:'Tears space and saturates the arena with unstable lances.', tele:'#ffc2ef' },
  { name:'Iron Maw', family:'maw', color:'#ff9966', core:'#ffe0a5', title:'Devourer Engine', intro:'Charges brutally, then rips outward with furnace shockwaves.', tele:'#ffd2a6' },
  { name:'Glass Widow', family:'widow', color:'#8de7ff', core:'#ffffff', title:'Prismatic Sniper', intro:'Marks lanes, then shears them with crystal precision.', tele:'#d5fbff' },
  { name:'Static King', family:'static', color:'#ffe66e', core:'#fff7b8', title:'Thunder Monarch', intro:'Surrounds itself with lethal storm barriers and EMP bursts.', tele:'#fff2a2' },
  { name:'Hollow Engine', family:'engine', color:'#8fb4ff', core:'#ffffff', title:'Ancient Forge', intro:'Builds pressure with gear barrages, adds, and reactor waves.', tele:'#cfe0ff' },
  { name:'Blood Prism', family:'prism', color:'#ff5e88', core:'#ffd5de', title:'Fracture Oracle', intro:'Splits reality into mirrored kill-lines and shard fans.', tele:'#ffbfd1' },
  { name:'Void Leviathan', family:'leviathan', color:'#8c7cff', core:'#d9d2ff', title:'Abyss Serpent', intro:'Wraps the arena with sweeping coils and parasite swarms.', tele:'#d3c6ff' },
  { name:'Eclipse Seraph', family:'seraph', color:'#b39cff', core:'#fff3cf', title:'Fallen Star', intro:'Alternates radiant spear patterns with collapsing halo rings.', tele:'#eadcff' },
  { name:'Null Warden', family:'warden', color:'#a4ffd0', core:'#effff7', title:'Suppression Bastion', intro:'Nullifies fire, closes lanes, and crushes with barrier walls.', tele:'#d8fff0' },
  { name:'Storm Colossus', family:'colossus', color:'#73caff', core:'#f8fdff', title:'Siege Titan', intro:'Drops missile rain, grid fire, and brutal shockwave stomps.', tele:'#c8edff' },
];
const MOTHERSHIP = { name:'The Mother Ship', family:'mothership', color:'#ff4d6d', core:'#fff5f8', title:'Origin of the Rift', intro:'The final signal. Everything it fires is meant to end the run.', tele:'#ffd0da' };
const archetypeDefs = { slash:{name:'Rift Blade'}, projectile:{name:'Void Gunner'}, energy:{name:'Storm Core'}, drone:{name:'Orbital Engineer'} };
const relicDefs = [
  { id:'redShift', name:'Red Shift Core', desc:'Infinite pierce, slower fire.', apply:p=>{p.pierce+=99; p.fireDelay*=1.18;} },
  { id:'blackPrism', name:'Black Prism', desc:'Massive crits and side shots.', apply:p=>{p.critChance+=.18; p.critDamage+=.75; p.multiShot=Math.max(p.multiShot,2);} },
  { id:'ghostReactor', name:'Ghost Reactor', desc:'Pulse primes itself when runs get ugly.', apply:p=>{p.autoPulse=true; p.pulseGain*=1.35; p.pulse=clamp(p.pulse+35,0,100);} },
  { id:'crackedHalo', name:'Cracked Halo', desc:'Permanent shield, lower max hull.', apply:p=>{p.waveShield+=1; p.maxHp*=.82; p.hp=Math.min(p.hp,p.maxHp);} },
  { id:'stormHeart', name:'Storm Heart', desc:'Chain lightning and stronger pulse.', apply:p=>{p.chain+=2; p.pulseGain*=1.25; p.pulseDamageBonus=(p.pulseDamageBonus||0)+18;} },
  { id:'seraphFeather', name:'Seraph Feather', desc:'Faster movement and slash, weaker bullets.', apply:p=>{p.speed*=1.18; p.slashCooldown*=.76; p.damage*=.9;} },

];
const moduleDefs = [
  { id:'core_hull', name:'Hull Matrix', category:'core', rarity:'common', desc:'+6 max hull per level.', apply:(p,l)=>{ p.maxHp += 6*l; p.hp += 6*l; } },
  { id:'core_drive', name:'Gyro Array', category:'core', rarity:'common', desc:'+3% move speed per level.', apply:(p,l)=>{ p.speed *= (1 + 0.03*l); } },
  { id:'core_reactor', name:'Reactor Mesh', category:'core', rarity:'rare', desc:'+4% pulse gain per level.', apply:(p,l)=>{ p.pulseGain *= (1 + 0.04*l); } },
  { id:'core_slash', name:'Rift Coil', category:'core', rarity:'rare', desc:'+5% slash damage per level.', apply:(p,l)=>{ p.slashDamage *= (1 + 0.05*l); } },
  { id:'core_crit', name:'Targeting Lens', category:'core', rarity:'rare', desc:'+3% crit chance per level.', apply:(p,l)=>{ p.critChance += 0.03*l; } },
  { id:'core_regen', name:'Nano Weave', category:'core', rarity:'rare', desc:'+0.25 regen per level.', apply:(p,l)=>{ p.regen += 0.25*l; } },
  { id:'core_magnet', name:'Magnet Grid', category:'core', rarity:'common', desc:'+18 pickup radius per level.', apply:(p,l)=>{ p.magnet += 18*l; } },
  { id:'core_shield', name:'Phase Shell', category:'core', rarity:'epic', desc:'+1 start shield at level 3 and 5.', apply:(p,l)=>{ p.waveShield += (l>=3?1:0) + (l>=5?1:0); } },
  { id:'core_credit', name:'Salvage Kernel', category:'core', rarity:'rare', desc:'+8% credit drops per level.', apply:(p,l)=>{ p.creditBoost += 0.08*l; } },
  { id:'core_charge', name:'Slash Capacitor', category:'core', rarity:'common', desc:'+5% slash gain per level.', apply:(p,l)=>{ p.slashGain *= (1 + 0.05*l); } },
  { id:'core_stability', name:'Stability Core', category:'core', rarity:'epic', desc:'Shorter slash cooldown per level.', apply:(p,l)=>{ p.slashCooldown *= Math.max(0.72, 1 - 0.04*l); } },
  { id:'core_flux', name:'Flux Chamber', category:'core', rarity:'legendary', desc:'Pulse hits harder and gains vortex pull at higher levels.', apply:(p,l)=>{ p.pulseDamageBonus = (p.pulseDamageBonus||0) + 8*l; if (l >= 3) p.pulseVortex = Math.max(p.pulseVortex||0, 1); } },
  { id:'core_overhealth', name:'Aegis Lattice', category:'core', rarity:'epic', desc:'+10% max hull at level 4+', apply:(p,l)=>{ if (l>=4) { p.maxHp *= 1.10; p.hp *= 1.10; } } },
  { id:'core_riftblood', name:'Riftblood Core', category:'core', rarity:'legendary', desc:'Kills charge Pulse and Slash faster.', apply:(p,l)=>{ p.killPulseBonus = (p.killPulseBonus||0) + 0.3*l; p.killSlashBonus = (p.killSlashBonus||0) + 0.25*l; } },
  { id:'core_mastery', name:'Void Heart', category:'core', rarity:'mythic', desc:'Global boosts and every few shots become singularity rounds.', apply:(p,l)=>{ p.speed *= (1+0.02*l); p.damage *= (1+0.03*l); p.pulseGain *= (1+0.03*l); p.critChance += 0.01*l; p.megaShotEvery = Math.max(0, 7 - Math.min(3, l)); } },

  { id:'combat_split', name:'Twin Cannons', category:'combat', rarity:'common', desc:'Unlock side shots at level 2.', apply:(p,l)=>{ if (l>=2) p.multiShot = Math.max(p.multiShot,1); if (l>=5) p.multiShot = Math.max(p.multiShot,2); } },
  { id:'combat_pierce', name:'Phase Needles', category:'combat', rarity:'common', desc:'+1 pierce at level 2 and 5.', apply:(p,l)=>{ p.pierce += (l>=2?1:0) + (l>=5?1:0); } },
  { id:'combat_chain', name:'Arc Matrix', category:'combat', rarity:'rare', desc:'+1 chain at level 3 and 5.', apply:(p,l)=>{ p.chain += (l>=3?1:0) + (l>=5?1:0); } },
  { id:'combat_ricochet', name:'Ricochet Node', category:'combat', rarity:'rare', desc:'+1 ricochet at level 3.', apply:(p,l)=>{ p.ricochet += (l>=3?1:0) + (l>=5?1:0); } },
  { id:'combat_firerate', name:'Rapid Relay', category:'combat', rarity:'common', desc:'+5% fire rate per level.', apply:(p,l)=>{ p.fireDelay *= Math.max(0.65, 1 - 0.05*l); } },
  { id:'combat_damage', name:'Overclock Frame', category:'combat', rarity:'common', desc:'+6% bullet damage per level.', apply:(p,l)=>{ p.damage *= (1 + 0.06*l); } },
  { id:'combat_drone', name:'Drone Wing', category:'combat', rarity:'rare', desc:'+1 drone at level 2 and 5.', apply:(p,l)=>{ p.droneCount += (l>=2?1:0) + (l>=5?1:0); } },
  { id:'combat_nova', name:'Aftershock Mesh', category:'combat', rarity:'epic', desc:'Rift Slash gains nova at level 3.', apply:(p,l)=>{ if (l>=3) p.slashNova += 1; if (l>=5) p.slashNova += 1; } },
  { id:'combat_pulseburst', name:'Pulse Echo', category:'combat', rarity:'rare', desc:'+10 pulse damage per level.', apply:(p,l)=>{ p.pulseDamageBonus = (p.pulseDamageBonus||0) + 10*l; } },
  { id:'combat_critdmg', name:'Killshot Optics', category:'combat', rarity:'epic', desc:'+10% crit damage per level.', apply:(p,l)=>{ p.critDamage += 0.10*l; } },
  { id:'combat_storm', name:'Storm Feed', category:'combat', rarity:'epic', desc:'Pulse gain and chain improve together.', apply:(p,l)=>{ p.pulseGain *= (1 + 0.04*l); if (l>=3) p.chain += 1; } },
  { id:'combat_scatter', name:'Scatter Prism', category:'combat', rarity:'legendary', desc:'Bullets widen, hit harder, and splash at high levels.', apply:(p,l)=>{ p.multiShot = Math.max(p.multiShot,1); p.damage *= (1 + 0.04*l); if (l >= 3) p.bulletSplash = Math.max(p.bulletSplash||0, 18 + l*4); } },
  { id:'combat_rampage', name:'Rift Rampage', category:'combat', rarity:'legendary', desc:'Slash damage and gain both rise.', apply:(p,l)=>{ p.slashDamage *= (1 + 0.07*l); p.slashGain *= (1 + 0.04*l); } },
  { id:'combat_stinger', name:'Stinger Array', category:'combat', rarity:'epic', desc:'Bullet speed rises per level.', apply:(p,l)=>{ p.bulletSpeed *= (1 + 0.05*l); } },
  { id:'combat_mythic', name:'Singularity Spindle', category:'combat', rarity:'mythic', desc:'Major combat boost package with beam drones at high level.', apply:(p,l)=>{ p.damage *= (1 + 0.08*l); p.chain += 1; p.ricochet += 1; if (l>=3) p.multiShot = Math.max(p.multiShot,2); if (l>=4) p.droneBeam = true; } },

  { id:'utility_salvage', name:'Salvage ', category:'utility', rarity:'common', desc:'+10% credit gain per level.', apply:(p,l)=>{ p.creditBoost += 0.10*l; } },
  { id:'utility_magnet', name:'Vacuum Field', category:'utility', rarity:'common', desc:'+22 pickup radius per level.', apply:(p,l)=>{ p.magnet += 22*l; } },
  { id:'utility_contract', name:'Broker Relay', category:'utility', rarity:'rare', desc:'Contract rewards improve.', apply:(p,l)=>{ p.contractRewardBonus = (p.contractRewardBonus||0) + 0.15*l; } },
  { id:'utility_elite', name:'Rift Scanner', category:'utility', rarity:'rare', desc:'Elites drop more credits and powerups.', apply:(p,l)=>{ p.eliteRewardBonus = (p.eliteRewardBonus||0) + 0.20*l; } },
  { id:'utility_guard', name:'Bulwark Array', category:'utility', rarity:'epic', desc:'Start each run with shield at level 2.', apply:(p,l)=>{ if (l>=2) p.waveShield += 1; } },
  { id:'utility_reactor', name:'Ghost Reactor', category:'utility', rarity:'legendary', desc:'Low hull auto-primes Pulse.', apply:(p,l)=>{ p.autoPulse = true; } },
  { id:'utility_healer', name:'Field Medic', category:'utility', rarity:'epic', desc:'Stronger regen and recovery.', apply:(p,l)=>{ p.regen += 0.35*l; } },
  { id:'utility_rush', name:'Phantom Thrusters', category:'utility', rarity:'rare', desc:'Move speed and slash gain rise.', apply:(p,l)=>{ p.speed *= (1 + 0.03*l); p.slashGain *= (1 + 0.03*l); } },
  { id:'utility_treasure', name:'Fortune Lattice', category:'utility', rarity:'legendary', desc:'Bosses spill more credits and can drop module shards.', apply:(p,l)=>{ p.bossCreditBurst = (p.bossCreditBurst||0) + 4*l; if (l >= 3) p.moduleShardChance = 0.18 + l*0.03; } },
  { id:'utility_mythic', name:'Chrono Cache', category:'utility', rarity:'mythic', desc:'Premium support package with temporal stabilizer pulses.', apply:(p,l)=>{ p.creditBoost += 0.12*l; p.magnet += 24*l; p.regen += 0.2*l; p.temporalShield = Math.max(p.temporalShield||0, l>=3?1:0); } },
];
const moduleThresholds = [1, 2, 4, 7, 11];
const moduleSlotLayout = [
  { key:'core1', category:'core', label:'Core Slot 1' },
  { key:'core2', category:'core', label:'Core Slot 2' },
  { key:'core3', category:'core', label:'Core Slot 3' },
  { key:'combat1', category:'combat', label:'Combat Slot 1' },
  { key:'combat2', category:'combat', label:'Combat Slot 2' },
  { key:'utility1', category:'utility', label:'Utility Slot' },
];
const contractDefs = [

  { id:'slash_kills', name:'Sever 12 targets with Rift Slash', reward:18, init:()=>({goal:12,progress:0}), progress:r=>r.contractData.progress||0, onSlashKill:r=>{r.contractData.progress=(r.contractData.progress||0)+1;} },
  { id:'perfect_wave', name:'Clear the next wave without taking damage', reward:20, init:()=>({goal:1,progress:0}), progress:r=>r.contractData.progress||0, onWaveEnd:r=>{ if(!r.tookDamageWave) r.contractData.progress=1; } },
  { id:'kill_elites', name:'Destroy 3 elite enemies', reward:22, init:()=>({goal:3,progress:0}), progress:r=>r.contractData.progress||0, onEliteKill:r=>{r.contractData.progress=(r.contractData.progress||0)+1;} },
  { id:'collect_credits', name:'Collect 35 credits', reward:16, init:r=>({goal:35,startCredits:r.credits}), progress:r=>Math.max(0,r.credits-(r.contractData.startCredits||0)) },
];
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const rand = (a,b) => Math.random() * (b-a) + a;
const dist = (ax, ay, bx, by) => Math.hypot(ax-bx, ay-by);
const lerp = (a,b,t) => a + (b-a)*t;
const shuffle = arr => { const a = [...arr]; for (let i=a.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; } return a; };
const roman = n => ['I','II','III','IV','V'][Math.max(0, Math.min(4, n-1))] || String(n);

const cg = {
  ready: false,
  adRunning: false,
  async init() {
    try {
      if (window.CrazyGames?.SDK?.init) {
        await window.CrazyGames.SDK.init();
        this.ready = true;
      }
    } catch {}
  },
  gameplayStart() { try { window.CrazyGames?.SDK?.game?.gameplayStart?.(); } catch {} },
  gameplayStop() { try { window.CrazyGames?.SDK?.game?.gameplayStop?.(); } catch {} },
  happy() { try { window.CrazyGames?.SDK?.game?.happytime?.(); } catch {} },
  rewarded(onReward) {
    if (!window.CrazyGames?.SDK?.ad?.requestAd) return false;
    this.adRunning = true;
    window.CrazyGames.SDK.ad.requestAd('rewarded', {
      adStarted: () => { state.paused = true; try { audio.master && (audio.master.gain.value = 0.0001); } catch {} },
      adError: () => { this.adRunning = false; try { audio.master && (audio.master.gain.value = 0.09); } catch {} },
      adFinished: () => {
        this.adRunning = false;
        try { audio.master && (audio.master.gain.value = 0.09); } catch {}
        if (typeof onReward === 'function') onReward();
      },
    });
    return true;
  },
};

const audio = {
  ctx: null, master: null, musicGain: null, nodes: [],
  ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.09 * getSettings().masterVolume;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.03 * getSettings().musicVolume;
    this.musicGain.connect(this.master);
    this.startMusic();
  },
  tone(freq, dur=.08, type='triangle', vol=.12, slide=0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.linearRampToValueAtTime(freq + slide, t + dur);
    gain.gain.setValueAtTime(.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol * getSettings().sfxVolume, t + .01);
    gain.gain.exponentialRampToValueAtTime(.0001, t + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + .02);
  },
  noise(d=.07, vol=.12) {
    if (!this.ctx) return;
    const len = Math.floor(this.ctx.sampleRate * d);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const ch = buffer.getChannelData(0);
    for (let i=0;i<len;i++) ch[i] = (Math.random()*2-1) * (1 - i/len);
    const src = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    gain.gain.value = vol * getSettings().sfxVolume;
    src.buffer = buffer;
    src.connect(gain);
    gain.connect(this.master);
    src.start();
  },
  ui(){ this.tone(600,.07,'triangle',.12,90); },
  shot(){ this.tone(760,.05,'triangle',.10,-200); },
  hit(){ this.tone(180,.08,'sawtooth',.09,-90); },
  kill(){ this.tone(220,.09,'square',.11,240); },
  pickup(){ this.tone(900,.05,'triangle',.08,120); },
  pulse(){ this.noise(.12,.18); this.tone(120,.22,'sawtooth',.12,780); },
  slash(){ this.noise(.08,.16); this.tone(420,.1,'triangle',.14,-150); },
  boss(){ this.tone(140,.2,'square',.12,10); },
  startMusic() {
    if (!this.ctx || this.nodes.length) return;
    const now = this.ctx.currentTime + 0.05;
    const notes = [110, 146.83, 130.81, 164.81];
    for (let i = 0; i < 2; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(notes[0] * (i === 0 ? 1 : 2), now);
      notes.forEach((n, idx) => {
        const t = now + idx * 1.5;
        osc.frequency.linearRampToValueAtTime(n * (i === 0 ? 1 : 2), t);
      });
      osc.frequency.linearRampToValueAtTime(notes[0] * (i === 0 ? 1 : 2), now + notes.length * 1.5);
      gain.gain.value = i === 0 ? 0.12 : 0.05;
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      this.nodes.push(osc);
    }
  }
};

const state = {
  mode: 'menu',
  paused: false,
  mobile: matchMedia('(pointer: coarse)').matches,
  keys: {},
  pointer: { x: 0, y: 0 },
  touch: { active: false, x: 0, y: 0, id: null },
  stars: [],
  particles: [],
  flashes: [],
  bullets: [],
  enemyBullets: [],
  enemies: [],
  drops: [],
  drones: [],
  slashes: [],
  texts: [],
  shake: 0,
  bannerTimer: 0,
  toastTimer: 0,
  bossIntro: 0,
  freezeTimer: 0,
  save: null,
  run: null,
  targetLock: null,
  fps: { show: false, frame: 0, time: 0, value: 0 },
  powerups: [],
  pendingEnd: null,
  comboFx: { timer: 0, text: '', sub: '', amp: 0 },
  momentFx: { timer: 0, title: '', sub: '', color: '#ffe6a6' },
  cameraFx: { zoom: 1, timer: 0, target: 1 },
};

function normalizeSave(raw) {
  return {
    version: VERSION,
    credits: raw?.credits || 0,
    bestScore: raw?.bestScore || 0,
    bestWave: raw?.bestWave || 0,
    totalBosses: raw?.totalBosses || 0,
    achievements: raw?.achievements || {},
    meta: raw?.meta || {},
    modules: raw?.modules || {},
    equippedModules: raw?.equippedModules || { core1:null, core2:null, core3:null, combat1:null, combat2:null, utility1:null },
    settings: { ...DEFAULT_SETTINGS, ...(raw?.settings || {}) },
    threatProfile: raw?.threatProfile || null,
  };
}
function loadSave() {
  let found = null;
  for (const key of [SAVE_KEY, ...LEGACY_KEYS]) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) { found = JSON.parse(raw); break; }
    } catch {}
  }
  return normalizeSave(found);
}
function persist() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state.save));
}
function getSettings() {
  return state.save?.settings || DEFAULT_SETTINGS;
}
function qualityParticleCap() {
  const q = getSettings().quality;
  return q === 'low' ? 130 : q === 'medium' ? 210 : 320;
}
function qualityStarTarget() {
  const q = getSettings().quality;
  return q === 'low' ? 70 : q === 'medium' ? 120 : 180;
}
function applySettings() {
  const s = getSettings();
  const root = document.documentElement;
  root.style.setProperty('--hud-accent', s.hudColor);
  root.style.setProperty('--ship-color', s.shipColor);
  root.style.setProperty('--bullet-color', s.bulletColor);
  document.body.classList.remove('quality-low', 'quality-medium', 'quality-high');
  document.body.classList.add(`quality-${s.quality}`);
  if (audio.master) audio.master.gain.value = 0.09 * s.masterVolume;
  if (audio.musicGain) audio.musicGain.gain.value = 0.03 * s.musicVolume;
}
function syncSettingsUi() {
  const s = getSettings();
  if (els.qualitySetting) els.qualitySetting.value = s.quality;
  if (els.shakeToggle) els.shakeToggle.checked = !!s.shake;
  if (els.masterVolume) els.masterVolume.value = s.masterVolume;
  if (els.musicVolume) els.musicVolume.value = s.musicVolume;
  if (els.sfxVolume) els.sfxVolume.value = s.sfxVolume;
  if (els.hudColor) els.hudColor.value = s.hudColor;
  if (els.shipColor) els.shipColor.value = s.shipColor;
  if (els.bulletColor) els.bulletColor.value = s.bulletColor;
}
function updateSetting(key, value) {
  if (!state.save) return;
  state.save.settings[key] = value;
  persist();
  applySettings();
  syncSettingsUi();
}
function exportSaveData() {
  const payload = JSON.stringify(state.save);
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(payload).then(() => toast('Save copied to clipboard')).catch(() => prompt('Copy your save:', payload));
  } else {
    prompt('Copy your save:', payload);
  }
}
function importSaveData() {
  const raw = prompt('Paste your exported save data here:');
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    state.save = normalizeSave(parsed);
    persist();
    applySettings();
    refreshMetaUi();
    syncSettingsUi();
    toast('Save imported');
  } catch {
    toast('Invalid save import');
  }
}
function resetSaveData() {
  if (!confirm('Reset all progress, modules, and settings?')) return;
  state.save = normalizeSave({});
  persist();
  applySettings();
  refreshMetaUi();
  syncSettingsUi();
  toast('Save reset');
}
function analyzeThreatProfile(run) {
  const s = run.style;
  const scores = {
    dash: s.dashUses * 2.2 + s.slashUses * 0.4,
    range: s.longRangeTime * 1.15,
    pulse: s.pulseUses * 2.0,
    slash: s.slashUses * 1.8 + s.closeRangeTime * 0.45,
  };
  const top = Object.entries(scores).sort((a,b) => b[1] - a[1]);
  const [type, score] = top[0];
  if (!score || score < 4) return null;
  const title = {
    dash: 'Dash Reliance Detected',
    range: 'Long-Range Bias Detected',
    pulse: 'Pulse Saturation Logged',
    slash: 'Close-Quarters Pattern Logged',
  }[type];
  return { type, title, score: Math.round(score * 10) / 10 };
}
function threatResponseText(profile) {
  if (!profile) return '';
  return `Threat Response • ${profile.title}`;
}

function formatRunTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, '0')}`;
}

function moduleDefById(id) { return moduleDefs.find(m => m.id === id); }
function moduleCopies(id) { return state.save.modules[id]?.copies || 0; }
function moduleLevel(id) {
  const copies = moduleCopies(id);
  let level = 0;
  for (const t of moduleThresholds) if (copies >= t) level += 1;
  return Math.min(5, level);
}
function acquireModule(id, copies=1) {
  const existing = state.save.modules[id] || { copies: 0 };
  const wasOwned = existing.copies > 0;
  existing.copies += copies;
  state.save.modules[id] = existing;
  persist();
  const def = moduleDefById(id);
  if (def) {
    toast(`Module acquired • ${def.name}`);
    if (!wasOwned || def.rarity === 'epic' || def.rarity === 'legendary' || def.rarity === 'mythic') {
      showMoment(`${def.rarity.toUpperCase()} MODULE`, def.name, moduleRarityColor(def.rarity));
      state.shake = Math.max(state.shake, def.rarity === 'mythic' ? 1 : def.rarity === 'legendary' ? .8 : .45);
      state.flashes.push({ x: innerWidth * 0.5, y: innerHeight * 0.32, radius: 160, life: .28, color: moduleRarityColor(def.rarity) });
    }
  } else {
    toast(`Module acquired • ${id}`);
  }
  renderModuleInventory();
}
function weightedModulePool(minRarity=null) {
  const order = ['common','rare','epic','legendary','mythic'];
  const minIndex = minRarity ? order.index(minRarity) : 0;
  return moduleDefs.filter(m => order.indexOf(m.rarity) >= minIndex);
}
function randomModuleId(minRarity=null) {
  const pool = weightedModulePool(minRarity);
  const rarityWeight = { common:55, rare:28, epic:11, legendary:5, mythic:1 };
  const weighted = [];
  for (const m of pool) {
    const w = rarityWeight[m.rarity] || 1;
    for (let i = 0; i < w; i++) weighted.push(m.id);
  }
  return weighted.length ? weighted[(Math.random() * weighted.length) | 0] : null;
}
function equipModule(slotKey, moduleId) {
  const slot = moduleSlotLayout.find(s => s.key === slotKey);
  const def = moduleDefById(moduleId);
  if (!slot || !def || def.category !== slot.category) return;
  state.save.equippedModules[slotKey] = moduleId;
  persist();
  renderModuleInventory();
}
function unequipModule(slotKey) {
  state.save.equippedModules[slotKey] = null;
  persist();
  renderModuleInventory();
}
function applyEquippedModulesToPlayer(player) {
  for (const slot of moduleSlotLayout) {
    const id = state.save.equippedModules[slot.key];
    if (!id) continue;
    const def = moduleDefById(id);
    const level = moduleLevel(id);
    if (def && level > 0) def.apply(player, level);
  }
}
function rarityClass(r) { return `rarity-${r}`; }
function moduleRarityColor(r) {
  return r === 'mythic' ? '#ff9ac0' : r === 'legendary' ? '#ffe28f' : r === 'epic' ? '#d6b4ff' : r === 'rare' ? '#9cefff' : '#eef4ff';
}

function moduleLevelEffects(def, level) {
  if (level <= 0) return [];
  const lines = [];
  if (def.category === 'core') lines.push({ label:'Role', value:'Permanent ship foundation and stat shaping.' });
  if (def.category === 'combat') lines.push({ label:'Role', value:'Weapon and ability pressure upgrades during every run.' });
  if (def.category === 'utility') lines.push({ label:'Role', value:'Economy, sustain, and support tech for longer pushes.' });
  lines.push({ label:'Current Level', value:`Level ${level} of 5 unlocked.` });
  const next = level < 5 ? moduleThresholds[level] : null;
  lines.push({ label:'Progress', value: next ? `${next} total copies unlock the next level.` : 'This module is maxed.' });
  return lines;
}
function openModuleModal(def) {
  if (!els.moduleModal || !def) return;
  const level = moduleLevel(def.id);
  const copies = moduleCopies(def.id);
  els.moduleModalRarity.textContent = def.rarity.toUpperCase();
  els.moduleModalRarity.className = `badge ${rarityClass(def.rarity)}`;
  els.moduleModalName.textContent = def.name;
  els.moduleModalTitle.textContent = def.name;
  els.moduleModalCategory.textContent = `${def.category.toUpperCase()} MODULE`;
  els.moduleModalLevel.textContent = `Level ${level}`;
  els.moduleModalDesc.textContent = def.desc;
  els.moduleModalCopies.textContent = `Copies owned: ${copies}`;
  els.moduleModalCard.dataset.rarity = def.rarity;
  els.moduleModalEffect.innerHTML = moduleLevelEffects(def, level).map(line => `<div class="effect-line"><span class="effect-label">${line.label}</span>${line.value}</div>`).join('');
  els.moduleModal.classList.remove('hidden');
  els.moduleModal.setAttribute('aria-hidden', 'false');
}
function closeModuleModal() {
  if (!els.moduleModal) return;
  els.moduleModal.classList.add('hidden');
  els.moduleModal.setAttribute('aria-hidden', 'true');
}
function setupParallaxCard(card) {
  if (!card) return;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reset = () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    card.style.setProperty('--mx', '50%');
    card.style.setProperty('--my', '50%');
  };
  if (reduced || 'ontouchstart' in window) {
    reset();
    return;
  }
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 12;
    const rx = (0.5 - py) * 12;
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
    card.style.setProperty('--mx', `${px * 100}%`);
    card.style.setProperty('--my', `${py * 100}%`);
  });
  card.addEventListener('mouseleave', reset);
  reset();
}
function renderModuleInventory() {
  if (!els.cardInventory || !els.moduleSlots) return;
  els.moduleSlots.innerHTML = '';
  for (const slot of moduleSlotLayout) {
    const id = state.save.equippedModules[slot.key];
    const def = id ? moduleDefById(id) : null;
    const level = id ? moduleLevel(id) : 0;
    const div = document.createElement('div');
    div.className = 'module-slot';
    div.innerHTML = `<h4>${slot.label}</h4><div class="slot-main">${def ? def.name : 'Empty'}</div><div class="slot-sub">${def ? `${def.category} • Lv ${level}` : `Equip a ${slot.category} module`}</div>`;
    els.moduleSlots.appendChild(div);
  }

  const order = { common:0, rare:1, epic:2, legendary:3, mythic:4 };
  const owned = moduleDefs.filter(m => moduleCopies(m.id) > 0).sort((a,b) => order[b.rarity]-order[a.rarity] || a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  els.cardInventory.innerHTML = '';
  if (!owned.length) {
    const empty = document.createElement('div');
    empty.className = 'list-item';
    empty.innerHTML = `<div class="list-head"><div><h3>No modules yet</h3><p>Bosses and milestone waves can drop rare Rift Modules.</p></div><div class="badge locked">Empty</div></div>`;
    els.cardInventory.appendChild(empty);
    return;
  }
  for (const def of owned) {
    const level = moduleLevel(def.id);
    const copies = moduleCopies(def.id);
    const equippedIn = moduleSlotLayout.find(s => state.save.equippedModules[s.key] === def.id);
    const validSlots = moduleSlotLayout.filter(s => s.category === def.category);
    const wrap = document.createElement('button');
    wrap.type = 'button';
    wrap.className = 'module-card-btn';
    const item = document.createElement('div');
    item.className = 'list-item';
    const nextNeed = level < 5 ? moduleThresholds[level] : null;
    item.innerHTML = `
      <div class="list-head">
        <div>
          <h3>${def.name}</h3>
          <p class="tight">${def.desc}</p>
          <p><span class="hover-data" data-tip="Module category decides which slot it can use.">${def.category.toUpperCase()}</span> • Copies ${copies} • Level ${level}${nextNeed ? ` • Next at ${nextNeed}` : ' • Maxed'}</p>
        </div>
        <div class="badge ${rarityClass(def.rarity)}">${def.rarity}</div>
      </div>
      <div class="card-actions"></div>
      <div class="hover-hint">Click to inspect</div>`;
    const actions = item.querySelector('.card-actions');
    if (equippedIn) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn';
      btn.textContent = `Unequip (${equippedIn.label})`;
      btn.addEventListener('click', (ev) => { ev.stopPropagation(); audio.ui(); unequipModule(equippedIn.key); });
      actions.appendChild(btn);
    } else {
      for (const slot of validSlots) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn primary';
        btn.textContent = `Equip ${slot.label.replace(' Slot', '')}`;
        btn.addEventListener('click', (ev) => { ev.stopPropagation(); audio.ui(); equipModule(slot.key, def.id); });
        actions.appendChild(btn);
      }
    }
    wrap.appendChild(item);
    wrap.addEventListener('click', () => { audio.ui(); openModuleModal(def); });
    els.cardInventory.appendChild(wrap);
  }
}
function resize() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = innerWidth * ratio;
  canvas.height = innerHeight * ratio;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  if (!state.stars.length) {
    for (let i = 0; i < 180; i++) state.stars.push({ x: rand(0, innerWidth), y: rand(0, innerHeight), s: rand(.5, 2.4), v: rand(6, 22), layer: i < 90 ? 1 : i < 145 ? 2 : 3, tw: rand(0, Math.PI * 2) });
  }
  els.touchControls?.classList.toggle('hidden', !(state.mobile && state.mode === 'game'));
}

function makePlayer() {
  const m = state.save.meta;
  const player = {
    x: innerWidth / 2, y: innerHeight / 2,
    r: 15,
    speed: 270 * (1 + (m.drive || 0) * .05),
    maxHp: 108 + (m.hull || 0) * 12,
    hp: 108 + (m.hull || 0) * 12,
    damage: 18 * (1 + (m.cannon || 0) * .08),
    fireDelay: .17, fireTimer: 0, bulletSpeed: 760,
    pierce: 0, multiShot: 0,
    pulse: 0, pulseGain: 1 * (1 + (m.pulse || 0) * .10),
    slash: 30, slashGain: 1, slashCooldown: 2.85, slashTimer: 0, slashDamage: 88 * (1 + (m.slash || 0) * .10), slashNova: 0,
    magnet: 80, critChance: 0.08, critDamage: 0.5, regen: 0, creditBoost: 0,
    waveShield: 0, shieldLeft: 0,
    ricochet: 0, chain: 0, droneCount: 0, iframes: 0, autoPulse: false, pulseDamageBonus: 0,
    target: null, targetLock: 0, contractRewardBonus: 0, eliteRewardBonus: 0, killPulseBonus: 0, killSlashBonus: 0, bossCreditBurst: 0,
    pulseVortex: 0, megaShotEvery: 0, shotCounter: 0, bulletSplash: 0, droneBeam: false, moduleShardChance: 0, temporalShield: 0,
  };
  applyEquippedModulesToPlayer(player);
  return player;
}

function refreshMetaUi() {
  els.bestScore.textContent = state.save.bestScore.toLocaleString();
  els.bankedCredits.textContent = state.save.credits.toLocaleString();
  els.bestWave.textContent = state.save.bestWave;
  els.bossesTotal.textContent = state.save.totalBosses;
  renderMetaShop();
  renderAchievements();
  renderModuleInventory();
}

function assignContract(initial=false) {
  if (!state.run) return;
  const pool = contractDefs.filter(def => !state.run.contract || def.id !== state.run.contract.id);
  const source = pool.length ? pool : contractDefs;
  const def = source[(Math.random() * source.length) | 0];
  state.run.contract = def;
  state.run.contractData = def.init(state.run);
  state.run.contractComplete = false;
  if (!initial) toast(`Contract • ${def.name}`);
}
function maybeCheckContract() {
  const r = state.run;
  if (!r || !r.contract || r.contractComplete) return;
  const progress = r.contract.progress(r);
  if (progress >= r.contractData.goal) {
    r.contractComplete = true;
    const reward = Math.round(r.contract.reward * (1 + (r.player.contractRewardBonus || 0)));
    r.credits += reward;
    r.earnedCredits += reward;
    r.score += reward * 18;
    r.player.pulse = clamp(r.player.pulse + 25, 0, 100);
    toast(`Contract complete +${reward}`);
  }
}

const powerupDefs = [
  { id:'overdrive', name:'Overdrive', color:'#73f2ff', duration:8, apply:(p)=>{ p.fireDelay *= 0.74; }, remove:(p)=>{ p.fireDelay /= 0.74; } },
  { id:'bulwark', name:'Bulwark', color:'#ffd36e', duration:8, apply:(p)=>{ p.iframes = Math.max(p.iframes, .25); p.shieldLeft += 2; }, remove:(p)=>{} },
  { id:'riftcharge', name:'Rift Charge', color:'#ff7fd8', duration:8, apply:(p)=>{ p.slashGain *= 1.8; p.slash = clamp(p.slash + 55, 0, 100); }, remove:(p)=>{ p.slashGain /= 1.8; } },
  { id:'magnet', name:'Magnet Surge', color:'#9dffcf', duration:8, apply:(p)=>{ p.magnet += 120; }, remove:(p)=>{ p.magnet -= 120; } },
  { id:'critrush', name:'Crit Rush', color:'#fff0a8', duration:8, apply:(p)=>{ p.critChance += .22; p.critDamage += .35; }, remove:(p)=>{ p.critChance -= .22; p.critDamage -= .35; } },
];
function spawnPowerup(x, y) {
  const def = powerupDefs[(Math.random() * powerupDefs.length) | 0];
  state.powerups.push({ x, y, vx: rand(-20,20), vy: rand(-20,20), life: 9999, def });
}
function grantPowerup(def) {
  const p = state.run.player;
  const active = state.run.activePowerups;
  if (active[def.id]) {
    active[def.id].time = Math.max(active[def.id].time, def.duration);
    toast(`${def.name} refreshed`);
    return;
  }
  def.apply(p);
  active[def.id] = { time:def.duration, def };
  toast(`${def.name} online`);
}
function updatePowerups(dt) {
  if (!state.run) return;
  const p = state.run.player;
  for (let i = state.powerups.length - 1; i >= 0; i--) {
    const pu = state.powerups[i];
    pu.x += pu.vx * dt; pu.y += pu.vy * dt;
    pu.vx *= .985; pu.vy *= .985;
    if (dist(pu.x, pu.y, p.x, p.y) <= p.r + 12) {
      grantPowerup(pu.def);
      state.powerups.splice(i, 1);
      continue;
    }
  }
  for (const [id, active] of Object.entries(state.run.activePowerups)) {
    active.time -= dt;
    if (active.time <= 0) {
      active.def.remove(state.run.player);
      delete state.run.activePowerups[id];
      toast(`${active.def.name} offline`);
    }
  }
}
function rollAdOfferType() {
  const r = Math.random();
  if (r < 0.08) return 'continue';
  if (r < 0.16) return 'double';
  return null;
}
function offerContinueVisible() {
  return !!(state.run && state.run.adOfferType === 'continue' && !state.run.continueUsed && state.run.wave >= 10);
}
function offerDoubleRewardVisible() {
  return !!(state.pendingEnd && state.run && state.run.adOfferType === 'double' && !state.pendingEnd.doubleRewardUsed);
}
function updateAdButtons() {
  if (els.continueAdBtn) els.continueAdBtn.classList.toggle('hidden', !offerContinueVisible());
  if (els.doubleRewardBtn) els.doubleRewardBtn.classList.toggle('hidden', !offerDoubleRewardVisible());
}
function reviveFromAd() {
  if (!state.pendingEnd || !state.run) return;
  const p = state.run.player;
  state.run.continueUsed = true;
  p.hp = Math.max(42, p.maxHp * 0.45);
  p.pulse = 100;
  p.slash = 100;
  p.iframes = 1.25;
  state.enemyBullets = [];
  state.flashes.push({ x:p.x, y:p.y, radius:110, life:.28, color:'#8ad8ff' });
  state.shake = .5;
  state.mode = 'game';
  state.paused = false;
  els.gameOverOverlay.classList.add('hidden');
  els.hud.classList.remove('hidden');
  if (state.mobile) els.touchControls.classList.remove('hidden');
  if (state.run) state.run.adOfferType = null;
  state.pendingEnd = null;
  updateAdButtons();
  syncHud();
}
function doubleRunRewardsFromAd() {
  if (!state.pendingEnd || state.pendingEnd.doubleRewardUsed) return;
  const extra = state.pendingEnd.earnedCredits;
  state.save.credits += extra;
  state.pendingEnd.doubleRewardUsed = true;
  if (state.run) state.run.adOfferType = null;
  persist();
  els.finalCredits.textContent = (state.pendingEnd.earnedCredits * 2).toLocaleString();
  toast(`Reward doubled +${extra}`);
  updateAdButtons();
  refreshMetaUi();
}
function refreshSynergies() {
  if (!state.run) return;
  const r = state.run;
  const counts = r.tagCounts || {};
  for (const def of synergyDefs) {
    if (r.activeSynergies?.includes(def.id)) continue;
    const test = {...counts};
    let ok = true;
    for (const need of def.need) {
      test[need] = (test[need] || 0) - 1;
      if (test[need] < 0) { ok = false; break; }
    }
    if (!ok) continue;
    def.apply(r.player);
    r.activeSynergies.push(def.id);
    toast(`Synergy unlocked • ${def.name}`);
    banner(`SYNERGY • ${def.name}`);
    state.freezeTimer = Math.max(state.freezeTimer, .05);
    state.flashes.push({ x:r.player.x, y:r.player.y, radius:110, life:.24, color:'rgba(255,230,170,0.95)' });
  }
}
function applyRunUpgrade(up) {
  up.apply(state.run.player);
  for (const t of (up.tags || [])) state.run.tagCounts[t] = (state.run.tagCounts[t] || 0) + 1;
  let best = null, bestValue = 0;
  for (const [k,v] of Object.entries(state.run.tagCounts)) if (v > bestValue) { best = k; bestValue = v; }
  if (best && bestValue >= 3) state.run.archetype = best;
  refreshSynergies();
}
function openRelicChoices() {
  state.mode = 'relic';
  els.relicOverlay.classList.remove('hidden');
  state.paused = true;
  const picks = shuffle(relicDefs).slice(0, 3);
  els.relicChoices.innerHTML = '';
  for (const relic of picks) {
    const card = document.createElement('button');
    card.className = 'upgrade-card btn';
    card.innerHTML = `<div class="tag">Relic</div><h3>${relic.name}</h3><p>${relic.desc}</p>`;
    card.addEventListener('click', () => {
      audio.ui();
      relic.apply(state.run.player);
      state.run.relics.push(relic.id);
      els.relicOverlay.classList.add('hidden');
      state.mode = 'game';
      state.paused = false;
      startNextWave();
    });
    els.relicChoices.appendChild(card);
  }
}
function applyElite(e) {
  e.elite = true;
  const mod = ['overcharged','armored','volatile','frenzied'][(Math.random() * 4) | 0];
  e.eliteMod = mod;
  if (mod === 'overcharged') { e.speed *= 1.18; e.color = '#ffe66e'; e.value += 4; }
  if (mod === 'armored') { e.hp *= 1.45; e.maxHp = e.hp; e.r += 2; e.color = '#b8d7ff'; e.value += 5; }
  if (mod === 'volatile') { e.explosive = true; e.color = '#ff8a6b'; e.value += 5; }
  if (mod === 'frenzied') { e.speed *= 1.26; e.color = '#ff78d2'; e.value += 6; }
}

function renderMetaShop() {
  els.metaShop.innerHTML = '';
  for (const up of metaDefs) {
    const level = state.save.meta[up.id] || 0;
    const cost = level >= up.max ? null : Math.round(up.base * Math.pow(1.55, level));
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <div class="list-head">
        <div><h3>${up.name}</h3><p>${up.desc}</p></div>
        <div class="badge">${level}/${up.max}</div>
      </div>
      <div class="row-between">
        <span class="mini">${cost === null ? 'Maxed' : `${cost} credits`}</span>
        <button class="btn ${cost !== null && state.save.credits >= cost ? 'primary' : ''}" ${cost === null || state.save.credits < cost ? 'disabled' : ''}>${cost === null ? 'Complete' : 'Buy'}</button>
      </div>`;
    const btn = item.querySelector('button');
    btn.addEventListener('click', () => {
      if (cost === null || state.save.credits < cost) return;
      audio.ui();
      state.save.credits -= cost;
      state.save.meta[up.id] = level + 1;
      persist();
      refreshMetaUi();
    });
    els.metaShop.appendChild(item);
  }
}
function renderAchievements() {
  els.achievementList.innerHTML = '';
  for (const a of achieveDefs) {
    const done = !!state.save.achievements[a.id];
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <div class="list-head">
        <div><h3>${a.name}</h3><p>${a.desc}</p></div>
        <div class="badge ${done ? '' : 'locked'}">${done ? 'Unlocked' : 'Locked'}</div>
      </div>`;
    els.achievementList.appendChild(item);
  }
}
function setHomeTab(tab) {
  const upgrades = tab === 'upgrades';
  const milestones = tab === 'milestones';
  const cards = tab === 'cards';
  const settings = tab === 'settings';
  els.tabMeta?.classList.toggle('active', upgrades);
  els.tabAchievements?.classList.toggle('active', milestones);
  els.tabCards?.classList.toggle('active', cards);
  els.tabSettings?.classList.toggle('active', settings);
  els.tabMeta?.setAttribute('aria-selected', upgrades ? 'true' : 'false');
  els.tabAchievements?.setAttribute('aria-selected', milestones ? 'true' : 'false');
  els.tabCards?.setAttribute('aria-selected', cards ? 'true' : 'false');
  els.tabSettings?.setAttribute('aria-selected', settings ? 'true' : 'false');
  els.metaPanel?.classList.toggle('active', upgrades);
  els.achievementPanel?.classList.toggle('active', milestones);
  els.cardPanel?.classList.toggle('active', cards);
  els.settingsPanel?.classList.toggle('active', settings);
  if (settings) syncSettingsUi();
}
function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  state.toastTimer = 1.5;
}
function banner(msg) {
  els.waveBanner.textContent = msg;
  els.waveBanner.classList.remove('hidden');
  state.bannerTimer = 1.45;
}

function showMoment(title, sub='', color='#ffe6a6') {
  state.momentFx.timer = 0.72;
  state.momentFx.title = title;
  state.momentFx.sub = sub;
  state.momentFx.color = color;
  if (els.momentOverlay) {
    els.momentOverlay.innerHTML = `<div class="moment-wrap"><div class="moment-title">${title}</div><div class="moment-sub" style="color:${color}">${sub}</div></div>`;
    els.momentOverlay.classList.remove('hidden');
    els.momentOverlay.classList.remove('show');
    void els.momentOverlay.offsetWidth;
    els.momentOverlay.classList.add('show');
  }
}

function comboLabel(combo) {
  if (combo >= 20) return 'UNSTOPPABLE';
  if (combo >= 12) return 'MAYHEM';
  if (combo >= 8) return 'FRENZY';
  if (combo >= 5) return 'RUSH';
  if (combo >= 3) return 'COMBO';
  return '';
}
function pulseComboBurst(combo) {
  const label = comboLabel(combo);
  if (!label) return;
  state.comboFx.timer = 0.42;
  state.comboFx.text = `x${combo.toFixed(1)}`;
  state.comboFx.sub = label;
  state.comboFx.amp = combo >= 12 ? 1 : combo >= 8 ? 0.8 : 0.55;
  if (els.comboBurst) {
    els.comboBurst.innerHTML = `<div class="combo-main">${state.comboFx.text}</div><div class="combo-sub">${state.comboFx.sub}</div>`;
    els.comboBurst.classList.remove('hidden');
    els.comboBurst.classList.remove('show');
    void els.comboBurst.offsetWidth;
    els.comboBurst.classList.add('show');
  }
}
function awardAchievement(id) {
  if (state.save.achievements[id]) return;
  state.save.achievements[id] = true;
  persist();
  const found = achieveDefs.find(a => a.id === id);
  if (found) toast(`Milestone unlocked: ${found.name}`);
  renderAchievements();
}
function checkAchievements() {
  const r = state.run;
  for (const a of achieveDefs) if (!state.save.achievements[a.id] && a.check(r, state.save)) awardAchievement(a.id);
}

function makeEnemy(type, x, y, wave) {
  const base = 1 + wave * 0.11;
  const e = { type, x, y, vx: 0, vy: 0, t: 0, hit: 0, shot: rand(.7, 1.6), mine: 1.7 };
  if (type === 'chaser') return { ...e, hp: 28 * base, maxHp: 28 * base, speed: 90 + wave * 6, r: 12, value: 4, color: '#79f4ff' };
  if (type === 'charger') return { ...e, hp: 22 * base, maxHp: 22 * base, speed: 120 + wave * 8, r: 10, value: 5, color: '#ffb365', charge: 0 };
  if (type === 'sniper') return { ...e, hp: 24 * base, maxHp: 24 * base, speed: 52 + wave * 3, r: 11, value: 6, color: '#ff78d2' };
  if (type === 'orbiter') return { ...e, hp: 30 * base, maxHp: 30 * base, speed: 76 + wave * 5, r: 12, value: 6, color: '#a98aff', orbit: rand(0, Math.PI * 2) };
  if (type === 'splitter') return { ...e, hp: 34 * base, maxHp: 34 * base, speed: 70 + wave * 5, r: 14, value: 7, color: '#82ffb8' };
  if (type === 'kamikaze') return { ...e, hp: 20 * base, maxHp: 20 * base, speed: 138 + wave * 8, r: 10, value: 5, color: '#ff5e7c' };
  if (type === 'miner') return { ...e, hp: 40 * base, maxHp: 40 * base, speed: 60 + wave * 4, r: 14, value: 7, color: '#ffd770' };
  if (type === 'tank') return { ...e, hp: 62 * base, maxHp: 62 * base, speed: 48 + wave * 4, r: 18, value: 8, color: '#9fc0ff' };
  return { ...e, hp: 18 * base, maxHp: 18 * base, speed: 0, r: 10, value: 3, color: '#ffd36e', fuse: 1.8 + rand(0,.8) };
}
function makeBoss(def, wave) {
  const finalBoss = def.family === 'mothership';
  return {
    type: 'boss', name: def.name, family: def.family, x: innerWidth/2, y: 120, vx: 0, vy: 0,
    hp: finalBoss ? 5400 : 520 + wave * 95, maxHp: finalBoss ? 5400 : 520 + wave * 95,
    speed: finalBoss ? 54 : 70 + wave * 0.18, r: finalBoss ? 92 : 40, value: finalBoss ? 550 : 70,
    phase: 1, shot: finalBoss ? .85 : .95, t: 0, color: def.color, core: def.core, finalBoss, dashTimer: 1.35,
  };
}
function startRun() {
  audio.ensure();
  cg.gameplayStart();
  state.mode = 'game';
  state.paused = false;
  els.menu.classList.add('hidden');
  els.howPanel.classList.add('hidden');
  els.pauseOverlay.classList.add('hidden');
  els.gameOverOverlay.classList.add('hidden');
  els.upgradeOverlay.classList.add('hidden');
  if (els.relicOverlay) els.relicOverlay.classList.add('hidden');
  els.hud.classList.remove('hidden');
  resize();

  state.run = {
    player: makePlayer(),
    wave: 0, score: 0, credits: (state.save.meta.salvage || 0) * 2, earnedCredits: 0,
    kills: 0, bosses: 0, maxCombo: 1, combo: 1, comboTimer: 0, perfectWaves: 0,
    tookDamageWave: false, event: 'Assault', enemiesToSpawn: 0, spawnTimer: 0, inBossWave: false,
    targetLock: null, targetLockTime: 0, sector: 1, archetype: null, tagCounts: { slash:0, projectile:0, energy:0, drone:0 },
    bossOrder: shuffle(bossDefs), bossIndex: 0, relics: [], contract: null, contractData: {}, contractComplete: false,
    continueUsed: false, activePowerups: {}, adOfferType: null, zoneName: zoneNames[0],
  };
  state.powerups = [];
  state.pendingEnd = null;
  state.bullets = []; state.enemyBullets = []; state.enemies = []; state.drops = []; state.particles = [];
  state.flashes = []; state.texts = []; state.slashes = []; state.drones = []; state.shake = 0;
  state.freezeTimer = 0; state.bossIntro = 0;
  startNextWave();
  syncHud();
}
function showMenu() {
  cg.gameplayStop();
  state.mode = 'menu';
  state.paused = false;
  state.run = null;
  els.menu.classList.remove('hidden');
  els.hud.classList.add('hidden');
  els.bossHud.classList.add('hidden');
  els.pauseOverlay.classList.add('hidden');
  els.gameOverOverlay.classList.add('hidden');
  els.upgradeOverlay.classList.add('hidden');
  if (els.relicOverlay) els.relicOverlay.classList.add('hidden');
  els.touchControls.classList.add('hidden');
  refreshMetaUi();
  applySettings();
  syncSettingsUi();
  updateAdButtons();
  setHomeTab('upgrades');
  setupParallaxCard(els.moduleModalCard);
}
function endRun(victory=false) {
  const r = state.run; if (!r) return;
  cg.gameplayStop();
  state.mode = 'gameover';
  state.save.credits += r.earnedCredits;
  state.save.bestScore = Math.max(state.save.bestScore, Math.floor(r.score));
  state.save.bestWave = Math.max(state.save.bestWave, r.wave);
  state.save.totalBosses += r.bosses;
  const milestoneDrops = [];
  if (r.bosses > 0 && Math.random() < 0.25) milestoneDrops.push(randomModuleId());
  if (r.wave >= 25) milestoneDrops.push(randomModuleId());
  if (r.wave >= 50) milestoneDrops.push(randomModuleId('rare'));
  if (r.wave >= 100) milestoneDrops.push(randomModuleId('epic'));
  const granted = [...new Set(milestoneDrops.filter(Boolean))];
  for (const id of granted) acquireModule(id);
  state.save.threatProfile = analyzeThreatProfile(r);
  persist();
  checkAchievements();
  refreshMetaUi();
  r.adOfferType = rollAdOfferType();
  state.pendingEnd = { earnedCredits: r.earnedCredits, doubleRewardUsed: false };
  els.finalScore.textContent = Math.floor(r.score).toLocaleString();
  els.finalWave.textContent = r.wave;
  els.finalCredits.textContent = r.earnedCredits.toLocaleString();
  els.finalCombo.textContent = `x${r.maxCombo.toFixed(1)}`;
  if (els.finalTime) els.finalTime.textContent = formatRunTime(r.runSeconds);
  els.gameOverTitle.textContent = victory ? 'Protocol Complete' : 'Rift Collapse';
  const threatCopy = state.save.threatProfile ? `<div>Next run pressure: <strong>${state.save.threatProfile.title}</strong></div>` : '';
  const moduleCopy = granted.length ? `<div>Modules found: <strong>${granted.map(id => moduleDefById(id)?.name || id).join(' • ')}</strong></div>` : `<div>Modules found: <strong>None</strong></div>`;
  const wavesToBoss = 10 - (r.wave % 10 || 10);
  const nearBossCopy = (!victory && wavesToBoss <= 2) ? `<div class="highlight">Close call: <strong>${wavesToBoss}</strong> wave${wavesToBoss === 1 ? '' : 's'} from the next boss cache.</div>` : '';
  const bestCopy = (Math.floor(r.score) >= state.save.bestScore || r.wave >= state.save.bestWave) ? `<div class="highlight">New personal benchmark recorded.</div>` : '';
  els.runSummary.innerHTML = `
    <div>Enemies destroyed: <strong>${r.kills}</strong></div>
    <div>Bosses cleared: <strong>${r.bosses}</strong></div>
    <div>Perfect waves: <strong>${r.perfectWaves}</strong></div>
    <div>Combat rating: <strong>${combatRating(r)}</strong></div>
    <div>Run time: <strong>${formatRunTime(r.runSeconds)}</strong></div>
    ${moduleCopy}
    ${threatCopy}
    ${nearBossCopy}
    ${bestCopy}`;
  els.gameOverOverlay.classList.remove('hidden');
  els.bossHud.classList.add('hidden');
  els.hud.classList.add('hidden');
  els.touchControls.classList.add('hidden');
  updateAdButtons();
}
function combatRating(r) {
  const value = r.score * 0.002 + r.wave * 4 + r.maxCombo * 12 + r.perfectWaves * 6;
  if (value >= 90) return 'S';
  if (value >= 70) return 'A';
  if (value >= 50) return 'B';
  if (value >= 35) return 'C';
  return 'D';
}
function startNextWave() {
  const r = state.run; if (!r) return;
  r.wave += 1;
  r.sector = Math.min(5, Math.floor((r.wave - 1) / 200) + 1);
  const zoneIndex = Math.floor((r.wave - 1) / 20) % zoneNames.length;
  r.zoneName = zoneNames[zoneIndex];
  r.tookDamageWave = false;
  r.player.shieldLeft = r.player.waveShield;
  r.inBossWave = r.wave % 10 === 0;
  if (!r.inBossWave && r.wave % 5 === 1) assignContract(false);
  if (r.inBossWave) {
    r.event = r.wave === 1000 ? 'Mother Ship' : 'Boss';
    r.currentBossName = r.wave === 1000 ? MOTHERSHIP.name : (r.bossOrder[r.bossIndex % r.bossOrder.length]?.name || 'Boss');
    r.enemiesToSpawn = 1;
    r.spawnTimer = .42;
    state.bossIntro = 1.5;
    state.freezeTimer = 1.15;
    state.cameraFx.zoom = 1.08; state.cameraFx.target = 1; state.cameraFx.timer = 0.55;
    const nextBoss = r.wave === 1000 ? MOTHERSHIP : r.bossOrder[r.bossIndex % r.bossOrder.length];
    banner(`${r.wave === 1000 ? 'Final Signal' : 'Boss Wave'} • ${nextBoss.name} • ${nextBoss.title || ''}`);
    showMoment(r.wave === 1000 ? 'FINAL CONTACT' : 'BOSS CONTACT', `${nextBoss.name} // ${nextBoss.title || 'Hostile Entity'}`, nextBoss.tele || nextBoss.color || '#ffe28f');
    audio.boss();
  } else {
    r.event = events[(r.wave - 1) % events.length];
    const eventBonus = r.event === 'Riftstorm' ? 3 : r.event === 'Bulwark' ? 2 : r.event === 'Crossfire' ? 1 : 0;
    r.enemiesToSpawn = 8 + Math.floor(r.wave * 1.75) + eventBonus + Math.floor(r.sector * 1.2) + (r.wave === 1 ? 5 : 0);
    r.spawnTimer = r.wave === 1 ? 0.24 : 0.42;
    banner(r.wave === 1 ? 'Opening Surge • Weapons Hot' : (r.wave % 10 === 9 ? `Wave ${r.wave} • Warning: Boss Signal Rising` : (r.wave % 20 === 1 && r.wave > 1 ? `Zone Shift • ${r.zoneName}` : `Wave ${r.wave} • ${r.event}`)));
    if (r.wave % 20 === 1 && r.wave > 1) showMoment('ZONE SHIFT', r.zoneName, '#9cefff');
    audio.ui();
  }
  syncHud();
}
function spawnEnemy() {
  const r = state.run;
  if (r.inBossWave) {
    if (r.wave === 1000) {
      r.currentBossName = MOTHERSHIP.name;
      state.enemies.push(makeBoss(MOTHERSHIP, r.wave));
    } else {
      if (r.bossIndex > 0 && r.bossIndex % bossDefs.length === 0) r.bossOrder = shuffle(bossDefs);
      const def = r.bossOrder[r.bossIndex % bossDefs.length];
      r.currentBossName = def.name;
      state.enemies.push(makeBoss(def, r.wave));
      r.bossIndex += 1;
    }
    els.bossHud.classList.remove('hidden');
    return;
  }
  const margin = 120;
  const side = (Math.random() * 4) | 0;
  let x, y;
  if (side === 0) { x = rand(-margin, innerWidth + margin); y = -margin; }
  else if (side === 1) { x = innerWidth + margin; y = rand(-margin, innerHeight + margin); }
  else if (side === 2) { x = rand(-margin, innerWidth + margin); y = innerHeight + margin; }
  else { x = -margin; y = rand(-margin, innerHeight + margin); }
  const wave = r.wave;
  const pool = ['chaser','charger','sniper'];
  if (wave <= 2) pool.push('charger','splitter');
  if (wave >= 12) pool.push('orbiter');
  if (wave >= 20) pool.push('splitter');
  if (wave >= 30) pool.push('kamikaze');
  if (wave >= 40) pool.push('miner');
  if (wave >= 50) pool.push('tank');
  if (r.event === 'Crossfire') pool.push('sniper','sniper');
  if (r.event === 'Bulwark') pool.push('tank');
  if (r.event === 'Riftstorm') pool.push('orbiter','splitter');
  if (r.threatResponse?.type === 'dash') pool.push('miner','sniper');
  if (r.threatResponse?.type === 'range') pool.push('charger','charger','kamikaze');
  if (r.threatResponse?.type === 'pulse') pool.push('splitter','tank');
  if (r.threatResponse?.type === 'slash') pool.push('orbiter','miner','tank');
  const e = makeEnemy(pool[(Math.random()*pool.length)|0], x, y, wave);
  if (wave >= 15 && Math.random() < Math.min(0.28, 0.05 + wave * 0.0012)) applyElite(e);
  state.enemies.push(e);
}

function getMoveVector() {
  let x = 0, y = 0;
  if (state.keys.KeyA || state.keys.ArrowLeft) x -= 1;
  if (state.keys.KeyD || state.keys.ArrowRight) x += 1;
  if (state.keys.KeyW || state.keys.ArrowUp) y -= 1;
  if (state.keys.KeyS || state.keys.ArrowDown) y += 1;
  if (state.touch.active) { x += state.touch.x; y += state.touch.y; }
  const m = Math.hypot(x, y) || 1;
  return { x: x / m, y: y / m };
}
function bestTarget() {
  const r = state.run, p = r.player;
  if (r.targetLock && r.targetLockTime > 0 && state.enemies.includes(r.targetLock)) {
    r.targetLockTime -= 1/60;
    return r.targetLock;
  }
  let best = null, score = Infinity;
  for (const e of state.enemies) {
    const d = dist(p.x, p.y, e.x, e.y);
    const front = Math.abs(Math.atan2(e.y - p.y, e.x - p.x) - p.facing || 0);
    const value = d - (e.type === 'boss' ? 220 : 0) + front * 30;
    if (value < score) { score = value; best = e; }
  }
  r.targetLock = best;
  r.targetLockTime = best ? 0.18 : 0;
  return best;
}
function shootAtNearest() {
  const r = state.run, p = r.player;
  const target = bestTarget();
  if (!target) return;
  const ang = Math.atan2(target.y - p.y, target.x - p.x);
  p.facing = ang;
  p.shotCounter = (p.shotCounter || 0) + 1;
  const mega = p.megaShotEvery > 0 && p.shotCounter % p.megaShotEvery === 0;
  const shots = [{ a: ang, s: mega ? 2.3 : 1, off: 0, mega }];
  if (p.multiShot >= 1) shots.push({ a: ang - .18, s: .78, off: -8 }, { a: ang + .18, s: .78, off: 8 });
  if (p.multiShot >= 2) shots.push({ a: ang - .34, s: .68, off: -14 }, { a: ang + .34, s: .68, off: 14 });
  for (const s of shots) {
    state.bullets.push({
      x: p.x + Math.cos(s.a + Math.PI / 2) * s.off,
      y: p.y + Math.sin(s.a + Math.PI / 2) * s.off,
      vx: Math.cos(s.a) * p.bulletSpeed,
      vy: Math.sin(s.a) * p.bulletSpeed,
      dmg: p.damage * s.s, r: s.mega ? 7 : 4, pierce: p.pierce + (s.mega ? 1 : 0), ricochet: p.ricochet, chain: p.chain, mega: !!s.mega
    });
  }
  p.fireTimer = p.fireDelay;
  audio.shot();
}

function updateDrones(dt) {
  const r = state.run, p = r.player;
  while (state.drones.length < p.droneCount) state.drones.push({ angle: rand(0, Math.PI * 2), fire: rand(.1, .4) });
  state.drones.length = p.droneCount;
  for (let i = 0; i < state.drones.length; i++) {
    const d = state.drones[i];
    d.angle += dt * (1.5 + i * .2);
    d.fire -= dt;
    if (d.fire <= 0) {
      const dx = p.x + Math.cos(d.angle) * 42;
      const dy = p.y + Math.sin(d.angle) * 42;
      const target = nearestEnemy(dx, dy, 420);
      if (target) {
        const a = Math.atan2(target.y - dy, target.x - dx);
        state.bullets.push({ x: dx, y: dy, vx: Math.cos(a) * 620, vy: Math.sin(a) * 620, dmg: p.damage * .55, r: 3, pierce: 0, ricochet: 0, chain: 0, drone:true });
        if (p.droneBeam) {
          state.flashes.push({ x1: dx, y1: dy, x2: target.x, y2: target.y, life: .09 });
          chainFrom(target, p.damage * .28, 1);
        }
      }
      d.fire = p.synergyDrone ? .34 : .52;
    }
  }
}
function nearestEnemy(x, y, maxD=9999, exclude=null) {
  let best = null, bestD = maxD;
  for (const e of state.enemies) {
    if (e === exclude) continue;
    const d = dist(x, y, e.x, e.y);
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
}
function chainFrom(origin, dmg, chains) {
  let current = origin;
  const used = new Set([origin]);
  for (let c = 0; c < chains; c++) {
    const next = nearestEnemy(current.x, current.y, 170, current);
    if (!next || used.has(next)) break;
    used.add(next);
    state.flashes.push({ x1: current.x, y1: current.y, x2: next.x, y2: next.y, life: .08 });
    hitEnemy(next, dmg, false);
    current = next;
  }
}
function hitEnemy(e, dmg, slash) {
  const p = state.run.player;
  const crit = Math.random() < p.critChance;
  const total = dmg * (crit ? (1 + p.critDamage) : 1);
  e.hp -= total;
  e.hit = .08;
  const ang = Math.atan2(e.y - p.y, e.x - p.x);
  e.x += Math.cos(ang) * Math.min(8, total * 0.06);
  e.y += Math.sin(ang) * Math.min(8, total * 0.06);
  if (crit) floatingText(e.x, e.y, 'CRIT', '#ffd36e');
  floatingText(e.x + rand(-8,8), e.y - 10, `${Math.floor(total)}`, '#eef4ff');
  burst(e.x, e.y, e.type === 'boss' ? 14 : 8, e.color);
  state.flashes.push({ x:e.x, y:e.y, radius:e.type === 'boss' ? 26 : 16, life:.09, color:e.color });
  state.freezeTimer = Math.max(state.freezeTimer, e.type === 'boss' ? .02 : .012);
  if (state.run.player.bulletSplash && !slash) {
    for (const n of state.enemies) {
      if (n !== e && dist(e.x, e.y, n.x, n.y) <= state.run.player.bulletSplash) {
        n.hp -= total * 0.18;
        n.hit = .04;
      }
    }
  }
  audio.hit();
  if (e.hp <= 0) {
    const idx = state.enemies.indexOf(e);
    if (idx >= 0) killEnemy(idx, slash);
  }
}
function killEnemy(index, slash) {
  const e = state.enemies[index];
  if (!e) return;
  state.enemies.splice(index,1);
  const r = state.run;
  r.kills += 1;
  if (slash && r.contract?.onSlashKill) r.contract.onSlashKill(r);
  r.score += Math.floor(e.value * 18 * r.combo);
  r.combo = Math.min(5, r.combo + (e.type === 'boss' ? .45 : .16));
  r.comboTimer = 2.4;
  r.maxCombo = Math.max(r.maxCombo, r.combo);
  r.player.pulse = clamp(r.player.pulse + e.value * 1.8 * r.player.pulseGain, 0, 100);
  r.player.slash = clamp(r.player.slash + e.value * (1.4 + (r.player.killSlashBonus || 0)) * r.player.slashGain, 0, 100);
  let comboBonus = r.combo >= 15 ? 0.28 : r.combo >= 10 ? 0.16 : r.combo >= 5 ? 0.08 : 0;
  let credits = Math.max(1, Math.round(e.value * (1 + r.player.creditBoost + comboBonus))); if (e.elite) credits += Math.round((r.player.eliteRewardBonus || 0) * e.value); if (e.type === 'boss') credits += (r.player.bossCreditBurst || 0);
  state.drops.push({ x: e.x, y: e.y, value: credits, vx: rand(-40,40), vy: rand(-40,40), life: 8 });
  floatingText(e.x, e.y, `+${Math.floor(e.value * 18)}`, '#eef4ff');
  burst(e.x, e.y, e.type === 'boss' ? 30 : 18, e.color);
  state.flashes.push({ x:e.x, y:e.y, radius:e.type === 'boss' ? 54 : 26, life:.16, color:e.color });
  audio.kill();
  state.shake = Math.max(state.shake, e.type === 'boss' ? .95 : .22);
  if (slash) state.freezeTimer = Math.max(state.freezeTimer, .025);
  if (e.type === 'splitter') {
    for (let i = 0; i < 2; i++) state.enemies.push({ ...makeEnemy('chaser', e.x + rand(-16,16), e.y + rand(-16,16), Math.max(1, r.wave - 1)), r: 8, hp: 12, maxHp: 12, value: 2, color: '#8cffc0' });
  }
  if (e.type === 'boss') {
    r.bosses += 1;
    els.bossHud.classList.add('hidden');
    toast(`${e.name} shattered`);
    if (r.player.moduleShardChance && Math.random() < r.player.moduleShardChance) acquireModule(randomModuleId('rare'));
    cg.happy();
  }
}
function burst(x, y, count, color) {
  const cap = 260;
  for (let i = 0; i < count && state.particles.length < cap; i++) {
    const a = rand(0, Math.PI * 2), speed = rand(40, 250);
    state.particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: rand(.18, .65), color, s: rand(1.5, 4.5) });
  }
}
function floatingText(x, y, text, color) {
  if (state.texts.length > 40) state.texts.shift();
  state.texts.push({ x, y, text, color, life: .65 });
}
function explode(x, y, radius, dmg, color) {
  state.flashes.push({ x, y, radius, life: .22, color });
  burst(x, y, 22, color);
  for (const e of [...state.enemies]) if (dist(x, y, e.x, e.y) <= radius + e.r) hitEnemy(e, dmg, false);
}
function damagePlayer(amount) {
  const p = state.run.player;
  if (p.iframes > 0 || state.mode !== 'game') return;
  if (p.shieldLeft > 0) {
    p.shieldLeft -= 1;
    p.iframes = .22;
    toast('Shield blocked hit');
    return;
  }
  p.hp -= amount;
  p.iframes = .45;
  state.run.tookDamageWave = true;
  state.run.combo = 1;
  state.run.comboTimer = 0;
  state.shake = Math.max(state.shake, .35);
  state.flashes.push({ x: p.x, y: p.y, radius: 54, life: .18, color: '#ff658d' });
  if (p.hp <= 0) endRun(false);
}
function usePulse() {
  if (state.mode !== 'game' || state.paused) return;
  const p = state.run.player;
  if (p.pulse < 100) return;
  p.pulse = 0;
  state.run.style.pulseUses += 1;
  audio.pulse();
  state.shake = .8;
  const radius = 182;
  if (p.pulseVortex) {
    for (const e of state.enemies) {
      const d = dist(e.x, e.y, p.x, p.y);
      if (d < radius * 1.25 && d > 1) {
        const pull = 1 - d / (radius * 1.25);
        e.x = lerp(e.x, p.x, 0.18 * pull);
        e.y = lerp(e.y, p.y, 0.18 * pull);
      }
    }
    state.freezeTimer = Math.max(state.freezeTimer, .035);
  }
  explode(p.x, p.y, radius, 48 + (p.megaShotEvery ? 8 : 0), '#8ad8ff');
  state.enemyBullets = state.enemyBullets.filter(b => dist(b.x, b.y, p.x, p.y) > radius);
  state.enemies = state.enemies.filter(e => !(e.type === 'mine' && dist(e.x, e.y, p.x, p.y) <= radius));
}
function pointSegDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const l2 = dx * dx + dy * dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = clamp(t, 0, 1);
  const x = x1 + t * dx, y = y1 + t * dy;
  return dist(px, py, x, y);
}
function useSlash() {
  if (state.mode !== 'game' || state.paused) return;
  const p = state.run.player;
  if (p.slashTimer > 0 || p.slash < 100) return;
  const move = getMoveVector();
  const hasMove = Math.abs(move.x) > 0.05 || Math.abs(move.y) > 0.05;
  const a = hasMove ? Math.atan2(move.y, move.x) : Math.atan2((state.pointer.y || (p.y + Math.sin(p.facing))) - p.y, (state.pointer.x || (p.x + Math.cos(p.facing))) - p.x);
  p.facing = a;
  state.run.style.slashUses += 1;
  state.run.style.dashUses += 1;
  const dash = 180;
  const sx = p.x, sy = p.y;
  p.x = clamp(p.x + Math.cos(a) * dash, 20, innerWidth - 20);
  p.y = clamp(p.y + Math.sin(a) * dash, 20, innerHeight - 20);
  p.slash = 0;
  p.slashTimer = p.slashCooldown;
  p.iframes = .22;
  state.slashes.push({ x1: sx, y1: sy, x2: p.x, y2: p.y, life: .18, color: '#ff6fd8' });
  state.shake = .55;
  audio.slash();
  let hits = 0;
  for (const e of [...state.enemies]) {
    const d = pointSegDist(e.x, e.y, sx, sy, p.x, p.y);
    if (d <= e.r + 28) { hits += 1; hitEnemy(e, p.slashDamage, true); }
  }
  if (p.slashNova) explode(p.x, p.y, 82, 22 + p.slashNova * 8, '#ff89e2');
  if (p.temporalShield) state.flashes.push({ x:p.x, y:p.y, radius:96, life:.16, color:'rgba(255,245,185,0.9)' });
  if (hits) state.freezeTimer = Math.max(state.freezeTimer, .05);
}
function updateBullets(dt) {
  const margin = 80;
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i];
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (state.run?.event === 'Magnetic Surge') { const n = nearestEnemy(b.x, b.y, 180); if (n) { const s = Math.hypot(b.vx,b.vy); const aa = Math.atan2(n.y - b.y, n.x - b.x); b.vx = lerp(b.vx, Math.cos(aa) * s, dt * 2.2); b.vy = lerp(b.vy, Math.sin(aa) * s, dt * 2.2); } }
    if (b.x < -margin || b.x > innerWidth + margin || b.y < -margin || b.y > innerHeight + margin) { state.bullets.splice(i,1); continue; }
    for (let j = state.enemies.length - 1; j >= 0; j--) {
      const e = state.enemies[j];
      if (dist(b.x, b.y, e.x, e.y) <= e.r + b.r) {
        hitEnemy(e, b.dmg, false);
        if (b.chain > 0) chainFrom(e, b.dmg * .55, b.chain);
        if (b.pierce > 0) { b.pierce -= 1; b.dmg *= .86; }
        else if (b.ricochet > 0) {
          const next = nearestEnemy(e.x, e.y, 220, e);
          if (next) {
            const a = Math.atan2(next.y - e.y, next.x - e.x);
            b.x = e.x; b.y = e.y; b.vx = Math.cos(a) * 760; b.vy = Math.sin(a) * 760; b.ricochet -= 1; b.dmg *= .82;
          } else { state.bullets.splice(i,1); }
        } else {
          state.bullets.splice(i,1);
        }
        break;
      }
    }
  }
}
function updateEnemyBullets(dt) {
  const margin = 80;
  for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
    const b = state.enemyBullets[i];
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (state.run?.event === 'Magnetic Surge') { const n = nearestEnemy(b.x, b.y, 180); if (n) { const s = Math.hypot(b.vx,b.vy); const aa = Math.atan2(n.y - b.y, n.x - b.x); b.vx = lerp(b.vx, Math.cos(aa) * s, dt * 2.2); b.vy = lerp(b.vy, Math.sin(aa) * s, dt * 2.2); } } b.life -= dt;
    if (b.life <= 0 || b.x < -margin || b.x > innerWidth + margin || b.y < -margin || b.y > innerHeight + margin) { state.enemyBullets.splice(i,1); continue; }
    if (dist(b.x, b.y, state.run.player.x, state.run.player.y) <= state.run.player.r + b.r) {
      damagePlayer(b.dmg);
      state.enemyBullets.splice(i,1);
    }
  }
}
function radialShots(e, count, speed, dmg) {
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count + e.t * .18;
    state.enemyBullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 4.2, r: 5, dmg });
  }
}
function spawnAdds(count) {
  for (let i = 0; i < count; i++) state.enemies.push(makeEnemy(['chaser','charger','sniper','orbiter'][(Math.random()*4)|0], rand(80, innerWidth-80), rand(80, innerHeight/2), state.run.wave));
}
function shootEnemy(e, speed, dmg) {
  const p = state.run.player;
  let tx = p.x, ty = p.y;
  const adapt = state.run?.threatResponse?.type;
  if (adapt === 'dash') {
    const move = getMoveVector();
    tx += move.x * 90;
    ty += move.y * 90;
    speed *= 1.08;
  }
  if (adapt === 'range') speed *= 1.06;
  const a = Math.atan2(ty - e.y, tx - e.x);
  state.enemyBullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 4.2, r: 5, dmg });
}
function updateBoss(e, dt) {
  const p = state.run.player;
  const hpRatio = e.hp / e.maxHp;
  const previousPhase = e.phase;
  e.phase = hpRatio < .34 ? 3 : hpRatio < .67 ? 2 : 1;
  if (e.phase !== previousPhase) {
    state.freezeTimer = .32;
    state.shake = .6;
    banner(`${e.name} • Phase ${e.phase}`);
    showMoment(`${e.name.toUpperCase()}`, `PHASE ${e.phase}`, e.tele || e.color || '#ffe28f');
    state.flashes.push({ x:e.x, y:e.y, radius:e.r + 38, life:.18, color:e.tele || e.color });
  }
  e.t += dt;
  const a = Math.atan2(p.y - e.y, p.x - e.x);

  if (e.finalBoss) {
    e.x = lerp(e.x, innerWidth / 2 + Math.cos(e.t * .45) * 120, dt * .7);
    e.y = lerp(e.y, 150 + Math.sin(e.t * .6) * 60, dt * .7);
    e.shot -= dt;
    if (e.shot < 0.26 && e.shot > 0.18) state.flashes.push({ x: e.x, y: e.y, radius: e.r + 28, life: .12, color: e.tele || 'rgba(255,240,180,0.9)' });
    if (e.shot <= 0) {
      radialShots(e, e.phase === 1 ? 12 : e.phase === 2 ? 18 : 24, e.phase === 3 ? 280 : 220, e.phase === 3 ? 11 : 8);
      if (e.phase >= 2) spawnAdds(2 + e.phase);
      state.flashes.push({ x:e.x, y:e.y, radius:e.r + 48, life:.14, color:'rgba(255,214,107,0.9)' });
      e.shot = e.phase === 3 ? .55 : e.phase === 2 ? .9 : 1.2;
    }
    return;
  }

  if (e.family === 'maw') {
    e.dashTimer -= dt;
    e.x += Math.cos(a) * e.speed * dt * .6;
    e.y += Math.sin(a) * e.speed * dt * .6;
    if (e.dashTimer <= 0) {
      e.vx = Math.cos(a) * (e.phase===3?380:280);
      e.vy = Math.sin(a) * (e.phase===3?380:280);
      e.dashTimer = e.phase===3?.7:1.2;
      state.flashes.push({ x:e.x, y:e.y, radius:e.r + 30, life:.14, color:e.tele || e.color });
      explode(e.x, e.y, 32 + e.phase * 10, 6 + e.phase * 2, 'rgba(255,168,110,0.5)');
    }
  } else {
    e.x = lerp(e.x, innerWidth / 2 + Math.sin(e.t * (.7 + e.phase*.08)) * 220, dt * 1.2);
    e.y = lerp(e.y, 120 + Math.cos(e.t * (1.1 + e.phase*.12)) * 42, dt * 1.1);
  }

  e.x += e.vx * dt; e.y += e.vy * dt; e.vx *= .92; e.vy *= .92;
  e.shot -= dt;
  if (e.shot < 0.2 && e.shot > 0.12) state.flashes.push({ x:e.x, y:e.y, radius:e.r + 20, life:.10, color:e.tele || e.color });

  if (e.shot <= 0) {
    if (e.family === 'rift') {
      radialShots(e, e.phase===3?16:10, e.phase===3?260:210, e.phase===3?8:6);
    } else if (e.family === 'widow') {
      for (let i=-2;i<=2;i+=2) {
        state.flashes.push({ x1:e.x, y1:e.y, x2:e.x + Math.cos(a+i*.08)*220, y2:e.y + Math.sin(a+i*.08)*220, life:.08 });
        state.enemyBullets.push({ x:e.x,y:e.y,vx:Math.cos(a+i*.08)*320,vy:Math.sin(a+i*.08)*320,life:4.2,r:4,dmg:7 });
      }
    } else if (e.family === 'static') {
      radialShots(e, e.phase===3?20:12, 180+e.phase*20, 6+e.phase);
      if (dist(e.x,e.y,p.x,p.y) < 150 + e.phase*10) damagePlayer(3 + e.phase);
    } else if (e.family === 'engine') {
      radialShots(e, 8+e.phase*2, 190+e.phase*25, 7);
      spawnAdds(e.phase);
      state.enemies.push(makeEnemy('mine', e.x + rand(-40,40), e.y + rand(-40,40), state.run.wave));
    } else if (e.family === 'prism') {
      radialShots(e, 6+e.phase*2, 230+e.phase*15, 7+e.phase);
      for (let i=0;i<3+e.phase;i++) {
        const aa = a + (-0.35 + i*0.25);
        state.flashes.push({ x1:e.x, y1:e.y, x2:e.x + Math.cos(aa)*240, y2:e.y + Math.sin(aa)*240, life:.06 });
      }
    } else if (e.family === 'leviathan') {
      spawnAdds(1+e.phase);
      for (let i=-1;i<=1;i++) shootEnemy({x:e.x,y:e.y}, 240+i*25, 8);
      state.flashes.push({ x:e.x, y:e.y, radius:e.r + 42, life:.14, color:e.tele || e.color });
    } else if (e.family === 'seraph') {
      radialShots(e, 10+e.phase*2, 215+e.phase*18, 7+e.phase);
      state.flashes.push({ x:e.x, y:e.y, radius:e.r + 56, life:.12, color:e.tele || e.color });
    } else if (e.family === 'warden') {
      radialShots(e, 10+e.phase*2, 170+e.phase*20, 6+e.phase);
      state.bullets = state.bullets.filter(b => dist(b.x,b.y,e.x,e.y) > 120 + e.phase*10);
    } else if (e.family === 'colossus') {
      radialShots(e, 12+e.phase*2, 210+e.phase*20, 7+e.phase);
      for (let i=0;i<2+e.phase;i++) {
        const mx = rand(80, innerWidth-80), my = rand(80, innerHeight-80);
        state.flashes.push({ x:mx, y:my, radius:34, life:.14, color:'rgba(255,220,175,0.92)' });
        explode(mx, my, 28, 8+e.phase, 'rgba(255,180,130,0.55)');
      }
    } else {
      radialShots(e, 12+e.phase*2, 210+e.phase*20, 7+e.phase);
    }
    e.shot = e.phase === 3 ? .65 : e.phase === 2 ? .9 : 1.2;
    state.shake = Math.max(state.shake,.25);
  }
}
function updateEnemies(dt) {
  const p = state.run.player;
  const r = state.run;
  if (r.enemiesToSpawn > 0) {
    r.spawnTimer -= dt;
    if (r.spawnTimer <= 0) {
      spawnEnemy();
      r.enemiesToSpawn -= 1;
      const base = Math.max(.16, .42 - Math.min(.18, r.wave * .008));
      r.spawnTimer = r.inBossWave ? 99 : base;
    }
  }
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    e.t += dt; e.hit = Math.max(0, e.hit - dt);
    if (e.type === 'boss') { updateBoss(e, dt); continue; }
    const dx = p.x - e.x, dy = p.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    if (e.type === 'chaser' || e.type === 'tank' || e.type === 'splitter') {
      e.x += dx / d * e.speed * dt; e.y += dy / d * e.speed * dt;
    } else if (e.type === 'charger') {
      e.charge -= dt;
      const mult = e.charge <= 0 ? 2.2 : 1;
      if (e.charge <= -.45) e.charge = rand(1.2, 2.2);
      e.x += dx / d * e.speed * mult * dt; e.y += dy / d * e.speed * mult * dt;
    } else if (e.type === 'sniper') {
      if (d > 260) { e.x += dx / d * e.speed * dt; e.y += dy / d * e.speed * dt; }
      else if (d < 180) { e.x -= dx / d * e.speed * dt; e.y -= dy / d * e.speed * dt; }
      e.shot -= dt;
      if (e.shot < 0.22 && e.shot > 0.12) state.flashes.push({ x1:e.x, y1:e.y, x2:p.x, y2:p.y, life:.05 });
      if (e.shot <= 0) { shootEnemy(e, 220 + r.wave * 4, 6 + Math.floor(r.wave * .2)); e.shot = Math.max(.6, 1.35 - r.wave * .03); }
    } else if (e.type === 'orbiter') {
      e.orbit += dt * 1.55;
      const tx = p.x + Math.cos(e.orbit) * 140;
      const ty = p.y + Math.sin(e.orbit) * 140;
      const odx = tx - e.x, ody = ty - e.y, od = Math.hypot(odx, ody) || 1;
      e.x += odx / od * e.speed * dt; e.y += ody / od * e.speed * dt;
    } else if (e.type === 'kamikaze') {
      e.x += dx / d * e.speed * 1.5 * dt; e.y += dy / d * e.speed * 1.5 * dt;
      if (d < 120) state.flashes.push({ x:e.x, y:e.y, radius:e.r + 8, life:.05, color:'rgba(255,94,124,0.7)' });
    } else if (e.type === 'miner') {
      e.x += dx / d * e.speed * dt; e.y += dy / d * e.speed * dt;
      e.mine -= dt;
      if (e.mine <= 0) {
        state.enemies.push(makeEnemy('mine', e.x, e.y, r.wave));
        e.mine = rand(1.6, 2.4);
      }
    } else if (e.type === 'mine') {
      e.fuse -= dt;
      if (e.fuse <= 0) {
        explode(e.x, e.y, 88, 18, '#ffd36e');
        if (dist(e.x, e.y, p.x, p.y) <= 88) damagePlayer(18);
        state.enemies.splice(i, 1);
        continue;
      }
    }
    if (e.type !== 'sniper' && e.type !== 'mine' && dist(e.x, e.y, p.x, p.y) < e.r + p.r) {
      damagePlayer(e.type === 'kamikaze' ? 16 : e.type === 'tank' ? 14 : 10);
      if (e.type === 'kamikaze') {
        explode(e.x, e.y, 70, 20, e.color);
        state.enemies.splice(i, 1);
      }
    }
  }
}
function updateDrops(dt) {
  const p = state.run.player;
  for (let i = state.drops.length - 1; i >= 0; i--) {
    const d = state.drops[i];
    d.vx *= .986; d.vy *= .986;
    d.x += d.vx * dt; d.y += d.vy * dt;
    const dd = dist(d.x, d.y, p.x, p.y);
    if (dd < p.magnet) {
      const a = Math.atan2(p.y - d.y, p.x - d.x);
      d.vx += Math.cos(a) * 280 * dt; d.vy += Math.sin(a) * 280 * dt;
    }
    if (dd < p.r + 8) {
      state.run.credits += d.value;
      state.run.earnedCredits += d.value;
      state.run.score += d.value * 6;
      state.run.player.pulse = clamp(state.run.player.pulse + d.value * 1.2 * p.pulseGain, 0, 100);
      audio.pickup();
      state.drops.splice(i, 1);
    }
  }
}
function updateParticles(dt) {
  const particleCap = qualityParticleCap();
  if (state.particles.length > particleCap) state.particles.splice(0, state.particles.length - particleCap);
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; p.vx *= .985; p.vy *= .985;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
  for (let i = state.texts.length - 1; i >= 0; i--) {
    const t = state.texts[i];
    t.y -= 30 * dt; t.life -= dt;
    if (t.life <= 0) state.texts.splice(i, 1);
  }
  for (let i = state.flashes.length - 1; i >= 0; i--) {
    state.flashes[i].life -= dt;
    if (state.flashes[i].life <= 0) state.flashes.splice(i, 1);
  }
  for (let i = state.slashes.length - 1; i >= 0; i--) {
    state.slashes[i].life -= dt;
    if (state.slashes[i].life <= 0) state.slashes.splice(i, 1);
  }
  if (state.toastTimer > 0) {
    state.toastTimer -= dt;
    if (state.toastTimer <= 0) els.toast.classList.remove('show');
  }
  if (state.bannerTimer > 0) {
    state.bannerTimer -= dt;
    if (state.bannerTimer <= 0) els.waveBanner.classList.add('hidden');
  }
  state.shake = Math.max(0, state.shake - dt * 4);
  if (state.comboFx?.timer > 0) {
    state.comboFx.timer -= dt;
    if (state.comboFx.timer <= 0 && els.comboBurst) {
      els.comboBurst.classList.remove('show');
      els.comboBurst.classList.add('hidden');
    }
  }
  if (state.momentFx?.timer > 0) {
    state.momentFx.timer -= dt;
    if (state.momentFx.timer <= 0 && els.momentOverlay) {
      els.momentOverlay.classList.remove('show');
      els.momentOverlay.classList.add('hidden');
    }
  }
  if (state.cameraFx.timer > 0) state.cameraFx.timer -= dt;
  state.cameraFx.zoom = (state.cameraFx.zoom || 1) + ((state.cameraFx.target || 1) - (state.cameraFx.zoom || 1)) * Math.min(1, dt * 8);
}
function updateCombo(dt) {
  const r = state.run;
  if (r.combo > 1) {
    r.comboTimer -= dt;
    if (r.comboTimer <= 0) r.combo = Math.max(1, r.combo - dt * 0.85);
  }
}
function openUpgradeChoices() {
  state.mode = 'upgrade';
  els.upgradeOverlay.classList.remove('hidden');
  state.paused = true;
  const pool = [...runUpgrades];
  const picks = [];
  while (picks.length < 3 && pool.length) {
    const idx = (Math.random() * pool.length) | 0;
    picks.push(pool.splice(idx,1)[0]);
  }
  els.upgradeChoices.innerHTML = '';
  for (const up of picks) {
    const card = document.createElement('button');
    card.className = 'upgrade-card btn';
    card.innerHTML = `<div class="tag">${up.tag}</div><h3>${up.name}</h3><p>${up.desc}</p>`;
    card.addEventListener('click', () => {
      audio.ui();
      applyRunUpgrade(up);
      els.upgradeOverlay.classList.add('hidden');
      state.mode = 'game';
      state.paused = false;
      startNextWave();
    });
    els.upgradeChoices.appendChild(card);
  }
}
function syncHud() {
  if (!state.run) return;
  const p = state.run.player;
  els.hpText.textContent = `${Math.ceil(p.hp)} / ${Math.ceil(p.maxHp)}`;
  els.hpBar.style.width = `${(p.hp / p.maxHp) * 100}%`;
  els.pulseText.textContent = p.pulse >= 100 ? 'Ready' : `${Math.floor(p.pulse)}%`;
  els.pulseBar.style.width = `${p.pulse}%`;
  els.slashText.textContent = p.slashTimer > 0 ? `${p.slashTimer.toFixed(1)}s` : (p.slash >= 100 ? 'Ready' : `${Math.floor(p.slash)}%`);
  els.slashBar.style.width = `${p.slashTimer > 0 ? ((p.slashCooldown - p.slashTimer) / p.slashCooldown) * 100 : p.slash}%`;
  els.waveText.textContent = state.run.wave;
  els.eventText.textContent = state.run.event;
  els.scoreText.textContent = Math.floor(state.run.score).toLocaleString();
  els.creditsText.textContent = state.run.credits.toLocaleString();
  els.comboText.textContent = state.run.combo >= 3 ? `x${state.run.combo.toFixed(1)} • ${comboLabel(state.run.combo)}` : `x${state.run.combo.toFixed(1)}`;
  els.shieldText.textContent = p.shieldLeft;
  if (els.sectorText) els.sectorText.textContent = `${roman(state.run.sector)} • ${state.run.zoneName || zoneNames[0]}`;
  if (els.archetypeText) els.archetypeText.textContent = state.run.archetype ? (archetypeDefs[state.run.archetype]?.name || 'Awakened') : 'None';
  if (els.contractText) {
    const cp = state.run.contract ? Math.min(state.run.contractData.goal, Math.floor(state.run.contract.progress(state.run))) : 0;
    els.contractText.textContent = state.run.contract ? `${cp}/${state.run.contractData.goal}` : 'Stand by';
  }
  if (els.synergyText) els.synergyText.textContent = state.run.activeSynergies.length ? synergyDefs.filter(s => state.run.activeSynergies.includes(s.id)).map(s => s.name).slice(0,2).join(' • ') : 'None';
  const boss = state.enemies.find(e => e.type === 'boss');
  els.bossHud.classList.toggle('hidden', !boss);
  if (boss) {
    els.bossName.textContent = boss.name;
    els.bossBar.style.width = `${(boss.hp / boss.maxHp) * 100}%`;
  }
}
function update(dt) {
  state.fps.frame += 1; state.fps.time += dt;
  if (state.fps.time >= .5) {
    state.fps.value = Math.round(state.fps.frame / state.fps.time);
    state.fps.frame = 0; state.fps.time = 0;
    if (state.fps.show && els.fpsTag) els.fpsTag.textContent = `FPS ${state.fps.value}`;
    if (state.fps.value < 42 && getSettings().quality === 'high') updateSetting('quality', 'medium');
    if (state.fps.value < 34 && getSettings().quality === 'medium') updateSetting('quality', 'low');
  }
  for (const s of state.stars) { s.y += s.v * dt * (0.15 + s.layer * 0.12); if (s.y > innerHeight + 4) { s.y = -4; s.x = rand(0, innerWidth); } s.tw += dt * (0.8 + s.layer * 0.4); }
  updateParticles(dt);
  if (state.mode !== 'game' || state.paused || !state.run) return;
  if (state.bossIntro > 0) state.bossIntro -= dt;
  if (state.freezeTimer > 0) { state.freezeTimer = Math.max(0, state.freezeTimer - dt); syncHud(); return; }
  const r = state.run, p = r.player;
  p.iframes = Math.max(0, p.iframes - dt);
  p.fireTimer -= dt;
  p.slashTimer = Math.max(0, p.slashTimer - dt);
  p.hp = Math.min(p.maxHp, p.hp + p.regen * dt);
  p.slash = clamp(p.slash + dt * 8.5 * p.slashGain, 0, 100);
  if (p.autoPulse && p.hp < p.maxHp * .35) p.pulse = clamp(p.pulse + dt * 40, 0, 100);
  if (r.event === 'Storm Field' && Math.random() < dt * 0.65) { const ex = rand(60, innerWidth-60), ey = rand(60, innerHeight-60); state.flashes.push({ x: ex, y: ey, radius: 44, life: .18, color: '#fff07a' }); for (const e of state.enemies) if (dist(ex, ey, e.x, e.y) < 44 + e.r) hitEnemy(e, 18 + r.wave * .12, false); if (dist(ex, ey, p.x, p.y) < 50) damagePlayer(8); }

  const m = getMoveVector();
  r.style.time += dt;
  r.runSeconds += dt;
  r.runSeconds += dt;
  const nearest = nearestEnemy(p.x, p.y, 99999);
  if (nearest) {
    const nd = dist(p.x, p.y, nearest.x, nearest.y);
    if (nd < 180) r.style.closeRangeTime += dt;
    if (nd > 320) r.style.longRangeTime += dt;
  }
  const comboFireMul = r.combo >= 10 ? 0.84 : r.combo >= 5 ? 0.92 : 1;
  const comboMoveMul = r.combo >= 20 ? 1.14 : r.combo >= 12 ? 1.08 : 1;
  const moveMul = (r.event === 'Low Gravity' ? 1.14 : 1) * comboMoveMul;
  p.x = clamp(p.x + m.x * p.speed * moveMul * dt, 20, innerWidth - 20);
  p.y = clamp(p.y + m.y * p.speed * moveMul * dt, 20, innerHeight - 20);

  updateDrones(dt);
  if (p.fireTimer <= 0) shootAtNearest(comboFireMul);
  updateBullets(dt);
  updateEnemyBullets(dt);
  updateEnemies(dt);
  updateDrops(dt);
  updatePowerups(dt);
  updateCombo(dt);

  if (!r.enemiesToSpawn && !state.enemies.length && state.mode === 'game') {
    if (!r.tookDamageWave) r.perfectWaves += 1;
    if (r.contract?.onWaveEnd) r.contract.onWaveEnd(r);
    maybeCheckContract();
    if (r.inBossWave) { cg.happy(); if (r.wave >= 1000) endRun(true); else openRelicChoices(); }
    else openUpgradeChoices();
  }
  checkAchievements();
  syncHud();
}
function drawBackground() {
  const sector = state.run?.sector || 1;
  const wave = state.run?.wave || 1;
  const zoneIndex = state.run ? Math.floor((state.run.wave - 1) / 20) % zoneNames.length : 0;
  const sectorCores = [
    ['rgba(32,68,116,0.18)','rgba(10,22,42,0.1)'],
    ['rgba(90,40,116,0.20)','rgba(24,10,42,0.12)'],
    ['rgba(32,116,105,0.18)','rgba(8,30,34,0.12)'],
    ['rgba(116,56,40,0.18)','rgba(36,18,10,0.12)'],
    ['rgba(140,30,50,0.22)','rgba(30,8,12,0.14)']
  ][sector-1];
  const zoneOverlays = [
    'rgba(80,170,255,0.06)',
    'rgba(255,90,120,0.06)',
    'rgba(190,130,255,0.06)',
    'rgba(110,255,210,0.05)',
    'rgba(255,215,110,0.06)'
  ];
  const grd = ctx.createRadialGradient(innerWidth / 2, innerHeight / 2, 120, innerWidth / 2, innerHeight / 2, innerWidth * 0.82);
  grd.addColorStop(0, sectorCores[0]);
  grd.addColorStop(0.45, sectorCores[1]);
  grd.addColorStop(1, 'rgba(5, 10, 18, 0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  const depthAlpha = wave >= 500 ? 0.12 : wave >= 200 ? 0.09 : wave >= 50 ? 0.07 : 0.05;
  ctx.fillStyle = zoneOverlays[zoneIndex].replace(/0\.0\d+\)/, `${depthAlpha})`);
  ctx.fillRect(0,0,innerWidth,innerHeight);
  if (wave >= 50) {
    ctx.strokeStyle = `rgba(255,255,255,${wave >= 500 ? 0.08 : wave >= 200 ? 0.06 : 0.04})`;
    const cracks = wave >= 500 ? 7 : wave >= 200 ? 5 : 3;
    for (let i = 0; i < cracks; i++) {
      const ox = innerWidth * (0.1 + i / (cracks + 1));
      ctx.beginPath();
      ctx.moveTo(ox, 0);
      ctx.bezierCurveTo(ox + 40, innerHeight * 0.22, ox - 30, innerHeight * 0.62, ox + 60, innerHeight);
      ctx.stroke();
    }
  }

  for (const s of state.stars) {
    const a = 0.22 + Math.sin(s.tw) * 0.12 + s.layer * 0.05;
    ctx.fillStyle = `rgba(${s.layer === 3 ? '255,230,180' : '125,235,255'},${Math.max(0.08, a)})`;
    ctx.fillRect(s.x, s.y, s.s + s.layer * 0.2, s.s + s.layer * 0.2);
  }

  const q = getSettings().quality;
  if (q !== 'low') {
    const cell = 46;
    const offset = (performance.now() * 0.018) % cell;
    ctx.strokeStyle = 'rgba(115,242,255,0.055)';
    ctx.lineWidth = 1;
    for (let x = -cell; x < innerWidth + cell; x += cell) { ctx.beginPath(); ctx.moveTo(x + offset, 0); ctx.lineTo(x + offset, innerHeight); ctx.stroke(); }
    for (let y = -cell; y < innerHeight + cell; y += cell) { ctx.beginPath(); ctx.moveTo(0, y + offset); ctx.lineTo(innerWidth, y + offset); ctx.stroke(); }
  }
  if (q === 'high') {
    const rift = ctx.createRadialGradient(innerWidth * 0.72, innerHeight * 0.24, 0, innerWidth * 0.72, innerHeight * 0.24, innerWidth * 0.22);
    rift.addColorStop(0, 'rgba(189,127,255,0.18)');
    rift.addColorStop(0.35, 'rgba(115,240,255,0.08)');
    rift.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rift;
    ctx.fillRect(0,0,innerWidth,innerHeight);
  }

  // zone signatures
  if (zoneIndex === 1) {
    ctx.strokeStyle = 'rgba(255,90,120,0.08)';
    for (let i=0;i<6;i++){ ctx.beginPath(); ctx.moveTo(rand(0,innerWidth),0); ctx.lineTo(rand(0,innerWidth),innerHeight); ctx.stroke(); }
  } else if (zoneIndex === 2) {
    ctx.strokeStyle = 'rgba(210,160,255,0.09)';
    for (let i=0;i<5;i++){ ctx.beginPath(); ctx.arc(innerWidth*(0.2+i*0.15), innerHeight*(0.25+((i%2)*0.22)), 40+i*10+Math.sin(performance.now()*0.001+i)*8, 0, Math.PI*2); ctx.stroke(); }
  } else if (zoneIndex === 3) {
    ctx.strokeStyle = 'rgba(120,255,220,0.08)';
    for (let i=-1; i<=1; i++) {
      ctx.beginPath();
      ctx.moveTo(innerWidth * (0.25 + i * 0.18), 0);
      ctx.bezierCurveTo(innerWidth * (0.34 + i * 0.16), innerHeight * 0.25, innerWidth * (0.18 + i * 0.12), innerHeight * 0.7, innerWidth * (0.36 + i * 0.16), innerHeight);
      ctx.stroke();
    }
  } else if (zoneIndex === 4) {
    ctx.strokeStyle = 'rgba(255,220,120,0.08)';
    for (let i=0;i<4;i++){ ctx.beginPath(); ctx.arc(innerWidth*(0.18+i*0.2), innerHeight*0.7, 90 + i*20 + Math.sin(performance.now()*0.001+i)*10, Math.PI, Math.PI*2); ctx.stroke(); }
  }

  if (state.run?.event === 'Rift Fog') {
    ctx.fillStyle = 'rgba(10,14,20,0.22)';
    ctx.fillRect(0,0,innerWidth,innerHeight);
  }
  if (state.run?.event === 'Magnetic Surge') {
    ctx.strokeStyle = 'rgba(255,211,110,0.08)';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(innerWidth * (0.25 + i * 0.18), 0);
      ctx.bezierCurveTo(innerWidth * (0.34 + i * 0.16), innerHeight * 0.25, innerWidth * (0.18 + i * 0.12), innerHeight * 0.7, innerWidth * (0.36 + i * 0.16), innerHeight);
      ctx.stroke();
    }
  }
}
function drawPlayer() {
  const p = state.run.player;
  const thrustPulse = 0.7 + Math.sin(performance.now() * 0.02) * 0.18;
  const rearAngle = p.facing + Math.PI;
  const rearX = Math.cos(rearAngle), rearY = Math.sin(rearAngle);
  for (let i = 0; i < 4; i++) {
    const len = 18 + thrustPulse * 14 + i * 3;
    const startX = p.x + rearX * 10;
    const startY = p.y + rearY * 10;
    const endX = p.x + rearX * len;
    const endY = p.y + rearY * len;
    ctx.beginPath();
    ctx.strokeStyle = getSettings().shipColor; ctx.globalAlpha = Math.max(0.04, 0.16 - i * 0.03);
    ctx.lineWidth = 10 - i * 2;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.facing + Math.PI / 2);
  ctx.globalAlpha = p.iframes > 0 ? 0.55 + Math.sin(performance.now() * 0.03) * 0.25 : 1;
  ctx.beginPath();
  ctx.fillStyle = '#081224';
  ctx.moveTo(0, -20); ctx.lineTo(14, 14); ctx.lineTo(0, 8); ctx.lineTo(-14, 14); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.strokeStyle = getSettings().shipColor;
  ctx.lineWidth = 2.5;
  ctx.moveTo(0, -17); ctx.lineTo(10, 10); ctx.lineTo(0, 4); ctx.lineTo(-10, 10); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.fillStyle = '#ffffff'; ctx.arc(0, -1, 5.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.fillStyle = getSettings().shipColor + '33'; ctx.arc(0, -1, 13, 0, Math.PI * 2); ctx.fill();
  if (p.shieldLeft > 0) { ctx.beginPath(); ctx.strokeStyle = 'rgba(255,238,180,0.9)'; ctx.lineWidth = 3; ctx.arc(0, 0, p.r + 10 + Math.sin(performance.now()*0.01)*1.5, 0, Math.PI * 2); ctx.stroke(); }
  if (p.slash >= 100 && p.slashTimer <= 0) {
    ctx.beginPath(); ctx.strokeStyle = getSettings().shipColor; ctx.globalAlpha = (0.42 + Math.sin(performance.now()*0.02)*0.2); ctx.lineWidth = 5; ctx.arc(0, 0, p.r + 15, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.strokeStyle = getSettings().shipColor; ctx.lineWidth = 1.5; ctx.arc(0, 0, p.r + 21 + Math.sin(performance.now()*0.012)*2, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  for (const d of state.drones) {
    const x = p.x + Math.cos(d.angle) * 42, y = p.y + Math.sin(d.angle) * 42;
    ctx.beginPath(); ctx.fillStyle = getSettings().shipColor; ctx.globalAlpha = 0.95; ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.strokeStyle = getSettings().shipColor; ctx.globalAlpha = 0.4; ctx.arc(x, y, 9 + Math.sin(performance.now()*0.01 + d.angle)*1.5, 0, Math.PI * 2); ctx.stroke();
  }
}
function drawEnemies() {
  for (const e of state.enemies) {
    ctx.save();
    ctx.translate(e.x, e.y);
    if (e.type === 'orbiter' || e.type === 'boss') ctx.rotate(e.t * 1.2 + e.x * 0.01);
    ctx.fillStyle = e.hit > 0 ? '#ffffff' : e.color;
    ctx.strokeStyle = 'rgba(255,255,255,0.24)';
    ctx.lineWidth = e.type === 'boss' ? 4 : 2;
    if (e.type === 'boss') { if (e.family === 'widow') star(8, e.r, e.r*0.46); else if (e.family === 'maw') roundedPoly(3, e.r+4, 0.18); else if (e.family === 'static') star(6, e.r, e.r*0.42); else if (e.family === 'engine') roundedPoly(6, e.r, 0.08); else if (e.family === 'prism') roundedPoly(3, e.r+2, 0.04); else if (e.family === 'leviathan') roundedPoly(5, e.r, 0.18); else if (e.family === 'seraph') star(5, e.r, e.r*0.55); else if (e.family === 'warden') roundedPoly(7, e.r, 0.05); else if (e.family === 'colossus') roundedPoly(6, e.r+5, 0.12); else if (e.family === 'mothership') roundedPoly(8, e.r, 0.08); else star(6, e.r, e.r * 0.55); }
    else if (e.type === 'tank') roundedPoly(6, e.r, 0.14);
    else if (e.type === 'sniper') star(4, e.r, e.r * 0.45);
    else if (e.type === 'orbiter') roundedPoly(5, e.r, 0.2);
    else if (e.type === 'kamikaze') star(3, e.r, e.r * 0.42);
    else roundedPoly(3, e.r, 0.1);
    ctx.fill(); ctx.stroke();
    if (e.type === 'boss') {
      ctx.beginPath(); ctx.fillStyle = e.core || '#fff'; ctx.arc(0,0, Math.max(6, e.r * 0.22), 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = e.tele || e.color || '#ffe28f'; ctx.globalAlpha = 0.22;
      ctx.lineWidth = 2;
      if (e.family === 'widow' || e.family === 'prism') {
        for (let k=0;k<3;k++){ ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(e.t*1.8 + k*2.1)*(e.r+18), Math.sin(e.t*1.8 + k*2.1)*(e.r+18)); ctx.stroke(); }
      } else if (e.family === 'maw' || e.family === 'leviathan') {
        ctx.beginPath(); ctx.arc(0,0,e.r+18+Math.sin(e.t*3)*3,0,Math.PI*2); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(0,0,e.r+14+Math.sin(e.t*4)*2,0,Math.PI*2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    if (e.elite) { ctx.beginPath(); ctx.strokeStyle = 'rgba(255,240,150,0.9)'; ctx.lineWidth = 2; ctx.arc(0,0, e.r + 6 + Math.sin((e.t||0)*6) * 2, 0, Math.PI * 2); ctx.stroke(); }
    if (e.type === 'mine') {
      ctx.beginPath(); ctx.strokeStyle = 'rgba(255,214,107,0.32)'; ctx.lineWidth = 4; ctx.arc(0,0, e.r + 6 + Math.sin(e.fuse * 8)*2, 0, Math.PI*2); ctx.stroke();
    }
    if (e.hp < e.maxHp && e.type !== 'mine') {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(-e.r, e.r + 8, e.r * 2, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-e.r, e.r + 8, (e.hp / e.maxHp) * e.r * 2, 4);
    }
    ctx.restore();
  }
}
function roundedPoly(points, radius, wobble) {
  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const a = (Math.PI * 2 * i) / points - Math.PI / 2;
    const r = radius * (1 + Math.sin(i * 3.7 + performance.now()*0.0015) * wobble);
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
function star(points, outer, inner) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
function drawBullets() {
  for (const b of state.bullets) {
    ctx.beginPath();
    ctx.strokeStyle = getSettings().bulletColor; ctx.globalAlpha = b.mega ? 0.42 : 0.26;
    ctx.lineWidth = b.mega ? 5 : 3;
    ctx.moveTo(b.x - b.vx * 0.024, b.y - b.vy * 0.024);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.beginPath(); ctx.globalAlpha = 0.14; ctx.fillStyle = b.mega ? '#fff0a8' : getSettings().bulletColor; ctx.arc(b.x, b.y, b.r * 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.fillStyle = b.mega ? '#fff0a8' : getSettings().bulletColor; ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    if (b.mega) { ctx.beginPath(); ctx.strokeStyle = 'rgba(255,240,168,0.35)'; ctx.lineWidth = 2; ctx.arc(b.x,b.y,b.r+5,0,Math.PI*2); ctx.stroke(); }
  }
  for (const b of state.enemyBullets) {
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,217,170,0.22)';
    ctx.lineWidth = 3;
    ctx.moveTo(b.x - b.vx * 0.02, b.y - b.vy * 0.02);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.beginPath(); ctx.fillStyle = '#ffd9aa'; ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
  }
}
function drawDrops() {
  for (const d of state.drops) {
    ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(performance.now()*0.006 + d.x * 0.02); ctx.fillStyle = '#ffd66b'; star(4, 6, 3); ctx.fill(); ctx.restore();
  }
  for (const pu of state.powerups) {
    ctx.save();
    ctx.translate(pu.x, pu.y);
    ctx.rotate(performance.now()*0.003);
    ctx.beginPath(); ctx.fillStyle = pu.def.color; ctx.arc(0,0,8,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.arc(0,0,14 + Math.sin(performance.now()*0.01 + pu.x)*1.6,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#081224'; ctx.font = '900 10px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(pu.def.name[0], 0, 0);
    ctx.restore();
  }
}
function drawParticles() {
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life * 1.4);
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
    ctx.fill();
    if (p.s > 2.5) {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.arc(p.x, p.y, p.s * 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  for (const t of state.texts) { ctx.globalAlpha = Math.max(0, t.life * 1.4); ctx.fillStyle = t.color; ctx.font = '800 16px Inter, sans-serif'; ctx.fillText(String(t.text), t.x, t.y); ctx.globalAlpha = 1; }
  for (const f of state.flashes) {
    if ('x1' in f) {
      ctx.globalAlpha = f.life * 8;
      ctx.strokeStyle = '#9ecbff'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke(); ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = f.life * 3.2; ctx.strokeStyle = f.color; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(f.x, f.y, (f.radius || 54) * (1 - f.life), 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = f.life * 1.6; ctx.fillStyle = f.color.startsWith('rgba') ? f.color.replace(/,[^)]+\)$/, ',0.08)') : f.color; ctx.beginPath(); ctx.arc(f.x, f.y, (f.radius || 54) * (0.35 + (1 - f.life) * 0.45), 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    }
  }
  for (const fx of state.slashes) {
    const alpha = fx.life / .18;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(226,197,255,${alpha * .95})`; ctx.lineWidth = 34 * alpha; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(fx.x1, fx.y1); ctx.lineTo(fx.x2, fx.y2); ctx.stroke();
    ctx.strokeStyle = `rgba(115,242,255,${alpha * .55})`; ctx.lineWidth = 12 * alpha; ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${alpha * .3})`; ctx.lineWidth = 2 * alpha; ctx.stroke();
    ctx.restore();
  }
}
function drawBossArenaFX() {
  const boss = state.enemies.find(e => e.type === 'boss');
  if (!boss || !state.run) return;
  ctx.save();
  const pulse = 0.5 + Math.sin(performance.now() * 0.006) * 0.5;
  ctx.globalAlpha = 0.08 + pulse * 0.05;
  const ring = ctx.createRadialGradient(boss.x, boss.y, boss.r * 0.5, boss.x, boss.y, boss.r * 3.6);
  ring.addColorStop(0, boss.tele || boss.color || 'rgba(255,255,255,0.18)');
  ring.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, boss.r * 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = boss.tele || boss.color || '#ffe28f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, boss.r * (2.1 + pulse * 0.14), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
function drawComboOverlay() {
  if (!state.run || state.run.combo < 3) return;
  const combo = state.run.combo;
  const label = comboLabel(combo);
  const alpha = Math.min(1, 0.18 + (combo / 20) * 0.55);
  const scale = 1 + Math.min(0.45, combo / 40);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.translate(innerWidth * 0.5, innerHeight * 0.14);
  const jitter = label ? (state.comboFx?.amp || 0) * 2.8 : 0;
  ctx.translate((Math.random() - 0.5) * jitter, (Math.random() - 0.5) * jitter);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha * 0.25;
  ctx.fillStyle = '#73f0ff';
  ctx.font = '1000 48px Inter, sans-serif';
  ctx.fillText(`x${combo.toFixed(1)}`, 0, 0);
  if (label) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = '1000 30px Inter, sans-serif';
    ctx.fillText(`x${combo.toFixed(1)}`, 0, 0);
    ctx.fillStyle = '#ffe6a6';
    ctx.font = '900 14px Inter, sans-serif';
    ctx.fillText(label, 0, 22);
  }
  ctx.restore();
}
function render() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  drawBackground();
  if (state.mode === 'game' || state.mode === 'gameover' || state.mode === 'upgrade' || state.mode === 'relic') {
    ctx.save();
    const shakeMul = getSettings().shake ? 1 : 0;
    const sx = state.shake ? rand(-state.shake*24*shakeMul, state.shake*24*shakeMul) : 0;
    const sy = state.shake ? rand(-state.shake*24*shakeMul, state.shake*24*shakeMul) : 0;
    ctx.translate(innerWidth/2, innerHeight/2);
    ctx.scale(state.cameraFx.zoom || 1, state.cameraFx.zoom || 1);
    ctx.translate(-innerWidth/2 + sx, -innerHeight/2 + sy);
    drawBossArenaFX(); drawDrops(); drawBullets(); drawEnemies(); if (state.run) drawPlayer(); drawParticles();
    ctx.restore();
    drawComboOverlay();
    if (state.run?.player) {
      const hpRatio = state.run.player.hp / state.run.player.maxHp;
      if (hpRatio < 0.32) {
        const danger = 1 - hpRatio / 0.32;
        const vignette = ctx.createRadialGradient(innerWidth / 2, innerHeight / 2, innerHeight * 0.16, innerWidth / 2, innerHeight / 2, innerWidth * 0.66);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, `rgba(255,30,70,${0.12 + danger * 0.2})`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0,0,innerWidth,innerHeight);
      }
    }
    if (state.bossIntro > 0 && state.run?.inBossWave) {
      const a = Math.min(1, state.bossIntro / 1.25);
      const bossData = state.run.wave === 1000 ? MOTHERSHIP : (bossDefs.find(b => b.name === state.run.currentBossName) || null);
      const bossName = bossData?.name || state.run.currentBossName || 'Boss';
      const bossTitle = bossData?.title || '';
      const bossIntro = bossData?.intro || (state.run.wave === 1000 ? 'The signal ends here.' : 'Break the pattern. Stay aggressive.');
      ctx.save();
      ctx.fillStyle = `rgba(4,7,14,${0.45 * a})`; ctx.fillRect(0,0,innerWidth,innerHeight);
      ctx.textAlign = 'center'; ctx.font = '800 18px Inter, sans-serif'; ctx.fillStyle = `rgba(255,214,107,${a})`;
      ctx.fillText(state.run.wave === 1000 ? 'FINAL CONTACT' : 'BOSS CONTACT', innerWidth / 2, innerHeight * 0.31);
      ctx.font = '900 46px Inter, sans-serif'; ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fillText(bossName, innerWidth / 2, innerHeight * 0.39);
      ctx.font = '700 16px Inter, sans-serif'; ctx.fillStyle = `rgba(255,230,180,${a})`;
      ctx.fillText(bossTitle, innerWidth / 2, innerHeight * 0.435);
      ctx.font = '600 18px Inter, sans-serif'; ctx.fillStyle = `rgba(180,195,220,${a})`;
      ctx.fillText(bossIntro, innerWidth / 2, innerHeight * 0.475);
      ctx.restore();
    }
  }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

function pauseGame(force) {
  if (state.mode !== 'game') return;
  state.paused = force ?? !state.paused;
  els.pauseOverlay.classList.toggle('hidden', !state.paused);
}
window.addEventListener('keydown', (e) => {
  state.keys[e.code] = true;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  if (e.code === 'Space') usePulse();
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') useSlash();
  if (e.code === 'KeyP' || e.code === 'Escape') pauseGame();
  if (e.code === 'F3') {
    e.preventDefault();
    state.fps.show = !state.fps.show;
    els.fpsTag?.classList.toggle('hidden', !state.fps.show);
  }
});
window.addEventListener('keyup', (e) => { state.keys[e.code] = false; });
window.addEventListener('mousemove', (e) => { state.pointer.x = e.clientX; state.pointer.y = e.clientY; });
window.addEventListener('blur', () => { if (state.mode === 'game') pauseGame(true); Object.keys(state.keys).forEach(k => state.keys[k] = false); });
document.addEventListener('visibilitychange', () => { if (document.hidden && state.mode === 'game') pauseGame(true); });
function setStick(clientX, clientY) {
  const rect = els.touchPad.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let dx = clientX - cx, dy = clientY - cy;
  const len = Math.hypot(dx, dy), max = rect.width * .24;
  if (len > max) { dx = dx / len * max; dy = dy / len * max; }
  els.touchStick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  state.touch.x = dx / max; state.touch.y = dy / max; state.touch.active = true;
}
function resetStick() {
  state.touch.active = false; state.touch.x = 0; state.touch.y = 0; state.touch.id = null;
  els.touchStick.style.transform = 'translate(-50%, -50%)';
}
els.touchPad?.addEventListener('pointerdown', (e) => { state.touch.id = e.pointerId; els.touchPad.setPointerCapture(e.pointerId); setStick(e.clientX, e.clientY); });
els.touchPad?.addEventListener('pointermove', (e) => { if (state.touch.id === e.pointerId) setStick(e.clientX, e.clientY); });
els.touchPad?.addEventListener('pointerup', resetStick);
els.touchPad?.addEventListener('pointercancel', resetStick);
els.pulseBtn?.addEventListener('click', usePulse);
els.slashBtn?.addEventListener('click', useSlash);
els.continueAdBtn?.addEventListener('click', () => {
  audio.ui();
  if (!offerContinueVisible()) return;
  const started = cg.rewarded(() => reviveFromAd());
  if (!started) reviveFromAd();
});
els.doubleRewardBtn?.addEventListener('click', () => {
  audio.ui();
  if (!offerDoubleRewardVisible()) return;
  const started = cg.rewarded(() => doubleRunRewardsFromAd());
  if (!started) doubleRunRewardsFromAd();
});

els.startBtn?.addEventListener('click', () => { audio.ensure(); audio.ui(); startRun(); });
els.retryBtn?.addEventListener('click', () => { audio.ui(); startRun(); });
els.menuBtn?.addEventListener('click', () => { audio.ui(); showMenu(); });
els.pauseMenuBtn?.addEventListener('click', () => { audio.ui(); showMenu(); });
els.resumeBtn?.addEventListener('click', () => { audio.ui(); pauseGame(false); });
els.howBtn?.addEventListener('click', () => { audio.ui(); els.howPanel?.classList.remove('hidden'); });
els.closeHow?.addEventListener('click', () => { audio.ui(); els.howPanel?.classList.add('hidden'); });
els.tabMeta?.addEventListener('click', () => { audio.ui(); setHomeTab('upgrades'); });
els.tabAchievements?.addEventListener('click', () => { audio.ui(); setHomeTab('milestones'); });
els.tabCards?.addEventListener('click', () => { audio.ui(); setHomeTab('cards'); });
els.tabSettings?.addEventListener('click', () => { audio.ui(); setHomeTab('settings'); });

els.qualitySetting?.addEventListener('change', (e) => { updateSetting('quality', e.target.value); resize(); });
els.shakeToggle?.addEventListener('change', (e) => { updateSetting('shake', !!e.target.checked); });
els.masterVolume?.addEventListener('input', (e) => { updateSetting('masterVolume', parseFloat(e.target.value)); });
els.musicVolume?.addEventListener('input', (e) => { updateSetting('musicVolume', parseFloat(e.target.value)); });
els.sfxVolume?.addEventListener('input', (e) => { updateSetting('sfxVolume', parseFloat(e.target.value)); });
els.hudColor?.addEventListener('input', (e) => { updateSetting('hudColor', e.target.value); });
els.shipColor?.addEventListener('input', (e) => { updateSetting('shipColor', e.target.value); });
els.bulletColor?.addEventListener('input', (e) => { updateSetting('bulletColor', e.target.value); });
els.exportSaveBtn?.addEventListener('click', () => { audio.ui(); exportSaveData(); });
els.importSaveBtn?.addEventListener('click', () => { audio.ui(); importSaveData(); });
els.resetSaveBtn?.addEventListener('click', () => { audio.ui(); resetSaveData(); });
els.closeModuleModal?.addEventListener('click', () => { audio.ui(); closeModuleModal(); });
els.moduleModal?.addEventListener('click', (e) => { if (e.target === els.moduleModal) closeModuleModal(); });

(async function boot() {
  resize();
  await cg.init();
  state.save = loadSave();
  refreshMetaUi();
  applySettings();
  syncSettingsUi();
  updateAdButtons();
  setHomeTab('upgrades');
  setupParallaxCard(els.moduleModalCard);
  showMenu();
  requestAnimationFrame(loop);
})();
})();