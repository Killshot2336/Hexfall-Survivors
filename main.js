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
  bossHud: document.getElementById('bossHud'),
  bossBar: document.getElementById('bossBar'),
  bossName: document.getElementById('bossName'),
  menu: document.getElementById('menu'),
  startBtn: document.getElementById('startBtn'),
  howBtn: document.getElementById('howBtn'),
  howPanel: document.getElementById('howPanel'),
  closeHow: document.getElementById('closeHow'),
  pauseOverlay: document.getElementById('pauseOverlay'),
  upgradeOverlay: document.getElementById('upgradeOverlay'),
  upgradeChoices: document.getElementById('upgradeChoices'),
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
  gameOverTitle: document.getElementById('gameOverTitle'),
  runSummary: document.getElementById('runSummary'),
  touchControls: document.getElementById('touchControls'),
  touchPad: document.getElementById('touchPad'),
  touchStick: document.getElementById('touchStick'),
  slashBtn: document.getElementById('slashBtn'),
  pulseBtn: document.getElementById('pulseBtn'),
};

const SAVE_KEY = 'voidline-rift-reaper-save-v1';
const LEGACY_KEYS = ['voidline-rift-reaper-brand-final-v1','voidline-rift-reaper-save-v1','neon-drift-protocol-save-v3','hexfall-survivors-save-v1'];

const metaDefs = [
  { id: 'hull', name: 'Core Hull', desc: '+12 max hull per rank.', base: 12, max: 5 },
  { id: 'cannon', name: 'Focus Lens', desc: '+8% base damage per rank.', base: 14, max: 5 },
  { id: 'drive', name: 'Gyro Drive', desc: '+6% move speed per rank.', base: 12, max: 5 },
  { id: 'pulse', name: 'Pulse Coil', desc: '+10% pulse gain per rank.', base: 14, max: 5 },
  { id: 'salvage', name: 'Salvage Cache', desc: '+2 starting credits per rank.', base: 8, max: 8 },
  { id: 'slash', name: 'Rift Chamber', desc: '+10% slash damage per rank.', base: 16, max: 5 },
];

const achieveDefs = [
  { id: 'first_blood', name: 'First Blood', desc: 'Destroy 1 enemy in a run.', check: r => r.kills >= 1 },
  { id: 'boss_contact', name: 'Boss Contact', desc: 'Reach the first boss wave.', check: r => r.wave >= 4 },
  { id: 'deep_run', name: 'Deep Run', desc: 'Reach wave 8.', check: r => r.wave >= 8 },
  { id: 'boss_breaker', name: 'Boss Breaker', desc: 'Defeat 3 bosses across runs.', check: (r,s) => s.totalBosses >= 3 },
  { id: 'flow_state', name: 'Flow State', desc: 'Reach a x3.0 combo.', check: r => r.maxCombo >= 3 },
  { id: 'rift_lord', name: 'Rift Lord', desc: 'Reach wave 12.', check: r => r.wave >= 12 },
];

const runUpgrades = [
  { id: 'damage', name: 'Overclock', tag: 'Offense', desc: '+22% cannon damage.', apply: p => p.damage *= 1.22 },
  { id: 'fire', name: 'Rapid Relay', tag: 'Offense', desc: '+16% fire rate.', apply: p => p.fireDelay *= 0.84 },
  { id: 'speed', name: 'Impulse Drive', tag: 'Mobility', desc: '+12% move speed.', apply: p => p.speed *= 1.12 },
  { id: 'pierce', name: 'Phase Rounds', tag: 'Control', desc: '+1 projectile pierce.', apply: p => p.pierce += 1 },
  { id: 'spread', name: 'Prism Split', tag: 'Offense', desc: 'Adds side shots.', apply: p => p.multiShot = Math.min(2, p.multiShot + 1) },
  { id: 'magnet', name: 'Magnet Sweep', tag: 'Utility', desc: 'Pull credits from farther away.', apply: p => p.magnet += 30 },
  { id: 'regen', name: 'Nano Repair', tag: 'Defense', desc: 'Regenerate 0.8 hull per second.', apply: p => p.regen += 0.8 },
  { id: 'pulse', name: 'Capacitor Banks', tag: 'Burst', desc: '+20% pulse gain.', apply: p => p.pulseGain *= 1.2 },
  { id: 'slashDmg', name: 'Rift Edge', tag: 'Slash', desc: '+35% Rift Slash damage.', apply: p => p.slashDamage *= 1.35 },
  { id: 'slashCd', name: 'Snap Release', tag: 'Slash', desc: '-18% Rift Slash cooldown.', apply: p => p.slashCooldown *= 0.82 },
  { id: 'credit', name: 'Golden Fracture', tag: 'Economy', desc: '+25% credit drops.', apply: p => p.creditBoost += .25 },
  { id: 'shield', name: 'Mirror Skin', tag: 'Defense', desc: 'Gain a 1-hit shield each wave.', apply: p => p.waveShield += 1 },
  { id: 'ricochet', name: 'Ricochet Core', tag: 'Control', desc: 'Shots bounce to another enemy.', apply: p => p.ricochet += 1 },
  { id: 'chain', name: 'Arc Coil', tag: 'Burst', desc: 'Shots chain lightning on hit.', apply: p => p.chain += 1 },
  { id: 'drone', name: 'Halo Drone', tag: 'Utility', desc: 'Adds an orbit drone.', apply: p => p.droneCount = Math.min(3, p.droneCount + 1) },
  { id: 'nova', name: 'Aftershock', tag: 'Slash', desc: 'Rift Slash releases a close-range nova.', apply: p => p.slashNova += 1 },
];

const state = {
  mode: 'menu',
  paused: false,
  mobile: matchMedia('(pointer: coarse)').matches,
  width: 0,
  height: 0,
  keys: {},
  pointer: { x: 0, y: 0 },
  touch: { active: false, baseX: 0, baseY: 0, x: 0, y: 0, id: null },
  particles: [], flashes: [], bullets: [], enemyBullets: [], enemies: [], drops: [], drones: [], slashes: [], texts: [],
  stars: [],
  shake: 0,
  bannerTimer: 0,
  toastTimer: 0,
  save: loadSave(),
  run: null,
  last: performance.now(),
};

