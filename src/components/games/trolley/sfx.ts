/** Tiny Web Audio beeps — no external files required. */

let ctx: AudioContext | null = null;
let muted = false;

function ac(): AudioContext | null {
  if (muted) return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMuted(next: boolean) {
  muted = next;
}

export function isMuted() {
  return muted;
}

function tone(
  freq: number,
  dur = 0.08,
  type: OscillatorType = "square",
  gain = 0.04,
) {
  const audio = ac();
  if (!audio) return;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(audio.destination);
  const t = audio.currentTime;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t);
  osc.stop(t + dur);
}

export const sfx = {
  catchGood: () => {
    tone(520, 0.06);
    setTimeout(() => tone(720, 0.07), 40);
  },
  catchRare: () => {
    tone(440, 0.06);
    setTimeout(() => tone(660, 0.07), 50);
    setTimeout(() => tone(880, 0.1, "triangle", 0.05), 100);
  },
  catchBad: () => tone(160, 0.12, "sawtooth", 0.035),
  tick: () => tone(300, 0.03, "sine", 0.02),
  spark: () => {
    tone(600, 0.08, "triangle", 0.05);
    setTimeout(() => tone(900, 0.12, "triangle", 0.05), 80);
  },
  gameOver: () => {
    tone(300, 0.1);
    setTimeout(() => tone(220, 0.12), 90);
    setTimeout(() => tone(160, 0.18), 180);
  },
};
