/**
 * ChessBoard — Reusable chessboard renderer.
 *
 * Renders an 8×8 chess grid with:
 * - Alternating light/dark squares (matching dachess.com colors)
 * - Coordinate labels (a–h files, 1–8 ranks)
 * - Unicode chess piece rendering
 * - Square highlighting for last move
 * - Responsive sizing
 */

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ChessPiece, BoardPosition } from '../../types';

interface ChessBoardProps {
  /** 8x8 board state — row 0 is rank 8 (top of board) */
  position: BoardPosition;
  /** Squares to highlight (e.g., last move) as [row, col] tuples */
  highlightedSquares?: [number, number][];
  /** Board orientation (defaults to white) */
  boardOrientation?: 'white' | 'black';
}

/** Unicode piece map */
const PIECE_SYMBOLS: Record<string, Record<string, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙',
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟',
  },
};

const FILE_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

function getPieceSymbol(piece: ChessPiece): string {
  return PIECE_SYMBOLS[piece.color]?.[piece.type] ?? '';
}

function isHighlighted(
  row: number,
  col: number,
  highlighted?: [number, number][]
): boolean {
  return highlighted?.some(([r, c]) => r === row && c === col) ?? false;
}

const ChessBoard = memo(function ChessBoard({
  position,
  highlightedSquares,
  boardOrientation = 'white',
}: ChessBoardProps) {
  const board = useMemo(() => {
    const squares: React.ReactNode[] = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0;
        const boardRow = boardOrientation === 'black' ? 7 - row : row;
        const boardCol = boardOrientation === 'black' ? 7 - col : col;
        
        const highlighted = isHighlighted(boardRow, boardCol, highlightedSquares);
        const piece = position[boardRow]?.[boardCol] ?? null;
        
        const rank = 8 - boardRow;
        const file = FILE_LABELS[boardCol];

        let bgClass: string;
        if (highlighted) {
          bgClass = 'bg-board-highlight';
        } else {
          bgClass = isLight ? 'bg-board-light' : 'bg-board-dark';
        }

        squares.push(
          <div
            key={`${row}-${col}`}
            className={`relative flex items-center justify-center ${bgClass} aspect-square`}
            aria-label={`${file}${rank}${piece ? ` ${piece.color} ${piece.type}` : ''}`}
          >
            {/* Rank label on the leftmost column */}
            {col === 0 && (
              <span
                className={`absolute top-0.5 left-0.5 text-[0.55rem] font-semibold leading-none select-none ${
                  isLight ? 'text-board-dark' : 'text-board-light'
                }`}
              >
                {rank}
              </span>
            )}

            {/* File label on the bottom row */}
            {row === 7 && (
              <span
                className={`absolute bottom-0.5 right-1 text-[0.55rem] font-semibold leading-none select-none ${
                  isLight ? 'text-board-dark' : 'text-board-light'
                }`}
              >
                {file}
              </span>
            )}

            {/* Chess piece */}
            {piece && (
              <motion.span
                className="text-[clamp(1.5rem,3.5vw,2.5rem)] leading-none select-none drop-shadow-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, y: [0, -2, 0] }}
                transition={{ 
                  opacity: { duration: 0.3 }, 
                  scale: { duration: 0.3 },
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{
                  filter:
                    piece.color === 'white'
                      ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.5)) drop-shadow(0 0 10px rgba(255,255,255,0.2))'
                      : 'drop-shadow(0 4px 6px rgba(0,0,0,0.8)) drop-shadow(0 0 10px rgba(0,0,0,0.5))',
                }}
              >
                {getPieceSymbol(piece)}
              </motion.span>
            )}
          </div>
        );
      }
    }

    return squares;
  }, [position, highlightedSquares, boardOrientation]);

  return (
    <div
      className="grid grid-cols-8 border border-[#d4af37]/40 rounded-lg overflow-hidden relative"
      style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(212,175,55,0.15)' }}
      role="img"
      aria-label="Chess board showing The Evergreen Game position"
    >
      {/* Subtle glass overlay to tie colors together */}
      <div className="absolute inset-0 pointer-events-none bg-white/5 mix-blend-overlay" />
      {board}
    </div>
  );
});

export default ChessBoard;
