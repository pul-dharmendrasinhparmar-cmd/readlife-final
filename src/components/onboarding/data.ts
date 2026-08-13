export const ONBOARDING_STEPS = [
  { id: "taste", label: "Your Taste", short: "Taste" },
  { id: "books", label: "Your Books", short: "Books" },
  { id: "goals", label: "Your Goals", short: "Goals" },
  { id: "room", label: "Your Room", short: "Room" },
  { id: "move-in", label: "Move In", short: "Move In" },
] as const;

export type StepId = (typeof ONBOARDING_STEPS)[number]["id"];

export const GENRES = [
  { id: "fantasy", label: "Fantasy", emoji: "🐉" },
  { id: "romance", label: "Romance", emoji: "💕" },
  { id: "mystery", label: "Mystery", emoji: "🔍" },
  { id: "scifi", label: "Sci-Fi", emoji: "🚀" },
  { id: "literary", label: "Literary", emoji: "📖" },
  { id: "thriller", label: "Thriller", emoji: "😱" },
  { id: "historical", label: "Historical", emoji: "🏛️" },
  { id: "horror", label: "Horror", emoji: "👻" },
  { id: "ya", label: "YA", emoji: "✨" },
  { id: "nonfiction", label: "Nonfiction", emoji: "🧠" },
  { id: "memoir", label: "Memoir", emoji: "✍️" },
  { id: "poetry", label: "Poetry", emoji: "🌙" },
  { id: "graphic", label: "Graphic novels", emoji: "🎨" },
  { id: "classics", label: "Classics", emoji: "📜" },
  { id: "cozy", label: "Cozy reads", emoji: "☕" },
] as const;

export const FORMATS = [
  { id: "physical", label: "Physical books", emoji: "📚" },
  { id: "ebooks", label: "Ebooks", emoji: "📱" },
  { id: "audio", label: "Audiobooks", emoji: "🎧" },
  { id: "all", label: "All of the above", emoji: "✨" },
] as const;

export type BookItem = {
  id: string;
  title: string;
  author: string;
  color: string;
  cover: string;
};

export const STARTER_LOVED: BookItem[] = [
  {
    id: "night-circus",
    title: "The Night Circus",
    author: "Erin Morgenstern",
    color: "#5b4e8c",
    cover: "https://covers.openlibrary.org/b/isbn/9780307744432-L.jpg",
  },
  {
    id: "six-crows",
    title: "Six of Crows",
    author: "Leigh Bardugo",
    color: "#5c3d2e",
    cover: "https://covers.openlibrary.org/b/isbn/9781627792127-L.jpg",
  },
  {
    id: "piranesi",
    title: "Piranesi",
    author: "Susanna Clarke",
    color: "#3d5a6c",
    cover: "https://covers.openlibrary.org/b/isbn/9781635575637-L.jpg",
  },
  {
    id: "achilles",
    title: "The Song of Achilles",
    author: "Madeline Miller",
    color: "#8b5a2b",
    cover: "https://covers.openlibrary.org/b/isbn/9780062060624-L.jpg",
  },
];

export const STARTER_SKIP: BookItem[] = [
  {
    id: "iewu",
    title: "It Ends With Us",
    author: "Colleen Hoover",
    color: "#7a4a5c",
    cover: "https://covers.openlibrary.org/b/isbn/9781501110368-L.jpg",
  },
  {
    id: "atlas",
    title: "The Atlas Six",
    author: "Olivie Blake",
    color: "#2a3550",
    cover: "https://covers.openlibrary.org/b/isbn/9781250854513-L.jpg",
  },
];

export const BOOK_SUGGESTIONS: BookItem[] = [
  ...STARTER_LOVED,
  ...STARTER_SKIP,
  {
    id: "project-hail",
    title: "Project Hail Mary",
    author: "Andy Weir",
    color: "#1f4d6e",
    cover: "https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg",
  },
  {
    id: "silent-patient",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    color: "#4a2f3a",
    cover: "https://covers.openlibrary.org/b/isbn/9781250301697-L.jpg",
  },
  {
    id: "circe",
    title: "Circe",
    author: "Madeline Miller",
    color: "#5a6b3a",
    cover: "https://covers.openlibrary.org/b/isbn/9780316556347-L.jpg",
  },
  {
    id: "tomorrow",
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    color: "#6b3a4a",
    cover: "https://covers.openlibrary.org/b/isbn/9780593321201-L.jpg",
  },
];

