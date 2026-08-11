export function HomeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
    </svg>
  );
}

export function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16.5 16.5 21 21" strokeLinecap="round" />
    </svg>
  );
}

export function BookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <path d="M4 5.5h12a3 3 0 0 1 3 3V19H7a3 3 0 0 0-3 3V5.5Z" strokeLinejoin="round" />
      <path d="M4 19a3 3 0 0 1 3-3h12" strokeLinecap="round" />
    </svg>
  );
}

export function ChartIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <path d="M4 19h16M7 16V9m5 7V5m5 11v-4" strokeLinecap="round" />
    </svg>
  );
}

export function PersonIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5 19.5c1.2-3.2 3.4-4.8 7-4.8s5.8 1.6 7 4.8" strokeLinecap="round" />
    </svg>
  );
}

export function BellIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2H4.5L6 16.5Z" strokeLinejoin="round" />
      <path d="M10 20a2 2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  );
}
