"use client";

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

type Props = {
  onKey: (key: string) => void;
  keyStatuses: Record<string, string>;
};

export default function Keyboard({ onKey, keyStatuses }: Props) {
  return (
    <div className="keyboard">
      {ROWS.map((row, i) => (
        <div className="keyboard-row" key={i}>
          {row.map((key) => {
            const isWide = key === "ENTER" || key === "BACKSPACE";
            const status = keyStatuses[key];
            return (
              <button
                key={key}
                type="button"
                className={`key${isWide ? " wide" : ""}${
                  status ? ` ${status}` : ""
                }`}
                onClick={() => onKey(key)}
              >
                {key === "BACKSPACE" ? "⌫" : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
