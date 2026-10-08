// ============================================================
// enemy.js — 星骸浮游体 / 星骸弩手 / 陨铁卫兵 / 深空灾兽·虚渊(Boss)
// ============================================================
import * as THREE from 'three';
import { clamp, damp, rand, pick, TAU } from './utils.js';

let ringTex = null;
function lockTexture() {
  if (ringTex) return ringTex;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  g.strokeStyle = 'rgba(255,255,255,1)'; g.lineWidth = 5;
  g.beginPath(); g.arc(32, 32, 24, 0, TAU); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2;
  g.beginPath(); g.arc(32, 32, 15, 0, TAU); g.stroke();
  ringTex = new THREE.CanvasTexture(c);
  return ringTex;
}

const DEFS = {
  drone:  { hp: 230, dmg: 26, speed: 7.6, scale: 1.3, hover: 1.7, color: 0xa98eff, name: '星骸浮游体' },
  ranger: { hp: 200, dmg: 22, speed: 5.4, scale: 1.22, hover: 1.9, color: 0x7fb6ff, name: '星骸弩手' },
  guard:  { hp: 640, dmg: 46, speed: 3.1, scale: 1.75, hover: 0, color: 0xffc978, name: '陨铁卫兵' },
  boss:   { hp: 2400, dmg: 62, speed: 4.2, scale: 2.9, hover: 2.8, color: 0xff9ec8, name: '深空灾兽·虚渊' }
};

// ---------------- 模型 ----------------
function buildDrone() {
  const g = new THREE.Group();
  const mats = [];
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(.72, 0),
    new THREE.MeshStandardMaterial({ color: 0x2a1f4a, emissive: 0xa98eff, emissiveIntensity: 1.4, roughness: .25, metalness: .3 }));
  g.add(core); mats.push(core.material);
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 0),
    new THREE.MeshStandardMaterial({ color: 0x1a2040, roughness: .3, metalness: .7, transparent: true, opacity: .55, emissive: 0x352a6a, emissiveIntensity: .5 }));
  g.add(shell);
  const shardMat = new THREE.MeshStandardMaterial({ color: 0x8fb0ff, emissive: 0x8fb0ff, emissiveIntensity: 1.2, metalness: .5, roughness: .3 });
  const shards = [];
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(.12, .5, .03), shardMat);
    const a = i / 3 * TAU;
    s.position.set(Math.cos(a) * 1.2, Math.sin(a * 1.7) * .3, Math.sin(a) * 1.2);
    s.rotation.z = a; g.add(s); shards.push(s);
  }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { g, mats, spin: shards };
}
function buildRanger() {
  const g = new THREE.Group(); const mats = [];
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(.5, .72, .8, 6),
    new THREE.MeshStandardMaterial({ color: 0x1c2c50, metalness: .75, roughness: .3, emissive: 0x2a5a9a, emissiveIntensity: .4 }));
  g.add(hull); mats.push(hull.material);
  const eye = new THREE.Mesh(new THREE.BoxGeometry(.5, .12, .1),
    new THREE.MeshStandardMaterial({ color: 0x9fd8ff, emissive: 0x7fb6ff, emissiveIntensity: 2.4 }));
  eye.position.set(0, .08, -.52); g.add(eye); mats.push(eye.material);
  const finMat = new THREE.MeshStandardMaterial({ color: 0x35507e, metalness: .7, roughness: .35 });
  for (const s of [-1, 1]) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(.08, .5, .7), finMat);
    fin.position.set(s * .55, 0, .1); fin.rotation.x = s * .5; g.add(fin);
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.62, .05, 8, 30),
    new THREE.MeshBasicMaterial({ color: 0x7fb6ff, transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false }));
  ring.rotation.x = Math.PI / 2; ring.position.y = -.42; g.add(ring);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { g, mats, extra: [ring] };
}
function buildGuard() {
  const g = new THREE.Group(); const mats = [];
  const armor = new THREE.MeshStandardMaterial({ color: 0x5a4626, metalness: .8, roughness: .34, emissive: 0x4a2e08, emissiveIntensity: .4 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x241c14, metalness: .7, roughness: .5 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.3, .8), armor);
  torso.position.y = 1.5; g.add(torso); mats.push(armor);
  const head = new THREE.Mesh(new THREE.BoxGeometry(.5, .42, .5), dark); head.position.y = 2.45; g.add(head);
  const eye = new THREE.Mesh(new THREE.BoxGeometry(.34, .07, .05),
    new THREE.MeshStandardMaterial({ color: 0xffd29e, emissive: 0xffaa55, emissiveIntensity: 2.6 }));
  eye.position.set(0, 2.46, -.26); g.add(eye); mats.push(eye.material);
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(.36, .9, .42), dark);
    leg.position.set(s * .32, .45, 0); g.add(leg);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(.28, .9, .28), armor);
    arm.position.set(s * .78, 1.5, 0); arm.rotation.z = s * .25; g.add(arm);
    const pad = new THREE.Mesh(new THREE.BoxGeometry(.44, .3, .5), armor); pad.position.set(s * .72, 2.1, 0); g.add(pad);
  }
  // 陨铁战锤
  const hammer = new THREE.Group(); hammer.position.set(.95, .9, -.1); hammer.rotation.set(.3, 0, -.7);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 1.5, 8), dark); shaft.position.y = .7; hammer.add(shaft);
  const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(.55, .4, .55),
    new THREE.MeshStandardMaterial({ color: 0x8a6a3a, metalness: .9, roughness: .25, emissive: 0xffaa55, emissiveIntensity: .7 }));
  hammerHead.position.y = 1.55; hammer.add(hammerHead); mats.push(hammerHead.material);
  g.add(hammer);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { g, mats, extra: [hammer] };
}
function buildBoss() {
  const g = new THREE.Group(); const mats = [];
  const coreMat = new THREE.MeshStandardMaterial({ color: 0xffe0ee, emissive: 0xff9ec8, emissiveIntensity: 2.2, roughness: .15, metalness: .4 });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), coreMat);
  g.add(core); mats.push(coreMat);
  const cageMat = new THREE.MeshStandardMaterial({ color: 0x3a1a3a, metalness: .8, roughness: .25, emissive: 0x6a2a55, emissiveIntensity: .8 });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.5, .22, 10, 40), cageMat); g.add(ring1);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.1, .12, 10, 40), cageMat); ring2.rotation.x = Math.PI / 2; g.add(ring2);
  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(2.8, .1, 8, 36), cageMat); ring3.rotation.y = Math.PI / 2; g.add(ring3);
  const plates = [];
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * TAU;
    const p = new THREE.Mesh(new THREE.ConeGeometry(.5, 2.4, 4),
      new THREE.MeshStandardMaterial({ color: 0x2a1030, metalness: .75, roughness: .3, emissive: 0xff9ec8, emissiveIntensity: .35 }));
    p.position.set(Math.cos(a) * 2.4, Math.sin(a * 2) * .6, Math.sin(a) * 2.4);
    p.rotation.z = -a + Math.PI / 2; mats.push(p.material); g.add(p); plates.push(p);
  }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
  return { g, mats, extra: [ring1, ring2, ring3, ...plates], core };
}

