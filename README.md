# ReadLife

ReadLife is a cozy literary web app for tracking what you read, exploring books with friends, and playing bookish mini-games — all from a personal reading room, with optional GenAI helpers and signed-in sync.

Built with **Next.js 16**, **React 19**, **Tailwind CSS 4**, **Auth.js**, and **Prisma**. Guests can explore fully via browser local storage; signed-in users get accounts, friendships, and cloud restore of reading state. GenAI features need an OpenAI key (optional).

---

## What it’s for

ReadLife turns reading into a daily habit with:

- A visual **reading room** as your home base  
- Progress tracking, goals, streaks, journal, and quotes  
- Discovery, library shelves, and social profiles (follow / friends)  
- **Insights** that summarize how you actually read (plus AI Wrapped stories)  
- A **Games hub** of literary challenges and adventures  
- A suite of **GenAI tools** (recommendations, vibe search, session companion, book chat, and more)  

Designed for readers who want something warmer than a spreadsheet and more playful than a plain tracker.

For a full inventory (every surface, purpose, and GenAI tool), see **[FEATURES.md](./FEATURES.md)**.

---

## Main features

### Landing & onboarding
- Marketing landing page with product story and CTAs  
- Setup flow for taste, goals, books, and room vibe so the demo feels personal from the first visit  

### Reading Room (`/home`)
- Immersive room scene with day / night / weather vibes  
- Clickable hotspots for bookshelf, chair (focus session), journal, mailbox, quotes, TBR, and vibe picker  
- Live “currently reading” progress and session logging that feeds Insights  
- **Session companion** (after log / focus session): AI reflection prompts + draft you can **Save to journal** (appears in Journal entries immediately)  
- **Mailbox → AI tools**: directory of every GenAI surface with deep links (`?ai=…`), driven by `src/lib/ai/directory.ts`  
- Journal and quotes: create, edit, delete, save locally (and sync when signed in)  

### Discover / Search (`/search`)
- Browse books, readers, and curated lists  
- Book detail drawers, TBR adds, and social discovery  
- **For You** AI recommendations with taste-based “why” reasons  
- **Describe a vibe** natural-language search with match reasons + **Add to TBR**  
- Discover AI tools: taste twins, gift recs, list curator, friends-to-follow  

### Library (`/library`)
- Your shelves and lists in one place  
- Drawer flows for organizing what you’ve read and what’s next  
- **TBR coach** AI: what to read next from your pile  

### Book pages (`/books/[id]`)
- Spoiler-safe **book chat** and **review polish**  
- **Aspect ratings** (Enjoyment / Quality / Characters / Plot / Audiobook) → overall average  
- Forum threads with expandable comments, curated discussion seeds, upvote / downvote / likes  

### Insights (`/insights`)
- Reading activity, calendar heatmap, and session stats  
- Genre breakdown (treemap), patterns, and reader DNA  
- Badges and a Wrapped-style year/month highlight reel  
- **Habit coach** + AI monthly / year Wrapped stories  

### Profile (`/profile`)
- Hero with avatar upload, bio, followers, editable yearly goal, and reading eras  
- Featured badges (Insights + games) you can pin  
- Overview of currently reading, recent reads, and favorites  
- **Personality shelf** AI picks for your reading type  
- Lists and activity tabs; visitor profiles at `/readers/[username]`  

### Social
- **Follow / Add friend** on taste twins and people cards (demo readers + signed-up users)  
- Mutual follow between signed-up accounts = friends  
- View profiles at `/readers/[username]` (demo + API-backed for real users)  
- APIs under `/api/social/*` (people, follow, profile by username)  

### Personality quiz
- Full reading-personality quiz with 16 types  
- Flippable result cards (letters beside the type name) you can share or download  
- Option to retake the test  

### Games hub (`/games`)
Playable literary games with streaks, achievements, and friends leaderboards (mobile-friendly):

