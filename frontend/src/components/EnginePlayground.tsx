/**
 * EnginePlayground — Interactive AI engine chess section.
 * Third section matching xlchess.com: full-width chessboard with
 * Undo / Hint / Reset / More controls, difficulty selector, move log.
 */

import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { BoardPosition } from '../types';

// Starting position (rank 8 at top = row 0)
const START_POSITION: BoardPosition = [
  [
    { type: 'rook', color: 'black' }, { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' }, { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' }, { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' }, { type: 'rook', color: 'black' },
  ],
  Array(8).fill({ type: 'pawn', color: 'black' }),
  Array(8).fill(null), Array(8).fill(null),
  Array(8).fill(null), Array(8).fill(null),
  Array(8).fill({ type: 'pawn', color: 'white' }),
  [
    { type: 'rook', color: 'white' }, { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' }, { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' }, { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' }, { type: 'rook', color: 'white' },
  ],
];

const PIECE_SYMBOLS: Record<string, Record<string, string>> = {
  white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
  black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
};

const FILE_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Beginner (800)' },
  { value: 2, label: 'Easy (1200)' },
  { value: 3, label: 'Intermediate (1600)' },
  { value: 4, label: 'Advanced (2000)' },
  { value: 5, label: 'Master (3000+)' },
];

const EnginePlayground = memo(function EnginePlayground() {
  const [difficulty, setDifficulty] = useState(3);
  const [moveLog, setMoveLog] = useState<string[]>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [position] = useState<BoardPosition>(START_POSITION);
  const [turn] = useState<'white' | 'black'>('white');

  const handleSquareClick = useCallback((_row: number, _col: number) => {
    // Demo: just show selection feedback
    setSelected(prev => prev ? null : [_row, _col]);
    setMoveLog(prev => {
      if (prev.length === 0) return [`1.  e4`];
      return prev;
    });
  }, []);

  const handleReset = useCallback(() => {
    setMoveLog([]);
    setSelected(null);
  }, []);

  const currentDifficultyLabel = DIFFICULTY_LEVELS.find(d => d.value === difficulty)?.label ?? '';

  return (
    <section
      id="engine-playground"
      className="relative w-full bg-brand-navy py-16"
      aria-label="Engine playground"
    >
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          className="rounded-2xl overflow-hidden border border-brand-border bg-brand-surface-light"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
        >
          <div className="flex flex-col lg:flex-row">

            {/* Left — Eval bar + Board */}
            <div className="flex flex-row items-stretch">
              {/* Eval bar */}
              <div className="flex flex-col items-center justify-center w-8 bg-brand-surface border-r border-brand-border py-2 gap-2">
                <div className="flex-1 w-3 rounded-full bg-white/90" style={{ maxHeight: '50%' }} />
                <div className="flex-1 w-3 rounded-full bg-brand-border" />
                <span className="text-[0.55rem] text-text-muted font-mono mt-1">0.0</span>
              </div>

              {/* Board */}
              <div className="flex flex-col">
                <div className="grid grid-cols-8" style={{ width: 'clamp(280px, 48vw, 480px)' }}>
                  {position.map((rowArr, row) =>
                    rowArr.map((piece, col) => {
                      const isLight = (row + col) % 2 === 0;
                      const isSelected = selected?.[0] === row && selected?.[1] === col;
                      const rank = 8 - row;
                      const file = FILE_LABELS[col];

                      let bg = isLight ? '#E8EDC8' : '#779556';
                      if (isSelected) bg = '#F5F682';

                      return (
                        <button
                          key={`${row}-${col}`}
                          onClick={() => handleSquareClick(row, col)}
                          className="relative flex items-center justify-center aspect-square cursor-pointer border-0 p-0"
                          style={{ background: bg }}
                          aria-label={`${file}${rank}${piece ? ` ${piece.color} ${piece.type}` : ''}`}
                        >
                          {col === 0 && (
                            <span className="absolute top-0.5 left-0.5 text-[0.5rem] font-bold leading-none select-none"
                              style={{ color: isLight ? '#779556' : '#E8EDC8' }}>
                              {rank}
                            </span>
                          )}
                          {row === 7 && (
                            <span className="absolute bottom-0.5 right-1 text-[0.5rem] font-bold leading-none select-none"
                              style={{ color: isLight ? '#779556' : '#E8EDC8' }}>
                              {file}
                            </span>
                          )}
                          {piece && (
                            <span className="text-[clamp(1.1rem,3vw,2rem)] leading-none select-none"
                              style={{ filter: piece.color === 'white' ? 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))' : 'none' }}>
                              {PIECE_SYMBOLS[piece.color][piece.type]}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Turn indicator */}
                <div className="flex items-center gap-2 px-3 py-2 bg-brand-surface border-t border-brand-border">
                  <span className="w-3 h-3 rounded-full bg-white border border-brand-border" />
                  <span className="text-xs text-text-secondary font-medium">
                    {turn === 'white' ? "White's Turn" : "Black's Turn"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right — Controls panel */}
            <div className="flex-1 flex flex-col border-t lg:border-t-0 lg:border-l border-brand-border p-5 gap-5">

              {/* Control buttons */}
              <div className="flex items-center gap-3">
                {[
                  { id: 'undo', icon: '↩', label: 'Undo', action: () => {} },
                  { id: 'hint', icon: '💡', label: 'Hint', action: () => {} },
                  { id: 'reset', icon: '↺', label: 'Reset', action: handleReset },
                  { id: 'more', icon: '···', label: 'More', action: () => {} },
                ].map((btn) => (
                  <motion.button
                    key={btn.id}
                    id={`ctrl-${btn.id}`}
                    type="button"
                    onClick={btn.action}
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 border border-transparent hover:border-brand-border transition-all duration-200 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={btn.label}
                  >
                    <span className="text-base leading-none">{btn.icon}</span>
                    <span className="text-[0.65rem] font-medium">{btn.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Difficulty selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-text-secondary font-medium">Difficulty</span>
                  <span className="text-xs text-brand-accent font-semibold">{currentDifficultyLabel}</span>
                </div>
                <div className="flex gap-2">
                  {DIFFICULTY_LEVELS.map((d) => (
                    <motion.button
                      key={d.value}
                      type="button"
                      onClick={() => setDifficulty(d.value)}
                      className={`flex-1 h-8 rounded-md text-sm font-bold transition-all duration-200 cursor-pointer border ${
                        difficulty === d.value
                          ? 'bg-brand-accent text-white border-brand-accent'
                          : 'bg-brand-surface text-text-muted border-brand-border hover:border-brand-accent/40 hover:text-text-primary'
                      }`}
                      whileTap={{ scale: 0.96 }}
                      aria-label={d.label}
                      aria-pressed={difficulty === d.value}
                    >
                      {d.value}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Move log */}
              <div
                className="flex-1 rounded-xl border border-brand-border bg-brand-navy/60 p-3 min-h-[140px] overflow-y-auto font-mono text-sm"
                role="log"
                aria-label="Move log"
                aria-live="polite"
              >
                {moveLog.length === 0 ? (
                  <p className="text-text-muted text-xs">No moves yet. Make a move on the board.</p>
                ) : (
                  moveLog.map((move, i) => (
                    <p key={i} className="text-text-secondary">{move}</p>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

export default EnginePlayground;
