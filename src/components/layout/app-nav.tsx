"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

export function AppNav() {
  const pathname = usePathname();
  const [avatarSrc, setAvatarSrc] = useState("/avatars/reader-female.png");
  const [name, setName] = useState("Alex");
  const [mailOpen, setMailOpen] = useState(false);
  const [mail, setMail] = useState<MailItem[]>([]);

  useEffect(() => {
    const state = getDashboardState();
    setAvatarSrc(resolveAvatarImage(state.avatar));
    setName(state.displayName.trim() || "Alex");
    setMail(loadMailbox());
  }, []);

  // Refresh when opening so game/book seeds merge in
  useEffect(() => {
    if (mailOpen) setMail(loadMailbox());
  }, [mailOpen]);

  const unread = unreadCount(mail);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#4a425c]/80 bg-[#342c45]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[4.25rem] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-ink">
            <span className="font-serif text-[1.45rem] font-semibold tracking-[-0.02em]">
              ReadLife
            </span>
            <LeafIcon className="h-5 w-5" />
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex lg:gap-2"
            aria-label="Primary"
          >
            {NAV.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/home" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition ${
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMailOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-[#3f3654]"
              aria-label={
                unread > 0
                  ? `Mailbox, ${unread} unread`
                  : "Mailbox"
              }
            >
              <BellIcon className="h-5 w-5" />
              {unread > 0 ? (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#d45545] ring-2 ring-[#342c45]" />
              ) : null}
            </button>
            <Link
              href="/profile"
              className="relative h-10 w-10 overflow-hidden rounded-full border border-[#564d6a] bg-[#3f3654]"
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
      </header>

      <MailboxPanel
        open={mailOpen}
        items={mail}
        onClose={() => setMailOpen(false)}
        onMarkRead={(id) => setMail(markMailboxRead(id))}
      />
    </>
  );
}
