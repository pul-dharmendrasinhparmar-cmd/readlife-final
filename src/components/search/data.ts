import type {
  DiscoverBook,
  DiscoverList,
  DiscoverReader,
  MiniGame,
} from "./types";
import { EXPANSION_BOOKS } from "./catalog-expansion";

const cover = (isbn: string) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

const CORE_BOOKS: DiscoverBook[] = [
  {
    id: "night-circus",
    title: "The Night Circus",
    author: "Erin Morgenstern",
    cover: cover("9780307744432"),
    color: "#5b4e8c",
    description:
      "The circus arrives without warning. Within the black-and-white tents of Le Cirque des Rêves—open only at night—two young magicians, Celia and Marco, have been trained since childhood for a deadly competition. As they fall in love, the game’s true stakes threaten every performer and patron caught in its orbit.",
    genres: ["Fantasy", "Magical Realism"],
    averageRating: 4.25,
    pageCount: 516,
    readLifeReaders: 48200,
    reviewCount: 12600,
    formats: ["Physical", "Ebook", "Audio"],
    friendRating: 4.6,
    followedReadersCount: 18,
  },
  {
    id: "starless-sea",
    title: "The Starless Sea",
    author: "Erin Morgenstern",
    cover: cover("9780385541213"),
    color: "#3a2f4a",
    description:
      "Graduate student Zachary Ezra Rawlins finds a mysterious book in the library stacks that contains a story from his own childhood. Following a trail of clues—a bee, a key, and a sword—he is drawn through a doorway into an ancient underground library on the shores of a starless sea, where stories, lovers, and a war over the realm’s fate await.",
    genres: ["Fantasy", "Magical Realism"],
    averageRating: 4.1,
    pageCount: 512,
    readLifeReaders: 21400,
    reviewCount: 5400,
    formats: ["Physical", "Ebook", "Audio"],
    recommendationReason: "Because you gave The Night Circus 5★.",
    discoveryCategory: "for-you",
    friendRating: 4.3,
    followedReadersCount: 9,
  },
  {
    id: "piranesi",
    title: "Piranesi",
    author: "Susanna Clarke",
    cover: cover("9781635575637"),
    color: "#3d5a6c",
    description:
      "Piranesi lives in the House: an infinite labyrinth of halls lined with statues, where tides thunder up staircases and clouds drift through the upper levels. He carefully records its wonders and meets twice a week with the Other—until messages appear, another presence arrives, and the world he thought he knew begins to unravel.",
    genres: ["Fantasy", "Literary"],
    averageRating: 4.4,
    pageCount: 272,
    readLifeReaders: 31800,
    reviewCount: 8900,
    formats: ["Physical", "Ebook", "Audio"],
    recommendationReason: "Based on your Reader DNA.",
    discoveryCategory: "for-you",
    followedReadersCount: 12,
  },
  {
    id: "six-crows",
    title: "Six of Crows",
    author: "Leigh Bardugo",
    cover: cover("9781627792127"),
    color: "#5c3d2e",
    description:
      "In Ketterdam, criminal prodigy Kaz Brekker is offered a deadly heist that could make him rich beyond his wildest dreams. To pull it off he assembles a crew of dangerous outcasts—a convict, a sharpshooter, a runaway, a spy known as the Wraith, a Heartrender, and a thief—who may be the only ones standing between the world and destruction, if they don’t kill each other first.",
    genres: ["Fantasy", "YA"],
    averageRating: 4.5,
    pageCount: 465,
    readLifeReaders: 61200,
    reviewCount: 18200,
    formats: ["Physical", "Ebook", "Audio"],
  },
  {
    id: "achilles",
    title: "The Song of Achilles",
    author: "Madeline Miller",
    cover: cover("9780062060624"),
    color: "#8b5a2b",
    description:
      "Exiled prince Patroclus arrives in Phthia as an unwanted boy living in the shadow of Achilles, best of all the Greeks and son of a goddess. Against all odds they forge a bond that deepens into love, until the call to Troy pulls Achilles toward glory—and Patroclus must follow him into a war that will test everything they hold dear.",
    genres: ["Literary", "Historical", "Romance"],
    averageRating: 4.35,
    pageCount: 416,
    readLifeReaders: 55400,
    reviewCount: 20100,
    formats: ["Physical", "Ebook", "Audio"],
  },
  {
    id: "circe",
    title: "Circe",
    author: "Madeline Miller",
    cover: cover("9780316556347"),
    color: "#5a6b3a",
    description:
      "In the house of Helios, a strange daughter is born: Circe, neither powerful like her father nor alluring like her mother. Discovering the power of witchcraft, she is banished by Zeus to a deserted island, where she hones her craft and crosses paths with myths themselves—the Minotaur, Daedalus, Medea, and Odysseus—before she must choose between the gods she was born from and the mortals she has come to love.",
    genres: ["Fantasy", "Literary", "Myth"],
    averageRating: 4.3,
    pageCount: 393,
    readLifeReaders: 49800,
    reviewCount: 15400,
    formats: ["Physical", "Ebook", "Audio"],
    recommendationReason: "Similar to three of your favorites.",
    discoveryCategory: "for-you",
  },
  {
    id: "mexico",
    title: "Mexican Gothic",
    author: "Silvia Moreno-Garcia",
    cover: cover("9780525620785"),
    color: "#4a3a2a",
    description:
      "After receiving a frantic letter from her newly wed cousin, glamorous debutante Noemí Taboada travels to High Place, an isolated mansion in 1950s Mexico. There she finds a chillingly charismatic English husband, an ancient patriarch, and a house that invades her dreams with visions of blood and doom—as the family’s buried secrets of violence and madness rise to the surface.",
    genres: ["Horror", "Gothic", "Historical"],
    averageRating: 3.75,
    pageCount: 301,
    readLifeReaders: 18600,
    reviewCount: 6200,
    formats: ["Physical", "Ebook", "Audio"],
    recommendationReason:
      "Because you often finish atmospheric fantasy.",
    discoveryCategory: "for-you",
  },
  {
    id: "ninth-house",
    title: "Ninth House",
    author: "Leigh Bardugo",
    cover: cover("9781250313072"),
    color: "#2a3550",
    description:
      "Galaxy “Alex” Stern is the most unlikely member of Yale’s freshman class—and the sole survivor of a horrific multiple homicide. Offered a full ride on one condition, she arrives in New Haven tasked with monitoring Yale’s secret societies, whose occult rites involve forbidden magic, raising the dead, and, sometimes, preying on the living.",
    genres: ["Fantasy", "Dark Academia", "Mystery"],
    averageRating: 4.05,
    pageCount: 479,
    readLifeReaders: 27300,
    reviewCount: 7800,
    formats: ["Physical", "Ebook", "Audio"],
    recommendationReason: "Popular among readers you follow.",
    discoveryCategory: "for-you",
  },
  {
    id: "ink-blood",
    title: "Ink Blood Sister Scribe",
    author: "Emma Törzs",
    cover: cover("9780063253469"),
    color: "#5a3a4a",
    description:
      "Two estranged half-sisters are tasked with guarding their family’s library of magical books. After their father’s sudden death, Esther and Joanna must reunite to preserve their legacy—and uncover a world of magic far bigger and more dangerous than they imagined, along with the secrets their parents kept across centuries and continents.",
    genres: ["Fantasy", "Literary"],
    averageRating: 4.15,
    pageCount: 416,
    readLifeReaders: 1200,
    reviewCount: 340,
    formats: ["Physical", "Ebook"],
    recommendationReason: "Readers with similar taste loved this.",
    discoveryCategory: "hidden-gems",
  },
  {
    id: "sea-tranquility",
    title: "Sea of Tranquility",
    author: "Emily St. John Mandel",
    cover: cover("9780593321447"),
    color: "#3a4a5c",
    description:
      "A detective in the far future investigates a strange anomaly that echoes across centuries—linking a forest on Vancouver Island in 1912, a writer on a book tour during a pandemic, and a colony on the moon. Emily St. John Mandel’s novel braids time travel, pandemic, and quiet human connection into a meditation on what endures.",
    genres: ["Literary", "Sci-Fi"],
    averageRating: 4.05,
    pageCount: 272,
    readLifeReaders: 980,
    reviewCount: 210,
    formats: ["Physical", "Ebook", "Audio"],
    recommendationReason: "Quietly beloved by Fantasy Wanderers.",
    discoveryCategory: "hidden-gems",
  },
  {
    id: "bunny",
    title: "Bunny",
    author: "Mona Awad",
    cover: cover("9780525559733"),
    color: "#6b3a5a",
    description:
      "Samantha Heather Mackey is a lonely MFA student on scholarship, watching from the outside as a clique of rich girls who call each other Bunny throw elaborate parties. When she is suddenly invited in, their world of workshops and rituals turns darker—and far stranger—than literary ambition alone.",
    genres: ["Literary", "Horror", "Dark Academia"],
    averageRating: 3.7,
    pageCount: 320,
    readLifeReaders: 486,
    reviewCount: 160,
    formats: ["Physical", "Ebook"],
    recommendationReason: "Only 486 ReadLife readers—worth the hunt.",
    discoveryCategory: "hidden-gems",
  },
  {
    id: "hamnet",
    title: "Hamnet",
    author: "Maggie O'Farrell",
    cover: cover("9780525657606"),
    color: "#5c4a3a",
    description:
      "In 1596, a young family in Stratford is struck by plague. Maggie O’Farrell imagines the short life of Hamnet Shakespeare and the woman at the center of it—Agnes—whose grief and fierce love reshape the household, and echo into the writing of Hamlet.",
    genres: ["Historical", "Literary"],
    averageRating: 4.2,
    pageCount: 320,
    readLifeReaders: 1420,
    reviewCount: 480,
    formats: ["Physical", "Ebook", "Audio"],
    recommendationReason: "Character-driven, quietly devastating.",
    discoveryCategory: "hidden-gems",
  },
  {
    id: "babel",
    title: "Babel",
    author: "R.F. Kuang",
    cover: cover("9780063021426"),
    color: "#4a2f2a",
    description:
      "1828. Robin Swift, orphaned in Canton, is brought to London and trained for Oxford’s Royal Institute of Translation—Babel—where silver-working magic turns meaning lost in translation into imperial power. As Robin learns that Babel serves colonization, he is torn between the Institute and the Hermes Society, forced to choose what he will sacrifice to resist an empire.",
    genres: ["Fantasy", "Historical", "Dark Academia"],
    averageRating: 4.2,
    pageCount: 560,
    readLifeReaders: 38900,
    reviewCount: 11200,
    formats: ["Physical", "Ebook", "Audio"],
    recommendationReason: "Trending among Fantasy Wanderers.",
    discoveryCategory: "trending",
  },
  {
    id: "yellowface",
    title: "Yellowface",
    author: "R.F. Kuang",
    cover: cover("9780063250833"),
    color: "#b08fce",
    description:
      "When struggling writer June Hayward witnesses her rising-star rival Athena Liu die in a freak accident, she steals Athena’s unfinished manuscript and publishes it as her own. Fame follows—then the internet, suspicion, and the spiraling consequences of a lie that was never hers to tell.",
    genres: ["Literary", "Thriller"],
    averageRating: 3.85,
    pageCount: 336,
    readLifeReaders: 42100,
    reviewCount: 9800,
    formats: ["Physical", "Ebook", "Audio"],
    recommendationReason: "12 readers you follow added this recently.",
    discoveryCategory: "trending",
  },
  {
    id: "fourth-wing",
    title: "Fourth Wing",
    author: "Rebecca Yarros",
    cover: cover("9781649374042"),
    color: "#6b2a2a",
    description:
      "Twenty-year-old Violet Sorrengail is conscripted into Basgiath War College’s deadly dragon-rider quadrant, where most candidates don’t survive. Frail but cunning, she must endure brutal training, deadly rivals, and the dragons themselves—while navigating a war that will demand everything.",
    genres: ["Fantasy", "Romance"],
    averageRating: 4.55,
    pageCount: 517,
    readLifeReaders: 92000,
    reviewCount: 28000,
    formats: ["Physical", "Ebook", "Audio"],
    recommendationReason: "Popular with 80%+ Reading Matches.",
    discoveryCategory: "trending",
  },
  {
    id: "tomorrow",
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    cover: cover("9780593321201"),
    color: "#6b3a4a",
    description:
      "On a winter day in Cambridge, Massachusetts, Sam and Sadie meet as kids in a hospital game room and spark a creative partnership that will define their lives. Across decades they build legendary games, chase success, and wrestle with love, rivalry, disability, and what it means to make something together.",
    genres: ["Literary", "Contemporary"],
    averageRating: 4.15,
    pageCount: 416,
    readLifeReaders: 35600,
    reviewCount: 9100,
    formats: ["Physical", "Ebook", "Audio"],
    recommendationReason: "Trending among Literary Dreamers.",
    discoveryCategory: "trending",
  },
  {
    id: "lessons-chemistry",
    title: "Lessons in Chemistry",
    author: "Bonnie Garmus",
    cover: cover("9780385547345"),
    color: "#3a5a6b",
    description:
      "In early 1960s California, chemist Elizabeth Zott is brilliant, rigorous, and tired of being underestimated. Fired from her lab, she becomes the reluctant star of a daytime cooking show—and quietly turns supper-time America into a classroom for science, self-worth, and change.",
    genres: ["Historical", "Literary", "Humor"],
    averageRating: 4.3,
    pageCount: 400,
    readLifeReaders: 44800,
    reviewCount: 13200,
    formats: ["Physical", "Ebook", "Audio"],
    recommendationReason:
      "You rarely read historical fiction, but readers who share your love of character-driven stories rated this highly.",
    discoveryCategory: "outside",
  },
  {
    id: "project-hail",
    title: "Project Hail Mary",
    author: "Andy Weir",
    cover: cover("9780593135204"),
    color: "#1f4d6e",
    description:
      "Ryland Grace wakes alone on a spaceship with two problems: he can’t remember why he’s there, and he’s humanity’s last chance to stop an extinction-level threat. As memories return, he faces an impossible mission—and an unexpected friendship that may save more than Earth.",
    genres: ["Sci-Fi", "Adventure"],
    averageRating: 4.5,
    pageCount: 476,
    readLifeReaders: 51000,
    reviewCount: 14500,
    formats: ["Physical", "Ebook", "Audio"],
    recommendationReason:
      "Outside your usual shelf—readers with your taste finished this in two nights.",
    discoveryCategory: "outside",
  },
  {
    id: "silent-patient",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    cover: cover("9781250301697"),
    color: "#4a2f3a",
    description:
      "Alicia Berenson, a famous painter, shoots her husband five times and never speaks again. Criminal psychotherapist Theo Faber becomes obsessed with treating her at the secure psychiatric unit where she is held—determined to uncover the truth behind her silence.",
    genres: ["Thriller", "Mystery"],
    averageRating: 4.1,
    pageCount: 336,
    readLifeReaders: 67000,
    reviewCount: 19000,
    formats: ["Physical", "Ebook", "Audio"],
    recommendationReason: "A twisty detour from your fantasy shelf.",
    discoveryCategory: "outside",
  },
  {
    id: "night-film",
    title: "Night Film",
    author: "Marisha Pessl",
    cover: cover("9780812978643"),
    color: "#1a1a2e",
    description:
      "When the daughter of legendary cult filmmaker Stanislas Cordova is found dead, disgraced investigative journalist Scott McGrath is pulled back into Cordova’s shadowy world. Tracking clues through a labyrinth of fans, secrets, and cinematic nightmares, he uncovers a mystery far stranger than a simple suicide.",
    genres: ["Mystery", "Thriller", "Literary"],
    averageRating: 3.8,
    pageCount: 624,
    readLifeReaders: 8200,
    reviewCount: 2100,
    formats: ["Physical", "Ebook"],
  },
  {
    id: "house-sky",
    title: "The House in the Cerulean Sea",
    author: "TJ Klune",
    cover: cover("9781250217288"),
    color: "#3a6b7a",
    description:
      "Linus Baker, a by-the-book caseworker for the Department in Charge of Magical Youth, is sent to an orphanage on a remote island to evaluate six magical children and their charismatic caretaker. What begins as an inspection becomes a found family that challenges everything Linus believes about rules, love, and belonging.",
    genres: ["Fantasy", "Cozy", "Found Family"],
    averageRating: 4.4,
    pageCount: 398,
    readLifeReaders: 40200,
    reviewCount: 11800,
    formats: ["Physical", "Ebook", "Audio"],
    recommendationReason: "Cozy & comforting with found family vibes.",
    discoveryCategory: "mood",
  },
  {
    id: "a-little-life",
    title: "A Little Life",
    author: "Hanya Yanagihara",
    cover: cover("9780804172707"),
    color: "#6b5a3a",
    description:
      "Four college classmates—Willem, JB, Malcolm, and Jude—move to New York buoyed by friendship and ambition. Over decades their lives intertwine through success and failure, held together by devotion to Jude, a brilliant man scarred by an unspeakable childhood trauma.",
    genres: ["Literary", "Contemporary"],
    averageRating: 4.3,
    pageCount: 720,
    readLifeReaders: 28900,
    reviewCount: 9500,
    formats: ["Physical", "Ebook", "Audio"],
    recommendationReason: "For when you want to feel everything.",
    discoveryCategory: "mood",
  },
  {
    id: "thursday-murder",
    title: "The Thursday Murder Club",
    author: "Richard Osman",
    cover: cover("9781984880987"),
    color: "#5a6b4a",
    description:
      "In a peaceful retirement village, four friends meet weekly to investigate cold cases for fun. When a local murder lands on their doorstep, Elizabeth, Joyce, Ibrahim, and Ron put their unlikely skills to the test in a mystery that is anything but retired.",
    genres: ["Mystery", "Humor", "Cozy"],
    averageRating: 4.05,
    pageCount: 368,
    readLifeReaders: 33500,
    reviewCount: 8700,
    formats: ["Physical", "Ebook", "Audio"],
    recommendationReason: "Short & sweet mystery energy.",
    discoveryCategory: "mood",
  },
  {
    id: "normal-people",
    title: "Normal People",
    author: "Sally Rooney",
    cover: cover("9781984822172"),
    color: "#7a5a4a",
    description:
      "Connell and Marianne grow up in the same small Irish town but occupy different worlds—until an awkward, electrifying connection begins. Through school and Trinity College in Dublin they circle each other for years, drawn together and apart as each confronts love, class, and how far they will go to save one another.",
    genres: ["Literary", "Romance", "Contemporary"],
    averageRating: 3.85,
    pageCount: 273,
    readLifeReaders: 41200,
    reviewCount: 14000,
    formats: ["Physical", "Ebook", "Audio"],
    recommendationReason: "Slow burn, character-first.",
    discoveryCategory: "mood",
  },
  {
    id: "hobbit",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    cover: cover("9780547928227"),
    color: "#3a5a3a",
    description:
      "Bilbo Baggins of Bag End enjoys a quiet life until the wizard Gandalf and a company of dwarves arrive with an unexpected adventure: reclaim a treasure from the dragon Smaug. Reluctantly, Bilbo joins the quest across wild lands—and discovers courage, riddles, and a magic ring that will change more than his story.",
    genres: ["Fantasy", "Classics", "Adventure"],
    averageRating: 4.3,
    pageCount: 300,
    readLifeReaders: 88000,
    reviewCount: 32000,
    formats: ["Physical", "Ebook", "Audio"],
  },
  {
    id: "acomaf",
    title: "A Court of Mist and Fury",
    author: "Sarah J. Maas",
    cover: cover("9781619635197"),
    color: "#4a2a5a",
    description:
      "After surviving Under the Mountain, Feyre returns to the Spring Court—but nothing feels like home. Drawn toward the Night Court and a power she is only beginning to understand, she must confront trauma, politics, and a love that rewrites the rules of Prythian.",
    genres: ["Fantasy", "Romance", "YA"],
    averageRating: 4.6,
    pageCount: 624,
    readLifeReaders: 95000,
    reviewCount: 41000,
    formats: ["Physical", "Ebook", "Audio"],
  },
  {
    id: "evelyn-hugo",
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    cover: cover("9781501139239"),
    color: "#8a3a5a",
    description:
      "Aging Hollywood icon Evelyn Hugo is finally ready to tell the truth—to unknown reporter Monique Grant. Over seven husbands and a lifetime of scandal, ambition, and forbidden love, Evelyn reveals why Monique is the only one who can hear her story.",
    genres: ["Literary", "Historical", "Romance"],
    averageRating: 4.45,
    pageCount: 400,
    readLifeReaders: 102000,
    reviewCount: 48000,
    formats: ["Physical", "Ebook", "Audio"],
  },
  {
    id: "legends-lattes",
    title: "Legends & Lattes",
    author: "Travis Baldree",
    cover: cover("9781250886088"),
    color: "#6b4a2a",
    description:
      "Viv, a battle-weary orc, hangs up her sword to open the first coffee shop in the city of Thune. With a cinnamon roll baker, a mischievous succubus, and a growing found family, she learns that building something soft can be its own kind of adventure.",
    genres: ["Fantasy", "Cozy", "Found Family"],
    averageRating: 4.2,
    pageCount: 304,
    readLifeReaders: 36000,
    reviewCount: 9800,
    formats: ["Physical", "Ebook", "Audio"],
  },
  {
    id: "jonathan-strange",
    title: "Jonathan Strange & Mr Norrell",
    author: "Susanna Clarke",
    cover: cover("9780765356154"),
    color: "#2a3a4a",
    description:
      "In an alternate nineteenth-century England, magic returns—and with it two very different magicians. Practical Mr Norrell and the daring Jonathan Strange reshape history itself, from the Napoleonic wars to Faerie, in Susanna Clarke’s epic of rivalry, wonder, and the cost of power.",
    genres: ["Fantasy", "Historical", "Literary"],
    averageRating: 3.9,
    pageCount: 1006,
    readLifeReaders: 22000,
    reviewCount: 7100,
    formats: ["Physical", "Ebook", "Audio"],
  },
  {
    id: "iewu",
    title: "It Ends With Us",
    author: "Colleen Hoover",
    cover: cover("9781501110368"),
    color: "#7a4a5c",
    description:
      "Lily Bloom has worked hard to build a life she can be proud of—until Ryle Kincaid, a brilliant neurosurgeon with a short fuse, crashes into it. As their relationship intensifies, Lily is forced to confront the cycle of abuse she swore she would never repeat.",
    genres: ["Romance", "Contemporary"],
    averageRating: 4.2,
    pageCount: 384,
    readLifeReaders: 110000,
    reviewCount: 52000,
    formats: ["Physical", "Ebook", "Audio"],
  },
  {
    id: "atlas",
    title: "The Atlas Six",
    author: "Olivie Blake",
    cover: cover("9781250854513"),
    color: "#2a3550",
    description:
      "Six of the world’s most powerful young medeians are invited to join a secret society for one year of initiation—where five will leave with their memories, and one will not leave at all. Rivalry, desire, and dangerous knowledge collide as each candidate fights to survive the society’s trials.",
    genres: ["Fantasy", "Dark Academia"],
    averageRating: 3.6,
    pageCount: 384,
    readLifeReaders: 28000,
    reviewCount: 8900,
    formats: ["Physical", "Ebook", "Audio"],
  },
];

