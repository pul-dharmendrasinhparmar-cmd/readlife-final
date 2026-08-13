/** Pip mascot for the games hub card. */
export function CutePip({
  className = "h-14 w-14",
}: {
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/games/bookbound/pip-icon.png"
      alt=""
      className={`games-bb-pip ${className}`}
      draggable={false}
    />
  );
}
