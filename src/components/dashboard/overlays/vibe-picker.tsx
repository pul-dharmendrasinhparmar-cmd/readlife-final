"use client";

import { VIBE_OPTIONS, type RoomVibe } from "../room-storage";
import { OverlayShell } from "./overlay-shell";

type Props = {
  open: boolean;
  vibe: RoomVibe;
  onClose: () => void;
  onSelect: (vibe: RoomVibe) => void;
};

export function VibePicker({ open, vibe, onClose, onSelect }: Props) {
  return (
    <OverlayShell
      open={open}
      title="Window vibe"
      subtitle={`Now: ${VIBE_OPTIONS.find((opt) => opt.id === vibe)?.label ?? vibe} · Atmosphere overlays`}
      onClose={onClose}
    >
      <div className="grid gap-2.5 sm:grid-cols-2">
        {VIBE_OPTIONS.map((opt) => {
          const active = vibe === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onSelect(opt.id);
                onClose();
              }}
              className={`rounded-2xl border px-4 py-3.5 text-left transition ${
                active
                  ? "border-forest bg-forest text-paper"
                  : "border-[#e8dccb] bg-[#f7f0e6] text-forest hover:border-forest/30"
              }`}
            >
              <span className="block font-semibold">{opt.label}</span>
              <span
                className={`mt-0.5 block text-sm ${
                  active ? "text-paper/80" : "text-muted"
                }`}
              >
                {opt.blurb}
              </span>
            </button>
          );
        })}
      </div>
    </OverlayShell>
  );
}
