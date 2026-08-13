"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { findBestMove } from "../ai";
import { CENTER, RACK_SIZE } from "../board";
import { bookishBonusCount } from "../bookish-bonus";
import { applyMove, emptyBoard, evaluatePlacement } from "../engine";
import {
  bagDistribution,
  createBag,
  drawTiles,
  refillRack,
  shuffle,
  takeLettersFromBag,
} from "../letters";
import { cellKey, placementFromPending, type PendingCell } from "../placement";
import { recordLexiconGame } from "../storage";
import {
  englishWordCount as getEnglishWordCount,
  isDictReady,
  loadEnglishDictionary,
} from "../word-dict";
import type {
  BoardCell,
  GamePhase,
  LexiconState,
  PlayerId,
  Tile,
  TurnLog,
} from "../types";

const OPENERS = [
  "STORY",
  "NOVEL",
  "POEM",
  "PAGE",
  "BOOK",
  "TALE",
  "EPIC",
  "PROSE",
  "VERSE",
  "MYTH",
  "SAGA",
  "TOME",
  "READ",
  "PLOT",
  "HERO",
  "INK",
] as const;

function placeOpener(
  board: BoardCell[][],
  word: string,
): BoardCell[][] {
  const next = board.map((row) => row.map((c) => ({ ...c })));
  const startCol = CENTER - Math.floor((word.length - 1) / 2);
  for (let i = 0; i < word.length; i++) {
    next[CENTER][startCol + i] = { letter: word[i], fresh: true };
  }
  return next;
}

function deal(): LexiconState {
  let bag = createBag();
  const opener =
    OPENERS[Math.floor(Math.random() * OPENERS.length)] ?? "STORY";
  const taken = takeLettersFromBag(bag, opener);
  if (taken) bag = taken.bag;
  const board = placeOpener(emptyBoard(), opener);

  const you = drawTiles(bag, RACK_SIZE);
  bag = you.bag;
  const ai = drawTiles(bag, RACK_SIZE);
  bag = ai.bag;

  return {
    phase: "playing",
    board,
    bag,
    yourRack: you.drawn,
    aiRack: ai.drawn,
    yourScore: 0,
    aiScore: 0,
    turn: "you",
    consecutivePasses: 0,
    history: [],
    lastMove: null,
    message: `Board opens with ${opener}. Any real word scores — bookish jargon earns bonus points.`,
    winner: null,
  };
}

