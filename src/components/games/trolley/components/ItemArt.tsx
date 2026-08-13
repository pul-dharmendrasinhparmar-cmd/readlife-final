"use client";

import { useId } from "react";
import { BOOKS, ITEM_META, type ItemKind } from "../gameConfig";

type Props = {
  kind: ItemKind;
  bookId?: string;
};

const INK = "#f6f3fa";
const GOLD = "#d4c4e8";
const PAPER = "#3a324f";
const RUST = "#c45c4a";

const BOOK_FALLBACKS = ["#5b4e8c", "#5c3d2e", "#3d5a6c", "#8b5a2b", "#4a3a2a"];

export function ItemArt({ kind, bookId }: Props) {
  const label = ITEM_META[kind].label;
  const uid = useId().replace(/:/g, "");

  if (
    kind === "book" ||
    kind === "featured" ||
    kind === "golden" ||
    kind === "series"
  ) {
    const book = BOOKS.find((b) => b.id === bookId);
    const color =
      kind === "golden"
        ? GOLD
        : kind === "featured"
          ? "#3d6b4a"
          : (book?.color ??
            BOOK_FALLBACKS[(bookId ?? "x").length % BOOK_FALLBACKS.length]);
    return (
      <svg className={`art-svg art-${kind}`} viewBox="0 0 48 52" aria-hidden>
        <title>{label}</title>
        {kind === "series" ? (
          <SeriesBooks color={color} ink={INK} paper={PAPER} gold={GOLD} />
        ) : (
          <Hardcover
            color={color}
            gold={kind === "golden" || kind === "featured"}
            sparkle={kind === "golden" || kind === "featured"}
            uid={uid}
          />
        )}
      </svg>
    );
  }

  if (kind === "bookmark") {
    return (
      <svg className="art-svg" viewBox="0 0 36 52" aria-hidden>
        <title>{label}</title>
        <path
          d="M10 4h16c1.4 0 2.5 1.1 2.5 2.5v41L18 40.5 7.5 47.5V6.5C7.5 5.1 8.6 4 10 4Z"
          fill={RUST}
          stroke={INK}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M12.5 10h11M12.5 16h11M12.5 22h8"
          stroke={PAPER}
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    );
  }

  if (kind === "glasses") {
    return (
      <svg className="art-svg" viewBox="0 0 52 32" aria-hidden>
        <title>{label}</title>
        <circle
          cx="16"
          cy="18"
          r="11"
          fill={PAPER}
          fillOpacity="0.45"
          stroke={GOLD}
          strokeWidth="2.4"
        />
        <circle
          cx="36"
          cy="18"
          r="11"
          fill={PAPER}
          fillOpacity="0.45"
          stroke={GOLD}
          strokeWidth="2.4"
        />
        <path
          d="M27 18h-2"
          stroke={GOLD}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M5 16.5c-2-.8-3.5-1-4.5-.4M47 16.5c2-.8 3.5-1 4.5-.4"
          stroke={GOLD}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (kind === "card") {
    return (
      <svg className="art-svg" viewBox="0 0 52 36" aria-hidden>
        <title>{label}</title>
        <rect
          x="3"
          y="4"
          width="46"
          height="28"
          rx="4"
          fill={PAPER}
          stroke={INK}
          strokeWidth="1.7"
        />
        <rect x="3" y="4" width="46" height="7" rx="4" fill="#5b4e8c" />
        <rect x="3" y="8" width="46" height="3" fill="#5b4e8c" />
        <circle cx="14" cy="22" r="5.2" fill={GOLD} />
        <path
          d="M22 18.5h18M22 23.5h14"
          stroke={INK}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.35"
        />
      </svg>
    );
  }

  if (kind === "bulb") {
    return (
      <svg className="art-svg art-bulb-glow" viewBox="0 0 40 52" aria-hidden>
        <title>{label}</title>
        <circle cx="20" cy="20" r="14" fill="#f6e2a4" opacity="0.45" />
        <path
          d="M20 6c7.2 0 13 5.6 13 12.6 0 4.6-2.5 8.6-6.2 10.7v4.2H13.2v-4.2C9.5 27.2 7 23.2 7 18.6 7 11.6 12.8 6 20 6Z"
          fill="#f6e2a4"
          stroke={INK}
          strokeWidth="1.7"
        />
        <rect
          x="14"
          y="34"
          width="12"
          height="8"
          rx="1.4"
          fill="#4a425c"
          stroke={INK}
          strokeWidth="1.4"
        />
        <path
          d="M16 37.5h8M16 40.5h8"
          stroke={INK}
          strokeWidth="1.1"
          opacity="0.4"
        />
      </svg>
    );
  }

  if (kind === "coffee") {
    return (
      <svg className="art-svg" viewBox="0 0 48 48" aria-hidden>
        <title>{label}</title>
        <path
          d="M8 22c1 10 4 18 16 18s15-8 16-18"
          fill="#6b4630"
          stroke={INK}
          strokeWidth="1.5"
          opacity="0.9"
        />
        <path
          d="M10 16h22c1.2 8.5-1.5 18-11 18S8.8 24.5 10 16Z"
          fill={PAPER}
          stroke={INK}
          strokeWidth="1.7"
        />
        <path
          d="M32 18c6 .5 8 4 7 8s-5 6-8 5"
          fill="none"
          stroke={INK}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <ellipse cx="21" cy="16.2" rx="10" ry="3.2" fill="#4a3220" />
        <path
          d="M4 10c4 6 8 4 11 9"
          fill="none"
          stroke="#6b4630"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="7" cy="8" r="2.2" fill="#6b4630" />
        <HazardDot x={40} y={8} />
      </svg>
    );
  }

  if (kind === "cake") {
    return (
      <svg className="art-svg" viewBox="0 0 48 46" aria-hidden>
        <title>{label}</title>
        <path
          d="M8 24h32l-3 14H11Z"
          fill="#e8c4a8"
          stroke={INK}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9 18h30l1 6H8Z"
          fill="#e8b4a0"
          stroke={INK}
          strokeWidth="1.6"
        />
        <path
          d="M12 12h24l3 6H9Z"
          fill={PAPER}
          stroke={INK}
          strokeWidth="1.6"
        />
        <circle cx="18" cy="10" r="2.4" fill={RUST} />
        <circle cx="24" cy="8.5" r="2.2" fill="#c9b0e0" />
        <circle cx="30" cy="10" r="2.3" fill={GOLD} />
        <HazardDot x={40} y={7} />
      </svg>
    );
  }

  if (kind === "cookie") {
    return (
      <svg className="art-svg" viewBox="0 0 46 46" aria-hidden>
        <title>{label}</title>
        <circle cx="22" cy="24" r="16" fill="#d4a05a" stroke={INK} strokeWidth="1.7" />
        <circle cx="22" cy="24" r="12.5" fill="#e8b84a" />
        <circle cx="16" cy="20" r="2" fill="#5c3d2e" />
        <circle cx="26" cy="18" r="1.7" fill="#5c3d2e" />
        <circle cx="20" cy="28" r="2.1" fill="#5c3d2e" />
        <circle cx="28" cy="27" r="1.6" fill="#5c3d2e" />
        <HazardDot x={38} y={8} />
      </svg>
    );
  }

  if (kind === "torn") {
    return (
      <svg className="art-svg" viewBox="0 0 40 50" aria-hidden>
        <title>{label}</title>
        <path
          d="M8 4h24v20l-5 4 5 4v14H8Z"
          fill={PAPER}
          stroke={INK}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M14 14h14M14 21h10M14 36h12"
          stroke={INK}
          strokeWidth="1.3"
          opacity="0.28"
          strokeLinecap="round"
        />
        <HazardDot x={33} y={7} />
      </svg>
    );
  }

  if (kind === "water") {
    return (
      <svg className="art-svg" viewBox="0 0 36 48" aria-hidden>
        <title>{label}</title>
        <path
          d="M18 4c8 12 14 20 14 28a14 14 0 1 1-28 0c0-8 6-16 14-28Z"
          fill="#6a9bb8"
          stroke={INK}
          strokeWidth="1.6"
        />
        <path
          d="M13 30c1.5 4 8 5 11 1"
          fill="none"
          stroke={PAPER}
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.55"
        />
        <HazardDot x={28} y={8} />
      </svg>
    );
  }

  if (kind === "notify") {
    return (
      <svg className="art-svg" viewBox="0 0 36 52" aria-hidden>
        <title>{label}</title>
        <rect
          x="8"
          y="6"
          width="20"
          height="38"
          rx="4"
          fill="#2a2438"
          stroke={INK}
          strokeWidth="1.6"
        />
        <rect x="11" y="10" width="14" height="24" rx="1.4" fill="#7a9a86" />
        <circle cx="18" cy="38.5" r="1.6" fill={PAPER} opacity="0.5" />
        <HazardDot x={28} y={8} />
      </svg>
    );
  }

  if (kind === "spoiler") {
    return (
      <svg className="art-svg" viewBox="0 0 44 44" aria-hidden>
        <title>{label}</title>
        <rect
          x="4"
          y="4"
          width="36"
          height="36"
          rx="7"
          fill={PAPER}
          stroke={INK}
          strokeWidth="1.7"
        />
        <text
          x="22"
          y="30"
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fill={RUST}
          fontFamily="Georgia, serif"
        >
          !
        </text>
      </svg>
    );
  }

  return (
    <svg className="art-svg" viewBox="0 0 48 40" aria-hidden>
      <title>{label}</title>
      <circle cx="18" cy="22" r="12" fill="#c4b89a" opacity="0.85" />
      <circle cx="30" cy="16" r="9" fill="#d4c8a8" opacity="0.8" />
      <circle cx="34" cy="26" r="7" fill="#b8aa88" opacity="0.75" />
      <HazardDot x={40} y={8} />
    </svg>
  );
}

function Hardcover({
  color,
  gold,
  sparkle,
  uid,
}: {
  color: string;
  gold: boolean;
  sparkle: boolean;
  uid: string;
}) {
  return (
    <g>
      <path
        d="M10 8h22c1.4 0 2.5 1.1 2.5 2.5v33c0 1.4-1.1 2.5-2.5 2.5H10V8Z"
        fill={`url(#${uid}-cover)`}
        stroke={INK}
        strokeWidth="1.6"
      />
      <path d="M10 8v38" stroke={GOLD} strokeWidth="3.2" strokeLinecap="round" />
      <path
        d="M34.5 10.2 40 12.4v29.2l-5.5 2.2V10.2Z"
        fill={PAPER}
        stroke={INK}
        strokeWidth="1.4"
      />
      <rect
        x="16"
        y="14"
        width="12"
        height="18"
        rx="1.2"
        fill="none"
        stroke={gold ? GOLD : PAPER}
        strokeWidth="1.2"
        opacity="0.7"
      />
      {gold ? (
        <path
          d="M22 18.5c2.2 1.4 2.2 6.6 0 8.2-2.2-1.6-2.2-6.8 0-8.2Z"
          fill={GOLD}
          opacity="0.9"
        />
      ) : (
        <path
          d="M18 32h8"
          stroke={PAPER}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.55"
        />
      )}
      {sparkle ? (
        <>
          <path
            d="M38 8l.7 1.7 1.7.7-1.7.7L38 12.8l-.7-1.7-1.7-.7 1.7-.7Z"
            fill={GOLD}
            className="art-shine"
          />
          <circle cx="14" cy="12" r="1.1" fill={GOLD} className="art-shine" />
        </>
      ) : null}
      <defs>
        <linearGradient id={`${uid}-cover`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={color} />
          <stop offset="1" stopColor={INK} stopOpacity="0.28" />
        </linearGradient>
      </defs>
    </g>
  );
}

function SeriesBooks({
  color,
  ink,
  paper,
  gold,
}: {
  color: string;
  ink: string;
  paper: string;
  gold: string;
}) {
  return (
    <g>
      <rect x="6" y="16" width="12" height="28" rx="1.6" fill="#5c3d2e" stroke={ink} strokeWidth="1.4" />
      <rect x="18" y="10" width="13" height="34" rx="1.6" fill={color} stroke={ink} strokeWidth="1.4" />
      <rect x="31" y="14" width="11" height="30" rx="1.6" fill="#3d5a6c" stroke={ink} strokeWidth="1.4" />
      <rect x="8" y="16" width="2" height="28" rx="0.6" fill={gold} />
      <rect x="20" y="10" width="2.2" height="34" rx="0.6" fill={gold} />
      <rect x="32.4" y="14" width="1.8" height="30" rx="0.6" fill={gold} />
      <path d="M22 18h7M22 23h6" stroke={paper} strokeWidth="1.1" opacity="0.45" />
    </g>
  );
}

function HazardDot({ x, y }: { x: number; y: number }) {
  return (
    <g className="art-hazard" transform={`translate(${x} ${y})`}>
      <circle r="6.2" fill={RUST} stroke={INK} strokeWidth="1.2" />
      <path
        d="M0 -2.6v3.4"
        stroke={PAPER}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cy="3.4" r="0.85" fill={PAPER} />
    </g>
  );
}
