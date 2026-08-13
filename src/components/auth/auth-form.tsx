"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { GoogleIcon, LeafIcon } from "@/components/icons";

type Mode = "login" | "signup";

type AuthFormProps = {
  mode: Mode;
  googleEnabled: boolean;
};

export function AuthForm({ mode, googleEnabled }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/home";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        if (!res.ok) {
          setError(data.error || "Could not create account.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(
          mode === "login"
            ? "Invalid email or password."
            : "Account created, but sign-in failed. Try logging in.",
        );
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setPending(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      setError("Google sign-in failed. Check AUTH_GOOGLE_* env vars.");
      setPending(false);
    }
  }

  const title = mode === "login" ? "Welcome back" : "Create your account";
  const subtitle =
    mode === "login"
      ? "Log in to sync your reading life across devices."
      : "Sign up with email — or continue with Google when configured.";

  return (
    <div className="mx-auto w-full max-w-md rounded-[1.5rem] border border-line/60 bg-paper/80 p-6 shadow-[0_20px_50px_rgba(20,16,30,0.35)] backdrop-blur-sm sm:p-8">
      <div className="mb-6 flex items-center gap-2 text-ink">
        <LeafIcon className="h-5 w-5 text-forest" />
        <span className="font-serif text-2xl font-semibold tracking-[-0.02em]">
          ReadLife
        </span>
      </div>

      <h1 className="font-serif text-[1.85rem] font-semibold tracking-[-0.02em] text-ink">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>

      {googleEnabled ? (
        <button
          type="button"
          onClick={onGoogle}
          disabled={pending}
          className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full border border-accent/40 bg-[#f4f5f8]/10 px-5 py-3 text-sm font-semibold text-accent transition hover:bg-[#f4f5f8]/15 disabled:opacity-60"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      ) : (
        <p className="mt-5 rounded-2xl border border-line/50 bg-cream/40 px-3.5 py-2.5 text-xs leading-relaxed text-muted">
          Google sign-in is available after you add{" "}
          <code className="text-ink/90">AUTH_GOOGLE_ID</code> and{" "}
          <code className="text-ink/90">AUTH_GOOGLE_SECRET</code> to{" "}
          <code className="text-ink/90">.env.local</code> and restart the
          server.
        </p>
      )}

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line/70" />
        or with email
        <span className="h-px flex-1 bg-line/70" />
      </div>

      <form onSubmit={onSubmit} className="grid gap-3.5">
        {mode === "signup" ? (
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-ink/90">Name</span>
            <input
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-2xl border border-line/70 bg-cream px-3.5 py-2.5 text-ink outline-none ring-forest/40 placeholder:text-muted-soft focus:ring-2"
              placeholder="Alex"
            />
          </label>
        ) : null}

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-ink/90">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border border-line/70 bg-cream px-3.5 py-2.5 text-ink outline-none ring-forest/40 placeholder:text-muted-soft focus:ring-2"
            placeholder="you@example.com"
          />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-ink/90">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl border border-line/70 bg-cream px-3.5 py-2.5 text-ink outline-none ring-forest/40 placeholder:text-muted-soft focus:ring-2"
            placeholder="At least 8 characters"
          />
        </label>

        {error ? (
          <p
            className="rounded-2xl border border-[#d45545]/40 bg-[#d45545]/10 px-3.5 py-2.5 text-sm text-[#f0b4ae]"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-[#2a2438] shadow-[0_10px_24px_rgba(176,143,206,0.22)] transition hover:bg-forest-deep disabled:opacity-60"
        >
          <LeafIcon className="h-4 w-4" />
          {pending
            ? mode === "login"
              ? "Logging in…"
              : "Creating account…"
            : mode === "login"
              ? "Log in"
              : "Sign up"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link
              href="/signup"
              className="font-semibold text-accent underline underline-offset-2"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-accent underline underline-offset-2"
            >
              Log in
            </Link>
          </>
        )}
      </p>

      <p className="mt-3 text-center text-xs text-muted-soft">
        Prefer the demo?{" "}
        <Link href="/home" className="underline underline-offset-2">
          Continue as guest
        </Link>{" "}
        — localStorage flows stay intact.
      </p>
    </div>
  );
}
