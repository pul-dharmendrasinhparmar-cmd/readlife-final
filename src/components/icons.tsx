export function LeafIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      {/* three-leaf sprig */}
      <path d="M12.2 20.5c.15-4.2 1.7-7.4 4.6-9.6 1.9 3.4.9 7.1-1.7 9.2-.8.6-1.9 1-2.9.4Z" />
      <path d="M11.8 20.5c-.15-4.4-1.9-7.7-5.1-9.9-1.8 3.5-.7 7.3 2 9.4.8.6 2 .9 3.1.5Z" />
      <path d="M12 20.2c-.05-5.2.35-9.4 1.9-12.8 1.9 2.6 2.4 6.3 1.3 9.5-.5 1.4-1.7 2.7-3.2 3.3Z" opacity="0.9" />
      <path
        d="M12 20.5V9.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function SparkleIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
      <path d="M8 0c.4 3.2 1.6 5.2 4 6.5C9.6 7.8 8.4 9.8 8 13c-.4-3.2-1.6-5.2-4-6.5C6.4 5.2 7.6 3.2 8 0Z" />
    </svg>
  );
}

export function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.26-2.08 3.57-5.14 3.57-8.64Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.87-3a7.2 7.2 0 0 1-10.78-3.79H1.32v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.3A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.58.4-2.3V6.61H1.32A12 12 0 0 0 0 12c0 1.94.46 3.77 1.32 5.39l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.14 15.24 0 12 0A12 12 0 0 0 1.32 6.61l3.98 3.09A7.18 7.18 0 0 1 12 4.77Z"
      />
    </svg>
  );
}