export const DISCOVER_BOOKS: DiscoverBook[] = [
  ...CORE_BOOKS,
  ...EXPANSION_BOOKS,
];

export const DISCOVER_READERS: DiscoverReader[] = [
  {
    id: "mina",
    displayName: "Mina",
    username: "minareads",
    avatar: "/avatars/1.png",
    readingPersonality: "The Trusted Recommender",
    favoriteGenres: ["Fantasy", "Literary Fiction", "Romance"],
    currentBook: "Piranesi",
    readingMatch: 87,
    matchReasons: [
      "atmospheric fantasy",
      "character-driven stories",
      "slow-burn books",
    ],
    followers: 2840,
    following: 312,
    section: "similar",
  },
  {
    id: "jordan",
    displayName: "Jordan",
    username: "jordanshelf",
    avatar: "/avatars/2.png",
    readingPersonality: "The Cozy Cartographer",
    favoriteGenres: ["Cozy Fantasy", "Romance", "Mystery"],
    currentBook: "The House in the Cerulean Sea",
    readingMatch: 79,
    matchReasons: ["found family", "gentle fantasy", "rainy-day reads"],
    followers: 1520,
    following: 410,
    section: "similar",
  },
  {
    id: "sam",
    displayName: "Sam",
    username: "samreadsweird",
    avatar: "/avatars/3.png",
    readingPersonality: "The Genre Nomad",
    favoriteGenres: ["Literary", "Horror", "Sci-Fi"],
    currentBook: "Bunny",
    readingMatch: 61,
    matchReasons: ["literary experiments", "emotional intensity"],
    followers: 980,
    following: 220,
    section: "broaden",
  },
  {
    id: "priya",
    displayName: "Priya",
    username: "priyapages",
    avatar: "/avatars/4.png",
    readingPersonality: "The History Whisperer",
    favoriteGenres: ["Historical", "Literary", "Memoir"],
    currentBook: "Hamnet",
    readingMatch: 54,
    matchReasons: ["character depth", "quiet devastation"],
    followers: 2100,
    following: 180,
    section: "broaden",
  },
  {
    id: "leo",
    displayName: "Leo",
    username: "leolists",
    avatar: "/avatars/5.png",
    readingPersonality: "The List Alchemist",
    favoriteGenres: ["Fantasy", "Romance", "YA"],
    currentBook: "Fourth Wing",
    readingMatch: 72,
    matchReasons: ["fantasy favorites", "recommendation taste"],
    followers: 5640,
    following: 190,
    section: "list-makers",
  },
  {
    id: "nova",
    displayName: "Nova",
    username: "novanightreads",
    avatar: "/avatars/6.png",
    readingPersonality: "The Night Owl Curator",
    favoriteGenres: ["Fantasy", "Magical Realism", "Poetry"],
    currentBook: "The Starless Sea",
    readingMatch: 84,
    matchReasons: ["Night Circus adjacent", "dreamlike prose"],
    followers: 3210,
    following: 260,
    section: "list-makers",
  },
  {
    id: "casey",
    displayName: "Casey",
    username: "caseyjuststarted",
    avatar: "/avatars/2.png",
    readingPersonality: "The Fresh Chapter",
    favoriteGenres: ["Fantasy", "Contemporary"],
    currentBook: "Six of Crows",
    readingMatch: 68,
    matchReasons: ["early fantasy favorites"],
    followers: 42,
    following: 88,
    section: "new",
  },
  {
    id: "river",
    displayName: "River",
    username: "riverreads",
    avatar: "/avatars/4.png",
    readingPersonality: "The Soft Critic",
    favoriteGenres: ["Literary", "Romance"],
    currentBook: "Normal People",
    readingMatch: 70,
    matchReasons: ["emotional fiction"],
    followers: 156,
    following: 204,
    section: "new",
  },
  {
    id: "haze",
    displayName: "Haze",
    username: "hazebooks",
    avatar: "/avatars/3.png",
    readingPersonality: "The Mood Matcher",
    favoriteGenres: ["Thriller", "Fantasy", "Horror"],
    currentBook: "Ninth House",
    readingMatch: 76,
    matchReasons: ["dark academia adjacent"],
    followers: 890,
    following: 340,
    section: "friends-follow",
  },
  {
    id: "ellie",
    displayName: "Ellie",
    username: "elliechapter",
    avatar: "/avatars/1.png",
    readingPersonality: "The Comfort Reader",
    favoriteGenres: ["Cozy", "Romance", "Mystery"],
    currentBook: "The Thursday Murder Club",
    readingMatch: 65,
    matchReasons: ["comfort reads"],
    followers: 1200,
    following: 450,
    section: "friends-follow",
  },
];

