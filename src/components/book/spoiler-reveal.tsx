"use client";

import { useState, type ReactNode } from "react";

export function SpoilerReveal({
  children,
  label = "View spoiler",
}: {
  children: ReactNode;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  if (open) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        aria-hidden
        className="pointer-events-none select-none blur-[6px] opacity-70"
      >
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(110deg,rgba(176,143,206,0.55),rgba(143,176,150,0.45),rgba(232,196,196,0.55))] backdrop-blur-[2px]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-[#2a2438]/25 bg-paper px-4 py-1.5 text-sm font-semibold text-ink shadow-sm hover:bg-cream-card"
        >
          {label}
        </button>
      </div>
    </div>
  );
}
