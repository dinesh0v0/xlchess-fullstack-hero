/**
 * GameVisual — Right column of the hero section.
 *
 * Displays the interactive chessboard showing "The Evergreen Game"
 * (Anderssen vs Dufresne, 1852) with:
 * - Full board state from a famous position
 * - "THE EVERGREEN GAME" title with game info
 * - "4 MOVES LEFT" badge
 * - "Autoplay in Progress..." status bar
 * - Framer Motion slide-in animation from the right
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import ChessBoard from './ChessBoard';
import type { BoardPosition } from '../../types';

/**
 * The Evergreen Game — Anderssen vs Dufresne, 1852
 * Position near the end of the game (famous sacrifice sequence).
 * Row 0 = rank 8 (top), Row 7 = rank 1 (bottom).
 */
const EVERGREEN_POSITION: BoardPosition = [
  // Rank 8
  [
    { type: 'rook', color: 'black' },
    null,
    null,
    { type: 'bishop', color: 'black' },
    null,
    { type: 'queen', color: 'black' },
    null,
    { type: 'rook', color: 'black' },
  ],
  // Rank 7
  [
    { type: 'pawn', color: 'black' },
    { type: 'pawn', color: 'black' },
    null,
    { type: 'bishop', color: 'black' },
    null,
    { type: 'pawn', color: 'black' },
    { type: 'pawn', color: 'black' },
    { type: 'pawn', color: 'black' },
  ],
  // Rank 6
  [
    null,
    null,
    null,
    null,
    { type: 'bishop', color: 'black' },
    null,
    null,
    { type: 'king', color: 'black' },
  ],
  // Rank 5
  [
    null,
    { type: 'bishop', color: 'white' },
    null,
    null,
    null,
    { type: 'pawn', color: 'white' },
    null,
    null,
  ],
  // Rank 4
  [
    null,
    null,
    null,
    null,
    { type: 'king', color: 'black' },
    null,
    null,
    null,
  ],
  // Rank 3
  [
    null,
    null,
    null,
    { type: 'queen', color: 'white' },
    null,
    { type: 'knight', color: 'black' },
    null,
    null,
  ],
  // Rank 2
  [
    { type: 'pawn', color: 'white' },
    null,
    null,
    null,
    null,
    null,
    { type: 'pawn', color: 'white' },
    { type: 'pawn', color: 'black' },
  ],
  // Rank 1
  [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    null,
    null,
    { type: 'rook', color: 'white' },
    { type: 'king', color: 'white' },
    null,
  ],
];

/** Last move highlight: King moved to g1 */
const HIGHLIGHTED_SQUARES: [number, number][] = [
  [7, 5], // f1 — rook was here
  [7, 6], // g1 — king castled to here
];

const GameVisual = memo(function GameVisual() {
  return (
    <motion.div
      className="relative w-full max-w-[520px] mx-auto lg:mx-0"
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
    >
      {/* Board container with glow effect */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ boxShadow: 'var(--shadow-board)' }}
      >
        {/* Chessboard */}
        <div className="bg-brand-surface-light p-1 sm:p-1.5">
          <ChessBoard
            position={EVERGREEN_POSITION}
            highlightedSquares={HIGHLIGHTED_SQUARES}
          />
        </div>

        {/* Game info bar */}
        <div className="bg-brand-surface-light px-4 py-3 flex items-center justify-between border-t border-brand-border">
          <div>
            <p className="text-[0.65rem] font-semibold tracking-[0.15em] text-text-muted uppercase">
              The Evergreen Game
            </p>
            <p className="text-sm font-semibold text-text-primary mt-0.5">
              Anderssen vs Dufresne, 1852
            </p>
          </div>

          {/* Moves left badge */}
          <div className="flex flex-col items-center border border-brand-accent/40 rounded-lg px-3 py-1.5">
            <span className="text-lg font-bold text-brand-accent leading-none">
              4
            </span>
            <span className="text-[0.6rem] font-semibold tracking-wider text-text-muted uppercase">
              Moves Left
            </span>
          </div>
        </div>

        {/* Autoplay status bar */}
        <div className="bg-brand-surface px-4 py-2.5 flex items-center justify-center gap-2 border-t border-brand-border/50">
          <motion.svg
            className="w-3.5 h-3.5 text-text-muted"
            viewBox="0 0 24 24"
            fill="currentColor"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M8 5v14l11-7z" />
          </motion.svg>
          <span className="text-xs text-text-muted font-medium tracking-wide">
            Autoplay in Progress...
          </span>
        </div>
      </div>
    </motion.div>
  );
});

export default GameVisual;
