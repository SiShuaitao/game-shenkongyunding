// ============================================================
// effects.js — 粒子 / 剑气弧光 / 冲击波 / 残像 / 屏震 / 世界漂浮文字
// ============================================================
import * as THREE from 'three';
import { makeGlowTexture, rand, TAU, clamp, damp } from './utils.js';

let glowTex = null;

// ---------------- 粒子爆发（每次爆发独立 Points） ----------------
export class Burst {
  constructor(scene, o) {
    this.scene = scene;
    const n = o.count || 30;
    this.pos = new Float32Array(n * 3);
    this.col = new Float32Array(n * 3);
    this.vel = [];
    this.life = new Float32Array(n);
    this.maxLife = new Float32Array(n);
    const base = new THREE.Color(o.color || 0x88bbff);
    const p = o.pos || new THREE.Vector3();
    const dir = o.dir ? o.dir.clone().normalize() : null;
    const spread = o.spread ?? 1.0;
    const sp = o.speed || 6;
    for (let i = 0; i < n; i++) {
      this.pos[i * 3] = p.x + rand(-0.1, 0.1);
      this.pos[i * 3 + 1] = p.y + rand(-0.1, 0.1);
      this.pos[i * 3 + 2] = p.z + rand(-0.1, 0.1);
      let v;
      if (dir) {
        v = dir.clone().multiplyScalar(sp * rand(0.4, 1.2));
        v.x += rand(-1, 1) * spread * sp; v.y += rand(-1, 1) * spread * sp; v.z += rand(-1, 1) * spread * sp;
      } else {
        v = new THREE.Vector3(rand(-1, 1), rand(-0.3, 1), rand(-1, 1)).normalize().multiplyScalar(sp * rand(0.25, 1));
      }
      this.vel.push(v);
      const l = rand(0.3, 0.7) * (o.life || 1);
      this.life[i] = this.maxLife[i] = l;
      const c = base.clone();
      c.offsetHSL(rand(-0.03, 0.03), 0, rand(-0.1, 0.35));
      this.col[i * 3] = c.r; this.col[i * 3 + 1] = c.g; this.col[i * 3 + 2] = c.b;
    }
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.mat = new THREE.PointsMaterial({
      size: o.size || 0.5, map: glowTex, vertexColors: true,
      transparent: true, opacity: 1, depthWrite: false,
      blending: o.blending || THREE.AdditiveBlending, sizeAttenuation: true
    });
    this.points = new THREE.Points(this.geo, this.mat);
    this.points.frustumCulled = false;
    this.gravity = o.gravity ?? 0;
    this.drag = o.drag ?? 1.6;
    this.dead = false;
    scene.add(this.points);
  }
  update(dt) {
    let alive = 0;
    for (let i = 0; i < this.life.length; i++) {
      if (this.life[i] <= 0) continue;
      alive++;
      this.life[i] -= dt;
      const a = clamp(this.life[i] / this.maxLife[i], 0, 1);
      const v = this.vel[i];
      v.multiplyScalar(Math.max(0, 1 - this.drag * dt));
      v.y -= this.gravity * dt;
      this.pos[i * 3] += v.x * dt; this.pos[i * 3 + 1] += v.y * dt; this.pos[i * 3 + 2] += v.z * dt;
      this.col[i * 3] *= 0.985; this.col[i * 3 + 1] *= 0.985; this.col[i * 3 + 2] *= 0.985;
      void a;
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.color.needsUpdate = true;
    if (alive === 0) { this.dispose(); this.dead = true; }
  }
  dispose() {
    this.scene.remove(this.points); this.geo.dispose(); this.mat.dispose();
  }
}

// ---------------- 剑气弧光 / 冲击波 / 光柱 ----------------
function arcGeometry(span, inner, outer) {
  const seg = 22;
  const g = new THREE.RingGeometry(inner, outer, seg, 1, -span / 2, span);
  return g;
}

export class FX {
  constructor(scene) {
    this.scene = scene;
    if (!glowTex) glowTex = makeGlowTexture(128);
    this.items = [];
    this.lights = [];
    this.bursts = [];
  }
  burst(o) { const b = new Burst(this.scene, o); this.bursts.push(b); return b; }

