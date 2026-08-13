import { Suspense } from "react";
import { isGoogleAuthConfigured } from "@/auth";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Sign up — ReadLife",
};

export default function SignupPage() {
  const googleEnabled = isGoogleAuthConfigured;

  return (
    <div className="page-shell relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(176,143,206,0.18),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(123,163,196,0.12),transparent_40%)]" />
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-md rounded-[1.5rem] border border-line/60 bg-paper/80 p-8 text-sm text-muted">
            Loading…
          </div>
        }
      >
        <AuthForm mode="signup" googleEnabled={googleEnabled} />
      </Suspense>
    </div>
  );
}
