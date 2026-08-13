import type { ThemeId } from "../gameConfig";

type Props = { theme: ThemeId };

/** Quiet illustrated hall — shelves stay at the edges so the catch lane stays empty. */
export function LibraryBackdrop({ theme }: Props) {
  return (
    <div className={`lib-scene world-${theme}`} aria-hidden>
      <HallArt />
      {theme !== "default" ? <div className="world-wash" /> : null}
      <div className="lib-playlane" />
      <div className="lib-vignette" />
    </div>
  );
}

function HallArt() {
  const spines = [
    "#c9b0e0",
    "#8b5a2b",
    "#c45c4a",
    "#3d5a6c",
    "#b08fce",
    "#5b4e8c",
    "#5c3d2e",
  ];

  return (
    <svg className="lib-art" viewBox="0 0 400 560" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="trlHallSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2a1c" />
          <stop offset="45%" stopColor="#2a2018" />
          <stop offset="100%" stopColor="#1c1610" />
        </linearGradient>
        <linearGradient id="trlWood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3a2818" />
          <stop offset="100%" stopColor="#2a1c12" />
        </linearGradient>
        <radialGradient id="trlCenter" cx="50%" cy="42%" r="48%">
          <stop offset="0%" stopColor="rgba(50, 36, 24, 0.15)" />
          <stop offset="100%" stopColor="rgba(18, 12, 8, 0)" />
        </radialGradient>
      </defs>

      <rect width="400" height="560" fill="url(#trlHallSky)" />
      <ellipse cx="200" cy="230" rx="130" ry="160" fill="url(#trlCenter)" />

      {/* left shelves — edge only */}
      <rect x="0" y="0" width="78" height="560" fill="url(#trlWood)" />
      <rect x="322" y="0" width="78" height="560" fill="url(#trlWood)" />

      {[0, 1, 2, 3, 4, 5, 6].map((row) => (
        <g key={row}>
          <rect x="6" y={48 + row * 68} width="66" height="7" rx="1.5" fill="#5c3a1a" />
          <rect x="328" y={48 + row * 68} width="66" height="7" rx="1.5" fill="#5c3a1a" />
          {spines.map((color, i) => (
            <rect
              key={`L${row}-${i}`}
              x={10 + i * 8.6}
              y={22 + row * 68 + (i % 3)}
              width="7"
              height={24 - (i % 3) * 2}
              rx="1"
              fill={color}
              opacity="0.55"
            />
          ))}
          {spines.map((color, i) => (
            <rect
              key={`R${row}-${i}`}
              x={332 + i * 8.6}
              y={24 + row * 68 + ((i + 1) % 3)}
              width="7"
              height={22 - (i % 2) * 2}
              rx="1"
              fill={spines[(i + 3) % spines.length]}
              opacity="0.55"
            />
          ))}
        </g>
      ))}

      {/* floor */}
      <ellipse cx="200" cy="520" rx="150" ry="28" fill="#1a120c" opacity="0.45" />
    </svg>
  );
}
