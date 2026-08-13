"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AI_DIRECTORY,
  resolveAiDirectoryHref,
} from "@/lib/ai/directory";
import type { MailItem } from "../mailbox-data";
import { OverlayShell } from "./overlay-shell";

type Props = {
  open: boolean;
  items: MailItem[];
  onClose: () => void;
  onMarkRead: (id?: string) => void;
};

const KIND_LABEL: Record<MailItem["kind"], string> = {
  buddy: "Buddy read",
  badge: "Badge",
  list: "List",
  wrapped: "Wrapped",
  party: "Reading party",
  game: "Games",
  book: "Books",
  update: "Update",
};

export function MailboxPanel({ open, items, onClose, onMarkRead }: Props) {
  const tools = useMemo(
    () =>
      AI_DIRECTORY.map((entry) => ({
        ...entry,
        href: resolveAiDirectoryHref(entry),
      })),
    [open],
  );

  return (
    <OverlayShell
      open={open}
      title="Mailbox"
      subtitle="Reader updates — no marketplace noise"
      onClose={onClose}
      side="right"
    >
      <div className="mb-3 rounded-2xl border border-forest/30 bg-forest/10 px-3.5 py-3">
        <p className="text-[0.68rem] font-semibold tracking-wide text-ink/60 uppercase">
          AI tools
        </p>
        <p className="mt-1 text-[0.7rem] text-muted">
          {tools.length} features — tap a name to open it
        </p>
        <ul className="mt-2 max-h-[min(22rem,50vh)] space-y-2 overflow-y-auto pr-1 text-sm text-ink/90">
          {tools.map((entry) => (
            <li key={entry.id}>
              <Link
                href={entry.href}
                className="font-semibold text-forest hover:underline"
                onClick={onClose}
              >
                {entry.label}
              </Link>{" "}
              <span className="text-ink/80">— {entry.blurb}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => onMarkRead()}
          className="text-sm font-semibold text-ink underline-offset-2 hover:underline"
        >
          Mark all read
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted">Inbox clear. Enjoy the quiet.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((m) => {
            const inner = (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[0.68rem] font-semibold tracking-wide text-ink/60 uppercase">
                    {KIND_LABEL[m.kind]}
                  </span>
                  {m.unread ? (
                    <span className="h-2 w-2 rounded-full bg-[#d45545]" />
                  ) : null}
                </div>
                <p className="mt-1 font-semibold text-ink">{m.title}</p>
                <p className="mt-0.5 text-sm text-muted">{m.body}</p>
              </>
            );
            const className = `block w-full rounded-2xl border px-3.5 py-3 text-left transition ${
              m.unread
                ? "border-forest/25 bg-[#3f3654]"
                : "border-[#564d6a] bg-[#342c45]"
            }`;
            return (
              <li key={m.id}>
                {m.href ? (
                  <Link
                    href={m.href}
                    className={className}
                    onClick={() => onMarkRead(m.id)}
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={className}
                    onClick={() => onMarkRead(m.id)}
                  >
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </OverlayShell>
  );
}
