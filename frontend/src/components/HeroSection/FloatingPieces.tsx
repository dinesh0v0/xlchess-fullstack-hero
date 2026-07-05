/**
 * FloatingPieces — Decorative background chess piece silhouettes.
 *
 * Creates the subtle, translucent floating chess pieces visible
 * in the xlchess.com hero background. Uses CSS animations for
 * gentle floating motion without triggering React re-renders.
 */

import { memo } from 'react';
import { motion } from 'framer-motion';

interface FloatingPiece {
  id: string;
  symbol: string;
  className: string;
  style: React.CSSProperties;
}

const FLOATING_PIECES: FloatingPiece[] = [
  {
    id: 'knight-1',
    symbol: '♞',
    className: 'animate-float',
    style: { top: '8%', right: '38%', fontSize: '6rem', opacity: 0.04 },
  },
  {
    id: 'bishop-1',
    symbol: '♝',
    className: 'animate-float-delayed',
    style: { top: '18%', right: '42%', fontSize: '4rem', opacity: 0.03 },
  },
  {
    id: 'rook-1',
    symbol: '♜',
    className: 'animate-float-slow',
    style: { top: '5%', right: '30%', fontSize: '3.5rem', opacity: 0.03 },
  },
  {
    id: 'pawn-1',
    symbol: '♟',
    className: 'animate-float',
    style: { bottom: '15%', left: '5%', fontSize: '3rem', opacity: 0.03 },
  },
  {
    id: 'queen-1',
    symbol: '♛',
    className: 'animate-float-delayed',
    style: { bottom: '30%', right: '8%', fontSize: '3.5rem', opacity: 0.025 },
  },
];

const FloatingPieces = memo(function FloatingPieces() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {FLOATING_PIECES.map((piece) => (
        <motion.span
          key={piece.id}
          className={`absolute text-white ${piece.className}`}
          style={piece.style}
          initial={{ opacity: 0 }}
          animate={{ opacity: piece.style.opacity as number }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          {piece.symbol}
        </motion.span>
      ))}

      {/* Subtle radial glow behind the chessboard area */}
      <div
        className="absolute top-1/2 right-0 w-[600px] h-[600px] -translate-y-1/2 translate-x-1/4 rounded-full animate-glow-pulse"
        style={{
          background:
            'radial-gradient(circle, rgba(91,110,245,0.08) 0%, rgba(110,99,246,0.04) 40%, transparent 70%)',
        }}
      />
    </div>
  );
});

export default FloatingPieces;
