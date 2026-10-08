// ============================================================
// combat.js — 浮岛竞技场：波次 / 弹道 / 命中 / 评分 / 镜头 / HUD
// ============================================================
import * as THREE from 'three';
import { makeGridTexture, makeNebulaTexture, clamp, damp, lerp, rand, pick, TAU, disposeScene } from './utils.js';
import { FX, FloatingTexts, Shake, makeStarField, glowSprite } from './effects.js';
import { Player } from './player.js';
import { Enemy } from './enemy.js';

const WAVES = {
  outpost: [
    { name: '前哨接触', list: [['drone', 3]] },
    { name: '弩手压制', list: [['drone', 2], ['ranger', 1]] },
    { name: '卫兵降临', list: [['guard', 1], ['ranger', 1], ['drone', 2]] }
  ],
  wreck: [
    { name: '回廊入口', list: [['drone', 2], ['ranger', 2]] },
    { name: '重甲巡防', list: [['guard', 1], ['drone', 2], ['ranger', 1]] },
    { name: '双卫绞杀', list: [['guard', 1], ['ranger', 2], ['drone', 1]] }
  ],
  throne: [
    { name: '王庭前哨', list: [['ranger', 2], ['drone', 2]] },
    { name: '灾兽苏醒', list: [['boss', 1]] }
  ]
};

const RANKS = [[300, 'C'], [900, 'B'], [2000, 'A'], [3800, 'S'], [6500, 'SS'], [10000, 'SSS']];

function makeStreak(color, len, r) {
  const g = new THREE.CylinderGeometry(r, r, len, 8);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .9,
    blending: THREE.AdditiveBlending, depthWrite: false }));
  return m;
}

