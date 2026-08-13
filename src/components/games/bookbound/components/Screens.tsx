"use client";

/* Local game art — next/image is not needed for these static sprites. */
/* eslint-disable @next/next/no-img-element */

import type { PointerEvent } from "react";
import { CHAPTERS } from "../levels";
import { BG, STORY_ART } from "../sprites";
import type { BookboundPhase, BookboundStats, ChapterId, RunStats } from "../types";

const STORY = [
  {
    bg: STORY_ART[1],
    title: "In the heart of the Grand Library, every book held a world of its own.",
    body: "Some were bright and strange. Some were ancient and forgotten. But every story had its place.",
  },
  {
    bg: STORY_ART[2],
    title: "And between the pages lived Pip.",
    body: "A tiny Book Sprite, born from the magic that gathers wherever stories are loved, lost, and found again. Pip spent quiet nights among the shelves, watching over the sleeping stories.",
  },
  {
    bg: STORY_ART[3],
    title: "Until one night, something went wrong.",
    body: "A mysterious wind swept through the library. Books flew open. Pages tore free. And one by one, they vanished into the worlds they came from.",
  },
  {
    bg: STORY_ART[4],
    title: "Without their pages, the stories began to fade.",
    body: "Characters disappeared. Worlds started to unravel. Even the words themselves were slipping away.",
  },
  {
    bg: STORY_ART[5],
    title: "The missing pages had scattered across three story worlds.",
    body: "An abandoned library guarded by an Ogre. An enchanted forest ruled by an Ink Witch. A ruined castle protected by a Story Dragon. Someone had to bring them back.",
  },
  {
    bg: STORY_ART[6],
    title: "Pip picked up the old Ink Wand, wrapped their scarf tight, and stepped toward the first glowing portal.",
    body: "Pip was small. The monsters were not. But stories had always been braver than they looked.",
  },
] as const;

