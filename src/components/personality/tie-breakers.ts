import type { TieBreaker } from "./types";

/** Official ReadLife Reading Personality System v1.0 — tie-breakers (verbatim). */
export const TIE_BREAKERS: TieBreaker[] = [
  {
    id: "tb-el",
    dimension: "EL",
    prompt: "You're choosing between two equally promising books.\n\nOne is very similar to several books you already love.\n\nThe other is unlike anything you've read before.\n\nWhich feels more exciting?",
    optionA: {
      letter: "E",
      label: "Something completely new.",
      blurb: "",
    },
    optionB: {
      letter: "L",
      label: "Something I already know fits me.",
      blurb: "",
    },
  },
  {
    id: "tb-ia",
    dimension: "IA",
    prompt: "You finish an incredible book.\n\nWhat are you more likely to do first?",
    optionA: {
      letter: "I",
      label: "Sit there emotionally processing what just happened.",
      blurb: "",
    },
    optionB: {
      letter: "A",
      label: "Start thinking about exactly how the author pulled it off.",
      blurb: "",
    },
  },
  {
    id: "tb-pm",
    dimension: "PM",
    prompt: "You planned to read Book A tonight, but suddenly Book B feels irresistible.",
    optionA: {
      letter: "P",
      label: "Stick with Book A.",
      blurb: "",
    },
    optionB: {
      letter: "M",
      label: "Obviously read Book B.",
      blurb: "",
    },
  },
  {
    id: "tb-so",
    dimension: "SO",
    prompt: "You finish a five-star book at midnight.",
    optionA: {
      letter: "S",
      label: "I need someone to talk to about this.",
      blurb: "",
    },
    optionB: {
      letter: "O",
      label: "I want to sit with this feeling myself first.",
      blurb: "",
    },
  }
];

export function getTieBreaker(dimension: TieBreaker["dimension"]) {
  return TIE_BREAKERS.find((t) => t.dimension === dimension)!;
}
