# ReadLife — Feature inventory

Complete list of what ships in the app today: purpose by area, user-facing features, and every GenAI tool.

**Stack:** Next.js 16, React 19, Tailwind CSS 4, Auth.js, Prisma.  
**Data model:** Hybrid — most reading/game/journal state is browser `localStorage` (optionally synced when signed in); Auth.js + Prisma power accounts and follows; GenAI is optional via OpenAI.

---

## Product purpose

ReadLife is a cozy reading companion: track what you read, build a habit from a visual reading room, discover books and people, play literary mini-games, and (optionally) use GenAI helpers. Guests work fully in the browser; signed-in users get accounts, friendships, and cloud restore of reading state.

### Product loops

1. **Habit** — Room → session → companion → journal / Insights  
2. **Discovery** — Search / vibe / For You → Add to TBR → Library / TBR coach → read  
3. **Social** — Taste twins / people → follow → friends → visitor profiles / buddy reads  
4. **Play** — Games streak + daily challenge + optional AI hints  
5. **Identity** — Quiz → personality shelf → profile badges / Wrapped  

---

## 1. Landing & setup

**Purpose:** Introduce the product and personalize the demo so the room and shelves feel yours.

| Path | What it does |
|------|----------------|
| `/` | Marketing landing: hero, product story, CTAs |
| `/setup` | Multi-step onboarding |

**Onboarding steps**

1. **Taste** — genres, formats  
2. **Books** — loved / skip starters + suggestions  
3. **Goals** — books / time / pages / streak or “no pressure”; reminder tone  
4. **Room** — pick room art  
5. **Move in** — display name, avatar (preset or upload), shelf pet + name  

Guests get seeded demo data. New signed-up accounts start clean (no shared demo “Alex” library bleed).

---

## 2. Reading Room (`/home`)

**Purpose:** Daily home base — sessions, reflection, TBR, and room atmosphere.

**Room vibes:** Day, Night, Rainy, Snowy  

**First visit:** Welcome tour (chair → bookshelf → window → TBR cart).

### Hotspots

| Spot | Opens | What you get |
|------|--------|----------------|
| Bookshelf | Bookshelf panel | Recent finished spines; path into Library |
| Quote wall | Quotes / write quote | Browse, write, edit, delete favorite quotes |
| Window | Vibe picker | Switch day / night / rain / snow |
| Journal | Journal / write journal | Create, edit, delete journal entries |
| TBR cart | TBR panel | View to-be-read pile |
| Reading chair | Chair → session flow | Focus session: duration presets, timer, pages logged |
| Mailbox | Mailbox panel | Seeded mail + **AI tools** directory (deep links from `src/lib/ai/directory.ts`) |

### Right panel & quick actions

- Currently reading card (progress, start / update / pause / finished)  
- Streak + today’s minute goal  
- Month preview, featured quote, upcoming buddy reads / reading party (demo)  
- Quick actions: **Log Session**, **Add to TBR**, **Write Quote**, **Read With Friend**  

### Sessions

| Flow | Behavior |
|------|----------|
| **Focus session** (`SessionFlow`) | Setup → timer → done → Session companion |
| **Log session** (`LogSessionPanel`) | Manual minutes/pages + Session companion; deep link `/home?ai=session` |

**Session companion:** AI reflection prompts + editable draft (+ vibe line). **Save to journal** writes a real journal entry (title like “After {book}”) that appears immediately in the Journal overlay.

---

## 3. Discover (`/search`)

**Purpose:** Find books, readers, and lists beyond your shelf.

**Modes:** Keyword search | **Describe a vibe** (natural language)  
**Tabs:** Books | Readers | Reading Lists  

### Books

- **For You** — AI recommendations with taste-based “why” reasons  
- Trending with readers like you  
- Browse by mood chips  
- Book drawers: details, Add to TBR, open book page  
- Autocomplete for books / authors / lists  

### Readers

- Sections: Similar Taste, Broaden Your Shelf, Popular List Makers, New Readers, Followed by Friends  
- Follow / unfollow demo readers  
- Links to `/readers/[username]`  

### Lists

- Curated discover lists; save/unsave into Library  
- List detail with Add to TBR per book  

### Deep links

