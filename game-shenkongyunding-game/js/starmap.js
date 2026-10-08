// ============================================================
// starmap.js — 宇宙星图中枢：浮岛关卡 / 能量航线 / 星舟 / 星云
// ============================================================
import * as THREE from 'three';
import { makeNebulaTexture, rand, pick, clamp, damp, tween, easeInOutCubic, disposeScene } from './utils.js';
import { FX, glowSprite, makeStarField } from './effects.js';

export const MISSIONS = [
  { id: 'outpost', index: 'MISSION 01', name: '云港前哨', type: '普通作战 · 3 波敌群',
    desc: '星骸潮汐的前哨侵扰正逼近云港空港。在此熟悉星辉连段、极限闪避与队友协同，清剿三波虚空生物。',
    chips: ['星骸浮游体 ×5', '星骸弩手 ×2', '陨铁卫兵 · 精英 ×1'],
    chipTypes: ['', '', 'elite'],
    rewards: ['星辉碎片', '云港徽章'],
    color: 0x6ea8ff, pos: new THREE.Vector3(-54, 7, -38) },
  { id: 'wreck', index: 'MISSION 02', name: '陨铁回廊', type: '精英作战 · 重甲敌群',
    desc: '断裂的古老空港回廊被陨铁卫兵占据，弩手交叉火力密布。灵活切换岚与凛，撕裂钢铁防线。',
    chips: ['星骸浮游体 ×4', '星骸弩手 ×3', '陨铁卫兵 · 精英 ×2'],
    chipTypes: ['', '', 'elite'],
    rewards: ['陨铁矿石', '回廊棱晶'],
    color: 0xffd29e, pos: new THREE.Vector3(6, -3, -78) },
  { id: 'throne', index: 'MISSION 03', name: '深空王座', type: '讨伐作战 · 灾兽虚渊',
    desc: '云顶王庭废墟的最深处，深空灾兽·虚渊于王座间苏醒。注意它的三阶段狂暴形态，以奥义终结它。',
    chips: ['星骸弩手 ×2', '深空灾兽 · 虚渊 BOSS'],
    chipTypes: ['', 'boss'],
    rewards: ['王座徽章', '星核晶石'],
    color: 0xff9ec8, pos: new THREE.Vector3(66, 11, -34) }
];

const HUB = new THREE.Vector3(0, -4, 18);

// ---------------- 浮岛建造 ----------------
function cragCylinder(topR, botR, h, seg = 7) {
  const geo = new THREE.CylinderGeometry(topR, botR, h, seg, 4);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    if (Math.abs(y) > h * 0.4) continue;
    const n = 1 + rand(-0.16, 0.16);
    p.setX(i, x * n); p.setZ(i, z * n);
  }
  geo.computeVertexNormals();
  return geo;
}

