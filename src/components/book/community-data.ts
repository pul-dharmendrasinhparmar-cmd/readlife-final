import type { DiscoverBook } from "@/components/search/types";
import type { BookCommunity } from "./types";
import { getBookSocial } from "./social-content";

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function jitter(base: number, seed: number, spread = 0.18) {
  const n = ((seed % 1000) / 1000) * 2 - 1;
  return Math.max(2.8, Math.min(5, Math.round((base + n * spread) * 100) / 100));
}

const PUBLISHED: Record<string, string> = {
  "night-circus": "Sep 13, 2011",
  "starless-sea": "Nov 5, 2019",
  piranesi: "Sep 15, 2020",
  "six-crows": "Sep 29, 2015",
  circe: "Apr 10, 2018",
  achilles: "Sep 20, 2011",
  mexico: "Jun 30, 2020",
  "ninth-house": "Oct 8, 2019",
  "ink-blood": "May 28, 2023",
  "sea-tranquility": "Apr 5, 2022",
  bunny: "Jun 11, 2019",
  hamnet: "Mar 31, 2020",
  babel: "Aug 23, 2022",
  "house-sky": "Sep 29, 2020",
  "fourth-wing": "May 2, 2023",
  yellowface: "May 16, 2023",
  tomorrow: "Jul 5, 2022",
  "project-hail": "May 4, 2021",
  "silent-patient": "Feb 5, 2019",
  "evelyn-hugo": "Jun 13, 2017",
  acomaf: "May 3, 2016",
  hobbit: "Sep 21, 1937",
  "legends-lattes": "Jun 7, 2022",
  "jonathan-strange": "Sep 8, 2004",
  atlas: "Mar 1, 2022",
  "a-little-life": "Mar 10, 2015",
  "thursday-murder": "Sep 3, 2020",
  "normal-people": "Aug 28, 2018",
  "lessons-chemistry": "Apr 5, 2022",
  "night-film": "Aug 20, 2013",
  iewu: "Aug 2, 2016",
  // Expansion fiction
  "beach-read": "May 19, 2020",
  "people-vacation": "May 11, 2021",
  "book-lovers": "May 3, 2022",
  "funny-story": "Apr 23, 2024",
  "love-hypothesis": "Sep 14, 2021",
  "red-white-royal": "May 14, 2019",
  "seven-year-slip": "Jun 27, 2023",
  "gone-girl": "Jun 5, 2012",
  verity: "Dec 7, 2021",
  "guest-list": "Feb 4, 2020",
  maid: "Jan 4, 2022",
  "last-thing": "May 4, 2021",
  "sharp-objects": "Sep 26, 2006",
  "only-good-indians": "Jul 14, 2020",
  "haunting-hill": "Oct 16, 1959",
  "blackened-teeth": "Oct 19, 2021",
  dune: "Aug 1, 1965",
  "three-body": "Nov 11, 2014",
  martian: "Feb 11, 2014",
  "klara-sun": "Mar 2, 2021",
  "ready-player": "Aug 16, 2011",
  recursion: "Jun 11, 2019",
  mistborn: "Jul 17, 2006",
  "name-wind": "Mar 27, 2007",
  "gideon-ninth": "Sep 10, 2019",
  "poppy-war": "May 1, 2018",
  "cruel-prince": "Jan 2, 2018",
  acotar: "May 5, 2015",
  "throne-glass": "Aug 2, 2012",
  "iron-flame": "Nov 7, 2023",
  neverwhere: "Sep 16, 1996",
  "american-gods": "Jun 19, 2001",
  "priory-orange": "Feb 26, 2019",
  "midnight-library": "Aug 13, 2020",
  "where-crawdads": "Aug 14, 2018",
  "demon-copperhead": "Oct 18, 2022",
  trust: "May 3, 2022",
  "vanishing-half": "Jun 2, 2020",
  "little-fires": "Sep 12, 2017",
  pachinko: "Feb 7, 2017",
  "daisy-jones": "Mar 5, 2019",
  "malibu-rising": "Jun 1, 2021",
  "before-coffee": "Sep 19, 2019",
  "convenience-store": "Jun 12, 2018",
  handmaids: "1985",
  "1984": "Jun 8, 1949",
  "pride-prejudice": "Jan 28, 1813",
  beloved: "Sep 16, 1987",
  "lincoln-highway": "Oct 5, 2021",
  "ministry-time": "May 7, 2024",
  // Expansion nonfiction
  educated: "Feb 20, 2018",
  "atomic-habits": "Oct 16, 2018",
  sapiens: "2011",
  "thinking-fast": "Oct 25, 2011",
  becoming: "Nov 13, 2018",
  "born-crime": "Nov 15, 2016",
  "into-wild": "1996",
  "immortal-life": "Feb 2, 2010",
  quiet: "Jan 24, 2012",
  "bad-blood": "May 21, 2018",
  "crying-hmart": "Apr 20, 2021",
  "body-keeps-score": "Sep 25, 2014",
  "mans-search": "1946",
  "night-wiesel": "1958",
  "killers-flower": "Apr 18, 2017",
  "the-wager": "Apr 18, 2023",
  "say-nothing": "Feb 26, 2019",
  "empire-pain": "Apr 13, 2021",
  "between-world": "Jul 14, 2015",
  "maybe-talk": "Apr 2, 2019",
  "deep-work": "Jan 5, 2016",
  range: "May 28, 2019",
};

export function getBookCommunity(book: DiscoverBook): BookCommunity {
  const seed = hash(book.id);
  const avg = book.averageRating;
  const social = getBookSocial(book.id);

  const ratingsCount = Math.max(
    120,
    Math.round(book.reviewCount * 2.4 + (seed % 800)),
  );
  const postsCount = Math.max(
    social.forum.length + 12,
    Math.round(book.reviewCount / 40 + (seed % 90)),
  );
  const finished = Math.round(ratingsCount * 0.72 + (seed % 40));
  const reading = Math.round(ratingsCount * 0.55 + (seed % 60));
  const interested = Math.round(ratingsCount * 0.18 + (seed % 30));
  const tbr = Math.round(ratingsCount * 0.08 + (seed % 20));
  const paused = Math.round(ratingsCount * 0.02 + (seed % 12));
  const dnf = Math.round(ratingsCount * 0.015 + (seed % 10));

  return {
    publishedLabel: PUBLISHED[book.id] ?? "—",
    breakdown: {
      enjoyment: jitter(avg, seed + 1),
      quality: jitter(avg, seed + 2),
      characters: jitter(avg + 0.05, seed + 3),
      plot: jitter(avg - 0.08, seed + 4),
      audiobook: jitter(avg + 0.1, seed + 5),
    },
    stats: {
      finished,
      reading,
      interested,
      tbr,
      paused,
      dnf,
      ratingsCount,
      postsCount,
    },
    forum: social.forum,
    reviews: social.reviews,
    feed: [
      {
        id: `${book.id}-a1`,
        username: "bookiepp",
        kind: "interested",
        timeAgo: "1h",
        likes: 0,
        commentCount: 0,
      },
      {
        id: `${book.id}-a2`,
        username: "lucyPagebound",
        kind: "progress",
        timeAgo: "2h",
        progressPct: 62,
        likes: 57,
        commentCount: 0,
      },
      {
        id: `${book.id}-a3`,
        username: "jordynreads",
        kind: "started",
        timeAgo: "4h",
        likes: 14,
        commentCount: 2,
      },
      {
        id: `${book.id}-a4`,
        username: "shelfwanderer",
        kind: "finished",
        timeAgo: "1d",
        likes: 88,
        commentCount: 9,
      },
    ],
  };
}
