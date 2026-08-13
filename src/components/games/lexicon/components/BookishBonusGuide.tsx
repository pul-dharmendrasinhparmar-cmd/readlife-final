"use client";

import {
  BONUS_TIERS,
  BOOKISH_BONUS_WORDS,
  wordsByTier,
} from "../bookish-bonus";

type Props = {
  onClose: () => void;
};

export function BookishBonusGuide({ onClose }: Props) {
  return (
    <div className="lex-guide-overlay">
      <button
        type="button"
        className="lex-bag-backdrop"
        aria-label="Close bonus guide"
        onClick={onClose}
      />
      <div
        className="lex-guide-card"
        role="dialog"
        aria-label="Bookish bonus word guide"
      >
        <div className="lex-guide-head">
          <div>
            <p className="lex-eyebrow">Bonus guide</p>
            <h3>Bookish extra points</h3>
          </div>
          <button type="button" className="lex-btn" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="lex-guide-lead">
          Any real English word scores. Play one of these{" "}
          {BOOKISH_BONUS_WORDS.length} bookish words for a flat bonus on top.
          Study them now — this guide locks once the match starts.
        </p>

        <div className="lex-guide-tiers">
          {BONUS_TIERS.map((tier) => {
            const words = wordsByTier(tier.bonus);
            return (
              <section key={tier.bonus} className="lex-guide-tier">
                <header>
                  <span className="lex-guide-badge">+{tier.bonus}</span>
                  <div>
                    <h4>{tier.category}</h4>
                    <p>{tier.blurb}</p>
                  </div>
                </header>
                <ul className="lex-guide-words">
                  {words.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
