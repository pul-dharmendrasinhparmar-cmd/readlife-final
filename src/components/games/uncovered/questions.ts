import type { ArtFocus, UncoveredQuestion } from "./types";

const cover = (isbn: string) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

/** Tight crops of the real jacket, aimed at the iconic art — not the title. */
const ART_CROPS: Record<string, ArtFocus> = {
  "night-circus": { x: "50%", y: "70%", scale: 2.55, window: 46 },
  "hunger-games": { x: "32%", y: "50%", scale: 2.75, window: 44 },
  "six-crows": { x: "28%", y: "18%", scale: 2.35, window: 46 },
  circe: { x: "50%", y: "20%", scale: 2.2, window: 48 },
  "fourth-wing": { x: "80%", y: "20%", scale: 3.05, window: 42 },
  "evelyn-hugo": { x: "50%", y: "18%", scale: 2.3, window: 48 },
  "silent-patient": { x: "50%", y: "18%", scale: 2.55, window: 46 },
  "project-hail": { x: "50%", y: "52%", scale: 3.05, window: 40 },
  piranesi: { x: "50%", y: "50%", scale: 2.85, window: 42 },
  babel: { x: "50%", y: "36%", scale: 2.4, window: 44 },
  achilles: { x: "50%", y: "30%", scale: 2.35, window: 46 },
  "house-sky": { x: "38%", y: "48%", scale: 2.25, window: 46 },
  iewu: { x: "82%", y: "38%", scale: 2.65, window: 44 },
  acomaf: { x: "82%", y: "58%", scale: 2.5, window: 44 },
  hobbit: { x: "50%", y: "48%", scale: 2.15, window: 48 },
  dune: { x: "50%", y: "14%", scale: 2.45, window: 46 },
  "legends-lattes": { x: "55%", y: "55%", scale: 2.05, window: 50 },
  "love-hypothesis": { x: "50%", y: "64%", scale: 2.15, window: 48 },
  "gone-girl": { x: "22%", y: "48%", scale: 2.85, window: 44 },
  verity: { x: "50%", y: "26%", scale: 2.45, window: 46 },
  "cruel-prince": { x: "22%", y: "16%", scale: 2.7, window: 42 },
  mistborn: { x: "22%", y: "74%", scale: 2.55, window: 44 },
  "gideon-ninth": { x: "50%", y: "36%", scale: 2.25, window: 48 },
  "ninth-house": { x: "50%", y: "42%", scale: 2.35, window: 46 },
  tomorrow: { x: "50%", y: "38%", scale: 2.05, window: 50 },
  atlas: { x: "50%", y: "28%", scale: 2.45, window: 46 },
  "pride-prejudice": { x: "50%", y: "22%", scale: 2.15, window: 50 },
  "red-white-royal": { x: "50%", y: "90%", scale: 2.9, window: 42 },
  "lessons-chemistry": { x: "50%", y: "48%", scale: 2.25, window: 46 },
  "starless-sea": { x: "50%", y: "10%", scale: 2.9, window: 40 },
  acotar: { x: "50%", y: "58%", scale: 2.2, window: 48 },
  "iron-flame": { x: "26%", y: "22%", scale: 2.95, window: 42 },
  "daisy-jones": { x: "50%", y: "48%", scale: 1.85, window: 50 },
  educated: { x: "50%", y: "38%", scale: 2.35, window: 44 },
  "thursday-murder": { x: "50%", y: "48%", scale: 2.7, window: 40 },
  "a-little-life": { x: "50%", y: "55%", scale: 1.95, window: 50 },
};

function q({
  isbn,
  ...rest
}: Omit<
  UncoveredQuestion,
  "fullCoverImage" | "hiddenCoverImage" | "correctAnswer" | "artFocus"
> & { isbn: string }): UncoveredQuestion {
  const image = cover(isbn);
  const artFocus = ART_CROPS[rest.id];
  if (!artFocus) {
    throw new Error(`Missing art crop for ${rest.id}`);
  }
  return {
    ...rest,
    fullCoverImage: image,
    hiddenCoverImage: image,
    correctAnswer: rest.title,
    artFocus,
  };
}

