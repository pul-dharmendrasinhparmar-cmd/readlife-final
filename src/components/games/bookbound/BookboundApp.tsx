"use client";

import { useBookboundGame } from "./hooks/useBookboundGame";
import {
  GameHUD,
  LevelIntroCard,
  LevelSelect,
  PauseMenu,
  ResultsScreen,
  StoryIntro,
  TitleScreen,
  TouchControls,
} from "./components/Screens";
import "./bookbound.css";

type Props = {
  onBackToGames?: () => void;
};

export function BookboundApp({ onBackToGames }: Props) {
  const {
    phase,
    setPhase,
    chapter,
    stats,
    hud,
    lastRun,
    mute,
    ready,
    storyPage,
    setStoryPage,
    canvasRef,
    startChapter,
    beginPlay,
    retry,
    nextChapter,
    finishStory,
    toggleMute,
    hold,
    goSelect,
    replayStory,
  } = useBookboundGame();

  const playing = phase === "playing" || phase === "paused";
  const exitToGames = onBackToGames ?? goSelect;

  return (
    <div className="bb-root">
      {!ready ? (
        <div className="bb-loading">Opening the library…</div>
      ) : (
        <div className="bb-stage">
          <canvas
            ref={canvasRef}
            className="bb-canvas"
            aria-label="Bookbound playfield"
          />
          {playing ? (
            <>
              <GameHUD
                hearts={hud.hearts}
                score={hud.score}
                pages={hud.pages}
                mute={mute}
                onPause={() => setPhase("paused")}
                onMute={toggleMute}
              />
              <TouchControls hold={hold} />
            </>
          ) : null}

          {phase === "story" ? (
            <StoryIntro
              page={storyPage}
              setPage={setStoryPage}
              onDone={finishStory}
            />
          ) : null}
          {phase === "title" ? <TitleScreen onBegin={goSelect} /> : null}
          {phase === "levelSelect" ? (
            <LevelSelect
              stats={stats}
              onPick={startChapter}
              onReplayStory={replayStory}
            />
          ) : null}
          {phase === "levelIntro" ? (
            <LevelIntroCard chapter={chapter} onStart={beginPlay} />
          ) : null}
          {phase === "paused" ? (
            <PauseMenu
              onResume={() => setPhase("playing")}
              onRestart={retry}
              onExit={exitToGames}
            />
          ) : null}
          {phase === "levelComplete" ||
          phase === "gameOver" ||
          phase === "gameComplete" ? (
            <ResultsScreen
              phase={phase}
              chapter={chapter}
              run={lastRun}
              onNext={nextChapter}
              onReplay={retry}
              onExit={exitToGames}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