const audio = {
  ctx: null, master: null,
  ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.08;
    this.master.connect(this.ctx.destination);
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
    gain.gain.exponentialRampToValueAtTime(vol, t + .01);
    gain.gain.exponentialRampToValueAtTime(.0001, t + dur);
    osc.connect(gain); gain.connect(this.master);
    osc.start(t); osc.stop(t + dur + .02);
  },
  noise(d=.07, vol=.12) {
    if (!this.ctx) return;
    const len = Math.floor(this.ctx.sampleRate * d);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const ch = buffer.getChannelData(0);
    for (let i=0;i<len;i++) ch[i] = (Math.random()*2-1) * (1 - i/len);
    const src = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    gain.gain.value = vol;
    src.buffer = buffer;
    src.connect(gain); gain.connect(this.master); src.start();
  },
  ui(){ this.tone(600,.07,'triangle',.12,90); },
  shot(){ this.tone(780,.05,'triangle',.11,-200); },
  hit(){ this.tone(180,.08,'sawtooth',.09,-90); },
  kill(){ this.tone(220,.09,'square',.11,240); },
  pickup(){ this.tone(900,.05,'triangle',.08,120); },
  pulse(){ this.noise(.12,.18); this.tone(120,.22,'sawtooth',.12,780); },
  slash(){ this.noise(.08,.16); this.tone(420,.1,'triangle',.14,-150); },
  boss(){ this.tone(140,.2,'square',.12,10); },
};

const cg = {
  async init() {
    try {
      if (window.CrazyGames?.SDK?.init) await window.CrazyGames.SDK.init();
    } catch {}
  },
  gameplayStart(){ try { window.CrazyGames?.SDK?.game?.gameplayStart?.(); } catch {} },
  gameplayStop(){ try { window.CrazyGames?.SDK?.game?.gameplayStop?.(); } catch {} },
  happy(){ try { window.CrazyGames?.SDK?.game?.happytime?.(); } catch {} },
};

function rand(min, max) { return Math.random() * (max - min) + min; }
function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
function lerp(a, b, t) { return a + (b - a) * t; }

function loadSave() {
  let found = null;
  for (const key of [SAVE_KEY, ...LEGACY_KEYS]) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) { found = JSON.parse(raw); break; }
    } catch {}
  }
  return {
    credits: found?.credits || 0,
    bestScore: found?.bestScore || 0,
    bestWave: found?.bestWave || 0,
    totalBosses: found?.totalBosses || 0,
    achievements: found?.achievements || {},
    meta: found?.meta || {},
  };
}
function persist() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state.save));
}

function resize() {
  state.width = canvas.width = innerWidth * devicePixelRatio;
  state.height = canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  if (!state.stars.length) {
    for (let i = 0; i < 140; i++) state.stars.push({ x: rand(0, innerWidth), y: rand(0, innerHeight), s: rand(.5, 2.2), v: rand(6, 18) });
  }
}