| Game | Idea |
|------|------|
| **Bookbound** | Platform adventure — guide Pip through story worlds, collect pages, defeat foes |
| **Bookle** | Daily literary Wordle with themed shelves (+ soft AI hints) |
| **Bookworm** | Snake-style run through cozy library shelves |
| **Wordsmith / Lexicon** | Bookish word play vs the house |
| **Uncovered** | Cover / book recognition challenges (+ soft AI hints) |
| **Pieces** | Puzzle-style cover reconstruction |
| **Trolley of Tales** | Fast bookish trolley challenge |

Also: **Daily challenge** emoji book riddle on the Games hub (`?ai=daily`).

---

## GenAI features

All optional without `OPENAI_API_KEY`. Surfaces deep-link via `?ai=` and are listed in the reading-room Mailbox **AI tools** panel from `src/lib/ai/directory.ts`.

| Tool | Where | What it does |
|------|--------|----------------|
| Describe a vibe | `/search?ai=vibe` | NL mood → books with reasons + Add to TBR |
| For You | `/search?ai=foryou` | Shelf-based AI picks with “why” |
| Discover AI tools | `/search?ai=tools` | Taste twins, gifts, lists, friends |
| TBR coach | `/library?ai=tbr` | Next read from your pile |
| Book chat | `/books/…?ai=chat` | Spoiler-safe Q&A |
| Review polish | `/books/…?ai=review` | Cleanup while writing a review |
| Shelf for your type | `/profile?ai=shelf` | Personality-based catalog picks |
| Session companion | `/home?ai=session` | Prompts + draft → **Save to journal** |
| Habit coach & Wrapped | `/insights?ai=habit` | Habit nudges + monthly/year AI story |
| Daily challenge | `/games?ai=daily` | Emoji book riddle |
| Adaptive game hints | Bookle / Uncovered | Soft AI hints |

**APIs:** `/api/ai/[action]`, `/api/recommend`, `/api/search-nl`, `/api/games-hint`, `/api/insights-story`.

When you ship a new GenAI surface, update `src/lib/ai/directory.ts` (and prefer a mailbox seed in `mailbox-data.ts`). Book recommendation UIs should include **Add to TBR**.

---

## App routes

| Path | Purpose |
|------|---------|
| `/` | Landing |
| `/setup` | Onboarding |
| `/home` | Reading Room dashboard |
| `/search` | Discover |
| `/library` | Library |
| `/insights` | Analytics & badges |
| `/profile` | Your profile |
| `/games` | Games hub |
| `/games/*` | Individual games |
| `/books/[id]` | Book page (ratings, forum, AI panels) |
| `/readers/[username]` | Visitor profile |
| `/login` / `/signup` | Auth |

---

## Architecture (hybrid)

| Layer | What lives there |
|-------|------------------|
| **Browser localStorage** | Library, sessions, journal, quotes, room prefs, games, forum, mailbox (guest + per-user scoped when signed in) |
| **Prisma / Auth.js** | Users, credentials, OAuth, follow graph |
| **`/api/user/data`** | Signed-in blob sync of syncable `readlife-*` keys (restore on login) |
| **OpenAI via `/api/*`** | Recommendations, vibe search, companion, chat, Wrapped, hints, etc. |

Guest / demo mode works without signing in. Auth and sync are additive.

---

## Getting started

**Requirements:** Node.js 20+ recommended.

```bash
npm install
cp .env.example .env.local
cp .env.example .env          # Prisma CLI reads DATABASE_URL from .env
# Fill AUTH_SECRET (required) and keep DATABASE_URL for SQLite
npx prisma migrate dev        # creates local SQLite DB
npm run dev                   # restart after any env change
```

