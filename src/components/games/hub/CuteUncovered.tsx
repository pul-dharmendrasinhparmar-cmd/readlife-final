/** Cute Uncovered mascot — a hardcover with the middle of the art hidden. */
export function CuteUncovered({
  className = "h-11 w-11",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`games-unc-icon ${className}`}
      aria-hidden
      fill="none"
    >
      <ellipse cx="33" cy="56.5" rx="16" ry="3.1" fill="#5b4e8c" opacity="0.12" />

      <g className="games-unc-book">
        {/* page block on the open edge */}
        <rect x="43.2" y="13.2" width="6.2" height="36.4" rx="1.2" fill="#f4ead8" />
        <path
          d="M44.4 17.2h4.2M44.4 21.4h4.2M44.4 25.6h4.2M44.4 29.8h4.2M44.4 34h4.2M44.4 38.2h4.2M44.4 42.4h4.2M44.4 46.4h4.2"
          stroke="#4a425c"
          strokeWidth="0.7"
          strokeLinecap="round"
        />

        {/* hardcover */}
        <rect x="15.5" y="11" width="29.5" height="40.5" rx="3.4" fill="#16343e" />
        <rect x="18.6" y="13.4" width="23.6" height="35.6" rx="2" fill="url(#uncSky)" />

        {/* spine */}
        <rect x="15.5" y="11" width="4.2" height="40.5" rx="2" fill="#b08fce" />
        <rect x="16.4" y="13.2" width="1.5" height="36" rx="0.6" fill="#f4ead8" opacity="0.35" />

        {/* cover art: moon on top */}
        <circle cx="27.2" cy="16.4" r="0.7" fill="#f7ecd0" />
        <circle cx="37.6" cy="18.2" r="0.45" fill="#f7ecd0" opacity="0.85" />
        <circle cx="34.8" cy="15.2" r="0.35" fill="#f7ecd0" opacity="0.7" />
        <circle cx="30.6" cy="23.4" r="6.2" fill="#f6e2a4" />
        <circle cx="28.6" cy="21.4" r="1.7" fill="#fff6d8" opacity="0.5" />
        <ellipse cx="28.2" cy="24.8" rx="1.15" ry="0.8" fill="#e8b4a0" opacity="0.8" />
        <ellipse cx="33.2" cy="24.8" rx="1.15" ry="0.8" fill="#e8b4a0" opacity="0.8" />
        <path
          d="M27.9 22.5c.4.65 1.1.65 1.5 0"
          stroke="#2a2438"
          strokeWidth="0.85"
          strokeLinecap="round"
        />
        <path
          d="M31.8 22.5c.4.65 1.1.65 1.5 0"
          stroke="#2a2438"
          strokeWidth="0.85"
          strokeLinecap="round"
        />
        <path
          d="M29 26c.75.75 2.1.75 2.85 0"
          stroke="#2a2438"
          strokeWidth="0.8"
          strokeLinecap="round"
        />

        {/* cover art: hill at the bottom */}
        <path
          d="M18.6 42.2c3.6-4.4 8-6.4 12.6-5.6 4.2.7 7.2 3.2 8.4 5.6 0 2.4-1.4 4.6-3.4 4.6H22c-2 0-3.4-2.2-3.4-4.6Z"
          fill="#3d7a6a"
        />
        <circle cx="36.8" cy="44.8" r="0.45" fill="#f7ecd0" opacity="0.7" />

        {/* middle of the cover hidden */}
        <g className="games-unc-veil">
          <rect
            x="17.6"
            y="27.2"
            width="25.4"
            height="12.4"
            rx="2.2"
            fill="#3a324f"
          />
          <rect
            x="17.6"
            y="27.2"
            width="25.4"
            height="12.4"
            rx="2.2"
            stroke="#4a425c"
            strokeWidth="0.8"
          />
          <path
            d="M20.4 31.2h6.8M20.4 35.6h5.2"
            stroke="#3f3654"
            strokeWidth="1.15"
            strokeLinecap="round"
          />
          <path
            d="M28.4 31.4c0-2.2 1.7-3.6 3.6-3.6 1.9 0 3.5 1.3 3.5 3.3 0 1.6-.9 2.4-2.2 3.1-.8.5-1.3 1.1-1.3 2"
            stroke="#5b4e8c"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <circle cx="32" cy="37.6" r="1.15" fill="#5b4e8c" />
          {/* tiny peel at the right so it reads as a cover, not a sticker */}
          <path
            d="M40.4 27.4c1.6.1 2.8.8 3.4 2.1.4.9-.1 1.7-1.1 1.7-1.4 0-2.6-.9-3.3-2-.5-.7-.1-1.7 1-1.8Z"
            fill="#3f3654"
          />
        </g>
      </g>

      <g className="games-unc-spark">
        <path
          d="M52.2 18.2l.65 1.55 1.55.65-1.55.65-.65 1.55-.65-1.55-1.55-.65 1.55-.65z"
          fill="#b08fce"
        />
        <path
          d="M11.8 24.5l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4z"
          fill="#b08fce"
          opacity="0.85"
        />
        <circle cx="50.6" cy="32.5" r="1" fill="#e8c97a" />
      </g>

      <defs>
        <linearGradient
          id="uncSky"
          x1="18"
          y1="14"
          x2="42"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4d8a96" />
          <stop offset="0.55" stopColor="#2a5a68" />
          <stop offset="1" stopColor="#1a3a44" />
        </linearGradient>
      </defs>
    </svg>
  );
}