// ============================================================
export class Enemy {
  constructor(scene, fx, kind, pos) {
    this.kind = kind;
    const d = DEFS[kind];
    this.def = d;
    this.scene = scene; this.fx = fx;
    this.maxHp = d.hp; this.hp = d.hp; this.dmg = d.dmg; this.speed = d.speed;
    this.pos = pos.clone(); this.vel = new THREE.Vector3();
    this.yaw = rand(0, TAU);
    this.state = 'spawn'; this.t = 0; this.attackCd = rand(.8, 2.2);
    this.airT = 0; this.vy = 0;
    this.dead = false; this.removed = false;
    this.scale = d.scale;
    this.flashT = 0; this.phase = 1;
    this.contact = null; this.warn = null;
    this.strafeDir = Math.random() < .5 ? 1 : -1;
    this.summonCap = 2;

    const built = kind === 'drone' ? buildDrone() : kind === 'ranger' ? buildRanger() : kind === 'guard' ? buildGuard() : buildBoss();
    this.model = built.g; this.mats = built.mats; this.extra = built.extra || []; this.core = built.core || null; this.spin = built.spin || null;
    this.model.scale.setScalar(this.scale);
    this.model.position.copy(this.pos);
    this.model.position.y = d.hover - 3;
    scene.add(this.model);

    // 出生裂隙
    fx.ring({ pos: this.pos.clone().setY(0.1), color: d.color, r0: .3, r1: d.scale * 2.2, dur: .7 });
    fx.burst({ count: 26, pos: new THREE.Vector3(this.pos.x, .6, this.pos.z), color: d.color, speed: 5, life: .8, size: .55 });

    // HP 条（Boss 用顶部 HUD）
    if (kind !== 'boss') this._makeBar();
    // 锁定标记
    const ret = new THREE.Sprite(new THREE.SpriteMaterial({ map: lockTexture(), color: 0xff5e78, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    ret.scale.setScalar(2.4 / this.scale); ret.visible = false; this.model.add(ret); this.ret = ret;
    this.retY = (d.hover + 2.3) / this.scale;
    ret.position.y = this.retY;
    this._bob = rand(0, 10);
  }

  _makeBar() {
    this.bar = new THREE.Group();
    const bg = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0x0a0f22, transparent: true, opacity: .82, depthTest: true }));
    bg.scale.set(2.3, .26, 1);
    this.barFill = new THREE.Sprite(new THREE.SpriteMaterial({ color: this.def.color, depthTest: true }));
    this.barFill.scale.set(2.2, .18, 1);
    this.bar.add(bg, this.barFill);
    this.bar.position.y = this.barY = 2.45 * this.scale;
    this.scene.add(this.bar);
  }