export function StoryIntro({
  page,
  setPage,
  onDone,
}: {
  page: number;
  setPage: (n: number) => void;
  onDone: () => void;
}) {
  const panel = STORY[page];
  const last = page >= STORY.length - 1;
  return (
    <div className="bb-story">
      <div className="bb-story-art">
        {/* Story PNGs are complete scenes — never stack pip/pages/portal overlays on top. */}
        <img className="bb-story-bg" src={panel.bg} alt="" />
      </div>
      <div className="bb-story-copy">
        <p className="bb-kicker">
          A ReadLife story · {page + 1} / {STORY.length}
        </p>
        <h3>{panel.title}</h3>
        <p>{panel.body}</p>
        <div className="bb-story-nav">
          <button type="button" className="bb-ghost" onClick={onDone}>
            Skip story
          </button>
          <button
            type="button"
            className="bb-cta"
            onClick={() => (last ? onDone() : setPage(page + 1))}
          >
            {last ? "Continue" : "Turn page"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TitleScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="bb-title-screen">
      <p className="bb-kicker" style={{ color: "rgba(247,240,230,0.7)" }}>
        A ReadLife adventure
      </p>
      <h1>BOOKBOUND</h1>
      <p>
        Recover the lost pages.
        <br />
        Restore the stories.
        <br />
        Reach the final chapter.
      </p>
      <button type="button" className="bb-cta" style={{ marginTop: "1.2rem" }} onClick={onBegin}>
        Begin Adventure
      </button>
    </div>
  );
}

export function LevelSelect({
  stats,
  onPick,
  onReplayStory,
}: {
  stats: BookboundStats;
  onPick: (id: ChapterId) => void;
  onReplayStory: () => void;
}) {
  return (
    <div className="bb-overlay">
      <div className="bb-card">
        <p className="bb-kicker">Bookbound</p>
        <h2>Choose a Chapter</h2>
        <p className="bb-muted">Three story worlds. Pip is ready when you are.</p>
        <div className="bb-chapters">
          {CHAPTERS.map((ch) => {
            const locked = ch.id > stats.highestLevelUnlocked;
            const done =
              (ch.id === 1 && stats.level1Completed) ||
              (ch.id === 2 && stats.level2Completed) ||
              (ch.id === 3 && stats.level3Completed);
            const thumb =
              ch.theme === "library"
                ? BG.library
                : ch.theme === "forest"
                  ? BG.forest
                  : BG.castle;
            return (
              <button
                key={ch.id}
                type="button"
                className="bb-chapter"
                disabled={locked}
                onClick={() => onPick(ch.id)}
              >
                <span className="bb-thumb">
                  <img src={thumb} alt="" />
                </span>
                <span>
                  <strong>
                    {ch.subtitle}: {ch.name}
                  </strong>
                  <br />
                  <span className="bb-muted" style={{ margin: 0 }}>
                    {locked ? "Locked" : done ? "Completed" : "Unlocked"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="bb-row">
          <button type="button" className="bb-ghost" onClick={onReplayStory}>
            Replay story
          </button>
        </div>
      </div>
    </div>
  );
}

export function LevelIntroCard({
  chapter,
  onStart,
}: {
  chapter: ChapterId;
  onStart: () => void;
}) {
  const ch = CHAPTERS[chapter - 1];
  return (
    <div className="bb-overlay">
      <div className="bb-card">
        <p className="bb-kicker">{ch.subtitle}</p>
        <h2>{ch.name}</h2>
        <p className="bb-muted">{ch.blurb}</p>
        <p className="bb-muted">
          On phone: use the on-screen pads — arrows to move, ↑ to jump (again
          in air for a double jump), ✦ to blast. On keyboard: A/D or arrows,
          Space to jump, F or X to attack. Watch for flying books, ink, and
          fireballs.
        </p>
        <div className="bb-row">
          <button type="button" className="bb-cta" onClick={onStart}>
            Enter the story
          </button>
        </div>
      </div>
    </div>
  );
}

export function PauseMenu({
  onResume,
  onRestart,
  onExit,
}: {
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}) {
  return (
    <div className="bb-overlay">
      <div className="bb-card">
        <p className="bb-kicker">Paused</p>
        <h2>The story waits</h2>
        <p className="bb-muted">Pip will pick up right where you left the page.</p>
        <div className="bb-row">
          <button type="button" className="bb-cta" onClick={onResume}>
            Resume
          </button>
          <button type="button" className="bb-ghost" onClick={onRestart}>
            Restart
          </button>
          <button type="button" className="bb-ghost" onClick={onExit}>
            Exit to Games
          </button>
        </div>
      </div>
    </div>
  );
}

export function ResultsScreen({
  phase,
  chapter,
  run,
  onNext,
  onReplay,
  onExit,
}: {
  phase: BookboundPhase;
  chapter: ChapterId;
  run: RunStats;
  onNext: () => void;
  onReplay: () => void;
  onExit: () => void;
}) {
  const complete = phase === "gameComplete";
  const over = phase === "gameOver";
  return (
    <div className="bb-overlay">
      <div className="bb-card">
        <p className="bb-kicker">
          {over ? "Chapter failed" : complete ? "The end" : `Chapter ${chapter}`}
        </p>
        <h2>
          {over
            ? "Pip Lost the Story"
            : complete
              ? "Stories Restored"
              : "Chapter Complete!"}
        </h2>
        <p className="bb-muted">
          {over
            ? "The pages are still waiting to be found."
            : complete
              ? "Pip gathered every missing page. The library can sleep again."
              : "Another world remembered how to begin."}
        </p>
        <ul className="bb-stats">
          <li>
            Score <strong>{run.score.toLocaleString()}</strong>
          </li>
          <li>
            Pages <strong>{run.pages}</strong>
          </li>
          <li>
            Golden pages <strong>{run.golden}</strong>
          </li>
          <li>
            Enemies <strong>{run.enemiesDefeated}</strong>
          </li>
          <li>
            Hearts left <strong>{over ? 0 : run.heartsLeft}</strong>
          </li>
        </ul>
        <div className="bb-row">
          {over ? (
            <button type="button" className="bb-cta" onClick={onReplay}>
              Retry Chapter
            </button>
          ) : complete ? null : chapter < 3 ? (
            <button type="button" className="bb-cta" onClick={onNext}>
              Next Chapter
            </button>
          ) : (
            <button type="button" className="bb-cta" onClick={onExit}>
              Back to Games
            </button>
          )}
          {!over ? (
            <button type="button" className="bb-ghost" onClick={onReplay}>
              Replay Level
            </button>
          ) : null}
          <button type="button" className="bb-ghost" onClick={onExit}>
            Back to Games
          </button>
        </div>
      </div>
    </div>
  );
}

export function GameHUD({
  hearts,
  score,
  pages,
  mute,
  onPause,
  onMute,
}: {
  hearts: number;
  score: number;
  pages: number;
  mute: boolean;
  onPause: () => void;
  onMute: () => void;
}) {
  return (
    <div className="bb-hud">
      <div className="bb-hud-top">
        <div className="bb-plaque bb-hearts" aria-label={`${hearts} hearts`}>
          {"❤️".repeat(Math.max(0, hearts))}
          {"🖤".repeat(Math.max(0, 3 - hearts))}
        </div>
        <div className="bb-plaque">★ {score.toLocaleString()}</div>
        <div className="bb-plaque">📄 {pages}</div>
        <div className="bb-hud-actions">
          <button type="button" className="bb-icon-btn" onClick={onMute} aria-label="Mute">
            {mute ? "🔇" : "🔊"}
          </button>
          <button type="button" className="bb-icon-btn" onClick={onPause} aria-label="Pause">
            II
          </button>
        </div>
      </div>
      <div className="bb-keys" aria-label="Keyboard controls">
        <p className="bb-keys-title">Keys</p>
        <div className="bb-key-row">
          <span className="bb-kbd">A</span>
          <span className="bb-kbd">D</span>
          <span className="bb-kbd">←</span>
          <span className="bb-kbd">→</span>
          <span>move</span>
        </div>
        <div className="bb-key-row">
          <span className="bb-kbd">Space</span>
          <span className="bb-kbd">W</span>
          <span>jump ×2</span>
        </div>
        <div className="bb-key-row">
          <span className="bb-kbd">F</span>
          <span className="bb-kbd">X</span>
          <span>ink blast</span>
        </div>
      </div>
    </div>
  );
}

export function TouchControls({
  hold,
}: {
  hold: (key: "left" | "right" | "jump" | "attack", down: boolean) => void;
}) {
  const press =
    (key: "left" | "right" | "jump" | "attack") =>
    (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      hold(key, true);
    };
  const release =
    (key: "left" | "right" | "jump" | "attack") =>
    (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      hold(key, false);
    };
  return (
    <div className="bb-touch">
      <div className="bb-touch-cluster">
        <button
          type="button"
          className="bb-pad"
          aria-label="Left"
          onPointerDown={press("left")}
          onPointerUp={release("left")}
          onPointerCancel={release("left")}
          onLostPointerCapture={release("left")}
        >
          ←
        </button>
        <button
          type="button"
          className="bb-pad"
          aria-label="Right"
          onPointerDown={press("right")}
          onPointerUp={release("right")}
          onPointerCancel={release("right")}
          onLostPointerCapture={release("right")}
        >
          →
        </button>
      </div>
      <div className="bb-touch-cluster">
        <button
          type="button"
          className="bb-pad"
          aria-label="Jump"
          onPointerDown={press("jump")}
          onPointerUp={release("jump")}
          onPointerCancel={release("jump")}
          onLostPointerCapture={release("jump")}
        >
          ↑
        </button>
        <button
          type="button"
          className="bb-pad"
          aria-label="Attack"
          onPointerDown={press("attack")}
          onPointerUp={release("attack")}
          onPointerCancel={release("attack")}
          onLostPointerCapture={release("attack")}
        >
          ✦
        </button>
      </div>
    </div>
  );
}
