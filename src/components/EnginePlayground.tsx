/**
 * EnginePlayground — Full interactive chess game with AI opponent.
 * Uses chess.js for complete legal move generation, check/mate detection.
 * UI matches dachess.com design:
 *   - Animated board with layoutId piece movement
 *   - Eval bar + algebraic move log
 *   - Undo / Hint / Reset / More (dropdown: Chess960, Edit Position)
 *   - Difficulty 1–5 selector
 *   - Inline Edit Position mode with piece palette, castling rights, FEN input
 *   - Chess960 (Fischer Random) starting position generator
 *   - Turn indicator + game-over banner
 */

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

/* ─── Types & constants ──────────────────────────── */

type Color = 'w' | 'b';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

const SYMBOLS: Record<Color, Record<string, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};

const PIECE_VALUES: Record<string, number> = {
  p: 1, n: 3, b: 3.2, r: 5, q: 9, k: 0,
};

const DIFFICULTY_LABELS = [
  '',
  'Beginner (800)',
  'Easy (1200)',
  'Intermediate (1600)',
  'Advanced (2000)',
  'Master (3000+)',
];

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/* ─── Helpers ────────────────────────────────────── */

function computeEval(game: Chess): number {
  let s = 0;
  for (const row of game.board()) {
    for (const p of row) {
      if (p) s += (p.color === 'w' ? 1 : -1) * (PIECE_VALUES[p.type] ?? 0);
    }
  }
  return Math.round(s * 10) / 10;
}

function getAIMove(game: Chess, diff: number): string | null {
  const moves = game.moves({ verbose: true }) as Array<{
    san: string; captured?: string; to: string;
  }>;
  if (!moves.length) return null;

  if (diff <= 2) {
    return moves[Math.floor(Math.random() * moves.length)].san;
  }

  // Greedy: prefer best capture
  const captures = moves.filter(m => m.captured);
  if (captures.length && Math.random() > 0.15) {
    captures.sort((a, b) => (PIECE_VALUES[b.captured!] ?? 0) - (PIECE_VALUES[a.captured!] ?? 0));
    return captures[0].san;
  }

  // Mild center preference for higher difficulty
  if (diff >= 4) {
    const center = moves.filter(m => ['e4', 'e5', 'd4', 'd5', 'c4', 'c5', 'f4', 'f5'].includes(m.to));
    if (center.length && Math.random() > 0.5) {
      return center[Math.floor(Math.random() * center.length)].san;
    }
  }

  return moves[Math.floor(Math.random() * moves.length)].san;
}

/* ─── Piece-ID tracker ───────────────────────────── */

let gPieceCounter = 0;

function initPieceIds(game: Chess): Map<string, string> {
  const m = new Map<string, string>();
  for (const row of game.board()) {
    for (const p of row) {
      if (p) m.set(p.square, `ep${gPieceCounter++}`);
    }
  }
  return m;
}

function applyMoveIds(
  ids: Map<string, string>,
  mv: { from: string; to: string; flags: string; color: string },
) {
  const fid = ids.get(mv.from);
  if (!fid) return;
  ids.delete(mv.from);
  ids.delete(mv.to);      // capture
  ids.set(mv.to, fid);
  const rk = mv.color === 'w' ? '1' : '8';
  if (mv.flags.includes('k')) {
    const rid = ids.get(`h${rk}`);
    if (rid) { ids.delete(`h${rk}`); ids.set(`f${rk}`, rid); }
  } else if (mv.flags.includes('q')) {
    const rid = ids.get(`a${rk}`);
    if (rid) { ids.delete(`a${rk}`); ids.set(`d${rk}`, rid); }
  }
  if (mv.flags.includes('e')) ids.delete(`${mv.to[0]}${mv.from[1]}`);
}

/* ─── Chess960 Generator ─────────────────────────── */