  get aimPoint() { return new THREE.Vector3(this.pos.x, this.def.hover + 1.4, this.pos.z); }
  get isBoss() { return this.kind === 'boss'; }

  face(p, dt, rate = 8) {
    const d = p.clone().sub(this.pos); d.y = 0;
    if (d.lengthSq() < .001) return;
    const want = Math.atan2(-d.x, -d.z);
    let diff = (want - this.yaw) % TAU;
    if (diff > Math.PI) diff -= TAU; if (diff < -Math.PI) diff += TAU;
    this.yaw += clamp(diff, -rate * dt, rate * dt);
    this.model.rotation.y = this.yaw;
  }
  distTo(p) { return Math.hypot(this.pos.x - p.x, this.pos.z - p.z); }

  takeDamage(dmg, crit, dir, combat) {
    if (this.dead) return;
    this.hp = Math.max(0, this.hp - dmg);
    this.flashT = .09;
    this.fx.burst({ count: crit ? 14 : 7, pos: this.aimPoint, color: this.def.color, speed: crit ? 6 : 4, life: .5, size: .4, dir, spread: .6 });
    if (this.bar) {
      const r = this.hp / this.maxHp;
      this.barFill.scale.x = r * 2.2;
      this.barFill.position.x = -(1 - r) * 1.1;
    }
    // 轻量敌人受击打断蓄力
    if ((this.kind === 'drone' || this.kind === 'ranger') && this.state === 'windup') {
      this._cancelWindup(); this.attackCd = .5;
    }
    if (this.kind !== 'boss' && this.airT <= 0) {
      this.vel.addScaledVector(dir, 4.2);
      if (crit) { this.airT = .5; this.vy = 4.5; }
    } else if (this.isBoss) {
      this.vel.addScaledVector(dir, .6);
    }
    if (this.hp <= 0) this._die(combat);
  }

  _cancelWindup() {
    if (this.warn) { this.fx.removeWarn(this.warn); this.warn = null; }
    this.state = 'chase'; this.t = 0;
  }

  _die(combat) {
    this.dead = true; this.state = 'dead'; this.t = 0;
    if (this.bar) { this.scene.remove(this.bar); this.bar.children.forEach(s => s.material.dispose()); }
    if (this.warn) this.fx.removeWarn(this.warn);
    this.ret.visible = false;
    this.fx.burst({ count: this.isBoss ? 90 : 26, pos: this.aimPoint, color: this.isBoss ? 0xff9ec8 : this.def.color, speed: this.isBoss ? 12 : 7, life: 1, size: this.isBoss ? .9 : .55 });
    this.fx.flash(this.aimPoint, this.def.color, this.isBoss ? 60 : 14, this.isBoss ? 40 : 12, .35);
    this.fx.ring({ pos: this.pos.clone().setY(.1), color: this.def.color, r0: .4, r1: this.isBoss ? 13 : 4, dur: .6 });
    this.scene.audioRef?.die?.();
    combat && combat.onEnemyDie(this);
  }

  setReticle(on) { this.ret.visible = on && !this.dead; }

