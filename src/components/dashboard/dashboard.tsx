"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type OnboardingState,
  resolvePet,
} from "@/components/onboarding/data";
import { BuddyReadModal } from "@/components/profile/buddy-read-modal";
import {
  loadProfileState,
  saveProfileState,
} from "@/components/profile/profile-storage";
import type { DiscoveryState } from "@/components/search/types";
import { AppNav } from "@/components/layout/app-nav";
import {
  addToTbr,
  loadDiscoveryState,
  setLibraryStatus,
} from "@/lib/discovery-storage";
import { getDashboardState } from "@/lib/onboarding-storage";
import { shouldSeedDemo } from "@/lib/user-storage";
import {
  DEMO_READING_PARTY,
  getCurrentBook,
  getGreeting,
  getMonthPreview,
  getRecentSpines,
  getStreakDays,
  getTbrBooks,
  getTodayGoalMinutes,
  getUpcomingFromBuddyReads,
} from "./dashboard-data";
import {
  BookIcon,
  CartIcon,
  ChairIcon,
  JournalIcon,
  MailIcon,
  QuoteIcon,
  WindowIcon,
} from "./dash-icons";
import type { HotspotDef, HotspotId } from "./hotspots";
import { AddTbrPanel } from "./overlays/add-tbr";
import { BookshelfPanel } from "./overlays/bookshelf-panel";
import { ChairPanel } from "./overlays/chair-panel";
import { JournalPanel, WriteJournalPanel } from "./overlays/journal-panel";
import { LogSessionPanel } from "./overlays/log-session";
import { MailboxPanel } from "./overlays/mailbox-panel";
import { QuotesPanel, WriteQuotePanel } from "./overlays/quotes-panel";
import { SessionFlow } from "./overlays/session-flow";
import { TbrPanel } from "./overlays/tbr-panel";
import { VibePicker } from "./overlays/vibe-picker";
import { TOUR_STEPS, WelcomeTour } from "./overlays/welcome-tour";
import {
  addJournalEntry,
  deleteJournalEntry,
  loadJournal,
  updateJournalEntry,
} from "./journal-storage";
import type { JournalEntry } from "./journal-storage";
import {
  loadMailbox,
  markMailboxRead,
  type MailItem,
} from "./mailbox-data";
import {
  addQuote,
  deleteQuote,
  loadQuotes,
  updateQuote,
  type FavoriteQuote,
} from "./quotes-storage";
import { ReadingRoom } from "./reading-room";
import { RightPanel } from "./right-panel";
import {
  loadRoomPrefs,
  setRoomVibe,
  setTutorialCompleted,
  VIBE_OPTIONS,
  type RoomVibe,
} from "./room-storage";
import {
  completeReadingSession,
  loadTodayGoalProgress,
} from "./session-storage";

type Overlay =
  | null
  | "bookshelf"
  | "quotes"
  | "write-quote"
  | "window"
  | "journal"
  | "write-journal"
  | "tbr"
  | "mailbox"
  | "chair"
  | "session"
  | "log-session"
  | "add-tbr"
  | "buddy";

