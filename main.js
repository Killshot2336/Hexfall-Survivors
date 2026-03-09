const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const els = {
  hud: document.getElementById('hud'),
  bossHud: document.getElementById('bossHud'),
  bossName: document.getElementById('bossName'),
  bossBar: document.getElementById('bossBar'),
  waveBanner: document.getElementById('waveBanner'),
  waveModeText: document.getElementById('waveModeText'),
  waveBannerTitle: document.getElementById('waveBannerTitle'),
  waveBannerDesc: document.getElementById('waveBannerDesc'),
  home: document.getElementById('home'),
  howPanel: document.getElementById('howPanel'),
  upgradeScreen: document.getElementById('upgradeScreen'),
  pauseScreen: document.getElementById('pauseScreen'),
  gameOverScreen: document.getElementById('gameOverScreen'),
  toast: document.getElementById('toast'),
  hpText: document.getElementById('hpText'),
  burstText: document.getElementById('burstText'),
  slashText: document.getElementById('slashText'),
  hpBar: document.getElementById('hpBar'),
  burstBar: document.getElementById('burstBar'),
  slashBar: document.getElementById('slashBar'),
  waveText: document.getElementById('waveText'),
  scoreText: document.getElementById('scoreText'),
  shardText: document.getElementById('shardText'),
  comboText: document.getElementById('comboText'),
  bestScore: document.getElementById('bestScore'),
  metaCredits: document.getElementById('metaCredits'),
  metaShop: document.getElementById('metaShop'),
  achievementList: document.getElementById('achievementList'),
  upgradeChoices: document.getElementById('upgradeChoices'),
  finalTitle: document.getElementById('finalTitle'),
  finalScore: document.getElementById('finalScore'),
  finalWave: document.getElementById('finalWave'),
  finalCredits: document.getElementById('finalCredits'),
  runSummary: document.getElementById('runSummary'),
  startBtn: document.getElementById('startBtn'),
  retryBtn: document.getElementById('retryBtn'),
  menuBtn: document.getElementById('menuBtn'),
  howBtn: document.getElementById('howBtn'),
  closeHow: document.getElementById('closeHow'),
  resumeBtn: document.getElementById('resumeBtn'),
  pauseMenuBtn: document.getElementById('pauseMenuBtn'),
  mobileControls: document.getElementById('mobileControls'),
  joystickZone: document.getElementById('joystickZone'),
  joystickKnob: document.getElementById('joystickKnob'),
  slashBtn: document.getElementById('slashBtn'),
  pulseBtn: document.getElementById('pulseBtn'),
  panelToggleUpgrades: document.getElementById('panelToggleUpgrades'),
  panelToggleMilestones: document.getElementById('panelToggleMilestones'),
  metaPanel: document.getElementById('metaPanel'),
  achievementPanel: document.getElementById('achievementPanel'),
};

// Brand-final persistence keys.
// Keep legacy keys only for one-time migration so old test saves still import cleanly.
const SAVE_KEY = 'voidline-rift-reaper-release-save-v3';
const LEGACY_KEYS = [
  'voidline-rift-reaper-brand-final-save-v2',
  'voidline-rift-reaper-save-v1',
  'voidline-rift-reaper-save-v0',
  'hexfall-survivors-save-v1',
  'neon-drift-protocol-save-v1',
];

const bossNames = ['RIFT SOVEREIGN', 'NULL WARDEN', 'ECLIPSE SERAPH'];
const events = [
  { mode: 'ASSAULT WAVE', title: 'Assault Surge', desc: 'Balanced pressure. Stay clean.' },
  { mode: 'SWARM WAVE', title: 'Swarm Protocol', desc: 'More bodies. Faster kills.' },
  { mode: 'CROSSFIRE WAVE', title: 'Crossfire Lattice', desc: 'Snipers are online. Keep moving.' },
];

const achievementsData = [
  { id: 'first_blood', name: 'First Blood', desc: 'Destroy your first enemy.', check: s => s.kills >= 1 },
  { id: 'wave4', name: 'Boss Contact', desc: 'Reach the first boss wave.', check: s => s.wave >= 4 },
  { id: 'wave8', name: 'Deep Run', desc: 'Reach wave 8.', check: s => s.wave >= 8 },
  { id: 'boss3', name: 'Boss Breaker', desc: 'Defeat 3 bosses in one run.', check: s => s.bossesDefeated >= 3 },
  { id: 'combo25', name: 'Flow State', desc: 'Reach x2.5 combo.', check: s => s.maxCombo >= 2.5 },
  { id: 'perfect2', name: 'Untouched', desc: 'Clear 2 waves without taking damage.', check: s => s.perfectWaves >= 2 },
];

const metaUpgrades = [
  { id: 'coreHull', name: 'Core Hull', desc: '+14 max HP per rank.', baseCost: 12, maxLevel: 5 },
  { id: 'focusLens', name: 'Focus Lens', desc: '+8% bullet damage per rank.', baseCost: 14, maxLevel: 5 },
  { id: 'gyroDrive', name: 'Gyro Drive', desc: '+4% movement speed per rank.', baseCost: 12, maxLevel: 5 },
  { id: 'salvage', name: 'Salvage', desc: '+1 starting shard per rank.', baseCost: 8, maxLevel: 8 },
  { id: 'riftCore', name: 'Rift Core', desc: '+10% Rift Slash gain per rank.', baseCost: 16, maxLevel: 4 },
];

const runUpgradePool = [
  { id: 'damage', name: 'Overclock', tag: 'Offense', desc: '+22% bullet damage.', apply: s => s.player.damage *= 1.22 },
  { id: 'fireRate', name: 'Rapid Relay', tag: 'Offense', desc: '+16% fire rate.', apply: s => s.player.fireDelay *= 0.84 },
  { id: 'multi', name: 'Split Lattice', tag: 'Offense', desc: '+1 side projectile.', apply: s => s.player.multiShot = Math.min(2, s.player.multiShot + 1) },
  { id: 'pierce', name: 'Phase Rounds', tag: 'Control', desc: 'Bullets pierce +1 enemy.', apply: s => s.player.pierce += 1 },
  { id: 'crit', name: 'Critical Matrix', tag: 'Offense', desc: '+10% crit chance and +25% crit damage.', apply: s => { s.player.critChance += 0.1; s.player.critDamage += 0.25; } },
  { id: 'regen', name: 'Nano Repair', tag: 'Defense', desc: 'Regenerate 0.8 HP/sec.', apply: s => s.player.regen += 0.8 },
  { id: 'maxHp', name: 'Reinforced Shell', tag: 'Defense', desc: '+22 max HP and heal 22.', apply: s => { s.player.maxHp += 22; s.player.hp = Math.min(s.player.maxHp, s.player.hp + 22); } },
  { id: 'magnet', name: 'Magnet Field', tag: 'Utility', desc: 'Increase shard pickup range.', apply: s => s.player.magnet += 26 },
  { id: 'burstGain', name: 'Capacitor Banks', tag: 'Burst', desc: '+20% Pulse charge rate.', apply: s => s.player.burstGain *= 1.2 },
  { id: 'slashGain', name: 'Drift Engine', tag: 'Drift', desc: '+24% Rift Slash charge rate.', apply: s => s.player.slashGain *= 1.24 },
  { id: 'slashDamage', name: 'Rift Edge', tag: 'Drift', desc: '+35% Rift Slash damage.', apply: s => s.player.slashDamage *= 1.35 },
  { id: 'economy', name: 'Golden Fracture', tag: 'Economy', desc: 'Enemies drop more shards.', apply: s => s.player.shardBoost += 0.25 },
  { id: 'shield', name: 'Mirror Shield', tag: 'Defense', desc: 'Gain a 1-hit shield every wave.', apply: s => s.player.waveShield += 1 },
];

