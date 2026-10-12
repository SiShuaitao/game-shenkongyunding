// ============================================================
// main.js — 深空云顶：流程总控（标题 / 星图 / 战斗 / 结算）
// ============================================================
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Input, updateTweens } from './utils.js';
import { AudioEngine } from './audio.js';
import { StarMap, MISSIONS } from './starmap.js';
import { Combat } from './combat.js';

const $ = id => document.getElementById(id);
const canvas = $('game-canvas');
const worldLayer = $('world-layer');

// 性能要点：后期管线（EffectComposer）下 MSAA 不生效，antialias 关闭省一档开销；
// preserveDrawingBuffer 会强制每帧 GPU→CPU 回拷，是掉帧大坑，必须去掉。
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
const BASE_PR = Math.min(devicePixelRatio, 1.5);
let quality = 1; // 自适应分辨率系数（1 / .85 / .7 / .55）
renderer.setPixelRatio(BASE_PR);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoft 视差极小但更贵
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const input = new Input(canvas);
input.enabled = true;
const audio = new AudioEngine();

let screen = null;       // 'boot' | 'map' | 'combat'
let map = null, combat = null;
let currentMission = null;
let switching = false;

const el = {
  boot: $('boot-screen'), mapHud: $('map-hud'), combatHud: $('combat-hud'),
  brief: $('brief-panel'), briefIdx: $('brief-index'), briefName: $('brief-name'),
  briefType: $('brief-type'), briefDesc: $('brief-desc'), briefEnemies: $('brief-enemies'),
  briefRewards: $('brief-rewards'), transition: $('transition'),
  pause: $('pause-overlay'), result: $('result-screen'),
  lockHint: $('lock-hint'),
  resultKicker: $('result-kicker'), resultTitle: $('result-title'),
  resultRank: $('result-rank'), resultTime: $('rs-time'), resultCombo: $('rs-combo'),
  resultKills: $('rs-kills'), resultDodge: $('rs-dodge'), resultDmg: $('rs-damage'),
  resultStyle: $('rs-style')
};

// ---------------- 后期工厂 ----------------
function makeComposer(bloom) {
  const scene = screen === 'map' ? map.scene : combat.scene;
  const cam = screen === 'map' ? map.cam : combat.cam;
  const c = new EffectComposer(renderer);
  c.addPass(new RenderPass(scene, cam));
  const b = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), bloom.str, bloom.r, bloom.t);
  c.addPass(b); c.addPass(new OutputPass());
  c.setSize(innerWidth, innerHeight);
  return c;
}

// ---------------- 屏幕切换 ----------------
function show(id, on) {
  [el.boot, el.mapHud, el.combatHud].forEach(s => s.classList.toggle('active', s.id === id));
  if (id !== 'combat-hud') { el.pause.classList.add('hidden'); el.pause.classList.remove('active'); }
}
function warp(cb) {
  const t = el.transition;
  t.classList.add('warp');
  setTimeout(() => { cb && cb(); }, 420);
  setTimeout(() => { t.classList.remove('warp'); t.classList.add('fade'); }, 620);
  setTimeout(() => t.classList.remove('fade'), 1050);
}
function fade(cb) {
  const t = el.transition;
  t.classList.add('fade');
  setTimeout(() => { cb && cb(); t.classList.remove('fade'); }, 470);
}

// ---------------- 进入星图 ----------------
function enterMap() {
  screen = 'map';
  map = new StarMap(renderer, { onSelect: selectMission });
  map.composer = makeComposer({ str: 1.15, r: .8, t: .1 });
  show('map-hud', true);
  audio.setMode('map');
}

// ---------------- 星图关卡选择 ----------------
function selectMission(m) {
  audio.uiClick();
  if (!m) { el.brief.classList.add('hidden'); map && map.unselect(); return; }
  el.briefIdx.textContent = m.index;
  el.briefName.textContent = m.name;
  el.briefType.textContent = m.type;
  el.briefDesc.textContent = m.desc;
  el.briefEnemies.innerHTML = m.chips.map((c, i) =>
    `<span class="be-chip ${m.chipTypes[i]}">${c}</span>`).join('');
  el.briefRewards.innerHTML = m.rewards.map(r => `<span>${r}</span>`).join('');
  el.brief.classList.remove('hidden');
}

function safeLock() { try { const r = canvas.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) {} }

function deploy() {
  const m = MISSIONS.find(x => x.id === map.selectedId) || MISSIONS[0];
  currentMission = m;
  audio.deploy();
  el.brief.classList.add('hidden');
  warp(() => {
    screen = 'combat';
    if (map) { map.composer.dispose(); map.dispose(); map = null; }
    show('combat-hud', true);
    combat = new Combat(renderer, m, worldLayer, audio, { onDone: showResult });
    combat.setComposer(makeComposer({ str: .95, r: .55, t: .16 }));
    safeLock();
  });
}

// ---------------- 暂停 ----------------
function openPause() {
  if (!combat || combat.ended) return;
  combat.setPaused(true);
  input.exitLock();
  el.pause.classList.remove('hidden'); el.pause.classList.add('active');
}
function closePause() {
  el.pause.classList.add('hidden'); el.pause.classList.remove('active');
  combat.setPaused(false);
  safeLock();
}