  // ---------------- AI ----------------
  update(dt, player, combat) {
    if (this.removed) return;
    this.t += dt;
    this.flashT = Math.max(0, this.flashT - dt);
    const flash = this.flashT > 0;
    this.mats.forEach((m, i) => {
      if (!m.emissive) return;
      m.emissiveIntensity = flash ? 3.4 : (m.userData.b ?? (m.userData.b = m.emissiveIntensity)) + Math.sin(performance.now() * .006 + i) * 0;
    });
    this.ret.position.y = this.retY;
    if (this.bar) { this.bar.position.set(this.pos.x, this.pos.y + this.barY, this.pos.z); this.bar.visible = this.hp < this.maxHp || this.state !== 'spawn'; }

    if (this.state === 'spawn') {
      this.model.rotation.y += dt * 3;
      this.model.position.y = damp(this.model.position.y, this.def.hover, 6, dt);
      if (this.t > .7) { this.state = 'chase'; this.t = 0; }
      this._moveVisual(dt);
      return;
    }
    if (this.state === 'dead') {
      this.t += dt;
      this.model.position.y -= dt * 2.2;
      this.model.rotation.z += dt * 1.4;
      this.model.scale.multiplyScalar(1 - dt * 1.1);
      this._moveVisual(dt, true);
      if (this.t > .9) {
        this.scene.remove(this.model);
        if (this.bar) { this.scene.remove(this.bar); this.bar.children.forEach(s => s.material.dispose()); }
        this.model.traverse(o => { if (o.isMesh) { o.geometry.dispose(); const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(x => x.dispose()); } });
        this.removed = true;
      }
      return;
    }

    const toP = player.pos.clone().sub(this.pos); toP.y = 0;
    const dist = toP.length();
    const dirN = dist > .001 ? toP.clone().divideScalar(dist) : new THREE.Vector3(0, 0, -1);
    this.face(player.pos, dt, this.kind === 'boss' ? 2.2 : 9);

    if (this.state === 'chase') {
      this.attackCd -= dt;
      if (this.kind === 'drone') {
        if (dist > 3.2) this.vel.lerp(dirN.clone().multiplyScalar(this.speed), 1 - Math.exp(-6 * dt));
        else this.vel.multiplyScalar(1 - 8 * dt);
        if (this.attackCd <= 0 && dist < 30) this._startLunge(player);
      } else if (this.kind === 'ranger') {
        let move;
        if (dist < 11) move = dirN.clone().multiplyScalar(-this.speed);
        else if (dist > 21) move = dirN.clone().multiplyScalar(this.speed);
        else move = new THREE.Vector3(-dirN.z, 0, dirN.x).multiplyScalar(this.strafeDir * this.speed * .8);
        this.vel.lerp(move, 1 - Math.exp(-5 * dt));
        if (this.attackCd <= 0 && dist < 34) this._startShotWindup(player);
      } else if (this.kind === 'guard') {
        if (dist > 4.4) this.vel.lerp(dirN.clone().multiplyScalar(this.speed), 1 - Math.exp(-5 * dt));
        else this.vel.multiplyScalar(1 - 10 * dt);
        if (this.attackCd <= 0 && dist < 15) this._startSlam(player, false);
      } else {
        // Boss 游走
        if (dist > 9) this.vel.lerp(dirN.clone().multiplyScalar(this.speed), 1 - Math.exp(-3.5 * dt));
        else this.vel.lerp(new THREE.Vector3(-dirN.z, 0, dirN.x).multiplyScalar(this.speed * .8), 1 - Math.exp(-3 * dt));
        if (this.attackCd <= 0 && dist < 34) this._bossPick(player, combat, dist);
      }
    } else if (this.state === 'windup') {
      this.vel.multiplyScalar(1 - 9 * dt);
      if (this.warn) { this.warn.mesh.position.x = this.warn.follow.x; this.warn.mesh.position.z = this.warn.follow.z; }
      if (this.kind === 'boss') this._bossWindup(player, combat, dt);
      if (this.t >= this.windDur) this._strike(player, combat);
    } else if (this.state === 'strike') {
      if (this.strikeKind === 'lunge') {
        this.vel.lerp(this._lungeDir.clone().multiplyScalar(20), 1 - Math.exp(-18 * dt));
      } else if (this.strikeKind === 'charge') {
        this.vel.lerp(this._lungeDir.clone().multiplyScalar(32), 1 - Math.exp(-14 * dt));
      } else this.vel.multiplyScalar(1 - 8 * dt);
      if (this.t >= this.strikeDur) { this.state = 'chase'; this.t = 0; this.attackCd = this.nextCd; }
    }

    this.pos.addScaledVector(this.vel, dt);
    const R = 30;
    const dd = Math.hypot(this.pos.x, this.pos.z);
    if (dd > R) { this.pos.x *= R / dd; this.pos.z *= R / dd; }
    this._moveVisual(dt);
  }

