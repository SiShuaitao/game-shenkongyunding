// ============================================================
// player.js — 可切换双角色：云顶近卫·岚（重剑）/ 风行射手·凛（星弓）
// 连段 / 极限闪避(i-frame) / EX 战技 / 终焉奥义 / 程序化动作
// ============================================================
import * as THREE from 'three';
import { clamp, damp, lerp, TAU } from './utils.js';

const SWINGS = [
  { dur: .42, act: .14, mult: .95, range: 3.4, arc: 2.3 },
  { dur: .44, act: .14, mult: 1.1, range: 3.6, arc: 2.7 },
  { dur: .66, act: .2, mult: 1.9, range: 4.1, arc: 4.4, finisher: true }
];
const SHOTS = [
  { dur: .3, act: .1, mult: .8, count: 1 },
  { dur: .32, act: .1, mult: .85, count: 1 },
  { dur: .5, act: .14, mult: 1.4, count: 3 }
];

function mesh(geo, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; }

// ---------------- 角色建模 ----------------
function buildRig(kind) {
  const pink = 0xff9ec8, teal = 0x8fe3c8;
  const accent = kind === 'sword' ? pink : teal;
  const armor = new THREE.MeshStandardMaterial({ color: kind === 'sword' ? 0xe8edff : 0xdff7ef, metalness: .55, roughness: .34 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x10162e, metalness: .7, roughness: .4 });
  const glow = new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 1.7, metalness: .3, roughness: .3 });

  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);
  const refs = { body, glowMats: [glow] };

  // 腿
  const legGeo = new THREE.BoxGeometry(.26, .92, .3);
  const legL = new THREE.Group(); legL.position.set(-.2, .96, 0);
  legL.add(mesh(legGeo, dark, 0, -.46, 0)); root.add(legL);
  const legR = new THREE.Group(); legR.position.set(.2, .96, 0);
  legR.add(mesh(legGeo, dark.clone(), 0, -.46, 0)); root.add(legR);
  refs.legL = legL; refs.legR = legR;

  // 躯干
  const torso = mesh(new THREE.BoxGeometry(.92, 1.05, .54), armor, 0, 1.5, 0);
  body.add(torso);
  const chest = mesh(new THREE.BoxGeometry(.5, .16, .06), glow, 0, 1.62, -.28);
  body.add(chest);
  const belt = mesh(new THREE.BoxGeometry(.96, .14, .58), dark, 0, .99, 0); body.add(belt);
  // 能量飘带
  const scarf = mesh(new THREE.PlaneGeometry(.34, 1.5),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: .5, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
    0, 1.35, .34);
  scarf.rotation.x = -0.2; body.add(scarf); refs.scarf = scarf;

  // 肩甲
  for (const s of [-1, 1]) {
    const pad = mesh(new THREE.SphereGeometry(.2, 10, 8), glow, s * .56, 1.86, 0);
    pad.scale.set(1, .7, 1.1); body.add(pad);
  }
  // 头 + 面甲
  const head = new THREE.Group(); head.position.y = 2.26; body.add(head);
  head.add(mesh(new THREE.BoxGeometry(.46, .44, .46), armor, 0, 0, 0));
  const visor = mesh(new THREE.BoxGeometry(.34, .09, .05), glow, 0, .03, -.24);
  head.add(visor);
  const crest = mesh(new THREE.BoxGeometry(.05, .24, .3), glow, 0, .3, 0); head.add(crest);
  refs.head = head;

  // 手臂
  const armGeo = new THREE.BoxGeometry(.2, .84, .22);
  const armR = new THREE.Group(); armR.position.set(.58, 1.78, 0);
  armR.add(mesh(armGeo, dark, 0, -.38, 0)); body.add(armR);
  const armL = new THREE.Group(); armL.position.set(-.58, 1.78, 0);
  armL.add(mesh(armGeo, dark.clone(), 0, -.38, 0)); body.add(armL);
  refs.armR = armR; refs.armL = armL;

  if (kind === 'sword') {
    // 星辉重剑
    const wpn = new THREE.Group(); wpn.position.set(0, -.78, -.06); armR.add(wpn);
    const blade = mesh(new THREE.BoxGeometry(.14, 1.9, .3),
      new THREE.MeshStandardMaterial({ color: 0xeaf2ff, emissive: 0xbcd6ff, emissiveIntensity: 1.2, metalness: .8, roughness: .18 }), 0, 1.0, 0);
    wpn.add(blade);
    const edgeL = mesh(new THREE.BoxGeometry(.03, 1.72, .04), glow, -.085, 1.0, -.16); wpn.add(edgeL);
    const edgeR = mesh(new THREE.BoxGeometry(.03, 1.72, .04), glow, .085, 1.0, -.16); wpn.add(edgeR);
    const tip = mesh(new THREE.ConeGeometry(.1, .26, 4), glow, 0, 2.06, 0); wpn.add(tip);
    wpn.add(mesh(new THREE.BoxGeometry(.2, .26, .14), dark, 0, .12, 0));
    wpn.add(mesh(new THREE.CylinderGeometry(.035, .035, .34, 8), dark, 0, -.02, 0));
    refs.weapon = wpn;
  } else {
    // 星辉弓
    const wpn = new THREE.Group(); wpn.position.set(0, -.5, -.1); armR.add(wpn);
    const arc = new THREE.Mesh(new THREE.TorusGeometry(.62, .05, 8, 28, Math.PI * 1.15), glow);
    arc.rotation.z = -Math.PI * 0.075; arc.position.y = .2; wpn.add(arc);
    const stringGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-.42, .2 + Math.sin(.075 * Math.PI) * .62, 0),
      new THREE.Vector3(.42, .2 + Math.sin(.075 * Math.PI) * .62, 0)]);
    const string = new THREE.Line(stringGeo, new THREE.LineBasicMaterial({ color: 0xcffff0, transparent: true, opacity: .9 }));
    wpn.add(string);
    refs.weapon = wpn; refs.string = string;
  }

  // 背部推进器
  for (const s of [-1, 1]) {
    const t = mesh(new THREE.BoxGeometry(.16, .3, .22), dark, s * .24, 1.5, .3);
    body.add(t);
    const flame = mesh(new THREE.CircleGeometry(.09, 12),
      new THREE.MeshBasicMaterial({ color: accent, blending: THREE.AdditiveBlending, transparent: true, opacity: .9, depthWrite: false }),
      s * .24, 1.36, .42);
    flame.rotation.x = Math.PI / 2; body.add(flame);
    refs.glowMats.push(flame.material);
  }

  root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
  refs.accent = accent;
  return { root, refs };
}

