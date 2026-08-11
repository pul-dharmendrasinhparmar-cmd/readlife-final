"use client";

import type { ReactNode } from "react";

export function BookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <path d="M4 5.5h12a3 3 0 0 1 3 3V19H7a3 3 0 0 0-3 3V5.5Z" strokeLinejoin="round" />
      <path d="M4 19a3 3 0 0 1 3-3h12" strokeLinecap="round" />
    </svg>
  );
}
export function BookOpenIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <path d="M12 6.5c-2-1.5-5-2-8-1.5V18c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5Z" strokeLinejoin="round" />
    </svg>
  );
}
export function ClockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function PlusBookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <path d="M5 5.5h10a3 3 0 0 1 3 3V19H8a3 3 0 0 0-3 3V5.5Z" strokeLinejoin="round" />
      <path d="M12 9v5M9.5 11.5h5" strokeLinecap="round" />
    </svg>
  );
}
export function QuoteIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M7.2 17c-1.9 0-3.4-1.5-3.4-3.5 0-2.6 2-4.8 4.4-6.2l.8 1.2C7.4 9.5 6.4 10.8 6.2 12h1.6c1.2 0 2.2 1 2.2 2.3S9 17 7.2 17Zm9.2 0c-1.9 0-3.4-1.5-3.4-3.5 0-2.6 2-4.8 4.4-6.2l.8 1.2c-1.6 1-2.6 2.3-2.8 3.5h1.6c1.2 0 2.2 1 2.2 2.3S17.6 17 16.4 17Z" />
    </svg>
  );
}
export function PeopleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <circle cx="9" cy="8" r="3" />
      <circle cx="16.5" cy="9" r="2.5" />
      <path d="M3.5 19c.8-3 2.8-4.5 5.5-4.5s4.7 1.5 5.5 4.5M14 14.5c1.7 0 3.2.7 4 2.5" strokeLinecap="round" />
    </svg>
  );
}
export function StarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <path d="m12 3.5 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.8 7.2 18.4l.9-5.4-3.9-3.8 5.4-.8L12 3.5Z" strokeLinejoin="round" />
    </svg>
  );
}
export function WindowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M12 4v16M4 12h16" strokeLinecap="round" />
    </svg>
  );
}
export function JournalIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <path d="M7 4h10a2 2 0 0 1 2 2v14l-3-1.5L13 20l-3-1.5L7 20V6a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
      <path d="M10 8h5M10 11h5" strokeLinecap="round" />
    </svg>
  );
}
export function CartIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <path d="M3.5 5h1.8l1.4 10.2a1.5 1.5 0 0 0 1.5 1.3h8.7a1.5 1.5 0 0 0 1.5-1.2L20 8H7" strokeLinejoin="round" />
      <circle cx="9.5" cy="19.5" r="1.2" />
      <circle cx="16.5" cy="19.5" r="1.2" />
    </svg>
  );
}
export function ChairIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <path d="M7 10V6.5A2.5 2.5 0 0 1 9.5 4h5A2.5 2.5 0 0 1 17 6.5V10" strokeLinecap="round" />
      <path d="M5 14h14v2.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 16.5V14Z" strokeLinejoin="round" />
      <path d="M7 18v2M17 18v2M5 14l1-4h12l1 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function MailIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="m4 8 8 5 8-5" strokeLinejoin="round" />
    </svg>
  );
}
export function PetIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <circle cx="12" cy="13" r="5" />
      <circle cx="7" cy="8" r="1.6" />
      <circle cx="17" cy="8" r="1.6" />
      <circle cx="5.5" cy="12" r="1.4" />
      <circle cx="18.5" cy="12" r="1.4" />
    </svg>
  );
}
export function FlameIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 3c1.5 3 1 5.5-.5 7 2.5-.5 4.5 1.2 4.5 4 0 3.3-2.5 6-6 6s-6-2.7-6-6c0-2.4 1.2-4.2 2.5-5.5C8 10 9 7.5 12 3Z" opacity="0.9" />
    </svg>
  );
}
export function PlantIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden>
      <path d="M12 14c0-4 2.5-7 6-8-1 4-3 6.5-6 8Z" strokeLinejoin="round" />
      <path d="M12 14c0-4-2.5-7-6-8 1 4 3 6.5 6 8Z" strokeLinejoin="round" />
      <path d="M12 14v4M9 21h6l-1-3H10l-1 3Z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
export function CloseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

export function StatRow({
  icon: Icon,
  value,
  label,
}: {
  icon: (props: { className?: string }) => ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#efe4d4] text-forest">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-sm text-forest">
        <span className="font-serif text-lg font-semibold">{value}</span>{" "}
        <span className="text-muted">{label}</span>
      </p>
    </div>
  );
}