  _startLunge(player) {
    this.state = 'windup'; this.t = 0; this.windDur = .52;
    this.warn = this.fx.warnRing(this.pos.clone(), 2.3, 0xff7e8e, .6);
    this.strikeKind = 'lunge';
  }
  _startShotWindup(player) {
    this.state = 'windup'; this.t = 0; this.windDur = .68;
    this.strikeKind = 'shot';
    this.warn = this.fx.warnRing(this.pos.clone(), 2.0, 0x7fb6ff, .7);
  }
  _startSlam(player, big) {
    this.state = 'windup'; this.t = 0;
    this.windDur = big ? 1.0 : .9;
    this.strikeKind = big ? 'bossslam' : 'slam';
    this._slamAt = player.pos.clone();
    this.warn = this.fx.warnRing(this._slamAt, big ? 7.2 : 4.4, 0xff9e6e, big ? 1.05 : .95);
  }

  _bossPick(player, combat, dist) {
    const roll = Math.random();
    if (roll < .26) this._startSlam(player, true);
    else if (roll < .48) { this.strikeKind = 'nova'; this.state = 'windup'; this.t = 0; this.windDur = 1.05; this.warn = this.fx.warnRing(this.pos.clone(), 6.5, 0xff9ec8, 1.1); }
    else if (roll < .68) { this.strikeKind = 'fan'; this.state = 'windup'; this.t = 0; this.windDur = .7; }
    else if (roll < .86 && dist > 7) {
      this.strikeKind = 'charge'; this.state = 'windup'; this.t = 0; this.windDur = .72;
      this.warn = this.fx.warnRing(this.pos.clone(), 3.2, 0xff9ec8, .75);
    } else {
      // 召唤
      const adds = combat.enemies.filter(e => e !== this && !e.dead && !e.removed).length;
      if (this.phase >= 2 && adds < 3) {
        this.state = 'windup'; this.t = 0; this.windDur = .8; this.strikeKind = 'summon';
      } else this.strikeKind = 'fan', this.state = 'windup', this.t = 0, this.windDur = .7;
    }
  }
  _bossWindup(player, combat, dt) {
    if (this.strikeKind === 'bossslam') this._slamAt.lerp(player.pos, 1 - Math.exp(-2 * dt)).clampLength(0, 28);
  }

