// ============================================================
// audio.js — WebAudio 程序化合成：音效 + 自适应 BGM（星图 / 战斗 / Boss）
// ============================================================
const NOTE = (n => {
  const map = { C: -9, 'C#': -8, D: -7, 'D#': -6, E: -5, F: -4, 'F#': -3, G: -2, 'G#': -1, A: 0, 'A#': 1, B: 2 };
  return name => {
    const m = /^([A-G]#?)(-?\d)$/.exec(name);
    const semi = map[m[1]] + (parseInt(m[2], 10) - 4) * 12;
    return 440 * Math.pow(2, semi / 12);
  };
})();

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.mode = 'none';
    this._timer = null;
    this._step = 0;
    this._nextT = 0;
  }

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    const ctx = this.ctx;

    this.master = ctx.createGain(); this.master.gain.value = 0.85; this.master.connect(ctx.destination);
    this.gMusic = ctx.createGain(); this.gMusic.gain.value = 0.34;
    this.gSfx = ctx.createGain(); this.gSfx.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    this.gMusic.connect(comp); this.gSfx.connect(comp); comp.connect(this.master);

    // 星空感延迟
    this.delay = ctx.createDelay(1.0); this.delay.delayTime.value = 0.38;
    this.fb = ctx.createGain(); this.fb.gain.value = 0.34;
    this.wet = ctx.createGain(); this.wet.gain.value = 0.3;
    this.delay.connect(this.fb); this.fb.connect(this.delay); this.delay.connect(this.wet); this.wet.connect(this.gMusic);

    // 噪声缓冲
    const len = ctx.sampleRate * 2;
    this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  setMuted(m) {
    this.muted = m;
    if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.85, this.ctx.currentTime, 0.05);
  }

  // ---------------- 基础合成器 ----------------
  _env(g, t0, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  }
  tone({ type = 'sine', f = 440, f2, dur = 0.2, vol = 0.3, at = 0, out }) {
    const ctx = this.ctx; if (!ctx) return;
    const t0 = ctx.currentTime + at;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + dur);
    this._env(g, t0, 0.008, vol, dur);
    o.connect(g);
    const target = out || this.gSfx;
    g.connect(target);
    if (Math.random() < 0.35) g.connect(this.delay);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  noise({ dur = 0.2, vol = 0.3, at = 0, type = 'lowpass', freq = 1200, q = 1, f2 }) {
    const ctx = this.ctx; if (!ctx) return;
    const t0 = ctx.currentTime + at;
    const src = ctx.createBufferSource(); src.buffer = this.noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t0); f.Q.value = q;
    if (f2) f.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(this.gSfx);
    src.start(t0); src.stop(t0 + dur + 0.05);
  }

  // ---------------- 具体音效 ----------------
  uiClick() { this.tone({ type: 'triangle', f: 880, f2: 660, dur: 0.08, vol: 0.18 }); }
  uiHover() { this.tone({ type: 'sine', f: 1320, dur: 0.05, vol: 0.06 }); }
  deploy() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone({ type: 'triangle', f, dur: 0.5, vol: 0.16, at: i * 0.07 }));
    this.noise({ dur: 0.9, vol: 0.12, type: 'lowpass', freq: 400, f2: 2400, at: 0.1 });
  }
  swish() { this.noise({ dur: 0.16, vol: 0.18, type: 'bandpass', freq: 3200, f2: 900, q: 1.6 }); }
  hit(strong = 0) {
    this.tone({ type: 'sine', f: 220 + strong * 80, f2: 60, dur: 0.14, vol: 0.5 });
    this.noise({ dur: 0.1, vol: 0.3, type: 'bandpass', freq: 2400, q: 1.2 });
    if (strong) this.tone({ type: 'triangle', f: 660, f2: 220, dur: 0.2, vol: 0.3 });
  }
  crit() {
    this.tone({ type: 'sawtooth', f: 520, f2: 180, dur: 0.22, vol: 0.22 });
    this.tone({ type: 'triangle', f: 1040, f2: 520, dur: 0.25, vol: 0.3 });
    this.noise({ dur: 0.18, vol: 0.35, type: 'highpass', freq: 1800 });
  }
  shoot() { this.tone({ type: 'sawtooth', f: 1400, f2: 320, dur: 0.16, vol: 0.16 }); this.noise({ dur: 0.1, vol: 0.08, type: 'highpass', freq: 2600 }); }
  enemyShoot() { this.tone({ type: 'square', f: 300, f2: 140, dur: 0.22, vol: 0.12 }); }
  explosion(big = 0) {
    this.noise({ dur: 0.5 + big * 0.4, vol: 0.55, type: 'lowpass', freq: 2600, f2: 120 });
    this.tone({ type: 'sine', f: 130, f2: 34, dur: 0.5 + big * 0.3, vol: 0.6 });
  }
  dash() { this.noise({ dur: 0.28, vol: 0.22, type: 'bandpass', freq: 700, f2: 3800, q: 0.8 }); }
  perfect() {
    [1568, 1976, 2349].forEach((f, i) => this.tone({ type: 'sine', f, dur: 0.5, vol: 0.22, at: i * 0.03 }));
    this.noise({ dur: 0.5, vol: 0.1, type: 'highpass', freq: 5000 });
  }
  hurt() { this.tone({ type: 'sawtooth', f: 200, f2: 90, dur: 0.22, vol: 0.35 }); this.noise({ dur: 0.18, vol: 0.2, type: 'lowpass', freq: 900 }); }
  die() { this.noise({ dur: 0.5, vol: 0.3, type: 'lowpass', freq: 1800, f2: 200 }); this.tone({ type: 'sawtooth', f: 400, f2: 70, dur: 0.45, vol: 0.2 }); }
  swap() { this.tone({ type: 'triangle', f: 520, f2: 1040, dur: 0.18, vol: 0.22 }); this.tone({ type: 'sine', f: 780, dur: 0.3, vol: 0.16, at: 0.05 }); }
  lock() { this.tone({ type: 'sine', f: 1200, f2: 1600, dur: 0.1, vol: 0.14 }); this.tone({ type: 'sine', f: 900, f2: 1200, dur: 0.1, vol: 0.12, at: 0.08 }); }
  exSkill() {
    this.tone({ type: 'sawtooth', f: 300, f2: 1200, dur: 0.35, vol: 0.2 });
    this.noise({ dur: 0.4, vol: 0.2, type: 'bandpass', freq: 2200, f2: 400 });
    [523, 784, 1046].forEach((f, i) => this.tone({ type: 'triangle', f, dur: 0.4, vol: 0.16, at: 0.1 + i * 0.06 }));
  }
  ultStart() {
    this.noise({ dur: 1.1, vol: 0.2, type: 'lowpass', freq: 300, f2: 3200 });
    [196, 261, 392, 523, 784].forEach((f, i) => this.tone({ type: 'sawtooth', f, dur: 0.9, vol: 0.12, at: i * 0.09 }));
  }
  ultHit() {
    this.explosion(1);
    [392, 523, 659, 784, 1046, 1318].forEach((f, i) => this.tone({ type: 'triangle', f, dur: 0.7, vol: 0.2, at: i * 0.04 }));
  }
  waveStart() { [392, 523, 659].forEach((f, i) => this.tone({ type: 'triangle', f, dur: 0.35, vol: 0.16, at: i * 0.09 })); }
  heal() { this.tone({ type: 'sine', f: 660, f2: 990, dur: 0.3, vol: 0.14 }); }

  // ---------------- BGM 音序器 ----------------
  setMode(mode) {
    if (!this.ctx || this.mode === mode) { this.mode = mode; return; }
    this.mode = mode;
    if (mode === 'none') { if (this._timer) { clearInterval(this._timer); this._timer = null; } return; }
    if (!this._timer) {
      this._step = 0; this._bar = 0;
      this._nextT = this.ctx.currentTime + 0.1;
      this._timer = setInterval(() => this._schedule(), 25);
    }
  }

  _drum(t, kind, strong) {
    const ctx = this.ctx;
    if (kind === 'kick') {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(strong ? 170 : 140, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.16);
      g.gain.setValueAtTime(strong ? 0.85 : 0.6, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.connect(g); g.connect(this.gMusic); o.start(t); o.stop(t + 0.25);
    } else if (kind === 'snare') {
      const src = ctx.createBufferSource(); src.buffer = this.noiseBuf;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.9;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.28, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      src.connect(f); f.connect(g); g.connect(this.gMusic); src.start(t); src.stop(t + 0.2);
    } else {
      const src = ctx.createBufferSource(); src.buffer = this.noiseBuf;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7500;
      const g = ctx.createGain(); g.gain.setValueAtTime(kind === 'hat' ? 0.1 : 0.05, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      src.connect(f); f.connect(g); g.connect(this.gMusic); src.start(t); src.stop(t + 0.06);
    }
  }
  _pad(t, freqs, dur, vol = 0.05) {
    freqs.forEach((f, i) => {
      const o = this.ctx.createOscillator(), o2 = this.ctx.createOscillator(), g = this.ctx.createGain(), f1 = this.ctx.createBiquadFilter();
      o.type = 'sawtooth'; o2.type = 'sawtooth';
      o.frequency.value = f; o2.frequency.value = f * 1.007;
      f1.type = 'lowpass'; f1.frequency.value = 700;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + dur * 0.3);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      o.connect(f1); o2.connect(f1); f1.connect(g); g.connect(this.gMusic); g.connect(this.delay);
      o.start(t); o2.start(t); o.stop(t + dur); o2.stop(t + dur);
    });
  }
  _bell(t, f, vol = 0.09, dur = 0.9) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.gMusic); g.connect(this.delay);
    o.start(t); o.stop(t + dur);
  }
  _bass(t, f, dur = 0.16, vol = 0.22) {
    const o = this.ctx.createOscillator(), f1 = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    o.type = 'square'; f1.type = 'lowpass'; f1.frequency.value = 500;
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(f1); f1.connect(g); g.connect(this.gMusic);
    o.start(t); o.stop(t + dur + 0.02);
  }

  _schedule() {
    if (this.mode === 'none' || !this.ctx) return;
    const bpm = this.mode === 'boss' ? 142 : this.mode === 'combat' ? 128 : 76;
    const spb = 60 / bpm, step16 = spb / 4;
    while (this._nextT < this.ctx.currentTime + 0.13) {
      const t = this._nextT, s = this._step, bar = Math.floor(s / 16), st = s % 16;

      if (this.mode === 'map') {
        const chords = [['A2', 'E3', 'A3', 'C4'], ['F2', 'C3', 'A3', 'C4'], ['C3', 'G3', 'C4', 'E4'], ['G2', 'D3', 'B3', 'D4']];
        if (st === 0) this._pad(t, chords[bar % 4].map(NOTE), spb * 8, 0.045);
        if (st === 0 || st === 8) this._drum(t, 'kick', false);
        if (st % 4 === 2) this._drum(t, 'oh', false);
        const bells = [[0, 0], [3, 1], [6, 2], [10, 3], [13, 4]];
        const b = bells.find(x => x[0] === st);
        if (b && Math.random() < 0.7) this._bell(t, NOTE(['A5', 'C6', 'E6', 'G6', 'D6'][b[1]]), 0.07, 1.4);
      } else {
        const minor = this.mode === 'boss';
        const roots = minor ? ['A1', 'A1', 'F1', 'G1'] : ['A1', 'A1', 'F1', 'G1'];
        // 鼓组
        if (st % 4 === 0) this._drum(t, 'kick', st === 0 || st === 8);
        if (st === 4 || st === 12) this._drum(t, 'snare', st === 4);
        this._drum(t, 'hat', false);
        if (minor && st === 14) this._drum(t, 'snare', true);
        // 贝斯
        const bassPat = [0, , 0, , 0, , 12, , 0, , 0, , 7, , 12, ];
        if (bassPat[st] !== undefined) {
          this._bass(t, NOTE(roots[bar % 4]) * Math.pow(2, bassPat[st] / 12), step16 * 1.6, minor ? 0.26 : 0.2);
        }
        // 琶音
        const scale = minor ? ['A4', 'C5', 'E5', 'F5', 'G5', 'E5', 'C5', 'G5'] : ['A4', 'C5', 'E5', 'G5', 'A5', 'E5', 'C5', 'G5'];
        if (st % 2 === 0 || minor) {
          const idx = [0, 2, 4, 6, 7, 5, 3, 1][(st / 2) | 0];
          this._bell(t, NOTE(scale[idx]), minor ? 0.05 : 0.06, 0.35);
        }
        if (st === 15) this._pad(t, [NOTE(roots[bar % 4]), NOTE(roots[bar % 4]) * 1.5], spb * 2, 0.025);
      }

      this._step++;
      this._nextT += step16;
    }
  }
}
