"use client";

import { useEffect, useState } from "react";
import { defineWord, type WordDefinition } from "../define-word";

type Props = {
  words: string[];
  onClose: () => void;
};

export function WordDefinePanel({ words, onClose }: Props) {
  const unique = [...new Set(words.map((w) => w.toUpperCase()))];
  const [active, setActive] = useState(unique[0] ?? "");
  const [def, setDef] = useState<WordDefinition | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setLoading(true);
    setDef(null);
    defineWord(active).then((result) => {
      if (!cancelled) {
        setDef(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [active]);

  return (
    <div className="lex-define-overlay">
      <button
        type="button"
        className="lex-bag-backdrop"
        aria-label="Close definition"
        onClick={onClose}
      />
      <div className="lex-define-card" role="dialog" aria-label="Word meaning">
        <div className="lex-define-head">
          <p className="lex-eyebrow">Look up</p>
          <button type="button" className="lex-btn" onClick={onClose}>
            Close
          </button>
        </div>

        {unique.length > 1 ? (
          <div className="lex-define-tabs">
            {unique.map((w) => (
              <button
                key={w}
                type="button"
                className={`lex-btn${active === w ? " is-on" : ""}`}
                onClick={() => setActive(w)}
              >
                {w}
              </button>
            ))}
          </div>
        ) : null}

        {loading ? (
          <p className="lex-define-body">Looking up {active}…</p>
        ) : def ? (
          <div className="lex-define-body">
            <h3>
              {def.word}
              {def.phonetic ? (
                <span className="lex-define-phonetic"> {def.phonetic}</span>
              ) : null}
            </h3>
            {def.bookishBonus ? (
              <p className="lex-define-bonus">
                Bookish jargon · +{def.bookishBonus} bonus when played
              </p>
            ) : null}
            <ul>
              {def.senses.map((s, i) => (
                <li key={`${s.definition}-${i}`}>
                  {s.partOfSpeech ? (
                    <span className="lex-define-pos">{s.partOfSpeech}</span>
                  ) : null}
                  <span>{s.definition}</span>
                  {s.example ? (
                    <em className="lex-define-ex"> “{s.example}”</em>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