  _strike(player, combat) {
    this.t = 0;
    this.nextCd = ({ drone: 1.6, ranger: 2.0, guard: 2.6, boss: 1.5 }[this.kind] ?? 2) * (this.phase >= 3 ? .72 : this.phase === 2 ? .85 : 1);
    if (this.warn) { this.fx.removeWarn(this.warn); this.warn = null; }
    if (this.strikeKind === 'lunge') {
      this.state = 'strike'; this.strikeDur = .34;
      this._lungeDir = player.pos.clone().sub(this.pos).setY(0).normalize();
      this.contact = { hit: false, r: 3.4, dmg: this.dmg, knock: 12 };
    } else if (this.strikeKind === 'shot') {
      this.state = 'chase'; this.attackCd = this.nextCd;
      const from = this.pos.clone().setY(this.def.hover);
      combat.enemyBolt(from, player.aimPoint || player.pos.clone().setY(1.6), this.dmg, this.kind === 'boss' ? 1.6 : 1);
    } else if (this.strikeKind === 'slam' || this.strikeKind === 'bossslam') {
      const big = this.strikeKind === 'bossslam';
      this.state = 'strike'; this.strikeDur = .4;
      this.fx.ring({ pos: this._slamAt.clone().setY(.1), color: big ? 0xff9ec8 : 0xffb06e, r0: 1, r1: big ? 9.5 : 5.5, dur: .55 });
      this.fx.burst({ count: big ? 40 : 18, pos: this._slamAt.clone().setY(.4), color: 0xffb06e, speed: 8, life: .7, size: .5 });
      this.fx.flash(this._slamAt.clone().setY(1), 0xffb06e, big ? 30 : 14, 20, .25);
      this.contact = { hit: false, r: big ? 7.6 : 4.4, dmg: big ? this.dmg : this.dmg * .9, knock: big ? 18 : 10, at: this._slamAt };
      this.scene.audioRef?.explosion?.(big ? 0 : 0);
    } else if (this.strikeKind === 'nova') {
      this.state = 'strike'; this.strikeDur = .8;
      [3.5, 5.6, 7.6].forEach((r, i) => {
        setTimeout(() => {
          if (this.removed || !this.model.parent) return;
          this.fx.ring({ pos: this.pos.clone().setY(.12), color: 0xff9ec8, r0: .6, r1: r, dur: .5 });
        }, i * 160);
      });
      this.contact = { hit: false, r: 7.8, dmg: this.dmg * .9, knock: 20 };
    } else if (this.strikeKind === 'fan') {
      this.state = 'strike'; this.strikeDur = .3;
      const n = this.isBoss ? 7 : 3;
      const base = Math.atan2(player.pos.x - this.pos.x, player.pos.z - this.pos.z);
      for (let i = 0; i < n; i++) {
        const a = base + (i - (n - 1) / 2) * .22;
        const to = new THREE.Vector3(Math.sin(a), -0.06, Math.cos(a)).normalize();
        combat.enemyBolt(this.pos.clone().setY(this.def.hover + .3), to, this.dmg * .8, this.isBoss ? 1.4 : 1);
      }
    } else if (this.strikeKind === 'charge') {
      this.state = 'strike'; this.strikeDur = .65;
      this._lungeDir = player.pos.clone().sub(this.pos).setY(0).normalize();
      this.contact = { hit: false, r: 3.6, dmg: this.dmg * 1.2, knock: 24 };
      this.fx.burst({ count: 24, pos: this.aimPoint, color: 0xff9ec8, speed: 5, life: .7, size: .5, dir: this._lungeDir, spread: .5 });
    } else if (this.strikeKind === 'summon') {
      this.state = 'strike'; this.strikeDur = .4;
      for (let i = 0; i < 2; i++) {
        const a = rand(0, TAU);
        combat.spawnEnemy('drone', new THREE.Vector3(this.pos.x + Math.cos(a) * 5, 0, this.pos.z + Math.sin(a) * 5));
      }
      this.fx.pillar({ pos: this.pos.clone(), color: 0xff9ec8, radius: 2, height: 12, dur: .6 });
      this.nextCd = 1.6;
    }
    combat.shake.add(this.isBoss ? .35 : .12);
  }

  // Boss 阶段
  checkPhase(combat) {
    if (!this.isBoss || this.dead) return;
    const r = this.hp / this.maxHp;
    const want = r < .33 ? 3 : r < .66 ? 2 : 1;
    if (want > this.phase) {
      this.phase = want;
      combat.bossPhase(want);
      this.fx.ring({ pos: this.pos.clone().setY(.2), color: 0xff4e6e, r0: 1, r1: 14, dur: .9 });
      this.fx.flash(this.aimPoint, 0xff4e6e, 70, 40, .5);
    }
  }

  // ---------------- 视觉位移 ----------------
  _moveVisual(dt, dead = false) {
    const hover = this.def.hover;
    if (!dead && this.airT > 0) {
      this.airT -= dt;
      this.model.position.y += this.vy * dt;
      this.vy -= 16 * dt;
    } else {
      const target = hover + Math.sin(performance.now() * .0018 + this._bob) * (hover > 0 ? .28 : 0);
      this.model.position.y = damp(this.model.position.y, target, 10, dt);
    }
    this.model.position.x = this.pos.x; this.model.position.z = this.pos.z;
    this.model.rotation.y = this.yaw;
    if (this.spin) this.spin.forEach((s, i) => { s.rotation.z += dt * 2; s.position.y = Math.sin(performance.now() * .003 + i) * .3; });
    if (this.kind === 'ranger' && this.extra[0]) this.extra[0].rotation.z += dt * 1.4;
    if (this.isBoss) {
      this.extra[0].rotation.z += dt * .9;
      this.extra[1].rotation.x = Math.PI / 2 + this.t * .5;
      this.extra[2].rotation.y = Math.PI / 2 - this.t * .7;
      this.core.rotation.y += dt * 1.4;
      this.core.rotation.x = Math.sin(this.t * .8) * .3;
      const enrage = this.phase === 3 ? 1.9 : this.phase === 2 ? 1.4 : 1;
      this.core.scale.setScalar(1 + Math.sin(performance.now() * .005) * .05 * enrage);
    }
    if (this.kind === 'guard' && this.extra[0]) {
      this.extra[0].rotation.x = .3 + Math.sin(performance.now() * .004 + this._bob) * .12 - (this.state === 'windup' ? .5 : 0);
    }
  }
}