function makePlayer() {
  const m = state.save.meta;
  return {
    x: innerWidth / 2,
    y: innerHeight / 2,
    r: 15,
    speed: 260 * (1 + (m.drive || 0) * .06),
    maxHp: 100 + (m.hull || 0) * 12,
    hp: 100 + (m.hull || 0) * 12,
    damage: 16 * (1 + (m.cannon || 0) * .08),
    fireDelay: .18,
    fireTimer: 0,
    pierce: 0,
    multiShot: 0,
    pulse: 0,
    pulseGain: 1 * (1 + (m.pulse || 0) * .10),
    slashCharge: 1,
    slashCooldown: 3.2,
    slashTimer: 0,
    slashDamage: 70 * (1 + (m.slash || 0) * .10),
    slashNova: 0,
    magnet: 78,
    critChance: 0.08,
    critDamage: 0.5,
    regen: 0,
    creditBoost: 0,
    waveShield: 0,
    shieldLeft: 0,
    ricochet: 0,
    chain: 0,
    droneCount: 0,
    iframes: 0,
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
  els.hud.classList.remove('hidden');
  if (state.mobile) els.touchControls.classList.remove('hidden');

  state.run = {
    player: makePlayer(),
    wave: 0,
    score: 0,
    credits: state.save.credits + ((state.save.meta.salvage || 0) * 2),
    earnedCredits: 0,
    kills: 0,
    bosses: 0,
    maxCombo: 1,
    combo: 1,
    comboTimer: 0,
    perfectWaves: 0,
    tookDamageWave: false,
    event: 'Swarm',
    enemiesToSpawn: 0,
    spawnTimer: 0,
    waveCooldown: 0,
    inBossWave: false,
  };
  state.bullets = []; state.enemyBullets = []; state.enemies = []; state.drops = []; state.particles = []; state.flashes = []; state.slashes = []; state.texts = []; state.drones = [];
  startNextWave();
  syncHud();
}

function showMenu() {
  cg.gameplayStop();
  state.mode = 'menu';
  state.run = null;
  els.menu.classList.remove('hidden');
  els.hud.classList.add('hidden');
  els.bossHud.classList.add('hidden');
  els.pauseOverlay.classList.add('hidden');
  els.gameOverOverlay.classList.add('hidden');
  els.upgradeOverlay.classList.add('hidden');
  els.touchControls.classList.add('hidden');
  refreshMetaUi();
}

function endRun() {
  const r = state.run;
  if (!r) return;
  cg.gameplayStop();
  state.mode = 'gameover';
  state.save.credits += r.earnedCredits;
  state.save.bestScore = Math.max(state.save.bestScore, Math.floor(r.score));
  state.save.bestWave = Math.max(state.save.bestWave, r.wave);
  state.save.totalBosses += r.bosses;
  for (const a of achieveDefs) {
    if (!state.save.achievements[a.id] && a.check(r, state.save)) state.save.achievements[a.id] = true;
  }
  persist();
  refreshMetaUi();
  els.finalScore.textContent = Math.floor(r.score).toLocaleString();
  els.finalWave.textContent = r.wave;
  els.finalCredits.textContent = r.earnedCredits;
  els.finalCombo.textContent = `x${r.maxCombo.toFixed(1)}`;
  els.gameOverTitle.textContent = r.wave >= 12 ? 'Protocol Complete' : 'Rift Collapse';
  els.runSummary.innerHTML = `
    <div>Enemies defeated: <strong>${r.kills}</strong></div>
    <div>Bosses defeated: <strong>${r.bosses}</strong></div>
    <div>Perfect waves: <strong>${r.perfectWaves}</strong></div>
    <div>Combat rating: <strong>${combatRating(r)}</strong></div>
  `;
  els.gameOverOverlay.classList.remove('hidden');
  els.bossHud.classList.add('hidden');
  els.hud.classList.add('hidden');
  els.touchControls.classList.add('hidden');
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
  r.tookDamageWave = false;
  r.player.shieldLeft = r.player.waveShield;
  r.inBossWave = r.wave % 4 === 0;
  r.event = r.inBossWave ? 'Boss' : pick(['Swarm','Crossfire','Bulwark','Riftstorm']);
  r.enemiesToSpawn = r.inBossWave ? 1 : 8 + r.wave * 2 + (r.event === 'Swarm' ? 6 : 0);
  r.spawnTimer = .4;
  r.waveCooldown = 0;
  banner(`${r.inBossWave ? 'Boss Wave' : 'Wave ' + r.wave} • ${r.event}`);
  if (r.inBossWave) audio.boss(); else audio.ui();
  syncHud();
}

function banner(text) {
  els.waveBanner.textContent = text;
  els.waveBanner.classList.remove('hidden');
  state.bannerTimer = 1.6;
}
function toast(text) {
  els.toast.textContent = text;
  els.toast.classList.add('show');
  state.toastTimer = 1.5;
}

function spawnEnemy() {
  const r = state.run;
  const side = (Math.random() * 4) | 0;
  let x, y;
  if (side === 0) { x = rand(-80, innerWidth + 80); y = -40; }
  else if (side === 1) { x = innerWidth + 40; y = rand(-80, innerHeight + 80); }
  else if (side === 2) { x = rand(-80, innerWidth + 80); y = innerHeight + 40; }
  else { x = -40; y = rand(-80, innerHeight + 80); }

  if (r.inBossWave) {
    const bossType = ['Rift Sovereign','Null Warden','Eclipse Seraph'][(r.wave / 4 - 1) % 3 | 0];
    const boss = makeBoss(bossType);
    boss.x = innerWidth / 2; boss.y = 120;
    state.enemies.push(boss);
    els.bossName.textContent = boss.name;
    els.bossHud.classList.remove('hidden');
    toast(`${boss.name} entered the arena`);
    return;
  }

  const wave = r.wave;
  const pool = ['chaser','charger','sniper'];
  if (wave >= 3) pool.push('orbiter');
  if (wave >= 5) pool.push('splitter');
  if (wave >= 6) pool.push('kamikaze');
  if (wave >= 7) pool.push('miner');
  if (wave >= 8) pool.push('tank');
  if (r.event === 'Crossfire') pool.push('sniper','sniper');
  if (r.event === 'Bulwark') pool.push('tank','tank');
  if (r.event === 'Riftstorm') pool.push('orbiter','splitter');
  state.enemies.push(makeEnemy(pick(pool), x, y, wave));
}

function makeEnemy(type, x, y, wave) {
  const base = 1 + wave * 0.12;
  const enemy = { type, x, y, vx: 0, vy: 0, t: 0, shot: rand(.6, 1.6), hit: 0, mine: 1.4 };
  if (type === 'chaser') return { ...enemy, hp: 28 * base, maxHp: 28 * base, speed: 80 + wave * 6, r: 12, value: 4, color: '#79f4ff' };
  if (type === 'charger') return { ...enemy, hp: 22 * base, maxHp: 22 * base, speed: 110 + wave * 8, r: 10, value: 5, color: '#ffb365', charge: 0 };
  if (type === 'sniper') return { ...enemy, hp: 24 * base, maxHp: 24 * base, speed: 52 + wave * 3, r: 11, value: 6, color: '#ff78d2' };
  if (type === 'orbiter') return { ...enemy, hp: 30 * base, maxHp: 30 * base, speed: 76 + wave * 5, r: 12, value: 6, color: '#a98aff', orbit: rand(0, Math.PI * 2) };
  if (type === 'splitter') return { ...enemy, hp: 34 * base, maxHp: 34 * base, speed: 70 + wave * 5, r: 14, value: 7, color: '#82ffb8', split: true };
  if (type === 'kamikaze') return { ...enemy, hp: 20 * base, maxHp: 20 * base, speed: 130 + wave * 8, r: 10, value: 5, color: '#ff5e7c' };
  if (type === 'miner') return { ...enemy, hp: 40 * base, maxHp: 40 * base, speed: 60 + wave * 4, r: 14, value: 7, color: '#ffd770' };
  return { ...enemy, hp: 62 * base, maxHp: 62 * base, speed: 48 + wave * 4, r: 18, value: 8, color: '#9fc0ff' };
}

function makeBoss(name) {
  const r = state.run.wave;
  return {
    type: 'boss', name,
    x: innerWidth / 2, y: 120, vx: 0, vy: 0,
    hp: 420 + r * 90, maxHp: 420 + r * 90,
    speed: 70 + r * 2,
    r: 40,
    value: 60,
    phase: 1,
    shot: .9,
    t: 0,
    color: name === 'Rift Sovereign' ? '#ff72cb' : name === 'Null Warden' ? '#ffd36e' : '#8dc7ff',
  };
}

function update(dt) {
  if (state.bannerTimer > 0) {
    state.bannerTimer -= dt;
    if (state.bannerTimer <= 0) els.waveBanner.classList.add('hidden');
  }
  if (state.toastTimer > 0) {
    state.toastTimer -= dt;
    if (state.toastTimer <= 0) els.toast.classList.remove('show');
  }
  state.shake = Math.max(0, state.shake - dt * 4);
  for (const s of state.stars) { s.y += s.v * dt; if (s.y > innerHeight + 2) { s.y = -2; s.x = rand(0, innerWidth); } }

  if (state.mode !== 'game' || state.paused || !state.run) return;
  const r = state.run;
  const p = r.player;
  p.iframes = Math.max(0, p.iframes - dt);
  p.fireTimer -= dt;
  p.slashTimer = Math.max(0, p.slashTimer - dt);
  p.pulse = clamp(p.pulse, 0, 100);
  p.hp = Math.min(p.maxHp, p.hp + p.regen * dt);

  const move = getMoveVector();
  p.x = clamp(p.x + move.x * p.speed * dt, 20, innerWidth - 20);
  p.y = clamp(p.y + move.y * p.speed * dt, 20, innerHeight - 20);

  updateDrones(dt);
  if (p.fireTimer <= 0) shootAtNearest();
  if (r.enemiesToSpawn > 0) {
    r.spawnTimer -= dt;
    if (r.spawnTimer <= 0) {
      spawnEnemy();
      r.enemiesToSpawn -= 1;
      r.spawnTimer = r.inBossWave ? 99 : Math.max(.12, .48 - r.wave * .015);
    }
  }
  updateBullets(dt);
  updateEnemyBullets(dt);
  updateEnemies(dt);
  updateDrops(dt);
  updateParticles(dt);
  updateTexts(dt);
  updateCombo(dt);

  if (!r.enemiesToSpawn && !state.enemies.length && !els.upgradeOverlay.classList.contains('hidden')) return;
  if (!r.enemiesToSpawn && !state.enemies.length && state.mode === 'game') {
    if (!r.tookDamageWave) r.perfectWaves += 1;
    if (r.inBossWave) cg.happy();
    openUpgradeChoices();
  }

  syncHud();
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

function shootAtNearest() {
  const r = state.run, p = r.player;
  const target = findNearestEnemy(p.x, p.y, 540);
  if (!target) return;
  const ang = Math.atan2(target.y - p.y, target.x - p.x);
  const spread = p.multiShot;
  const shots = [{ a: ang }];
  if (spread >= 1) shots.push({ a: ang - .18 }, { a: ang + .18 });
  if (spread >= 2) shots.push({ a: ang - .34 }, { a: ang + .34 });
  for (const s of shots) {
    state.bullets.push({ x: p.x, y: p.y, vx: Math.cos(s.a) * 620, vy: Math.sin(s.a) * 620, dmg: p.damage, r: 4, life: 1.1, pierce: p.pierce, ricochet: p.ricochet, chain: p.chain });
  }
  p.fireTimer = p.fireDelay;
  audio.shot();
}

function updateDrones(dt) {
  const r = state.run, p = r.player;
  while (state.drones.length < p.droneCount) state.drones.push({ angle: rand(0, Math.PI * 2), fire: rand(.1, .5) });
  state.drones.length = p.droneCount;
  state.drones.forEach((d, i) => {
    d.angle += dt * (1.4 + i * .22);
    d.fire -= dt;
    if (d.fire <= 0) {
      const dx = p.x + Math.cos(d.angle) * 42;
      const dy = p.y + Math.sin(d.angle) * 42;
      const target = findNearestEnemy(dx, dy, 420);
      if (target) {
        const a = Math.atan2(target.y - dy, target.x - dx);
        state.bullets.push({ x: dx, y: dy, vx: Math.cos(a) * 560, vy: Math.sin(a) * 560, dmg: p.damage * .55, r: 3, life: .9, pierce: 0, ricochet: 0, chain: 0 });
      }
      d.fire = .52;
    }
  });
}

function updateBullets(dt) {
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i];
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.life <= 0 || b.x < -40 || b.x > innerWidth + 40 || b.y < -40 || b.y > innerHeight + 40) { state.bullets.splice(i,1); continue; }
    for (let j = state.enemies.length - 1; j >= 0; j--) {
      const e = state.enemies[j];
      if (dist(b.x, b.y, e.x, e.y) <= e.r + b.r) {
        hitEnemy(e, b.dmg, false);
        if (b.chain > 0) chainFrom(e, b.dmg * .55, b.chain);
        if (b.pierce > 0) { b.pierce -= 1; b.dmg *= .82; }
        else if (b.ricochet > 0) {
          const next = nearestOtherEnemy(e, 240);
          if (next) {
            const a = Math.atan2(next.y - e.y, next.x - e.x);
            b.x = e.x; b.y = e.y; b.vx = Math.cos(a) * 620; b.vy = Math.sin(a) * 620; b.ricochet -= 1; b.dmg *= .8;
          } else state.bullets.splice(i,1);
        } else state.bullets.splice(i,1);
        break;
      }
    }
  }
}