export const DISCOVER_LISTS: DiscoverList[] = [
  {
    id: "altered-brain",
    title: "Books That Permanently Altered My Brain",
    description:
      "The ones I still think about on random Tuesdays. Proceed with emotional caution.",
    creatorId: "mina",
    tags: ["Literary", "Devastating", "Favorites"],
    bookIds: ["a-little-life", "piranesi", "hamnet", "circe", "night-circus", "achilles"],
    saveCount: 2800,
    readerCount: 742,
    completionCount: 314,
    section: "trending",
  },
  {
    id: "feel-like-dreams",
    title: "Books That Feel Like Dreams",
    description: "Soft edges, strange halls, and stories that refuse to stay on the page.",
    creatorId: "nova",
    tags: ["Magical Realism", "Atmospheric"],
    bookIds: ["starless-sea", "piranesi", "night-circus", "sea-tranquility", "ink-blood"],
    saveCount: 1940,
    readerCount: 512,
    completionCount: 188,
    section: "for-you",
  },
  {
    id: "cozy-fantasy-beginners",
    title: "Beginner's Guide to Cozy Fantasy",
    description: "Low stakes, warm drinks, and found families. Perfect rainy-day shelf.",
    creatorId: "jordan",
    tags: ["Cozy", "Fantasy", "Beginner"],
    bookIds: ["house-sky", "thursday-murder", "circe", "starless-sea"],
    saveCount: 4210,
    readerCount: 1204,
    completionCount: 680,
    section: "trending",
  },
  {
    id: "hate-fantasy",
    title: "Fantasy for People Who Think They Hate Fantasy",
    description: "Gateway books with literary heart and almost no map-required lore.",
    creatorId: "leo",
    tags: ["Fantasy", "Gateway"],
    bookIds: ["piranesi", "house-sky", "circe", "babel", "night-circus"],
    saveCount: 3560,
    readerCount: 980,
    completionCount: 410,
    section: "for-you",
  },
  {
    id: "rainy-sunday",
    title: "Books for a Rainy Sunday",
    description: "One sitting, soft light, and nowhere else to be.",
    creatorId: "ellie",
    tags: ["Short", "Cozy", "Mood"],
    bookIds: ["piranesi", "thursday-murder", "sea-tranquility", "normal-people"],
    saveCount: 1680,
    readerCount: 430,
    completionCount: 290,
    section: "short",
  },
  {
    id: "destroy-you",
    title: "Short Books That Will Destroy You",
    description: "Under 300 pages. Emotionally illegal.",
    creatorId: "sam",
    tags: ["Short", "Devastating"],
    bookIds: ["piranesi", "normal-people", "bunny", "sea-tranquility"],
    saveCount: 5120,
    readerCount: 1800,
    completionCount: 920,
    section: "short",
  },
  {
    id: "found-family",
    title: "Found Family Done Right",
    description: "Chosen families, soft landings, and people who stay.",
    creatorId: "jordan",
    tags: ["Found Family", "Comfort"],
    bookIds: ["house-sky", "six-crows", "tomorrow", "circe"],
    saveCount: 2340,
    readerCount: 670,
    completionCount: 310,
    section: "following",
  },
  {
    id: "first-time-again",
    title: "Books I Wish I Could Read Again for the First Time",
    description: "Irreplaceable first-page magic.",
    creatorId: "mina",
    tags: ["Favorites", "Reread"],
    bookIds: ["night-circus", "six-crows", "piranesi", "project-hail", "babel"],
    saveCount: 6100,
    readerCount: 2100,
    completionCount: 1400,
    section: "following",
  },
  {
    id: "nothing-happens",
    title: "Books Where Nothing Happens but Somehow Everything Happens",
    description: "Quiet novels that rearrange you anyway.",
    creatorId: "priya",
    tags: ["Literary", "Quiet"],
    bookIds: ["normal-people", "hamnet", "sea-tranquility", "tomorrow"],
    saveCount: 890,
    readerCount: 260,
    completionCount: 95,
    section: "outside",
  },
  {
    id: "no-miscomm",
    title: "Romance Without Miscommunication",
    description: "Adults who talk. Miracles do happen.",
    creatorId: "nova",
    tags: ["Romance", "Trope Subversion"],
    bookIds: ["achilles", "normal-people", "house-sky", "tomorrow"],
    saveCount: 1420,
    readerCount: 380,
    completionCount: 140,
    section: "outside",
  },
];

