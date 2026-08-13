"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

/** Compact auth status for AppNav — additive; guests keep demo avatar. */
export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="hidden text-xs text-muted sm:inline" aria-hidden>
        …
      </span>
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="hidden rounded-full border border-accent/50 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/10 sm:inline-flex"
      >
        Sign in
      </Link>
    );
  }

  const label =
    session.user.name?.trim() ||
    session.user.email?.split("@")[0] ||
    "Signed in";

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <span
        className="max-w-[9rem] truncate text-xs font-medium text-ink/80"
        title={session.user.email ?? label}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-full border border-line/70 px-2.5 py-1 text-[0.7rem] font-semibold text-muted transition hover:border-accent/50 hover:text-accent"
      >
        Sign out
      </button>
    </div>
  );
}