function buildIsland(m, big = false) {
  const g = new THREE.Group();
  const r = big ? 11 : 6.5;
  const rockMat = new THREE.MeshStandardMaterial({ color: big ? 0x202842 : 0x252d4d, roughness: 0.95, metalness: 0.05,
    emissive: 0x0a1030, emissiveIntensity: 0.6, flatShading: true });
  const rock = new THREE.Mesh(cragCylinder(r * 0.92, r * 0.32, r * 1.5), rockMat);
  rock.position.y = -r * 0.75;
  g.add(rock);
  // 底垂晶簇
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(rand(0.25, 0.5), rand(1.6, 3.4), 5),
      new THREE.MeshStandardMaterial({ color: 0x182040, emissive: m.color, emissiveIntensity: 1.6, roughness: .4 }));
    const a = rand(0, Math.PI * 2), d = rand(0, r * 0.5);
    c.position.set(Math.cos(a) * d, -r * 1.5 - rand(0, 1), Math.sin(a) * d);
    c.rotation.x = Math.PI;
    g.add(c);
  }
  // 平台
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.04, 0.7, 6),
    new THREE.MeshStandardMaterial({ color: 0x1a2238, metalness: 0.7, roughness: 0.35,
      emissive: m.color, emissiveIntensity: 0.12 }));
  deck.position.y = 0.15;
  g.add(deck);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r * 1.02, 0.13, 8, 48),
    new THREE.MeshBasicMaterial({ color: m.color, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.95, depthWrite: false }));
  rim.rotation.x = Math.PI / 2; rim.position.y = 0.52;
  g.add(rim);
  // 建筑
  const bMat = new THREE.MeshStandardMaterial({ color: 0x2b3658, metalness: 0.65, roughness: 0.4, emissive: m.color, emissiveIntensity: 0.08 });
  for (let i = 0; i < (big ? 7 : 4); i++) {
    const a = (i / (big ? 7 : 4)) * Math.PI * 2 + rand(-0.2, 0.2), d = r * rand(0.4, 0.72);
    const bh = rand(1.6, big ? 4.6 : 3.2);
    const b = new THREE.Mesh(new THREE.BoxGeometry(rand(1, 1.9), bh, rand(1, 1.9)), bMat);
    b.position.set(Math.cos(a) * d, 0.5 + bh / 2, Math.sin(a) * d);
    b.rotation.y = -a;
    g.add(b);
    if (Math.random() < 0.7) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.14, bh * 0.5, 0.9),
        new THREE.MeshBasicMaterial({ color: m.color, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending }));
      win.position.set(b.position.x + Math.cos(a) * 0.9, b.position.y, b.position.z + Math.sin(a) * 0.9);
      g.add(win);
    }
  }
  const spireH = big ? 7 : 5;
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.9, spireH, 5),
    new THREE.MeshStandardMaterial({ color: 0x3a4878, metalness: 0.7, roughness: 0.3, emissive: m.color, emissiveIntensity: 0.5 }));
  spire.position.y = 0.5 + spireH / 2;
  g.add(spire);
  // 能量光柱
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.1, big ? 42 : 30, 16, 1, true),
    new THREE.MeshBasicMaterial({ color: m.color, transparent: true, opacity: 0.16,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  beam.position.y = big ? 20 : 15;
  g.add(beam);
  // 悬浮全息环
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.07, 8, 60),
    new THREE.MeshBasicMaterial({ color: m.color, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  ring.position.y = spireH + 2.2; ring.rotation.x = Math.PI / 2.6;
  g.add(ring);
  // 节点选择环
  const sel = new THREE.Mesh(new THREE.TorusGeometry(r * 1.28, 0.1, 8, 64),
    new THREE.MeshBasicMaterial({ color: m.color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  sel.rotation.x = Math.PI / 2; sel.position.y = 0.6;
  g.add(sel);
  g.userData = { rim, ring, sel, beam, base: 1, hover: 0, selected: false };
  g.traverse(o => { o.userData.nodeId = m.id; });
  return g;
}

function buildHub() {
  const m = { id: 'hub', color: 0x8fe3c8 };
  const g = buildIsland(m, true);
  // 旗舰停靠环
  const dock = new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.16, 8, 72),
    new THREE.MeshBasicMaterial({ color: m.color, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false }));
  dock.rotation.x = Math.PI / 2; dock.position.y = 1.4; dock.position.z = 8;
  g.add(dock);
  g.userData.dock = dock;
  g.traverse(o => { o.userData.nodeId = 'hub'; });
  return g;
}

// ---------------- 星舟 ----------------
function buildAirship(scale = 1, accent = 0x6ea8ff) {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 2.6, 4, 10),
    new THREE.MeshStandardMaterial({ color: 0xdfe8ff, metalness: 0.85, roughness: 0.25, emissive: accent, emissiveIntensity: 0.12 }));
  hull.rotation.z = Math.PI / 2;
  g.add(hull);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.72, 1.4, 12),
    new THREE.MeshStandardMaterial({ color: 0x9fb6e8, metalness: 0.9, roughness: 0.2 }));
  nose.rotation.z = -Math.PI / 2; nose.position.x = 2.0;
  g.add(nose);
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x8fd4ff, metalness: .4, roughness: .1, emissive: 0x2a6ea8, emissiveIntensity: 1.2 }));
  cockpit.rotation.z = -Math.PI / 2; cockpit.position.set(0.4, 0.42, 0);
  g.add(cockpit);
  const wingMat = new THREE.MeshStandardMaterial({ color: 0x5a78b8, metalness: 0.8, roughness: 0.3, emissive: accent, emissiveIntensity: 0.2 });
  for (const s of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 1.5), wingMat);
    wing.position.set(-0.5, -0.15, s * 0.95);
    wing.rotation.y = s * 0.35;
    g.add(wing);
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.7), wingMat);
    fin.position.set(-1.5, 0.55, s * 0.5); fin.rotation.x = s * 0.2;
    g.add(fin);
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.7, 10),
      new THREE.MeshStandardMaterial({ color: 0x222a44, metalness: .9, roughness: .3 }));
    eng.rotation.z = Math.PI / 2; eng.position.set(-1.7, -0.05, s * 0.55);
    g.add(eng);
    const glow = glowSprite(accent, 1.5, 0.95);
    glow.position.set(-2.1, -0.05, s * 0.55);
    g.add(glow);
  }
  g.scale.setScalar(scale);
  g.userData.glow = accent;
  return g;
}

