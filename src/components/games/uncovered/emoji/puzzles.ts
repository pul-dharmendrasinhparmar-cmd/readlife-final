import type { EmojiBook, EmojiPuzzle } from "./types";

const book = (input: EmojiBook): EmojiBook => input;

const PUZZLES: EmojiPuzzle[] = [
  {
    id: "hp-stone",
    book: book({
      id: "hp-stone",
      title: "Harry Potter and the Sorcerer's Stone",
      author: "J.K. Rowling",
      genreTags: ["fantasy", "ya", "children"],
      publicationYear: 1997,
      isbn: "9780590353427",
    }),
    emojiSequence: ["🏠", "✉️", "⚔️", "🕳️", "🏆"],
    emojiRationale: [
      "Neglected ordinary life in the cupboard under the stairs",
      "The letter that pulls him into the magical world",
      "Rivalry and a brewing threat around the stone",
      "Descent through the trapdoor into real danger",
      "Triumph and the house cup resolution",
    ],
  },
  {
    id: "hobbit",
    book: book({
      id: "hobbit",
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      genreTags: ["fantasy", "adventure"],
      publicationYear: 1937,
      isbn: "9780547928227",
    }),
    emojiSequence: ["🏡", "🗺️", "🐉", "⚔️", "🔙"],
    emojiRationale: [
      "Comfortable, unadventurous life in the Shire",
      "The map and call to adventure with the dwarves",
      "Confronting Smaug, the story's greatest danger",
      "The Battle of Five Armies, the low point of loss",
      "Return home, changed by the journey",
    ],
  },
  {
    id: "pride-prejudice",
    book: book({
      id: "pride-prejudice",
      title: "Pride and Prejudice",
      author: "Jane Austen",
      genreTags: ["classic", "romance"],
      publicationYear: 1813,
      isbn: "9780141439518",
    }),
    emojiSequence: ["💃", "😤", "💔", "🔄", "💍"],
    emojiRationale: [
      "The ball where the social world and romance begin",
      "Pride and prejudice create the central conflict",
      "The low point — a rejected proposal, reputations at risk",
      "The turn — true feelings and misjudgments revealed",
      "Resolution in marriage",
    ],
  },
  {
    id: "nineteen-eighty-four",
    book: book({
      id: "nineteen-eighty-four",
      title: "1984",
      author: "George Orwell",
      genreTags: ["dystopian", "classic"],
      publicationYear: 1949,
      isbn: "9780451524935",
    }),
    emojiSequence: ["👁️", "🤫", "❤️‍🔥", "⛓️", "🙇"],
    emojiRationale: [
      "Constant surveillance defines ordinary life",
      "A secret rebellion quietly begins",
      "Forbidden love as an act of resistance",
      "Capture and torture, the story's low point",
      "Broken resolution — submission to the Party",
    ],
  },
  {
    id: "gatsby",
    book: book({
      id: "gatsby",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      genreTags: ["classic", "tragedy"],
      publicationYear: 1925,
      isbn: "9780743273565",
    }),
    emojiSequence: ["🏙️", "🎉", "💥", "🔫", "🥀"],
    emojiRationale: [
      "Arrival into the glittering world of West Egg",
      "Parties thrown in pursuit of a lost love",
      "Confrontation exposes the truth beneath the glamour",
      "Tragic low point — violence and death",
      "Disillusioned resolution",
    ],
  },
  {
    id: "moby-dick",
    book: book({
      id: "moby-dick",
      title: "Moby-Dick",
      author: "Herman Melville",
      genreTags: ["adventure", "classic"],
      publicationYear: 1851,
      isbn: "9780142437247",
    }),
    emojiSequence: ["⚓", "🐋", "🌊", "💀", "🕊️"],
    emojiRationale: [
      "Setting out to sea aboard the Pequod",
      "The obsessive hunt for the white whale begins",
      "Storms and danger mount as the chase intensifies",
      "Catastrophic low point — the ship is doomed",
      "A lone survivor's quiet resolution",
    ],
  },
  {
    id: "fellowship",
    book: book({
      id: "fellowship",
      title: "The Fellowship of the Ring",
      author: "J.R.R. Tolkien",
      genreTags: ["fantasy", "adventure"],
      publicationYear: 1954,
      isbn: "9780547928210",
    }),
    emojiSequence: ["🌳", "💍", "🗻", "🧙", "🚶"],
    emojiRationale: [
      "Peaceful life in the Shire before the burden arrives",
      "The ring is accepted as a duty that must be carried",
      "A perilous journey through mounting danger",
      "The low point — loss in the mines of Moria",
      "The fellowship breaks but the journey continues",
    ],
  },
  {
    id: "animal-farm",
    book: book({
      id: "animal-farm",
      title: "Animal Farm",
      author: "George Orwell",
      genreTags: ["satire", "dystopian", "classic"],
      publicationYear: 1945,
      isbn: "9780451526342",
    }),
    emojiSequence: ["🐖", "🚩", "🐗", "🔨", "🐷"],
    emojiRationale: [
      "The uprising against the farmer begins",
      "A new, supposedly equal society is founded",
      "Corruption of power quietly grows",
      "Oppressive low point — the rules are rewritten",
      "Resolution — the pigs become the new tyrants",
    ],
  },
  {
    id: "frankenstein",
    book: book({
      id: "frankenstein",
      title: "Frankenstein",
      author: "Mary Shelley",
      genreTags: ["gothic", "horror", "classic"],
      publicationYear: 1818,
      isbn: "9780486282114",
    }),
    emojiSequence: ["🔬", "⚡", "😱", "💀", "❄️"],
    emojiRationale: [
      "An ambitious act of creation begins",
      "The creature is brought to life",
      "Horror and rejection follow the creation",
      "Tragic low point as deaths mount",
      "Resolution — pursuit into the Arctic ice",
    ],
  },
  {
    id: "narnia",
    book: book({
      id: "narnia",
      title: "The Lion, the Witch and the Wardrobe",
      author: "C.S. Lewis",
      genreTags: ["fantasy", "children", "ya"],
      publicationYear: 1950,
      isbn: "9780064404990",
    }),
    emojiSequence: ["🚪", "❄️", "🦁", "✝️", "👑"],
    emojiRationale: [
      "Ordinary children step through into another world",
      "A frozen land trapped under a witch's curse",
      "Sacrifice at the story's lowest point",
      "The turn — an unexpected resurrection",
      "Resolution — crowned as kings and queens",
    ],
  },
  {
    id: "night-circus",
    book: book({
      id: "night-circus",
      title: "The Night Circus",
      author: "Erin Morgenstern",
      genreTags: ["fantasy", "romance"],
      publicationYear: 2011,
      isbn: "9780307744432",
    }),
    emojiSequence: ["🎪", "🪄", "❤️", "🔥", "🌙"],
    emojiRationale: [
      "A mysterious circus appears without warning",
      "Two magicians are bound into a secret contest",
      "Love complicates a game that was meant to destroy",
      "The circus itself begins to unravel",
      "A moonlight resolution that keeps the tent standing",
    ],
  },
  {
    id: "hunger-games",
    book: book({
      id: "hunger-games",
      title: "The Hunger Games",
      author: "Suzanne Collins",
      genreTags: ["ya", "dystopian"],
      publicationYear: 2008,
      isbn: "9780439023481",
    }),
    emojiSequence: ["🍞", "🎯", "🌲", "💔", "🐦"],
    emojiRationale: [
      "Poverty and a volunteer that changes everything",
      "The games begin as spectacle and survival",
      "Alliances and hunts in the arena",
      "The low point — a rule change and a terrible choice",
      "A defiant win that plants the first spark of rebellion",
    ],
  },
  {
    id: "six-crows",
    book: book({
      id: "six-crows",
      title: "Six of Crows",
      author: "Leigh Bardugo",
      genreTags: ["ya", "fantasy", "heist"],
      publicationYear: 2015,
      isbn: "9781250076960",
    }),
    emojiSequence: ["💰", "🧩", "🧊", "💥", "🐦‍⬛"],
    emojiRationale: [
      "A crew is assembled for an impossible job",
      "Each specialist brings a private wound to the table",
      "The Ice Court heist goes violently sideways",
      "Betrayal and a near-ruin escape",
      "The crows get out — changed, and still a crew",
    ],
  },
  {
    id: "circe",
    book: book({
      id: "circe",
      title: "Circe",
      author: "Madeline Miller",
      genreTags: ["mythic", "fantasy"],
      publicationYear: 2018,
      isbn: "9780316556347",
    }),
    emojiSequence: ["🏛️", "🏝️", "🐷", "⚔️", "🧵"],
    emojiRationale: [
      "A scorned nymph among the gods",
      "Exile to an island of her own making",
      "Power found in witchcraft and transformation",
      "Heroes arrive and the world barges in",
      "She chooses a mortal life on her own terms",
    ],
  },
  {
    id: "dune",
    book: book({
      id: "dune",
      title: "Dune",
      author: "Frank Herbert",
      genreTags: ["science-fiction", "adventure"],
      publicationYear: 1965,
      isbn: "9780441172719",
    }),
    emojiSequence: ["🏜️", "🪱", "💧", "⚔️", "👑"],
    emojiRationale: [
      "A ducal house is sent to a desert world",
      "Betrayal strands a boy among the Fremen",
      "Water, worms, and a prophecy take hold",
      "War for the spice and the soul of the planet",
      "A new emperor rises from the sand",
    ],
  },
  {
    id: "silent-patient",
    book: book({
      id: "silent-patient",
      title: "The Silent Patient",
      author: "Alex Michaelides",
      genreTags: ["thriller", "mystery"],
      publicationYear: 2019,
      isbn: "9781250301697",
    }),
    emojiSequence: ["🎨", "🔇", "🧠", "📓", "🎭"],
    emojiRationale: [
      "A famous painter stops speaking after a shooting",
      "A therapist becomes obsessed with her silence",
      "Sessions peel back both of their pasts",
      "A diary tells a different story",
      "The twist rewrites who was never talking",
    ],
  },
  {
    id: "project-hail",
    book: book({
      id: "project-hail",
      title: "Project Hail Mary",
      author: "Andy Weir",
      genreTags: ["science-fiction"],
      publicationYear: 2021,
      isbn: "9780593135204",
    }),
    emojiSequence: ["☀️", "🚀", "🤔", "👽", "🌍"],
    emojiRationale: [
      "The sun is dying and Earth needs a miracle",
      "A lone scientist wakes up on a desperate mission",
      "Amnesia and science become the only tools left",
      "An unexpected first contact in deep space",
      "Two species gamble everything to save their worlds",
    ],
  },
  {
    id: "piranesi",
    book: book({
      id: "piranesi",
      title: "Piranesi",
      author: "Susanna Clarke",
      genreTags: ["fantasy", "literary"],
      publicationYear: 2020,
      isbn: "9781635575637",
    }),
    emojiSequence: ["🏛️", "🌊", "🐦", "👤", "🔑"],
    emojiRationale: [
      "A vast house of halls and drowned statues",
      "Tides and journals are the only companions",
      "The Other visits with questions and gifts",
      "Memory begins to leak back in",
      "The house's prisoner remembers another name",
    ],
  },
  {
    id: "achilles",
    book: book({
      id: "achilles",
      title: "The Song of Achilles",
      author: "Madeline Miller",
      genreTags: ["mythic", "romance", "literary"],
      publicationYear: 2011,
      isbn: "9780062060624",
    }),
    emojiSequence: ["🏛️", "💘", "⚔️", "🛡️", "🌅"],
    emojiRationale: [
      "A prince is exiled into another boy's world",
      "Love grows between the warrior and the storyteller",
      "War at Troy demands a terrible glory",
      "A death that the prophecy always promised",
      "The song that keeps him from being forgotten",
    ],
  },
  {
    id: "gone-girl",
    book: book({
      id: "gone-girl",
      title: "Gone Girl",
      author: "Gillian Flynn",
      genreTags: ["thriller", "mystery"],
      publicationYear: 2012,
      isbn: "9780307588371",
    }),
    emojiSequence: ["💍", "📰", "🕵️", "📓", "🪞"],
    emojiRationale: [
      "A marriage that looks perfect from the outside",
      "A wife vanishes and the husband becomes a story",
      "Clues pile up in all the wrong places",
      "A diary rewrites the marriage in blood",
      "The truth is a trap neither can leave",
    ],
  },
  {
    id: "acotar",
    book: book({
      id: "acotar",
      title: "A Court of Thorns and Roses",
      author: "Sarah J. Maas",
      genreTags: ["romantasy", "ya", "fantasy"],
      publicationYear: 2015,
      isbn: "9781635575569",
    }),
    emojiSequence: ["🐺", "🏰", "🌹", "⛓️", "🔥"],
    emojiRationale: [
      "A huntress kills a wolf and pays a fae price",
      "Captivity in a cursed spring court",
      "Hate thaws into something more dangerous",
      "A bargain under the mountain",
      "A trial-by-fire ending that breaks the curse",
    ],
  },
  {
    id: "fourth-wing",
    book: book({
      id: "fourth-wing",
      title: "Fourth Wing",
      author: "Rebecca Yarros",
      genreTags: ["romantasy", "ya", "fantasy"],
      publicationYear: 2023,
      isbn: "9781649374042",
    }),
    emojiSequence: ["🐉", "🏫", "💔", "⚔️", "🖤"],
    emojiRationale: [
      "A frail scribe is forced into a deadly war college",
      "Dragons choose — and most cadets don't survive",
      "Enemies on the mat, secrets in the skies",
      "War is not the story she was told",
      "A bond that rewrites whose side she's on",
    ],
  },
  {
    id: "babel",
    book: book({
      id: "babel",
      title: "Babel",
      author: "R.F. Kuang",
      genreTags: ["historical", "fantasy", "dark-academia"],
      publicationYear: 2022,
      isbn: "9780063021426",
    }),
    emojiSequence: ["🚢", "📚", "🔤", "⚒️", "🗼"],
    emojiRationale: [
      "An orphan is lifted out of Canton into empire",
      "Oxford's tower teaches language as power",
      "Silver-working magic runs on translation",
      "Friendship cracks under colonial violence",
      "A strike that tries to bring the tower down",
    ],
  },
  {
    id: "evelyn-hugo",
    book: book({
      id: "evelyn-hugo",
      title: "The Seven Husbands of Evelyn Hugo",
      author: "Taylor Jenkins Reid",
      genreTags: ["historical", "romance", "literary"],
      publicationYear: 2017,
      isbn: "9781501161933",
    }),
    emojiSequence: ["🎬", "💍", "🤫", "💔", "🌟"],
    emojiRationale: [
      "A Hollywood icon agrees to tell her life story",
      "Seven marriages as costume and strategy",
      "The love she was never allowed to name",
      "A confession that costs everything",
      "The reason she chose this particular listener",
    ],
  },
];

