// "Sacred" sound effects for the card viewer, synthesized with Web Audio (no audio files):
// a short choir swell with a bell when the card turns to its back, a single soft bell when it closes.
// Muting is remembered in the browser.

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

/** Church bell: inharmonic partials with long, staggered decays. */
function bell(a: AudioContext, out: AudioNode, freq: number, at: number, gain: number) {
  for (const [ratio, level, decay] of [
    [0.5, 0.5, 3.2],
    [1, 1, 2.6],
    [1.19, 0.45, 2],
    [1.5, 0.35, 1.6],
    [2, 0.4, 1.3],
    [2.74, 0.2, 0.9],
    [4.07, 0.12, 0.6],
  ]) {
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.frequency.value = freq * ratio;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(gain * level, at + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    osc.connect(g).connect(out);
    osc.start(at);
    osc.stop(at + decay + 0.05);
  }
}

/** Choir "aah": detuned sawtooth voices through vowel formants, swelling in and out. */
function choir(a: AudioContext, out: AudioNode, notes: number[], at: number, length: number, gain: number) {
  const env = a.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(gain, at + length * 0.35);
  env.gain.linearRampToValueAtTime(gain * 0.8, at + length * 0.7);
  env.gain.exponentialRampToValueAtTime(0.0001, at + length);
  const formants = [
    [800, 1],
    [1150, 0.5],
    [2900, 0.18],
  ].map(([f, level]) => {
    const bp = a.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = f;
    bp.Q.value = 6;
    const g = a.createGain();
    g.gain.value = level;
    bp.connect(g).connect(env);
    return bp;
  });
  env.connect(out);
  for (const freq of notes) {
    for (const detune of [-9, 0, 8]) {
      const osc = a.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      osc.detune.value = detune;
      // Slow vibrato, like many singers not quite together.
      const lfo = a.createOscillator();
      const depth = a.createGain();
      lfo.frequency.value = 4.5 + Math.random();
      depth.gain.value = 6;
      lfo.connect(depth).connect(osc.detune);
      for (const f of formants) osc.connect(f);
      osc.start(at);
      lfo.start(at);
      osc.stop(at + length + 0.1);
      lfo.stop(at + length + 0.1);
    }
  }
}

/** Simple reverb tail: decaying noise as an impulse response. */
function reverb(a: AudioContext) {
  const len = a.sampleRate * 2.5;
  const ir = a.createBuffer(2, len, a.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  }
  const conv = a.createConvolver();
  conv.buffer = ir;
  return conv;
}

function bus(a: AudioContext) {
  const master = a.createGain();
  master.gain.value = 1.5;
  const wet = a.createGain();
  wet.gain.value = 0.45;
  const verb = reverb(a);
  master.connect(a.destination);
  master.connect(verb).connect(wet).connect(a.destination);
  return master;
}

/** The card turns to its back: choir in C major and a bell. */
export function playReveal() {
  const a = audio();
  if (!a) return;
  const out = bus(a);
  const t = a.currentTime + 0.02;
  choir(a, out, [261.63, 329.63, 392, 523.25], t, 1.8, 0.09);
  bell(a, out, 1046.5, t + 0.35, 0.05);
}

/** The card turns back and closes: one soft, lower bell. */
export function playClose() {
  const a = audio();
  if (!a) return;
  bell(a, bus(a), 784, a.currentTime + 0.02, 0.04);
}