// ============================================================
export class StarMap {
  constructor(renderer, { onSelect }) {
    this.renderer = renderer;
    this.onSelect = onSelect;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x03040c);
    this.scene.fog = new THREE.FogExp2(0x050816, 0.0022);
    this.cam = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 1200);
    this.cam.position.set(0, 26, 86);
    this.fx = new FX(this.scene);

    this._lights();
    this._cosmos();
    this._nodes();
    this._ships();
    this._ambientIslands();

    // 相机控制
    this.pivot = HUB.clone(); this.pivotT = HUB.clone();
    this.yaw = 0.12; this.yawT = 0.12;
    this.pitch = 0.32; this.pitchT = 0.32;
    this.radius = 96; this.radiusT = 96;
    this.autoRot = 0.02;
    this.ray = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();
    this.hoverId = null;
    this.selectedId = null;
    this.time = 0;
  }

  _lights() {
    this.scene.add(new THREE.AmbientLight(0x4a5a90, 0.7));
    const key = new THREE.DirectionalLight(0xbfd4ff, 1.5); key.position.set(-40, 70, 30); this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x8a6cff, 0.8); rim.position.set(60, -20, -80); this.scene.add(rim);
  }

  _cosmos() {
    this.starsA = makeStarField(this.scene, { count: 2600, radius: 520, size: 1.6 });
    this.starsB = makeStarField(this.scene, { count: 500, radius: 240, size: 2.6, tint: 0xbfd8ff });
    const defs = [
      [0x3355cc, 380, new THREE.Vector3(-260, 60, -320), 0xa98eff],
      [0x8a4cff, 300, new THREE.Vector3(240, 90, -380), 0x6ea8ff],
      [0x2e6fa8, 260, new THREE.Vector3(60, -90, -300), 0x8fe3c8],
      [0xc24c8f, 220, new THREE.Vector3(-120, 120, -420), 0xff9ec8]
    ];
    this.nebulas = defs.map(([hex, s, p], i) => {
      const tex = makeNebulaTexture(hex, 7 + i * 13, 512);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
      sp.scale.setScalar(s); sp.position.copy(p);
      this.scene.add(sp); return sp;
    });
    // 带环行星
    const planet = new THREE.Mesh(new THREE.SphereGeometry(46, 48, 32),
      new THREE.MeshStandardMaterial({ color: 0x1b2a5c, roughness: 0.9, emissive: 0x0c1838, emissiveIntensity: 1 }));
    planet.position.set(-180, 70, -480); this.scene.add(planet);
    const atmo = glowSprite(0x5f8fff, 120, 0.35); atmo.position.copy(planet.position); this.scene.add(atmo);
    const ring = new THREE.Mesh(new THREE.RingGeometry(60, 76, 96),
      new THREE.MeshBasicMaterial({ color: 0x8fb4ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    ring.position.copy(planet.position); ring.rotation.set(1.2, 0.3, 0.5); this.scene.add(ring);
    this.planet = planet;
  }

  _nodes() {
    this.nodeGroups = {};
    this.hub = buildHub(); this.hub.position.copy(HUB); this.scene.add(this.hub);
    MISSIONS.forEach(m => {
      const g = buildIsland(m);
      g.position.copy(m.pos);
      this.scene.add(g);
      this.nodeGroups[m.id] = g;
    });
    // 航线
    this.pulses = [];
    const pts = [HUB, ...MISSIONS.map(m => m.pos)];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const mid = a.clone().lerp(b, 0.5); mid.y -= 10 + rand(-2, 2);
      const curve = new THREE.CatmullRomCurve3([a.clone().add(new THREE.Vector3(0, 2, 0)), mid, b.clone().add(new THREE.Vector3(0, 2, 0))]);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.08, 6, false),
        new THREE.MeshBasicMaterial({ color: 0x6ea8ff, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
      this.scene.add(tube);
      for (let k = 0; k < 3; k++) {
        const sp = glowSprite(MISSIONS[i].color, 2.2, 0.95);
        this.scene.add(sp);
        this.pulses.push({ sp, curve, u: k / 3, speed: 0.05 + k * 0.012 });
      }
    }
  }

  _ships() {
    this.flagship = buildAirship(1.6, 0x8fe3c8);
    this.flagship.position.set(HUB.x + 4, HUB.y + 4.4, HUB.z + 8);
    this.scene.add(this.flagship);
    // 巡弋航线
    this.patrols = [];
    const routeDefs = [
      { c: 0x6ea8ff, s: 1.1, pts: [[-70, 14, -10], [-30, 8, -60], [20, 16, -52], [30, 10, -8]] },
      { c: 0xff9ec8, s: 0.85, pts: [[40, 20, 20], [70, 10, -40], [10, -6, -90], [-30, 6, -60]] }
    ];
    routeDefs.forEach(d => {
      const ship = buildAirship(d.s, d.c);
      this.scene.add(ship);
      const curve = new THREE.CatmullRomCurve3(d.pts.map(p => new THREE.Vector3(...p)), true, 'catmullrom', 0.4);
      this.patrols.push({ ship, curve, u: Math.random(), speed: rand(0.012, 0.022) });
    });
  }

  _ambientIslands() {
    this.distant = [];
    for (let i = 0; i < 9; i++) {
      const g = buildIsland({ color: pick([0x3a4a7a, 0x4a3a7a, 0x2a4a6a]) }, false);
      const a = rand(0, Math.PI * 2), d = rand(120, 260);
      g.position.set(Math.cos(a) * d, rand(-60, 40), -60 - Math.sin(a) * d * 0.6);
      const sc = rand(0.5, 1.4); g.scale.setScalar(sc);
      this.scene.add(g);
      this.distant.push({ g, bob: rand(0, 10), sp: rand(0.2, 0.5) });
    }
    // 浮尘
    this.dust = this.fx.burst({ count: 220, pos: new THREE.Vector3(0, 0, -20), color: 0x8fb4ff, speed: 0.6, life: 14, size: 0.9, drag: 0.02, spread: 60 });
    this.dust.mat.opacity = 0.5;
  }

  // ---------------- 交互 ----------------
  handleMove(input) {
    this.ndc.set(input.mouse.x, input.mouse.y);
    this.ray.setFromCamera(this.ndc, this.cam);
    const meshes = [];
    Object.values(this.nodeGroups).forEach(g => g.traverse(o => o.isMesh && meshes.push(o)));
    const hits = this.ray.intersectObjects(meshes, false);
    const id = hits.length ? hits[0].object.userData.nodeId : null;
    if (id !== this.hoverId) {
      this.hoverId = id;
      document.body.style.cursor = id ? 'pointer' : 'crosshair';
    }
  }
  click(input) {
    if (input.mouse.dragging || Math.abs(input.mouse.dragDX) + Math.abs(input.mouse.dragDY) > 8) return;
    this.ndc.set(input.mouse.x, input.mouse.y);
    this.ray.setFromCamera(this.ndc, this.cam);
    const meshes = [];
    Object.values(this.nodeGroups).forEach(g => g.traverse(o => o.isMesh && meshes.push(o)));
    const hits = this.ray.intersectObjects(meshes, false);
    const id = hits.length ? hits[0].object.userData.nodeId : null;
    if (id && id !== 'hub') {
      const m = MISSIONS.find(x => x.id === id);
      this.focusNode(id);
      this.onSelect(m);
    } else if (!id) {
      this.unselect();
      this.onSelect(null);
    }
  }
  focusNode(id) {
    this.selectedId = id;
    const m = MISSIONS.find(x => x.id === id);
    const dir = m.pos.clone().sub(HUB).normalize();
    this.pivotT.copy(m.pos);
    this.radiusT = 34;
    const desiredYaw = Math.atan2(-dir.x, -dir.z);
    this.yawT = desiredYaw;
    this.pitchT = 0.28;
    this.autoRot = 0;
  }
  unselect() {
    this.selectedId = null;
    this.pivotT.copy(HUB); this.radiusT = 96; this.yawT = 0.12; this.pitchT = 0.32;
  }

  update(dt, input) {
    this.time += dt;
    // 相机拖拽 / 缩放
    if (input.mouse.dragging && !input.locked) {
      this.yawT -= input.mouse.dragDX * 0.005;
      this.pitchT = clamp(this.pitchT - input.mouse.dragDY * 0.004, 0.06, 1.2);
      this.autoRot = 0;
    }
    if (input.mouse.wheel) this.radiusT = clamp(this.radiusT * (1 + input.mouse.wheel * 0.09), 22, 170);
    this.yawT += this.autoRot * dt;
    this.yaw = damp(this.yaw, this.yawT, 6, dt);
    this.pitch = damp(this.pitch, this.pitchT, 6, dt);
    this.radius = damp(this.radius, this.radiusT, 5, dt);
    this.pivot.lerp(this.pivotT, 1 - Math.exp(-3.5 * dt));
    const cp = Math.cos(this.pitch);
    this.cam.position.set(
      this.pivot.x + Math.sin(this.yaw) * cp * this.radius,
      this.pivot.y + Math.sin(this.pitch) * this.radius,
      this.pivot.z + Math.cos(this.yaw) * cp * this.radius
    );
    this.cam.lookAt(this.pivot.x, this.pivot.y + 2, this.pivot.z);

    // 节点动画
    const all = Object.entries(this.nodeGroups);
    all.forEach(([id, g], idx) => {
      const ud = g.userData;
      g.position.y += Math.sin(this.time * 0.7 + idx * 2) * 0.004;
      ud.ring.rotation.z += dt * 0.8;
      ud.ring.rotation.x = Math.PI / 2.6 + Math.sin(this.time * 0.9 + idx) * 0.12;
      ud.rim.material.opacity = 0.6 + 0.35 * Math.sin(this.time * 2 + idx);
      const target = id === this.hoverId || id === this.selectedId ? 1 : 0;
      ud.hover = damp(ud.hover, target, 8, dt);
      ud.sel.material.opacity = ud.hover * (0.55 + 0.3 * Math.sin(this.time * 4));
      const s = 1 + ud.hover * 0.06;
      ud.sel.scale.setScalar(s);
      ud.beam.material.opacity = 0.12 + ud.hover * 0.25 + 0.05 * Math.sin(this.time * 1.6 + idx);
    });
    // 中枢
    this.hub.userData.ring.rotation.z += dt * 0.5;
    if (this.hub.userData.dock) this.hub.userData.dock.material.opacity = 0.6 + 0.3 * Math.sin(this.time * 2);

    // 航线光脉冲
    this.pulses.forEach(p => {
      p.u = (p.u + dt * p.speed) % 1;
      p.sp.position.copy(p.curve.getPointAt(p.u));
      const sc = 0.7 + 0.5 * Math.sin(p.u * Math.PI);
      p.sp.scale.setScalar(sc * 2.2);
    });
    // 飞船
    this.flagship.position.y = HUB.y + 4.4 + Math.sin(this.time * 1.1) * 0.5;
    this.flagship.rotation.y = Math.sin(this.time * 0.5) * 0.25;
    this.patrols.forEach(p => {
      p.u = (p.u + dt * p.speed) % 1;
      const pos = p.curve.getPointAt(p.u);
      const tan = p.curve.getTangentAt(p.u);
      p.ship.position.copy(pos);
      p.ship.lookAt(pos.clone().add(tan));
      p.ship.rotation.z = Math.sin(this.time * 2 + p.u * 9) * 0.12;
    });
    // 远景
    this.distant.forEach((d, i) => { d.g.position.y += Math.sin(this.time * d.sp + i) * 0.006; d.g.rotation.y += dt * 0.03; });
    this.starsA.rotation.y += dt * 0.0035;
    this.starsB.rotation.y += dt * 0.008;
    this.planet.rotation.y += dt * 0.01;

    this.handleMove(input);
    this.fx.update(dt);
  }

  render(composer) { composer.render(); }
  resize() { this.cam.aspect = innerWidth / innerHeight; this.cam.updateProjectionMatrix(); }
  dispose() { disposeScene(this.scene); }
}