function generateChess960FEN(): string {
  const pieces: (string | null)[] = Array(8).fill(null);
  const lightSq = [0, 2, 4, 6];
  const darkSq = [1, 3, 5, 7];
  pieces[lightSq[Math.floor(Math.random() * 4)]] = 'b';
  pieces[darkSq[Math.floor(Math.random() * 4)]] = 'b';
  const emptyQ = pieces.map((p, i) => p === null ? i : -1).filter(i => i >= 0);
  pieces[emptyQ[Math.floor(Math.random() * emptyQ.length)]] = 'q';
  const emptyN = pieces.map((p, i) => p === null ? i : -1).filter(i => i >= 0);
  const n1 = Math.floor(Math.random() * emptyN.length);
  pieces[emptyN[n1]] = 'n';
  emptyN.splice(n1, 1);
  pieces[emptyN[Math.floor(Math.random() * emptyN.length)]] = 'n';
  const rem = pieces.map((p, i) => p === null ? i : -1).filter(i => i >= 0);
  pieces[rem[0]] = 'r'; pieces[rem[1]] = 'k'; pieces[rem[2]] = 'r';
  const back = pieces.join('');
  return `${back}/pppppppp/8/8/8/8/PPPPPPPP/${back.toUpperCase()} w KQkq - 0 1`;
}

/* ─── Edit Mode types ────────────────────────────── */

type EditTool = 'cursor' | 'eraser' | { color: Color; type: string };

const EDIT_W: Array<{ sym: string; type: string }> = [
  { sym: '♔', type: 'k' }, { sym: '♕', type: 'q' }, { sym: '♖', type: 'r' },
  { sym: '♗', type: 'b' }, { sym: '♘', type: 'n' }, { sym: '♙', type: 'p' },
];
const EDIT_B: Array<{ sym: string; type: string }> = [
  { sym: '♚', type: 'k' }, { sym: '♛', type: 'q' }, { sym: '♜', type: 'r' },
  { sym: '♝', type: 'b' }, { sym: '♞', type: 'n' }, { sym: '♟', type: 'p' },
];


/* ─── Main Component ─────────────────────────────── */

