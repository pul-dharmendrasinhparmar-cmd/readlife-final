"use client";

type Props = {
  value: number | null;
};

export function CountdownOverlay({ value }: Props) {
  if (value === null) return null;
  const label = value === 0 ? "GO!" : String(value);
  return (
    <div className="bw-countdown" aria-live="assertive">
      <span key={label} className="bw-countdown-num">
        {label}
      </span>
    </div>
  );
}