const EXTRA_BOOKS: EmojiBook[] = [
  {
    id: "iron-flame",
    title: "Iron Flame",
    author: "Rebecca Yarros",
    genreTags: ["romantasy", "ya", "fantasy"],
    publicationYear: 2023,
  },
  {
    id: "acomaf",
    title: "A Court of Mist and Fury",
    author: "Sarah J. Maas",
    genreTags: ["romantasy", "ya", "fantasy"],
    publicationYear: 2016,
  },
  {
    id: "starless-sea",
    title: "The Starless Sea",
    author: "Erin Morgenstern",
    genreTags: ["fantasy", "literary"],
    publicationYear: 2019,
  },
  {
    id: "verity",
    title: "Verity",
    author: "Colleen Hoover",
    genreTags: ["thriller", "romance"],
    publicationYear: 2018,
  },
  {
    id: "mistborn",
    title: "Mistborn: The Final Empire",
    author: "Brandon Sanderson",
    genreTags: ["fantasy"],
    publicationYear: 2006,
  },
  {
    id: "house-sky",
    title: "The House in the Cerulean Sea",
    author: "TJ Klune",
    genreTags: ["fantasy", "romance"],
    publicationYear: 2020,
  },
  {
    id: "gideon-ninth",
    title: "Gideon the Ninth",
    author: "Tamsyn Muir",
    genreTags: ["science-fiction", "fantasy"],
    publicationYear: 2019,
  },
  {
    id: "educated",
    title: "Educated",
    author: "Tara Westover",
    genreTags: ["memoir", "literary"],
    publicationYear: 2018,
  },
  {
    id: "lessons-chemistry",
    title: "Lessons in Chemistry",
    author: "Bonnie Garmus",
    genreTags: ["historical", "literary"],
    publicationYear: 2022,
  },
  {
    id: "cruel-prince",
    title: "The Cruel Prince",
    author: "Holly Black",
    genreTags: ["ya", "fantasy"],
    publicationYear: 2018,
  },
  {
    id: "tomorrow",
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    genreTags: ["literary"],
    publicationYear: 2022,
  },
  {
    id: "red-white-royal",
    title: "Red, White & Royal Blue",
    author: "Casey McQuiston",
    genreTags: ["romance"],
    publicationYear: 2019,
  },
  {
    id: "love-hypothesis",
    title: "The Love Hypothesis",
    author: "Ali Hazelwood",
    genreTags: ["romance"],
    publicationYear: 2021,
  },
  {
    id: "legends-lattes",
    title: "Legends & Lattes",
    author: "Travis Baldree",
    genreTags: ["fantasy"],
    publicationYear: 2022,
  },
  {
    id: "thursday-murder",
    title: "The Thursday Murder Club",
    author: "Richard Osman",
    genreTags: ["mystery"],
    publicationYear: 2020,
  },
  {
    id: "a-little-life",
    title: "A Little Life",
    author: "Hanya Yanagihara",
    genreTags: ["literary"],
    publicationYear: 2015,
  },
  {
    id: "ninth-house",
    title: "Ninth House",
    author: "Leigh Bardugo",
    genreTags: ["fantasy", "dark-academia"],
    publicationYear: 2019,
  },
  {
    id: "atlas-six",
    title: "The Atlas Six",
    author: "Olivie Blake",
    genreTags: ["fantasy", "dark-academia"],
    publicationYear: 2020,
  },
];

