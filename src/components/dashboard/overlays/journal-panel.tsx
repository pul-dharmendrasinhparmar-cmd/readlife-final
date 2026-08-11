"use client";

import { useState } from "react";
import type { JournalEntry } from "../journal-storage";
import { OverlayShell } from "./overlay-shell";

type Props = {
  open: boolean;
  entries: JournalEntry[];
  onClose: () => void;
  onWrite: () => void;
};

export function JournalPanel({ open, entries, onClose, onWrite }: Props) {
  return (
    <OverlayShell
      open={open}
      title="Journal"
      subtitle="Private reflections — just for you"
      onClose={onClose}
    >
      {entries.length === 0 ? (
        <p className="text-sm text-muted">
          Your first reflection is waiting. No audience, no pressure.
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li
              key={e.id}
              className="rounded-2xl border border-[#e8dccb] bg-[#f7f0e6] px-4 py-3"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-semibold text-forest">{e.title}</h3>
                {e.mood ? (
                  <span className="text-[0.7rem] tracking-wide text-muted uppercase">
                    {e.mood}
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-forest/85">
                {e.body}
              </p>
              <p className="mt-2 text-[0.7rem] text-muted">
                {new Date(e.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={onWrite}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-forest py-3 text-sm font-semibold text-paper transition hover:bg-forest-deep"
      >
        Write reflection
      </button>
    </OverlayShell>
  );
}

type WriteProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: { title: string; body: string; mood?: string }) => void;
};

export function WriteJournalPanel({ open, onClose, onSave }: WriteProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState("cozy");

  return (
    <OverlayShell
      open={open}
      title="New reflection"
      subtitle="Prototype journal — saved locally"
      onClose={onClose}
    >
      <label className="block text-sm text-forest">
        Title
        <input
          className="mt-1 w-full rounded-2xl border border-[#e0d1bf] bg-white px-3 py-2.5"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="After chapter…"
        />
      </label>
      <label className="mt-3 block text-sm text-forest">
        Reflection
        <textarea
          className="mt-1 min-h-[120px] w-full rounded-2xl border border-[#e0d1bf] bg-white px-3 py-2.5"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>
      <label className="mt-3 block text-sm text-forest">
        Mood
        <select
          className="mt-1 w-full rounded-2xl border border-[#e0d1bf] bg-white px-3 py-2.5"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        >
          <option value="cozy">Cozy</option>
          <option value="wistful">Wistful</option>
          <option value="excited">Excited</option>
          <option value="quiet">Quiet</option>
        </select>
      </label>
      <button
        type="button"
        disabled={!body.trim()}
        onClick={() => {
          onSave({
            title: title.trim() || "Untitled",
            body: body.trim(),
            mood,
          });
          setTitle("");
          setBody("");
        }}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-forest py-3 text-sm font-semibold text-paper transition hover:bg-forest-deep disabled:opacity-40"
      >
        Save entry
      </button>
    </OverlayShell>
  );
}
