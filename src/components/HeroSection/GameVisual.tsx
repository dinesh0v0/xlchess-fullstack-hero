/**
 * GameVisual — Hero section right column.
 *
 * Phase 1 (Autoplay): Replays The Evergreen Game (moves 15-20) automatically
 *   with smooth Framer Motion piece animations.
 * Phase 2 (Puzzle):   Shows the final 4-move puzzle position, board becomes
 *   interactive. User plays White to deliver checkmate.
 */

import { memo, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

/* ─── Constants ───────────────────────────────────── */

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

const PIECE_SYMBOLS: Record<string, Record<string, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};

// Evergreen Game — Anderssen vs Dufresne, 1852
// Full move list in SAN
const EVERGREEN_MOVES = [
  'e4','e5','Nf3','Nc6','Bc4','Bc5','b4','Bxb4','c3','Ba5',
  'd4','exd4','O-O','d3','Qb3','Qf6','e5','Qg6','Re1','Nge7',
  'Ba3','b5','Qxb5','Rb8','Qa4','Bb6','Nbd2','Bb7','Ne4','Qf5',
  'Bxd3','Qh5','Nf6+','gxf6','exf6','Rg8','Rad1','Qxf3',
  // Rxe7+ Nxe7 → puzzle start position (White to play Qxd7+)
  'Rxe7+','Nxe7',
  // Puzzle solution moves (user plays white):
  'Qxd7+','Kxd7','Bf5+','Ke8','Bd7+','Kf8','Bxe7#',
];

// Precompute positions list
function buildPositions() {
  const g = new Chess();
  const list: Array<{ fen: string; lastMove: { from: string; to: string } | null }> = [
    { fen: g.fen(), lastMove: null },
  ];
  for (const san of EVERGREEN_MOVES) {
    try {
      const m = g.move(san);
      list.push({ fen: g.fen(), lastMove: { from: m.from, to: m.to } });
    } catch { break; }
  }
  return list;
}

const ALL_POSITIONS = buildPositions();
// Autoplay starts at index 28 (after move 14 — Ne4/Qf5 sequence begins)
const AUTOPLAY_START = 28;
// Puzzle position index = 40 (after Rxe7+ Nxe7)
const PUZZLE_START = 40;

/* ─── Piece ID tracker ───────────────────────────── */

function initIds(game: Chess): Map<string, string> {
  const map = new Map<string, string>();
  let n = 0;
  for (const row of game.board()) {
    for (const p of row) {
      if (p) map.set(p.square, `gv${n++}`);
    }
  }
  return map;
}

function applyMoveToIds(
  ids: Map<string, string>,
  move: { from: string; to: string; flags: string; color: string },
) {
  const fid = ids.get(move.from);
  if (!fid) return;
  ids.delete(move.from);
  ids.delete(move.to);
  ids.set(move.to, fid);
  const rk = move.color === 'w' ? '1' : '8';
  if (move.flags.includes('k')) {
    const rid = ids.get(`h${rk}`);
    if (rid) { ids.delete(`h${rk}`); ids.set(`f${rk}`, rid); }
  } else if (move.flags.includes('q')) {
    const rid = ids.get(`a${rk}`);
    if (rid) { ids.delete(`a${rk}`); ids.set(`d${rk}`, rid); }
  }
  if (move.flags.includes('e')) ids.delete(`${move.to[0]}${move.from[1]}`);
}

/* ─── Board renderer (shared by both modes) ──────── */

interface PieceCell {
  id: string;
  color: string;
  type: string;
  square: string;
  row: number;
  col: number;
}

function getPieces(game: Chess, ids: Map<string, string>): PieceCell[] {
  const out: PieceCell[] = [];
  const board = game.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        out.push({
          id: ids.get(p.square) || p.square,
          color: p.color, type: p.type,
          square: p.square, row: r, col: c,
        });
      }
    }
  }
  return out;
}

/* ─── Main Component ─────────────────────────────── */