const crazy = {
  ready: false,
  data: null,
  async init() {
    if (!window.CrazyGames?.SDK) return;
    try {
      await window.CrazyGames.SDK.init();
      this.ready = true;
      this.data = window.CrazyGames.SDK.data || null;
      this.loadingStart();
    } catch (e) {
      console.warn('CrazyGames SDK unavailable:', e);
    } finally {
      this.loadingStop();
    }
  },
  getItem(key) {
    try { if (this.data) return this.data.getItem(key); } catch {}
    try { return localStorage.getItem(key); } catch { return null; }
  },
  setItem(key, value) {
    try { localStorage.setItem(key, value); } catch {}
    try { if (this.data) this.data.setItem(key, value); } catch {}
  },
  gameplayStart() { try { if (this.ready) window.CrazyGames.SDK.game?.gameplayStart(); } catch {} },
  gameplayStop() { try { if (this.ready) window.CrazyGames.SDK.game?.gameplayStop(); } catch {} },
  loadingStart() { try { if (this.ready) window.CrazyGames.SDK.game?.loadingStart(); } catch {} },
  loadingStop() { try { if (this.ready) window.CrazyGames.SDK.game?.loadingStop(); } catch {} },
  happytime() { try { if (this.ready) window.CrazyGames.SDK.game?.happytime(); } catch {} },
};

const input = {
  keys: {},
  touchActive: false,
  moveX: 0,
  moveY: 0,
  pointerX: 0,
  pointerY: 0,
};

const state = {
  screen: 'menu',
  paused: false,
  gameTime: 0,
  screenShake: 0,
  particles: [],
  bullets: [],
  enemyBullets: [],
  enemies: [],
  drops: [],
  flashes: [],
  wave: 0,
  score: 0,
  kills: 0,
  bossesDefeated: 0,
  runShards: 0,
  totalShardsCollected: 0,
  perfectWaves: 0,
  tookDamageThisWave: false,
  maxCombo: 1,
  combo: 1,
  comboTimer: 0,
  enemiesToSpawn: 0,
  spawnTimer: 0,
  bannerTimer: 0,
  toastTimer: 0,
  currentEvent: events[0],
  player: null,
  freezeTimer: 0,
  slashFx: [],
  bossIntroTimer: 0,
};

const audio = {
  ctx: null,
  master: null,
  musicGain: null,
  musicNodes: [],
  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.08;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.035;
    this.musicGain.connect(this.master);
    this.startMusic();
  },
  tone({ freq = 440, duration = 0.08, type = 'sine', volume = 0.2, slide = 0 }) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slide) osc.frequency.linearRampToValueAtTime(freq + slide, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  },
  noise(volume = 0.18, duration = 0.08, freq = 1200) {
    if (!this.ctx) return;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start();
  },
  shoot() { this.tone({ freq: 720, slide: -180, duration: 0.05, type: 'triangle', volume: 0.16 }); },
  hit() { this.tone({ freq: 180, slide: -40, duration: 0.08, type: 'sawtooth', volume: 0.16 }); },
  kill() { this.tone({ freq: 240, slide: 260, duration: 0.08, type: 'square', volume: 0.14 }); },
  shard() { this.tone({ freq: 900, slide: 140, duration: 0.05, type: 'triangle', volume: 0.12 }); },
  select() { this.tone({ freq: 580, slide: 120, duration: 0.08, type: 'triangle', volume: 0.14 }); },
  pulse() { this.noise(0.24, 0.12, 900); this.tone({ freq: 90, slide: 680, duration: 0.24, type: 'sawtooth', volume: 0.16 }); },
  slash() { this.noise(0.1, 0.12, 1400); this.tone({ freq: 400, slide: -180, duration: 0.1, type: 'triangle', volume: 0.16 }); },
  startMusic() {
    if (!this.ctx || this.musicNodes.length) return;
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
      this.musicNodes.push(osc);
    }
  },
};

function rand(min, max) { return Math.random() * (max - min) + min; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
function angleTo(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function resize() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = innerWidth * ratio;
  canvas.height = innerHeight * ratio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  els.mobileControls.classList.toggle('hidden', innerWidth > 820 || state.screen !== 'game');
}
window.addEventListener('resize', resize);

function parseSave(raw) {
  try {
    const d = JSON.parse(raw);
    return {
      bestScore: d.bestScore || 0,
      credits: d.credits || 0,
      meta: d.meta || {},
      achievements: d.achievements || {},
    };
  } catch {
    return { bestScore: 0, credits: 0, meta: {}, achievements: {} };
  }
}

function loadSave() {
  let raw = crazy.getItem(SAVE_KEY);
  if (!raw) {
    for (const key of LEGACY_KEYS) {
      raw = crazy.getItem(key);
      if (raw) break;
    }
  }
  const parsed = raw ? parseSave(raw) : { bestScore: 0, credits: 0, meta: {}, achievements: {} };
  crazy.setItem(SAVE_KEY, JSON.stringify(parsed));
  return parsed;
}

let save = { bestScore: 0, credits: 0, meta: {}, achievements: {} };
function writeSave() { crazy.setItem(SAVE_KEY, JSON.stringify(save)); }
function metaLevel(id) { return save.meta[id] || 0; }
function metaCost(up) { return Math.round(up.baseCost * Math.pow(1.55, metaLevel(up.id))); }

function createPlayer() {
  return {
    x: innerWidth / 2,
    y: innerHeight / 2,
    r: 14,
    maxHp: 110 + metaLevel('coreHull') * 14,
    hp: 110 + metaLevel('coreHull') * 14,
    speed: 290 * (1 + metaLevel('gyroDrive') * 0.04),
    damage: 18 * (1 + metaLevel('focusLens') * 0.08),
    bulletSpeed: 520,
    fireDelay: 0.24,
    fireTimer: 0,
    pierce: 0,
    multiShot: 0,
    critChance: 0.08,
    critDamage: 0.55,
    regen: 0,
    magnet: 72,
    burst: 0,
    burstGain: 1,
    slash: 35,
    slashGain: 1 + metaLevel('riftCore') * 0.1,
    slashDamage: 90,
    slashCooldown: 0,
    shardBoost: 0,
    waveShield: 0,
    currentShield: 0,
    invuln: 0,
    facing: -Math.PI / 2,
    trail: [],
  };
}

function showToast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  state.toastTimer = 1.9;
}