  /** 弧形剑气，facing 为法向(面朝方向) */
  slash({ pos, facing, color = 0x9cc4ff, span = 2.2, radius = 2.6, dur = 0.28 }) {
    const geo = arcGeometry(span, radius * 0.55, radius);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(pos);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), facing.clone().normalize());
    m.quaternion.copy(q);
    m.rotateZ(rand(-0.4, 0.4));
    this.scene.add(m);
    this.items.push({ mesh: m, t: 0, dur, kind: 'slash', mat });
  }

  /** 地面扩散冲击波环 */
  ring({ pos, color = 0x6ea8ff, r0 = 0.4, r1 = 7, dur = 0.55, up = 0.08 }) {
    const geo = new THREE.RingGeometry(0.82, 1, 48);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.copy(pos); m.position.y += up;
    m.scale.setScalar(r0);
    this.scene.add(m);
    this.items.push({ mesh: m, t: 0, dur, kind: 'ring', r0, r1, mat });
  }

  /** 圆柱能量光柱 */
  pillar({ pos, color = 0xa98eff, radius = 1.2, height = 16, dur = 0.5 }) {
    const geo = new THREE.CylinderGeometry(radius, radius, height, 24, 1, true);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(pos); m.position.y += height / 2 - 0.2;
    this.scene.add(m);
    this.items.push({ mesh: m, t: 0, dur, kind: 'pillar', mat, height });
  }

  /** 敌人预警圈 */
  warnRing(pos, r, color = 0xff5e78, life = 0.7) {
    const geo = new THREE.RingGeometry(r * 0.86, r, 40);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.copy(pos); m.position.y = 0.06;
    this.scene.add(m);
    const item = { mesh: m, t: 0, dur: life, kind: 'warn', mat, r, follow: pos };
    this.items.push(item);
    return item;
  }
  removeWarn(item) {
    if (!item) return;
    this.scene.remove(item.mesh); item.mat.dispose(); item.mesh.geometry.dispose();
    const i = this.items.indexOf(item); if (i >= 0) this.items.splice(i, 1);
  }

  /** 瞬发闪光 */
  flash(pos, color = 0xffffff, intensity = 18, dist = 14, dur = 0.22) {
    const l = new THREE.PointLight(color, intensity, dist, 2);
    l.position.copy(pos);
    this.scene.add(l);
    this.lights.push({ l, t: 0, dur, i0: intensity });
  }

  /** 移动残影 */
  afterimage(root, pos, quat, color) {
    const g = root.clone(true);
    g.position.copy(pos); g.quaternion.copy(quat);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4,
      blending: THREE.AdditiveBlending, depthWrite: false });
    g.traverse(o => { if (o.isMesh) { o.material = mat; o.castShadow = false; o.receiveShadow = false; } });
    this.scene.add(g);
    this.items.push({ mesh: g, t: 0, dur: 0.42, kind: 'ghost', mat });
  }

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i]; it.t += dt;
      const p = clamp(it.t / it.dur, 0, 1);
      if (it.kind === 'slash') {
        const s = 0.5 + p * 1.05;
        it.mesh.scale.setScalar(s);
        it.mat.opacity = 0.95 * (1 - p);
      } else if (it.kind === 'ring') {
        it.mesh.scale.setScalar(it.r0 + (it.r1 - it.r0) * (1 - Math.pow(1 - p, 3)));
        it.mat.opacity = 0.9 * (1 - p);
      } else if (it.kind === 'warn') {
        const pulse = 0.5 + 0.5 * Math.sin(p * Math.PI * 5);
        it.mat.opacity = 0.15 + pulse * 0.5 * (1 - p * 0.3);
        it.mesh.scale.setScalar(1 + p * 0.08);
        it.mesh.position.x = it.follow.x; it.mesh.position.z = it.follow.z;
      } else if (it.kind === 'pillar') {
        it.mat.opacity = 0.55 * (1 - p) * (p < 0.15 ? p / 0.15 : 1);
        it.mesh.scale.set(1 + p * 0.5, 1, 1 + p * 0.5);
      } else if (it.kind === 'ghost') {
        it.mat.opacity = 0.4 * (1 - p);
        it.mesh.position.y += dt * 0.4;
      }
      if (p >= 1) {
        this.scene.remove(it.mesh);
        if (it.mesh.geometry) it.mesh.geometry.dispose();
        it.mat.dispose();
        this.items.splice(i, 1);
      }
    }
    for (let i = this.lights.length - 1; i >= 0; i--) {
      const o = this.lights[i]; o.t += dt;
      o.l.intensity = o.i0 * (1 - clamp(o.t / o.dur, 0, 1));
      if (o.t >= o.dur) { this.scene.remove(o.l); this.lights.splice(i, 1); }
    }
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      this.bursts[i].update(dt);
      if (this.bursts[i].dead) this.bursts.splice(i, 1);
    }
  }
  clear() {
    [...this.items].forEach(it => { this.scene.remove(it.mesh); if (it.mesh.geometry) it.mesh.geometry.dispose(); it.mat.dispose(); });
    this.items.length = 0;
    this.lights.forEach(o => this.scene.remove(o.l)); this.lights.length = 0;
    this.bursts.forEach(b => b.dispose()); this.bursts.length = 0;
  }
}

