"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { LeafIcon } from "@/components/icons";
import { resolveAvatarImage } from "@/components/onboarding/data";
import { getDashboardState } from "@/lib/onboarding-storage";
import {
  loadMailbox,
  markMailboxRead,
  unreadCount,
  type MailItem,
} from "@/components/dashboard/mailbox-data";
import { MailboxPanel } from "@/components/dashboard/overlays/mailbox-panel";
import {
  BellIcon,
  BookIcon,
  ChartIcon,
  GamesIcon,
  HomeIcon,
  PersonIcon,
  SearchIcon,
} from "./nav-icons";

const NAV = [
  { id: "dashboard", label: "Dashboard", href: "/home", icon: HomeIcon },
  { id: "search", label: "Discover", href: "/search", icon: SearchIcon },
  { id: "games", label: "Games", href: "/games", icon: GamesIcon },
  { id: "library", label: "Library", href: "/library", icon: BookIcon },
  { id: "insight", label: "Insights", href: "/insights", icon: ChartIcon },
  { id: "profile", label: "Profile", href: "/profile", icon: PersonIcon },
] as const;

function navActive(pathname: string, href: string) {
  return (
    pathname === href || (href !== "/home" && pathname.startsWith(href))
  );
}

export function AppNav() {
  const pathname = usePathname();
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [avatarSrc, setAvatarSrc] = useState("/avatars/reader-female.png");
  const [name, setName] = useState("Alex");
  const [mailOpen, setMailOpen] = useState(false);
  const [mail, setMail] = useState<MailItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const state = getDashboardState();
    setAvatarSrc(resolveAvatarImage(state.avatar));
    setName(state.displayName.trim() || "Alex");
    setMail(loadMailbox());
  }, []);

  useEffect(() => {
    if (mailOpen) setMail(loadMailbox());
  }, [mailOpen]);

  // Close drawer when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const unread = unreadCount(mail);

  return (
    <>
      <a
        href="#main-content"
        className="skip-link"
        onClick={(e) => {
          const main =
            document.getElementById("main-content") ??
            document.querySelector("main");
          if (!main) return;
          e.preventDefault();
          main.id = main.id || "main-content";
          if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
          main.focus();
        }}
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 border-b border-[#4a425c]/80 bg-[#342c45]/95 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md">
        <div className="mx-auto flex h-[4.25rem] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <button
              ref={menuButtonRef}
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink transition hover:bg-[#3f3654] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest md:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <MenuIcon open={menuOpen} />
            </button>

            <Link
              href="/"
              className="flex min-w-0 shrink-0 items-center gap-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
            >
              <span className="font-serif text-[1.45rem] font-semibold tracking-[-0.02em]">
                ReadLife
              </span>
              <LeafIcon className="hidden h-5 w-5 sm:block" />
            </Link>
          </div>

          <nav
            className="hidden items-center gap-1 md:flex lg:gap-2"
            aria-label="Primary"
          >
            {NAV.map((item) => {
              const active = navActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
                    active
                      ? "text-ink"
                      : "text-ink/65 hover:bg-[#3f3654] hover:text-ink"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-[1.05rem] w-[1.05rem]" />
                  {item.label}
                  {active ? (
                    <span className="absolute inset-x-3 -bottom-[0.85rem] h-[2px] rounded-full bg-forest" />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMailOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink transition hover:bg-[#3f3654] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              aria-label={
                unread > 0 ? `Mailbox, ${unread} unread` : "Mailbox"
              }
            >
              <BellIcon className="h-5 w-5" />
              {unread > 0 ? (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#d45545] ring-2 ring-[#342c45]" />
              ) : null}
            </button>
            <Link
              href="/profile"
              className="relative h-10 w-10 overflow-hidden rounded-full border border-[#564d6a] bg-[#3f3654] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              aria-label={`${name}'s profile`}
            >
              <Image
                src={avatarSrc}
                alt=""
                fill
                className="object-cover object-top"
                sizes="40px"
              />
            </Link>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        <div
          id={menuId}
          className={`border-t border-[#4a425c]/80 md:hidden ${
            menuOpen ? "block" : "hidden"
          }`}
          hidden={!menuOpen}
        >
          <nav
            className="mx-auto max-w-[1440px] px-3 py-3"
            aria-label="Mobile primary"
          >
            <ul className="grid gap-1">
              {NAV.map((item) => {
                const active = navActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
                        active
                          ? "bg-[#3f3654] text-ink"
                          : "text-ink/80 hover:bg-[#3f3654] hover:text-ink"
                      }`}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-[#2a2438]/55 md:hidden"
          aria-label="Dismiss menu"
          onClick={() => {
            setMenuOpen(false);
            menuButtonRef.current?.focus();
          }}
        />
      ) : null}

      {/* Persistent mobile bottom bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[#4a425c] bg-[#342c45] pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_24px_rgba(20,16,30,0.35)] md:hidden"
        aria-label="Primary mobile"
      >
        <ul className="mx-auto grid max-w-[1440px] grid-cols-6 gap-0 px-0.5 pt-1">
          {NAV.map((item) => {
            const active = navActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.id} className="min-w-0">
                <Link
                  href={item.href}
                  className={`flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-forest ${
                    active ? "text-forest" : "text-ink/60 hover:text-ink"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="max-w-full truncate text-[0.58rem] font-semibold leading-tight tracking-wide">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <MailboxPanel
        open={mailOpen}
        items={mail}
        onClose={() => setMailOpen(false)}
        onMarkRead={(id) => setMail(markMailboxRead(id))}
      />
    </>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
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
  );
}