export const MINI_GAMES: MiniGame[] = [
  {
    id: "bookbound",
    title: "Bookbound",
    description:
      "Follow Pip through magical story worlds, collect missing pages, defeat monsters, and restore the stories hidden inside books.",
    playable: true,
  },
  {
    id: "bookle",
    title: "Bookle",
    description:
      "Guess the word before you run out of clues — literary Wordle with themed worlds.",
    playable: true,
  },
  {
    id: "bookworm",
    title: "Bookworm",
    description:
      "Guide your bookworm through the library, collect books, and beat your high score.",
    playable: true,
  },
  {
    id: "lexicon",
    title: "Wordsmith",
    description:
      "Bookish Scrabble — any real word scores; bookish jargon earns bonus points vs ReadLife.",
    playable: true,
  },
  {
    id: "uncovered",
    title: "Uncovered",
    description:
      "Guess the book from a hidden cover, or from the plot told in five emojis.",
    playable: true,
  },
  {
    id: "guess-the-book",
    title: "Guess the Book",
    description: "Can you recognize a book from increasingly obvious clues?",
    playable: true,
  },
  {
    id: "pieces",
    title: "Pieces",
    description:
      "Reconstruct a portrait book cover with 35 real jigsaw pieces.",
    playable: true,
  },
  {
    id: "trolley",
    title: "Trolley of Tales",
    description:
      "Steer a library trolley, catch falling books, and dodge the spills.",
    playable: true,
  },
  {
    id: "shelf-sort",
    title: "Shelf Sort",
    description: "Put books where they belong before the clock runs out.",
    playable: false,
  },
  {
    id: "book-bingo",
    title: "Book Bingo",
    description: "Generate a reading challenge from your own library.",
    playable: false,
  },
  {
    id: "genre-dash",
    title: "Genre Dash",
    description: "How quickly can you identify a book's genre?",
    playable: false,
  },
  {
    id: "know-your-library",
    title: "How Well Do You Know Your Library?",
    description: "Questions based on books you've actually logged.",
    playable: true,
  },
];

