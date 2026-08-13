"use client";

import { useEffect, useMemo, useState } from "react";
import { DISCOVER_READERS } from "@/components/search/data";
import { getPersonality, formatPersonalityCode } from "./personalities";
import { scoreAnswers } from "./score";
import type { PersonalityAssessment, PersonalityCode } from "./types";
import { DIMENSIONS } from "./types";

/** Mock friend codes for compare prototype */
const FRIEND_CODES: Record<string, PersonalityCode> = {
  mina: "LAMS",
  jordan: "LIMS",
  nova: "EIMO",
  leo: "EIPS",
  haze: "EAMS",
  sam: "EAMO",
  priya: "LAPO",
  ellie: "LIMO",
};

type Props = {
  assessment: PersonalityAssessment;
  followingIds: string[];
  open: boolean;
  onClose: () => void;
};

export function PersonalityCompare({
  assessment,
  followingIds,
  open,
  onClose,
}: Props) {
  const you = getPersonality(assessment.personalityCode);
  const yourScores = useMemo(
    () => scoreAnswers(assessment.answers, assessment.tieBreakers),
    [assessment],
  );
  const friends = DISCOVER_READERS.filter((r) => followingIds.includes(r.id));
  const [friendId, setFriendId] = useState(friends[0]?.id ?? "mina");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const friend = DISCOVER_READERS.find((r) => r.id === friendId) ?? DISCOVER_READERS[0];
  const friendCode = FRIEND_CODES[friend.id] ?? "LAMS";
  const friendP = getPersonality(friendCode);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-forest/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Compare personalities"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.75rem] border border-[#4a425c] bg-[#3a324f] p-5 shadow-[0_24px_60px_rgba(42,36,56,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-ink/65 uppercase">
              Compare with friends
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">
              Reading personalities
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#3f3654] px-3 py-1.5 text-sm font-semibold text-ink"
          >
            Close
          </button>
        </div>

        <label className="mt-4 block text-sm text-muted">
          Friend
          <select
            className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5 text-ink outline-none"
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
          >
            {(friends.length ? friends : DISCOVER_READERS.slice(0, 5)).map(
              (r) => (
                <option key={r.id} value={r.id}>
                  {r.displayName} (@{r.username})
                </option>
              ),
            )}
          </select>
        </label>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[1.25rem] border border-[#4a425c] bg-paper/70 p-3 text-center">
            <p className="text-2xl">{you.emoji}</p>
            <p className="mt-1 font-serif font-semibold text-ink">You</p>
            <p className="text-sm text-muted">
              {you.name}{" "}
              <span className="tracking-wide">
                {formatPersonalityCode(you.code)}
              </span>
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-[#4a425c] bg-paper/70 p-3 text-center">
            <p className="text-2xl">{friendP.emoji}</p>
            <p className="mt-1 font-serif font-semibold text-ink">
              {friend.displayName}
            </p>
            <p className="text-sm text-muted">
              {friendP.name}{" "}
              <span className="tracking-wide">
                {formatPersonalityCode(friendP.code)}
              </span>
            </p>
          </div>
        </div>

        <ul className="mt-5 space-y-3">
          {DIMENSIONS.map((dim, i) => {
            const yours = yourScores.dimensions[i];
            const friendLetter = friendP.code[i];
            const friendIsFirst = friendLetter === dim.first.letter;
            const friendPct = friendIsFirst ? 61 + i * 5 : 55 + i * 4;
            return (
              <li
                key={dim.id}
                className="rounded-[1.1rem] border border-[#564d6a] bg-[#342c45] px-3.5 py-3"
              >
                <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-ink/65 uppercase">
                  {dim.first.label} ↔ {dim.second.label}
                </p>
                <p className="mt-1 text-sm text-ink">
                  You: {yours.winnerLabel} {yours.firstPolePercentage}%
                  {yours.winner === dim.second.letter
                    ? ` ${dim.second.label} lean`
                    : ""}
                </p>
                <p className="text-sm text-muted">
                  {friend.displayName}:{" "}
                  {friendIsFirst ? dim.first.label : dim.second.label}{" "}
                  {friendPct}%
                </p>
                <p className="mt-1 text-xs text-muted-soft">
                  {yours.winner === friendLetter
                    ? "Same pole — different books, similar instincts."
                    : "Different poles — great for trading recommendations."}
                </p>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-xs text-muted">
          Playful comparison only — not a scientific compatibility score.
        </p>
      </div>
    </div>
  );
}