function chainFrom(origin, dmg, chains) {
  let current = origin;
  const used = new Set([origin]);
  for (let c = 0; c < chains; c++) {
    let best = null, bestD = 9999;
    for (const e of state.enemies) {
      if (used.has(e)) continue;
      const d = dist(current.x, current.y, e.x, e.y);
      if (d < 160 && d < bestD) { bestD = d; best = e; }
    }
    if (!best) break;
    used.add(best);
    state.flashes.push({ x1: current.x, y1: current.y, x2: best.x, y2: best.y, life: .08 });
    hitEnemy(best, dmg, false);
    current = best;
  }
}

function updateEnemyBullets(dt) {
  const p = state.run.player;
  for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
    const b = state.enemyBullets[i];
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.life <= 0 || b.x < -40 || b.x > innerWidth + 40 || b.y < -40 || b.y > innerHeight + 40) { state.enemyBullets.splice(i,1); continue; }
    if (dist(b.x, b.y, p.x, p.y) <= p.r + b.r) {
      damagePlayer(b.dmg);
      state.enemyBullets.splice(i,1);
    }
  }
}

function updateEnemies(dt) {
  const p = state.run.player;
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    e.t += dt; e.hit = Math.max(0, e.hit - dt);
    let dx = p.x - e.x, dy = p.y - e.y;
    let d = Math.hypot(dx, dy) || 1;
    if (e.type === 'chaser' || e.type === 'tank' || e.type === 'splitter') {
      e.x += dx / d * e.speed * dt; e.y += dy / d * e.speed * dt;
    } else if (e.type === 'charger') {
      e.charge -= dt;
      const mult = e.charge <= 0 ? 2.2 : 1;
      if (e.charge <= -0.45) e.charge = rand(1.2, 2.2);
      e.x += dx / d * e.speed * mult * dt; e.y += dy / d * e.speed * mult * dt;
    } else if (e.type === 'sniper') {
      if (d > 240) { e.x += dx / d * e.speed * dt; e.y += dy / d * e.speed * dt; }
      else if (d < 180) { e.x -= dx / d * e.speed * dt; e.y -= dy / d * e.speed * dt; }
      e.shot -= dt;
      if (e.shot <= 0) { shootEnemy(e, p, 180, 4); e.shot = Math.max(.55, 1.4 - state.run.wave * .04); }
    } else if (e.type === 'orbiter') {
      e.orbit += dt * 1.6;
      const tx = p.x + Math.cos(e.orbit) * 140;
      const ty = p.y + Math.sin(e.orbit) * 140;
      const odx = tx - e.x, ody = ty - e.y, od = Math.hypot(odx, ody) || 1;
      e.x += odx / od * e.speed * dt; e.y += ody / od * e.speed * dt;
    } else if (e.type === 'kamikaze') {
      e.x += dx / d * e.speed * 1.5 * dt; e.y += dy / d * e.speed * 1.5 * dt;
    } else if (e.type === 'miner') {
      e.x += dx / d * e.speed * dt; e.y += dy / d * e.speed * dt;
      e.mine -= dt;
      if (e.mine <= 0) {
        state.enemies.push({ type: 'mine', x: e.x, y: e.y, hp: 18 + state.run.wave * 3, maxHp: 18, speed: 0, r: 10, value: 3, color: '#ffd36e', fuse: 1.8 + rand(0,.8), hit: 0, t: 0 });
        e.mine = rand(1.6, 2.6);
      }
    } else if (e.type === 'mine') {
      e.fuse -= dt;
      if (e.fuse <= 0) {
        explode(e.x, e.y, 88, 18, '#ffd36e');
        if (dist(e.x, e.y, p.x, p.y) <= 88) damagePlayer(18);
        killEnemy(i, false);
        continue;
      }
    } else if (e.type === 'boss') {
      updateBoss(e, dt);
    }
    if (e.type !== 'sniper' && e.type !== 'mine' && dist(e.x, e.y, p.x, p.y) < e.r + p.r) {
      damagePlayer(e.type === 'boss' ? 20 : e.type === 'kamikaze' ? 16 : 10);
      if (e.type === 'kamikaze') {
        explode(e.x, e.y, 70, 20, e.color);
        killEnemy(i, false);
        continue;
      }
    }
  }
}

