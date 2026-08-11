"use client";

import Backdrop from "../game/Backdrop";

type ThemeSummary = {
  bookId: string;
  title: string;
  tagline: string;
  accent: string;
  backdrop: {
    preset: string;
    skyGradient: string[];
    silhouetteColor?: string;
    overlayEffect?: string;
    overlayColor?: string;
  };
};

type Props = {
  themes: ThemeSummary[] | null;
  onSelect: (bookId: string) => void;
  /** Disabled "From Your Shelf" card when the Library is too thin. */
  lockedShelf?: ThemeSummary | null;
};

export default function ThemeSelect({ themes, onSelect, lockedShelf }: Props) {
  if (!themes) return null;

  return (
    <div className="theme-select">
      <h1>Bookle</h1>
      <p className="subtitle">Guess the 5-letter word. Pick your book world.</p>
      <div className="theme-grid">
        {lockedShelf && (
          <div
            className="theme-card theme-card-locked"
            style={{ ["--accent" as string]: lockedShelf.accent }}
            aria-disabled="true"
          >
            <Backdrop token={lockedShelf.backdrop}>
              <div className="theme-card-content">
                <h2>{lockedShelf.title}</h2>
                <p>{lockedShelf.tagline}</p>
                <span className="theme-card-cta">Mark books finished in Library</span>
              </div>
            </Backdrop>
          </div>
        )}
        {themes.map((theme) => (
          <button
            key={theme.bookId}
            type="button"
            className="theme-card"
            style={{ ["--accent" as string]: theme.accent }}
            onClick={() => onSelect(theme.bookId)}
          >
            <Backdrop token={theme.backdrop}>
              <div className="theme-card-content">
                <h2>{theme.title}</h2>
                <p>{theme.tagline}</p>
              </div>
            </Backdrop>
          </button>
        ))}
      </div>
    </div>
  );
}
