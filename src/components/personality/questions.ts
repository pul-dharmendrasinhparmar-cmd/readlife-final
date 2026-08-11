import type { PersonalityQuestion } from "./types";

/**
 * Official ReadLife Reading Personality System v1.0 — question bank (verbatim).
 * Mix order in quiz UI; do not group by dimension for the user.
 */
export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  {
    id: "Q01",
    text: "I get excited by books that are completely different from what I normally read.",
    dimension: "EL",
    orientation: 1,
  },
  {
    id: "Q02",
    text: "When I find an author I love, I want to explore most of their other books.",
    dimension: "EL",
    orientation: -1,
  },
  {
    id: "Q03",
    text: "An unfamiliar genre makes a book more interesting to me rather than less.",
    dimension: "EL",
    orientation: 1,
  },
  {
    id: "Q04",
    text: "When I need a reliable read, I usually return to familiar kinds of books.",
    dimension: "EL",
    orientation: -1,
  },
  {
    id: "Q05",
    text: "I actively try books from countries, genres, formats or traditions outside my usual reading habits.",
    dimension: "EL",
    orientation: 1,
  },
  {
    id: "Q06",
    text: "Many of my favorite books share recognizable qualities.",
    dimension: "EL",
    orientation: -1,
  },
  {
    id: "Q07",
    text: "I would rather risk disliking something unusual than always stay inside my established taste.",
    dimension: "EL",
    orientation: 1,
  },
  {
    id: "Q08",
    text: "Once I discover the kind of story I love, I am happy reading variations of it repeatedly.",
    dimension: "EL",
    orientation: -1,
  },
  {
    id: "Q09",
    text: "When a book really works for me, I can completely forget about the world around me.",
    dimension: "IA",
    orientation: 1,
  },
  {
    id: "Q10",
    text: "Even while enjoying a book, part of my mind is evaluating how well it is written.",
    dimension: "IA",
    orientation: -1,
  },
  {
    id: "Q11",
    text: "How a book made me feel matters more than being able to explain technically why it worked.",
    dimension: "IA",
    orientation: 1,
  },
  {
    id: "Q12",
    text: "I frequently notice choices involving structure, prose, symbolism or characterization while reading.",
    dimension: "IA",
    orientation: -1,
  },
  {
    id: "Q13",
    text: "I become emotionally attached to fictional characters very easily.",
    dimension: "IA",
    orientation: 1,
  },
  {
    id: "Q14",
    text: "After finishing a book, I like identifying exactly what succeeded and failed.",
    dimension: "IA",
    orientation: -1,
  },
  {
    id: "Q15",
    text: "My favorite books are often the ones that made me feel completely consumed by the story.",
    dimension: "IA",
    orientation: 1,
  },
  {
    id: "Q16",
    text: "I enjoy examining a book almost as much as experiencing it.",
    dimension: "IA",
    orientation: -1,
  },
  {
    id: "Q17",
    text: "I like deciding several of my upcoming reads in advance.",
    dimension: "PM",
    orientation: 1,
  },
  {
    id: "Q18",
    text: "A monthly TBR is more of a suggestion than an actual commitment.",
    dimension: "PM",
    orientation: -1,
  },
  {
    id: "Q19",
    text: "Reading goals and challenges make my reading life more satisfying.",
    dimension: "PM",
    orientation: 1,
  },
  {
    id: "Q20",
    text: "What I read next depends heavily on my exact mood at that moment.",
    dimension: "PM",
    orientation: -1,
  },
  {
    id: "Q21",
    text: "I like knowing which few books I am likely to read next.",
    dimension: "PM",
    orientation: 1,
  },
  {
    id: "Q22",
    text: "I regularly abandon my planned next read because something else suddenly sounds better.",
    dimension: "PM",
    orientation: -1,
  },
  {
    id: "Q23",
    text: "Organizing my reading gives me almost as much satisfaction as completing books.",
    dimension: "PM",
    orientation: 1,
  },
  {
    id: "Q24",
    text: "My reading choices often surprise even me.",
    dimension: "PM",
    orientation: -1,
  },
  {
    id: "Q25",
    text: "Finishing an amazing book immediately makes me want someone to discuss it with.",
    dimension: "SO",
    orientation: 1,
  },
  {
    id: "Q26",
    text: "Some of my favorite reading experiences are ones I keep almost entirely to myself.",
    dimension: "SO",
    orientation: -1,
  },
  {
    id: "Q27",
    text: "Recommendations from people whose taste I trust significantly affect my choices.",
    dimension: "SO",
    orientation: 1,
  },
  {
    id: "Q28",
    text: "I prefer forming my own opinion before seeing what everyone else thought.",
    dimension: "SO",
    orientation: -1,
  },
  {
    id: "Q29",
    text: "Buddy reads, reading parties or book clubs can make a book more enjoyable for me.",
    dimension: "SO",
    orientation: 1,
  },
  {
    id: "Q30",
    text: "Reading is one of the ways I retreat from social interaction.",
    dimension: "SO",
    orientation: -1,
  },
  {
    id: "Q31",
    text: "I enjoy recommending books to other people.",
    dimension: "SO",
    orientation: 1,
  },
  {
    id: "Q32",
    text: "Even when I love a book, I don't necessarily feel a need to talk about it with anyone.",
    dimension: "SO",
    orientation: -1,
  }
];

/** Stable mixed display order (not grouped by dimension). */
export const QUIZ_QUESTION_ORDER: string[] = [
  "Q01", "Q09", "Q17", "Q25", "Q02", "Q10", "Q18", "Q26",
  "Q03", "Q11", "Q19", "Q27", "Q04", "Q12", "Q20", "Q28",
  "Q05", "Q13", "Q21", "Q29", "Q06", "Q14", "Q22", "Q30",
  "Q07", "Q15", "Q23", "Q31", "Q08", "Q16", "Q24", "Q32",
];

export function getOrderedQuestions(): PersonalityQuestion[] {
  const byId = Object.fromEntries(PERSONALITY_QUESTIONS.map((q) => [q.id, q]));
  return QUIZ_QUESTION_ORDER.map((id) => byId[id]);
}
