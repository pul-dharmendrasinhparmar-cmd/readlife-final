"use client";

import { useId } from "react";
import "./pieces-icon.css";

type Props = {
  className?: string;
};

const L = 8;
const MX = 26;
const R = 44;
const T = 10;
const MY = 34;
const B = 58;

const PATH = {
  nw: [
    `M ${L} ${T}`,
    `L ${MX} ${T}`,
    vTab(MX, (T + MY) / 2, 1, true),
    `L ${MX} ${MY}`,
    hTab(MY, (L + MX) / 2, -1, false),
    `L ${L} ${MY}`,
    "Z",
  ].join(" "),
  ne: [
    `M ${MX} ${T}`,
    `L ${R} ${T}`,
    `L ${R} ${MY}`,
    hTab(MY, (MX + R) / 2, 1, false),
    `L ${MX} ${MY}`,
    vTab(MX, (T + MY) / 2, 1, false),
    "Z",
  ].join(" "),
  sw: [
    `M ${L} ${MY}`,
    hTab(MY, (L + MX) / 2, -1, true),
    `L ${MX} ${MY}`,
    vTab(MX, (MY + B) / 2, 1, true),
    `L ${MX} ${B}`,
    `L ${L} ${B}`,
    "Z",
  ].join(" "),
  se: [
    `M ${MX} ${MY}`,
    hTab(MY, (MX + R) / 2, 1, true),
    `L ${R} ${MY}`,
    `L ${R} ${B}`,
    `L ${MX} ${B}`,
    vTab(MX, (MY + B) / 2, 1, false),
    "Z",
  ].join(" "),
};

/** A tiny unfinished cover puzzle: three pieces seated, one lifted aside. */
export function PiecesIcon({ className }: Props) {
  const raw = useId().replace(/:/g, "");
  const art = `${raw}-art`;
  const clipNw = `${raw}-nw`;
  const clipNe = `${raw}-ne`;
  const clipSw = `${raw}-sw`;
  const clipSe = `${raw}-se`;

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient
          id={art}
          x1="10"
          y1="10"
          x2="42"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#7eb3bb" />
          <stop offset="55%" stopColor="#4d7d88" />
          <stop offset="100%" stopColor="#355a64" />
        </linearGradient>
        <clipPath id={clipNw}>
          <path d={PATH.nw} />
        </clipPath>
        <clipPath id={clipNe}>
          <path d={PATH.ne} />
        </clipPath>
        <clipPath id={clipSw}>
          <path d={PATH.sw} />
        </clipPath>
        <clipPath id={clipSe}>
          <path d={PATH.se} />
        </clipPath>
      </defs>

      <ellipse cx="30" cy="59.6" rx="16" ry="2.6" fill="#5b4e8c" opacity="0.1" />

      <rect
        x={MX + 0.8}
        y={MY + 0.8}
        width={R - MX - 1.6}
        height={B - MY - 1.6}
        rx="1.4"
        fill="#3f3654"
      />

      <Piece
        d={PATH.nw}
        clip={`url(#${clipNw})`}
        art={art}
        className="pcs-icon-p pcs-icon-p1"
      />
      <Piece
        d={PATH.ne}
        clip={`url(#${clipNe})`}
        art={art}
        className="pcs-icon-p pcs-icon-p2"
      />
      <Piece
        d={PATH.sw}
        clip={`url(#${clipSw})`}
        art={art}
        className="pcs-icon-p pcs-icon-p3"
      />
      <g className="pcs-icon-p pcs-icon-p4">
        <Piece d={PATH.se} clip={`url(#${clipSe})`} art={art} />
      </g>

      <path
        className="pcs-icon-spark"
        d="M53 15.6l.55 1.35 1.35.55-1.35.55-.55 1.35-.55-1.35-1.35-.55 1.35-.55z"
        fill="#b08fce"
      />
    </svg>
  );
}