/** Curated cover-recognition pool. Distractors share genre and audience. */
export const UNCOVERED_POOL: UncoveredQuestion[] = [
  q({
    id: "night-circus",
    isbn: "9780307744432",
    title: "The Night Circus",
    author: "Erin Morgenstern",
    genre: "Fantasy",
    difficulty: "easy",
    options: [
      "The Night Circus",
      "The Starless Sea",
      "Piranesi",
      "Jonathan Strange & Mr Norrell",
    ],
  }),
  q({
    id: "hunger-games",
    isbn: "9780439023528",
    title: "The Hunger Games",
    author: "Suzanne Collins",
    series: "The Hunger Games #1",
    genre: "YA Dystopian",
    difficulty: "easy",
    options: ["The Hunger Games", "Divergent", "Red Queen", "The Maze Runner"],
  }),
  q({
    id: "six-crows",
    isbn: "9781627792127",
    title: "Six of Crows",
    author: "Leigh Bardugo",
    series: "Six of Crows #1",
    genre: "YA Fantasy",
    difficulty: "easy",
    options: [
      "Six of Crows",
      "The Cruel Prince",
      "Shadow and Bone",
      "An Ember in the Ashes",
    ],
  }),
  q({
    id: "circe",
    isbn: "9780316556347",
    title: "Circe",
    author: "Madeline Miller",
    genre: "Mythic Fantasy",
    difficulty: "easy",
    options: [
      "Circe",
      "The Song of Achilles",
      "A Thousand Ships",
      "The Silence of the Girls",
    ],
  }),
  q({
    id: "fourth-wing",
    isbn: "9781649374042",
    title: "Fourth Wing",
    author: "Rebecca Yarros",
    series: "The Empyrean #1",
    genre: "Romantasy",
    difficulty: "easy",
    options: [
      "Fourth Wing",
      "A Court of Thorns and Roses",
      "Iron Flame",
      "From Blood and Ash",
    ],
  }),
  q({
    id: "evelyn-hugo",
    isbn: "9781501139239",
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    genre: "Historical Fiction",
    difficulty: "easy",
    options: [
      "The Seven Husbands of Evelyn Hugo",
      "Daisy Jones & The Six",
      "Malibu Rising",
      "The Great Alone",
    ],
  }),
  q({
    id: "silent-patient",
    isbn: "9781250301697",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    genre: "Thriller",
    difficulty: "medium",
    options: [
      "The Silent Patient",
      "Gone Girl",
      "The Maidens",
      "The Girl on the Train",
    ],
  }),
  q({
    id: "project-hail",
    isbn: "9780593135204",
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "Science Fiction",
    difficulty: "medium",
    options: [
      "Project Hail Mary",
      "The Martian",
      "Recursion",
      "Dark Matter",
    ],
  }),
  q({
    id: "piranesi",
    isbn: "9781635575637",
    title: "Piranesi",
    author: "Susanna Clarke",
    genre: "Fantasy",
    difficulty: "medium",
    options: [
      "Piranesi",
      "The Starless Sea",
      "Jonathan Strange & Mr Norrell",
      "The Library of the Unwritten",
    ],
  }),
  q({
    id: "babel",
    isbn: "9780063021426",
    title: "Babel",
    author: "R.F. Kuang",
    genre: "Historical Fantasy",
    difficulty: "medium",
    options: ["Babel", "The Poppy War", "Jonathan Strange & Mr Norrell", "Yellowface"],
  }),
  q({
    id: "achilles",
    isbn: "9780062060624",
    title: "The Song of Achilles",
    author: "Madeline Miller",
    genre: "Mythic Fiction",
    difficulty: "easy",
    options: [
      "The Song of Achilles",
      "Circe",
      "The Silence of the Girls",
      "A Thousand Ships",
    ],
  }),
  q({
    id: "house-sky",
    isbn: "9781250217288",
    title: "The House in the Cerulean Sea",
    author: "TJ Klune",
    genre: "Cozy Fantasy",
    difficulty: "medium",
    options: [
      "The House in the Cerulean Sea",
      "Legends & Lattes",
      "Under the Whispering Door",
      "A Psalm for the Wild-Built",
    ],
  }),
  q({
    id: "iewu",
    isbn: "9781501110368",
    title: "It Ends With Us",
    author: "Colleen Hoover",
    genre: "Contemporary Romance",
    difficulty: "easy",
    options: ["It Ends With Us", "Verity", "Ugly Love", "Reminders of Him"],
  }),
  q({
    id: "acomaf",
    isbn: "9781619635197",
    title: "A Court of Mist and Fury",
    author: "Sarah J. Maas",
    series: "A Court of Thorns and Roses #2",
    genre: "Romantasy",
    difficulty: "medium",
    options: [
      "A Court of Mist and Fury",
      "A Court of Thorns and Roses",
      "Fourth Wing",
      "From Blood and Ash",
    ],
  }),
  q({
    id: "hobbit",
    isbn: "9780547928227",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    difficulty: "easy",
    options: [
      "The Hobbit",
      "The Fellowship of the Ring",
      "The Name of the Wind",
      "Eragon",
    ],
  }),
  q({
    id: "dune",
    isbn: "9780441172719",
    title: "Dune",
    author: "Frank Herbert",
    series: "Dune #1",
    genre: "Science Fiction",
    difficulty: "easy",
    options: ["Dune", "Foundation", "Hyperion", "The Left Hand of Darkness"],
  }),
  q({
    id: "legends-lattes",
    isbn: "9781250886088",
    title: "Legends & Lattes",
    author: "Travis Baldree",
    genre: "Cozy Fantasy",
    difficulty: "medium",
    options: [
      "Legends & Lattes",
      "The House in the Cerulean Sea",
      "Can't Spell Treason Without Tea",
      "A Psalm for the Wild-Built",
    ],
  }),
  q({
    id: "love-hypothesis",
    isbn: "9780593336823",
    title: "The Love Hypothesis",
    author: "Ali Hazelwood",
    genre: "Romance",
    difficulty: "medium",
    options: [
      "The Love Hypothesis",
      "Beach Read",
      "The Spanish Love Deception",
      "Book Lovers",
    ],
  }),
  q({
    id: "gone-girl",
    isbn: "9780307588371",
    title: "Gone Girl",
    author: "Gillian Flynn",
    genre: "Thriller",
    difficulty: "medium",
    options: [
      "Gone Girl",
      "The Silent Patient",
      "Sharp Objects",
      "The Girl on the Train",
    ],
  }),
  q({
    id: "verity",
    isbn: "9781538724736",
    title: "Verity",
    author: "Colleen Hoover",
    genre: "Thriller",
    difficulty: "medium",
    options: ["Verity", "It Ends With Us", "The Silent Patient", "Ugly Love"],
  }),
  q({
    id: "cruel-prince",
    isbn: "9780316310277",
    title: "The Cruel Prince",
    author: "Holly Black",
    series: "The Folk of the Air #1",
    genre: "YA Fantasy",
    difficulty: "medium",
    options: [
      "The Cruel Prince",
      "Six of Crows",
      "A Court of Thorns and Roses",
      "An Ember in the Ashes",
    ],
  }),
  q({
    id: "mistborn",
    isbn: "9780765311788",
    title: "Mistborn: The Final Empire",
    author: "Brandon Sanderson",
    series: "Mistborn #1",
    genre: "Fantasy",
    difficulty: "medium",
    options: [
      "Mistborn: The Final Empire",
      "The Name of the Wind",
      "The Way of Kings",
      "The Lies of Locke Lamora",
    ],
  }),
  q({
    id: "gideon-ninth",
    isbn: "9781250313195",
    title: "Gideon the Ninth",
    author: "Tamsyn Muir",
    series: "The Locked Tomb #1",
    genre: "Science Fantasy",
    difficulty: "hard",
    options: [
      "Gideon the Ninth",
      "Ninth House",
      "The Priory of the Orange Tree",
      "Harrow the Ninth",
    ],
  }),
  q({
    id: "ninth-house",
    isbn: "9781250313072",
    title: "Ninth House",
    author: "Leigh Bardugo",
    series: "Alex Stern #1",
    genre: "Dark Fantasy",
    difficulty: "hard",
    options: [
      "Ninth House",
      "Gideon the Ninth",
      "The Atlas Six",
      "A Deadly Education",
    ],
  }),
  q({
    id: "tomorrow",
    isbn: "9780593321201",
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    genre: "Literary Fiction",
    difficulty: "hard",
    options: [
      "Tomorrow, and Tomorrow, and Tomorrow",
      "A Little Life",
      "Normal People",
      "Cloud Cuckoo Land",
    ],
  }),
  q({
    id: "atlas",
    isbn: "9781250854513",
    title: "The Atlas Six",
    author: "Olivie Blake",
    series: "The Atlas #1",
    genre: "Dark Academia",
    difficulty: "hard",
    options: [
      "The Atlas Six",
      "Babel",
      "Ninth House",
      "A Deadly Education",
    ],
  }),
  q({
    id: "pride-prejudice",
    isbn: "9780141439518",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Classic Romance",
    difficulty: "easy",
    options: [
      "Pride and Prejudice",
      "Jane Eyre",
      "Sense and Sensibility",
      "Emma",
    ],
  }),
  q({
    id: "red-white-royal",
    isbn: "9781250316776",
    title: "Red, White & Royal Blue",
    author: "Casey McQuiston",
    genre: "Romance",
    difficulty: "medium",
    options: [
      "Red, White & Royal Blue",
      "The Love Hypothesis",
      "Beach Read",
      "You Should See Me in a Crown",
    ],
  }),
  q({
    id: "lessons-chemistry",
    isbn: "9780385547345",
    title: "Lessons in Chemistry",
    author: "Bonnie Garmus",
    genre: "Historical Fiction",
    difficulty: "medium",
    options: [
      "Lessons in Chemistry",
      "The Thursday Murder Club",
      "Remarkably Bright Creatures",
      "The Maid",
    ],
  }),
  q({
    id: "starless-sea",
    isbn: "9780385541213",
    title: "The Starless Sea",
    author: "Erin Morgenstern",
    genre: "Fantasy",
    difficulty: "hard",
    options: [
      "The Starless Sea",
      "The Night Circus",
      "Piranesi",
      "The Ten Thousand Doors of January",
    ],
  }),
  q({
    id: "acotar",
    isbn: "9781635575569",
    title: "A Court of Thorns and Roses",
    author: "Sarah J. Maas",
    series: "A Court of Thorns and Roses #1",
    genre: "Romantasy",
    difficulty: "easy",
    options: [
      "A Court of Thorns and Roses",
      "Fourth Wing",
      "A Court of Mist and Fury",
      "From Blood and Ash",
    ],
  }),
  q({
    id: "iron-flame",
    isbn: "9781649374172",
    title: "Iron Flame",
    author: "Rebecca Yarros",
    series: "The Empyrean #2",
    genre: "Romantasy",
    difficulty: "medium",
    options: [
      "Iron Flame",
      "Fourth Wing",
      "A Court of Silver Flames",
      "House of Flame and Shadow",
    ],
  }),
  q({
    id: "daisy-jones",
    isbn: "9781524798628",
    title: "Daisy Jones & The Six",
    author: "Taylor Jenkins Reid",
    genre: "Historical Fiction",
    difficulty: "medium",
    options: [
      "Daisy Jones & The Six",
      "The Seven Husbands of Evelyn Hugo",
      "Malibu Rising",
      "The Final Revival of Opal & Nev",
    ],
  }),
  q({
    id: "educated",
    isbn: "9780399590504",
    title: "Educated",
    author: "Tara Westover",
    genre: "Memoir",
    difficulty: "hard",
    options: ["Educated", "The Glass Castle", "Crying in H Mart", "Know My Name"],
  }),
  q({
    id: "thursday-murder",
    isbn: "9781984880987",
    title: "The Thursday Murder Club",
    author: "Richard Osman",
    series: "Thursday Murder Club #1",
    genre: "Mystery",
    difficulty: "medium",
    options: [
      "The Thursday Murder Club",
      "The Maid",
      "Magpie Murders",
      "The Appeal",
    ],
  }),
  q({
    id: "a-little-life",
    isbn: "9780804172707",
    title: "A Little Life",
    author: "Hanya Yanagihara",
    genre: "Literary Fiction",
    difficulty: "hard",
    options: [
      "A Little Life",
      "Normal People",
      "Tomorrow, and Tomorrow, and Tomorrow",
      "On Earth We're Briefly Gorgeous",
    ],
  }),
];

