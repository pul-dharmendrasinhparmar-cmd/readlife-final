/** Cute library trolley mascot for the games hub. */
export function CuteTrolley({
  className = "h-11 w-11",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`games-trl-icon ${className}`}
      aria-hidden
      fill="none"
    >
      <ellipse cx="32" cy="58" rx="16" ry="3.2" fill="#5b4e8c" opacity="0.12" />

      <g className="games-trl-cart">
        <rect x="14" y="28" width="36" height="18" rx="3.2" fill="#b08fce" />
        <rect x="15.5" y="29.4" width="33" height="15" rx="2.2" fill="#e8c97a" />
        <path d="M16 28.5h32" stroke="#8b6a2e" strokeWidth="1.2" />

        {/* books in the cart */}
        <rect x="19" y="18" width="7" height="16" rx="1.2" fill="#5b4e8c" />
        <rect x="19" y="18" width="1.6" height="16" rx="0.6" fill="#b08fce" />
        <rect x="27" y="14" width="7.4" height="20" rx="1.2" fill="#c45c4a" />
        <rect x="27" y="14" width="1.6" height="20" rx="0.6" fill="#e8c97a" />
        <rect x="35.5" y="17" width="6.6" height="17" rx="1.2" fill="#3d5a6c" />
        <rect x="35.5" y="17" width="1.5" height="17" rx="0.6" fill="#b08fce" />

        {/* kawaii face on the gold cart */}
        <ellipse cx="27.5" cy="37.2" rx="1.15" ry="1.35" fill="#2a2438" />
        <ellipse cx="36.5" cy="37.2" rx="1.15" ry="1.35" fill="#2a2438" />
        <path
          d="M30.2 40.2c1.1 1.15 2.5 1.15 3.6 0"
          stroke="#2a2438"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <ellipse
          cx="25.4"
          cy="39.4"
          rx="1.4"
          ry="0.85"
          fill="#e8b4a0"
          opacity="0.85"
        />
        <ellipse
          cx="38.6"
          cy="39.4"
          rx="1.4"
          ry="0.85"
          fill="#e8b4a0"
          opacity="0.85"
        />
      </g>

      <g className="games-trl-wheels">
        <circle cx="22" cy="50.5" r="5.2" fill="#5b4e8c" />
        <circle cx="22" cy="50.5" r="2.1" fill="#3a324f" />
        <circle cx="42" cy="50.5" r="5.2" fill="#5b4e8c" />
        <circle cx="42" cy="50.5" r="2.1" fill="#3a324f" />
      </g>

      <path
        d="M48 22l.55 1.35 1.35.55-1.35.55L48 25.8l-.55-1.35-1.35-.55 1.35-.55z"
        fill="#b08fce"
        className="games-trl-spark"
      />
    </svg>
  );
}