export const MOODS = [
  { id: "cry", label: "Make Me Cry" },
  { id: "cozy", label: "Cozy & Comforting" },
  { id: "cant-stop", label: "Can't Put It Down" },
  { id: "dark", label: "Dark & Twisty" },
  { id: "romantic", label: "Romantic" },
  { id: "transport", label: "Transport Me Somewhere Else" },
  { id: "short", label: "Short & Sweet" },
  { id: "think", label: "Make Me Think" },
  { id: "magical", label: "Magical" },
  { id: "funny", label: "Funny" },
  { id: "slow-burn", label: "Slow Burn" },
  { id: "found-family", label: "Found Family" },
] as const;

export const MOOD_BOOK_MAP: Record<string, string[]> = {
  cry: ["a-little-life", "hamnet", "achilles", "normal-people", "crying-hmart", "educated"],
  cozy: ["house-sky", "thursday-murder", "circe", "before-coffee", "legends-lattes", "maid"],
  "cant-stop": ["fourth-wing", "six-crows", "project-hail", "babel", "verity", "iron-flame", "gone-girl"],
  dark: ["ninth-house", "silent-patient", "bunny", "mexico", "sharp-objects", "only-good-indians", "blackened-teeth"],
  romantic: ["achilles", "normal-people", "fourth-wing", "beach-read", "book-lovers", "love-hypothesis", "red-white-royal"],
  transport: ["starless-sea", "night-circus", "piranesi", "babel", "dune", "neverwhere", "pachinko"],
  short: ["piranesi", "sea-tranquility", "normal-people", "convenience-store", "between-world", "night-wiesel"],
  think: ["babel", "sea-tranquility", "tomorrow", "yellowface", "sapiens", "thinking-fast", "trust"],
  magical: ["night-circus", "starless-sea", "circe", "ink-blood", "mistborn", "name-wind", "gideon-ninth"],
  funny: ["thursday-murder", "lessons-chemistry", "bunny", "born-crime", "funny-story", "love-hypothesis"],
  "slow-burn": ["normal-people", "achilles", "night-circus", "pride-prejudice", "people-vacation", "demon-copperhead"],
  "found-family": ["house-sky", "six-crows", "tomorrow", "lincoln-highway", "daisy-jones", "mistborn"],
};

