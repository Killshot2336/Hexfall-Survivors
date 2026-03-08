const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const hud = document.getElementById('hud');
const home = document.getElementById('home');
const howPanel = document.getElementById('howPanel');
const upgradeScreen = document.getElementById('upgradeScreen');
const pauseScreen = document.getElementById('pauseScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const toastEl = document.getElementById('toast');

const hpText = document.getElementById('hpText');
const burstText = document.getElementById('burstText');
const hpBar = document.getElementById('hpBar');
const burstBar = document.getElementById('burstBar');
const waveText = document.getElementById('waveText');
const scoreText = document.getElementById('scoreText');
const shardText = document.getElementById('shardText');
const bestScoreEl = document.getElementById('bestScore');
const metaCreditsEl = document.getElementById('metaCredits');
const metaShopEl = document.getElementById('metaShop');
const achievementListEl = document.getElementById('achievementList');
const upgradeChoicesEl = document.getElementById('upgradeChoices');

const finalTitle = document.getElementById('finalTitle');
const finalScore = document.getElementById('finalScore');
const finalWave = document.getElementById('finalWave');
const finalCredits = document.getElementById('finalCredits');
const runSummary = document.getElementById('runSummary');

const startBtn = document.getElementById('startBtn');
const retryBtn = document.getElementById('retryBtn');
const menuBtn = document.getElementById('menuBtn');
const howBtn = document.getElementById('howBtn');
const closeHow = document.getElementById('closeHow');
const tabUpgrades = document.getElementById('tabUpgrades');
const tabMilestones = document.getElementById('tabMilestones');
const panelUpgrades = document.getElementById('panelUpgrades');
const panelMilestones = document.getElementById('panelMilestones');

const saveKey = 'voidline-rift-reaper-save-v2';
const legacySaveKeys = ['hexfall-survivors-save-v1'];

const achievementsData = [
  { id: 'first_blood', name: 'First Blood', desc: 'Destroy your first enemy.', check: s => s.kills >= 1 },
  { id: 'wave5', name: 'Staying Power', desc: 'Reach wave 5.', check: s => s.wave >= 5 },
  { id: 'wave10', name: 'Deep Run', desc: 'Reach wave 10.', check: s => s.wave >= 10 },
  { id: 'killer100', name: 'Geometry Graveyard', desc: 'Destroy 100 enemies in a run.', check: s => s.kills >= 100 },
  { id: 'collector250', name: 'Shard Hoarder', desc: 'Collect 250 shards in a run.', check: s => s.totalShardsCollected >= 250 },
  { id: 'untouched', name: 'Untouched', desc: 'Clear a wave without taking damage.', check: s => s.perfectWaves >= 1 },
];

const metaUpgrades = [
  { id: 'coreHull', name: 'Core Hull', desc: '+12 max HP per rank.', baseCost: 10, maxLevel: 5 },
  { id: 'gyroDrive', name: 'Gyro Drive', desc: '+4% move speed per rank.', baseCost: 12, maxLevel: 5 },
  { id: 'focusLens', name: 'Focus Lens', desc: '+6% damage per rank.', baseCost: 14, maxLevel: 5 },
  { id: 'salvage', name: 'Salvage Protocol', desc: '+1 starting shard per rank.', baseCost: 8, maxLevel: 8 },
];

const runUpgradePool = [
  { id: 'damage', name: 'Overclock', tag: 'Offense', desc: '+20% bullet damage.', apply: s => s.player.damage *= 1.2 },
  { id: 'speed', name: 'Impulse Drive', tag: 'Mobility', desc: '+12% move speed.', apply: s => s.player.speed *= 1.12 },
  { id: 'fireRate', name: 'Rapid Relay', tag: 'Offense', desc: '+15% fire rate.', apply: s => s.player.fireDelay *= 0.85 },
  { id: 'maxHp', name: 'Reinforced Shell', tag: 'Defense', desc: '+20 max HP and heal 20.', apply: s => { s.player.maxHp += 20; s.player.hp = Math.min(s.player.maxHp, s.player.hp + 20); } },
  { id: 'pierce', name: 'Phase Rounds', tag: 'Control', desc: 'Bullets pierce +1 enemy.', apply: s => s.player.pierce += 1 },
  { id: 'multi', name: 'Split Lattice', tag: 'Offense', desc: '+1 side projectile.', apply: s => s.player.multiShot = Math.min(2, s.player.multiShot + 1) },
  { id: 'magnet', name: 'Magnet Field', tag: 'Utility', desc: 'Increase shard pickup range.', apply: s => s.player.magnet += 26 },
  { id: 'crit', name: 'Critical Matrix', tag: 'Offense', desc: '+10% crit chance and +25% crit damage.', apply: s => { s.player.critChance += 0.10; s.player.critDamage += 0.25; } },
  { id: 'regen', name: 'Nano Repair', tag: 'Defense', desc: 'Regenerate 0.7 HP/sec.', apply: s => s.player.regen += 0.7 },
  { id: 'burst', name: 'Capacitor Banks', tag: 'Burst', desc: 'Overdrive charges 20% faster.', apply: s => s.player.burstGain *= 1.2 },
  { id: 'shield', name: 'Mirror Shield', tag: 'Defense', desc: 'Gain a 1-hit shield every wave.', apply: s => s.player.waveShield += 1 },
  { id: 'shards', name: 'Golden Fracture', tag: 'Economy', desc: 'Enemies drop more shards.', apply: s => s.player.shardBoost += 0.25 },
];

function loadSave() {
  try {
    let raw = localStorage.getItem(saveKey);
    if (!raw) {
      for (const legacyKey of legacySaveKeys) {
        raw = localStorage.getItem(legacyKey);
        if (raw) {
          localStorage.setItem(saveKey, raw);
          break;
        }
      }
    }
    if (!raw) throw new Error('empty');
    const data = JSON.parse(raw);
    return {
      bestScore: data.bestScore || 0,
      credits: data.credits || 0,
      meta: data.meta || {},
      achievements: data.achievements || {},
    };
  } catch {
    return { bestScore: 0, credits: 0, meta: {}, achievements: {} };
  }
}

let save = loadSave();

function writeSave() {
  localStorage.setItem(saveKey, JSON.stringify(save));
}

const state = {
  screen: 'menu',
  paused: false,
  gameTime: 0,
  screenShake: 0,
  particles: [],
  bullets: [],
  enemies: [],
  drops: [],
  flashes: [],
  keys: {},
  mouse: { x: 0, y: 0 },
  wave: 0,
  score: 0,
  kills: 0,
  runShards: 0,
  totalShardsCollected: 0,
  perfectWaves: 0,
  tookDamageThisWave: false,
  enemiesToSpawn: 0,
  waveCooldown: 0,
  spawnTimer: 0,
  toastTimer: 0,
  player: null,
};

const audio = {
  ctx: null,
  master: null,
  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.06;
    this.master.connect(this.ctx.destination);
  },
  beep({ freq = 440, duration = 0.08, type = 'sine', volume = 1, slide = 0 }) {
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
  noiseBurst(volume = 0.5, duration = 0.05) {
    if (!this.ctx) return;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 900;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start();
  },
  shoot() { this.beep({ freq: 720, slide: -180, duration: 0.06, type: 'triangle', volume: 0.18 }); },
  hit() { this.beep({ freq: 180, slide: -50, duration: 0.08, type: 'sawtooth', volume: 0.18 }); },
  kill() { this.beep({ freq: 240, slide: 280, duration: 0.09, type: 'square', volume: 0.16 }); },
  shard() { this.beep({ freq: 900, slide: 120, duration: 0.05, type: 'triangle', volume: 0.12 }); },
  select() { this.beep({ freq: 560, slide: 140, duration: 0.08, type: 'triangle', volume: 0.16 }); },
  burst() { this.noiseBurst(0.24, 0.12); this.beep({ freq: 90, slide: 700, duration: 0.22, type: 'sawtooth', volume: 0.16 }); },
};

function resize() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = innerWidth * ratio;
  canvas.height = innerHeight * ratio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
window.addEventListener('resize', resize);
resize();

function rand(min, max) { return Math.random() * (max - min) + min; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
function angleTo(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  state.toastTimer = 2.2;
}

function unlockAchievement(id) {
  if (save.achievements[id]) return;
  save.achievements[id] = true;
  writeSave();
  const item = achievementsData.find(a => a.id === id);
  if (item) showToast(`Achievement Unlocked — ${item.name}`);
  renderAchievements();
}

function checkAchievements() {
  for (const item of achievementsData) {
    if (!save.achievements[item.id] && item.check(state)) unlockAchievement(item.id);
  }
}

function metaLevel(id) {
  return save.meta[id] || 0;
}

function metaCost(upgrade) {
  return upgrade.baseCost + metaLevel(upgrade.id) * Math.ceil(upgrade.baseCost * 0.8);
}

function createPlayer() {
  const maxHp = 100 + metaLevel('coreHull') * 12;
  return {
    x: innerWidth / 2,
    y: innerHeight / 2,
    r: 14,
    speed: 230 * (1 + metaLevel('gyroDrive') * 0.04),
    hp: maxHp,
    maxHp,
    damage: 16 * (1 + metaLevel('focusLens') * 0.06),
    fireDelay: 0.26,
    fireTimer: 0,
    bulletSpeed: 560,
    pierce: 0,
    multiShot: 0,
    magnet: 70,
    critChance: 0.08,
    critDamage: 0.5,
    regen: 0,
    burst: 0,
    burstGain: 1,
    waveShield: 0,
    currentShield: 0,
    shardBoost: 0,
    invuln: 0,
    facing: 0,
    trail: [],
  };
}

function resetRun() {
  state.screen = 'game';
  state.paused = false;
  state.gameTime = 0;
  state.screenShake = 0;
  state.particles = [];
  state.bullets = [];
  state.enemies = [];
  state.drops = [];
  state.flashes = [];
  state.wave = 0;
  state.score = 0;
  state.kills = 0;
  state.runShards = metaLevel('salvage');
  state.totalShardsCollected = metaLevel('salvage');
  state.perfectWaves = 0;
  state.tookDamageThisWave = false;
  state.enemiesToSpawn = 0;
  state.waveCooldown = 0;
  state.spawnTimer = 0;
  state.player = createPlayer();
  home.classList.add('hidden');
  howPanel.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  upgradeScreen.classList.add('hidden');
  pauseScreen.classList.add('hidden');
  hud.classList.remove('hidden');
  beginNextWave();
  updateHud();
}

function renderMetaShop() {
  metaCreditsEl.textContent = save.credits;
  bestScoreEl.textContent = save.bestScore;
  metaShopEl.innerHTML = '';
  metaUpgrades.forEach(upgrade => {
    const level = metaLevel(upgrade.id);
    const cost = metaCost(upgrade);
    const canBuy = save.credits >= cost && level < upgrade.maxLevel;
    const item = document.createElement('div');
    item.className = 'shop-item';
    item.innerHTML = `
      <div class="shop-head">
        <div>
          <div class="name">${upgrade.name}</div>
          <div class="muted">${upgrade.desc}</div>
        </div>
        <div class="tag">Lv ${level}/${upgrade.maxLevel}</div>
      </div>
      <div class="shop-head">
        <div class="cost">${level >= upgrade.maxLevel ? 'MAXED' : `${cost} credits`}</div>
        <button class="btn ${canBuy ? 'primary' : ''}" ${canBuy ? '' : 'disabled'}>${level >= upgrade.maxLevel ? 'Complete' : 'Buy'}</button>
      </div>
    `;
    const button = item.querySelector('button');
    button.addEventListener('click', () => {
      if (!canBuy) return;
      audio.select();
      save.credits -= cost;
      save.meta[upgrade.id] = level + 1;
      writeSave();
      renderMetaShop();
    });
    metaShopEl.appendChild(item);
  });
}

function renderAchievements() {
  achievementListEl.innerHTML = '';
  achievementsData.forEach(item => {
    const done = !!save.achievements[item.id];
    const el = document.createElement('div');
    el.className = `achievement-item ${done ? 'done' : 'locked'}`;
    el.innerHTML = `
      <div class="shop-head">
        <div>
          <div class="name">${item.name}</div>
          <div class="muted">${item.desc}</div>
        </div>
        <div class="tag">${done ? 'Unlocked' : 'Locked'}</div>
      </div>
    `;
    achievementListEl.appendChild(el);
  });
}

function beginNextWave() {
  state.wave += 1;
  state.tookDamageThisWave = false;
  state.player.currentShield = state.player.waveShield;
  state.enemiesToSpawn = 7 + state.wave * 3;
  state.spawnTimer = 0.6;
  showToast(`Wave ${state.wave}`);
  audio.select();
}

function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  let x = 0;
  let y = 0;
  if (side === 0) { x = rand(-40, innerWidth + 40); y = -30; }
  if (side === 1) { x = innerWidth + 30; y = rand(-40, innerHeight + 40); }
  if (side === 2) { x = rand(-40, innerWidth + 40); y = innerHeight + 30; }
  if (side === 3) { x = -30; y = rand(-40, innerHeight + 40); }

  const roll = Math.random();
  let type = 'chaser';
  if (state.wave >= 3 && roll > 0.72) type = 'spinner';
  if (state.wave >= 5 && roll > 0.88) type = 'tank';

  const stats = {
    chaser: { r: 12, speed: 70 + state.wave * 5, hp: 24 + state.wave * 6, color: '#ff6d88', score: 10, shard: 1 },
    spinner: { r: 10, speed: 120 + state.wave * 6, hp: 18 + state.wave * 5, color: '#ffd66b', score: 14, shard: 2 },
    tank: { r: 18, speed: 48 + state.wave * 4, hp: 70 + state.wave * 16, color: '#b17cff', score: 24, shard: 3 },
  }[type];

  state.enemies.push({
    x, y, vx: 0, vy: 0,
    hp: stats.hp,
    maxHp: stats.hp,
    r: stats.r,
    speed: stats.speed,
    type,
    angle: Math.random() * Math.PI * 2,
    score: stats.score,
    shard: stats.shard,
    color: stats.color,
    flash: 0,
  });
}

function fireBullet(angle, damageScale = 1, sideOffset = 0) {
  const p = state.player;
  const px = p.x + Math.cos(angle + Math.PI / 2) * sideOffset;
  const py = p.y + Math.sin(angle + Math.PI / 2) * sideOffset;
  state.bullets.push({
    x: px,
    y: py,
    vx: Math.cos(angle) * p.bulletSpeed,
    vy: Math.sin(angle) * p.bulletSpeed,
    r: 4,
    life: 1.2,
    damage: p.damage * damageScale,
    pierce: p.pierce,
    crit: false,
  });
  audio.shoot();
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
  if (!target || p.fireTimer > 0) return;
  p.fireTimer = p.fireDelay;
  const angle = angleTo(p.x, p.y, target.x, target.y);
  p.facing = angle;
  fireBullet(angle, 1, 0);
  if (p.multiShot >= 1) fireBullet(angle - 0.12, 0.78, -8);
  if (p.multiShot >= 2) fireBullet(angle + 0.12, 0.78, 8);
}

function dealDamageToEnemy(enemy, bullet) {
  const p = state.player;
  const crit = Math.random() < p.critChance;
  const damage = bullet.damage * (crit ? 1 + p.critDamage : 1);
  enemy.hp -= damage;
  enemy.flash = 0.08;
  bullet.crit = crit;
  for (let i = 0; i < 5; i += 1) {
    state.particles.push({
      x: enemy.x, y: enemy.y,
      vx: rand(-80, 80), vy: rand(-80, 80),
      life: rand(0.2, 0.5),
      size: rand(2, 5),
      color: crit ? '#fff1a1' : enemy.color,
    });
  }
  if (enemy.hp <= 0) killEnemy(enemy);
}

function killEnemy(enemy) {
  state.kills += 1;
  state.score += enemy.score * state.wave;
  state.player.burst = Math.min(100, state.player.burst + 10 * state.player.burstGain + (enemy.type === 'tank' ? 6 : 0));
  const shardCount = Math.max(1, Math.round(enemy.shard * (1 + state.player.shardBoost)));
  for (let i = 0; i < shardCount; i += 1) {
    state.drops.push({
      x: enemy.x + rand(-6, 6),
      y: enemy.y + rand(-6, 6),
      vx: rand(-35, 35),
      vy: rand(-35, 35),
      r: 5,
      value: 1,
      life: 10,
    });
  }
  for (let i = 0; i < 14; i += 1) {
    state.particles.push({
      x: enemy.x, y: enemy.y,
      vx: rand(-160, 160), vy: rand(-160, 160),
      life: rand(0.3, 0.9),
      size: rand(2, 6),
      color: enemy.color,
    });
  }
  state.flashes.push({ x: enemy.x, y: enemy.y, r: enemy.r * 2.8, life: 0.16, color: enemy.color });
  state.screenShake = Math.max(state.screenShake, enemy.type === 'tank' ? 8 : 4);
  audio.kill();
  checkAchievements();
}

function hurtPlayer(amount) {
  const p = state.player;
  if (p.invuln > 0) return;
  if (p.currentShield > 0) {
    p.currentShield -= 1;
    p.invuln = 0.5;
    showToast('Shield absorbed impact');
    audio.select();
    return;
  }
  p.hp -= amount;
  p.invuln = 0.6;
  state.tookDamageThisWave = true;
  state.screenShake = Math.max(state.screenShake, 10);
  audio.hit();
  for (let i = 0; i < 18; i += 1) {
    state.particles.push({ x: p.x, y: p.y, vx: rand(-220, 220), vy: rand(-220, 220), life: rand(0.3, 0.8), size: rand(2, 6), color: '#ff97ad' });
  }
  if (p.hp <= 0) endRun(false);
}

function useBurst() {
  const p = state.player;
  if (p.burst < 100 || state.screen !== 'game' || state.paused) return;
  p.burst = 0;
  audio.burst();
  state.flashes.push({ x: p.x, y: p.y, r: 260, life: 0.32, color: '#fff4b8' });
  state.screenShake = 18;
  for (const enemy of state.enemies) enemy.hp -= 44 + state.wave * 2;
  state.enemies = state.enemies.filter(enemy => {
    if (enemy.hp <= 0) { killEnemy(enemy); return false; }
    return true;
  });
}

function spawnUpgradeChoices() {
  const options = [];
  const used = new Set();
  while (options.length < 3) {
    const upgrade = pick(runUpgradePool);
    if (used.has(upgrade.id)) continue;
    used.add(upgrade.id);
    options.push(upgrade);
  }

  upgradeChoicesEl.innerHTML = '';
  options.forEach(upgrade => {
    const item = document.createElement('button');
    item.className = 'upgrade-item';
    item.innerHTML = `
      <div class="upgrade-head">
        <div class="name">${upgrade.name}</div>
        <div class="tag">${upgrade.tag}</div>
      </div>
      <p>${upgrade.desc}</p>
    `;
    item.addEventListener('click', () => {
      audio.select();
      upgrade.apply(state);
      upgradeScreen.classList.add('hidden');
      state.paused = false;
      beginNextWave();
      updateHud();
    });
    upgradeChoicesEl.appendChild(item);
  });
  upgradeScreen.classList.remove('hidden');
  state.paused = true;
}

function endWaveIfNeeded() {
  if (state.enemies.length === 0 && state.enemiesToSpawn <= 0) {
    if (!state.tookDamageThisWave) state.perfectWaves += 1;
    state.score += 40 * state.wave;
    checkAchievements();
    if (state.wave >= 12) {
      endRun(true);
    } else {
      spawnUpgradeChoices();
    }
  }
}

function endRun(victory) {
  state.screen = 'gameover';
  hud.classList.add('hidden');
  upgradeScreen.classList.add('hidden');
  pauseScreen.classList.add('hidden');
  gameOverScreen.classList.remove('hidden');
  const earned = Math.floor(state.score / 180) + state.wave * 3 + Math.floor(state.totalShardsCollected / 12) + (victory ? 30 : 0);
  save.credits += earned;
  save.bestScore = Math.max(save.bestScore, state.score);
  writeSave();
  renderMetaShop();
  renderAchievements();
  finalTitle.textContent = victory ? 'Sector Purged' : 'Systems Failure';
  finalScore.textContent = state.score;
  finalWave.textContent = state.wave;
  finalCredits.textContent = earned;
  runSummary.textContent = `Kills: ${state.kills} • Shards Collected: ${state.totalShardsCollected} • Perfect Waves: ${state.perfectWaves}`;
}

function togglePause() {
  if (state.screen !== 'game' || upgradeScreen.classList.contains('hidden') === false) return;
  state.paused = !state.paused;
  pauseScreen.classList.toggle('hidden', !state.paused);
}

function updateHud() {
  const p = state.player;
  if (!p) return;
  hpText.textContent = `${Math.ceil(p.hp)} / ${Math.ceil(p.maxHp)}`;
  burstText.textContent = p.burst >= 100 ? 'Ready' : `${Math.floor(p.burst)}%`;
  hpBar.style.width = `${(p.hp / p.maxHp) * 100}%`;
  burstBar.style.width = `${p.burst}%`;
  waveText.textContent = state.wave;
  scoreText.textContent = state.score;
  shardText.textContent = state.runShards;
}

function updatePlayer(dt) {
  const p = state.player;
  const inputX = (state.keys['d'] || state.keys['arrowright'] ? 1 : 0) - (state.keys['a'] || state.keys['arrowleft'] ? 1 : 0);
  const inputY = (state.keys['s'] || state.keys['arrowdown'] ? 1 : 0) - (state.keys['w'] || state.keys['arrowup'] ? 1 : 0);
  const len = Math.hypot(inputX, inputY) || 1;
  p.x += (inputX / len) * p.speed * dt;
  p.y += (inputY / len) * p.speed * dt;
  p.x = clamp(p.x, 20, innerWidth - 20);
  p.y = clamp(p.y, 20, innerHeight - 20);
  p.invuln -= dt;
  p.hp = Math.min(p.maxHp, p.hp + p.regen * dt);
  p.trail.push({ x: p.x, y: p.y, life: 0.25 });
  if (p.trail.length > 14) p.trail.shift();
  p.trail.forEach(t => { t.life -= dt; });
  p.trail = p.trail.filter(t => t.life > 0);
  tryShoot(dt);
}

function updateBullets(dt) {
  for (const bullet of state.bullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
  }
  for (const bullet of state.bullets) {
    for (const enemy of state.enemies) {
      if (dist(bullet.x, bullet.y, enemy.x, enemy.y) < bullet.r + enemy.r) {
        dealDamageToEnemy(enemy, bullet);
        bullet.pierce -= 1;
        if (bullet.pierce < 0) bullet.life = 0;
        break;
      }
    }
  }
  state.bullets = state.bullets.filter(b => b.life > 0 && b.x > -40 && b.x < innerWidth + 40 && b.y > -40 && b.y < innerHeight + 40);
  state.enemies = state.enemies.filter(e => e.hp > 0);
}

function updateEnemies(dt) {
  const p = state.player;
  state.spawnTimer -= dt;
  if (state.enemiesToSpawn > 0 && state.spawnTimer <= 0) {
    spawnEnemy();
    state.enemiesToSpawn -= 1;
    state.spawnTimer = Math.max(0.14, 0.62 - state.wave * 0.025);
  }

  for (const enemy of state.enemies) {
    enemy.flash -= dt;
    if (enemy.type === 'spinner') {
      enemy.angle += 2.4 * dt;
      const targetAngle = angleTo(enemy.x, enemy.y, p.x, p.y);
      enemy.vx = Math.cos(targetAngle + Math.sin(enemy.angle) * 0.8) * enemy.speed;
      enemy.vy = Math.sin(targetAngle + Math.sin(enemy.angle) * 0.8) * enemy.speed;
    } else {
      const a = angleTo(enemy.x, enemy.y, p.x, p.y);
      enemy.vx = Math.cos(a) * enemy.speed;
      enemy.vy = Math.sin(a) * enemy.speed;
    }
    enemy.x += enemy.vx * dt;
    enemy.y += enemy.vy * dt;

    if (dist(enemy.x, enemy.y, p.x, p.y) < enemy.r + p.r) {
      hurtPlayer(enemy.type === 'tank' ? 18 : enemy.type === 'spinner' ? 10 : 14);
      enemy.hp = 0;
      for (let i = 0; i < 10; i += 1) {
        state.particles.push({ x: enemy.x, y: enemy.y, vx: rand(-100, 100), vy: rand(-100, 100), life: rand(0.2, 0.6), size: rand(2, 5), color: enemy.color });
      }
    }
  }
  state.enemies = state.enemies.filter(e => e.hp > 0);
}

function updateDrops(dt) {
  const p = state.player;
  for (const drop of state.drops) {
    drop.life -= dt;
    drop.vx *= 0.985;
    drop.vy *= 0.985;
    drop.x += drop.vx * dt;
    drop.y += drop.vy * dt;
    const d = dist(drop.x, drop.y, p.x, p.y);
    if (d < p.magnet) {
      const a = angleTo(drop.x, drop.y, p.x, p.y);
      drop.vx += Math.cos(a) * 280 * dt;
      drop.vy += Math.sin(a) * 280 * dt;
    }
    if (d < p.r + drop.r + 4) {
      state.runShards += drop.value;
      state.totalShardsCollected += drop.value;
      state.score += 3;
      drop.life = 0;
      audio.shard();
    }
  }
  state.drops = state.drops.filter(d => d.life > 0);
}

function updateParticles(dt) {
  for (const p of state.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.98;
    p.vy *= 0.98;
  }
  state.particles = state.particles.filter(p => p.life > 0);
  for (const f of state.flashes) f.life -= dt;
  state.flashes = state.flashes.filter(f => f.life > 0);
  state.screenShake = Math.max(0, state.screenShake - dt * 26);
  if (state.toastTimer > 0) {
    state.toastTimer -= dt;
    if (state.toastTimer <= 0) toastEl.classList.remove('show');
  }
}

function update(dt) {
  if (state.screen !== 'game' || state.paused) return;
  state.gameTime += dt;
  updatePlayer(dt);
  updateBullets(dt);
  updateEnemies(dt);
  updateDrops(dt);
  updateParticles(dt);
  endWaveIfNeeded();
  checkAchievements();
  updateHud();
}

function drawBackground() {
  const grd = ctx.createRadialGradient(innerWidth / 2, innerHeight / 2, 100, innerWidth / 2, innerHeight / 2, innerWidth * 0.65);
  grd.addColorStop(0, 'rgba(34, 72, 120, 0.18)');
  grd.addColorStop(0.4, 'rgba(10, 22, 42, 0.12)');
  grd.addColorStop(1, 'rgba(5, 10, 18, 0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  ctx.save();
  ctx.strokeStyle = 'rgba(106, 240, 255, 0.08)';
  ctx.lineWidth = 1;
  const cell = 48;
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
  ctx.restore();
}

function drawPlayer() {
  const p = state.player;
  p.trail.forEach(t => {
    ctx.beginPath();
    ctx.fillStyle = `rgba(106,240,255,${t.life * 0.35})`;
    ctx.arc(t.x, t.y, 10 * t.life, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.facing + Math.PI / 2);
  ctx.globalAlpha = p.invuln > 0 ? 0.45 + Math.sin(state.gameTime * 28) * 0.25 : 1;

  ctx.beginPath();
  ctx.fillStyle = '#6af0ff';
  ctx.moveTo(0, -18);
  ctx.lineTo(12, 12);
  ctx.lineTo(0, 7);
  ctx.lineTo(-12, 12);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
  ctx.fill();

  if (p.currentShield > 0) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 244, 184, 0.88)';
    ctx.lineWidth = 3;
    ctx.arc(0, 0, p.r + 9, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawEnemies() {
  for (const enemy of state.enemies) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    if (enemy.type === 'spinner') ctx.rotate(state.gameTime * 2.4 + enemy.x * 0.01);
    ctx.fillStyle = enemy.flash > 0 ? '#ffffff' : enemy.color;
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 2;

    if (enemy.type === 'tank') {
      roundedPoly(6, enemy.r, 0.22);
    } else if (enemy.type === 'spinner') {
      star(4, enemy.r, enemy.r * 0.45);
    } else {
      roundedPoly(3, enemy.r, 0.1);
    }
    ctx.fill();
    ctx.stroke();

    if (enemy.hp < enemy.maxHp) {
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.fillRect(-enemy.r, enemy.r + 8, enemy.r * 2, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-enemy.r, enemy.r + 8, (enemy.hp / enemy.maxHp) * enemy.r * 2, 4);
    }
    ctx.restore();
  }
}

function roundedPoly(points, radius, wobble) {
  ctx.beginPath();
  for (let i = 0; i < points; i += 1) {
    const a = (Math.PI * 2 * i) / points - Math.PI / 2;
    const r = radius * (1 + Math.sin(i * 3.7 + state.gameTime * 1.5) * wobble);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function star(points, outer, inner) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawBullets() {
  for (const bullet of state.bullets) {
    ctx.beginPath();
    ctx.fillStyle = bullet.crit ? '#fff2aa' : '#8afbff';
    ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDrops() {
  for (const drop of state.drops) {
    ctx.save();
    ctx.translate(drop.x, drop.y);
    ctx.rotate(state.gameTime * 6 + drop.x * 0.02);
    ctx.fillStyle = '#ffd66b';
    star(4, 6, 3);
    ctx.fill();
    ctx.restore();
  }
}

function drawParticles() {
  for (const p of state.particles) {
    ctx.beginPath();
    ctx.fillStyle = p.color.replace(')', `, ${Math.min(1, p.life)})`).includes('rgba') ? p.color : p.color;
    if (!String(ctx.fillStyle).startsWith('rgba')) ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.life * 1.4);
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  for (const f of state.flashes) {
    ctx.beginPath();
    ctx.strokeStyle = f.color;
    ctx.globalAlpha = f.life * 3;
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
  ctx.strokeStyle = 'rgba(106,240,255,0.15)';
  ctx.lineWidth = 2;
  ctx.arc(0, 0, p.magnet, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  drawBackground();

  if (state.screen === 'game' || state.screen === 'gameover') {
    ctx.save();
    const shakeX = state.screenShake ? rand(-state.screenShake, state.screenShake) : 0;
    const shakeY = state.screenShake ? rand(-state.screenShake, state.screenShake) : 0;
    ctx.translate(shakeX, shakeY);
    drawArenaAccent();
    drawDrops();
    drawBullets();
    drawEnemies();
    if (state.player) drawPlayer();
    drawParticles();
    ctx.restore();
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
requestAnimationFrame(loop);

window.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  state.keys[key] = true;
  if (key === ' ' || key === 'spacebar') {
    e.preventDefault();
    useBurst();
  }
  if (key === 'p') togglePause();
});
window.addEventListener('keyup', e => {
  state.keys[e.key.toLowerCase()] = false;
});
window.addEventListener('mousemove', e => {
  state.mouse.x = e.clientX;
  state.mouse.y = e.clientY;
});


function setHomeTab(tab) {
  const showUpgrades = tab === 'upgrades';
  tabUpgrades.classList.toggle('active', showUpgrades);
  tabMilestones.classList.toggle('active', !showUpgrades);
  tabUpgrades.setAttribute('aria-selected', showUpgrades ? 'true' : 'false');
  tabMilestones.setAttribute('aria-selected', showUpgrades ? 'false' : 'true');
  panelUpgrades.classList.toggle('hidden', !showUpgrades);
  panelMilestones.classList.toggle('hidden', showUpgrades);
}

function goMenu() {
  state.screen = 'menu';
  hud.classList.add('hidden');
  home.classList.remove('hidden');
  gameOverScreen.classList.add('hidden');
  pauseScreen.classList.add('hidden');
  upgradeScreen.classList.add('hidden');
  renderMetaShop();
  renderAchievements();
}

startBtn.addEventListener('click', () => {
  audio.init();
  if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
  audio.select();
  resetRun();
});
retryBtn.addEventListener('click', () => {
  audio.select();
  resetRun();
});
menuBtn.addEventListener('click', () => {
  audio.select();
  goMenu();
});
howBtn.addEventListener('click', () => {
  audio.select();
  howPanel.classList.remove('hidden');
});
tabUpgrades.addEventListener('click', () => { audio.select(); setHomeTab('upgrades'); });
tabMilestones.addEventListener('click', () => { audio.select(); setHomeTab('milestones'); });
closeHow.addEventListener('click', () => {
  audio.select();
  howPanel.classList.add('hidden');
});

renderMetaShop();
renderAchievements();
setHomeTab('upgrades');
goMenu();
