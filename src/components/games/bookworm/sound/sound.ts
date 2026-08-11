/**
 * Sound stubs — ready for assets later. No-ops when muted or missing audio.
 */

export type SoundId =
  | "eat"
  | "combo"
  | "speed"
  | "complete"
  | "gameover"
  | "countdown"
  | "go";

type SoundApi = {
  muted: boolean;
  setMuted: (m: boolean) => void;
  play: (id: SoundId) => void;
};

let muted = false;

export function createSoundApi(initialMuted = false): SoundApi {
  muted = initialMuted;
  return {
    get muted() {
      return muted;
    },
    setMuted(m: boolean) {
      muted = m;
    },
    play(_id: SoundId) {
      if (muted) return;
      // Intentionally empty until ReadLife ships SFX assets.
    },
  };
}
