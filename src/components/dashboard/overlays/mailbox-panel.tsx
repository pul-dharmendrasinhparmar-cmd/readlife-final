"use client";

import Link from "next/link";
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
};

export function MailboxPanel({ open, items, onClose, onMarkRead }: Props) {
  return (
    <OverlayShell
      open={open}
      title="Mailbox"
      subtitle="Reader updates — no marketplace noise"
      onClose={onClose}
      side="right"
    >
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => onMarkRead()}
          className="text-sm font-semibold text-forest underline-offset-2 hover:underline"
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
                  <span className="text-[0.68rem] font-semibold tracking-wide text-forest/60 uppercase">
                    {KIND_LABEL[m.kind]}
                  </span>
                  {m.unread ? (
                    <span className="h-2 w-2 rounded-full bg-[#d45545]" />
                  ) : null}
                </div>
                <p className="mt-1 font-semibold text-forest">{m.title}</p>
                <p className="mt-0.5 text-sm text-muted">{m.body}</p>
              </>
            );
            const className = `block w-full rounded-2xl border px-3.5 py-3 text-left transition ${
              m.unread
                ? "border-forest/25 bg-[#f0e6d6]"
                : "border-[#e8dccb] bg-[#f7f0e6]"
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
