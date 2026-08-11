"use client";

type Guess = {
  word: string;
  result: string[];
};

type Props = {
  guesses: Guess[];
  current: string;
  wordLength: number;
  maxGuesses: number;
  shakeRow: boolean;
  /** Letters revealed by hint at correct positions (null = none). */
  hinted?: (string | null)[];
};

function Tile({
  letter,
  status,
  filled,
  shake,
}: {
  letter: string;
  status?: string;
  filled?: boolean;
  shake?: boolean;
}) {
  const classes = ["tile"];
  if (filled) classes.push("filled");
  if (status) classes.push(status);
  if (shake) classes.push("shake");
  return <div className={classes.join(" ")}>{letter}</div>;
}

export default function Board({
  guesses,
  current,
  wordLength,
  maxGuesses,
  shakeRow,
  hinted = [],
}: Props) {
  const rows = [];

  for (let r = 0; r < maxGuesses; r++) {
    const guess = guesses[r];
    const isCurrentRow = r === guesses.length;
    const letters = guess
      ? guess.word.split("")
      : isCurrentRow
        ? current.split("")
        : [];

    const tiles = [];
    for (let c = 0; c < wordLength; c++) {
      const typed = letters[c] || "";
      const hintLetter = hinted[c] || "";
      // Show hint ghost on empty cells of the active row only.
      const showHintGhost = isCurrentRow && !typed && !!hintLetter;
      const letter = typed || (showHintGhost ? hintLetter : "");
      const status = guess
        ? guess.result[c]
        : showHintGhost
          ? "hint"
          : undefined;
      tiles.push(
        <Tile
          key={c}
          letter={letter}
          status={status}
          filled={!!typed || showHintGhost}
          shake={isCurrentRow && shakeRow}
        />,
      );
    }
    rows.push(
      <div className="row" key={r}>
        {tiles}
      </div>,
    );
  }

  return <div className="board">{rows}</div>;
}