// ============================================================
export class Player {
  constructor(scene, kind, ctx) {
    this.kind = kind;
    this.ctx = ctx;
    const def = kind === 'sword'
      ? { name: '云顶近卫·岚', atk: 30, hp: 1200 }
      : { name: '风行射手·凛', atk: 34, hp: 950 };
    this.def = def;
    this.maxHp = def.hp; this.hp = def.hp; this.atk = def.atk;
    const { root, refs } = buildRig(kind);
    scene.add(root);
    this.root = root; this.r = refs;
    this.pos = root.position;
    this.yaw = 0;
    this.vel = new THREE.Vector3();
    this.state = 'idle'; this.t = 0; this.comboStep = 0; this.comboWindow = 0;
    this.buffer = 0;
    this.dashT = 0; this.dashDur = .28; this.dashCd = [0, 0, 0]; this.regenT = 0;
    this.invuln = 0; this.perfectT = 9; this.dashDir = new THREE.Vector3(0, 0, -1);
    this.swapCd = 0; this.hurtT = 0; this.airT = 0;
    this.runCycle = 0; this.swapIn = 0;
    this.alive = true;
    this.radius = 1.05;
  }

  get forward() { return new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)); }
  get invulnerable() { return this.invuln > 0 || this.state === 'ult' || this.state === 'ex' && this.t < .18; }
  get busy() { return this.state === 'attack' || this.state === 'ult' || this.state === 'ex'; }

  face(target, dt, rate = 14) {
    const d = target.clone().sub(this.pos); d.y = 0;
    if (d.lengthSq() > 0.001) {
      const want = Math.atan2(-d.x, -d.z);
      let diff = (want - this.yaw) % TAU;
      if (diff > Math.PI) diff -= TAU; if (diff < -Math.PI) diff += TAU;
      this.yaw += clamp(diff, -rate * dt, rate * dt);
    }
  }

  startDash(input, camYaw) {
    const ready = this.dashCd.findIndex(c => c <= 0);
    if (ready < 0 || this.state === 'dash' || this.state === 'ult' || this.state === 'dead') return false;
    let dir = new THREE.Vector3();
    const ix = (input.down('KeyD') ? 1 : 0) - (input.down('KeyA') ? 1 : 0);
    const iz = (input.down('KeyW') ? 1 : 0) - (input.down('KeyS') ? 1 : 0);
    if (ix || iz) {
      dir.set(ix, 0, -iz).applyAxisAngle(new THREE.Vector3(0, 1, 0), camYaw);
    } else dir.copy(this.forward);
    dir.normalize();
    this.dashDir.copy(dir);
    this.state = 'dash'; this.t = 0;
    this.dashCd[ready] = 1; this.regenT = 0;
    this.invuln = .42; this.perfectT = 0;
    this.vel.copy(dir).multiplyScalar(24);
    this.ctx.fx.afterimage(this.root, this.pos, this.root.quaternion, this.r.accent);
    this.ctx.audio.dash();
    return true;
  }

  tryAttack() {
    if (this.state === 'dead' || this.state === 'ult' || this.state === 'dash') return;
    this.buffer = .35;
  }

  _beginAttack() {
    const step = this.comboStep;
    this.state = 'attack'; this.t = 0; this.buffer = 0;
    this._cur = this.kind === 'sword' ? SWINGS[step] : SHOTS[step];
    this._step = step; this._didHit = false;
    this.comboStep = (step + 1) % 3;
    this.ctx.audio.swish();
  }

  _hitMoment() {
    const c = this._cur;
    if (this.kind === 'sword') {
      this.ctx.melee(this, { mult: c.mult, range: c.range, arc: c.arc, finisher: c.finisher });
      // 小前冲
      this.vel.addScaledVector(this.forward, c.finisher ? 9 : 3.2);
    } else {
      this.ctx.playerBolt(this, c.mult, c.count);
      // 后坐
      this.vel.addScaledVector(this.forward, -1.4);
    }
  }

  playEX() {
    if (this.state === 'dead' || this.state === 'ult') return;
    this.state = 'ex'; this.t = 0; this.exDur = .55;
    this.vel.addScaledVector(this.forward, this.kind === 'sword' ? 12 : 4);
  }
  playUlt() {
    this.state = 'ult'; this.t = 0; this.ultDur = 1.7;
    this.vel.multiplyScalar(0.2);
  }

  hurt(force, realDt) {
    if (this.state === 'dead' || this.state === 'ult') return;
    this.state = 'hurt'; this.t = 0; this.hurtT = .3;
    this.vel.copy(force || new THREE.Vector3()).multiplyScalar(7);
    this.invuln = Math.max(this.invuln, .85);
  }

  die() {
    this.state = 'dead'; this.alive = false;
    this.root.rotation.z = Math.PI / 2;
    this.root.position.y = .25;
  }

  update(dt, realDt, input, camYaw, aimPoint) {
    if (!this.alive) return;
    this.swapCd = Math.max(0, this.swapCd - realDt);
    this.invuln = Math.max(0, this.invuln - realDt);
    this.perfectT += realDt;
    this.swapIn = Math.max(0, this.swapIn - dt);
    for (let i = 0; i < 3; i++) { if (this.dashCd[i] > 0) { this.regenT += realDt; if (this.regenT >= .9) { this.dashCd[i] = 0; this.regenT = 0; } } }

    // 瞄准
    if (aimPoint) this.face(aimPoint, dt, 16);
    this.root.rotation.y = this.yaw;

    const accel = 12;
    const wish = new THREE.Vector3();
    const ix = (input.down('KeyD') ? 1 : 0) - (input.down('KeyA') ? 1 : 0);
    const iz = (input.down('KeyW') ? 1 : 0) - (input.down('KeyS') ? 1 : 0);
    if (ix || iz) wish.set(ix, 0, -iz).applyAxisAngle(new THREE.Vector3(0, 1, 0), camYaw).normalize();

    if (this.state === 'dash') {
      this.t += dt;
      this.vel.copy(this.dashDir).multiplyScalar(24 * (1 - this.t / this.dashDur * .55));
      if (Math.random() < dt * 26) this.ctx.fx.afterimage(this.root, this.pos, this.root.quaternion, this.r.accent);
      if (this.t >= this.dashDur) this.state = 'idle';
    } else if (this.state === 'attack') {
      this.t += dt;
      const c = this._cur;
      if (!this._didHit && this.t >= c.act) { this._didHit = true; this._hitMoment(); }
      // 攻击中缓行
      const move = wish.clone().multiplyScalar(2.6);
      this.vel.x = damp(this.vel.x, move.x, 8, dt); this.vel.z = damp(this.vel.z, move.z, 8, dt);
      this.vel.multiplyScalar(1 - 2.6 * dt);
      if (this.t >= c.dur) { this.state = 'idle'; this.comboWindow = 1.15; }
    } else if (this.state === 'ex') {
      this.t += dt;
      this.vel.multiplyScalar(1 - 6 * dt);
      if (this.t >= this.exDur) this.state = 'idle';
    } else if (this.state === 'ult') {
      this.t += dt;
      if (this.t >= this.ultDur) this.state = 'idle';
    } else if (this.state === 'hurt') {
      this.t += dt;
      this.vel.multiplyScalar(1 - 7 * dt);
      if (this.t >= .3) this.state = 'idle';
    } else {
      // 自由移动
      const target = wish.multiplyScalar(9.2);
      this.vel.x = damp(this.vel.x, target.x, accel, dt);
      this.vel.z = damp(this.vel.z, target.z, accel, dt);
      if (wish.lengthSq() > 0) this.face(this.pos.clone().add(wish), dt, 14);
      // 连击窗口 / 缓存输入
      this.comboWindow -= dt;
      if (this.comboWindow <= 0) this.comboStep = 0;
      if (this.buffer > 0) {
        this.buffer -= dt;
        if (this.buffer > 0 && (this.state === 'idle')) { this.buffer = 0; this._beginAttack(); }
      }
      if (this.state !== 'attack' && this.state !== 'dash') this.state = wish.lengthSq() > .01 ? 'run' : 'idle';
    }
    if (this.buffer > 0 && (this.state === 'idle' || this.state === 'run')) { this.buffer = 0; this._beginAttack(); }

    // 位移与场地约束
    this.pos.addScaledVector(this.vel, dt);
    const R = 30;
    const d = Math.hypot(this.pos.x, this.pos.z);
    if (d > R) { this.pos.x *= R / d; this.pos.z *= R / d; }
    this.pos.y = 0;

    this._animate(dt);
  }

  // ---------------- 程序化动作 ----------------
  _animate(dt) {
    const speed = Math.hypot(this.vel.x, this.vel.z);
    const b = this.r.body, armR = this.r.armR, armL = this.r.armL, legL = this.r.legL, legR = this.r.legR;
    // 复位
    b.position.y = damp(b.position.y, 0, 12, dt); b.rotation.set(0, 0, 0);
    this.r.weapon.rotation.set(0, 0, 0);
    armR.rotation.set(0, 0, 0); armL.rotation.set(0, 0, 0);
    this.r.head.rotation.set(damp(this.r.head.rotation.x, 0, 10, dt), 0, 0);

    if (this.state === 'run' || this.state === 'dash') {
      this.runCycle += dt * (this.state === 'dash' ? 22 : speed * 1.7);
      const s = Math.sin(this.runCycle), k = this.state === 'dash' ? .9 : .55;
      legL.rotation.x = s * k; legR.rotation.x = -s * k;
      armR.rotation.x = -s * .5; armL.rotation.x = s * .5;
      b.position.y = Math.abs(Math.sin(this.runCycle)) * .07;
      b.rotation.x = this.state === 'dash' ? -.28 : -.12;
    } else if (this.state === 'attack') {
      const p = clamp(this.t / this._cur.dur, 0, 1);
      legL.rotation.x = damp(legL.rotation.x, .16, 14, dt);
      legR.rotation.x = damp(legR.rotation.x, -.16, 14, dt);
      if (this.kind === 'sword') {
        if (this._step === 0) {
          const e = p < .4 ? p / .4 : 1 - (p - .4) / .6;
          armR.rotation.z = lerp(1.6, -1.4, clamp((p - .1) / .45, 0, 1));
          armR.rotation.x = -.5 * e; b.rotation.y = -0.35 * Math.sin(p * Math.PI);
        } else if (this._step === 1) {
          armR.rotation.z = lerp(-1.6, 1.3, clamp((p - .1) / .45, 0, 1));
          armR.rotation.x = -.4; b.rotation.y = 0.35 * Math.sin(p * Math.PI);
        } else {
          // 终结：举剑下劈 + 旋身
          armR.rotation.x = lerp(-2.3, .9, clamp((p - .22) / .5, 0, 1));
          b.rotation.y = p * Math.PI * 2;
        }
      } else {
        const draw = Math.sin(clamp(p / .5, 0, 1) * Math.PI);
        armL.rotation.x = -Math.PI / 2 - draw * .25; armL.position.x = -.58;
        armR.rotation.x = -Math.PI / 2 - draw * .2;
        if (this.r.string) this.r.string.scale.x = 1 - draw * .25;
      }
    } else if (this.state === 'ex') {
      const p = clamp(this.t / this.exDur, 0, 1);
      armR.rotation.x = -Math.PI * .9 * Math.sin(p * Math.PI);
      b.rotation.y = p * Math.PI;
      legL.rotation.x = .3; legR.rotation.x = -.3;
    } else if (this.state === 'ult') {
      const p = clamp(this.t / this.ultDur, 0, 1);
      const raise = p < .35 ? p / .35 : Math.max(0, 1 - (p - .35) / .3);
      armR.rotation.x = -2.5 * raise; armL.rotation.x = -2.2 * raise;
      b.position.y = raise * .35;
      this.r.glowMats.forEach((m, i) => { if (m.emissiveIntensity !== undefined) m.emissiveIntensity = 1.7 + Math.sin(p * 20 + i) * .6 + raise * 2; });
      b.rotation.y = p * Math.PI * 2;
    } else if (this.state === 'hurt') {
      b.rotation.z = .18 * Math.sin(this.t * 30);
      legL.rotation.x = -.3; legR.rotation.x = .3;
    } else {
      // idle 呼吸
      legL.rotation.x = damp(legL.rotation.x, 0, 10, dt);
      legR.rotation.x = damp(legR.rotation.x, 0, 10, dt);
      armR.rotation.x = damp(armR.rotation.x, 0, 10, dt);
      armL.rotation.x = damp(armL.rotation.x, 0, 10, dt);
      b.position.y = Math.sin(performance.now() * .0016) * .025;
    }
    // 非奥义时发光回稳
    if (this.state !== 'ult') this.r.glowMats.forEach((m, i) => { if (m.emissiveIntensity !== undefined && i === 0) m.emissiveIntensity = 1.7; });
    // 飘带
    this.r.scarf.rotation.x = -.2 + Math.sin(performance.now() * .003) * .08 + (speed > 2 ? -.45 : 0);
  }
}
