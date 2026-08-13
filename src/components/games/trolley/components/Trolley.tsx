"use client";

import { useId } from "react";

type TrolleyProps = {
  x: number;
  celebrate?: boolean;
  reducedMotion?: boolean;
};

export function Trolley({ x, celebrate, reducedMotion }: TrolleyProps) {
  const uid = useId().replace(/:/g, "");

  return (
    <div
      className={`trolley ${celebrate ? "celebrate" : ""} ${reducedMotion ? "no-motion" : ""}`}
      style={{ left: `${x}%` }}
      aria-label="Library trolley"
    >
      <svg
        className="trolley-sprite"
        viewBox="0 0 220 168"
        aria-hidden
      >
        <ellipse
          cx="110"
          cy="158"
          rx="78"
          ry="8"
          fill="#2a2438"
          opacity="0.28"
        />

        {/* handles */}
        <path
          d="M28 46c-10 4-16 14-16 26"
          fill="none"
          stroke="#c45c4a"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M192 46c10 4 16 14 16 26"
          fill="none"
          stroke="#c45c4a"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* frame */}
        <rect
          x="26"
          y="52"
          width="168"
          height="86"
          rx="10"
          fill={`url(#${uid}-body)`}
          stroke="#2a2438"
          strokeWidth="2.4"
        />
        <rect
          x="32"
          y="58"
          width="156"
          height="74"
          rx="7"
          fill="#c9b0e0"
        />

        {/* catch rim */}
        <rect
          x="24"
          y="48"
          width="172"
          height="10"
          rx="4"
          fill="#b08fce"
          stroke="#2a2438"
          strokeWidth="2"
        />
        <rect x="30" y="50.5" width="160" height="3.5" rx="1.5" fill="#f0ddb0" />

        {/* shelf */}
        <rect x="36" y="96" width="148" height="6" rx="2" fill="#b08fce" />

        {/* books — top shelf */}
        <g>
          <rect x="44" y="64" width="16" height="32" rx="1.6" fill="#c45c4a" stroke="#2a2438" strokeWidth="1.2" />
          <rect x="45.4" y="64" width="2.4" height="32" rx="0.7" fill="#b08fce" />
          <rect x="62" y="60" width="18" height="36" rx="1.6" fill="#5b4e8c" stroke="#2a2438" strokeWidth="1.2" />
          <rect x="63.5" y="60" width="2.4" height="36" rx="0.7" fill="#e8c97a" />
          <rect x="82" y="66" width="14" height="30" rx="1.6" fill="#3d5a6c" stroke="#2a2438" strokeWidth="1.2" />
          <rect x="83.3" y="66" width="2" height="30" rx="0.6" fill="#b08fce" />
          <rect x="98" y="62" width="17" height="34" rx="1.6" fill="#8b5a2b" stroke="#2a2438" strokeWidth="1.2" />
          <rect x="99.5" y="62" width="2.2" height="34" rx="0.7" fill="#e8c97a" />
          <rect x="117" y="68" width="13" height="28" rx="1.6" fill="#5c3d2e" stroke="#2a2438" strokeWidth="1.2" />
          <rect x="136" y="63" width="16" height="33" rx="1.6" fill="#4a6b52" stroke="#2a2438" strokeWidth="1.2" />
          <rect x="154" y="67" width="14" height="29" rx="1.6" fill="#b08fce" stroke="#2a2438" strokeWidth="1.2" />
        </g>

        {/* stacked books — lower shelf */}
        <g>
          <rect x="48" y="118" width="36" height="8" rx="1.2" fill="#5b4e8c" stroke="#2a2438" strokeWidth="1" />
          <rect x="52" y="110" width="32" height="8" rx="1.2" fill="#c45c4a" stroke="#2a2438" strokeWidth="1" />
          <rect x="128" y="116" width="40" height="8" rx="1.2" fill="#3d5a6c" stroke="#2a2438" strokeWidth="1" />
          <rect x="132" y="108" width="34" height="8" rx="1.2" fill="#8b5a2b" stroke="#2a2438" strokeWidth="1" />
        </g>

        {/* legs */}
        <rect x="44" y="136" width="8" height="12" rx="2" fill="#9a78c0" />
        <rect x="168" y="136" width="8" height="12" rx="2" fill="#9a78c0" />

        {/* wheels */}
        <g className="trolley-wheels">
          <circle cx="52" cy="150" r="10" fill="#2a2438" />
          <circle cx="52" cy="150" r="4.2" fill="#3a324f" />
          <circle cx="168" cy="150" r="10" fill="#2a2438" />
          <circle cx="168" cy="150" r="4.2" fill="#3a324f" />
        </g>

        <defs>
          <linearGradient
            id={`${uid}-body`}
            x1="26"
            y1="52"
            x2="194"
            y2="138"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4a6b52" />
            <stop offset="1" stopColor="#5b4e8c" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