function Piece({
  d,
  clip,
  art,
  className,
}: {
  d: string;
  clip: string;
  art: string;
  className?: string;
}) {
  return (
    <g className={className}>
      <path d={d} fill="#3a324f" />
      <g clipPath={clip}>
        <CoverArt art={art} />
      </g>
      <path
        d={d}
        fill="none"
        stroke="#3a324f"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d={d}
        fill="none"
        stroke="#d9cbb8"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
    </g>
  );
}

function CoverArt({ art }: { art: string }) {
  return (
    <>
      <rect x={L} y={T} width={R - L} height={B - T} fill={`url(#${art})`} />
      <rect x={L} y={T} width="3.2" height={B - T} fill="#b08fce" />
      <rect
        x={L + 0.85}
        y={T + 2.2}
        width="1.1"
        height={B - T - 4.4}
        rx="0.5"
        fill="#f4ead8"
        opacity="0.4"
      />
      <circle cx="17" cy="15.4" r="0.5" fill="#f7ecd0" />
      <circle cx="38.4" cy="17.2" r="0.38" fill="#f7ecd0" opacity="0.85" />
      <circle cx="21.2" cy="19" r="0.3" fill="#f7ecd0" opacity="0.7" />
      <circle cx={MX} cy="22.4" r="6.15" fill="#f6e2a4" />
      <circle cx={MX - 1.85} cy="20.7" r="1.45" fill="#fff6d8" opacity="0.5" />
      <ellipse cx={MX - 2} cy="23.15" rx="1.05" ry="0.72" fill="#e8b4a0" opacity="0.8" />
      <ellipse cx={MX + 2} cy="23.15" rx="1.05" ry="0.72" fill="#e8b4a0" opacity="0.8" />
      <path
        d={`M${MX - 2.4} 21.15c.35.55 1 .55 1.35 0`}
        stroke="#2a2438"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
      <path
        d={`M${MX + 1.05} 21.15c.35.55 1 .55 1.35 0`}
        stroke="#2a2438"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
      <path
        d={`M${MX - 1.35} 24.35c.7.7 2 .7 2.7 0`}
        stroke="#2a2438"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
      <path
        d={`M${L} 50.2c6-7 14-10 22-8 7 1.6 11 5.5 14 8v7.8H${L}Z`}
        fill="#4f8f7c"
      />
    </>
  );
}

function vTab(x: number, cy: number, dir: 1 | -1, down: boolean): string {
  const s = down ? 1 : -1;
  const n = 4.65;
  const pinch = 1.8;
  const depth = 6.7;
  const knob = 4.25;
  const y0 = cy - s * n;
  const y1 = cy + s * n;
  const nx = x + dir * pinch;
  const kx = x + dir * depth;
  return [
    `L ${x} ${y0}`,
    `C ${x} ${y0 + s * 1.05} ${nx} ${cy - s * 2.5} ${nx} ${cy - s * 1.1}`,
    `C ${nx} ${cy - s * knob} ${kx} ${cy - s * knob} ${kx} ${cy}`,
    `C ${kx} ${cy + s * knob} ${nx} ${cy + s * knob} ${nx} ${cy + s * 1.1}`,
    `C ${nx} ${cy + s * 2.5} ${x} ${y1 - s * 1.05} ${x} ${y1}`,
  ].join(" ");
}

function hTab(y: number, cx: number, dir: 1 | -1, right: boolean): string {
  const s = right ? 1 : -1;
  const n = 4.65;
  const pinch = 1.8;
  const depth = 6.7;
  const knob = 4.25;
  const x0 = cx - s * n;
  const x1 = cx + s * n;
  const ny = y + dir * pinch;
  const ky = y + dir * depth;
  return [
    `L ${x0} ${y}`,
    `C ${x0 + s * 1.05} ${y} ${cx - s * 2.5} ${ny} ${cx - s * 1.1} ${ny}`,
    `C ${cx - s * knob} ${ny} ${cx - s * knob} ${ky} ${cx} ${ky}`,
    `C ${cx + s * knob} ${ky} ${cx + s * knob} ${ny} ${cx + s * 1.1} ${ny}`,
    `C ${cx + s * 2.5} ${ny} ${x1 - s * 1.05} ${y} ${x1} ${y}`,
  ].join(" ");
}