export default function EnginePlayground() {
  /* ── Game refs ───────────────────────────── */
  const gameRef = useRef(new Chess());
  const pieceIdsRef = useRef(initPieceIds(gameRef.current));

  /* ── UI state ────────────────────────────── */
  const [tick, setTick] = useState(0);
  const [selectedSq, setSelectedSq] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [difficulty, setDifficulty] = useState(3);
  const [evalScore, setEvalScore] = useState(0);
  const [moveHistory, setMoveHistory] = useState<{ n: number; w: string; b: string | null }[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [gameStatus, setGameStatus] = useState<string | null>(null);
  const [activeBtn, setActiveBtn] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTool, setEditTool] = useState<EditTool>('cursor');
  const [editToMove, setEditToMove] = useState<'w' | 'b'>('w');
  const [editCastle, setEditCastle] = useState({ K: true, Q: true, k: true, q: true });
  const [hintMove, setHintMove] = useState<{ from: string; to: string } | null>(null);
  const moveLogRef = useRef<HTMLDivElement>(null);

  /* ── Auto-scroll move log ────────────────── */
  useEffect(() => {
    if (moveLogRef.current) moveLogRef.current.scrollTop = moveLogRef.current.scrollHeight;
  }, [moveHistory]);

  /* ── Piece list for rendering ────────────── */
  const pieces = useMemo(() => {
    const out: Array<{ id: string; color: Color; type: string; square: string; row: number; col: number }> = [];
    const board = gameRef.current.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p) {
          out.push({
            id: pieceIdsRef.current.get(p.square) ?? p.square,
            color: p.color as Color, type: p.type,
            square: p.square, row: r, col: c,
          });
        }
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  /* ── Sync state after move ───────────────── */
  const syncAfterMove = useCallback(() => {
    const g = gameRef.current;
    const hist = g.history();
    const pairs: { n: number; w: string; b: string | null }[] = [];
    for (let i = 0; i < hist.length; i += 2) {
      pairs.push({ n: i / 2 + 1, w: hist[i], b: hist[i + 1] ?? null });
    }
    setMoveHistory(pairs);
    setEvalScore(computeEval(g));

    let status: string | null = null;
    if (g.isCheckmate()) status = g.turn() === 'w' ? '0–1  Black wins!' : '1–0  White wins!';
    else if (g.isStalemate()) status = '½–½  Stalemate';
    else if (g.isDraw()) status = '½–½  Draw';
    setGameStatus(status);
  }, []);

  /* ── Execute move (human or AI) ──────────── */
  const executeMove = useCallback((from: string, to: string): boolean => {
    const g = gameRef.current;
    let mv: ReturnType<typeof g.move> | null = null;
    try { mv = g.move({ from, to, promotion: 'q' }); } catch { return false; }
    if (!mv) return false;

    applyMoveIds(pieceIdsRef.current, {
      from: mv.from, to: mv.to, flags: mv.flags, color: mv.color,
    });
    setLastMove({ from: mv.from, to: mv.to });
    setTick(t => t + 1);
    setSelectedSq(null);
    setLegalTargets([]);
    setHintMove(null);
    syncAfterMove();
    return true;
  }, [syncAfterMove]);

  /* ── Trigger AI response ─────────────────── */
  const triggerAI = useCallback(() => {
    if (gameRef.current.isGameOver() || gameRef.current.turn() !== 'b') return;
    setIsAIThinking(true);

    const delay = 280 + Math.random() * 520;
    setTimeout(() => {
      const san = getAIMove(gameRef.current, difficulty);
      if (san && !gameRef.current.isGameOver()) {
        let mv: ReturnType<typeof gameRef.current.move> | null = null;
        try { mv = gameRef.current.move(san); } catch { /* */ }
        if (mv) {
          applyMoveIds(pieceIdsRef.current, {
            from: mv.from, to: mv.to, flags: mv.flags, color: mv.color,
          });
          setLastMove({ from: mv.from, to: mv.to });
          setTick(t => t + 1);
          syncAfterMove();
        }
      }
      setIsAIThinking(false);
    }, delay);
  }, [difficulty, syncAfterMove]);

  /* ── Edit Mode square click ────────────── */
  const handleEditClick = useCallback((sq: string) => {
    const g = gameRef.current;
    const sqTyped = sq as Parameters<typeof g.get>[0];
    if (editTool === 'eraser') {
      g.remove(sqTyped);
      pieceIdsRef.current = initPieceIds(g);
      setTick(t => t + 1);
    } else if (editTool === 'cursor') {
      const piece = g.get(sqTyped);
      if (selectedSq) {
        const srcPiece = g.get(selectedSq as Parameters<typeof g.get>[0]);
        if (srcPiece) {
          g.remove(selectedSq as Parameters<typeof g.remove>[0]);
          g.remove(sqTyped);
          g.put(srcPiece, sqTyped);
          pieceIdsRef.current = initPieceIds(g);
          setTick(t => t + 1);
        }
        setSelectedSq(null);
      } else if (piece) {
        setSelectedSq(sq);
      }
    } else {
      const tool = editTool as { color: Color; type: string };
      g.remove(sqTyped);
      g.put({ type: tool.type as 'k' | 'q' | 'r' | 'b' | 'n' | 'p', color: tool.color }, sqTyped);
      pieceIdsRef.current = initPieceIds(g);
      setTick(t => t + 1);
    }
  }, [editTool, selectedSq]);

  /* ── Square click ────────────────────────── */
  const handleSquareClick = useCallback((sq: string) => {
    if (isEditMode) { handleEditClick(sq); return; }
    if (isAIThinking || gameStatus) return;
    const g = gameRef.current;
    if (g.turn() !== 'w') return; // human plays white

    const piece = g.get(sq as Parameters<typeof g.get>[0]);
    const isOwn = piece && piece.color === 'w';

    if (!selectedSq) {
      if (!isOwn) return;
      setSelectedSq(sq);
      const mvs = g.moves({ square: sq as Parameters<typeof g.moves>[0]['square'], verbose: true }) as Array<{ to: string }>;
      setLegalTargets(mvs.map(m => m.to));
    } else if (selectedSq === sq) {
      setSelectedSq(null); setLegalTargets([]);
    } else if (legalTargets.includes(sq)) {
      const ok = executeMove(selectedSq, sq);
      if (ok && !gameRef.current.isGameOver()) triggerAI();
    } else if (isOwn) {
      setSelectedSq(sq);
      const mvs = g.moves({ square: sq as Parameters<typeof g.moves>[0]['square'], verbose: true }) as Array<{ to: string }>;
      setLegalTargets(mvs.map(m => m.to));
    } else {
      setSelectedSq(null); setLegalTargets([]);
    }
  }, [isEditMode, handleEditClick, isAIThinking, gameStatus, selectedSq, legalTargets, executeMove, triggerAI]);

  /* ── Undo ────────────────────────────────── */
  const handleUndo = useCallback(() => {
    const g = gameRef.current;
    g.undo(); g.undo(); // undo AI + human
    pieceIdsRef.current = initPieceIds(g);
    setLastMove(null); setSelectedSq(null); setLegalTargets([]);
    setGameStatus(null); setHintMove(null);
    setTick(t => t + 1);
    syncAfterMove();
    setActiveBtn('undo');
    setTimeout(() => setActiveBtn(null), 600);
  }, [syncAfterMove]);

  /* ── Hint ────────────────────────────────── */
  const handleHint = useCallback(() => {
    if (gameRef.current.turn() !== 'w') return;
    const mvs = gameRef.current.moves({ verbose: true }) as Array<{ from: string; to: string }>;
    if (!mvs.length) return;
    const pick = mvs[Math.floor(Math.random() * mvs.length)];
    setHintMove({ from: pick.from, to: pick.to });
    setActiveBtn('hint');
    setTimeout(() => { setActiveBtn(null); setHintMove(null); }, 2500);
  }, []);

  /* ── Reset ───────────────────────────────── */
  const handleReset = useCallback(() => {
    gameRef.current = new Chess();
    pieceIdsRef.current = initPieceIds(gameRef.current);
    setLastMove(null); setSelectedSq(null); setLegalTargets([]);
    setMoveHistory([]); setEvalScore(0); setGameStatus(null); setHintMove(null);
    setTick(t => t + 1);
    setActiveBtn('reset');
    setTimeout(() => setActiveBtn(null), 800);
  }, []);

  /* ── Load position ───────────────────────── */
  const handleLoadPosition = useCallback((fen: string) => {
    try {
      gameRef.current = new Chess(fen);
      pieceIdsRef.current = initPieceIds(gameRef.current);
      setLastMove(null); setSelectedSq(null); setLegalTargets([]);
      setGameStatus(null); setHintMove(null);
      setMoveHistory([]); setEvalScore(computeEval(gameRef.current));
      setTick(t => t + 1);
    } catch { /* invalid FEN */ }
  }, []);

  /* ── Chess960 ────────────────────────────── */
  const handleChess960 = useCallback(() => {
    const fen = generateChess960FEN();
    handleLoadPosition(fen);
  }, [handleLoadPosition]);

  /* ── Enter Edit Mode ─────────────────────── */
  const enterEditMode = useCallback(() => {
    setIsEditMode(true);
    setEditTool('cursor');
    setEditToMove(gameRef.current.turn());
    setEditCastle({ K: true, Q: true, k: true, q: true });
    setSelectedSq(null); setLegalTargets([]); setHintMove(null);
  }, []);

  /* ── Save (exit) Edit Mode ──────────────── */
  const saveEditPosition = useCallback(() => {
    // Build FEN from current board + edit settings
    const g = gameRef.current;
    const rows: string[] = [];
    for (let r = 0; r < 8; r++) {
      let row = '';
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const p = g.board()[r][c];
        if (p) {
          if (empty > 0) { row += empty; empty = 0; }
          const ch = p.type === 'k' ? 'k' : p.type === 'q' ? 'q' : p.type === 'r' ? 'r' : p.type === 'b' ? 'b' : p.type === 'n' ? 'n' : 'p';
          row += p.color === 'w' ? ch.toUpperCase() : ch;
        } else {
          empty++;
        }
      }
      if (empty > 0) row += empty;
      rows.push(row);
    }
    const castleStr = (editCastle.K ? 'K' : '') + (editCastle.Q ? 'Q' : '') + (editCastle.k ? 'k' : '') + (editCastle.q ? 'q' : '') || '-';
    const fen = `${rows.join('/')} ${editToMove} ${castleStr} - 0 1`;
    try {
      gameRef.current = new Chess(fen);
      pieceIdsRef.current = initPieceIds(gameRef.current);
      setIsEditMode(false);
      setSelectedSq(null); setLegalTargets([]);
      setMoveHistory([]); setEvalScore(computeEval(gameRef.current));
      setGameStatus(null); setHintMove(null);
      setTick(t => t + 1);
    } catch { /* invalid position, stay in edit mode */ }
  }, [editToMove, editCastle]);



  /* ── Edit mode FEN display ─────────────── */
  const editFen = useMemo(() => {
    if (!isEditMode) return '';
    return gameRef.current.fen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, tick]);


  /* ── Eval bar ────────────────────────────── */
  const whitePercent = Math.max(4, Math.min(96, 50 + evalScore * 4));
  const evalLabel = evalScore > 0 ? `+${evalScore}` : `${evalScore}`;

  /* ── Board squares ───────────────────────── */
  const boardSquares = useMemo(() => {
    const sq: Array<{ sq: string; row: number; col: number; isLight: boolean }> = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        sq.push({ sq: `${FILES[c]}${8 - r}`, row: r, col: c, isLight: (r + c) % 2 === 0 });
      }
    }
    return sq;
  }, []);

  /* ── Control button config ───────────────── */
  const ctrlBtns = [
    {
      id: 'undo', icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
        </svg>
      ), label: 'Undo', action: handleUndo, color: null,
    },
    {
      id: 'hint', icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
        </svg>
      ), label: 'Hint', action: handleHint, color: '#EAB308',
    },
    {
      id: 'reset', icon: activeBtn === 'reset'
        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-spin-slow"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>,
      label: 'Reset', action: handleReset, color: '#ef4444',
    },
    {
      id: 'more', icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
        </svg>
      ), label: 'More', action: () => setShowMore(v => !v), color: null,
    },
  ];

  return (
    <section
      id="engine-playground"
      className="relative w-full bg-[#030915] py-16 px-4 sm:px-6"
      aria-label="Interactive chess engine playground"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #6e63f6 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          className="rounded-2xl overflow-hidden border border-[#1A2744]"
          style={{ background: '#0B1628', boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(110,99,246,0.1)' }}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          <div className="flex flex-col lg:flex-row">

            {/* ── LEFT: Eval bar + Board ───────────── */}
            <div className="flex flex-row w-full lg:w-[532px] shrink-0 mx-auto lg:mx-0">
              {/* Eval bar */}
              <div className="flex flex-col items-center justify-between w-8 shrink-0 bg-[#090F1D] border-r border-[#1A2744] py-2 gap-1">
                {/* Black portion */}
                <motion.div
                  className="w-3 rounded-b-full bg-[#1a1a1a] border border-[#333]"
                  style={{ height: `${100 - whitePercent}%` }}
                  animate={{ height: `${100 - whitePercent}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
                {/* White portion */}
                <motion.div
                  className="w-3 rounded-t-full bg-white/90"
                  style={{ height: `${whitePercent}%` }}
                  animate={{ height: `${whitePercent}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
                <span className="text-[0.55rem] text-text-muted font-mono mt-1 shrink-0">
                  {evalLabel}
                </span>
              </div>

              {/* Board */}
              <div className="flex flex-col flex-1 min-w-0">
                <div
                  className="relative w-full"
                  style={{ aspectRatio: '1' }}
                >
                  {/* Squares */}
                  <div className="absolute inset-0 grid grid-cols-8">
                    {boardSquares.map(({ sq, row, col, isLight }) => {
                      const isFrom = lastMove?.from === sq;
                      const isTo = lastMove?.to === sq;
                      const isSel = selectedSq === sq;
                      const isLegal = legalTargets.includes(sq);
                      const isHFrom = hintMove?.from === sq;
                      const isHTo = hintMove?.to === sq;
                      const pHere = gameRef.current.get(sq as Parameters<typeof gameRef.current.get>[0]);
                      const inCheck = gameRef.current.inCheck()
                        && pHere?.type === 'k'
                        && pHere.color === gameRef.current.turn();

                      let bg = isLight ? '#E8EDC8' : '#779556';
                      if (isFrom || isTo) bg = isLight ? '#F5F682' : '#CDD16E';
                      if (isSel) bg = isLight ? '#F5F682' : '#CDD16E';
                      if (isHFrom || isHTo) bg = isLight ? '#FDE68A' : '#D97706';
                      if (inCheck) bg = '#ef4444';

                      return (
                        <div
                          key={sq}
                          style={{ background: bg }}
                          className="relative cursor-pointer select-none"
                          onClick={() => handleSquareClick(sq)}
                        >
                          {col === 0 && (
                            <span className="absolute top-0.5 left-0.5 leading-none font-bold select-none pointer-events-none"
                              style={{ color: isLight ? '#779556' : '#E8EDC8', fontSize: '0.6rem' }}>
                              {8 - row}
                            </span>
                          )}
                          {row === 7 && (
                            <span className="absolute bottom-0.5 right-0.5 leading-none font-bold select-none pointer-events-none"
                              style={{ color: isLight ? '#779556' : '#E8EDC8', fontSize: '0.6rem' }}>
                              {FILES[col]}
                            </span>
                          )}
                          {/* Legal move: dot on empty, ring on capture */}
                          {isLegal && !pHere && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="rounded-full bg-black/22" style={{ width: '33%', height: '33%' }} />
                            </div>
                          )}
                          {isLegal && pHere && pHere.color !== 'w' && (
                            <div className="absolute inset-0 rounded-[1px] ring-[5px] ring-inset ring-black/28 pointer-events-none" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Piece layer — layoutId animation */}
                  <LayoutGroup id="ep-board">
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
                          exit={{ opacity: 0, scale: 0.15, transition: { duration: 0.18, ease: 'easeIn' } }}
                          transition={{
                            layout: { type: 'spring', stiffness: 1100, damping: 42, mass: 0.55 },
                          }}
                        >
                          <span
                            style={{
                              fontSize: 'clamp(1.1rem, 3.6vw, 2.15rem)',
                              color: p.color === 'w' ? '#F8F8F8' : '#111111',
                              textShadow: p.color === 'w'
                                ? '0 0 3px rgba(0,0,0,0.95), 0 1px 0 rgba(0,0,0,0.8)'
                                : '0 0 1px rgba(255,255,255,0.1)',
                              ...(selectedSq === p.square
                                ? { filter: 'brightness(1.4) drop-shadow(0 0 8px rgba(245,246,130,0.85))' }
                                : {}),
                              transition: 'filter 0.15s ease',
                            }}
                          >
                            {SYMBOLS[p.color][p.type]}
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </LayoutGroup>

                  {/* Game over overlay */}
                  <AnimatePresence>
                    {gameStatus && (
                      <motion.div
                        className="absolute inset-0 flex flex-col items-center justify-center z-20 rounded"
                        style={{ background: 'rgba(0,0,0,0.62)' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      >
                        <motion.div
                          className="bg-brand-surface border border-brand-border rounded-2xl px-8 py-6 text-center"
                          initial={{ scale: 0.75, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        >
                          <p className="text-2xl mb-2">♟</p>
                          <p className="text-white font-black text-lg">{gameStatus}</p>
                          <motion.button
                            onClick={handleReset}
                            className="mt-4 px-5 py-2 rounded-xl bg-brand-accent text-white text-sm font-bold cursor-pointer"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                          >
                            New Game
                          </motion.button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Turn indicator */}
                <div className="flex items-center gap-2 px-3 py-2 bg-[#090F1D] border-t border-[#1A2744]">
                  <motion.span
                    className={`w-3 h-3 rounded-full border ${gameRef.current.turn() === 'w' ? 'bg-white border-gray-300' : 'bg-gray-900 border-gray-500'}`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    key={tick}
                  />
                  <span className="text-xs text-text-secondary font-medium">
                    {isAIThinking
                      ? 'AI thinking...'
                      : gameRef.current.turn() === 'w'
                        ? "White's Turn"
                        : "Black's Turn"}
                  </span>
                  {isAIThinking && (
                    <div className="flex gap-0.5 ml-1">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-1 h-3 rounded-full bg-brand-accent"
                          animate={{ scaleY: [0.6, 1.3, 0.6] }}
                          transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Controls ──────────────────── */}
            <div className="flex-1 flex flex-col p-5 gap-4 border-t lg:border-t-0 lg:border-l border-[#1A2744] min-w-[220px] relative">

              {isEditMode ? (
                /* ════════ EDIT MODE PANEL ════════ */
                <>
                  {/* Close button */}
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="absolute top-3 right-3 text-text-muted hover:text-white text-lg leading-none transition-colors cursor-pointer z-10"
                    aria-label="Close edit mode"
                  >✕</button>

                  {/* White pieces palette */}
                  <div className="flex gap-1.5 flex-wrap">
                    {EDIT_W.map(p => {
                      const isActive = typeof editTool === 'object' && editTool.color === 'w' && editTool.type === p.type;
                      return (
                        <button
                          key={p.sym}
                          onClick={() => setEditTool({ color: 'w', type: p.type })}
                          className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all cursor-pointer border ${isActive ? 'bg-brand-accent/20 border-brand-accent text-white' : 'bg-brand-surface border-brand-border hover:border-brand-accent/50 text-white/80'}`}
                        >{p.sym}</button>
                      );
                    })}
                  </div>

                  {/* Black pieces palette */}
                  <div className="flex gap-1.5 flex-wrap">
                    {EDIT_B.map(p => {
                      const isActive = typeof editTool === 'object' && editTool.color === 'b' && editTool.type === p.type;
                      return (
                        <button
                          key={p.sym}
                          onClick={() => setEditTool({ color: 'b', type: p.type })}
                          className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all cursor-pointer border ${isActive ? 'bg-brand-accent/20 border-brand-accent text-white' : 'bg-brand-surface border-brand-border hover:border-brand-accent/50 text-white/80'}`}
                        >{p.sym}</button>
                      );
                    })}
                  </div>

                  {/* Cursor / Eraser toggle */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditTool('cursor')}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border ${editTool === 'cursor' ? 'bg-brand-accent/20 border-brand-accent text-white' : 'bg-brand-surface border-brand-border text-text-muted hover:border-brand-accent/40'}`}
                    >☝ Cursor</button>
                    <button
                      onClick={() => setEditTool('eraser')}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border ${editTool === 'eraser' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-brand-surface border-brand-border text-text-muted hover:border-red-500/40'}`}
                    >◇ Eraser</button>
                  </div>

                  {/* Side to move */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditToMove('w')}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${editToMove === 'w' ? 'bg-brand-accent text-white' : 'bg-brand-surface text-text-muted border border-brand-border hover:border-brand-accent/40'}`}
                    >White to move</button>
                    <button
                      onClick={() => setEditToMove('b')}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${editToMove === 'b' ? 'bg-brand-accent text-white' : 'bg-brand-surface text-text-muted border border-brand-border hover:border-brand-accent/40'}`}
                    >Black to move</button>
                  </div>

                  {/* Castling rights */}
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider mb-1">White</p>
                      <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
                        <input type="checkbox" checked={editCastle.K} onChange={e => setEditCastle(c => ({ ...c, K: e.target.checked }))} className="accent-brand-accent" /> (O-O)
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
                        <input type="checkbox" checked={editCastle.Q} onChange={e => setEditCastle(c => ({ ...c, Q: e.target.checked }))} className="accent-brand-accent" /> (O-O-O)
                      </label>
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider mb-1">Black</p>
                      <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
                        <input type="checkbox" checked={editCastle.k} onChange={e => setEditCastle(c => ({ ...c, k: e.target.checked }))} className="accent-brand-accent" /> (O-O)
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
                        <input type="checkbox" checked={editCastle.q} onChange={e => setEditCastle(c => ({ ...c, q: e.target.checked }))} className="accent-brand-accent" /> (O-O-O)
                      </label>
                    </div>
                  </div>

                  {/* FEN display */}
                  <input
                    type="text"
                    value={editFen}
                    onChange={e => handleLoadPosition(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white text-[0.6rem] font-mono focus:outline-none focus:border-brand-accent/60 transition-colors"
                    spellCheck={false}
                  />

                  {/* Quick actions */}
                  <div className="flex flex-col gap-1.5">
                    {[
                      { icon: '🗑', label: 'Clear', action: () => handleLoadPosition('8/8/8/8/8/8/8/8 w - - 0 1') },
                      { icon: '♟', label: 'Starting Position', action: () => handleLoadPosition(STARTING_FEN) },
                      { icon: '⇄', label: 'Shuffle', action: () => handleLoadPosition(generateChess960FEN()) },
                    ].map(item => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="w-full py-2 rounded-xl text-sm font-semibold text-text-secondary bg-brand-surface border border-brand-border hover:text-white hover:border-brand-accent/40 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>{item.icon}</span> {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Load / Save button */}
                  <motion.button
                    onClick={saveEditPosition}
                    className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #5B6EF5, #6e63f6)' }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  >
                    Load
                  </motion.button>
                </>
              ) : (
                /* ════════ NORMAL GAME CONTROLS ════════ */
                <>
                  {/* Control buttons */}
                  <div className="flex items-center gap-2 relative">
                    {ctrlBtns.map(btn => {
                      const isActive = activeBtn === btn.id;
                      const activeColor = btn.color ?? '#6e63f6';
                      return (
                        <motion.button
                          key={btn.id}
                          id={`ep-${btn.id}`}
                          type="button"
                          onClick={btn.action}
                          className="flex-1 flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl transition-all duration-200 cursor-pointer border"
                          style={{
                            color: isActive ? activeColor : '#8899B4',
                            borderColor: isActive ? activeColor : '#1A2744',
                            background: isActive ? `${activeColor}18` : 'transparent',
                          }}
                          whileHover={{ scale: 1.05, color: '#fff' }}
                          whileTap={{ scale: 0.93 }}
                          aria-label={btn.label}
                          aria-pressed={isActive}
                        >
                          {btn.icon}
                          <span className="text-[0.6rem] font-semibold tracking-wide">{btn.label}</span>
                        </motion.button>
                      );
                    })}

                    {/* "More" dropdown */}
                    <AnimatePresence>
                      {showMore && (
                        <motion.div
                          className="absolute top-full right-0 mt-2 w-44 rounded-xl border border-[#1A2744] overflow-hidden z-30"
                          style={{ background: '#0F1C33', boxShadow: '0 12px 36px rgba(0,0,0,0.5)' }}
                          initial={{ opacity: 0, scale: 0.88, y: -8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.88, y: -8 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          {[
                            {
                              icon: '⇄', label: 'Chess960',
                              action: () => { setShowMore(false); handleChess960(); },
                            },
                            {
                              icon: '✏️', label: 'Edit Position',
                              action: () => { setShowMore(false); enterEditMode(); },
                            },
                          ].map(item => (
                            <button
                              key={item.label}
                              onClick={item.action}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-all cursor-pointer text-left"
                            >
                              <span>{item.icon}</span>
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Difficulty selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Difficulty</span>
                      <span className="text-xs font-bold text-brand-accent">{DIFFICULTY_LABELS[difficulty]}</span>
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(d => (
                        <motion.button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={`flex-1 h-9 rounded-lg text-sm font-black transition-all duration-200 cursor-pointer border ${difficulty === d
                              ? 'bg-brand-accent text-white border-brand-accent shadow-lg'
                              : 'bg-transparent text-text-muted border-[#1A2744] hover:border-brand-accent/40 hover:text-white'
                            }`}
                          style={difficulty === d ? { boxShadow: '0 0 14px rgba(110,99,246,0.5)' } : {}}
                          whileTap={{ scale: 0.93 }}
                          aria-pressed={difficulty === d}
                          aria-label={DIFFICULTY_LABELS[d]}
                        >
                          {d}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Move log */}
                  <div
                    ref={moveLogRef}
                    className="flex-1 rounded-xl border border-[#1A2744] overflow-y-auto font-mono text-sm"
                    style={{ background: '#090F1D', minHeight: 140, maxHeight: 260, padding: '12px' }}
                    role="log"
                    aria-label="Move history"
                    aria-live="polite"
                  >
                    {moveHistory.length === 0 ? (
                      <p className="text-text-muted text-xs">No moves yet. Make a move on the board.</p>
                    ) : (
                      moveHistory.map(({ n, w, b }) => (
                        <motion.div
                          key={n}
                          className="flex gap-3 py-0.5 text-xs"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-text-muted w-5 shrink-0">{n}.</span>
                          <span className="text-white font-semibold w-14">{w}</span>
                          {b && <span className="text-text-secondary">{b}</span>}
                        </motion.div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Click outside to close More menu */}
      {showMore && (
        <div className="fixed inset-0 z-20" onClick={() => setShowMore(false)} aria-hidden="true" />
      )}
    </section>
  );
}