// ---------------- 结算 ----------------
function showResult(r) {
  switching = true; input.exitLock();
  document.exitPointerLock && document.exitPointerLock();
  el.pause.classList.add('hidden');
  el.result.classList.remove('hidden'); el.result.classList.add('active');
  el.resultKicker.textContent = r.win ? 'MISSION CLEAR' : 'MISSION FAILED';
  el.resultKicker.classList.toggle('fail', !r.win);
  el.resultTitle.textContent = r.win ? '作战完成' : '挑战失败';
  const rank = r.win ? r.rank : 'C';
  el.resultRank.textContent = rank;
  el.resultRank.className = 'result-rank rank' + rank;
  const mm = String(Math.floor(r.time / 60)).padStart(2, '0');
  const ss = String(Math.floor(r.time % 60)).padStart(2, '0');
  el.resultTime.textContent = `${mm}:${ss}`;
  el.resultCombo.textContent = r.maxCombo;
  el.resultKills.textContent = r.kills;
  el.resultDodge.textContent = r.perfects;
  el.resultDmg.textContent = Math.round(r.damage);
  el.resultStyle.textContent = r.rank;
  audio.setMode(r.win ? 'map' : 'map');
}
function retryMission() {
  el.result.classList.add('hidden'); el.result.classList.remove('active');
  warp(() => {
    if (combat) { combat.dispose(); combat = null; }
    combat = new Combat(renderer, currentMission, worldLayer, audio, { onDone: showResult });
    combat.setComposer(makeComposer({ str: .95, r: .55, t: .16 }));
    safeLock();
  });
}
function backToMap() {
  el.result.classList.add('hidden'); el.result.classList.remove('active');
  fade(() => {
    if (combat) { combat.dispose(); combat = null; }
    enterMap();
  });
}

// ---------------- 事件绑定 ----------------
$('btn-launch').addEventListener('click', () => {
  audio.init(); audio.setMuted(false); audio.uiClick();
  el.boot.classList.remove('active');
  warp(enterMap);
});
$('btn-deploy').addEventListener('click', deploy);
$('btn-brief-close').addEventListener('click', () => selectMission(null));
$('btn-map-sound').addEventListener('click', () => {
  const muted = !audio.muted; audio.setMuted(muted);
  $('btn-map-sound').style.color = muted ? '#5a6792' : '';
});
$('btn-pause').addEventListener('click', openPause);
$('btn-resume').addEventListener('click', () => { audio.uiClick(); closePause(); });
$('btn-restart').addEventListener('click', () => { audio.uiClick(); el.pause.classList.add('hidden'); retryMission(); });
$('btn-quit-map').addEventListener('click', () => {
  el.pause.classList.add('hidden');
  fade(() => {
    if (combat) { combat.dispose(); combat = null; }
    enterMap();
  });
});
$('btn-result-retry').addEventListener('click', retryMission);
$('btn-result-map').addEventListener('click', backToMap);

document.addEventListener('pointerlockchange', () => {
  if (screen !== 'combat' || !combat || switching) { switching = false; return; }
  if (!input.locked && !combat.paused && !combat.ended) openPause();
});

addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  if (map) { map.resize(); map.composer && map.composer.setSize(innerWidth, innerHeight); }
  if (combat) combat.resize();
});

// ---------------- 自适应分辨率 ----------------
let fpsAcc = 0, fpsN = 0;
function applyQuality() {
  renderer.setPixelRatio(BASE_PR * quality);
  if (map) { map.resize(); map.composer && map.composer.setSize(innerWidth, innerHeight); }
  if (combat) { combat.resize(); }
}
function tuneQuality(rdt) {
  fpsAcc += rdt; fpsN++;
  if (fpsAcc < 1.5) return;
  const fps = fpsN / fpsAcc;
  fpsAcc = 0; fpsN = 0;
  if (fps < 45 && quality > .55) { quality = Math.max(.55, quality - .15); applyQuality(); }
  else if (fps > 57 && quality < 1) { quality = Math.min(1, quality + .15); applyQuality(); }
}

// ---------------- 主循环 ----------------
let last = performance.now();
function frame(now) {
  const rdt = Math.min((now - last) / 1000, .05);
  last = now;
  try {
    updateTweens(rdt);
    tuneQuality(rdt);

    if (screen === 'map' && map) {
      if (input.mouse.pressed[0]) map.click(input);
      map.update(rdt, input);
      map.composer.render();
    } else if (screen === 'combat' && combat) {
      if (input.hit('KeyP') && !combat.ended) { combat.paused ? closePause() : openPause(); }
      if (input.mouse.pressed[0] && !input.locked && !combat.paused && !combat.ended) safeLock();
      combat.update(rdt, input);
      el.lockHint.classList.toggle('hidden', input.locked || combat.paused || combat.ended);
    }
  } catch (e) { console.error('[frame]', e); }
  input.endFrame();
}
// rAF 看门狗：正常环境由 rAF 驱动；若帧回调被环境挂起（>33ms 无帧）则由定时器补步
let lastFrameAt = performance.now();
function tick(now) { lastFrameAt = now; frame(now); requestAnimationFrame(tick); }
setInterval(() => { if (performance.now() - lastFrameAt > 33) tick(performance.now()); }, 16);
requestAnimationFrame(tick);
