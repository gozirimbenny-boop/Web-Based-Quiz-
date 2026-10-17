// Tiny synthesised sound effects (Web Audio) — no audio files to download.
let ctx;
let muted = false;

export const setMuted = (m) => {
  muted = m;
};

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, dur, { type = 'sine', vol = 0.18, slide } = {}) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + start;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

const SOUNDS = {
  tap: () => tone(660, 0, 0.06, { type: 'triangle', vol: 0.08 }),
  correct: () => {
    tone(660, 0, 0.12, { type: 'triangle' });
    tone(990, 0.09, 0.18, { type: 'triangle' });
  },
  wrong: () => tone(220, 0, 0.3, { type: 'sawtooth', vol: 0.09, slide: 140 }),
  combo: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.06, 0.12, { type: 'square', vol: 0.06 })),
  streakLost: () => [494, 440, 392, 330].forEach((f, i) => tone(f, i * 0.12, 0.2, { type: 'triangle', vol: 0.14 })),
  tick: () => tone(1200, 0, 0.04, { type: 'square', vol: 0.05 }),
  go: () => {
    tone(523, 0, 0.12, { type: 'square', vol: 0.08 });
    tone(1046, 0.12, 0.3, { type: 'square', vol: 0.1 });
  },
  win: () =>
    [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, i * 0.11, i === 5 ? 0.5 : 0.14, { type: 'triangle', vol: 0.16 })),
  lose: () => [392, 370, 349, 262].forEach((f, i) => tone(f, i * 0.22, 0.3, { type: 'sine', vol: 0.16 })),
  levelUp: () => [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.07, 0.18, { type: 'triangle', vol: 0.13 })),
  badge: () => [880, 1175, 1568].forEach((f, i) => tone(f, i * 0.08, 0.2, { type: 'sine', vol: 0.14 })),
  timeUp: () => [880, 660, 880, 660].forEach((f, i) => tone(f, i * 0.12, 0.1, { type: 'square', vol: 0.07 })),
  pop: () => tone(500, 0, 0.08, { type: 'sine', vol: 0.12, slide: 900 }),
};

export function play(name) {
  if (muted) return;
  try {
    SOUNDS[name]?.();
  } catch {
    /* audio is optional */
  }
}