| Query | Opens |
|-------|--------|
| `?ai=vibe` | Describe a vibe |
| `?ai=foryou` | For You row |
| `?ai=tools` | Discover AI tools (twins, friends, gifts, lists) |

---

## 4. Library (`/library`)

**Purpose:** Organize everything you’re reading, have read, or want next.

**Status tabs:** All, Reading, Read, TBR, Paused, DNF, Favorites, Reviewed, Lists  

**Views:** Grid | Shelf | List  

**Filters / sort:** Genres, formats, sources, min rating, search; read-year on Read; TBR-oriented sorts  

**Library card drawer:** Status changes, progress, format, source, TBR priority, notes, aspect ratings, review, remove  

**TBR coach** (`?ai=tbr`): AI ranks what to open next from your pile (mood + minutes).

---

## 5. Book page (`/books/[id]`)

**Purpose:** One place for a title — status, ratings, discussion, AI help.

**Tabs:** About | Forum | Reviews  

### Core

- Cover, metadata, genres/tropes, community stats  
- Library actions: Add to TBR / change status  
- **Aspect ratings:** Enjoyment, Quality, Characters, Plot, Audiobook (optional) → overall average; or quick overall stars  
- Own review with spoiler flag  

### Forum

- User posts + curated / demo community threads  
- Filters: all / spoilers / spoiler-safe; sort by progress or top  
- Search; expandable comments  
- Votes: upvote / downvote / like (local)  

### Reviews

- Community reviews with rating filter / sort  
- Spoiler reveal UI  

### AI on the book page

- **Book chat** on About (`?ai=chat`) — spoiler-safe Q&A gated by progress  
- **Review polish** on Reviews (`?ai=review`) — polish draft while writing  

---

## 6. Insights (`/insights`)

**Purpose:** Show how you actually read — habits, taste, achievements.

**Tabs:** Reading Insights | Reader DNA  

### Reading Insights

- Overview carousel (habit metrics)  
- Reading time / days / habit goal  
- **Your Wrapped** (month + year story modals)  
- **Habit coach** (`?ai=habit`)  
- Reading calendar heatmap  
- Genre treemap + highest-rated / fastest genre  
- Session / pace / pattern cards  
- Compare-to-previous period  
- Reading badges  

### Reader DNA

- Generated traits / summary  
- Optional AI title / summary via `/api/insights-story`  
- Share  

### Wrapped

- Local slide builders from real stats  
- Optional AI rewrite via `/api/ai/wrapped`  

---

## 7. Profile & social

**Purpose:** Identity, taste, and connecting with other readers.

### Own profile (`/profile`)

- Hero: avatar (preset or upload), display name, username, bio  
- Followers / following modals  
- Editable yearly book goal + reading-era chips  
- Featured badges (Insights + Games) you can pin  
- Buddy-read CTA  
- **Tabs:** Overview | Lists | Activity  
- Overview: currently reading, recent reads, favorites, personality result  
- Personality: flippable card, share / download, retake quiz  
- **Shelf for your type** (`?ai=shelf`) with Add to TBR  
- Edit Profile: username, bio, avatar, privacy (`readingPersonalityPublic`, `activityPublic`)  

### Visitor profiles (`/readers/[username]`)

- **Demo readers** from Discover catalog  
- **Signed-up users** via `GET /api/social/profile/[username]`  
- Follow / Add friend; mutual follow = friends  
- Compare personality; propose buddy read; save lists / Add books to TBR  

### Social surfaces

| Surface | Behavior |
|---------|----------|
| Discover readers | Follow demo readers → local discovery + profile following |
| Discover AI “Add friends” | Lists Prisma users; `POST /api/social/follow` |
| Visitor profiles | Demo + API-backed |
| Mutual follow | Friends when both follow |
| Buddy reads | Modal from home / profile / visitor |
| Mailbox | Social-ish notifications (buddy, party, badges, etc.) |

**APIs:** `/api/social/people`, `/api/social/follow`, `/api/social/profile/[username]`

---

## 8. Personality quiz

**Purpose:** Give you a shareable reading type that feeds recommendations.

