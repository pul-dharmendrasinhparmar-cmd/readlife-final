# ReadLife

ReadLife is a cozy literary web app for tracking what you read, exploring books with friends, and playing bookish mini-games — all from a personal reading room.

Built with **Next.js 16**, **React 19**, and **Tailwind CSS 4**. Demo data lives in the browser (local storage); no backend is required to explore the product.

---

## What it’s for

ReadLife turns reading into a daily habit with:

- A visual **reading room** as your home base  
- Progress tracking, goals, and streaks  
- Discovery, library shelves, and social profiles  
- **Insights** that summarize how you actually read  
- A **Games hub** of literary challenges and adventures  

Designed for readers who want something warmer than a spreadsheet and more playful than a plain tracker.

---

## Main features

### Landing & onboarding
- Marketing landing page with product story and CTAs  
- Setup flow for taste, goals, books, and room vibe so the demo feels personal from the first visit  

### Reading Room (`/home`)
- Immersive room scene with day / night / weather vibes  
- Clickable hotspots for bookshelf, chair (focus session), journal, mailbox, quotes, TBR, and vibe picker  
- Live “currently reading” progress and session logging that feeds Insights  

### Discover / Search (`/search`)
- Browse books, readers, and curated lists  
- Book detail drawers, TBR adds, and social discovery  
- Catalog expansion beyond the starter shelf  

### Library (`/library`)
- Your shelves and lists in one place  
- Drawer flows for organizing what you’ve read and what’s next  

### Insights (`/insights`)
- Reading activity, calendar heatmap, and session stats  
- Genre breakdown (treemap), patterns, and reader DNA  
- Badges and a Wrapped-style year/month highlight reel  

### Profile (`/profile`)
- Hero with avatar, bio, followers, yearly goal, and reading eras  
- Featured badges (Insights + games) you can pin  
- Overview of currently reading, recent reads, and favorites  
- Lists and activity tabs; visitor profiles at `/readers/[username]`  

### Personality quiz
- Full reading-personality quiz with 16 types  
- Flippable result cards you can share or download  

### Games hub (`/games`)
Playable literary games with streaks, achievements, and friends leaderboards:

| Game | Idea |
|------|------|
| **Bookbound** | Platform adventure — guide Pip through story worlds, collect pages, defeat foes |
| **Bookle** | Daily literary Wordle with themed shelves |
| **Bookworm** | Snake-style run through cozy library shelves |
| **Wordsmith** | Bookish Scrabble vs the house |
| **Uncovered** | Cover / book recognition challenges |
| **Pieces** | Puzzle-style cover reconstruction |
| **Trolley of Tales** | Fast bookish trolley challenge |

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
| `/books/[id]` | Book page |
| `/readers/[username]` | Visitor profile |

---

## Getting started

**Requirements:** Node.js 20+ recommended.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### API keys (book recommendations)

- **Local:** copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` (optional `OPENAI_MODEL`).
- **Netlify:** Site settings → Environment variables → add `OPENAI_API_KEY` (and `OPENAI_MODEL` if needed). GitHub never stores the real key — only `.env.example` is committed.

Other scripts:

```bash
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint
```

---

## Project structure

```
src/
  app/                 # Next.js App Router pages
  components/
    dashboard/         # Reading Room UI & overlays
    search/            # Discover & book drawers
    library/           # Library views
    insights/          # Analytics, badges, Wrapped
    profile/           # Profile, lists, featured badges
    personality/       # Quiz & result cards
    games/             # Bookbound, Bookle, Bookworm, …
    layout/            # Shared nav
    onboarding/        # Setup flow
  lib/                 # Shared storage helpers
public/                # Covers, room art, game assets, badges
```

---

## Tech notes

- **Theme:** Ink & Amethyst dark palette (deep purple surfaces, soft bloom accents)  
- **State:** Client-side demo storage (profile, room, discovery, game progress)  
- **Assets:** Room scenes, badge art, and game sprites under `public/`  

This repo is a product prototype / demo — features are interactive and polished for walkthroughs, not a full production backend.

---

## License

Private project — all rights reserved unless otherwise noted.
