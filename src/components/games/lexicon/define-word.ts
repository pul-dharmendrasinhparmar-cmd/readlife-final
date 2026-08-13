import { bookishBonusFor } from "./bookish-bonus";

export type WordSense = {
  partOfSpeech?: string;
  definition: string;
  example?: string;
};

export type WordDefinition = {
  word: string;
  phonetic?: string;
  senses: WordSense[];
  source: "bookish" | "dictionary" | "fallback";
  bookishBonus?: number;
};

/** Short house glosses for bookish jargon (shown before / with dictionary). */
const BOOKISH_GLOSS: Record<string, string> = {
  BOOK: "A written or printed work bound as pages between covers.",
  BOOKS: "Plural of book — written works for reading.",
  READ: "To look at and understand written words.",
  READER: "Someone who reads; also a school anthology.",
  READING: "The act of taking in written language.",
  PAGE: "One side of a leaf in a book.",
  PAGES: "Plural of page.",
  SHELF: "A board for storing books.",
  SHELVES: "Plural of shelf.",
  NOVEL: "A long work of prose fiction.",
  NOVELS: "Plural of novel.",
  POEM: "A piece of writing in verse.",
  POEMS: "Plural of poem.",
  STORY: "A narrative of events, real or imagined.",
  STORIES: "Plural of story.",
  TALE: "A narrative, often imaginative or traditional.",
  TALES: "Plural of tale.",
  AUTHOR: "The writer of a book or text.",
  WRITER: "A person who writes, especially as a craft or job.",
  LIBRARY: "A collection of books; a place that lends them.",
  CHAPTER: "A main division of a book.",
  BOOKMARK: "A marker that saves your place in a book.",
  HARDCOVER: "A book bound in rigid covers.",
  PAPERBACK: "A book with a flexible paper cover.",
  EBOOK: "A book in digital form.",
  AUDIOBOOK: "A book recorded for listening.",
  BOOKISH: "Fond of reading and books.",
  BOOKWORM: "An avid reader.",
  REREAD: "To read something again.",
  SKIM: "To read quickly for the main points.",
  DEVOUR: "To read with intense eagerness.",
  TROPE: "A recurring theme, device, or convention in stories.",
  TROPES: "Plural of trope.",
  HEROINE: "A female protagonist.",
  VILLAIN: "An antagonist who opposes the hero.",
  POET: "A writer of poems.",
  ESSAY: "A short piece of nonfiction argument or reflection.",
  MEMOIR: "A first-person account of part of a life.",
  FICTION: "Imaginative prose narrative.",
  FANTASY: "Fiction with magical or impossible elements.",
  MYSTERY: "A story centered on solving a crime or puzzle.",
  ROMANCE: "Fiction focused on love relationships.",
  HORROR: "Fiction meant to frighten or unsettle.",
  THRILLER: "Suspense-driven fiction.",
  POETRY: "Literature in verse form.",
  PROSE: "Ordinary written language, not verse.",
  VERSE: "Writing arranged in metrical lines.",
  TOME: "A large, heavy, or scholarly book.",
  SAGA: "A long story of adventure or family history.",
  EPIC: "A long narrative poem or sweeping story.",
  MYTH: "A traditional story explaining origins or beliefs.",
  LORE: "Traditional knowledge or legends.",
  CANON: "Works accepted as central or authoritative.",
  CLASSIC: "A work of lasting artistic value.",
  BESTSELLER: "A book that sells in very large numbers.",
  BOOKSTORE: "A shop that sells books.",
  BOOKSHOP: "A shop that sells books.",
  BOOKCLUB: "A group that reads and discusses books together.",
  LIBRARIAN: "A professional who manages a library.",
  INK: "Fluid used for writing or printing.",
  SPINE: "The bound edge of a book.",
  PLOT: "The sequence of events in a story.",
  THEME: "A central idea explored by a work.",
  GENRE: "A category of literature (mystery, romance, etc.).",
  SEQUEL: "A work that continues an earlier story.",
  PREQUEL: "A work set before an earlier story.",
  COZY: "A gentle mystery style; also warmly comfortable.",
  PROLOGUE: "An opening section before the main narrative.",
  EPILOGUE: "A closing section after the main narrative.",
  PREFACE: "An author's introductory remarks.",
  FOREWORD: "An introduction, often by someone other than the author.",
  AFTERWORD: "A concluding note after the main text.",
  CLIMAX: "The turning point of highest tension.",
  FLASHBACK: "A scene set earlier than the main timeline.",
  SUBPLOT: "A secondary storyline.",
  BACKSTORY: "History of characters before the main plot.",
  NARRATOR: "The voice telling the story.",
  DIALOGUE: "Conversation between characters.",
  MONOLOGUE: "A long speech by one character.",
  METAPHOR: "A comparison stating one thing is another.",
  SIMILE: "A comparison using like or as.",
  SYMBOLISM: "Use of symbols to suggest deeper meaning.",
  IMAGERY: "Language that evokes the senses.",
  ALLUSION: "A brief reference to another text or idea.",
  FORESHADOW: "To hint at events to come.",
  MOTIF: "A recurring image, idea, or pattern.",
  ARCHETYPE: "A classic character type or pattern.",
  PROTAGONIST: "The main character.",
  ANTAGONIST: "The force opposing the protagonist.",
  ANTIHERO: "A central character lacking classic heroic traits.",
  CLIFFHANGER: "An ending that leaves suspense unresolved.",
  WORLDBUILDING: "Creating a fictional world's rules and details.",
  NOVELLA: "A short novel.",
  ANTHOLOGY: "A collection of works by one or more authors.",
  OMNIBUS: "A volume collecting several works.",
  TRILOGY: "A set of three related books.",
  MANUSCRIPT: "A text before or as prepared for publication.",
  REVISION: "Reworking a draft.",
  FOOTNOTE: "A note at the bottom of a page.",
  ENDNOTE: "A note gathered at the end of a text.",
  GLOSSARY: "A list of key terms with definitions.",
  APPENDIX: "Supplementary material at the end.",
  BIBLIOGRAPHY: "A list of sources consulted.",
  BLURB: "Promotional copy on a book cover.",
  DUSTJACKET: "A removable paper cover on a hardcover.",
  ENDPAPER: "Paper glued inside the covers of a book.",
  FLYLEAF: "A blank leaf at the beginning or end of a book.",
  COLOPHON: "A publisher's emblem or production note.",
  FRONTISPIECE: "An illustration facing the title page.",
  QUILL: "A feather pen once used for writing.",
  PARCHMENT: "Writing material made from animal skin.",
  VELLUM: "Fine parchment, often calfskin.",
  CODEX: "A bound book of pages (vs. a scroll).",
  SCROLL: "A rolled manuscript.",
  STANZA: "A grouped set of lines in a poem.",
  SONNET: "A 14-line poem with a set rhyme scheme.",
  HAIKU: "A short Japanese-form poem, often 5-7-5.",
  BALLAD: "A narrative poem or song-like verse.",
  COUPLET: "Two successive rhyming lines.",
  CADENCE: "The rhythmic flow of language.",
  SATIRE: "Art that criticizes through irony or ridicule.",
  ALLEGORY: "A story with a sustained symbolic meaning.",
  FABLE: "A short moral tale, often with animals.",
  PARABLE: "A brief story teaching a moral or spiritual lesson.",
  NOIR: "A dark, cynical crime style.",
  GOTHIC: "Fiction of gloom, horror, and the supernatural.",
  DYSTOPIAN: "Depicting a nightmarish future society.",
  UTOPIAN: "Depicting an ideal society.",
  SPECULATIVE: "Fiction exploring imagined what-ifs.",
  NONFICTION: "Writing based on fact.",
  BIOGRAPHY: "A written account of someone's life.",
  AUTOBIOGRAPHY: "A life story written by its subject.",
  NARRATIVE: "A spoken or written account of events.",
  IRONY: "A contrast between expectation and reality.",
  LITERARY: "Of literature; artistically ambitious writing.",
  PAGETURNER: "A book so gripping you keep reading.",
  DOGEARED: "Having pages folded down at the corners.",
  ANNOTATE: "To add notes to a text.",
  MARGINALIA: "Notes written in the margins.",
  PERUSE: "To read carefully or at leisure.",
  SIDEKICK: "A companion who supports the hero.",
  RESOLUTION: "The winding-down of a plot's conflicts.",
  EDITING: "Preparing a text for publication.",
  LYRICAL: "Expressively emotional or song-like in style.",
  DENOUEMENT: "The final untangling of a plot.",
  CATHARSIS: "Emotional release through art.",
  ANAGNORISIS: "A character's moment of critical recognition.",
  PERIPETEIA: "A sudden reversal of fortune.",
  HAMARTIA: "A tragic flaw leading to downfall.",
  HUBRIS: "Excessive pride, often punished in tragedy.",
  SOLILOQUY: "A speech revealing thoughts aloud, alone on stage.",
  ENJAMBMENT: "A sentence running across a line break in verse.",
  CAESURA: "A pause within a line of verse.",
  ALLITERATION: "Repetition of initial consonant sounds.",
  ASSONANCE: "Repetition of vowel sounds.",
  CONSONANCE: "Repetition of consonant sounds.",
  ONOMATOPOEIA: "A word that imitates a sound.",
  SYNECDOCHE: "A part standing for the whole (or reverse).",
  METONYMY: "Referring by a closely associated term.",
  OXYMORON: "Two contradictory terms joined together.",
  CHIASMUS: "A mirrored ABBA rhetorical pattern.",
  ANAPHORA: "Repetition at the start of successive phrases.",
  ZEUGMA: "One word governing two others in different senses.",
  LITOTES: "Understatement by negating the opposite.",
  HYPERBOLE: "Deliberate exaggeration.",
  JUXTAPOSITION: "Placing elements side by side for contrast.",
  METAFICTION: "Fiction that draws attention to itself as fiction.",
  EPISTOLARY: "Told through letters or documents.",
  BILDUNGSROMAN: "A novel of personal formation and growth.",
  PATHOS: "An appeal to emotion.",
  ETHOS: "An appeal based on credibility or character.",
  LOGOS: "An appeal to reason.",
  POETICS: "The theory or craft of poetry.",
  PROSODY: "The patterns of rhythm and sound in verse.",
  SCANSION: "Marking a poem's metrical pattern.",
  IAMBIC: "A meter of unstressed-stressed pairs.",
  PENTAMETER: "A line of five metrical feet.",
  HEXAMETER: "A line of six metrical feet.",
  VILLANELLE: "A 19-line poem with repeating refrains.",
  SESTINA: "A complex 39-line form with rotating end-words.",
  CHAPBOOK: "A small, inexpensive booklet of verse or stories.",
  PALIMPSEST: "A reused manuscript bearing traces of older text.",
  AMANUENSIS: "A literary assistant who takes dictation.",
  SCRIPTORIUM: "A room where manuscripts were copied.",
  ATHENAEUM: "A literary or scientific club; a library.",
  IMPRINT: "A publisher's brand or line of books.",
  GALLEY: "A proof of text before final printing.",
  BACKLIST: "Older titles a publisher still keeps in print.",
  FRONTLIST: "A publisher's newest, heavily promoted titles.",
  MIDLIST: "Solid books that aren't blockbusters.",
  COPYEDIT: "To correct grammar, consistency, and style.",
  PROOFREADER: "Someone who checks proofs for errors.",
  TYPESET: "To arrange text for printing.",
  ERRATA: "A list of corrections.",
  VARIORUM: "An edition with variant readings and notes.",
  CONCORDANCE: "An alphabetical index of words in a text.",
  BIBLIOPHILE: "A lover of books.",
  BIBLIOMANIA: "Obsessive collecting of books.",
  EXLIBRIS: "A bookplate marking ownership.",
  SAMIZDAT: "Clandestine self-published literature.",
  FASCICLE: "A separately issued section of a larger work.",
  QUARTO: "A book format from sheets folded twice.",
  OCTAVO: "A smaller book format from sheets folded three times.",
  FOLIO: "A large book format; also a leaf of a manuscript.",
  RECTO: "The front side of a leaf (right-hand page).",
  VERSO: "The back side of a leaf (left-hand page).",
  DECKLE: "The rough, untrimmed edge of paper.",
  FOXING: "Brown age spots on paper.",
  PSEUDONYM: "A pen name.",
  WHODUNIT: "A mystery centered on finding the culprit.",
  RETELLING: "A new version of a familiar story.",
  SHORTLIST: "Finalists for a literary prize.",
  LONGLIST: "Initial nominees before a shortlist.",
  INTERTEXTUAL: "Referring to relationships among texts.",
  EPISTROPHE: "Repetition at the ends of successive clauses.",
  KUNSTLERROMAN: "A novel about an artist's development.",
  INCUNABULA: "Books printed before 1501.",
  HAPAX: "A word appearing only once in a corpus.",
  APORIA: "A rhetorical or philosophical impasse.",
  EKPHRASIS: "Vivid description of a work of visual art.",
  PROLEPSIS: "A flash-forward; anticipating an objection.",
  ANALEPSIS: "A flashback in narrative time.",
  METALEPSIS: "A break across narrative levels.",
  PARATEXT: "Material framing a text (covers, blurbs, notes).",
  MISENABYME: "A story within a story; infinite nesting.",
  OSTRANENIE: "Defamiliarization — making the familiar strange.",
  SJUZHET: "How events are arranged in the telling.",
  FABULA: "The chronological raw events of a story.",
  STICHOMYTHIA: "Rapid alternating single lines of dialogue.",
  PROTHALAMION: "A poem celebrating a coming marriage.",
  EPITHALAMION: "A poem or song for a wedding.",
  THRENODY: "A poem or song of lament.",
  ELEGY: "A mournful poem, often for the dead.",
  PAEAN: "A song of praise or triumph.",
  PANEGYRIC: "A formal speech or writing of praise.",
  INVECTIVE: "Harsh, denunciatory language.",
  PHILIPPIC: "A bitter verbal attack.",
  APOTHEGM: "A terse, instructive saying.",
  GNOMIC: "Expressed in short, wise sayings.",
  KENNING: "A metaphorical compound in Old English verse.",
  VANITAS: "Art reminding us of life's brevity.",
  MEMENTOMORI: "A reminder that you must die.",
  CATACHRESIS: "A strained or mixed metaphor.",
  ANACOLUTHON: "A sudden break in grammatical sequence.",
  APOSIOPESIS: "Breaking off speech abruptly.",
  HENDIADYS: "Two nouns joined to express one idea.",
  HYPALLAGE: "Transferred epithet — adjective shifts target.",
  PROSOPOPOEIA: "Giving a voice to the absent or inanimate.",
  POLYSYNDETON: "Repeated conjunctions for effect.",
  ASYNDETON: "Omitting conjunctions for speed or force.",
  TRICOLON: "Three parallel phrases in a row.",
  PARONOMASIA: "A pun; play on similar-sounding words.",
  ANTANACLASIS: "Repeating a word in a different sense.",
  SYLLEPSIS: "One word applied to two others differently.",
  GRIMOIRE: "A book of magic spells.",
  INCUNABLE: "An early printed book (before 1501).",
  CODICOLOGY: "The study of manuscripts as physical objects.",
  PALAEOGRAPHY: "The study of ancient handwriting.",
  STEMMATICS: "Tracing manuscript family trees.",
  BIBLIOPEGY: "The art of bookbinding.",
  DOUBLURE: "An ornamental lining inside a book cover.",
  LETTERPRESS: "Printing from a raised inked surface.",
  TYPEFACE: "A designed family of letterforms.",
  SANSERIF: "A typeface without small finishing strokes.",
  DIRGE: "A mournful song for the dead.",
  DIEGESIS: "The fictional world as told by the narrative.",
  MIMESIS: "Imitation of reality in art.",
};

