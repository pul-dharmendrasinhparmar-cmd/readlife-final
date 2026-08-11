"use client";

import { useEffect, type ReactNode } from "react";
import { CloseIcon } from "../dash-icons";

type Props = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  side?: "center" | "right";
};

export function OverlayShell({
  open,
  title,
  subtitle,
  onClose,
  children,
  wide,
  side = "center",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex bg-forest/40 p-3 sm:p-6"
      style={{
        justifyContent: side === "right" ? "flex-end" : "center",
        alignItems: side === "right" ? "stretch" : "center",
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={`flex max-h-[min(92vh,880px)] w-full flex-col overflow-hidden rounded-[1.75rem] border border-[#e4d5c3] bg-[#fbf6ee] shadow-[0_24px_60px_rgba(40,30,20,0.28)] ${
          side === "right"
            ? "my-0 max-w-md sm:my-2"
            : wide
              ? "max-w-2xl"
              : "max-w-lg"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-[#e8dccb] px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-serif text-2xl font-semibold text-forest">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-forest transition hover:bg-[#efe4d4]"
            aria-label="Close"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