export class Combat {
  constructor(renderer, mission, world, audio, { onDone }) {
    this.renderer = renderer; this.mission = mission; this.world = world; this.audio = audio; this.onDone = onDone;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x04060f);
    this.scene.fog = new THREE.FogExp2(0x050816, 0.0085);
    this.cam = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, .1, 900);
    this.cam.position.set(0, 9, 14);
    this.scene.audioRef = audio;
    this.fx = new FX(this.scene);
    this.shake = new Shake();
    this.texts = new FloatingTexts(world);

    this._buildArena();
    this._buildSky();
    this._buildLights();

    this.players = [new Player(this.scene, 'sword', this), new Player(this.scene, 'archer', this)];
    this.active = 0;
    this.players[0].pos.set(-1.5, 0, 2); this.players[0].yaw = Math.PI;
    this.players[1].pos.set(1.5, 0, 2); this.players[1].yaw = Math.PI;
    this.players[1].root.visible = false;
    this.enemies = [];
    this.bolts = [];
    this.rains = [];

    // 镜头
    this.yaw = 0; this.pitch = .32; this.radius = 9.5; this.punch = 0;
    this.lock = null;
    this.lookAssist = new THREE.Vector3();

    // 资源与评分
    this.ep = 55; this.ultGauge = 0;
    this.combo = 0; this.comboT = 0; this.maxCombo = 0;
    this.style = 0; this.maxRank = 'D';
    this.elapsed = 0;
    this.kills = 0; this.perfects = 0; this.damageTaken = 0;
    this.pendingSwitch = -1;
    this.deadSwitchT = 0;
    this.bossRef = null;

    // 时间缩放（命中停顿 / 极限闪避慢动作）
    this.scale = 1; this.slowT = 0; this.slowDur = 0; this.slowStr = .2;
    this.stopT = 0;

    // 波次
    this.waves = WAVES[mission.id];
    this.waveIdx = 0; this.phase = 'banner'; this.phaseT = 2.0;
    this.ended = false; this.paused = false; this.disposed = false;

    this._hud();
    this._showBanner();
    audio.setMode(mission.id === 'throne' ? 'boss' : 'combat');
    audio.waveStart();
  }

  // ==================== 场景 ====================
  _buildArena() {
    const rock = new THREE.Mesh(new THREE.CylinderGeometry(34, 11, 26, 9, 4),
      new THREE.MeshStandardMaterial({ color: 0x161d38, roughness: .95, flatShading: true, emissive: 0x0a1030, emissiveIntensity: .6 }));
    rock.position.y = -14; this.scene.add(rock);
    const grid = makeGridTexture('#6ea8ff', 1024, 128);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(33.2, 64),
      new THREE.MeshStandardMaterial({ color: 0x111a38, map: grid, emissive: 0xffffff, emissiveMap: grid, emissiveIntensity: .32, metalness: .4, roughness: .5 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; this.scene.add(floor);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(33.4, .2, 8, 96),
      new THREE.MeshBasicMaterial({ color: 0x6ea8ff, blending: THREE.AdditiveBlending, transparent: true, opacity: .9, depthWrite: false }));
    rim.rotation.x = Math.PI / 2; rim.position.y = .08; this.scene.add(rim);
    // 边缘灯塔
    this.beacons = [];
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU;
      const g = new THREE.Group();
      const pylon = new THREE.Mesh(new THREE.CylinderGeometry(.3, .5, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0x2a3660, metalness: .8, roughness: .3, emissive: 0x1a3a8a, emissiveIntensity: .8 }));
      pylon.position.y = 3; g.add(pylon);
      const tip = glowSprite(0x8fb4ff, 3.4, .9); tip.position.y = 6.4; g.add(tip);
      g.position.set(Math.cos(a) * 30.6, 0, Math.sin(a) * 30.6);
      this.scene.add(g); this.beacons.push({ g, tip, a });
    }
  }
  _buildSky() {
    this.stars = makeStarField(this.scene, { count: 2400, radius: 460, size: 1.7 });
    [['', 0x3355cc, 340, new THREE.Vector3(-240, 70, -300)],
     ['', 0x8a4cff, 260, new THREE.Vector3(230, 100, -340)],
     ['', 0x2e6fa8, 220, new THREE.Vector3(40, -90, -280)]]
      .forEach((d, i) => {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({
          map: makeNebulaTexture(d[1], 21 + i * 9), transparent: true, opacity: .5, depthWrite: false, blending: THREE.AdditiveBlending }));
        sp.scale.setScalar(d[2]); sp.position.copy(d[3]); this.scene.add(sp);
      });
    const planet = new THREE.Mesh(new THREE.SphereGeometry(52, 40, 28),
      new THREE.MeshStandardMaterial({ color: 0x243a78, roughness: .85, emissive: 0x0e1c48, emissiveIntensity: 1.2 }));
    planet.position.set(-170, 96, -360); this.scene.add(planet);
    const ring = new THREE.Mesh(new THREE.RingGeometry(66, 80, 90),
      new THREE.MeshBasicMaterial({ color: 0x7fa8ff, transparent: true, opacity: .28, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    ring.position.copy(planet.position); ring.rotation.set(1.25, .3, .5); this.scene.add(ring);
  }
  _buildLights() {
    this.scene.add(new THREE.AmbientLight(0x5060a0, .75));
    const hemi = new THREE.HemisphereLight(0x9db8ff, 0x0a0f22, .6); this.scene.add(hemi);
    const key = new THREE.DirectionalLight(0xcfe0ff, 2.0);
    key.position.set(-18, 34, 16);
    key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
    const s = 52;
    key.shadow.camera.left = -s; key.shadow.camera.right = s; key.shadow.camera.top = s; key.shadow.camera.bottom = -s;
    key.shadow.camera.far = 110;
    this.scene.add(key);
    const fill = new THREE.PointLight(0xff9ec8, .7, 80, 2); fill.position.set(18, 12, -20); this.scene.add(fill);
  }

  // ==================== HUD ====================
  _hud() {
    this.el = {
      hp: [document.getElementById('hp-fill-0'), document.getElementById('hp-fill-1')],
      card: [document.getElementById('squad-0'), document.getElementById('squad-1')],
      ep: document.getElementById('ep-fill'),
      ult: document.getElementById('ult-fill'),
      ultRow: document.querySelector('.ult-row'),
      ultText: document.getElementById('ult-ready-text'),
      rank: document.getElementById('style-rank'),
      combo: document.getElementById('combo-num'),
      styleFill: document.getElementById('style-fill'),
      timer: document.getElementById('mp-timer'),
      boss: document.getElementById('boss-bar'), bossHp: document.getElementById('boss-hp-fill'),
      bossPhase: document.getElementById('boss-phase'), bossName: document.getElementById('boss-name'),
      wave: document.getElementById('wave-banner'), waveCur: document.getElementById('wave-cur'),
      waveAll: document.getElementById('wave-all'), waveName: document.getElementById('wave-name'),
      toast: document.getElementById('center-toast'),
      ex: document.getElementById('act-ex'), exCost: document.getElementById('ex-cost'),
      ultSlot: document.getElementById('act-ult'),
      dash: document.getElementById('act-dash'), swapMask: document.getElementById('swap-cd'),
      missionName: document.getElementById('mp-mission-name')
    };
    this.el.missionName.textContent = this.mission.name;
    this.el.waveAll.textContent = this.waves.length;
  }
  _showBanner() {
    const w = this.waves[this.waveIdx];
    this.el.waveCur.textContent = this.waveIdx + 1;
    this.el.waveName.textContent = w.name;
    this.el.wave.classList.add('show');
  }
  toast(msg, perfect = false) {
    const t = this.el.toast;
    t.textContent = msg;
    t.className = 'center-toast show' + (perfect ? ' perfect' : '');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => t.classList.remove('show'), 1100);
  }
  flashRed() {
    const f = document.querySelector('.hitflash');
    f.classList.add('on'); setTimeout(() => f.classList.remove('on'), 110);
  }

  // ==================== 时间操控 ====================
  hitstop(dur = .07) { this.stopT = Math.max(this.stopT, dur); }
  slowmo(strength = .2, dur = .55) { this.slowStr = strength; this.slowT = dur; this.slowDur = dur; this.scale = strength; }

  // ==================== 敌人 / 波次 ====================
  spawnEnemy(kind, pos) {
    const e = new Enemy(this.scene, this.fx, kind, pos);
    this.enemies.push(e);
    if (kind === 'boss' && !this.bossRef) {
      this.bossRef = e;
      this.el.boss.classList.remove('hidden');
      this.el.bossName.textContent = e.def.name;
      this.toast('深空灾兽 · 虚渊  苏醒');
      this.shake.add(.8);
    }
    return e;
  }
  _spawnWave(idx) {
    const w = this.waves[idx];
    w.list.forEach(([kind, n], slot) => {
      for (let i = 0; i < n; i++) {
        const a = rand(0, TAU);
        const d = rand(15, 23);
        let p;
        if (kind === 'boss') p = new THREE.Vector3(0, 0, -20);
        else p = new THREE.Vector3(this.players[this.active].pos.x + Math.cos(a + slot) * d, 0,
          clamp(this.players[this.active].pos.z + Math.sin(a + slot) * d, -26, 26));
        const h = Math.hypot(p.x, p.z); if (h > 28) { p.x *= 28 / h; p.z *= 28 / h; }
        setTimeout(() => !this.ended && !this.disposed && this.spawnEnemy(kind, p), slot * 260 + i * 130);
      }
    });
  }
  onEnemyDie(e) {
    this.kills++;
    this.ultGauge = clamp(this.ultGauge + 10, 0, 100);
    this.ep = clamp(this.ep + 14, 0, 100);
    this.fx.burst({ count: 10, pos: e.aimPoint, color: 0xffd29e, speed: 3.5, life: .9, size: .35 });
    if (e.isBoss) { this.toast('虚渊 · 已讨伐'); this.shake.add(1); this.slowmo(.35, 1); }
  }
  bossPhase(p) {
    this.el.bossPhase.textContent = p;
    this.toast(p === 2 ? '虚渊 · 狂暴' : '虚渊 · 终焉形态');
    this.shake.add(.7);
  }

  // ==================== 玩家输出 ====================
  get p() { return this.players[this.active]; }
  aliveEnemies() { return this.enemies.filter(e => !e.dead && e.state !== 'spawn'); }

  _nearest(maxD = 12, prefer = null) {
    if (prefer && !prefer.dead && prefer.state !== 'spawn') {
      const d0 = this.p.pos.distanceTo(prefer.pos);
      if (d0 < maxD + 8) return prefer;
    }
    let best = null, bd = maxD;
    for (const e of this.enemies) {
      if (e.dead || e.state === 'spawn') continue;
      const d = this.p.pos.distanceTo(e.pos);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  addCombo() {
    this.combo++; this.comboT = 2.4;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
  }
  addStyle(v) {
    this.style = clamp(this.style + v, 0, 10001);
    const r = RANKS.find(([p]) => this.style < p)?.[1] ?? 'SSS';
    if (r !== this.maxRank && this.combo >= 4) {
      this.maxRank = r;
      if (['S', 'SS', 'SSS'].includes(r)) this.toast(r === 'SSS' ? 'SSS · 星海共舞' : r + '  RANK');
    }
  }
  _rankNow() { return RANKS.find(([p]) => this.style < p)?.[1] ?? 'SSS'; }

  damageEnemy(e, amount, crit, dir, opts = {}) {
    if (e.dead) return;
    e.takeDamage(amount, crit, dir, this);
    this.texts.spawn(e.aimPoint.clone().add(new THREE.Vector3(rand(-.4, .4), .3, rand(-.4, .4))),
      Math.round(amount), crit ? 'wt-crit' : 'wt-normal');
    this.addCombo();
    this.addStyle(amount * (crit ? 1.6 : 1));
    this.ultGauge = clamp(this.ultGauge + (crit ? 3.6 : 2.2), 0, 100);
    this.ep = clamp(this.ep + 3, 0, 100);
    if (crit) this.audio.crit();
    if (e.isBoss) e.checkPhase(this);
  }

  // 普攻
  melee(player, cfg) {
    if (player !== this.p) return;
    const target = this._nearest(cfg.range + 2.4, this.lock);
    if (target) player.face(target.pos, .05, 60);
    const fwd = player.forward;
    const dot = new THREE.Vector3();
    let n = 0, dmgSum = 0;
    const critAll = Math.random() < .06;
    for (const e of this.enemies) {
      if (e.dead || e.state === 'spawn') continue;
      const d = player.pos.distanceTo(e.pos);
      if (d > cfg.range + e.radius) continue;
      dot.copy(e.pos).sub(player.pos).setY(0).normalize();
      if (dot.dot ? fwd.dot(dot) < Math.cos(cfg.arc / 2 + .25) : false) continue;
      const comboMult = 1 + Math.min(this.combo, 40) * .012;
      let dmg = (player.atk * cfg.mult + 20) * comboMult;
      const crit = critAll || Math.random() < .18;
      if (crit) dmg *= 1.7;
      const dir = e.pos.clone().sub(player.pos).setY(0).normalize();
      this.damageEnemy(e, dmg, crit, dir);
      if (cfg.finisher) { e.vel.addScaledVector(dir, 7); e.airT = .35; e.vy = 4; }
      else e.vel.addScaledVector(dir, 2.4);
      n++; dmgSum += dmg;
    }
    if (n) {
      this.fx.slash({ pos: player.pos.clone().addScaledVector(fwd, 1.4).setY(1.4), facing: fwd,
        color: player.r.accent, span: cfg.arc + .6, radius: cfg.range * .82 });
      this.fx.flash(player.pos.clone().setY(1.4), player.r.accent, cfg.finisher ? 22 : 9, 16, .16);
      if (cfg.finisher) {
        this.fx.ring({ pos: player.pos.clone().setY(.1), color: player.r.accent, r1: cfg.range + 1.4, dur: .4 });
        this.hitstop(.1); this.shake.add(.35); this.audio.hit(1);
      } else { this.shake.add(.12); this.audio.hit(0); }
    }
  }
  // 玩家箭矢
  playerBolt(player, mult, count) {
    if (player !== this.p) return;
    const target = this.lock || this._nearest(26);
    for (let i = 0; i < count; i++) {
      let dir;
      if (target) {
        dir = target.aimPoint.clone().sub(player.pos.clone().setY(1.5)).normalize();
      } else dir = player.forward;
      if (count > 1) dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), (i - (count - 1) / 2) * .13);
      const m = makeStreak(0x8fe3c8, 1.5, .07);
      const tip = glowSprite(0xcffff0, 1.1, .95); tip.position.z = -0.8; m.add(tip);
      m.position.copy(player.pos).setY(1.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      this.scene.add(m);
      this.bolts.push({ mesh: m, vel: dir.multiplyScalar(48), from: 'p', r: .8,
        dmg: player.atk * mult + 16, life: 2.2 });
    }
    this.audio.shoot();
  }

  // EX 战技
  tryEX(player) {
    if (player !== this.p || this.ep < 45 || player.busy) return;
    this.ep -= 45; player.playEX(); this.audio.exSkill();
    if (player.kind === 'sword') {
      const center = this._nearest(14, this.lock);
      const cpos = center ? center.pos.clone() : player.pos.clone().addScaledVector(player.forward, 6);
      this.fx.pillar({ pos: cpos, color: 0x9cc4ff, radius: 2.2, height: 18 });
      this.fx.ring({ pos: player.pos.clone().setY(.1), color: 0x9cc4ff, r1: 9, dur: .55 });
      this.fx.flash(cpos.clone().setY(2), 0x9cc4ff, 40, 30, .4);
      for (const e of this.aliveEnemies()) {
        if (e.pos.distanceTo(cpos) < 10) {
          const crit = Math.random() < .25;
          const dmg = (player.atk * 2.3 + 50) * (crit ? 1.7 : 1);
          const dir = e.pos.clone().sub(cpos).setY(0).normalize();
          this.damageEnemy(e, dmg, crit, dir);
          e.vel.addScaledVector(dir, 12); e.airT = .5; e.vy = 5;
        }
      }
      this.hitstop(.12); this.shake.add(.5);
    } else {
      // 流星箭雨
      const list = this.aliveEnemies();
      const spots = [];
      for (let i = 0; i < 5; i++) {
        const e = list[i];
        if (e) spots.push(e.pos.clone());
        else {
          const a = rand(0, TAU);
          spots.push(player.pos.clone().add(new THREE.Vector3(Math.cos(a) * rand(5, 13), 0, Math.sin(a) * rand(5, 13))));
        }
      }
      spots.forEach((p, i) => {
        const mark = this.fx.warnRing(p, 2.6, 0x8fe3c8, .95);
        setTimeout(() => {
          this.fx.removeWarn(mark);
          if (this.ended || this.disposed) return;
          const streak = makeStreak(0x8fe3c8, 2.6, .1);
          streak.position.set(p.x, 15, p.z);
          this.scene.add(streak);
          this.bolts.push({ mesh: streak, vel: new THREE.Vector3(0, -52, 0), from: 'p', r: .8,
            aoe: 3.4, dmg: player.atk * 2.5 + 60, life: 1, rain: true });
        }, 700 + i * 140);
      });
      this.toast('星轨裂光');
    }
  }

  // 换人
  swap() {
    const p = this.p;
    if (p.swapCd > 0 || p.state === 'ult') return;
    const other = (this.active + 1) % 2;
    if (!this.players[other].alive) return;
    p.swapCd = .8;
    this.active = other;
    const n = this.p;
    n.root.visible = true;
    n.root.position.y = .2;
    n.pos.copy(p.pos); n.vel.copy(p.vel).multiplyScalar(.4);
    n.invuln = .7; n.swapIn = .6;
    p.root.visible = false;
    this.fx.ring({ pos: n.pos.clone().setY(.1), color: n.r.accent, r1: 5.5, dur: .5 });
    this.fx.burst({ count: 30, pos: n.pos.clone().setY(1.3), color: n.r.accent, speed: 7, life: .6, size: .45 });
    this.fx.flash(n.pos.clone().setY(1.5), n.r.accent, 18, 14, .25);
    this.audio.swap();
    // 登场支援攻击
    for (const e of this.aliveEnemies()) {
      if (e.pos.distanceTo(n.pos) < 6.5) this.damageEnemy(e, n.atk * 1.1 + 20, false, e.pos.clone().sub(n.pos).setY(0).normalize());
    }
    this.lock = null;
  }

  // 奥义
  tryUlt() {
    const p = this.p;
    if (this.ultGauge < 100 || p.state === 'ult') return;
    this.ultGauge = 0; this.ultT = 0;
    p.playUlt();
    p.invuln = 1.8;
    this.audio.ultStart();
    this.toast(p.kind === 'sword' ? '奥义 · 云顶终焉' : '奥义 · 万星穿彻');
    this.fx.pillar({ pos: p.pos.clone(), color: 0xffd29e, radius: 3.4, height: 30, dur: 1.4 });
  }
  _ultTick(t) {
    const p = this.p;
    this.fx.ring({ pos: p.pos.clone().setY(.12), color: pick([0xffd29e, 0xff9ec8, 0x9cc4ff]), r0: .8, r1: 12 - t * 2, dur: .7 });
    const dir = new THREE.Vector3();
    this.aliveEnemies().forEach((e, i) => {
      dir.copy(e.pos).sub(p.pos).setY(0).normalize();
      this.damageEnemy(e, p.atk * 1.5 + 70, i % 2 === 0, dir);
      e.vel.addScaledVector(dir, 9); e.airT = .6; e.vy = 6;
    });
    this.fx.burst({ count: 44, pos: p.pos.clone().setY(1.6), color: 0xffd29e, speed: 12, life: .8, size: .6 });
    this.fx.flash(p.pos.clone().setY(2), 0xffe9c0, 70, 46, .5);
    this.shake.add(.8); this.hitstop(.12); this.audio.ultHit();
  }

  // ==================== 敌人弹幕 / 命中玩家 ====================
  enemyBolt(from, target, dmg, scale = 1) {
    const dir = target.clone().sub(from).normalize();
    const m = makeStreak(0xff7e8e, 1.3 * scale, .16 * scale);
    const tip = glowSprite(0xff5e78, 1.4 * scale, .95); tip.position.z = -.7; m.add(tip);
    m.position.copy(from);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    this.scene.add(m);
    this.bolts.push({ mesh: m, vel: dir.multiplyScalar(13 * scale), from: 'e', r: 1.1 * scale, dmg, life: 4 });
    this.audio.enemyShoot();
  }

  hurtPlayer(dmg, src = null, knock = 8) {
    const p = this.p;
    if (!p.alive) return;
    if (p.invulnerable) {
      if (p.perfectT < .4 && !this._perfectDone) {
        this._perfectDone = true; setTimeout(() => this._perfectDone = false, 500);
        this.perfects++;
        this.ep = clamp(this.ep + 26, 0, 100);
        this.addStyle(260);
        this.slowmo(.18, .62);
        this.toast('极限闪避', true);
        this.fx.burst({ count: 26, pos: p.pos.clone().setY(1.3), color: 0xffd29e, speed: 8, life: .6, size: .5 });
        this.fx.ring({ pos: p.pos.clone().setY(.1), color: 0xffd29e, r1: 5, dur: .5 });
        this.audio.perfect();
      } else {
        this.texts.spawn(p.pos.clone().setY(1.8), 'MISS', 'wt-miss');
      }
      return;
    }
    p.hp = Math.max(0, p.hp - dmg);
    this.damageTaken += dmg;
    this.style = Math.max(0, this.style - 320);
    this.combo = 0;
    const dir = src ? p.pos.clone().sub(src).setY(0).normalize() : new THREE.Vector3(rand(-1, 1), 0, rand(-1, 1));
    p.hurt(dir, .1);
    this.flashRed(); this.shake.add(.4); this.audio.hurt();
    this.texts.spawn(p.pos.clone().setY(2.1), '-' + Math.round(dmg), 'wt-player');
    if (p.hp <= 0) {
      p.die();
      const other = this.players.find(x => x.alive);
      if (other) {
        this.toast(this.players[this.active].def.name + ' 失去战力');
        this.deadSwitchT = 1.0;
      } else this._fail();
    }
  }

  _checkContact(e) {
    const c = e.contact; if (!c || c.hit) return;
    const p = this.p;
    let hit = false;
    if (c.at) {
      hit = p.pos.distanceTo(c.at) < c.r;
    } else {
      hit = e.pos.distanceTo(p.pos) < c.r + p.radius;
    }
    if (hit) {
      c.hit = true;
      const dir = e.pos.clone().sub(p.pos).setY(0).normalize();
      this.hurtPlayer(c.dmg, e.pos, c.knock);
      p.vel.addScaledVector(dir, -c.knock * .6);
    }
  }

  // ==================== 主更新 ====================
  setPaused(v) {
    this.paused = v;
    if (!v) this.last = performance.now();
  }

  update(realDt, input) {
    if (this.paused || this.ended) { this.render(); return; }
    this.elapsed += realDt;

    // 时间缩放
    if (this.stopT > 0) { this.stopT -= realDt; this.scale = .06; }
    else if (this.slowT > 0) {
      this.slowT -= realDt;
      this.scale = lerp(this.slowStr, 1, 1 - Math.pow(this.slowT / this.slowDur, 2) * .8 + .2);
      if (this.slowT <= 0) this.scale = 1;
    } else this.scale = damp(this.scale, 1, 10, realDt);
    const dt = Math.min(realDt * this.scale, .05);

    // ---- 输入动作 ----
    const p = this.p;
    if (input.hit('KeyJ') || (input.mouse.pressed[0] && input.locked)) p.tryAttack();
    if (input.hit('KeyK') || (input.mouse.pressed[2] && input.locked)) this.tryEX(p);
    if (input.hit('ShiftLeft') || input.hit('ShiftRight') || input.hit('Space')) p.startDash(input, this.yaw);
    if (input.hit('KeyQ')) this.swap();
    if (input.hit('KeyL') || input.hit('KeyR')) this.tryUlt();
    if (input.hit('KeyF')) this._toggleLock();

    // 镜头
    if (input.locked) {
      this.yaw -= input.mouse.dx * .0026;
      this.pitch = clamp(this.pitch - input.mouse.dy * .0022, .08, 1.05);
    } else if (input.mouse.dragging) {
      this.yaw -= input.mouse.dragDX * .005;
      this.pitch = clamp(this.pitch - input.mouse.dragDY * .004, .08, 1.05);
    }
    if (p.state === 'dash' && input.mouse.wheel) this.radius *= 1;
    this.radius = clamp(this.radius * (1 + input.mouse.wheel * .08), 6.5, 17);

    // 锁定目标 / 辅助瞄准
    if (this.lock && (this.lock.dead || this.lock.removed)) this.lock = null;
    let aimPoint = null;
    const assist = this.lock || this._nearest(9.5);
    if (assist) {
      assist.setReticle(assist === this.lock);
      if (this.lock) {
        aimPoint = this.lock.aimPoint;
        const d = this.lock.pos.clone().sub(p.pos);
        const want = Math.atan2(-d.x, -d.z);
        let diff = (want - this.yaw) % TAU;
        if (diff > Math.PI) diff -= TAU; if (diff < -Math.PI) diff += TAU;
        this.yaw += clamp(diff, -3.2 * realDt, 3.2 * realDt);
        this.pitch = damp(this.pitch, .3, 5, realDt);
      }
    }
    this.enemies.forEach(e => { if (e !== assist) e.setReticle(false); });

    // ---- 角色 ----
    this.players.forEach((pl, i) => {
      if (i === this.active) pl.update(dt, realDt, input, this.yaw, aimPoint);
      else { // 后台缓慢回血
        if (pl.alive) { pl.hp = Math.min(pl.maxHp, pl.hp + realDt * 14); pl._animate(realDt); }
      }
    });
    // 死亡自动换人
    if (this.deadSwitchT > 0) {
      this.deadSwitchT -= realDt;
      if (this.deadSwitchT <= 0) {
        const other = this.players.find(x => x.alive);
        if (other) { const idx = this.players.indexOf(other); if (idx !== this.active) { this.active = idx; other.root.visible = true; this.p.root.visible = false; this.active = idx; } }
      }
    }
    // EP 回复
    this.ep = clamp(this.ep + realDt * 3.4, 0, 100);
    if (this.comboT > 0) { this.comboT -= dt; if (this.comboT <= 0) this.combo = 0; }
    this.style = Math.max(0, this.style - realDt * (this.combo ? 55 : 95));

    // ---- 奥义进程 ----
    if (p.state === 'ult') {
      this.ultT += dt;
      [.25, .65, 1.05, 1.45].forEach(t => {
        if (this.ultT >= t && !this['_ult' + t]) { this['_ult' + t] = true; this._ultTick(t); }
      });
      this.punch = .9;
      if (this.ultT > 1.7) { [.25, .65, 1.05, 1.45].forEach(t => this['_ult' + t] = false); }
    }
    this.punch = Math.max(0, this.punch - realDt * 2.2);

    // ---- 敌人 ----
    this.enemies.forEach(e => {
      e.update(dt, p, this);
      if (e.contact && (e.state === 'strike')) this._checkContact(e);
    });
    for (let i = this.enemies.length - 1; i >= 0; i--) if (this.enemies[i].removed) this.enemies.splice(i, 1);

    // ---- 弹道 ----
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const b = this.bolts[i];
      b.life -= dt; b.mesh.position.addScaledVector(b.vel, dt);
      b.mesh.rotation.z += dt * 6;
      let dead = b.life <= 0;
      if (!dead && b.from === 'p') {
        for (const e of this.enemies) {
          if (e.dead || e.state === 'spawn') continue;
          const bodyPoint = new THREE.Vector3(e.pos.x, e.def.hover * .7 + .9, e.pos.z);
          if (e.aimPoint.distanceTo(b.mesh.position) < b.r + e.radius ||
              bodyPoint.distanceTo(b.mesh.position) < b.r + e.radius * .9) {
            if (b.aoe) {
              this.fx.ring({ pos: b.mesh.position.clone().setY(.12), color: 0x8fe3c8, r1: b.aoe, dur: .5 });
              this.fx.burst({ count: 30, pos: b.mesh.position.clone(), color: 0x8fe3c8, speed: 9, life: .7, size: .5 });
              this.audio.explosion();
              for (const e2 of this.aliveEnemies()) {
                if (e2.pos.distanceTo(b.mesh.position) < b.aoe + e2.radius)
                  this.damageEnemy(e2, b.dmg * (Math.random() < .2 ? 1.7 : 1), Math.random() < .2,
                    e2.pos.clone().sub(b.mesh.position).setY(0).normalize());
              }
              this.shake.add(.3);
            } else {
              const crit = Math.random() < .2;
              this.damageEnemy(e, b.dmg * (crit ? 1.7 : 1), crit, b.vel.clone().setY(0).normalize());
              this.fx.burst({ count: 8, pos: b.mesh.position.clone(), color: 0xcffff0, speed: 4, life: .4, size: .35 });
              this.audio.hit(0);
            }
            dead = true; break;
          }
        }
      } else if (!dead) {
        const pp = p.pos.clone().setY(1.2);
        if (pp.distanceTo(b.mesh.position) < b.r + p.radius) {
          this.hurtPlayer(b.dmg, b.mesh.position, 10);
          this.fx.burst({ count: 12, pos: b.mesh.position.clone(), color: 0xff5e78, speed: 6, life: .5, size: .45 });
          dead = true;
        }
      }
      if (dead) { this.scene.remove(b.mesh); b.mesh.traverse(o => { o.isMesh && o.geometry.dispose(); o.material && o.material.dispose && o.material.dispose(); }); this.bolts.splice(i, 1); }
    }

    // ---- 波次 ----
    this._updateWaves(realDt);
    // Boss 血条
    if (this.bossRef && !this.bossRef.dead) {
      this.el.bossHp.style.width = (this.bossRef.hp / this.bossRef.maxHp * 100) + '%';
    } else if (this.bossRef && this.bossRef.dead) this.el.boss.classList.add('hidden');

    this.fx.update(dt);
    this.shake.update(realDt);
    this.texts.update(realDt, this.cam);
    this._camera(realDt);
    this._updateHUD(realDt);
    this.render();
  }

  _toggleLock() {
    if (this.lock) { this.lock = null; this.audio.uiClick(); return; }
    const e = this._nearest(60);
    if (e) { this.lock = e; this.audio.lock(); }
  }

  _updateWaves(realDt) {
    if (this.phase === 'banner') {
      this.phaseT -= realDt;
      if (this.phaseT <= 0) {
        this.phase = 'fight';
        this.el.wave.classList.remove('show');
        this._spawnWave(this.waveIdx);
      }
    } else if (this.phase === 'fight') {
      if (this.enemies.length === 0 && !this.bolts.some(b => b.from === 'e')) {
        if (this.waveIdx >= this.waves.length - 1) { this._victory(); return; }
        this.phase = 'break'; this.phaseT = 2.4;
        this.toast('区域肃清');
        this.ep = clamp(this.ep + 30, 0, 100);
      }
    } else if (this.phase === 'break') {
      this.phaseT -= realDt;
      if (this.phaseT <= 0) {
        this.waveIdx++; this.phase = 'banner'; this.phaseT = 1.8;
        this._showBanner(); this.audio.waveStart();
      }
    }
  }

  _victory() {
    if (this.ended) return;
    this.ended = true;
    this.phase = 'done';
    this.fx.burst({ count: 120, pos: this.p.pos.clone().setY(2), color: 0xffd29e, speed: 14, life: 1.4, size: .8 });
    this.fx.pillar({ pos: this.p.pos.clone(), color: 0xffd29e, radius: 3, height: 34, dur: 1.6 });
    setTimeout(() => this.onDone({ win: true, time: this.elapsed, maxCombo: this.maxCombo, kills: this.kills,
      perfects: this.perfects, damage: this.damageTaken, rank: this.maxRank }), 1400);
  }
  _fail() {
    if (this.ended) return;
    this.ended = true;
    this.audio.explosion(1);
    setTimeout(() => this.onDone({ win: false, time: this.elapsed, maxCombo: this.maxCombo, kills: this.kills,
      perfects: this.perfects, damage: this.damageTaken, rank: this.maxRank }), 1200);
  }

  // ==================== 镜头 ====================
  _camera(dt) {
    const p = this.p;
    const r = this.radius - this.punch * 1.6;
    const cp = Math.cos(this.pitch);
    const desired = new THREE.Vector3(
      p.pos.x + Math.sin(this.yaw) * cp * r,
      p.pos.y + 1.2 + Math.sin(this.pitch) * r,
      p.pos.z + Math.cos(this.yaw) * cp * r
    );
    this.cam.position.lerp(desired, 1 - Math.exp(-9 * dt));
    const look = p.pos.clone(); look.y = 1.6;
    if (this.lock && !this.lock.dead) look.lerp(this.lock.aimPoint, .25);
    this.cam.lookAt(look);
    this.cam.position.add(this.shake.off);
    this.cam.rotation.z += this.shake.yaw;
    this.stars.rotation.y += dt * .004;
    const t = performance.now() * .001;
    this.beacons.forEach((b, i) => { b.tip.material.opacity = .6 + .4 * Math.sin(t * 2.2 + i); b.g.rotation.y = t * .15; });
  }

  _updateHUD(dt) {
    this.players.forEach((pl, i) => {
      this.el.hp[i].style.width = clamp(pl.hp / pl.maxHp * 100, 0, 100) + '%';
      this.el.card[i].classList.toggle('active', i === this.active);
      this.el.card[i].classList.toggle('dead', !pl.alive);
    });
    this.el.ep.style.width = this.ep + '%';
    this.el.ult.style.width = this.ultGauge + '%';
    this.el.ultRow.classList.toggle('ready', this.ultGauge >= 100);
    this.el.ultText.textContent = this.ultGauge >= 100 ? '按 L 解放奥义' : '奥义充能中';
    this.el.ultSlot.classList.toggle('ready', this.ultGauge >= 100);
    this.el.ex.style.clipPath = '';
    this.el.ex.classList.toggle('denied', this.ep < 45);
    this.el.exCost.style.height = this.ep < 45 ? (1 - this.ep / 45) * 100 + '%' : '0%';
    this.el.swapMask.style.height = (this.p.swapCd / .8 * 100) + '%';
    const charges = 3 - this.p.dashCd.filter(c => c > 0).length;
    this.el.dash.classList.toggle('pulse', charges === 3);
    this.el.dash.style.opacity = .5 + (charges / 3) * .5;

    this.el.combo.textContent = this.combo;
    const now = this._rankNow();
    const lit = this.style > 1;
    this.el.rank.textContent = now;
    this.el.rank.className = 'style-rank' + (lit ? ' lit' : '') +
      (['S', 'SS', 'SSS'].includes(now) ? ' rank' + now : '');
    let lo = 0;
    for (const [pt] of RANKS) { if (this.style < pt) break; lo = pt; }
    const hi = RANKS.find(([pt]) => this.style < pt)?.[0] ?? 10000;
    this.el.styleFill.style.width = clamp((this.style - lo) / Math.max(1, hi - lo) * 100, 0, 100) + '%';

    const m = Math.floor(this.elapsed / 60), s = Math.floor(this.elapsed % 60);
    this.el.timer.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  render() { this._composer.render(); }
  setComposer(c) { this._composer = c; }
  resize() {
    this.cam.aspect = innerWidth / innerHeight; this.cam.updateProjectionMatrix();
    if (this._composer) this._composer.setSize(innerWidth, innerHeight);
  }
  dispose() {
    this.disposed = true;
    this.audio.setMode('map');
    this.texts.clear();
    this._composer && this._composer.dispose();
    disposeScene(this.scene);
  }
}
