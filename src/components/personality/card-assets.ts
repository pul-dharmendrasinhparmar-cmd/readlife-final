import type { PersonalityCode } from "./types";

export type PersonalityCardAssets = {
  front: string;
  back: string;
};

export const PERSONALITY_CARD_ASSETS: Record<
  PersonalityCode,
  PersonalityCardAssets
> = {
  EIPS: {
    front: "/personality/cards/EIPS-front.png",
    back: "/personality/cards/EIPS-back.png",
  },
  EIPO: {
    front: "/personality/cards/EIPO-front.png",
    back: "/personality/cards/EIPO-back.png",
  },
  EAPS: {
    front: "/personality/cards/EAPS-front.png",
    back: "/personality/cards/EAPS-back.png",
  },
  EAPO: {
    front: "/personality/cards/EAPO-front.png",
    back: "/personality/cards/EAPO-back.png",
  },
  EIMS: {
    front: "/personality/cards/EIMS-front.png",
    back: "/personality/cards/EIMS-back.png",
  },
  EIMO: {
    front: "/personality/cards/EIMO-front.png",
    back: "/personality/cards/EIMO-back.png",
  },
  EAMS: {
    front: "/personality/cards/EAMS-front.png",
    back: "/personality/cards/EAMS-back.png",
  },
  EAMO: {
    front: "/personality/cards/EAMO-front.png",
    back: "/personality/cards/EAMO-back.png",
  },
  LIPS: {
    front: "/personality/cards/LIPS-front.png",
    back: "/personality/cards/LIPS-back.png",
  },
  LIPO: {
    front: "/personality/cards/LIPO-front.png",
    back: "/personality/cards/LIPO-back.png",
  },
  LAPS: {
    front: "/personality/cards/LAPS-front.png",
    back: "/personality/cards/LAPS-back.png",
  },
  LAPO: {
    front: "/personality/cards/LAPO-front.png",
    back: "/personality/cards/LAPO-back.png",
  },
  LIMS: {
    front: "/personality/cards/LIMS-front.png",
    back: "/personality/cards/LIMS-back.png",
  },
  LIMO: {
    front: "/personality/cards/LIMO-front.png",
    back: "/personality/cards/LIMO-back.png",
  },
  LAMS: {
    front: "/personality/cards/LAMS-front.png",
    back: "/personality/cards/LAMS-back.png",
  },
  LAMO: {
    front: "/personality/cards/LAMO-front.png",
    back: "/personality/cards/LAMO-back.png",
  },
};

export function getPersonalityCardAssets(
  code: PersonalityCode,
): PersonalityCardAssets {
  return PERSONALITY_CARD_ASSETS[code];
}
