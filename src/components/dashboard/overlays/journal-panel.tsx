"use client";

import { useEffect, useState } from "react";
import { PencilIcon, TrashIcon } from "../dash-icons";
import type { JournalEntry } from "../journal-storage";
import { OverlayShell } from "./overlay-shell";

type Props = {
  open: boolean;
  entries: JournalEntry[];
  onClose: () => void;
  onWrite: () => void;
  onUpdate: (
    id: string,
    payload: { title: string; body: string; mood?: string },
  ) => void;
  onDelete: (id: string) => void;
};

export function JournalPanel({
  open,
  entries,
  onClose,
  onWrite,
  onUpdate,
  onDelete,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setEditingId(null);
      setConfirmDeleteId(null);
    }
  }, [open]);

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
          {entries.map((e) =>
            editingId === e.id ? (
              <JournalEditCard
                key={e.id}
                entry={e}
                onCancel={() => setEditingId(null)}
                onSave={(payload) => {
                  onUpdate(e.id, payload);
                  setEditingId(null);
                }}
              />
            ) : (
              <li
                key={e.id}
                className="rounded-2xl border border-[#564d6a] bg-[#342c45] px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-ink">{e.title}</h3>
                      {e.mood ? (
                        <span className="text-[0.7rem] tracking-wide text-muted uppercase">
                          {e.mood}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/85">
                      {e.body}
                    </p>
                    <p className="mt-2 text-[0.7rem] text-muted">
                      {new Date(e.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDeleteId(null);
                        setEditingId(e.id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-ink/70 transition hover:bg-[#3f3654] hover:text-ink"
                      aria-label={`Edit ${e.title}`}
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                    </button>
                    {confirmDeleteId === e.id ? (
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(e.id);
                          setConfirmDeleteId(null);
                        }}
                        className="rounded-full bg-[#c45c4a]/12 px-2.5 py-1 text-[0.7rem] font-semibold text-[#a34434] transition hover:bg-[#c45c4a]/20"
                      >
                        Delete?
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(e.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-ink/70 transition hover:bg-[#3f3654] hover:text-[#a34434]"
                        aria-label={`Delete ${e.title}`}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ),
          )}
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

function JournalEditCard({
  entry,
  onCancel,
  onSave,
}: {
  entry: JournalEntry;
  onCancel: () => void;
  onSave: (payload: { title: string; body: string; mood?: string }) => void;
}) {
  const [title, setTitle] = useState(entry.title);
  const [body, setBody] = useState(entry.body);
  const [mood, setMood] = useState(entry.mood ?? "cozy");

  return (
    <li className="rounded-2xl border border-[#564d6a] bg-[#342c45] px-4 py-3">
      <label className="block text-sm text-ink">
        Title
        <input
          className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label className="mt-3 block text-sm text-ink">
        Reflection
        <textarea
          className="mt-1 min-h-[100px] w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>
      <label className="mt-3 block text-sm text-ink">
        Mood
        <select
          className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        >
          <option value="cozy">Cozy</option>
          <option value="wistful">Wistful</option>
          <option value="excited">Excited</option>
          <option value="quiet">Quiet</option>
        </select>
      </label>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex flex-1 items-center justify-center rounded-full border border-[#564d6a] bg-paper py-2.5 text-sm font-semibold text-ink transition hover:bg-[#3f3654]"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!body.trim()}
          onClick={() =>
            onSave({
              title: title.trim() || "Untitled",
              body: body.trim(),
              mood,
            })
          }
          className="inline-flex flex-1 items-center justify-center rounded-full bg-forest py-2.5 text-sm font-semibold text-paper transition hover:bg-forest-deep disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </li>
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
      <label className="block text-sm text-ink">
        Title
        <input
          className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="After chapter…"
        />
      </label>
      <label className="mt-3 block text-sm text-ink">
        Reflection
        <textarea
          className="mt-1 min-h-[120px] w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>
      <label className="mt-3 block text-sm text-ink">
        Mood
        <select
          className="mt-1 w-full rounded-2xl border border-[#564d6a] bg-paper px-3 py-2.5"
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
