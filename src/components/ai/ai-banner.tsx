"use client";

type Props = {
  loading?: boolean;
  error?: string | null;
  showDisclaimer?: boolean;
  className?: string;
};

export function AiBanner({
  loading,
  error,
  showDisclaimer = true,
  className = "",
}: Props) {
  if (!loading && !error && !showDisclaimer) return null;

  return (
    <div className={`space-y-1.5 text-xs ${className}`}>
      {loading ? (
        <p className="font-medium text-muted animate-pulse">Thinking…</p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-[#8a6058]/50 bg-[#4a3532]/60 px-3 py-2 text-[#f0d0c8]">
          {error}
        </p>
      ) : null}
      {showDisclaimer && !loading ? (
        <p className="text-muted">Generated · may be wrong</p>
      ) : null}
    </div>
  );
}

export function AiAssistButton({
  onClick,
  disabled,
  children,
  className = "",
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border border-forest/40 bg-forest/15 px-3 py-1.5 text-xs font-semibold text-forest transition hover:bg-forest/25 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