function showBanner(mode, title, desc) {
  els.waveModeText.textContent = mode;
  els.waveBannerTitle.textContent = title;
  els.waveBannerDesc.textContent = desc;
  els.waveBanner.classList.remove('hidden');
  state.bannerTimer = 1.7;
}

function unlockAchievement(id) {
  if (save.achievements[id]) return;
  save.achievements[id] = true;
  writeSave();
  const found = achievementsData.find(a => a.id === id);
  if (found) showToast(`Milestone unlocked: ${found.name}`);
  renderAchievements();
}

function setDrawer(openPanel) {
  const openUpgrades = openPanel === 'upgrades';
  const openMilestones = openPanel === 'milestones';
  els.panelToggleUpgrades?.setAttribute('aria-expanded', String(openUpgrades));
  els.panelToggleMilestones?.setAttribute('aria-expanded', String(openMilestones));
  els.metaPanel?.classList.toggle('hidden', !openUpgrades);
  els.achievementPanel?.classList.toggle('hidden', !openMilestones);
  els.panelToggleUpgrades?.closest('.drawer-section')?.classList.toggle('is-open', openUpgrades);
  els.panelToggleMilestones?.closest('.drawer-section')?.classList.toggle('is-open', openMilestones);
}

function checkAchievements() {
  achievementsData.forEach(a => {
    if (!save.achievements[a.id] && a.check(state)) unlockAchievement(a.id);
  });
}

function renderMetaShop() {
  els.metaCredits.textContent = save.credits;
  els.bestScore.textContent = save.bestScore;
  els.metaShop.innerHTML = '';
  metaUpgrades.forEach(up => {
    const level = metaLevel(up.id);
    const cost = metaCost(up);
    const canBuy = save.credits >= cost && level < up.maxLevel;
    const item = document.createElement('div');
    item.className = 'shop-item';
    item.innerHTML = `
      <div class="shop-head">
        <div>
          <div class="name">${up.name}</div>
          <div class="muted">${up.desc}</div>
        </div>
        <div class="tag">Lv ${level}/${up.maxLevel}</div>
      </div>
      <div class="shop-head">
        <div class="cost">${level >= up.maxLevel ? 'MAXED' : `${cost} credits`}</div>
        <button class="btn ${canBuy ? 'primary' : ''}" ${canBuy ? '' : 'disabled'}>${level >= up.maxLevel ? 'Complete' : 'Buy'}</button>
      </div>`;
    item.querySelector('button').addEventListener('click', () => {
      if (!canBuy) return;
      audio.select();
      save.credits -= cost;
      save.meta[up.id] = level + 1;
      writeSave();
      renderMetaShop();
    });
    els.metaShop.appendChild(item);
  });
}

function renderAchievements() {
  els.achievementList.innerHTML = '';
  achievementsData.forEach(a => {
    const done = !!save.achievements[a.id];
    const item = document.createElement('div');
    item.className = `achievement-item ${done ? 'done' : 'locked'}`;
    item.innerHTML = `
      <div class="shop-head">
        <div>
          <div class="name">${a.name}</div>
          <div class="muted">${a.desc}</div>
        </div>
        <div class="tag">${done ? 'Unlocked' : 'Locked'}</div>
      </div>`;
    els.achievementList.appendChild(item);
  });
}

function clearRunState() {
  state.gameTime = 0;
  state.screenShake = 0;
  state.particles = [];
  state.bullets = [];
  state.enemyBullets = [];
  state.enemies = [];
  state.drops = [];
  state.flashes = [];
  state.wave = 0;
  state.score = 0;
  state.kills = 0;
  state.bossesDefeated = 0;
  state.runShards = metaLevel('salvage');
  state.totalShardsCollected = metaLevel('salvage');
  state.perfectWaves = 0;
  state.tookDamageThisWave = false;
  state.maxCombo = 1;
  state.combo = 1;
  state.comboTimer = 0;
  state.enemiesToSpawn = 0;
  state.spawnTimer = 0;
  state.bannerTimer = 0;
  state.toastTimer = 0;
  state.player = createPlayer();
  state.freezeTimer = 0;
  state.slashFx = [];
  state.bossIntroTimer = 0;
}

function resetRun() {
  clearRunState();
  state.screen = 'game';
  state.paused = false;
  els.home.classList.add('hidden');
  els.howPanel.classList.add('hidden');
  els.gameOverScreen.classList.add('hidden');
  els.upgradeScreen.classList.add('hidden');
  els.pauseScreen.classList.add('hidden');
  els.hud.classList.remove('hidden');
  resize();
  crazy.gameplayStart();
  beginNextWave();
  updateHud();
}

function goMenu() {
  state.screen = 'menu';
  state.paused = false;
  els.home.classList.remove('hidden');
  els.hud.classList.add('hidden');
  els.bossHud.classList.add('hidden');
  els.waveBanner.classList.add('hidden');
  els.gameOverScreen.classList.add('hidden');
  els.upgradeScreen.classList.add('hidden');
  els.pauseScreen.classList.add('hidden');
  els.mobileControls.classList.add('hidden');
  crazy.gameplayStop();
  renderMetaShop();
  renderAchievements();
  setDrawer('upgrades');
}

function beginNextWave() {
  state.wave += 1;
  state.tookDamageThisWave = false;
  state.player.currentShield = state.player.waveShield;
  state.player.slash = clamp(state.player.slash + 18, 0, 100);
  if (state.wave % 4 === 0) {
    state.currentEvent = { mode: 'BOSS WAVE', title: bossNames[(state.wave / 4 - 1) % bossNames.length], desc: 'Pattern shift incoming. Survive the set piece.' };
    state.enemiesToSpawn = 1;
    state.bossIntroTimer = 1.8;
    state.flashes.push({ x: innerWidth / 2, y: innerHeight / 2, r: Math.max(innerWidth, innerHeight) * 0.7, life: 0.5, color: 'rgba(255, 107, 142, 0.9)' });
  } else {
    state.currentEvent = events[(state.wave - 1) % events.length];
    state.enemiesToSpawn = 7 + state.wave * 2 + (state.currentEvent.mode === 'SWARM WAVE' ? 4 : 0);
  }
  state.spawnTimer = 0.35;
  showBanner(state.currentEvent.mode, state.currentEvent.title, state.currentEvent.desc);
  audio.select();
}

function createEnemy(type, x, y) {
  const base = {
    chaser: { r: 12, speed: 80 + state.wave * 5, hp: 26 + state.wave * 7, color: '#ff6d88', score: 11 },
    sniper: { r: 10, speed: 48 + state.wave * 2, hp: 20 + state.wave * 5, color: '#ffd66b', score: 16, shotRate: 1.2 },
    orbiter: { r: 11, speed: 104 + state.wave * 5, hp: 22 + state.wave * 5, color: '#7bffcf', score: 16 },
    tank: { r: 20, speed: 42 + state.wave * 2, hp: 95 + state.wave * 18, color: '#b07cff', score: 28 },
    kamikaze: { r: 10, speed: 130 + state.wave * 7, hp: 18 + state.wave * 4, color: '#ff9c6d', score: 18 },
  }[type];
  return { x, y, vx: 0, vy: 0, hp: base.hp, maxHp: base.hp, r: base.r, speed: base.speed, type, color: base.color, score: base.score, flash: 0, shotTimer: rand(0.4, base.shotRate || 1.4), boss: false, phase: 1, angle: rand(0, Math.PI * 2) };
}