export function booksByGenre(genre: string) {
  const g = genre.toLowerCase();
  return DISCOVER_BOOKS.filter((b) =>
    b.genres.some((x) => x.toLowerCase() === g || x.toLowerCase().includes(g)),
  );
}

export function getBookById(id: string) {
  return DISCOVER_BOOKS.find((b) => b.id === id);
}

export function getReaderById(id: string) {
  return DISCOVER_READERS.find((r) => r.id === id);
}

export function getReaderByUsername(username: string) {
  const clean = username.replace(/^@/, "");
  return DISCOVER_READERS.find((r) => r.username === clean);
}

export function getListById(id: string) {
  return DISCOVER_LISTS.find((l) => l.id === id);
}

export function booksByCategory(category: DiscoverBook["discoveryCategory"]) {
  return DISCOVER_BOOKS.filter((b) => b.discoveryCategory === category);
}

/** Ordered “Top 10 Books Today” — Netflix-style regional chart for Discover. */
export const TOP_10_TODAY_IDS = [
  "fourth-wing",
  "iewu",
  "evelyn-hugo",
  "acomaf",
  "six-crows",
  "silent-patient",
  "project-hail",
  "babel",
  "circe",
  "yellowface",
] as const;

export function getTop10TodayBooks(): DiscoverBook[] {
  return TOP_10_TODAY_IDS.map((id) => getBookById(id)).filter(
    (b): b is DiscoverBook => Boolean(b),
  );
}