export const ROOMS = [
  {
    id: "cozy-nook",
    label: "Cozy Nook",
    image: "/rooms/cozy-nook.png",
  },
  {
    id: "rainy-night",
    label: "Rainy Night Library",
    image: "/rooms/rainy-night.png",
  },
  {
    id: "dark-academia",
    label: "Dark Academia Study",
    image: "/rooms/dark-academia.png",
  },
  {
    id: "sunny-loft",
    label: "Sunny Book Loft",
    image: "/rooms/sunny-loft.png",
  },
] as const;

export const REMINDERS = [
  { id: "gentle", label: "Gentle nudges" },
  { id: "motivating", label: "Motivating" },
  { id: "funny", label: "Funny" },
  { id: "none", label: "None" },
] as const;

export type OnboardingState = {
  genres: string[];
  formats: string[];
  lovedBooks: BookItem[];
  skipBooks: BookItem[];
  goals: {
    books: { enabled: boolean; value: number };
    time: { enabled: boolean; value: number };
    pages: { enabled: boolean; value: number };
    streak: { enabled: boolean; value: number };
    noPressure: boolean;
  };
  reminder: string;
  room: string;
  avatar: "male" | "female" | "custom" | null;
  /** Compressed data URL for a custom uploaded profile photo. */
  avatarImage?: string | null;
  displayName: string;
  pet: string | null;
  petName: string;
};

export const INITIAL_STATE: OnboardingState = {
  genres: ["fantasy", "scifi"],
  formats: ["physical"],
  lovedBooks: [...STARTER_LOVED],
  skipBooks: [...STARTER_SKIP],
  goals: {
    books: { enabled: true, value: 24 },
    time: { enabled: true, value: 30 },
    pages: { enabled: false, value: 40 },
    streak: { enabled: true, value: 5 },
    noPressure: false,
  },
  reminder: "gentle",
  room: "cozy-nook",
  avatar: null,
  displayName: "",
  pet: null,
  petName: "",
};

/** Empty setup defaults for signed-in accounts (no pre-selected Alex taste). */
export const EMPTY_ONBOARDING_STATE: OnboardingState = {
  genres: [],
  formats: [],
  lovedBooks: [],
  skipBooks: [],
  goals: {
    books: { enabled: true, value: 12 },
    time: { enabled: true, value: 20 },
    pages: { enabled: false, value: 40 },
    streak: { enabled: true, value: 3 },
    noPressure: false,
  },
  reminder: "gentle",
  room: "cozy-nook",
  avatar: null,
  displayName: "",
  pet: null,
  petName: "",
};

export const READER_AVATARS = [
  {
    id: "male" as const,
    label: "Male presenting reader",
    image: "/avatars/reader-male.png",
  },
  {
    id: "female" as const,
    label: "Female presenting reader",
    image: "/avatars/reader-female.png",
  },
];

export const SHELF_PETS = [
  {
    id: "bookwyrm",
    label: "Bookwyrm",
    tagline: "Keeper of stories",
    image: "/pets/bookwyrm-v3.png",
  },
  {
    id: "mimic",
    label: "Book Mimic",
    tagline: "Eats books, not feelings",
    image: "/pets/mimic-v3.png",
  },
  {
    id: "ghost",
    label: "Library Ghost",
    tagline: "Haunts the quiet shelves",
    image: "/pets/ghost-v3.png",
  },
  {
    id: "owl",
    label: "Tiny Librarian Owl",
    tagline: "Shushes & judges gently",
    image: "/pets/owl-v3.png",
  },
  {
    id: "crow",
    label: "Ink Crow",
    tagline: "Bringer of quotes",
    image: "/pets/crow-v3.png",
  },
  {
    id: "cat",
    label: "Bookish Cat",
    tagline: "Expert in naps & side quests",
    image: "/pets/cat-v3.png",
  },
] as const;

export const ONBOARDING_STORAGE_KEY = "readlife-onboarding-v1";

export function resolveAvatarImage(
  avatar: OnboardingState["avatar"] | "male" | "female" | "custom" | null | undefined,
  customImage?: string | null,
): string {
  if (customImage) return customImage;
  if (avatar === "male") return READER_AVATARS[0].image;
  if (avatar === "female") return READER_AVATARS[1].image;
  return READER_AVATARS[1].image;
}

export function resolvePet(state: OnboardingState) {
  return SHELF_PETS.find((p) => p.id === state.pet) ?? SHELF_PETS[5];
}

export function resolveRoom(state: OnboardingState) {
  return ROOMS.find((r) => r.id === state.room) ?? ROOMS[0];
}