const LAST_KEY = "readlife-uncovered-emoji-last-v1";

export const EMOJI_PUZZLES: EmojiPuzzle[] = PUZZLES;

export const EMOJI_CATALOG: EmojiBook[] = [
  ...PUZZLES.map((p) => p.book),
  ...EXTRA_BOOKS,
];

export const MAX_EMOJI_GUESSES = 6;

export function coverUrlFor(book: EmojiBook) {
  return book.isbn
    ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`
    : null;
}

export function searchEmojiBooks(query: string): EmojiBook[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const seen = new Set<string>();
  const hits: EmojiBook[] = [];
  for (const item of EMOJI_CATALOG) {
    if (seen.has(item.id)) continue;
    const hay = `${item.title} ${item.author}`.toLowerCase();
    if (!hay.includes(q)) continue;
    seen.add(item.id);
    hits.push(item);
    if (hits.length >= 8) break;
  }
  return hits;
}

function readLastId() {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(LAST_KEY);
  } catch {
    return null;
  }
}

function writeLastId(id: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(LAST_KEY, id);
  } catch {
    /* ignore */
  }
}

export function dealEmojiPuzzle(): EmojiPuzzle {
  const last = readLastId();
  const unused = last ? PUZZLES.filter((p) => p.id !== last) : PUZZLES;
  const pool = unused.length ? unused : PUZZLES;
  const next = pool[Math.floor(Math.random() * pool.length)]!;
  writeLastId(next.id);
  return next;
}