Open [http://localhost:3000](http://localhost:3000).

### API keys (GenAI features)

- **Local:** set `OPENAI_API_KEY` in `.env.local` (optional `OPENAI_MODEL`).
- **Netlify:** Site settings → Environment variables → add `OPENAI_API_KEY` (and `OPENAI_MODEL` if needed). GitHub never stores the real key — only `.env.example` is committed.
- Cloners must use **their own** OpenAI key; GenAI routes no-op or error gracefully without one.

### Authentication (Auth.js + Prisma)

ReadLife supports **email/password** and **Google OAuth** via [Auth.js (NextAuth v5)](https://authjs.dev/) with a Prisma user store.

| Variable | Required | Notes |
|----------|----------|--------|
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `DATABASE_URL` | Yes | Local: `file:./dev.db` (SQLite). Production: Neon Postgres URL |
| `AUTH_URL` | Recommended | `http://localhost:3000` locally; your Netlify URL in prod |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Optional | Email/password works without these |
| `OPENAI_API_KEY` | Optional | GenAI only |

**Email / password (works locally with SQLite only):**

1. Set `AUTH_SECRET` and `DATABASE_URL="file:./dev.db"` in `.env` + `.env.local`.
2. Run `npx prisma migrate dev` (or `npm run db:migrate`).
3. Restart `npm run dev`.
4. Open `/signup`, create an account, then use `/login`.
5. AppNav shows your name + **Sign out** when signed in.

**Google OAuth:**

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create credentials → OAuth client ID → **Web application**.
2. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://YOUR-SITE.netlify.app`
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://YOUR-SITE.netlify.app/api/auth/callback/google`
4. Copy Client ID / Client Secret into `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` (never commit real values).
5. Restart `npm run dev`. The “Continue with Google” button appears when both vars are set.

**Netlify / Postgres:**

SQLite files do not persist on Netlify’s serverless filesystem. For production:

1. Create a free [Neon](https://neon.tech) Postgres database and copy the connection string.
2. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
3. Set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` (your Netlify URL), and optionally Google / OpenAI vars in Netlify env settings.
4. Run `npx prisma migrate deploy` against that database (locally or in CI) before/at deploy.
5. Redeploy the site.

Server session: `import { auth } from "@/auth"` or `getSession()` / `getCurrentUserId()` from `@/lib/session`.  
Client session: `useSession()` from `next-auth/react` (wrapped by `AuthSessionProvider` in the root layout).

Other scripts:

```bash
npm run build       # prisma generate + production build
npm run start       # serve production build
npm run lint        # ESLint
npm run db:migrate  # prisma migrate dev
npm run db:studio   # browse local DB
```

---

## Project structure

```
src/
  app/                 # App Router pages + API routes
    api/ai/            # GenAI actions
    api/social/        # Follow, people, profile by username
    api/user/data/     # Signed-in localStorage blob sync
    api/auth/          # Auth.js + register
  auth.ts              # Auth.js (NextAuth v5) config
  components/
    ai/                # Session companion, TBR coach, banners, Add to TBR, …
    auth/              # Session provider, login/signup, user menu
    book/              # Book page, forum, aspect ratings
    dashboard/         # Reading Room UI, journal, mailbox, overlays
    search/            # Discover, vibe search, drawers
    library/           # Library views + TBR coach hook
    insights/          # Analytics, badges, Wrapped
    profile/           # Profile, visitor view, avatar upload
    personality/       # Quiz & result cards
    games/             # Bookbound, Bookle, Bookworm, …
    layout/            # Shared nav (logo → /home)
    onboarding/        # Setup flow
  lib/
    ai/                # client, catalog, directory (Mailbox AI tools)
    user-data.ts       # Syncable key allowlist
prisma/                # Schema + migrations (SQLite locally)
public/                # Covers, room art, game assets, badges
```

---

## Tech notes

- **Theme:** Ink & Amethyst dark palette (deep purple surfaces, soft bloom accents)  
- **State:** Client-side storage for reading/social/game/journal data; scoped by user when signed in; optional server blob sync via `/api/user/data`  
- **Social graph:** Prisma follows for real accounts; demo readers for walkthroughs  
- **Assets:** Room scenes, badge art, and game sprites under `public/`  
- **Mobile:** Games hub and mini-games sized for touch / small viewports  

This repo is a product prototype / demo — interactive and polished for walkthroughs. Auth, social follows, and GenAI are real; most reading domain data still centers on localStorage (+ sync), not a full server-side library backend.

---

## License

Private project — all rights reserved unless otherwise noted.
