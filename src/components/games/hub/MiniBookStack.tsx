/** Tiny standing books for the Bookworm card — reads as spines, not a chart. */
export function MiniBookStack({ className = "" }: { className?: string }) {
  return (
    <div
      className={`games-book-stack flex items-end gap-[3px] ${className}`}
      aria-hidden
    >
      <Book
        height={42}
        width={15}
        cover="#8b5a4a"
        spine="#6e4538"
        lean={-8}
      />
      <Book
        height={50}
        width={16}
        cover="#5b4e8c"
        spine="#9a78c0"
        lean={2}
        delay="0.1s"
      />
      <Book
        height={36}
        width={14}
        cover="#b08fce"
        spine="#a88448"
        lean={7}
        delay="0.2s"
      />
    </div>
  );
}

function Book({
  height,
  width,
  cover,
  spine,
  lean,
  delay,
}: {
  height: number;
  width: number;
  cover: string;
  spine: string;
  lean: number;
  delay?: string;
}) {
  return (
    <span
      className="games-book relative block shrink-0 overflow-hidden rounded-[2px_3px_2px_2px] shadow-[1px_2px_4px_rgba(176,143,206,0.18)]"
      style={{
        height,
        width,
        background: cover,
        transform: `rotate(${lean}deg)`,
        animationDelay: delay,
      }}
    >
      {/* spine edge */}
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: spine }}
      />
      {/* foil band on spine */}
      <span className="absolute top-[28%] left-0 h-[2px] w-full bg-[#342c45]/35" />
      {/* page block on the open edge */}
      <span className="absolute inset-y-[3px] right-0 w-[4px] rounded-r-[1px] bg-[#342c45]">
        <span className="absolute inset-x-0 top-[20%] h-px bg-[#4a425c]" />
        <span className="absolute inset-x-0 top-[40%] h-px bg-[#4a425c]" />
        <span className="absolute inset-x-0 top-[60%] h-px bg-[#4a425c]" />
        <span className="absolute inset-x-0 top-[80%] h-px bg-[#4a425c]" />
      </span>
    </span>
  );
}