export const ROUNDS_PER_GAME = 10;
export const OPTIONS_PER_QUESTION = 6;
export const POINTS_CORRECT = 100;
export const POINTS_HINT = 75;
export const BONUS_STREAK_3 = 50;
export const BONUS_STREAK_5 = 100;
export const BONUS_STREAK_10 = 150;
export const MAX_ROUND_POINTS = ROUNDS_PER_GAME * POINTS_CORRECT;

/** Puzzle #1 = 23 Jun 2026, so 13 Aug 2026 is #52. */
export const UNCOVERED_EPOCH = Date.UTC(2026, 5, 23);

export function localISODate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function uncoveredPuzzleNumber(d = new Date()) {
  const utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.max(1, Math.floor((utc - UNCOVERED_EPOCH) / 86_400_000) + 1);
}

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], rand: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function buildOptions(
  question: UncoveredQuestion,
  pool: UncoveredQuestion[],
  rand: () => number,
): string[] {
  const used = new Set<string>([question.title]);
  const sameGenre = pool
    .filter((p) => p.id !== question.id && p.genre === question.genre)
    .map((p) => p.title);
  const curated = question.options.filter((title) => title !== question.title);
  const rest = pool.filter((p) => p.id !== question.id).map((p) => p.title);

  const pick: string[] = [];
  for (const title of [...curated, ...sameGenre, ...rest]) {
    if (used.has(title)) continue;
    used.add(title);
    pick.push(title);
    if (pick.length >= OPTIONS_PER_QUESTION - 1) break;
  }

  return seededShuffle([question.title, ...pick], rand);
}