const GameVisual = memo(function GameVisual() {
  // ── Autoplay state
  const [posIdx, setPosIdx] = useState(AUTOPLAY_START);
  const [mode, setMode] = useState<'autoplay' | 'puzzle'>('autoplay');
  const [movesLeft, setMovesLeft] = useState(4);
  const [puzzleOver, setPuzzleOver] = useState(false);

  // ── Game ref — driven by posIdx in autoplay, interactive in puzzle
  const gameRef = useRef<Chess>(new Chess(ALL_POSITIONS[AUTOPLAY_START].fen));
  const pieceIdsRef = useRef<Map<string, string>>(initIds(gameRef.current));
  const [tick, setTick] = useState(0);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    ALL_POSITIONS[AUTOPLAY_START].lastMove,
  );

  // ── Puzzle interaction
  const [selectedSq, setSelectedSq] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);

  // ── Autoplay interval
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    intervalRef.current = setInterval(() => {
      setPosIdx(prev => {
        const next = prev + 1;
        if (next >= PUZZLE_START) {
          stopAutoplay();
          // Load puzzle position
          const puzzleGame = new Chess(ALL_POSITIONS[PUZZLE_START].fen);
          gameRef.current = puzzleGame;
          pieceIdsRef.current = initIds(puzzleGame);
          setLastMove(ALL_POSITIONS[PUZZLE_START].lastMove);
          setTick(t => t + 1);
          setTimeout(() => setMode('puzzle'), 200);
          return PUZZLE_START;
        }
        // Advance game
        const pos = ALL_POSITIONS[next];
        const newGame = new Chess(ALL_POSITIONS[prev].fen);
        try {
          const san = EVERGREEN_MOVES[prev - 1]; // the move from prev→next
          const m = newGame.move(san);
          if (m) {
            applyMoveToIds(pieceIdsRef.current, {
              from: m.from, to: m.to, flags: m.flags, color: m.color,
            });
            setLastMove({ from: m.from, to: m.to });
          }
        } catch { /* */ }
        gameRef.current = new Chess(pos.fen);
        setTick(t => t + 1);
        return next;
      });
    }, 1600);
  }, [stopAutoplay]);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay]);

  // ── Puzzle square click
  const handlePuzzleClick = useCallback((sq: string) => {
    if (puzzleOver) return;
    const game = gameRef.current;
    const turn = game.turn();
    const piece = game.get(sq as Parameters<typeof game.get>[0]);
    const isOwn = piece && piece.color === turn;

    if (!selectedSq) {
      if (!isOwn) return;
      setSelectedSq(sq);
      const moves = game.moves({ square: sq as Parameters<typeof game.moves>[0]['square'], verbose: true }) as Array<{ to: string }>;
      setLegalTargets(moves.map(m => m.to));
    } else if (selectedSq === sq) {
      setSelectedSq(null); setLegalTargets([]);
    } else if (legalTargets.includes(sq)) {
      try {
        const mv = game.move({ from: selectedSq, to: sq, promotion: 'q' });
        if (mv) {
          applyMoveToIds(pieceIdsRef.current, {
            from: mv.from, to: mv.to, flags: mv.flags, color: mv.color,
          });
          setLastMove({ from: mv.from, to: mv.to });
          setTick(t => t + 1);
          setMovesLeft(p => Math.max(0, p - 1));
          if (game.isCheckmate()) setPuzzleOver(true);
        }
      } catch { /* invalid */ }
      setSelectedSq(null); setLegalTargets([]);
    } else if (isOwn) {
      setSelectedSq(sq);
      const moves = game.moves({ square: sq as Parameters<typeof game.moves>[0]['square'], verbose: true }) as Array<{ to: string }>;
      setLegalTargets(moves.map(m => m.to));
    } else {
      setSelectedSq(null); setLegalTargets([]);
    }
  }, [puzzleOver, selectedSq, legalTargets]);

  // ── Reset puzzle
  const handleReset = useCallback(() => {
    const g = new Chess(ALL_POSITIONS[PUZZLE_START].fen);
    gameRef.current = g;
    pieceIdsRef.current = initIds(g);
    setLastMove(ALL_POSITIONS[PUZZLE_START].lastMove);
    setTick(t => t + 1);
    setSelectedSq(null); setLegalTargets([]);
    setMovesLeft(4); setPuzzleOver(false);
  }, []);

  // ── Replay full game
  const handleReplay = useCallback(() => {
    const g = new Chess(ALL_POSITIONS[AUTOPLAY_START].fen);
    gameRef.current = g;
    pieceIdsRef.current = initIds(g);
    setLastMove(null);
    setTick(t => t + 1);
    setPosIdx(AUTOPLAY_START);
    setMode('autoplay');
    setMovesLeft(4); setPuzzleOver(false);
    setSelectedSq(null); setLegalTargets([]);
    setTimeout(startAutoplay, 400);
  }, [startAutoplay]);

  // ── Derive pieces list
  const pieces = useMemo(() => getPieces(gameRef.current, pieceIdsRef.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tick]);

  // ── Board squares
  const boardSquares = useMemo(() => {
    const sq: Array<{ sq: string; row: number; col: number; isLight: boolean }> = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        sq.push({ sq: `${FILES[c]}${8 - r}`, row: r, col: c, isLight: (r + c) % 2 === 0 });
      }
    }
    return sq;
  }, []);

  return (
    <motion.div
      className="relative w-full max-w-[520px] mx-auto lg:mx-0"
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.85, delay: 0.35, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
    >
      <div
        className="rounded-xl overflow-hidden animate-board-glow"
        style={{ border: '1.5px solid rgba(110,99,246,0.35)' }}
      >
        {/* ── Board ──────────────────────────────── */}
        <div className="relative bg-[#0B1628] p-1 sm:p-1.5">
          <div className="relative" style={{ aspectRatio: '1' }}>
            {/* Square backgrounds + click targets */}
            <div className="absolute inset-0 grid grid-cols-8">
              {boardSquares.map(({ sq, row, col, isLight }) => {
                const isFrom = lastMove?.from === sq;
                const isToo  = lastMove?.to   === sq;
                const isSel  = selectedSq === sq;
                const isLeg  = legalTargets.includes(sq);
                const pieceHere = gameRef.current.get(sq as Parameters<typeof gameRef.current.get>[0]);

                let bg = isLight ? '#E8EDC8' : '#779556';
                if (isFrom || isToo) bg = isLight ? '#F5F682' : '#CDD16E';
                if (isSel)          bg = '#F5E882';

                return (
                  <div
                    key={sq}
                    style={{ background: bg }}
                    className={`relative ${mode === 'puzzle' ? 'cursor-pointer' : ''}`}
                    onClick={() => mode === 'puzzle' && handlePuzzleClick(sq)}
                  >
                    {/* Rank label */}
                    {col === 0 && (
                      <span
                        className="absolute top-0.5 left-0.5 leading-none select-none font-bold"
                        style={{ color: isLight ? '#779556' : '#E8EDC8', fontSize: '0.6rem' }}
                      >{8 - row}</span>
                    )}
                    {/* File label */}
                    {row === 7 && (
                      <span
                        className="absolute bottom-0.5 right-0.5 leading-none select-none font-bold"
                        style={{ color: isLight ? '#779556' : '#E8EDC8', fontSize: '0.6rem' }}
                      >{FILES[col]}</span>
                    )}
                    {/* Legal move dot */}
                    {isLeg && !pieceHere && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="rounded-full bg-black/25" style={{ width: '33%', height: '33%' }} />
                      </div>
                    )}
                    {/* Legal capture ring */}
                    {isLeg && pieceHere && (
                      <div className="absolute inset-0 rounded-[2px] ring-[4px] ring-inset ring-black/30 pointer-events-none" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Piece layer — animated with layoutId */}
            <LayoutGroup id="gv-board">
              <AnimatePresence>
                {pieces.map(p => (
                  <motion.div
                    key={p.id}
                    layoutId={p.id}
                    layout
                    className="absolute flex items-center justify-center pointer-events-none select-none z-10"
                    style={{
                      width: '12.5%', height: '12.5%',
                      left: `${p.col * 12.5}%`, top: `${p.row * 12.5}%`,
                    }}
                    exit={{ opacity: 0, scale: 0.2, transition: { duration: 0.18 } }}
                    transition={{ layout: { type: 'spring', stiffness: 900, damping: 38, mass: 0.6 } }}
                  >
                    <span
                      style={{
                        fontSize: 'clamp(1.05rem, 3.5vw, 2.1rem)',
                        color: p.color === 'w' ? '#F8F8F8' : '#111',
                        textShadow: p.color === 'w'
                          ? '0 0 3px rgba(0,0,0,0.95), 0 1px 0 rgba(0,0,0,0.8)'
                          : '0 0 1px rgba(255,255,255,0.1)',
                        ...(selectedSq === p.square
                          ? { filter: 'brightness(1.4) drop-shadow(0 0 8px rgba(245,246,130,0.9))' }
                          : {}),
                      }}
                    >
                      {PIECE_SYMBOLS[p.color][p.type]}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </LayoutGroup>

            {/* Checkmate flash overlay */}
            {puzzleOver && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center z-20 rounded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ background: 'rgba(0,0,0,0.55)' }}
              >
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  className="text-center"
                >
                  <div className="text-4xl mb-2">♛</div>
                  <p className="text-white font-black text-xl tracking-widest uppercase">Checkmate!</p>
                  <p className="text-brand-accent-light text-sm mt-1">Brilliant finish!</p>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Info bar ───────────────────────────── */}
        <AnimatePresence mode="wait">
          {mode === 'autoplay' ? (
            <motion.div
              key="autoplay-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="bg-[#0F1C33] px-4 py-3 flex items-center justify-between border-t border-brand-border"
            >
              <div>
                <p className="text-[0.6rem] font-semibold tracking-[0.18em] text-text-muted uppercase">
                  The Evergreen Game
                </p>
                <p className="text-sm font-semibold text-white mt-0.5">
                  Anderssen vs Dufresne, 1852
                </p>
              </div>
              <div className="flex flex-col items-center border border-brand-accent/40 rounded-lg px-3 py-1.5 min-w-[56px]">
                <motion.span
                  key={movesLeft}
                  className="text-xl font-black text-brand-accent leading-none"
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 0.35 }}
                >
                  {movesLeft}
                </motion.span>
                <span className="text-[0.55rem] font-semibold tracking-wider text-text-muted uppercase">
                  Moves Left
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="puzzle-info"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="bg-[#0F1C33] px-4 py-3 flex items-center justify-between border-t border-brand-border"
            >
              <div>
                <p className="text-[0.6rem] font-semibold tracking-[0.15em] text-text-muted uppercase">
                  Can you finish the Evergreen Game?
                </p>
                <p className="text-sm font-semibold text-white mt-0.5">White to move.</p>
              </div>
              <div className="flex flex-col items-center border border-brand-accent/40 rounded-lg px-3 py-1.5 min-w-[56px]">
                <motion.span
                  key={movesLeft}
                  className="text-xl font-black text-brand-accent leading-none"
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 0.35 }}
                >
                  {movesLeft}
                </motion.span>
                <span className="text-[0.55rem] font-semibold tracking-wider text-text-muted uppercase">
                  Moves Left
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Action bar ─────────────────────────── */}
        <AnimatePresence>
          {mode === 'autoplay' ? (
            <motion.div
              key="autoplay-bar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#090F1E] px-4 py-2.5 flex items-center justify-center gap-2 border-t border-brand-border/40"
            >
              <motion.svg
                className="w-3.5 h-3.5 text-text-muted"
                viewBox="0 0 24 24" fill="currentColor"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path d="M8 5v14l11-7z" />
              </motion.svg>
              <span className="text-xs text-text-muted font-medium tracking-wide">
                Autoplay in Progress...
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="puzzle-bar"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#090F1E] px-3 py-2.5 flex items-center gap-2 border-t border-brand-border/40"
            >
              <motion.button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-brand-border hover:border-brand-accent/40 text-text-secondary hover:text-white text-xs font-semibold transition-all cursor-pointer"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                </svg>
                Reset Puzzle
              </motion.button>
              <motion.button
                onClick={handleReplay}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-brand-border hover:border-brand-accent/40 text-text-secondary hover:text-white text-xs font-semibold transition-all cursor-pointer"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Replay Full Game
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

export default GameVisual;
