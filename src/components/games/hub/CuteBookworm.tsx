/** Cute bookworm mascot — matches the in-game worm (sage green + glasses). */
export function CuteBookworm({
  className = "h-10 w-10",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden
      fill="none"
    >
      {/* soft ground shadow */}
      <ellipse cx="32" cy="56" rx="18" ry="4" fill="#5b4e8c" opacity="0.12" />

      {/* body segments */}
      <ellipse cx="18" cy="40" rx="9" ry="8" fill="#3d6b4a" />
      <ellipse cx="28" cy="36" rx="10" ry="9" fill="#4f845c" />
      <ellipse cx="38" cy="32" rx="10" ry="9.5" fill="#5a8f68" />

      {/* head */}
      <ellipse cx="48" cy="26" rx="11" ry="10.5" fill="url(#bwHead)" />

      {/* cheeks */}
      <ellipse cx="42.5" cy="28.5" rx="2.2" ry="1.6" fill="#e8b4a0" opacity="0.7" />
      <ellipse cx="53.5" cy="28.5" rx="2.2" ry="1.6" fill="#e8b4a0" opacity="0.7" />

      {/* glasses */}
      <circle cx="44" cy="24" r="4.2" stroke="#b08fce" strokeWidth="1.6" fill="#3a324f" fillOpacity="0.35" />
      <circle cx="52.5" cy="24" r="4.2" stroke="#b08fce" strokeWidth="1.6" fill="#3a324f" fillOpacity="0.35" />
      <path d="M48.2 24h.6" stroke="#b08fce" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M39.8 23.2h-1.6" stroke="#b08fce" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M56.7 23.2h1.6" stroke="#b08fce" strokeWidth="1.3" strokeLinecap="round" />

      {/* eyes */}
      <circle cx="44" cy="24.2" r="1.35" fill="#2a2438" />
      <circle cx="52.5" cy="24.2" r="1.35" fill="#2a2438" />
      <circle cx="44.45" cy="23.7" r="0.4" fill="#3a324f" />
      <circle cx="52.95" cy="23.7" r="0.4" fill="#3a324f" />

      {/* smile */}
      <path
        d="M45.5 30.2c1.4 1.6 3.8 1.6 5.2 0"
        stroke="#5b4e8c"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* tiny book under chin */}
      <g transform="translate(34 38) rotate(-18)">
        <rect x="0" y="0" width="11" height="8" rx="1.2" fill="#8b5a4a" />
        <rect x="1.2" y="0.8" width="1.2" height="6.4" rx="0.4" fill="#b08fce" opacity="0.85" />
        <rect x="3" y="1.2" width="6.8" height="5.6" rx="0.6" fill="#342c45" />
      </g>

      <defs>
        <linearGradient id="bwHead" x1="40" y1="16" x2="56" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7faf88" />
          <stop offset="0.5" stopColor="#5a8f68" />
          <stop offset="1" stopColor="#5b4e8c" />
        </linearGradient>
      </defs>
    </svg>
  );
}
