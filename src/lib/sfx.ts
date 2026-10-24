// "Sacred" sound effects for the card viewer, synthesized with Web Audio (no audio files):
// an organ-and-choir "Amen" (plagal cadence, F → C) in a long church reverb when the card turns to its
// back, a church bell toll when it turns back. Muting is remembered in the browser.

let ctx: AudioContext | null = null;
const KEY = 'sfx-muted';

export function muted() {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setMuted(value: boolean) {
  try {
    localStorage.setItem(KEY, value ? '1' : '0');
  } catch {}
}

function audio() {
  if (muted()) return null;
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);

/** Pipe organ: sine ranks at 8', 4', 2 2/3', 2' and 16', slow speech and a little wind noise. */
function organ(a: AudioContext, out: AudioNode, notes: number[], at: number, length: number, gain: number) {
  const env = a.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(gain, at + 0.08);
  env.gain.setValueAtTime(gain, at + length - 0.15);
  env.gain.linearRampToValueAtTime(0, at + length);
  env.connect(out);
  for (const n of notes) {
    for (const [ratio, level] of [
      [0.5, 0.35],
      [1, 1],
      [2, 0.55],
      [3, 0.22],
      [4, 0.28],
      [6, 0.08],
    ]) {
      const osc = a.createOscillator();
      const g = a.createGain();
      osc.frequency.value = midi(n) * ratio;
      osc.detune.value = (Math.random() - 0.5) * 4;
      g.gain.value = level / notes.length;
      osc.connect(g).connect(env);
      osc.start(at);
      osc.stop(at + length + 0.05);
    }
  }
}

/** Choir "aah": many slightly out-of-tune voices per note, through the formants of an open A. */
function choir(a: AudioContext, out: AudioNode, notes: number[], at: number, length: number, gain: number) {
  const env = a.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(gain, at + 0.25);
  env.gain.setValueAtTime(gain, at + length - 0.2);
  env.gain.linearRampToValueAtTime(0, at + length);
  const lowpass = a.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 3200;
  lowpass.connect(env).connect(out);
  const formants = [
    [730, 1, 8],
    [1090, 0.45, 9],
    [2440, 0.12, 10],
  ].map(([f, level, q]) => {
    const bp = a.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = f;
    bp.Q.value = q;
    const g = a.createGain();
    g.gain.value = level;
    bp.connect(g).connect(lowpass);
    return bp;
  });
  for (const n of notes) {
    for (let v = 0; v < 6; v++) {
      const osc = a.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = midi(n);
      osc.detune.value = (Math.random() - 0.5) * 22;
      const lfo = a.createOscillator();
      const depth = a.createGain();
      lfo.frequency.value = 4.8 + Math.random() * 1.2;
      depth.gain.value = 9;
      lfo.connect(depth).connect(osc.detune);
      for (const f of formants) osc.connect(f);
      const start = at + Math.random() * 0.06;
      osc.start(start);
      lfo.start(start);
      osc.stop(at + length + 0.05);
      lfo.stop(at + length + 0.05);
    }
  }
}

/** Church bell: hum, prime, minor-third tierce, quint, nominal and upper partials, each with its own decay. */
function bell(a: AudioContext, out: AudioNode, nominal: number, at: number, gain: number, ring = 1) {
  for (const [ratio, level, decay] of [
    [0.25, 0.55, 7],
    [0.5, 0.7, 5],
    [0.6, 0.6, 3.5],
    [0.75, 0.3, 3],
    [1, 1, 2.6],
    [1.5, 0.35, 1.5],
    [2, 0.25, 1.1],
    [2.6, 0.12, 0.7],
  ]) {
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.frequency.value = nominal * ratio;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(gain * level, at + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, at + decay * ring);
    osc.connect(g).connect(out);
    osc.start(at);
    osc.stop(at + decay * ring + 0.05);
  }
}

/** Nave reverb: a short pre-delay and a long, darkening noise tail. */
function reverb(a: AudioContext, seconds: number) {
  const len = Math.floor(a.sampleRate * seconds);
  const pre = Math.floor(a.sampleRate * 0.03);
  const ir = a.createBuffer(2, len, a.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch);
    let lp = 0;
    for (let i = pre; i < len; i++) {
      const tt = (i - pre) / (len - pre);
      // Low-pass that closes as the tail goes on: stone absorbs the highs first.
      const k = 0.6 - 0.5 * tt;
      lp += k * (Math.random() * 2 - 1 - lp);
      data[i] = lp * (1 - tt) ** 2.2;
    }
  }
  const conv = a.createConvolver();
  conv.buffer = ir;
  return conv;
}

function bus(a: AudioContext, wetLevel: number, tail = 3) {
  const master = a.createGain();
  master.gain.value = 1;
  const dry = a.createGain();
  dry.gain.value = 0.55;
  const wet = a.createGain();
  wet.gain.value = wetLevel;
  const comp = a.createDynamicsCompressor();
  master.connect(dry).connect(comp);
  master.connect(reverb(a, tail)).connect(wet).connect(comp);
  comp.connect(a.destination);
  return master;
}

/** The card turns to its back: "A-men" on organ and choir, F major then C major, and a high bell. */
export function playReveal() {
  const a = audio();
  if (!a) return;
  const out = bus(a, 1.4);
  const t = a.currentTime + 0.02;
  const F = [53, 60, 65, 69]; // F3 C4 F4 A4
  const C = [48, 60, 64, 67]; // C3 C4 E4 G4
  organ(a, out, F, t, 0.5, 0.32);
  organ(a, out, C, t + 0.47, 1, 0.32);
  choir(a, out, [65, 69, 72], t, 0.53, 0.22);
  choir(a, out, [64, 67, 72], t + 0.47, 1.07, 0.22);
  bell(a, out, midi(84), t, 0.07, 0.4);
}

/** The card turns back and closes: one church bell toll. */
export function playClose() {
  const a = audio();
  if (!a) return;
  bell(a, bus(a, 1.1), midi(67), a.currentTime + 0.02, 0.22, 0.47);
}
