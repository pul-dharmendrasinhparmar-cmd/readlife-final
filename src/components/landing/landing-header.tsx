"use client";

import { useEffect, useId, useState } from "react";
import { LeafIcon } from "@/components/icons";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Readers", href: "#for-readers" },
  { label: "Community", href: "#community" },
] as const;

export function LandingHeader() {
  const menuId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="relative z-30 border-b border-transparent">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:px-8 sm:py-5 lg:px-10">
        <a href="/" className="flex items-center gap-2 text-ink">
          <LeafIcon className="h-5 w-5" />
          <span className="font-serif text-[1.55rem] font-semibold tracking-[-0.02em]">
            ReadLife
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Landing">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.95rem] font-medium text-ink/80 transition hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="/login"
            className="hidden rounded-full border border-accent/70 px-4 py-1.5 text-sm font-semibold text-accent transition hover:bg-accent/5 sm:inline-flex"
          >
            Log in
          </a>
          <a
            href="/signup"
            className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-1.5 text-sm font-semibold text-[#2a2438] shadow-sm transition hover:bg-forest-deep sm:px-4"
          >
            Sign up
            <LeafIcon className="hidden h-3.5 w-3.5 text-[#2a2438]/90 sm:block" />
          </a>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition hover:bg-[#3f3654] md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              {open ? (
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M4 7h16" strokeLinecap="round" />
                  <path d="M4 12h16" strokeLinecap="round" />
                  <path d="M4 17h16" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        id={menuId}
        className={`border-t border-[#4a425c]/70 bg-[#342c45]/98 md:hidden ${
          open ? "block" : "hidden"
        }`}
        hidden={!open}
      >
        <nav className="mx-auto max-w-6xl px-4 py-3" aria-label="Landing mobile">
          <ul className="grid gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="flex min-h-12 items-center rounded-2xl px-4 py-3 text-base font-semibold text-ink/85 hover:bg-[#3f3654]"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="/login"
                className="flex min-h-12 items-center rounded-2xl px-4 py-3 text-base font-semibold text-accent hover:bg-[#3f3654]"
                onClick={() => setOpen(false)}
              >
                Log in
              </a>
            </li>
            <li>
              <a
                href="/signup"
                className="flex min-h-12 items-center rounded-2xl px-4 py-3 text-base font-semibold text-forest hover:bg-[#3f3654]"
                onClick={() => setOpen(false)}
              >
                Sign up
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