export function useLexiconGame() {
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [dictReady, setDictReady] = useState(isDictReady());
  const [dictError, setDictError] = useState<string | null>(null);
  const [state, setState] = useState<LexiconState>(() => ({
    ...deal(),
    phase: "intro",
    message: `You vs ReadLife · Scrabble rules + bookish jargon bonuses`,
  }));

  useEffect(() => {
    let cancelled = false;
    loadEnglishDictionary()
      .then(() => {
        if (!cancelled) setDictReady(true);
      })
      .catch(() => {
        if (!cancelled) setDictError("Couldn't load the word dictionary.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [pending, setPending] = useState<PendingCell[]>([]);
  const [pendingBlank, setPendingBlank] = useState<{
    tile: Tile;
    row: number;
    col: number;
  } | null>(null);
  const [exchangeMode, setExchangeMode] = useState(false);
  const [exchangeIds, setExchangeIds] = useState<string[]>([]);
  const [showBag, setShowBag] = useState(false);
  const [dragTileId, setDragTileId] = useState<string | null>(null);
  const aiThinking = useRef(false);

  const pendingIds = useMemo(
    () => new Set(pending.map((p) => p.tile.id)),
    [pending],
  );

  const rackVisible = useMemo(
    () => state.yourRack.filter((t) => !pendingIds.has(t.id)),
    [state.yourRack, pendingIds],
  );

  const clearPending = useCallback(() => {
    setPending([]);
    setPendingBlank(null);
    setExchangeMode(false);
    setExchangeIds([]);
    setDragTileId(null);
  }, []);

  const startGame = useCallback(() => {
    setPhase("playing");
    setState(deal());
    clearPending();
  }, [clearPending]);

  const endGame = useCallback(
    (next: LexiconState, reason: string) => {
      let yourScore = next.yourScore;
      let aiScore = next.aiScore;
      const yourLeft = next.yourRack.reduce((s, t) => s + t.points, 0);
      const aiLeft = next.aiRack.reduce((s, t) => s + t.points, 0);
      yourScore -= yourLeft;
      aiScore -= aiLeft;
      if (next.yourRack.length === 0) yourScore += aiLeft;
      if (next.aiRack.length === 0) aiScore += yourLeft;

      const winner: PlayerId | "tie" =
        yourScore === aiScore ? "tie" : yourScore > aiScore ? "you" : "readlife";

      setPhase("gameover");
      setState({
        ...next,
        yourScore,
        aiScore,
        phase: "gameover",
        winner,
        message: reason,
      });
      recordLexiconGame({ won: winner === "you", yourScore, aiScore });
      clearPending();
    },
    [clearPending],
  );

  const placeTileAt = useCallback(
    (tile: Tile, row: number, col: number, blankLetter?: string) => {
      if (state.turn !== "you" || phase !== "playing" || exchangeMode) return;
      if (state.board[row][col].letter) {
        setState((s) => ({ ...s, message: "That square is already filled." }));
        return;
      }

      if (tile.isBlank && !blankLetter) {
        setPendingBlank({ tile, row, col });
        return;
      }

      const letter = tile.isBlank ? blankLetter!.toUpperCase() : tile.letter;
      setPending((prev) => {
        if (prev.some((p) => p.row === row && p.col === col && p.tile.id !== tile.id)) {
          return prev;
        }
        const without = prev.filter((p) => p.tile.id !== tile.id);
        return [...without, { row, col, tile, letter }];
      });
      setState((s) => ({
        ...s,
        message: "Place more tiles, or press Play word.",
      }));
    },
    [state.turn, state.board, phase, exchangeMode],
  );

  const assignBlank = useCallback(
    (letter: string) => {
      if (!pendingBlank) return;
      placeTileAt(pendingBlank.tile, pendingBlank.row, pendingBlank.col, letter);
      setPendingBlank(null);
    },
    [pendingBlank, placeTileAt],
  );

  const pickupPending = useCallback((row: number, col: number) => {
    setPending((prev) => prev.filter((p) => !(p.row === row && p.col === col)));
  }, []);

  const onDropOnCell = useCallback(
    (row: number, col: number, tileId: string) => {
      const tile =
        state.yourRack.find((t) => t.id === tileId) ||
        pending.find((p) => p.tile.id === tileId)?.tile;
      if (!tile) return;
      placeTileAt(tile, row, col);
      setDragTileId(null);
    },
    [state.yourRack, pending, placeTileAt],
  );

  const preview = useMemo(() => {
    const result = placementFromPending(state.board, pending);
    return result.ok ? result.placement.word : "";
  }, [state.board, pending]);

  const playPending = useCallback(() => {
    if (state.turn !== "you" || phase !== "playing") return;
    const inferred = placementFromPending(state.board, pending);
    if (!inferred.ok) {
      setState((s) => ({ ...s, message: inferred.error }));
      return;
    }

    const blankMap: Record<string, string> = {};
    for (const p of pending) {
      if (p.tile.isBlank) blankMap[p.tile.id] = p.letter;
    }

    const result = evaluatePlacement(
      state.board,
      state.yourRack,
      inferred.placement,
      blankMap,
    );
    if (!result.ok) {
      setState((s) => ({ ...s, message: result.error }));
      return;
    }

    const board = applyMove(state.board, result.move);
    let rack = state.yourRack.filter((t) => !result.move.tileIds.includes(t.id));
    const refilled = refillRack(rack, state.bag, RACK_SIZE);
    rack = refilled.rack;
    const bag = refilled.bag;

    const log: TurnLog = {
      player: "you",
      kind: "play",
      word: result.move.word,
      score: result.move.score,
      wordsFormed: result.move.wordsFormed,
    };

    const next: LexiconState = {
      ...state,
      board,
      bag,
      yourRack: rack,
      yourScore: state.yourScore + result.move.score,
      turn: "readlife",
      consecutivePasses: 0,
      history: [...state.history, log],
      lastMove: result.move,
      message: `You played ${result.move.word} for ${result.move.score} pts${
        result.move.bookishBonus
          ? ` (incl. +${result.move.bookishBonus} bookish)`
          : ""
      }`,
    };

    clearPending();

    if (rack.length === 0 && bag.length === 0) {
      endGame(next, "You cleared your rack — final tallies applied.");
      return;
    }
    setState(next);
  }, [state, phase, pending, clearPending, endGame]);

  const passTurn = useCallback(() => {
    if (state.turn !== "you" || phase !== "playing") return;
    const passes = state.consecutivePasses + 1;
    const next: LexiconState = {
      ...state,
      turn: "readlife",
      consecutivePasses: passes,
      history: [...state.history, { player: "you", kind: "pass" }],
      lastMove: null,
      message: "You passed.",
    };
    clearPending();
    if (passes >= 4) {
      endGame(next, "Both sides passed — game over.");
      return;
    }
    setState(next);
  }, [state, phase, clearPending, endGame]);

  /** Scrabble exchange: swap selected (or all) rack tiles for new ones from the bag. Costs your turn. */
  const exchangeTiles = useCallback(
    (all = false) => {
      if (state.turn !== "you" || phase !== "playing") return;
      if (state.bag.length === 0) {
        setState((s) => ({
          ...s,
          message: "The bag is empty — no new tiles left.",
        }));
        return;
      }

      if (!all && !exchangeMode) {
        setExchangeMode(true);
        setExchangeIds([]);
        setPending([]);
        setState((s) => ({
          ...s,
          message: "Select tiles to swap, then tap New tiles again — or Swap all.",
        }));
        return;
      }

      const ids = all
        ? state.yourRack.map((t) => t.id)
        : exchangeIds.length > 0
          ? exchangeIds
          : state.yourRack.map((t) => t.id);

      if (ids.length === 0) {
        setExchangeMode(false);
        setState((s) => ({ ...s, message: "Exchange cancelled." }));
        return;
      }

      const n = Math.min(ids.length, state.bag.length);
      const returning = state.yourRack.filter((t) => ids.includes(t.id)).slice(0, n);
      let rack = state.yourRack.filter((t) => !returning.some((r) => r.id === t.id));
      let bag = shuffle([...state.bag, ...returning]);
      const drawn = drawTiles(bag, returning.length);
      bag = drawn.bag;
      rack = [...rack, ...drawn.drawn];

      const next: LexiconState = {
        ...state,
        bag,
        yourRack: rack,
        turn: "readlife",
        consecutivePasses: 0,
        history: [...state.history, { player: "you", kind: "exchange" }],
        lastMove: null,
        message: `Drew ${returning.length} new tile${returning.length === 1 ? "" : "s"} from the bag.`,
      };
      clearPending();
      setState(next);
    },
    [state, phase, exchangeMode, exchangeIds, clearPending],
  );

  const toggleExchangeTile = useCallback(
    (id: string) => {
      if (!exchangeMode) return;
      setExchangeIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    },
    [exchangeMode],
  );

  const shuffleRack = useCallback(() => {
    if (state.turn !== "you" || phase !== "playing") return;

    setState((s) => {
      // Only rearrange tiles still on the rack (not ones already placed).
      // Never touch the bag — same letters, new order.
      const placed = new Set(pending.map((p) => p.tile.id));
      const visible = s.yourRack.filter((t) => !placed.has(t.id));
      if (visible.length < 2) return s;

      const reordered = [...visible];
      for (let i = reordered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = reordered[i];
        reordered[i] = reordered[j];
        reordered[j] = tmp;
      }

      let vi = 0;
      const yourRack = s.yourRack.map((t) =>
        placed.has(t.id) ? t : reordered[vi++]!,
      );

      return {
        ...s,
        yourRack,
        message: "Rearranged your tiles.",
      };
    });
  }, [state.turn, phase, pending]);

  const [hintBusy, setHintBusy] = useState(false);

  const applyHint = useCallback(() => {
    if (
      state.turn !== "you" ||
      phase !== "playing" ||
      exchangeMode ||
      hintBusy
    ) {
      return;
    }
    setHintBusy(true);
    setExchangeMode(false);
    setExchangeIds([]);

    // Yield so the button can show a loading state before the search
    window.setTimeout(() => {
      const move = findBestMove(state.board, state.yourRack, {
        maxCandidates: 50,
        timeBudgetMs: 900,
      });

      if (!move) {
        setState((s) => ({
          ...s,
          message: "No play found — try New tiles or Pass.",
        }));
        setHintBusy(false);
        return;
      }

      const dr = move.direction === "across" ? 0 : 1;
      const dc = move.direction === "across" ? 1 : 0;
      const byId = new Map(state.yourRack.map((t) => [t.id, t]));
      let tileIdx = 0;
      let blankIdx = 0;
      const nextPending: PendingCell[] = [];

      for (let i = 0; i < move.word.length; i++) {
        const r = move.row + dr * i;
        const c = move.col + dc * i;
        if (state.board[r]?.[c]?.letter) continue;
        const tileId = move.tileIds[tileIdx++];
        const tile = byId.get(tileId);
        if (!tile) continue;
        const letter = tile.isBlank
          ? (move.blankAssignments?.[blankIdx++] ?? move.word[i])
          : tile.letter;
        nextPending.push({ row: r, col: c, tile, letter });
      }

      setPending(nextPending);
      setPendingBlank(null);
      setState((s) => ({
        ...s,
        message: `Hint: play ${move.word} for ${move.score} pts — then press Play word.`,
      }));
      setHintBusy(false);
    }, 30);
  }, [state, phase, exchangeMode, hintBusy]);

  // AI turn — play, or exchange if stuck, then pass
  useEffect(() => {
    if (phase !== "playing" || state.turn !== "readlife" || aiThinking.current) {
      return;
    }
    aiThinking.current = true;
    const timer = window.setTimeout(() => {
      setState((current) => {
        if (current.turn !== "readlife" || current.phase === "gameover") {
          aiThinking.current = false;
          return current;
        }

        const move = findBestMove(current.board, current.aiRack, {
          timeBudgetMs: 1000,
          maxCandidates: 100,
        });

        if (move) {
          const board = applyMove(current.board, move);
          let rack = current.aiRack.filter((t) => !move.tileIds.includes(t.id));
          const refilled = refillRack(rack, current.bag, RACK_SIZE);
          rack = refilled.rack;
          const bag = refilled.bag;
          const next: LexiconState = {
            ...current,
            board,
            bag,
            aiRack: rack,
            aiScore: current.aiScore + move.score,
            turn: "you",
            consecutivePasses: 0,
            history: [
              ...current.history,
              {
                player: "readlife",
                kind: "play",
                word: move.word,
                score: move.score,
                wordsFormed: move.wordsFormed,
              },
            ],
            lastMove: move,
            message: `ReadLife played ${move.word} for ${move.score} pts${
              move.bookishBonus ? ` (incl. +${move.bookishBonus} bookish)` : ""
            }`,
          };
          if (rack.length === 0 && bag.length === 0) {
            queueMicrotask(() =>
              endGame(next, "ReadLife cleared its rack — final tallies applied."),
            );
          }
          aiThinking.current = false;
          return next;
        }

        // Stuck: exchange rack instead of endless passes
        if (current.bag.length > 0) {
          const returning = current.aiRack;
          let bag = shuffle([...current.bag, ...returning]);
          const drawn = drawTiles(bag, returning.length);
          bag = drawn.bag;
          aiThinking.current = false;
          return {
            ...current,
            bag,
            aiRack: drawn.drawn,
            turn: "you",
            consecutivePasses: 0,
            history: [
              ...current.history,
              { player: "readlife", kind: "exchange" },
            ],
            lastMove: null,
            message: "ReadLife exchanged tiles. Your turn.",
          };
        }

        const passes = current.consecutivePasses + 1;
        const next: LexiconState = {
          ...current,
          turn: "you",
          consecutivePasses: passes,
          history: [...current.history, { player: "readlife", kind: "pass" }],
          lastMove: null,
          message:
            passes >= 4
              ? "ReadLife passes — game over."
              : "ReadLife passes. Your turn.",
        };
        if (passes >= 4) {
          queueMicrotask(() => endGame(next, "Both sides passed — game over."));
        }
        aiThinking.current = false;
        return next;
      });
    }, 650);

    return () => {
      window.clearTimeout(timer);
      aiThinking.current = false;
    };
  }, [phase, state.turn, state.history.length, endGame]);

  const distribution = useMemo(
    () => bagDistribution(state.bag),
    [state.bag],
  );

  const pendingByKey = useMemo(() => {
    const m = new Map<string, PendingCell>();
    for (const p of pending) m.set(cellKey(p.row, p.col), p);
    return m;
  }, [pending]);

  return {
    phase,
    state,
    pending,
    pendingByKey,
    rackVisible,
    preview,
    pendingBlank,
    assignBlank,
    exchangeMode,
    exchangeIds,
    toggleExchangeTile,
    showBag,
    setShowBag,
    distribution,
    dragTileId,
    setDragTileId,
    placeTileAt,
    pickupPending,
    onDropOnCell,
    playPending,
    passTurn,
    exchangeTiles,
    startGame,
    clearPending,
    shuffleRack,
    applyHint,
    hintBusy,
    isAiTurn: state.turn === "readlife" && phase === "playing",
    dictReady,
    dictError,
    englishWordCount: dictReady ? getEnglishWordCount() : 0,
    bookishBonusCount: bookishBonusCount(),
  };
}