function updateBoss(e, dt) {
  const p = state.run.player;
  const phase = e.hp / e.maxHp;
  e.phase = phase < .34 ? 3 : phase < .67 ? 2 : 1;
  const tx = innerWidth / 2 + Math.sin(e.t * .9) * 260;
  const ty = 130 + Math.cos(e.t * 1.2) * 45;
  e.x = lerp(e.x, tx, dt * 1.6);
  e.y = lerp(e.y, ty, dt * 1.6);
  e.shot -= dt;
  if (e.shot <= 0) {
    if (e.phase === 1) radialShots(e, 8, 180, 5);
    else if (e.phase === 2) { radialShots(e, 12, 210, 6); spawnAdds(2); }
    else { radialShots(e, 16, 250, 7); spawnAdds(3); }
    e.shot = e.phase === 3 ? .85 : e.phase === 2 ? 1.15 : 1.5;
    state.shake = .2;
  }
}

function spawnAdds(count) {
  for (let i=0;i<count;i++) state.enemies.push(makeEnemy(pick(['chaser','charger','sniper','orbiter']), rand(80, innerWidth-80), rand(80, innerHeight/2), state.run.wave));
}
function radialShots(e, count, speed, dmg) {
  for (let i=0;i<count;i++) {
    const a = (Math.PI * 2 * i) / count + e.t * .2;
    state.enemyBullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 4, r: 5, dmg });
  }
}
function shootEnemy(e, p, speed, dmg) {
  const a = Math.atan2(p.y - e.y, p.x - e.x);
  state.enemyBullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 4, r: 5, dmg });
}

function updateDrops(dt) {
  const p = state.run.player;
  for (let i = state.drops.length - 1; i >= 0; i--) {
    const d = state.drops[i];
    const dx = p.x - d.x, dy = p.y - d.y;
    const distance = Math.hypot(dx, dy) || 1;
    if (distance < p.magnet) {
      d.x += dx / distance * Math.max(120, 380 - distance * 2) * dt;
      d.y += dy / distance * Math.max(120, 380 - distance * 2) * dt;
    }
    if (distance < p.r + 10) {
      state.run.earnedCredits += d.value;
      state.run.credits += d.value;
      state.run.score += d.value * 6;
      state.run.player.pulse = clamp(state.run.player.pulse + d.value * 1.2 * p.pulseGain, 0, 100);
      audio.pickup();
      state.drops.splice(i,1);
    }
  }
}

function updateParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; p.vx *= .985; p.vy *= .985;
    if (p.life <= 0) state.particles.splice(i,1);
  }
  for (let i = state.flashes.length - 1; i >= 0; i--) {
    state.flashes[i].life -= dt;
    if (state.flashes[i].life <= 0) state.flashes.splice(i,1);
  }
  for (let i = state.texts.length - 1; i >= 0; i--) {
    const t = state.texts[i]; t.y -= 28 * dt; t.life -= dt;
    if (t.life <= 0) state.texts.splice(i,1);
  }
  for (let i = state.slashes.length - 1; i >= 0; i--) {
    state.slashes[i].life -= dt;
    if (state.slashes[i].life <= 0) state.slashes.splice(i,1);
  }
}
function updateTexts() {}

function updateCombo(dt) {
  const r = state.run;
  if (r.combo > 1) {
    r.comboTimer -= dt;
    if (r.comboTimer <= 0) r.combo = Math.max(1, r.combo - .5);
  }
  r.maxCombo = Math.max(r.maxCombo, r.combo);
}

function hitEnemy(e, dmg, slash) {
  const crit = Math.random() < state.run.player.critChance;
  const total = dmg * (crit ? (1 + state.run.player.critDamage) : 1);
  e.hp -= total;
  e.hit = .08;
  if (crit) floatingText(e.x, e.y, 'CRIT', '#ffd36e');
  burst(e.x, e.y, 8, e.color);
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
  state.run.kills += 1;
  state.run.score += Math.floor(e.value * 18 * state.run.combo);
  state.run.combo = Math.min(5, state.run.combo + .2);
  state.run.comboTimer = 2.2;
  state.run.player.pulse = clamp(state.run.player.pulse + e.value * 1.7 * state.run.player.pulseGain, 0, 100);
  const credits = Math.max(1, Math.round(e.value * (1 + state.run.player.creditBoost * .8)));
  state.drops.push({ x: e.x, y: e.y, value: credits });
  burst(e.x, e.y, e.type === 'boss' ? 32 : 16, e.color);
  floatingText(e.x, e.y, `+${Math.floor(e.value * 18)}`, '#eef4ff');
  audio.kill();
  state.shake = Math.max(state.shake, e.type === 'boss' ? .9 : .18);
  if (slash) hitStop(.035);
  if (e.type === 'splitter') {
    for (let i = 0; i < 2; i++) state.enemies.push({ type: 'chaser', x: e.x + rand(-14,14), y: e.y + rand(-14,14), hp: 12, maxHp: 12, speed: 110, r: 8, value: 2, color: '#8cffc0', t:0, hit:0 });
  }
  if (e.type === 'boss') {
    state.run.bosses += 1;
    els.bossHud.classList.add('hidden');
    toast('Boss defeated');
  }
}

function burst(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    const a = rand(0, Math.PI * 2), speed = rand(40, 260);
    state.particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: rand(.2, .7), color, s: rand(1.5, 4.5) });
  }
}
function explode(x, y, radius, dmg, color) {
  state.flashes.push({ x, y, radius, life: .22, color });
  burst(x, y, 26, color);
  for (const e of [...state.enemies]) if (dist(x, y, e.x, e.y) <= radius + e.r) hitEnemy(e, dmg, false);
}
function floatingText(x, y, text, color) { state.texts.push({ x, y, text, color, life: .6 }); }
function hitStop(sec) { state.mode = 'frozen'; setTimeout(() => { if (state.mode === 'frozen') state.mode = 'game'; }, sec * 1000); }

function damagePlayer(amount) {
  const p = state.run.player;
  if (p.iframes > 0) return;
  if (p.shieldLeft > 0) {
    p.shieldLeft -= 1;
    p.iframes = .25;
    toast('Shield blocked hit');
    return;
  }
  p.hp -= amount;
  p.iframes = .45;
  state.run.tookDamageWave = true;
  state.shake = Math.max(state.shake, .45);
  state.flashes.push({ x: p.x, y: p.y, radius: 54, life: .18, color: '#ff658d' });
  if (p.hp <= 0) endRun();
}

function usePulse() {
  if (state.mode !== 'game' || state.paused) return;
  const p = state.run.player;
  if (p.pulse < 100) return;
  p.pulse = 0;
  audio.pulse();
  state.shake = .8;
  explode(p.x, p.y, 180, 48, '#8ad8ff');
  cg.happy();
}

function useSlash() {
  if (state.mode !== 'game' || state.paused) return;
  const p = state.run.player;
  if (p.slashTimer > 0) return;
  const aimX = state.pointer.x || p.x + 1, aimY = state.pointer.y || p.y;
  const a = Math.atan2(aimY - p.y, aimX - p.x);
  const dash = 170;
  const sx = p.x, sy = p.y;
  p.x = clamp(p.x + Math.cos(a) * dash, 20, innerWidth - 20);
  p.y = clamp(p.y + Math.sin(a) * dash, 20, innerHeight - 20);
  p.slashTimer = p.slashCooldown;
  state.slashes.push({ x1: sx, y1: sy, x2: p.x, y2: p.y, life: .15, color: '#ff6fd8' });
  state.shake = .55;
  audio.slash();
  for (const e of [...state.enemies]) {
    const d = pointSegDist(e.x, e.y, sx, sy, p.x, p.y);
    if (d <= e.r + 26) hitEnemy(e, p.slashDamage, true);
  }
  if (p.slashNova) explode(p.x, p.y, 82, 22 + p.slashNova * 8, '#ff89e2');
}
function pointSegDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const l2 = dx * dx + dy * dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = clamp(t, 0, 1);
  const x = x1 + t * dx, y = y1 + t * dy;
  return dist(px, py, x, y);
}

