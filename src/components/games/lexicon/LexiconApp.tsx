"use client";

import { useMemo, useState } from "react";
import { BOOKISH_BONUS_WORDS, bookishBonusFor } from "./bookish-bonus";
import { FULL_DISTRIBUTION } from "./letters";
import { useLexiconGame } from "./hooks/useLexiconGame";
import { LexiconBoard } from "./components/LexiconBoard";
import { BookishBonusGuide } from "./components/BookishBonusGuide";
import { WordDefinePanel } from "./components/WordDefinePanel";
import "./lexicon.css";

const BLANK_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function CuteTileBag({ count }: { count: number }) {
  return (
    <span className="lex-bag-art" aria-hidden>
      <img
        className="lex-bag-img"
        src="/games/lexicon/tile-bag.png"
        alt=""
        width={52}
        height={50}
        draggable={false}
      />
      <span className="lex-bag-badge">{count}</span>
    </span>
  );
}

function BonusGuideIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        d="M5 4.5h9.5A2.5 2.5 0 0 1 17 7v12.2c0 .7-.7 1.1-1.3.8L12 18.2l-3.7 1.8c-.6.3-1.3-.1-1.3-.8V7A2.5 2.5 0 0 1 9.5 4.5H5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 4.5H19a2 2 0 0 1 2 2V18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M8 9h5.5M8 12h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LexiconApp() {
  const g = useLexiconGame();
  const { state } = g;
  const yourTurn = g.phase === "playing" && state.turn === "you";
  const previewBonus = g.preview ? bookishBonusFor(g.preview) : undefined;
  const [defineWords, setDefineWords] = useState<string[] | null>(null);
  const [showBonusGuide, setShowBonusGuide] = useState(false);

  const lookupWords = useMemo(() => {
    if (!state.lastMove) return [];
    const words = state.lastMove.wordsFormed?.length
      ? state.lastMove.wordsFormed
      : [state.lastMove.word];
    return [...new Set(words.map((w) => w.toUpperCase()))];
  }, [state.lastMove]);

  return (
    <div className="lex-root">
      <div className="lex-shell">
        <div className="lex-play-row">
          <aside className={`lex-side lex-side-you${yourTurn ? " is-active" : ""}`}>
            <div className="lex-scorecard">
              <p className="lex-who">You</p>
              <p className="lex-points">{state.yourScore}</p>
              <p className="lex-rack-hint">{state.yourRack.length} on rack</p>
            </div>
          </aside>

          <div className="lex-stage">
            <div className="lex-msg-row">
              <p className="lex-msg" role="status">
                {state.message ? <strong>{state.message}</strong> : null}
              </p>
              {lookupWords.length > 0 ? (
                <button
                  type="button"
                  className="lex-btn lex-define-btn"
                  onClick={() => setDefineWords(lookupWords)}
                >
                  {lookupWords.length === 1
                    ? `What does ${lookupWords[0]} mean?`
                    : "What do these words mean?"}
                </button>
              ) : null}
            </div>
            <div
              className="lex-opponent-rack"
              aria-label={`ReadLife has ${state.aiRack.length} tiles`}
            >
              {Array.from({ length: state.aiRack.length }, (_, i) => (
                <span
                  key={i}
                  className="lex-rack-tile lex-rack-tile-covered"
                  aria-hidden
                />
              ))}
              {state.aiRack.length === 0 ? (
                <span className="lex-opponent-empty">No tiles</span>
              ) : null}
            </div>
            <div className="lex-board-slot">
              <LexiconBoard
                board={state.board}
                pendingByKey={g.pendingByKey}
                disabled={!yourTurn || g.exchangeMode}
                onDropTile={g.onDropOnCell}
                onPickupPending={g.pickupPending}
              />
            </div>
          </div>

          <aside
            className={`lex-side lex-side-ai${state.turn === "readlife" && g.phase === "playing" ? " is-active" : ""}`}
          >
            <div className="lex-scorecard">
              <p className="lex-who">ReadLife</p>
              <p className="lex-points">{state.aiScore}</p>
              <p className="lex-rack-hint">
                {g.isAiTurn ? "Thinking…" : `${state.aiRack.length} on rack`}
              </p>
            </div>
          </aside>
        </div>

        <div className="lex-rack-bar">
          <p className="lex-preview">
            {g.preview ? (
              <>
                Ready to play <em>{g.preview}</em>
                {previewBonus ? (
                  <span className="lex-bonus-tag">
                    +{previewBonus.bonus} bookish
                  </span>
                ) : null}
              </>
            ) : g.exchangeMode ? (
              "Select tiles to exchange with the bag, then tap Exchange"
            ) : g.hintBusy ? (
              "Looking for a play…"
            ) : (
              "Drag tiles onto the board, then press Play word"
            )}
          </p>

          <div className="lex-rack-row">
            <div
              className="lex-rack"
              aria-label="Your rack"
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                const tileId = e.dataTransfer.getData("text/tile-id");
                if (!tileId) return;
                const pend = g.pending.find((p) => p.tile.id === tileId);
                if (pend) g.pickupPending(pend.row, pend.col);
              }}
            >
              {g.rackVisible.map((tile) => {
                const selected = g.exchangeIds.includes(tile.id);
                return (
                  <button
                    key={tile.id}
                    type="button"
                    className={`lex-rack-tile${selected ? " is-selected" : ""}${tile.isBlank ? " is-blank" : ""}`}
                    disabled={!yourTurn}
                    draggable={yourTurn && !g.exchangeMode}
                    onDragStart={(e) => {
                      if (!yourTurn || g.exchangeMode) return;
                      e.dataTransfer.setData("text/tile-id", tile.id);
                      e.dataTransfer.effectAllowed = "move";
                      g.setDragTileId(tile.id);
                    }}
                    onDragEnd={() => g.setDragTileId(null)}
                    onClick={() => {
                      if (g.exchangeMode) g.toggleExchangeTile(tile.id);
                    }}
                    aria-label={
                      tile.isBlank
                        ? "Blank tile"
                        : `${tile.letter}, ${tile.points} points`
                    }
                  >
                    {tile.isBlank ? "?" : tile.letter}
                    <span className="lex-pts">{tile.points}</span>
                  </button>
                );
              })}
              {g.rackVisible.length === 0 ? (
                <p className="lex-rack-empty">
                  {g.pending.length > 0
                    ? "All tiles are on the board"
                    : "Rack empty — draw new tiles from the bag"}
                </p>
              ) : null}
            </div>

            <div className="lex-bag-chip lex-bag-chip-br">
              <button
                type="button"
                className={`lex-bag-fab${g.showBag ? " is-on" : ""}`}
                aria-expanded={g.showBag}
                aria-label={`Tile bag, ${state.bag.length} remaining`}
                onClick={() => g.setShowBag((v) => !v)}
              >
                <CuteTileBag count={state.bag.length} />
              </button>
              {g.showBag ? (
                <>
                  <button
                    type="button"
                    className="lex-bag-backdrop"
                    aria-label="Close bag"
                    onClick={() => g.setShowBag(false)}
                  />
                  <div
                    className="lex-bag-popover lex-bag-popover-br"
                    aria-label="Tiles remaining in bag"
                  >
                    <div className="lex-bag-grid">
                      {FULL_DISTRIBUTION.map(([letter]) => (
                        <div
                          key={letter}
                          className={`lex-bag-cell${(g.distribution[letter] ?? 0) === 0 ? " is-empty" : ""}`}
                        >
                          <span className="lex-bag-letter">
                            {letter === "?" ? "□" : letter}
                          </span>
                          <span className="lex-bag-count">
                            {g.distribution[letter] ?? 0}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="lex-bag-note">
                      Bookish jargon bonuses +5 / +10 / +15 / +25 ·{" "}
                      {BOOKISH_BONUS_WORDS.length} special words
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="lex-controls">
            <button
              type="button"
              className="lex-btn primary"
              disabled={!yourTurn || g.exchangeMode || g.pending.length === 0}
              onClick={g.playPending}
            >
              Play word
            </button>
            <button
              type="button"
              className="lex-btn"
              disabled={!yourTurn || g.exchangeMode || g.hintBusy}
              onClick={g.applyHint}
            >
              {g.hintBusy ? "Hint…" : "Hint"}
            </button>
            <button
              type="button"
              className="lex-btn"
              disabled={!yourTurn || g.rackVisible.length < 2}
              onClick={g.shuffleRack}
            >
              Shuffle
            </button>
            <button
              type="button"
              className={`lex-btn${g.exchangeMode ? " is-on" : ""}`}
              disabled={!yourTurn || state.bag.length === 0}
              onClick={() => g.exchangeTiles(false)}
            >
              {g.exchangeMode ? "Confirm exchange" : "Exchange"}
            </button>
            <button
              type="button"
              className="lex-btn"
              disabled={!yourTurn || state.bag.length === 0}
              onClick={() => g.exchangeTiles(true)}
            >
              Exchange all
            </button>
            <button
              type="button"
              className="lex-btn"
              disabled={!yourTurn}
              onClick={g.passTurn}
            >
              Pass
            </button>
            <button
              type="button"
              className="lex-btn"
              disabled={
                !yourTurn || (g.pending.length === 0 && !g.exchangeMode)
              }
              onClick={g.clearPending}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {g.phase === "intro" ? (
        <div className="lex-overlay">
          <div className="lex-card">
            <p className="lex-eyebrow">ReadLife Scrabble</p>
            <h2>Wordsmith</h2>
            <p>
              Classic Scrabble rules — any real English word is legal. Play
              bookish jargon for bonus points (+5 / +10 / +15 / +25).
            </p>
            <p>
              {g.dictReady
                ? `${g.englishWordCount.toLocaleString()} words loaded · ${g.bookishBonusCount} bookish bonuses`
                : (g.dictError ?? "Loading dictionary…")}
            </p>
            <div className="lex-actions">
              <button
                type="button"
                className="lex-btn lex-guide-open"
                onClick={() => setShowBonusGuide(true)}
              >
                <BonusGuideIcon />
                Bonus word guide
              </button>
              <button
                type="button"
                className="lex-btn primary"
                disabled={!g.dictReady}
                onClick={() => {
                  setShowBonusGuide(false);
                  g.startGame();
                }}
              >
                {g.dictReady ? "Challenge ReadLife" : "Loading…"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {g.phase === "intro" && showBonusGuide ? (
        <BookishBonusGuide onClose={() => setShowBonusGuide(false)} />
      ) : null}

      {g.pendingBlank ? (
        <div className="lex-overlay">
          <div className="lex-card">
            <p className="lex-eyebrow">Blank tile</p>
            <h2>Choose a letter</h2>
            <p>Your blank can be any letter.</p>
            <div className="lex-blank-picker">
              {BLANK_LETTERS.map((L) => (
                <button key={L} type="button" onClick={() => g.assignBlank(L)}>
                  {L}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {g.phase === "gameover" ? (
        <div className="lex-overlay">
          <div className="lex-card">
            <p className="lex-eyebrow">Final chapter</p>
            <h2>
              {state.winner === "you"
                ? "You win"
                : state.winner === "tie"
                  ? "It's a tie"
                  : "ReadLife wins"}
            </h2>
            <p>
              You {state.yourScore} · ReadLife {state.aiScore}
            </p>
            {state.message ? <p>{state.message}</p> : null}
            {state.history.length > 0 ? (
              <ol className="lex-history">
                {state.history.map((h, i) => (
                  <li key={`${h.player}-${i}`}>
                    <span>
                      {h.player === "you" ? "You" : "ReadLife"}:{" "}
                      {h.kind === "play"
                        ? `${h.word} (+${h.score})`
                        : h.kind === "pass"
                          ? "pass"
                          : "exchange"}
                    </span>
                    {h.kind === "play" && h.word ? (
                      <button
                        type="button"
                        className="lex-history-define"
                        onClick={() =>
                          setDefineWords(
                            h.wordsFormed?.length
                              ? h.wordsFormed
                              : [h.word!],
                          )
                        }
                      >
                        Define
                      </button>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : null}
            <div className="lex-actions">
              <button
                type="button"
                className="lex-btn primary"
                onClick={g.startGame}
              >
                Play again
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {defineWords ? (
        <WordDefinePanel
          words={defineWords}
          onClose={() => setDefineWords(null)}
        />
      ) : null}
    </div>
  );
}