type ApiMeaning = {
  partOfSpeech?: string;
  definitions?: Array<{ definition?: string; example?: string }>;
};

type ApiEntry = {
  word?: string;
  phonetic?: string;
  phonetics?: Array<{ text?: string }>;
  meanings?: ApiMeaning[];
};

const cache = new Map<string, WordDefinition>();

export async function defineWord(raw: string): Promise<WordDefinition> {
  const word = raw.trim().toUpperCase();
  if (!word) {
    return {
      word: raw,
      senses: [{ definition: "No word selected." }],
      source: "fallback",
    };
  }

  const cached = cache.get(word);
  if (cached) return cached;

  const bonus = bookishBonusFor(word);
  const gloss = BOOKISH_GLOSS[word];

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`,
    );
    if (res.ok) {
      const data = (await res.json()) as ApiEntry[];
      const entry = data[0];
      const senses: WordSense[] = [];
      for (const meaning of entry?.meanings ?? []) {
        for (const def of meaning.definitions ?? []) {
          if (!def.definition) continue;
          senses.push({
            partOfSpeech: meaning.partOfSpeech,
            definition: def.definition,
            example: def.example,
          });
          if (senses.length >= 4) break;
        }
        if (senses.length >= 4) break;
      }

      if (gloss) {
        senses.unshift({
          partOfSpeech: "bookish",
          definition: gloss,
        });
      }

      if (senses.length > 0) {
        const result: WordDefinition = {
          word,
          phonetic: entry?.phonetic || entry?.phonetics?.find((p) => p.text)?.text,
          senses,
          source: gloss ? "bookish" : "dictionary",
          bookishBonus: bonus?.bonus,
        };
        cache.set(word, result);
        return result;
      }
    }
  } catch {
    /* fall through */
  }

  if (gloss) {
    const result: WordDefinition = {
      word,
      senses: [{ partOfSpeech: "bookish", definition: gloss }],
      source: "bookish",
      bookishBonus: bonus?.bonus,
    };
    cache.set(word, result);
    return result;
  }

  const result: WordDefinition = {
    word,
    senses: [
      {
        definition:
          "No dictionary entry found. It may be an abbreviation, proper name, or Scrabble-only form.",
      },
    ],
    source: "fallback",
    bookishBonus: bonus?.bonus,
  };
  cache.set(word, result);
  return result;
}
