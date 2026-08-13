/** Soft SVG bookish accents that blend into the page — not pasted screenshots. */

export function VineAccent({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 320"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M58 312c2-48 14-86 34-118"
        stroke="#c9b0e0"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M58 312c-8-52-28-92-48-124"
        stroke="#5b4e8c"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
      {[
        [78, 210, 18, -20],
        [88, 188, 16, 18],
        [70, 168, 14, -16],
        [40, 220, 15, 18],
        [28, 198, 13, -14],
        [52, 150, 12, 14],
        [62, 128, 11, -12],
        [48, 108, 10, 12],
        [58, 88, 10, -10],
        [50, 68, 9, 10],
      ].map(([cx, cy, rx, rot], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={rx * 0.55}
          transform={`rotate(${rot} ${cx} ${cy})`}
          fill={i % 2 ? "#c9b0e0" : "#5b4e8c"}
          opacity={0.35 + (i % 3) * 0.08}
        />
      ))}
    </svg>
  );
}

export function BooksStackAccent({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 110" className={className} aria-hidden>
      <rect x="18" y="62" width="120" height="18" rx="2" fill="#5c3d2e" opacity="0.85" />
      <rect x="14" y="44" width="128" height="18" rx="2" fill="#5b4e8c" opacity="0.88" />
      <rect x="22" y="26" width="112" height="18" rx="2" fill="#7a4a3a" opacity="0.85" />
      <rect x="20" y="28" width="3" height="14" fill="#b08fce" opacity="0.5" />
      <rect x="16" y="46" width="3" height="14" fill="#b08fce" opacity="0.45" />
      <rect x="20" y="64" width="3" height="14" fill="#b08fce" opacity="0.4" />
      {/* tiny plant */}
      <path
        d="M78 26c0-14 8-22 16-24-2 10-6 16-16 24Z"
        fill="#c9b0e0"
        opacity="0.7"
      />
      <path
        d="M78 26c0-12-8-20-16-22 2 10 6 14 16 22Z"
        fill="#5b4e8c"
        opacity="0.65"
      />
    </svg>
  );
}

export function LampAccent({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 140" className={className} aria-hidden>
      <path d="M50 8v28" stroke="#5c4a32" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M28 40c4-14 14-22 22-22s18 8 22 22H28Z"
        fill="#5b4e8c"
        opacity="0.85"
      />
      <ellipse cx="50" cy="40" rx="24" ry="5" fill="#b08fce" opacity="0.35" />
      <path
        d="M36 40c2 18 6 36 8 52"
        stroke="#5c4a32"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <ellipse cx="50" cy="98" rx="22" ry="6" fill="#6b5340" opacity="0.35" />
      <rect x="42" y="92" width="16" height="8" rx="1" fill="#5c4a32" opacity="0.7" />
    </svg>
  );
}