export function searchAll(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { books: [], readers: [], lists: [], games: [] };
  }
  const books = DISCOVER_BOOKS.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genres.some((g) => g.toLowerCase().includes(q)),
  );
  const readers = DISCOVER_READERS.filter(
    (r) =>
      r.displayName.toLowerCase().includes(q) ||
      r.username.toLowerCase().includes(q) ||
      r.readingPersonality.toLowerCase().includes(q),
  );
  const lists = DISCOVER_LISTS.filter(
    (l) =>
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.tags.some((t) => t.toLowerCase().includes(q)),
  );
  const games = MINI_GAMES.filter((g) =>
    g.title.toLowerCase().includes(q),
  );
  return { books, readers, lists, games };
}

export function autocompleteSuggestions(query: string) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return { books: [], authors: [], lists: [] };
  const books = DISCOVER_BOOKS.filter((b) =>
    b.title.toLowerCase().includes(q),
  ).slice(0, 4);
  const authorSet = new Map<string, string>();
  DISCOVER_BOOKS.forEach((b) => {
    if (b.author.toLowerCase().includes(q)) authorSet.set(b.author, b.author);
  });
  const authors = [...authorSet.values()].slice(0, 3);
  const lists = DISCOVER_LISTS.filter((l) =>
    l.title.toLowerCase().includes(q),
  ).slice(0, 3);
  return { books, authors, lists };
}