const LAST_DEAL_KEY = "readlife-uncovered-last-deal-v1";

function readLastDealIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(LAST_DEAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function writeLastDealIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(LAST_DEAL_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

/** Fresh random set each session — avoids repeating the last batch. */
export function dealQuestions(seed = Date.now()): UncoveredQuestion[] {
  const rand = mulberry32((seed ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
  const lastIds = new Set(readLastDealIds());
  const unused = UNCOVERED_POOL.filter((book) => !lastIds.has(book.id));
  const source = unused.length >= ROUNDS_PER_GAME ? unused : UNCOVERED_POOL;
  const shuffled = seededShuffle(source, rand);
  const dealt = shuffled.slice(0, ROUNDS_PER_GAME).map((question) => ({
    ...question,
    options: buildOptions(question, UNCOVERED_POOL, rand),
  }));
  writeLastDealIds(dealt.map((book) => book.id));
  return dealt;
}

export function getDailyQuestions(date = new Date()): UncoveredQuestion[] {
  const key = localISODate(date);
  return dealQuestions(hashString(`uncovered-${key}`));
}

export function formatShareResult(input: {
  puzzleNumber: number;
  results: { correct: boolean }[];
  recognized: number;
}) {
  const icons = input.results.map((r) => (r.correct ? "📚" : "📖")).join("");
  return [
    `UNcovered #${input.puzzleNumber}`,
    icons,
    `${input.recognized}/${ROUNDS_PER_GAME} covers recognized`,
    "Can you beat my score?",
  ].join("\n");
}