- **16 types** from 4 axes: Explorer/Loyalist (E/L), Immersive/Analytical (I/A), Planner/Mood Reader (P/M), Social/Solo (S/O)  
- Phases: intro → Likert questions → tie-breakers if needed → reveal → result  
- Flippable result cards; letter code beside the type name; share copy; download front/back PNGs  
- Compare with mock / friend codes  
- Add to profile (privacy-gated); retake  
- Guests can get a demo-seeded type; signed-in users take the quiz themselves  
- After result: bridge to personality shelf AI  

---

## 9. Games (`/games`)

**Purpose:** Playful literary challenges with streaks and achievements (mobile-friendly).

### Hub

- Overall games streak (week strip)  
- Per-game cards / play  
- Stats, achievements, friends leaderboard, challenges  
- **Daily challenge** emoji book riddle (`?ai=daily`) — Add to TBR on the answer book  

### Playable games

| Game | Route / launch | Idea |
|------|----------------|------|
| **Bookbound** | `/games/bookbound` | Platform adventure — Pip, pages, foes, story worlds |
| **Bookle** | `/games/bookle` | Daily literary Wordle + soft AI hints |
| **Bookworm** | `/games/bookworm` | Snake-style through library shelves |
| **Wordsmith (Lexicon)** | `/games/lexicon` | Bookish Scrabble vs the house |
| **Uncovered** | `/games/uncovered` | Cover + emoji recognition; soft AI hints |
| **Pieces** | `/games/pieces` | Cover jigsaw; can Add to TBR |
| **Trolley of Tales** | `/games/trolley` | Catch books / dodge spills |
| **Guess the Book** | Hub modal only | Progressive clues → pick title |
| **How Well Do You Know Your Library?** | Hub modal only | Quiz against seeded “your” ratings |

### Listed but not playable yet

Shelf Sort, Book Bingo, Genre Dash (`playable: false`)

---

## 10. Auth & persistence

**Purpose:** Optional accounts without blocking guest exploration.

### Auth

| Path | What it does |
|------|----------------|
| `/signup` | Register (`POST /api/auth/register`) + auto sign-in |
| `/login` | Email/password via Auth.js; Google when env vars set |

AppNav shows name + Sign out when signed in.

### Guests vs signed-in

| | Guests | Signed-in |
|--|--------|-----------|
| Storage keys | Unscoped `readlife-*` | `${key}::u:{userId}` (no guest bleed) |
| Demo seed | Yes | No |
| Server sync | None | `GET/PUT /api/user/data` — hydrate on login; debounced push; flush on hide/unload/sign-out |
| Follows | Local demo follows | Prisma Follow graph |
| GenAI | Works without account if `OPENAI_API_KEY` set | Same |

**Syncable keys** (allowlist in `src/lib/user-data.ts`): discovery, profile, onboarding, games, personality, journal, quotes, room prefs, mailbox, forum, per-game stats, bookworm prefixes, and related `readlife-*` keys.

**Still local / not on sync allowlist:** e.g. book votes (`readlife-book-votes-v1`).

---

## 11. Journal, quotes, mailbox, TBR, sessions

| Feature | Where | Persistence |
|---------|-------|-------------|
| Journal | Room hotspot + Session companion “Save to journal” | `readlife-journal-v1` |
| Quotes | Quote wall + right-panel write | `readlife-quotes-v1` |
| Mailbox | Hotspot; AI directory + mail items | `readlife-mailbox-v1` |
| TBR | Cart, Discover / Library / Book / AI Add to TBR | Discovery state |
| Sessions | Chair focus + log session | Discovery progress + session / today-goal keys → Insights |

---

## 12. App routes (quick reference)

| Path | Purpose |
|------|---------|
| `/` | Landing |
| `/setup` | Onboarding |
| `/home` | Reading Room |
| `/search` | Discover |
| `/library` | Library |
| `/insights` | Analytics & badges |
| `/profile` | Your profile |
| `/games` | Games hub |
| `/games/*` | Individual games |
| `/books/[id]` | Book page |
| `/readers/[username]` | Visitor profile |
| `/login` / `/signup` | Auth |

**App nav:** Dashboard `/home`, Discover `/search`, Games `/games`, Library `/library`, Insights `/insights`, Profile `/profile` (+ login / user menu). Logo goes to `/home`.

---

## 13. Every GenAI / AI tool

