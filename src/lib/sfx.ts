// "Sacred" sound effects for the card viewer, synthesized with Web Audio (no audio files), one pair per kind
// of card: what plays when it turns to its back, and what plays when it turns back and closes. Saints get an
// organ-and-choir "Amen", Popes a festive peal, demons a low dissonant organ, scourges a minor Amen,
// mourning silence, miracles a harp and a bright choir. Muting is remembered in the browser.

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
const VOWELS = {
  aah: [
    [730, 1, 8],
    [1090, 0.45, 9],
    [2440, 0.12, 10],
  ],
  ooh: [
    [450, 1, 8],
    [800, 0.35, 9],
    [2830, 0.06, 10],
  ],
};

function choir(a: AudioContext, out: AudioNode, notes: number[], at: number, length: number, gain: number, vowel: keyof typeof VOWELS = 'aah', voices = 6) {
  const env = a.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(gain, at + 0.25);
  env.gain.setValueAtTime(gain, at + length - 0.2);
  env.gain.linearRampToValueAtTime(0, at + length);
  const lowpass = a.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 3200;
  lowpass.connect(env).connect(out);
  const formants = VOWELS[vowel].map(([f, level, q]) => {
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
    for (let v = 0; v < voices; v++) {
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

/** Organ reed stop (trumpet): bright sawtooth through a low-pass, for the Popes' fanfare. */
function trumpet(a: AudioContext, out: AudioNode, n: number, at: number, length: number, gain: number) {
  const osc = a.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = midi(n);
  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2400;
  const g = a.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gain, at + 0.03);
  g.gain.setValueAtTime(gain, at + length - 0.05);
  g.gain.linearRampToValueAtTime(0, at + length);
  osc.connect(lp).connect(g).connect(out);
  osc.start(at);
  osc.stop(at + length + 0.02);
}

/** Harp: plucked strings, quick attack and a ringing decay. */
function harp(a: AudioContext, out: AudioNode, n: number, at: number, gain: number) {
  for (const [ratio, level] of [
    [1, 1],
    [2, 0.4],
    [3, 0.15],
  ]) {
    const osc = a.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = midi(n) * ratio;
    const g = a.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(gain * level, at + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 1.2);
    osc.connect(g).connect(out);
    osc.start(at);
    osc.stop(at + 1.25);
  }
}

/** Low rumble: filtered noise, for the demons. */
function rumble(a: AudioContext, out: AudioNode, at: number, length: number, gain: number) {
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * length), a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 140;
  const g = a.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gain, at + length * 0.3);
  g.gain.linearRampToValueAtTime(0, at + length);
  src.connect(lp).connect(g).connect(out);
  src.start(at);
}

/** Demon organ: a low sawtooth cluster around the tritone, sagging in pitch. */
function hellOrgan(a: AudioContext, out: AudioNode, at: number, length: number, gain: number) {
  const env = a.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(gain, at + 0.1);
  env.gain.setValueAtTime(gain, at + length - 0.3);
  env.gain.linearRampToValueAtTime(0, at + length);
  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(1800, at);
  lp.frequency.linearRampToValueAtTime(500, at + length);
  lp.connect(env).connect(out);
  for (const n of [36, 42, 48, 51, 54]) {
    // C2 F#2 C3 Eb3 F#3: diabolus in musica.
    const osc = a.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = midi(n);
    osc.detune.setValueAtTime(0, at + 0.3);
    osc.detune.linearRampToValueAtTime(-60, at + length);
    const g = a.createGain();
    g.gain.value = 0.25;
    osc.connect(g).connect(lp);
    osc.start(at);
    osc.stop(at + length + 0.05);
  }
}

/** What a card plays: by kind of card (data-sound on its figure). */
export type SoundKind = 'santo' | 'beato' | 'padre' | 'papa' | 'demone' | 'flagello' | 'lutto' | 'miracolo';

const F = [53, 60, 65, 69]; // F3 C4 F4 A4
const C = [48, 60, 64, 67]; // C3 C4 E4 G4

const reveal: Record<SoundKind, (a: AudioContext, t: number) => void> = {
  // "A-men" on organ and choir, F major then C major, and a high bell.
  santo: (a, t) => {
    const out = bus(a, 1.4);
    organ(a, out, F, t, 0.5, 0.32);
    organ(a, out, C, t + 0.47, 1, 0.32);
    choir(a, out, [65, 69, 72], t, 0.53, 0.22);
    choir(a, out, [64, 67, 72], t + 0.47, 1.07, 0.22);
    bell(a, out, midi(84), t, 0.07, 0.4);
  },
  // Not yet canonized: the choir alone, softer, no organ.
  beato: (a, t) => {
    const out = bus(a, 1.5);
    choir(a, out, [65, 69, 72], t, 0.55, 0.2);
    choir(a, out, [64, 67, 72], t + 0.5, 1.1, 0.2);
    bell(a, out, midi(88), t + 0.5, 0.05, 0.4);
  },
  // Church Fathers: a line of plainchant in D Dorian over an organ drone.
  padre: (a, t) => {
    const out = bus(a, 1.5);
    organ(a, out, [38, 50], t, 1.5, 0.18);
    [50, 53, 55, 57, 55, 53, 50].forEach((n, i) => choir(a, out, [n], t + i * 0.2, 0.26, 0.28, 'ooh', 5));
  },
  // Habemus Papam: trumpet fanfare, full organ and a peal of bells.
  papa: (a, t) => {
    const out = bus(a, 1.2);
    [60, 64, 67].forEach((n, i) => trumpet(a, out, n, t + i * 0.13, 0.13, 0.07));
    trumpet(a, out, 72, t + 0.39, 0.9, 0.08);
    organ(a, out, [48, 55, 60, 64, 67, 72], t + 0.39, 1.1, 0.34);
    [79, 76, 72, 67].forEach((n, i) => bell(a, out, midi(n), t + 0.39 + i * 0.18, 0.08, 0.45));
  },
  // Diabolus in musica: a low, sagging dissonant organ over a rumble.
  demone: (a, t) => {
    const out = bus(a, 1.2);
    hellOrgan(a, out, t, 1.5, 0.3);
    rumble(a, out, t, 1.5, 0.5);
  },
  // A minor Amen (F minor to C minor), slower, ending on a low toll.
  flagello: (a, t) => {
    const out = bus(a, 1.4);
    organ(a, out, [53, 60, 65, 68], t, 0.65, 0.3);
    organ(a, out, [48, 60, 63, 67], t + 0.6, 1.1, 0.3);
    bell(a, out, midi(55), t + 0.6, 0.12, 0.6);
  },
  // Mourning: silence.
  lutto: () => {},
  // A harp running up, then a bright choir and chimes.
  miracolo: (a, t) => {
    const out = bus(a, 1.4);
    [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84].forEach((n, i) => harp(a, out, n, t + i * 0.045, 0.06));
    choir(a, out, [72, 76, 79], t + 0.4, 1.2, 0.2);
    [96, 91, 88].forEach((n, i) => bell(a, out, midi(n), t + 0.45 + i * 0.12, 0.03, 0.35));
  },
};

const close: Record<SoundKind, (a: AudioContext, t: number) => void> = {
  santo: (a, t) => bell(a, bus(a, 1.1), midi(67), t, 0.22, 0.47),
  beato: (a, t) => bell(a, bus(a, 1.1), midi(72), t, 0.16, 0.45),
  padre: (a, t) => bell(a, bus(a, 1.2), midi(62), t, 0.2, 0.5),
  papa: (a, t) => {
    const out = bus(a, 1.1);
    bell(a, out, midi(72), t, 0.16, 0.45);
    bell(a, out, midi(67), t + 0.2, 0.18, 0.5);
  },
  // A gong from below.
  demone: (a, t) => {
    const out = bus(a, 1.2);
    bell(a, out, midi(43), t, 0.25, 0.5);
    rumble(a, out, t, 0.8, 0.35);
  },
  flagello: (a, t) => bell(a, bus(a, 1.2), midi(55), t, 0.2, 0.5),
  lutto: () => {},
  miracolo: (a, t) => bell(a, bus(a, 1.1), midi(79), t, 0.16, 0.4),
};

/** The card turns to its back. */
export function playReveal(kind: SoundKind = 'santo') {
  const a = audio();
  if (a) (reveal[kind] ?? reveal.santo)(a, a.currentTime + 0.02);
}

/** The card turns back and closes. */
export function playClose(kind: SoundKind = 'santo') {
  const a = audio();
  if (a) (close[kind] ?? close.santo)(a, a.currentTime + 0.02);
}