function nearestOtherEnemy(origin, maxD) {
  let best = null, bestD = maxD;
  for (const e of state.enemies) {
    if (e === origin) continue;
    const d = dist(origin.x, origin.y, e.x, e.y);
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
}
function findNearestEnemy(x, y, maxD) {
  let best = null, bestDist = maxD;
  for (const e of state.enemies) {
    const d = dist(x, y, e.x, e.y);
    if (d < bestDist) { bestDist = d; best = e; }
  }
  return best;
}

function openUpgradeChoices() {
  state.mode = 'upgrade';
  els.upgradeOverlay.classList.remove('hidden');
  const picks = [];
  const pool = [...runUpgrades];
  while (picks.length < 3 && pool.length) {
    const idx = (Math.random() * pool.length) | 0;
    picks.push(pool.splice(idx,1)[0]);
  }
  els.upgradeChoices.innerHTML = '';
  picks.forEach(up => {
    const card = document.createElement('button');
    card.className = 'upgrade-card btn';
    card.innerHTML = `<div class="tag">${up.tag}</div><h3>${up.name}</h3><p>${up.desc}</p>`;
    card.onclick = () => {
      audio.ui();
      up.apply(state.run.player);
      els.upgradeOverlay.classList.add('hidden');
      state.mode = 'game';
      startNextWave();
    };
    els.upgradeChoices.appendChild(card);
  });
}

function refreshMetaUi() {
  const s = state.save;
  els.bestScore.textContent = s.bestScore.toLocaleString();
  els.bankedCredits.textContent = s.credits.toLocaleString();
  els.bestWave.textContent = s.bestWave;
  els.bossesTotal.textContent = s.totalBosses;
  els.metaShop.innerHTML = '';
  metaDefs.forEach(def => {
    const level = s.meta[def.id] || 0;
    const cost = Math.floor(def.base * (1 + level * 0.65));
    const row = document.createElement('div');
    row.className = 'list-item';
    row.innerHTML = `
      <div class="list-head"><h3>${def.name}</h3><span class="badge">Lv ${level}/${def.max}</span></div>
      <p>${def.desc}</p>
      <div class="row-between" style="margin-top:12px">
        <span class="badge">Cost ${cost}</span>
        <button class="btn ${level >= def.max || s.credits < cost ? '' : 'primary'}" ${level >= def.max || s.credits < cost ? 'disabled' : ''}>${level >= def.max ? 'Maxed' : 'Upgrade'}</button>
      </div>`;
    row.querySelector('button').onclick = () => {
      if (level >= def.max || s.credits < cost) return;
      s.credits -= cost; s.meta[def.id] = level + 1; persist(); refreshMetaUi(); audio.ui();
    };
    els.metaShop.appendChild(row);
  });
  els.achievementList.innerHTML = '';
  achieveDefs.forEach(a => {
    const unlocked = !!s.achievements[a.id];
    const row = document.createElement('div');
    row.className = 'list-item';
    row.innerHTML = `<div class="list-head"><h3>${a.name}</h3><span class="badge" style="color:${unlocked ? '#7cf8bf' : '#9db0d0'}">${unlocked ? 'Unlocked' : 'Locked'}</span></div><p>${a.desc}</p>`;
    els.achievementList.appendChild(row);
  });
}

function syncHud() {
  const r = state.run; if (!r) return;
  const p = r.player;
  els.hpText.textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;
  els.hpBar.style.width = `${(p.hp / p.maxHp) * 100}%`;
  els.pulseText.textContent = `${Math.floor(p.pulse)}%`;
  els.pulseBar.style.width = `${p.pulse}%`;
  const slashPct = p.slashTimer > 0 ? 100 - (p.slashTimer / p.slashCooldown) * 100 : 100;
  els.slashText.textContent = p.slashTimer > 0 ? `${Math.floor(slashPct)}%` : 'Ready';
  els.slashBar.style.width = `${slashPct}%`;
  els.waveText.textContent = r.wave;
  els.eventText.textContent = r.event;
  els.scoreText.textContent = Math.floor(r.score).toLocaleString();
  els.creditsText.textContent = r.earnedCredits.toString();
  els.comboText.textContent = `x${r.combo.toFixed(1)}`;
  const boss = state.enemies.find(e => e.type === 'boss');
  if (boss) {
    els.bossHud.classList.remove('hidden');
    els.bossBar.style.width = `${(boss.hp / boss.maxHp) * 100}%`;
    els.bossName.textContent = boss.name;
  } else els.bossHud.classList.add('hidden');
}

function render() {
  const shakeX = (Math.random() - .5) * state.shake * 12;
  const shakeY = (Math.random() - .5) * state.shake * 12;
  ctx.save();
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.translate(shakeX, shakeY);

  drawBackground();
  drawDrops();
  drawBullets();
  drawEnemies();
  drawPlayer();
  drawEffects();
  ctx.restore();
}

function drawBackground() {
  for (const s of state.stars) {
    ctx.globalAlpha = .35 + s.s * .15;
    ctx.fillStyle = '#9fbcff';
    ctx.fillRect(s.x, s.y, s.s, s.s);
  }
  ctx.globalAlpha = 1;
}
function drawPlayer() {
  if (!state.run) return;
  const p = state.run.player;
  ctx.save();
  ctx.translate(p.x, p.y);
  const aim = Math.atan2((state.pointer.y || p.y) - p.y, (state.pointer.x || p.x + 1) - p.x);
  ctx.rotate(aim + Math.PI / 2);
  ctx.shadowBlur = 22;
  ctx.shadowColor = '#6defff';
  ctx.fillStyle = p.iframes > 0 && Math.floor(p.iframes * 14) % 2 ? '#ffffff' : '#85edff';
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(13, 14);
  ctx.lineTo(0, 8);
  ctx.lineTo(-13, 14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#102339';
  ctx.beginPath();
  ctx.arc(0, 2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  state.drones.forEach(d => {
    const x = p.x + Math.cos(d.angle) * 42;
    const y = p.y + Math.sin(d.angle) * 42;
    ctx.fillStyle = '#ffd36e';
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
  });
}
function drawBullets() {
  ctx.fillStyle = '#dff8ff';
  state.bullets.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); });
  state.enemyBullets.forEach(b => { ctx.fillStyle = '#ff8fb3'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); });
}
function drawEnemies() {
  state.enemies.forEach(e => {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.shadowBlur = e.type === 'boss' ? 30 : 16;
    ctx.shadowColor = e.color;
    ctx.fillStyle = e.hit > 0 ? '#ffffff' : e.color;
    if (e.type === 'sniper') {
      ctx.beginPath(); ctx.rect(-e.r, -e.r, e.r * 2, e.r * 2); ctx.fill();
    } else if (e.type === 'orbiter') {
      ctx.beginPath(); ctx.arc(0, 0, e.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, e.r + 6, 0, Math.PI * 1.4); ctx.stroke();
    } else if (e.type === 'splitter') {
      ctx.beginPath(); ctx.moveTo(0, -e.r); ctx.lineTo(e.r, 0); ctx.lineTo(0, e.r); ctx.lineTo(-e.r, 0); ctx.closePath(); ctx.fill();
    } else if (e.type === 'charger' || e.type === 'kamikaze') {
      ctx.beginPath(); ctx.moveTo(0, -e.r); ctx.lineTo(e.r, e.r); ctx.lineTo(-e.r, e.r); ctx.closePath(); ctx.fill();
    } else if (e.type === 'mine') {
      ctx.beginPath(); ctx.arc(0, 0, e.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(4, 0); ctx.moveTo(0, -4); ctx.lineTo(0, 4); ctx.stroke();
    } else if (e.type === 'boss') {
      ctx.beginPath(); ctx.arc(0, 0, e.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ffffff88'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, e.r + 11 + Math.sin(e.t * 4) * 2, 0, Math.PI * 2); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(0, 0, e.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  });
}
function drawDrops() {
  state.drops.forEach(d => {
    ctx.fillStyle = '#ffd36e';
    ctx.beginPath(); ctx.arc(d.x, d.y, 5 + d.value * .3, 0, Math.PI * 2); ctx.fill();
  });
}
function drawEffects() {
  state.slashes.forEach(s => {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 18 * s.life * 5;
    ctx.globalAlpha = s.life * 6;
    ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
    ctx.globalAlpha = 1;
  });
  state.flashes.forEach(f => {
    if ('x1' in f) {
      ctx.strokeStyle = '#8ce9ff'; ctx.lineWidth = 3; ctx.globalAlpha = f.life * 10;
      ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke(); ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = `${f.color}33`;
      ctx.beginPath(); ctx.arc(f.x, f.y, (f.radius || 42) * (1 - f.life * .4), 0, Math.PI * 2); ctx.fill();
    }
  });
  state.particles.forEach(p => {
    ctx.globalAlpha = Math.max(0, p.life * 1.5);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.s, p.s);
  });
  ctx.globalAlpha = 1;
  state.texts.forEach(t => {
    ctx.fillStyle = t.color; ctx.font = '700 14px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(t.text, t.x, t.y);
  });
}

function loop(now) {
  const dt = Math.min(.033, (now - state.last) / 1000);
  state.last = now;
  if (state.mode !== 'frozen') update(dt);
  render();
  requestAnimationFrame(loop);
}

function bind() {
  addEventListener('resize', resize);
  addEventListener('mousemove', e => { state.pointer.x = e.clientX; state.pointer.y = e.clientY; });
  addEventListener('keydown', e => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
    state.keys[e.code] = true;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') useSlash();
    if (e.code === 'Space') usePulse();
    if (e.code === 'KeyP' && state.mode === 'game') togglePause();
  });
  addEventListener('keyup', e => { state.keys[e.code] = false; });

  els.startBtn.onclick = () => { audio.ensure(); audio.ui(); startRun(); };
  els.retryBtn.onclick = () => { audio.ui(); startRun(); };
  els.menuBtn.onclick = () => { audio.ui(); showMenu(); };
  els.howBtn.onclick = () => { audio.ui(); els.howPanel.classList.remove('hidden'); };
  els.closeHow.onclick = () => { audio.ui(); els.howPanel.classList.add('hidden'); };
  els.tabMeta.onclick = () => setTab('meta');
  els.tabAchievements.onclick = () => setTab('achievements');
  els.pulseBtn.onclick = usePulse;
  els.slashBtn.onclick = useSlash;

  els.touchPad.addEventListener('touchstart', onPadStart, { passive: false });
  els.touchPad.addEventListener('touchmove', onPadMove, { passive: false });
  els.touchPad.addEventListener('touchend', onPadEnd, { passive: false });
}
function togglePause() {
  state.paused = !state.paused;
  els.pauseOverlay.classList.toggle('hidden', !state.paused);
}
function setTab(which) {
  const meta = which === 'meta';
  els.tabMeta.classList.toggle('active', meta);
  els.tabAchievements.classList.toggle('active', !meta);
  els.metaPanel.classList.toggle('active', meta);
  els.achievementPanel.classList.toggle('active', !meta);
}
function onPadStart(e) {
  e.preventDefault();
  const t = e.changedTouches[0], rect = els.touchPad.getBoundingClientRect();
  state.touch.active = true; state.touch.id = t.identifier; state.touch.baseX = rect.left + rect.width / 2; state.touch.baseY = rect.top + rect.height / 2;
  updateTouch(t.clientX, t.clientY);
}
function onPadMove(e) {
  e.preventDefault();
  for (const t of e.changedTouches) if (t.identifier === state.touch.id) updateTouch(t.clientX, t.clientY);
}
function onPadEnd(e) {
  e.preventDefault();
  for (const t of e.changedTouches) if (t.identifier === state.touch.id) {
    state.touch.active = false; state.touch.x = 0; state.touch.y = 0; state.touch.id = null;
    els.touchStick.style.transform = 'translate(-50%, -50%)';
  }
}
function updateTouch(x, y) {
  const dx = x - state.touch.baseX, dy = y - state.touch.baseY; const max = 42;
  const d = Math.hypot(dx, dy) || 1; const px = d > max ? dx / d * max : dx, py = d > max ? dy / d * max : dy;
  state.touch.x = px / max; state.touch.y = py / max;
  state.pointer.x = state.run?.player.x + state.touch.x * 120 || x;
  state.pointer.y = state.run?.player.y + state.touch.y * 120 || y;
  els.touchStick.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
}

cg.init();
resize();
bind();
refreshMetaUi();
showMenu();
requestAnimationFrame(loop);

})();
