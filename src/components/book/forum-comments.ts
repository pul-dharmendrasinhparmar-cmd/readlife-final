import type { ForumComment } from "./types";

const USERNAMES = [
  "shelfside",
  "inkandtea",
  "chaptermouse",
  "dogearer",
  "midnightmargin",
  "softspine",
  "plotandporridge",
  "rereadready",
  "bookishbriar",
  "quietquire",
  "turnthepage",
  "annoteverything",
];

const BODIES = [
  "Same — this landed harder than I expected.",
  "Came here to say this. The pacing in that stretch is perfect.",
  "I disagreed at first, then the next chapter made it click.",
  "Spoiler-safe: the atmosphere alone is doing a lot of work.",
  "Bookmarking this thread. Need to finish before I open more takes.",
  "The detail work is unreal. Felt like I was in the room.",
  "Anyone else slow-reading this on purpose? I don’t want it to end.",
  "That line about grief / love / memory is going to haunt me.",
  "Agree on the centering of the quieter character — rare and needed.",
  "Soft disagree on stakes, but the prose is doing the heavy lifting.",
  "Replied so I can find this later. Perfect mid-book check-in.",
  "This is the kind of discussion that makes ReadLife worth it.",
];

/** Hand-written threads for key catalog posts (overrides generic demo copy). */
const CURATED: Record<string, Omit<ForumComment, "id">[]> = {
  "hamnet-f1": [
    {
      username: "willowdesk",
      body: "Yes. Calling her ‘the wife’ always flattened her — this book refuses that.",
      atLabel: "3h ago",
      score: 12,
    },
    {
      username: "stageleft",
      body: "I’m only 40 pages in and already protective of Agnes. The forest scenes are luminous.",
      atLabel: "5h ago",
      score: 8,
    },
    {
      username: "inkandtea",
      body: "The Famous Man barely gets a name for so long and it feels intentional. Love that choice.",
      atLabel: "1d ago",
      score: 15,
    },
    {
      username: "histficheart",
      body: "Healing is the right word. It’s still devastating, but the gaze is finally right.",
      atLabel: "1d ago",
      score: 9,
    },
    {
      username: "softspine",
      body: "Came from a Shakespeare-heavy shelf and this reoriented everything. Thank you for saying it.",
      atLabel: "2d ago",
      score: 6,
    },
  ],
  "hamnet-f2": [
    {
      username: "herbarium",
      body: "The rosemary / stillroom detail wrecked me. Domestic care as love language.",
      atLabel: "2h ago",
      score: 11,
    },
    {
      username: "plagueyear",
      body: "Glad I’m not alone — the dread is quiet and then suddenly huge.",
      atLabel: "4h ago",
      score: 7,
    },
    {
      username: "chaptermouse",
      body: "I had to put it down for a day after the illness arrives. Take care reading this stretch.",
      atLabel: "1d ago",
      score: 14,
    },
    {
      username: "midnightmargin",
      body: "The herbs / hands / house rhythm is the whole emotional engine. Brilliant.",
      atLabel: "1d ago",
      score: 10,
    },
    {
      username: "rereadready",
      body: "Reading with tissues nearby. Grief is arriving for me too.",
      atLabel: "2d ago",
      score: 5,
    },
    {
      username: "bookishbriar",
      body: "1596 as a title hit is perfect. Time becomes a character.",
      atLabel: "3d ago",
      score: 8,
    },
    {
      username: "quietquire",
      body: "Soft spoilers avoided — just: the sensory writing is extraordinary.",
      atLabel: "3d ago",
      score: 4,
    },
  ],
  "hamnet-f3": [
    {
      username: "bardadjacent",
      body: "Spoilers ok in here: the play echo is earned, not cute. I cried on the train.",
      atLabel: "1h ago",
      score: 18,
      spoilers: true,
    },
    {
      username: "agnesfirst",
      body: "Luminous is right. It doesn’t reduce grief to a biography footnote.",
      atLabel: "6h ago",
      score: 12,
    },
    {
      username: "stageleft",
      body: "How art holds a child — that framing will stick with me forever.",
      atLabel: "1d ago",
      score: 16,
    },
    {
      username: "histficheart",
      body: "One of the few times a literary callback felt necessary rather than clever.",
      atLabel: "1d ago",
      score: 9,
      spoilers: true,
    },
    {
      username: "dogearer",
      body: "Closing the book slowly so the last pages don’t vanish too fast.",
      atLabel: "2d ago",
      score: 7,
    },
    {
      username: "turnthepage",
      body: "Devastating and somehow still tender. Perfect ending for this story.",
      atLabel: "2d ago",
      score: 11,
    },
    {
      username: "annoteverything",
      body: "If you’re not done yet, skip this thread — spoilers float around.",
      atLabel: "3d ago",
      score: 5,
    },
    {
      username: "softspine",
      body: "Recommending this to every reader who loves character over plot fireworks.",
      atLabel: "4d ago",
      score: 8,
    },
    {
      username: "plotandporridge",
      body: "The plague-year intimacy is unmatched. Holding this one close.",
      atLabel: "4d ago",
      score: 6,
    },
    {
      username: "shelfside",
      body: "Finished last night. Still sitting with it. Thank you for this post.",
      atLabel: "5d ago",
      score: 10,
    },
  ],
};

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic demo comments for a forum/review thread. */
export function getDemoComments(
  threadId: string,
  count: number,
): ForumComment[] {
  const n = Math.max(0, Math.min(24, Math.floor(count)));
  if (n === 0) return [];

  const curated = CURATED[threadId];
  if (curated?.length) {
    return curated.slice(0, n).map((c, i) => ({
      ...c,
      id: `${threadId}-c${i + 1}`,
    }));
  }

  const seed = hash(threadId);
  return Array.from({ length: n }, (_, i) => {
    const u = USERNAMES[(seed + i * 7) % USERNAMES.length];
    const body = BODIES[(seed + i * 13) % BODIES.length];
    return {
      id: `${threadId}-c${i + 1}`,
      username: u,
      body,
      atLabel: i === 0 ? "2h ago" : i < 3 ? `${i + 1}d ago` : `${i + 3}d ago`,
      score: 1 + ((seed + i * 3) % 18),
    };
  });
}