export function Dashboard() {
  const [onboarding, setOnboarding] = useState<OnboardingState | null>(null);
  const [discovery, setDiscovery] = useState<DiscoveryState | null>(null);
  const [vibe, setVibe] = useState<RoomVibe>("day");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [quotes, setQuotes] = useState<FavoriteQuote[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [mail, setMail] = useState<MailItem[]>([]);
  const [todayDone, setTodayDone] = useState(18);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [readingEra, setReadingEra] = useState<{
    title: string;
    blurb: string;
  } | null>(null);
  const [buddyReadsVersion, setBuddyReadsVersion] = useState(0);

  const refreshDiscovery = useCallback(() => {
    setDiscovery(loadDiscoveryState());
    setTodayDone(loadTodayGoalProgress().minutesDone);
  }, []);

  useEffect(() => {
    setOnboarding(getDashboardState());
    refreshDiscovery();
    const prefs = loadRoomPrefs();
    setVibe(prefs.vibe);
    setQuotes(loadQuotes());
    setJournal(loadJournal());
    setMail(loadMailbox());
    const profile = loadProfileState();
    setReadingEra(profile.profile.readingEra ?? null);
    if (!prefs.tutorialCompleted) setTourStep(0);
  }, [refreshDiscovery]);

  const pet = useMemo(
    () => (onboarding ? resolvePet(onboarding) : null),
    [onboarding],
  );

  const current = useMemo(
    () => (discovery ? getCurrentBook(discovery) : null),
    [discovery],
  );

  const spines = useMemo(
    () => (discovery ? getRecentSpines(discovery, 6) : []),
    [discovery],
  );

  const tbrItems = useMemo(
    () => (discovery ? getTbrBooks(discovery, 8) : []),
    [discovery],
  );

  const month = useMemo(
    () =>
      discovery
        ? getMonthPreview(discovery)
        : {
            booksFinished: 0,
            hoursRead: 0,
            avgRating: 0,
            minutesRead: 0,
            streakDays: getStreakDays(),
          },
    [discovery],
  );

  const streakDays = getStreakDays();

  const upcoming = useMemo(() => {
    const profile = loadProfileState();
    const buddy = getUpcomingFromBuddyReads(profile.profile.buddyReads);
    return shouldSeedDemo() ? [...buddy, DEMO_READING_PARTY] : buddy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buddyReadsVersion, discovery]);

  const friends = useMemo(() => loadProfileState().followingPeople, []);

  const greeting = useMemo(() => {
    const name =
      onboarding?.displayName.trim() ||
      (shouldSeedDemo() ? "Alex" : "Reader");
    return getGreeting(name);
  }, [onboarding]);

  const hotspots: HotspotDef[] = useMemo(() => {
    const vibeLabel =
      VIBE_OPTIONS.find((opt) => opt.id === vibe)?.label ?? "Day";
    const vibeSubtitle =
      vibe === "rainy"
        ? "Soft rain · Change vibe"
        : vibe === "snowy"
          ? "Snowfall · Change vibe"
          : vibe === "night"
            ? "Night sky · Change vibe"
            : `${vibeLabel} light · Change vibe`;
    return [
      {
        id: "bookshelf",
        title: "Bookshelf",
        subtitle: "Explore your books",
        top: "32%",
        left: "11%",
        icon: BookIcon,
      },
      {
        id: "quotes",
        title: "Quote Wall",
        subtitle: "Daily inspiration",
        top: "14%",
        left: "48%",
        icon: QuoteIcon,
      },
      {
        id: "window",
        title: "Window",
        subtitle: vibeSubtitle,
        top: "28%",
        left: "84%",
        icon: WindowIcon,
      },
      {
        id: "journal",
        title: "Journal",
        subtitle: "Write your thoughts",
        top: "38%",
        left: "46%",
        icon: JournalIcon,
      },
      {
        id: "tbr",
        title: "TBR Cart",
        subtitle: "Manage your reading list",
        top: "72%",
        left: "22%",
        icon: CartIcon,
      },
      {
        id: "chair",
        title: "Reading Chair",
        subtitle: "Your cozy spot",
        top: "52%",
        left: "52%",
        icon: ChairIcon,
      },
      {
        id: "mailbox",
        title: "Mailbox",
        subtitle: "Messages & updates",
        top: "58%",
        left: "76%",
        icon: MailIcon,
      },
    ];
  }, [vibe]);

  const onHotspot = (id: HotspotId) => {
    const map: Record<HotspotId, Overlay> = {
      bookshelf: "bookshelf",
      quotes: "quotes",
      window: "window",
      journal: "journal",
      tbr: "tbr",
      chair: "chair",
      mailbox: "mailbox",
    };
    setOverlay(map[id]);
  };

  const persistSession = (payload: {
    bookId: string;
    minutes: number;
    pagesReadDelta: number;
  }) => {
    if (!discovery) return;
    completeReadingSession(discovery, payload);
    refreshDiscovery();
  };

  const finishTour = () => {
    setTutorialCompleted(true);
    setTourStep(null);
  };

  if (!onboarding || !discovery || !pet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#2a2438] text-muted">
        Opening your reading room…
      </div>
    );
  }

  const petName = onboarding.petName.trim() || pet.label;
  const todayGoalMins = getTodayGoalMinutes(onboarding);
  const featuredQuote =
    quotes[0]?.text ??
    "The circus arrives without warning. No announcements precede it…";

  const tourHighlight =
    tourStep != null ? TOUR_STEPS[tourStep]?.id ?? null : null;

  return (
    <div className="min-h-screen max-w-[100vw] overflow-x-clip bg-[#2a2438] text-ink">
      <AppNav />

      <main className="relative mx-auto grid w-full max-w-[1600px] gap-4 overflow-x-clip px-3 py-3 sm:px-5 sm:py-4 lg:grid-cols-[minmax(0,1.85fr)_minmax(300px,0.72fr)] lg:gap-5 lg:px-5 lg:py-3 xl:grid-cols-[minmax(0,1.95fr)_minmax(320px,0.68fr)]">
        <div className="relative min-h-0 min-w-0">
          <ReadingRoom
            vibe={vibe}
            spots={hotspots}
            greeting={greeting.line}
            highlightedId={tourHighlight}
            onHotspot={onHotspot}
          />
          {tourStep != null ? (
            <WelcomeTour
              step={tourStep}
              onSkip={finishTour}
              onNext={() => {
                if (tourStep >= TOUR_STEPS.length - 1) finishTour();
                else setTourStep(tourStep + 1);
              }}
            />
          ) : null}
        </div>

        <RightPanel
          current={current}
          streakDays={streakDays}
          todayGoalMins={todayGoalMins}
          todayDoneMins={todayDone}
          month={month}
          upcoming={upcoming}
          readingEra={readingEra}
          featuredQuote={featuredQuote}
          onStartReading={() => setOverlay("chair")}
          onUpdateProgress={() => setOverlay("log-session")}
          onPause={() => {
            if (!current) return;
            setLibraryStatus(discovery, current.book.id, "paused", {
              progressPct: current.progressPct,
              pauseReason: "Taking a soft break",
            });
            refreshDiscovery();
          }}
          onFinished={() => {
            if (!current) return;
            setLibraryStatus(discovery, current.book.id, "read", {
              progressPct: 100,
              pagesRead: current.pagesTotal,
            });
            refreshDiscovery();
          }}
          onLogSession={() => setOverlay("log-session")}
          onAddTbr={() => setOverlay("add-tbr")}
          onWriteQuote={() => setOverlay("write-quote")}
          onBuddyRead={() => setOverlay("buddy")}
        />
      </main>

      <BookshelfPanel
        open={overlay === "bookshelf"}
        spines={spines}
        onClose={() => setOverlay(null)}
        onOpenBook={() => setOverlay(null)}
      />
      <QuotesPanel
        open={overlay === "quotes"}
        quotes={quotes}
        onClose={() => setOverlay(null)}
        onWrite={() => setOverlay("write-quote")}
        onUpdate={(id, payload) => setQuotes(updateQuote(id, payload))}
        onDelete={(id) => setQuotes(deleteQuote(id))}
      />
      <WriteQuotePanel
        open={overlay === "write-quote"}
        onClose={() => setOverlay(null)}
        onSave={(payload) => {
          setQuotes(addQuote(payload));
          setOverlay("quotes");
        }}
      />
      <VibePicker
        open={overlay === "window"}
        vibe={vibe}
        onClose={() => setOverlay(null)}
        onSelect={(next) => {
          setRoomVibe(next);
          setVibe(next);
        }}
      />
      <JournalPanel
        open={overlay === "journal"}
        entries={journal}
        onClose={() => setOverlay(null)}
        onWrite={() => setOverlay("write-journal")}
        onUpdate={(id, payload) => setJournal(updateJournalEntry(id, payload))}
        onDelete={(id) => setJournal(deleteJournalEntry(id))}
      />
      <WriteJournalPanel
        open={overlay === "write-journal"}
        onClose={() => setOverlay(null)}
        onSave={(payload) => {
          setJournal(addJournalEntry(payload));
          setOverlay("journal");
        }}
      />
      <TbrPanel
        open={overlay === "tbr"}
        items={tbrItems}
        onClose={() => setOverlay(null)}
      />
      <MailboxPanel
        open={overlay === "mailbox"}
        items={mail}
        onClose={() => setOverlay(null)}
        onMarkRead={(id) => setMail(markMailboxRead(id))}
      />
      <ChairPanel
        open={overlay === "chair"}
        current={current}
        petName={petName}
        onClose={() => setOverlay(null)}
        onStart={() => setOverlay("session")}
      />
      <SessionFlow
        open={overlay === "session"}
        current={current}
        onClose={() => setOverlay(null)}
        onComplete={persistSession}
      />
      <LogSessionPanel
        open={overlay === "log-session"}
        current={current}
        onClose={() => setOverlay(null)}
        onSave={persistSession}
      />
      <AddTbrPanel
        open={overlay === "add-tbr"}
        discovery={discovery}
        onClose={() => setOverlay(null)}
        onAdd={({ bookId, priority, note }) => {
          addToTbr(discovery, {
            bookId,
            priority,
            note,
            sourceType: "self",
          });
          refreshDiscovery();
        }}
      />
      <BuddyReadModal
        open={overlay === "buddy"}
        friends={friends}
        discovery={discovery}
        onClose={() => setOverlay(null)}
        onSend={(payload) => {
          const state = loadProfileState();
          const next = {
            ...state,
            profile: {
              ...state.profile,
              buddyReads: [
                {
                  id: `br-${Date.now()}`,
                  bookId: payload.bookId,
                  friendId: payload.friendId,
                  friendName: payload.friendName,
                  createdBy: "me" as const,
                  startedAt: payload.startedAt,
                  targetEndDate: payload.targetEndDate,
                  readingStyle: payload.readingStyle,
                  myProgress: current?.progressPct ?? 0,
                  friendProgress: 0,
                  status: "pending" as const,
                },
                ...state.profile.buddyReads,
              ],
            },
          };
          saveProfileState(next);
          setBuddyReadsVersion((v) => v + 1);
          setOverlay(null);
        }}
      />
    </div>
  );
}