All optional without `OPENAI_API_KEY`. Mailbox **AI tools** is driven by `src/lib/ai/directory.ts`. Shared client: `aiFetch` → `POST /api/ai/[action]` where applicable.

When you ship a new GenAI surface: update `directory.ts`, prefer a mailbox seed in `mailbox-data.ts`, and include **Add to TBR** wherever books are recommended.

| User-facing name | UI location | Deep link | API | What it does | Add to TBR |
|------------------|-------------|-----------|-----|--------------|------------|
| **Describe a vibe** | Discover search mode | `/search?ai=vibe` | `POST /api/search-nl` | Mood / NL → catalog matches + reasons | Yes |
| **For You** | Discover books row | `/search?ai=foryou` | `POST /api/recommend` | Shelf / taste-based picks + why | Yes |
| **Discover AI tools** (bundle) | Discover section | `/search?ai=tools` | See sub-tools | Entry to twins / friends / gifts / lists | — |
| └ **Readers like you** | Discover AI tools | (under tools) | `/api/ai/taste-twins` | Rank demo readers by taste | No (follow) |
| └ **Add friends** | Discover AI tools | (under tools) | `/api/social/people` + `/api/social/follow` | Real signed-up readers to follow | No |
| └ **Gift for a friend** | Discover AI tools | (under tools) | `/api/ai/gift-recs` | Gift books from prefs | Yes |
| └ **Make a list** | Discover AI tools | (under tools) | `/api/ai/list-curator` | Named curated list | Yes |
| **TBR coach** | Library | `/library?ai=tbr` | `/api/ai/tbr-coach` | Rank next read from TBR (mood / minutes) | N/A (already TBR) |
| **Book chat** | Book About | `/books/{id}?ai=chat` (resolves current / TBR / Night Circus) | `/api/ai/book-chat` | Spoiler-safe Q&A by progress % | No |
| **Review polish** | Book Reviews | `/books/{id}?ai=review` | `/api/ai/review-polish` | Polishes notes into review; spoiler suggestion | No |
| **Shelf for your type** | Profile overview | `/profile?ai=shelf` | `/api/ai/personality-shelf` | Personality-based catalog picks | Yes |
| **Session companion** | After focus / log session | `/home?ai=session` | `/api/ai/session-companion` | Prompts + journal draft; Save to journal | No |
| **Habit coach** | Insights | `/insights?ai=habit` | `/api/ai/habit-coach` | Risk / plan / nudge from stats | No |
| **Wrapped (AI story)** | Insights Wrapped modal | (via Insights UI) | `/api/ai/wrapped` | Monthly / year slide copy from real stats | No |
| **Reader DNA story** | Insights DNA tab | — | `POST /api/insights-story` | AI title / summary / why for DNA | No |
| **Daily challenge** | Games hub | `/games?ai=daily` | `/api/ai/daily-challenge` | Daily emoji book riddle + options | Yes |
| **Adaptive game hints** | Bookle & Uncovered | `/games/bookle` (also in Uncovered) | `POST /api/games-hint` | Soft adaptive hints (no answer echo) | No |

**Related helpers (not user-facing):** `src/lib/ai/catalog.ts` — compact book / reader payloads for AI routes.

---

## Purpose by major area (one line)

| Area | Purpose |
|------|---------|
| Landing / setup | Sell the product; personalize taste, goals, room, identity |
| Reading Room | Habit home: sessions, journal, quotes, TBR, mail, vibe |
| Discover | Find books, people, lists; vibe + For You + social AI |
| Library | Organize statuses and TBR; coach what to open next |
| Book page | Rate, review, discuss, ask spoil-safe AI |
| Insights | Reflect with stats, DNA, badges, Wrapped, habit nudges |
| Profile / social | Identity, lists, personality, follow / friends, visitor view |
| Games | Playful streaks and literary mini-games (+ daily AI riddle) |
| Auth / sync | Optional accounts; guests stay local; signed-in get namespaced + cloud blob restore |

---

## Maintaining this doc

- High-level product overview also lives in `README.md`.  
- AI directory source of truth: `src/lib/ai/directory.ts`.  
- Cursor rule: `.cursor/rules/ai-mailbox-directory.mdc` — keep Mailbox AI tools in sync when adding GenAI surfaces.