// ---------------- 屏幕震动 ----------------
export class Shake {
  constructor() { this.trauma = 0; this.time = 0; this.yaw = 0; }
  add(v) { this.trauma = clamp(this.trauma + v, 0, 1.4); }
  update(dt) {
    this.trauma = Math.max(0, this.trauma - dt * 1.6);
    this.time += dt;
    const s = this.trauma * this.trauma;
    this.off = new THREE.Vector3(
      Math.sin(this.time * 31) * 0.42 + Math.sin(this.time * 17) * 0.2,
      Math.cos(this.time * 27) * 0.32,
      Math.sin(this.time * 23) * 0.42 + Math.cos(this.time * 13) * 0.2
    ).multiplyScalar(s);
    this.yaw = Math.sin(this.time * 19) * 0.02 * s;
  }
}

// ---------------- DOM 世界漂浮文字 ----------------
export class FloatingTexts {
  constructor(layer) {
    this.layer = layer;
    this.items = [];
    this._v = new THREE.Vector3();
  }
  spawn(pos, text, cls = 'wt-normal', life = 0.95) {
    const el = document.createElement('div');
    el.className = 'world-text ' + cls;
    el.textContent = text;
    this.layer.appendChild(el);
    this.items.push({ el, pos: pos.clone(), t: 0, life, vy: 70 + Math.random() * 30, drift: rand(-20, 20) });
  }
  update(dt, cam) {
    const w = window.innerWidth, h = window.innerHeight;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i]; it.t += dt;
      if (it.t >= it.life) { it.el.remove(); this.items.splice(i, 1); continue; }
      this._v.copy(it.pos).project(cam);
      if (this._v.z > 1) { it.el.style.display = 'none'; continue; }
      it.el.style.display = '';
      const x = (this._v.x * 0.5 + 0.5) * w;
      const y = (-this._v.y * 0.5 + 0.5) * h - it.t * it.vy;
      const sc = clamp(1.6 - this._v.z * 0.6, 0.5, 1.5);
      it.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) scale(${sc})`;
      it.el.style.opacity = it.t < 0.12 ? it.t / 0.12 : 1 - Math.pow((it.t - 0.12) / (it.life - 0.12), 2);
      void it.drift;
    }
  }
  clear() { this.items.forEach(i => i.el.remove()); this.items.length = 0; }
}

// ---------------- 常用小工厂 ----------------
export function glowSprite(color = 0xffffff, scale = 1, opacity = 1) {
  const mat = new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity,
    blending: THREE.AdditiveBlending, depthWrite: false });
  const s = new THREE.Sprite(mat);
  s.scale.setScalar(scale);
  return s;
}

export function makeStarField(scene, { count = 2200, radius = 400, size = 1.4, tint = 0xffffff } = {}) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(radius * rand(0.55, 1));
    pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
    const t = Math.random();
    if (t < 0.12) c.set(0xffd9b0);
    else if (t < 0.32) c.set(0x9cc4ff);
    else if (t < 0.42) c.set(0xc9a8ff);
    else c.set(tint);
    const k = rand(0.45, 1);
    col[i * 3] = c.r * k; col[i * 3 + 1] = c.g * k; col[i * 3 + 2] = c.b * k;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size, map: glowTex, vertexColors: true, transparent: true,
    opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const p = new THREE.Points(geo, mat);
  p.frustumCulled = false;
  scene.add(p);
  return p;
}

export { damp, clamp };
