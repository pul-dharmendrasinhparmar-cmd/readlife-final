export type LexiconStats = {
  gamesPlayed: number;
  gamesWon: number;
  personalBest: number;
  lastScore?: number;
  lastPlayedDate?: string;
};

const KEY = "readlife-lexicon-stats-v1";

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function loadLexiconStats(): LexiconStats {
  if (typeof window === "undefined") {
    return { gamesPlayed: 0, gamesWon: 0, personalBest: 0 };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { gamesPlayed: 0, gamesWon: 0, personalBest: 0 };
    return JSON.parse(raw) as LexiconStats;
  } catch {
    return { gamesPlayed: 0, gamesWon: 0, personalBest: 0 };
  }
}

export function recordLexiconGame(input: {
  won: boolean;
  yourScore: number;
  aiScore: number;
}) {
  if (typeof window === "undefined") return;
  const prev = loadLexiconStats();
  const next: LexiconStats = {
    gamesPlayed: prev.gamesPlayed + 1,
    gamesWon: prev.gamesWon + (input.won ? 1 : 0),
    personalBest: Math.max(prev.personalBest, input.yourScore),
    lastScore: input.yourScore,
    lastPlayedDate: todayISO(),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