function createBoss(x, y) {
  const tier = Math.floor(state.wave / 4 - 1) % 3;
  const hp = 420 + state.wave * 80;
  return { x, y, vx: 0, vy: 0, hp, maxHp: hp, r: 38, speed: 62 + state.wave * 2, type: 'boss', color: '#ff7397', score: 240, flash: 0, shotTimer: 1.1, dashTimer: 1.5, boss: true, tier, phase: 1, angle: 0 };
}

function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  let x = 0, y = 0;
  if (side === 0) { x = rand(-40, innerWidth + 40); y = -30; }
  if (side === 1) { x = innerWidth + 30; y = rand(-40, innerHeight + 40); }
  if (side === 2) { x = rand(-40, innerWidth + 40); y = innerHeight + 30; }
  if (side === 3) { x = -30; y = rand(-40, innerHeight + 40); }
  if (state.wave % 4 === 0) {
    state.enemies.push(createBoss(innerWidth / 2, 110));
    state.enemiesToSpawn = 0;
    return;
  }
  let type = 'chaser';
  const roll = Math.random();
  if (state.wave >= 2 && roll > 0.72) type = 'sniper';
  if (state.wave >= 3 && roll > 0.82) type = 'orbiter';
  if (state.wave >= 5 && roll > 0.9) type = 'tank';
  if (state.wave >= 6 && roll > 0.95) type = 'kamikaze';
  if (state.currentEvent.mode === 'SWARM WAVE' && Math.random() > 0.55) type = 'chaser';
  if (state.currentEvent.mode === 'CROSSFIRE WAVE' && Math.random() > 0.5) type = 'sniper';
  state.enemies.push(createEnemy(type, x, y));
}

function fireBullet(angle, scale = 1, sideOffset = 0) {
  const p = state.player;
  const px = p.x + Math.cos(angle + Math.PI / 2) * sideOffset;
  const py = p.y + Math.sin(angle + Math.PI / 2) * sideOffset;
  state.bullets.push({ x: px, y: py, vx: Math.cos(angle) * p.bulletSpeed, vy: Math.sin(angle) * p.bulletSpeed, r: 4, life: 1.2, damage: p.damage * scale, pierce: p.pierce, crit: false });
  audio.shoot();
}

function fireEnemyBullet(x, y, angle, speed = 220, damage = 10, color = '#ffd66b') {
  state.enemyBullets.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: 5, life: 3, damage, color });
}

function tryShoot(dt) {
  const p = state.player;
  p.fireTimer -= dt;
  let target = null;
  let best = Infinity;
  for (const e of state.enemies) {
    const d = dist(p.x, p.y, e.x, e.y);
    if (d < best) { best = d; target = e; }
  }
  if (!target) return;
  p.facing = angleTo(p.x, p.y, target.x, target.y);
  if (p.fireTimer > 0) return;
  p.fireTimer = p.fireDelay;
  fireBullet(p.facing, 1, 0);
  if (p.multiShot >= 1) fireBullet(p.facing - 0.12, 0.78, -8);
  if (p.multiShot >= 2) fireBullet(p.facing + 0.12, 0.78, 8);
}

function addDamageText(x, y, text, color = '#ffffff') {
  state.particles.push({ x, y, vx: rand(-18, 18), vy: rand(-64, -34), life: 0.65, size: 0, text, color, textMode: true });
}

function killEnemy(enemy) {
  state.kills += 1;
  state.combo = clamp(state.combo + (enemy.boss ? 0.45 : 0.08), 1, 3.5);
  state.comboTimer = 3.2;
  state.maxCombo = Math.max(state.maxCombo, state.combo);
  state.score += Math.round(enemy.score * state.wave * state.combo);
  state.player.burst = clamp(state.player.burst + 10 * state.player.burstGain + (enemy.boss ? 18 : 0), 0, 100);
  state.player.slash = clamp(state.player.slash + 8 * state.player.slashGain + (enemy.boss ? 12 : 0), 0, 100);
  const shardCount = Math.max(1, Math.round((enemy.boss ? 5 : 1) * (1 + state.player.shardBoost)));
  for (let i = 0; i < shardCount; i++) state.drops.push({ x: enemy.x + rand(-8, 8), y: enemy.y + rand(-8, 8), vx: rand(-40, 40), vy: rand(-40, 40), value: enemy.boss ? 2 : 1, r: 5, life: 10 });
  for (let i = 0; i < (enemy.boss ? 34 : 16); i++) state.particles.push({ x: enemy.x, y: enemy.y, vx: rand(-220, 220), vy: rand(-220, 220), life: rand(0.28, 0.85), size: rand(2, enemy.boss ? 7 : 5), color: enemy.color });
  for (let i = 0; i < (enemy.boss ? 8 : 4); i++) state.particles.push({ x: enemy.x, y: enemy.y, vx: rand(-160, 160), vy: rand(-160, 160), life: rand(0.35, 0.7), size: rand(enemy.r * 0.18, enemy.r * 0.32), color: '#ffffff' });
  state.flashes.push({ x: enemy.x, y: enemy.y, r: enemy.r * 3.2, life: 0.18, color: enemy.color });
  state.screenShake = Math.max(state.screenShake, enemy.boss ? 16 : enemy.type === 'tank' ? 8 : 5);
  if (state.kills === 1) showToast('FIRST BLOOD');
  if (state.combo >= 2 && Math.abs((state.combo * 10) % 5) < 0.8) showToast(`Combo x${state.combo.toFixed(1)}`);
  audio.kill();
  if (enemy.boss) {
    state.bossesDefeated += 1;
    crazy.happytime();
    showToast(`${bossNames[enemy.tier]} collapsed`);
  }
  checkAchievements();
}

function dealDamageToEnemy(enemy, amount, crit = false) {
  enemy.hp -= amount;
  enemy.flash = 0.07;
  addDamageText(enemy.x, enemy.y - enemy.r - 10, Math.round(amount), crit ? '#fff0a8' : '#ffffff');
  for (let i = 0; i < 5; i++) state.particles.push({ x: enemy.x, y: enemy.y, vx: rand(-90, 90), vy: rand(-90, 90), life: rand(0.2, 0.45), size: rand(2, 4), color: crit ? '#fff0a8' : enemy.color });
  if (enemy.hp <= 0) killEnemy(enemy);
}

