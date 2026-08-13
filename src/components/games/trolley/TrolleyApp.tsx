"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GAME_CONFIG, THEME_BACKGROUNDS, STORY_SPARKS } from "./gameConfig";
import { useTrolleyGame } from "./hooks/useTrolleyGame";
import { ItemArt } from "./components/ItemArt";
import { Trolley } from "./components/Trolley";
import { LibraryBackdrop } from "./components/LibraryBackdrop";
import "./trolley.css";

type Props = {
  onBackToGames?: () => void;
};

export function TrolleyApp({ onBackToGames }: Props) {
  const g = useTrolleyGame();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  const mm = String(Math.floor(g.timeLeft / 60)).padStart(2, "0");
  const ss = String(Math.ceil(g.timeLeft % 60)).padStart(2, "0");
  const place = STORY_SPARKS.find((s) => s.theme === g.theme);

  return (
    <div className={`trolley-root ${THEME_BACKGROUNDS[g.theme]}`}>
      <main className="game-frame">
        <div
          className="playfield"
          ref={g.playfieldRef}
          onPointerDown={(e) => {
            if (g.phase !== "playing") return;
            g.setDragging(true);
            g.moveToClientX(e.clientX);
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (g.phase !== "playing") return;
            g.moveToClientX(e.clientX);
          }}
          onPointerUp={() => g.setDragging(false)}
          onPointerCancel={() => g.setDragging(false)}
          role="application"
          aria-label="Trolley of Tales playfield. Drag or tilt to move."
        >
          <LibraryBackdrop theme={g.theme} />

          {place && g.theme !== "default" && (
            <div className="place-chip" aria-live="polite">
              <span
                className={`place-icon place-icon-${place.icon}`}
                aria-hidden
              />
              <div>
                <strong>{place.placeName}</strong>
                <em>Story world</em>
              </div>
            </div>
          )}
          <div className="hud-top">
            <div className="plaque score-plaque">
              <strong>{g.score.toLocaleString()}</strong>
              <span className="plaque-star" aria-hidden />
            </div>

            <div className="title-banner">
              <span className="banner-book" aria-hidden />
              <h1 className="brand">{GAME_CONFIG.name}</h1>
              <span className="banner-ribbon" aria-hidden />
            </div>

            <div className="plaque status-plaque">
              <div className="timer-row">
                <span className="timer-icon" aria-hidden />
                <strong>
                  {mm}:{ss}
                </strong>
              </div>
              <div className="hearts" aria-label={`${g.lives} lives`}>
                {Array.from({ length: 3 }, (_, i) => (
                  <i key={i} className={i < g.lives ? "on" : "off"} />
                ))}
              </div>
            </div>
          </div>

          {g.items.map((item) => (
            <div
              key={item.id}
              className="fall-item"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%, -50%) rotate(${item.rot}deg)`,
              }}
              aria-hidden
            >
              <ItemArt kind={item.kind} bookId={item.bookId} />
            </div>
          ))}

          {g.floats.map((f) => (
            <div
              key={f.id}
              className={`float-msg ${f.good ? "good" : "bad"}`}
              style={{ left: `${f.x}%` }}
            >
              {f.text}
            </div>
          ))}

          <Trolley
            x={g.trolleyX}
            celebrate={g.celebrate}
            reducedMotion={reducedMotion}
          />

          <div className="hud-bottom">
            <button
              type="button"
              className="orb-btn"
              onClick={g.togglePause}
              disabled={g.phase !== "playing" && g.phase !== "paused"}
              aria-label={g.phase === "paused" ? "Resume" : "Pause"}
            >
              <span
                className={`orb-glyph ${g.phase === "paused" ? "play" : "pause"}`}
              />
            </button>

            <div className="tilt-hint">
              <span className="tilt-arrows" aria-hidden />
              <p>Tilt to move</p>
            </div>

            <button
              type="button"
              className="orb-btn"
              onClick={g.toggleMute}
              aria-label={g.mute ? "Unmute sounds" : "Mute sounds"}
            >
              <span className={`orb-glyph ${g.mute ? "mute" : "sound"}`} />
            </button>
          </div>

          {g.toast && <div className="toast">{g.toast}</div>}

          {g.phase === "tutorial" && (
            <div className="overlay" role="dialog" aria-labelledby="tut-title">
              <div className="panel">
                <p className="panel-kicker">Quick lesson</p>
                <h2 id="tut-title">Steer the trolley. Catch the stories.</h2>
                <ol className="tut-list">
                  <li>
                    Tilt, drag, or use arrow keys to roll left and right.
                  </li>
                  <li>
                    Catch items at the top of the trolley — scoop early and keep
                    moving.
                  </li>
                  <li>Unique glowing books open special story worlds.</li>
                  <li>
                    Dodge coffee, cake, cookies, and spills — three lives only.
                  </li>
                </ol>
                <button
                  type="button"
                  className="btn primary"
                  onClick={g.finishTutorial}
                >
                  Enter the hall
                </button>
              </div>
            </div>
          )}

          {g.phase === "ready" && (
            <div className="overlay" role="dialog" aria-labelledby="ready-title">
              <div className="panel">
                <p className="panel-kicker">Round zero</p>
                <h2 id="ready-title">Ready to rush the shelves?</h2>
                <p className="lede">{GAME_CONFIG.tagline}</p>
                <button
                  type="button"
                  className="btn primary"
                  onClick={g.startRound}
                >
                  Start
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={g.enableTilt}
                >
                  Enable tilt controls
                </button>
                <p className="fine">
                  iPhone needs tilt permission once. Motion is never stored.
                </p>
              </div>
            </div>
          )}

          {g.phase === "paused" && (
            <div className="overlay" role="dialog" aria-labelledby="pause-title">
              <div className="panel">
                <h2 id="pause-title">Paused between chapters</h2>
                <button
                  type="button"
                  className="btn primary"
                  onClick={g.togglePause}
                >
                  Keep rolling
                </button>
              </div>
            </div>
          )}

          {g.phase === "results" && (
            <div className="overlay" role="dialog" aria-labelledby="res-title">
              <div className="panel">
                <p className="panel-kicker">End of round</p>
                <h2 id="res-title">Your shelf is glowing</h2>
                <p className="score-line">
                  <span>{g.score}</span> points · {g.collected} books caught
                </p>
                <div className="reader-card">
                  <p className="reader-label">Your reader type</p>
                  <p className="reader-title">{g.reader.title}</p>
                  <p className="lede">{g.reader.blurb}</p>
                </div>
                {g.recommended ? (
                  <p className="lede">
                    Try next:{" "}
                    <Link className="reco-link" href={g.recommended.url}>
                      {g.recommended.title}
                    </Link>
                  </p>
                ) : null}
                {g.earnedReward && (
                  <p className="reward">{GAME_CONFIG.rewardLabel}</p>
                )}
                <div className="result-actions">
                  <button
                    type="button"
                    className="btn primary"
                    onClick={g.startRound}
                  >
                    Play again
                  </button>
                  {onBackToGames ? (
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={onBackToGames}
                    >
                      Back to games
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => {
                        const text = `I scored ${g.score} in ${GAME_CONFIG.name} — I'm a ${g.reader.title}!`;
                        if (navigator.share) {
                          void navigator.share({
                            text,
                            title: GAME_CONFIG.name,
                          });
                        } else {
                          void navigator.clipboard?.writeText(text);
                        }
                      }}
                    >
                      Share score
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
