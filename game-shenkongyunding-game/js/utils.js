// ============================================================
// utils.js — 数学工具 / 程序化贴图 / 补间系统 / 输入管理
// ============================================================
import * as THREE from 'three';

export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
/** 帧率无关阻尼，k 越大跟得越快 */
export const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
export const rand = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
export const angleLerp = (a, b, t) => {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return a + d * t;
};
export const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
export const easeOutElastic = t => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------- 程序化贴图 ----------------
export function makeGlowTexture(size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,255,255,.55)');
  grd.addColorStop(0.55, 'rgba(255,255,255,.16)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 柔和星云贴图：多层色斑 + 抖动 */
export function makeNebulaTexture(hex, seed = 1, size = 512) {
  const rnd = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const col = new THREE.Color(hex);
  const r = Math.round(col.r * 255), gg = Math.round(col.g * 255), b = Math.round(col.b * 255);
  g.clearRect(0, 0, size, size);
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) {
    const x = size * (0.25 + rnd() * 0.5);
    const y = size * (0.25 + rnd() * 0.5);
    const rad = size * (0.08 + rnd() * 0.3);
    const alpha = 0.05 + rnd() * 0.12;
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    const tone = rnd();
    const rr = tone < 0.3 ? Math.min(255, r + 60) : r;
    const rg = tone < 0.6 ? Math.min(255, gg + 40) : gg;
    const rb = tone < 0.85 ? Math.min(255, b + 70) : b;
    grd.addColorStop(0, `rgba(${rr},${rg},${rb},${alpha})`);
    grd.addColorStop(1, `rgba(${rr},${rg},${rb},0)`);
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
  }
  // 星点
  for (let i = 0; i < 240; i++) {
    const x = rnd() * size, y = rnd() * size;
    const a = 0.15 + rnd() * 0.7;
    g.fillStyle = `rgba(255,255,255,${a})`;
    const s = rnd() < 0.12 ? 1.8 : 0.9;
    g.fillRect(x, y, s, s);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 地面科技网格贴图 */
export function makeGridTexture(color = '#6ea8ff', size = 1024, cell = 64) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  g.clearRect(0, 0, size, size);
  g.strokeStyle = color;
  g.globalAlpha = 0.16;
  g.lineWidth = 1;
  for (let i = 0; i <= size; i += cell) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, size); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(size, i); g.stroke();
  }
  g.globalAlpha = 0.5;
  g.lineWidth = 2.5;
  g.strokeRect(2, 2, size - 4, size - 4);
  // 四角装饰
  g.globalAlpha = 0.8;
  const L = 90;
  g.lineWidth = 5;
  const corner = (x, y, sx, sy) => {
    g.beginPath(); g.moveTo(x + sx * L, y); g.lineTo(x, y); g.lineTo(x, y + sy * L); g.stroke();
  };
  corner(0, 0, 1, 1); corner(size, 0, -1, 1); corner(0, size, 1, -1); corner(size, size, -1, -1);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// ---------------- 补间系统 ----------------
const tweens = [];
export function tween(opts) {
  const tw = { t: 0, delay: opts.delay || 0, dur: opts.dur ?? 0.4, ease: opts.ease || easeOutCubic,
    from: {}, target: opts.target, keys: Object.keys(opts.to), to: opts.to,
    onUpdate: opts.onUpdate, onComplete: opts.onComplete };
  tw.keys.forEach(k => (tw.from[k] = opts.target[k]));
  tweens.push(tw);
  return tw;
}
export function updateTweens(dt) {
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i];
    if (tw.delay > 0) { tw.delay -= dt; continue; }
    tw.t += dt;
    const p = clamp(tw.t / tw.dur, 0, 1);
    const e = tw.ease(p);
    tw.keys.forEach(k => { tw.target[k] = lerp(tw.from[k], tw.to[k], e); });
    tw.onUpdate && tw.onUpdate(e);
    if (p >= 1) {
      tw.onComplete && tw.onComplete();
      tweens.splice(i, 1);
    }
  }
}
export function stopTweensOn(target) {
  for (let i = tweens.length - 1; i >= 0; i--) if (tweens[i].target === target) tweens.splice(i, 1);
}

// ---------------- 场景释放 ----------------
export function disposeScene(scene) {
  scene.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(m => {
        for (const key in m) {
          const v = m[key];
          if (v && v.isTexture) v.dispose();
        }
        m.dispose();
      });
    }
  });
  scene.clear();
}

// ---------------- 输入 ----------------
export class Input {
  constructor(dom) {
    this.dom = dom;
    this.keys = new Set();
    this.pressed = new Set();       // 本帧按下
    this.released = new Set();
    this.mouse = { x: 0, y: 0, down: [false, false, false], pressed: [false, false, false],
      dx: 0, dy: 0, wheel: 0, dragDX: 0, dragDY: 0, dragging: false };
    this.locked = false;
    this.enabled = false;
    this._bind();
  }
  _bind() {
    window.addEventListener('keydown', e => {
      if (!this.enabled) return;
      if (!this.keys.has(e.code)) this.pressed.add(e.code);
      this.keys.add(e.code);
      if (['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', e => { this.keys.delete(e.code); this.released.add(e.code); });
    document.addEventListener('pointerlockchange', () => { this.locked = document.pointerLockElement === this.dom; });
    this.dom.addEventListener('mousemove', e => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      if (this.locked) { this.mouse.dx += e.movementX; this.mouse.dy += e.movementY; }
      else if (this.mouse.down[0]) {
        this.mouse.dragging = true;
        this.mouse.dragDX += e.movementX; this.mouse.dragDY += e.movementY;
      }
    });
    this.dom.addEventListener('mousedown', e => {
      if (!this.enabled) return;
      const i = e.button;
      this.mouse.down[i] = true; this.mouse.pressed[i] = true;
      this._downX = e.clientX; this._downY = e.clientY; this._moved = 0;
    });
    window.addEventListener('mouseup', e => { this.mouse.down[e.button] = false; });
    this.dom.addEventListener('wheel', e => { this.mouse.wheel += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
    window.addEventListener('blur', () => { this.keys.clear(); this.mouse.down = [false, false, false]; });
    this.dom.addEventListener('contextmenu', e => e.preventDefault());
  }
  requestLock() { if (!this.locked) this.dom.requestPointerLock && this.dom.requestPointerLock(); }
  exitLock() { if (this.locked) document.exitPointerLock(); }
  /** 本帧结束时调用，清空边缘事件与增量 */
  endFrame() {
    this.pressed.clear(); this.released.clear();
    this.mouse.pressed = [false, false, false];
    this.mouse.dx = 0; this.mouse.dy = 0; this.mouse.wheel = 0;
    this.mouse.dragDX = 0; this.mouse.dragDY = 0;
    if (this.mouse.down[0] === false) this.mouse.dragging = false;
  }
  down(code) { return this.keys.has(code); }
  hit(code) { return this.pressed.has(code); }
}