function hurtPlayer(amount) {
  const p = state.player;
  if (p.invuln > 0 || state.screen !== 'game') return;
  if (p.slash >= 100 && p.slashCooldown <= 0) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(176,124,255,${0.35 + Math.sin(state.gameTime * 8) * 0.18})`;
    ctx.lineWidth = 4;
    ctx.arc(0, 0, p.r + 14 + Math.sin(state.gameTime * 10) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (p.currentShield > 0) {
    p.currentShield -= 1;
    p.invuln = 0.45;
    showToast('Shield absorbed impact');
    audio.select();
    return;
  }
  p.hp -= amount;
  p.invuln = 0.65;
  state.tookDamageThisWave = true;
  state.combo = 1;
  state.comboTimer = 0;
  state.screenShake = Math.max(state.screenShake, 12);
  audio.hit();
  for (let i = 0; i < 20; i++) state.particles.push({ x: p.x, y: p.y, vx: rand(-240, 240), vy: rand(-240, 240), life: rand(0.3, 0.75), size: rand(2, 5), color: '#ff9bb1' });
  if (p.hp <= 0) endRun(false);
}

function useBurst() {
  const p = state.player;
  if (state.screen !== 'game' || state.paused || p.burst < 100) return;
  p.burst = 0;
  audio.pulse();
  state.flashes.push({ x: p.x, y: p.y, r: 380, life: 0.35, color: '#fff0a8' });
  state.screenShake = 18;
  for (const e of state.enemies) dealDamageToEnemy(e, 52 + state.wave * 2.2, false);
  state.enemies = state.enemies.filter(e => e.hp > 0);
}

function useSlash() {
  const p = state.player;
  if (state.screen !== 'game' || state.paused || p.slash < 100 || p.slashCooldown > 0) return;
  p.slash = 0;
  p.slashCooldown = 1.25;
  p.invuln = 0.25;
  const ang = p.facing;
  const startX = p.x;
  const startY = p.y;
  const endX = clamp(startX + Math.cos(ang) * 170, 20, innerWidth - 20);
  const endY = clamp(startY + Math.sin(ang) * 170, 20, innerHeight - 20);
  p.x = endX;
  p.y = endY;
  audio.slash();
  state.slashFx.push({ x1: startX, y1: startY, x2: endX, y2: endY, angle: ang, life: 0.28, width: 38 });
  state.flashes.push({ x: endX, y: endY, r: 260, life: 0.22, color: 'rgba(176,124,255,0.9)' });
  state.screenShake = 18;
  let hits = 0;
  const segDx = endX - startX;
  const segDy = endY - startY;
  const segLenSq = segDx * segDx + segDy * segDy || 1;
  for (const e of state.enemies) {
    const t = clamp(((e.x - startX) * segDx + (e.y - startY) * segDy) / segLenSq, 0, 1);
    const px = startX + segDx * t;
    const py = startY + segDy * t;
    const d = dist(px, py, e.x, e.y);
    if (d <= e.r + 46) {
      hits += 1;
      dealDamageToEnemy(e, p.slashDamage * (e.boss ? 0.72 : 1), false);
      for (let i = 0; i < 6; i++) state.particles.push({ x: e.x, y: e.y, vx: Math.cos(ang) * rand(110, 240) + rand(-80, 80), vy: Math.sin(ang) * rand(110, 240) + rand(-80, 80), life: rand(0.22, 0.55), size: rand(2, 5), color: '#f3daff' });
    }
  }
  if (hits > 0) {
    state.freezeTimer = 0.07;
    showToast(hits >= 4 ? 'RIFT EXECUTION' : 'Rift Slash');
  } else {
    showToast('Rift Slash');
  }
  state.enemies = state.enemies.filter(e => e.hp > 0);
}

function spawnUpgradeChoices() {
  const options = [];
  const used = new Set();
  while (options.length < 3) {
    const up = pick(runUpgradePool);
    if (used.has(up.id)) continue;
    used.add(up.id);
    options.push(up);
  }
  els.upgradeChoices.innerHTML = '';
  options.forEach(up => {
    const item = document.createElement('button');
    item.className = 'upgrade-item';
    item.innerHTML = `<div class="upgrade-head"><div class="name">${up.name}</div><div class="tag">${up.tag}</div></div><p>${up.desc}</p>`;
    item.addEventListener('click', () => {
      audio.select();
      up.apply(state);
      els.upgradeScreen.classList.add('hidden');
      state.paused = false;
      beginNextWave();
      updateHud();
    });
    els.upgradeChoices.appendChild(item);
  });
  els.upgradeScreen.classList.remove('hidden');
  state.paused = true;
}

function endWaveIfNeeded() {
  if (state.enemies.length === 0 && state.enemiesToSpawn <= 0 && state.enemyBullets.length === 0 && state.screen === 'game' && !state.paused) {
    if (!state.tookDamageThisWave) state.perfectWaves += 1;
    state.score += 45 * state.wave;
    checkAchievements();
    if (state.wave >= 12) endRun(true);
    else spawnUpgradeChoices();
  }
}

function endRun(victory) {
  state.screen = 'gameover';
  state.paused = false;
  els.hud.classList.add('hidden');
  els.bossHud.classList.add('hidden');
  els.upgradeScreen.classList.add('hidden');
  els.pauseScreen.classList.add('hidden');
  els.mobileControls.classList.add('hidden');
  els.gameOverScreen.classList.remove('hidden');
  crazy.gameplayStop();
  const earned = Math.floor(state.score / 170) + state.wave * 4 + Math.floor(state.totalShardsCollected / 12) + (victory ? 32 : 0);
  save.credits += earned;
  save.bestScore = Math.max(save.bestScore, state.score);
  writeSave();
  renderMetaShop();
  renderAchievements();
  els.finalTitle.textContent = victory ? 'Sector Purged' : 'Signal Lost';
  els.finalScore.textContent = state.score;
  els.finalWave.textContent = state.wave;
  els.finalCredits.textContent = earned;
  const ratingScore = state.wave * 8 + state.kills * 0.35 + state.maxCombo * 14 + state.perfectWaves * 10 + state.bossesDefeated * 18;
  const rating = ratingScore > 170 ? 'S' : ratingScore > 130 ? 'A' : ratingScore > 95 ? 'B' : ratingScore > 65 ? 'C' : 'D';
  els.runSummary.textContent = `Combat Rating: ${rating} • Kills: ${state.kills} • Bosses: ${state.bossesDefeated} • Best Combo: x${state.maxCombo.toFixed(1)} • Perfect Waves: ${state.perfectWaves} • Shards: ${state.totalShardsCollected}`;
}

function togglePause(force = null) {
  if (state.screen !== 'game' || !els.upgradeScreen.classList.contains('hidden')) return;
  state.paused = force === null ? !state.paused : force;
  els.pauseScreen.classList.toggle('hidden', !state.paused);
}

function updateHud() {
  const p = state.player;
  if (!p) return;
  els.hpText.textContent = `${Math.ceil(p.hp)} / ${Math.ceil(p.maxHp)}`;
  els.burstText.textContent = p.burst >= 100 ? 'Ready' : `${Math.floor(p.burst)}%`;
  els.slashText.textContent = p.slashCooldown > 0 ? `${p.slashCooldown.toFixed(1)}s` : `${Math.floor(p.slash)}%`;
  els.hpBar.style.width = `${(p.hp / p.maxHp) * 100}%`;
  els.burstBar.style.width = `${p.burst}%`;
  els.slashBar.style.width = `${p.slash}%`;
  els.waveText.textContent = state.wave;
  els.scoreText.textContent = state.score;
  els.shardText.textContent = state.runShards;
  els.comboText.textContent = `x${state.combo.toFixed(1)}`;
  const boss = state.enemies.find(e => e.boss);
  els.bossHud.classList.toggle('hidden', !boss);
  if (boss) {
    els.bossName.textContent = bossNames[boss.tier];
    els.bossBar.style.width = `${(boss.hp / boss.maxHp) * 100}%`;
  }
}

function updatePlayer(dt) {
  const p = state.player;
  let ix = (input.keys['d'] || input.keys['arrowright'] ? 1 : 0) - (input.keys['a'] || input.keys['arrowleft'] ? 1 : 0);
  let iy = (input.keys['s'] || input.keys['arrowdown'] ? 1 : 0) - (input.keys['w'] || input.keys['arrowup'] ? 1 : 0);
  if (input.touchActive) { ix = input.moveX; iy = input.moveY; }
  const len = Math.hypot(ix, iy) || 1;
  p.x += (ix / len) * p.speed * dt;
  p.y += (iy / len) * p.speed * dt;
  p.x = clamp(p.x, 20, innerWidth - 20);
  p.y = clamp(p.y, 20, innerHeight - 20);
  p.invuln = Math.max(0, p.invuln - dt);
  p.hp = Math.min(p.maxHp, p.hp + p.regen * dt);
  p.burst = clamp(p.burst + dt * 4.5 * p.burstGain, 0, 100);
  if (p.slashCooldown > 0) p.slashCooldown -= dt;
  else p.slash = clamp(p.slash + dt * 8.5 * p.slashGain, 0, 100);
  p.trail.push({ x: p.x, y: p.y, life: 0.22 });
  if (p.trail.length > 16) p.trail.shift();
  p.trail.forEach(t => { t.life -= dt; });
  p.trail = p.trail.filter(t => t.life > 0);
  tryShoot(dt);
}

function updateBullets(dt) {
  for (const b of state.bullets) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
  }
  for (const b of state.bullets) {
    for (const e of state.enemies) {
      if (dist(b.x, b.y, e.x, e.y) < b.r + e.r) {
        const crit = Math.random() < state.player.critChance;
        const dmg = b.damage * (crit ? 1 + state.player.critDamage : 1);
        dealDamageToEnemy(e, dmg, crit);
        b.pierce -= 1;
        if (b.pierce < 0) b.life = 0;
        break;
      }
    }
  }
  state.bullets = state.bullets.filter(b => b.life > 0 && b.x > -40 && b.x < innerWidth + 40 && b.y > -40 && b.y < innerHeight + 40);
  state.enemies = state.enemies.filter(e => e.hp > 0);
}

function updateEnemyBullets(dt) {
  for (const b of state.enemyBullets) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (dist(b.x, b.y, state.player.x, state.player.y) < b.r + state.player.r) {
      b.life = 0;
      hurtPlayer(b.damage);
    }
  }
  state.enemyBullets = state.enemyBullets.filter(b => b.life > 0 && b.x > -50 && b.x < innerWidth + 50 && b.y > -50 && b.y < innerHeight + 50);
}

function updateEnemies(dt) {
  const p = state.player;
  state.spawnTimer -= dt;
  if (state.enemiesToSpawn > 0 && state.spawnTimer <= 0) {
    spawnEnemy();
    state.enemiesToSpawn -= 1;
    state.spawnTimer = Math.max(0.12, 0.58 - state.wave * 0.02);
  }

  for (const e of state.enemies) {
    e.flash -= dt;
    const ang = angleTo(e.x, e.y, p.x, p.y);
    if (e.boss) {
      const hpRatio = e.hp / e.maxHp;
      e.phase = hpRatio < 0.33 ? 3 : hpRatio < 0.66 ? 2 : 1;
      e.angle += dt * (0.8 + e.phase * 0.15);
      if (e.tier === 0) {
        e.dashTimer -= dt;
        e.x += Math.cos(ang) * e.speed * dt * 0.7;
        e.y += Math.sin(ang) * e.speed * dt * 0.7;
        if (e.dashTimer <= 0) {
          e.dashTimer = e.phase === 3 ? 0.8 : 1.2;
          const speed = e.phase === 3 ? 340 : 250;
          e.vx = Math.cos(ang) * speed;
          e.vy = Math.sin(ang) * speed;
          showToast('Boss phase dash');
        }
      } else if (e.tier === 1) {
        const desired = e.phase === 3 ? 150 : 220;
        e.x += Math.cos(ang + Math.sin(e.angle) * 0.8) * e.speed * dt * 0.65;
        e.y += Math.sin(ang + Math.sin(e.angle) * 0.8) * e.speed * dt * 0.65;
        const d = dist(e.x, e.y, p.x, p.y);
        if (d < desired) {
          e.x -= Math.cos(ang) * 80 * dt;
          e.y -= Math.sin(ang) * 80 * dt;
        }
      } else {
        e.x += Math.cos(e.angle) * 46 * dt;
        e.y += Math.sin(e.angle * 1.2) * 46 * dt;
        e.vx = Math.cos(ang) * 110;
        e.vy = Math.sin(ang) * 110;
      }
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.vx *= 0.94;
      e.vy *= 0.94;
      e.shotTimer -= dt;
      if (e.shotTimer <= 0) {
        e.shotTimer = e.phase === 3 ? 0.65 : 1.0;
        if (e.tier === 0) {
          for (let i = -1; i <= 1; i++) fireEnemyBullet(e.x, e.y, ang + i * 0.2, 240, 12, '#ff95ac');
        } else if (e.tier === 1) {
          for (let i = 0; i < (e.phase === 3 ? 10 : 6); i++) fireEnemyBullet(e.x, e.y, ang + (Math.PI * 2 * i) / (e.phase === 3 ? 10 : 6), 200, 10, '#ffd66b');
        } else {
          for (let i = -2; i <= 2; i++) fireEnemyBullet(e.x, e.y, ang + i * 0.16, 260, 10, '#c8a3ff');
        }
      }
    } else if (e.type === 'sniper') {
      const d = dist(e.x, e.y, p.x, p.y);
      if (d > 260) {
        e.x += Math.cos(ang) * e.speed * dt;
        e.y += Math.sin(ang) * e.speed * dt;
      } else if (d < 180) {
        e.x -= Math.cos(ang) * e.speed * dt;
        e.y -= Math.sin(ang) * e.speed * dt;
      }
      e.shotTimer -= dt;
      if (e.shotTimer <= 0) {
        e.shotTimer = 1.25;
        fireEnemyBullet(e.x, e.y, ang, 280, 9, '#ffd66b');
      }
    } else if (e.type === 'orbiter') {
      e.angle += dt * 2.1;
      const orbit = ang + Math.sin(e.angle) * 1.2;
      e.x += Math.cos(orbit) * e.speed * dt;
      e.y += Math.sin(orbit) * e.speed * dt;
    } else if (e.type === 'tank') {
      e.x += Math.cos(ang) * e.speed * dt;
      e.y += Math.sin(ang) * e.speed * dt;
    } else if (e.type === 'kamikaze') {
      e.speed += 32 * dt;
      e.x += Math.cos(ang) * e.speed * dt;
      e.y += Math.sin(ang) * e.speed * dt;
    } else {
      e.x += Math.cos(ang) * e.speed * dt;
      e.y += Math.sin(ang) * e.speed * dt;
    }

    if (dist(e.x, e.y, p.x, p.y) < e.r + p.r) {
      hurtPlayer(e.boss ? 20 : e.type === 'tank' ? 16 : e.type === 'kamikaze' ? 18 : 12);
      if (!e.boss) e.hp = 0;
    }
  }
  state.enemies = state.enemies.filter(e => e.hp > 0);
}

function updateDrops(dt) {
  const p = state.player;
  for (const d of state.drops) {
    d.life -= dt;
    d.vx *= 0.986;
    d.vy *= 0.986;
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    const dd = dist(d.x, d.y, p.x, p.y);
    if (dd < p.magnet) {
      const a = angleTo(d.x, d.y, p.x, p.y);
      d.vx += Math.cos(a) * 300 * dt;
      d.vy += Math.sin(a) * 300 * dt;
    }
    if (dd < p.r + d.r + 4) {
      state.runShards += d.value;
      state.totalShardsCollected += d.value;
      state.score += 3;
      d.life = 0;
      audio.shard();
    }
  }
  state.drops = state.drops.filter(d => d.life > 0);
}

function updateParticles(dt) {
  for (const p of state.particles) {
    p.life -= dt;
    p.x += (p.vx || 0) * dt;
    p.y += (p.vy || 0) * dt;
    if (p.vx) p.vx *= 0.98;
    if (p.vy) p.vy *= 0.98;
  }
  state.particles = state.particles.filter(p => p.life > 0);
  for (const f of state.flashes) f.life -= dt;
  state.flashes = state.flashes.filter(f => f.life > 0);
  for (const fx of state.slashFx) fx.life -= dt;
  state.slashFx = state.slashFx.filter(fx => fx.life > 0);
  state.bossIntroTimer = Math.max(0, state.bossIntroTimer - dt);
  state.screenShake = Math.max(0, state.screenShake - dt * 26);
  if (state.toastTimer > 0) {
    state.toastTimer -= dt;
    if (state.toastTimer <= 0) els.toast.classList.remove('show');
  }
  if (state.bannerTimer > 0) {
    state.bannerTimer -= dt;
    if (state.bannerTimer <= 0) els.waveBanner.classList.add('hidden');
  }
  if (state.comboTimer > 0) state.comboTimer -= dt;
  else state.combo = Math.max(1, state.combo - dt * 0.7);
}

function update(dt) {
  if (state.screen !== 'game' || state.paused) return;
  if (state.freezeTimer > 0) {
    state.freezeTimer = Math.max(0, state.freezeTimer - dt);
    updateParticles(dt);
    updateHud();
    return;
  }
  state.gameTime += dt;
  updatePlayer(dt);
  updateBullets(dt);
  updateEnemyBullets(dt);
  updateEnemies(dt);
  updateDrops(dt);
  updateParticles(dt);
  endWaveIfNeeded();
  checkAchievements();
  updateHud();
}

function drawBackground() {
  const grd = ctx.createRadialGradient(innerWidth / 2, innerHeight / 2, 120, innerWidth / 2, innerHeight / 2, innerWidth * 0.75);
  grd.addColorStop(0, 'rgba(32, 68, 116, 0.18)');
  grd.addColorStop(0.45, 'rgba(10, 22, 42, 0.1)');
  grd.addColorStop(1, 'rgba(5, 10, 18, 0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, innerWidth, innerHeight);
  ctx.strokeStyle = 'rgba(115,242,255,0.06)';
  ctx.lineWidth = 1;
  const cell = 46;
  const offset = (state.gameTime * 18) % cell;
  for (let x = -cell; x < innerWidth + cell; x += cell) {
    ctx.beginPath();
    ctx.moveTo(x + offset, 0);
    ctx.lineTo(x + offset, innerHeight);
    ctx.stroke();
  }
  for (let y = -cell; y < innerHeight + cell; y += cell) {
    ctx.beginPath();
    ctx.moveTo(0, y + offset);
    ctx.lineTo(innerWidth, y + offset);
    ctx.stroke();
  }
}

function drawPlayer() {
  const p = state.player;
  for (const t of p.trail) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(115,242,255,${t.life * 0.35})`;
    ctx.arc(t.x, t.y, 12 * t.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.facing + Math.PI / 2);
  ctx.globalAlpha = p.invuln > 0 ? 0.5 + Math.sin(state.gameTime * 24) * 0.25 : 1;
  ctx.beginPath();
  ctx.fillStyle = '#73f2ff';
  ctx.moveTo(0, -18);
  ctx.lineTo(12, 12);
  ctx.lineTo(0, 7);
  ctx.lineTo(-12, 12);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = '#ffffff';
  ctx.arc(0, 0, 5.4, 0, Math.PI * 2);
  ctx.fill();
  if (p.slash >= 100 && p.slashCooldown <= 0) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(176,124,255,${0.35 + Math.sin(state.gameTime * 8) * 0.18})`;
    ctx.lineWidth = 4;
    ctx.arc(0, 0, p.r + 14 + Math.sin(state.gameTime * 10) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (p.currentShield > 0) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,238,180,0.88)';
    ctx.lineWidth = 3;
    ctx.arc(0, 0, p.r + 9, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEnemy(e) {
  ctx.save();
  ctx.translate(e.x, e.y);
  if (e.type === 'orbiter' || e.boss) ctx.rotate(state.gameTime * 1.2 + e.x * 0.01);
  ctx.fillStyle = e.flash > 0 ? '#ffffff' : e.color;
  ctx.strokeStyle = 'rgba(255,255,255,0.24)';
  ctx.lineWidth = e.boss ? 4 : 2;
  if (e.boss) {
    star(6, e.r, e.r * 0.55);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = e.tier === 1 ? 'rgba(255, 214, 107, 0.22)' : e.tier === 2 ? 'rgba(176,124,255,0.22)' : 'rgba(255, 110, 143, 0.18)';
    ctx.lineWidth = 5;
    ctx.arc(0, 0, e.r + 14 + Math.sin(state.gameTime * 4) * 3, 0, Math.PI * 2);
    ctx.stroke();
  } else if (e.type === 'tank') {
    roundedPoly(6, e.r, 0.14);
    ctx.fill();
    ctx.stroke();
  } else if (e.type === 'sniper') {
    star(4, e.r, e.r * 0.45);
    ctx.fill();
    ctx.stroke();
  } else if (e.type === 'orbiter') {
    roundedPoly(5, e.r, 0.2);
    ctx.fill();
    ctx.stroke();
  } else if (e.type === 'kamikaze') {
    star(3, e.r, e.r * 0.42);
    ctx.fill();
    ctx.stroke();
  } else {
    roundedPoly(3, e.r, 0.1);
    ctx.fill();
    ctx.stroke();
  }
  if (e.hp < e.maxHp) {
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(-e.r, e.r + 8, e.r * 2, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-e.r, e.r + 8, (e.hp / e.maxHp) * e.r * 2, 4);
  }
  ctx.restore();
}

function drawBullets() {
  for (const b of state.bullets) {
    ctx.beginPath();
    ctx.fillStyle = b.crit ? '#fff2aa' : '#8afbff';
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const b of state.enemyBullets) {
    ctx.beginPath();
    ctx.fillStyle = b.color;
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDrops() {
  for (const d of state.drops) {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(state.gameTime * 5 + d.x * 0.02);
    ctx.fillStyle = '#ffd66b';
    star(4, 6, 3);
    ctx.fill();
    ctx.restore();
  }
}

function drawParticles() {
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life * 1.4);
    if (p.textMode) {
      ctx.fillStyle = p.color;
      ctx.font = '800 16px Inter, sans-serif';
      ctx.fillText(String(p.text), p.x, p.y);
    } else {
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  for (const fx of state.slashFx) {
    const alpha = fx.life / 0.28;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(226,197,255,${alpha * 0.95})`;
    ctx.lineWidth = fx.width * alpha;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fx.x1, fx.y1);
    ctx.lineTo(fx.x2, fx.y2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(115,242,255,${alpha * 0.5})`;
    ctx.lineWidth = fx.width * 0.34 * alpha;
    ctx.stroke();
    ctx.restore();
  }
  for (const f of state.flashes) {
    ctx.beginPath();
    ctx.strokeStyle = typeof f.color === 'string' && f.color.startsWith('rgba') ? f.color : f.color;
    ctx.globalAlpha = f.life * 3.2;
    ctx.lineWidth = 4;
    ctx.arc(f.x, f.y, f.r * (1 - f.life), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function drawArenaAccent() {
  const p = state.player;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(115,242,255,0.12)';
  ctx.lineWidth = 2;
  ctx.arc(0, 0, p.magnet, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function roundedPoly(points, radius, wobble) {
  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const a = (Math.PI * 2 * i) / points - Math.PI / 2;
    const r = radius * (1 + Math.sin(i * 3.4 + state.gameTime * 1.4) * wobble);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function star(points, outer, inner) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function render() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  drawBackground();
  if (state.screen === 'game' || state.screen === 'gameover') {
    ctx.save();
    const sx = state.screenShake ? rand(-state.screenShake, state.screenShake) : 0;
    const sy = state.screenShake ? rand(-state.screenShake, state.screenShake) : 0;
    ctx.translate(sx, sy);
    if (state.player) drawArenaAccent();
    drawDrops();
    drawBullets();
    state.enemies.forEach(drawEnemy);
    if (state.player) drawPlayer();
    drawParticles();
    ctx.restore();
    if (state.bossIntroTimer > 0) {
      const a = Math.min(1, state.bossIntroTimer / 1.2);
      ctx.save();
      ctx.fillStyle = `rgba(4, 7, 14, ${0.45 * a})`;
      ctx.fillRect(0, 0, innerWidth, innerHeight);
      ctx.textAlign = 'center';
      ctx.font = '800 18px Inter, sans-serif';
      ctx.fillStyle = `rgba(255, 214, 107, ${a})`;
      ctx.fillText('BOSS CONTACT', innerWidth / 2, innerHeight * 0.33);
      ctx.font = '900 48px Inter, sans-serif';
      ctx.fillStyle = `rgba(255,255,255, ${a})`;
      ctx.fillText(state.currentEvent.title, innerWidth / 2, innerHeight * 0.4);
      ctx.font = '600 18px Inter, sans-serif';
      ctx.fillStyle = `rgba(180, 195, 220, ${a})`;
      ctx.fillText('Break the phase pattern. Stay aggressive.', innerWidth / 2, innerHeight * 0.45);
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

window.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  input.keys[key] = true;
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) e.preventDefault();
  if (key === ' ' || key === 'spacebar') useBurst();
  if (key === 'shift') useSlash();
  if (key === 'p' || key === 'escape') togglePause();
});
window.addEventListener('keyup', e => { input.keys[e.key.toLowerCase()] = false; });
window.addEventListener('mousemove', e => { input.pointerX = e.clientX; input.pointerY = e.clientY; });

function setJoystick(clientX, clientY) {
  const rect = els.joystickZone.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let dx = clientX - cx;
  let dy = clientY - cy;
  const len = Math.hypot(dx, dy);
  const max = 34;
  if (len > max) {
    dx = (dx / len) * max;
    dy = (dy / len) * max;
  }
  els.joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  input.moveX = dx / max;
  input.moveY = dy / max;
}

function resetJoystick() {
  input.touchActive = false;
  input.moveX = 0;
  input.moveY = 0;
  els.joystickKnob.style.transform = 'translate(-50%, -50%)';
}

els.joystickZone.addEventListener('pointerdown', e => {
  input.touchActive = true;
  els.joystickZone.setPointerCapture(e.pointerId);
  setJoystick(e.clientX, e.clientY);
});
els.joystickZone.addEventListener('pointermove', e => { if (input.touchActive) setJoystick(e.clientX, e.clientY); });
els.joystickZone.addEventListener('pointerup', resetJoystick);
els.joystickZone.addEventListener('pointercancel', resetJoystick);
els.pulseBtn.addEventListener('click', useBurst);
els.slashBtn.addEventListener('click', useSlash);

els.startBtn.addEventListener('click', () => {
  audio.init();
  if (audio.ctx?.state === 'suspended') audio.ctx.resume();
  audio.select();
  resetRun();
});
els.retryBtn.addEventListener('click', () => { audio.select(); resetRun(); });
els.menuBtn.addEventListener('click', () => { audio.select(); goMenu(); });
els.howBtn.addEventListener('click', () => { audio.select(); els.howPanel.classList.remove('hidden'); });
els.closeHow.addEventListener('click', () => { audio.select(); els.howPanel.classList.add('hidden'); });
els.resumeBtn.addEventListener('click', () => { audio.select(); togglePause(false); });
els.pauseMenuBtn.addEventListener('click', () => { audio.select(); goMenu(); });
els.panelToggleUpgrades?.addEventListener('click', () => {
  audio.select();
  setDrawer(els.metaPanel.classList.contains('hidden') ? 'upgrades' : null);
});
els.panelToggleMilestones?.addEventListener('click', () => {
  audio.select();
  setDrawer(els.achievementPanel.classList.contains('hidden') ? 'milestones' : null);
});

(async function boot() {
  resize();
  await crazy.init();
  save = loadSave();
  renderMetaShop();
  renderAchievements();
  goMenu();
  requestAnimationFrame(loop);
})();
