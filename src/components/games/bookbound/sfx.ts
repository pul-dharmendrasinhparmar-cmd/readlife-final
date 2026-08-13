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
  type: OscillatorType = "sine",
  gain = 0.045,
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
  jump: () => tone(520, 0.09, "triangle", 0.035),
  page: () => {
    tone(640, 0.06, "sine", 0.04);
    setTimeout(() => tone(880, 0.08, "triangle", 0.04), 40);
  },
  golden: () => {
    tone(523, 0.08, "triangle", 0.045);
    setTimeout(() => tone(659, 0.08, "triangle", 0.045), 70);
    setTimeout(() => tone(784, 0.12, "sine", 0.05), 140);
  },
  ink: () => tone(280, 0.07, "square", 0.03),
  defeat: () => {
    tone(200, 0.08, "sine", 0.04);
    setTimeout(() => tone(140, 0.12, "triangle", 0.035), 60);
  },
  dragon: () => {
    tone(90, 0.18, "sawtooth", 0.03);
    setTimeout(() => tone(70, 0.22, "sawtooth", 0.025), 80);
  },
  hurt: () => tone(180, 0.12, "square", 0.03),
  complete: () => {
    tone(392, 0.1, "triangle", 0.045);
    setTimeout(() => tone(523, 0.1, "triangle", 0.045), 90);
    setTimeout(() => tone(659, 0.16, "sine", 0.05), 180);
  },
  checkpoint: () => {
    tone(440, 0.07, "sine", 0.03);
    setTimeout(() => tone(660, 0.1, "triangle", 0.035), 70);
  },
};
