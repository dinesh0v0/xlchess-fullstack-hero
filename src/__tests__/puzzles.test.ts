/**
 * Puzzle Data Integrity Tests
 * 
 * Validates that all puzzle FENs are legal chess positions,
 * solution moves are valid, and data structure is complete.
 */
import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { puzzles } from '../data/puzzles';

describe('Puzzle Data Integrity', () => {
  it('should have at least 1 puzzle', () => {
    expect(puzzles.length).toBeGreaterThan(0);
  });

  it('every puzzle has required fields', () => {
    puzzles.forEach((p, i) => {
      expect(p.id, `Puzzle index ${i} missing id`).toBeDefined();
      expect(p.fen, `Puzzle ${p.id} missing fen`).toBeTruthy();
      expect(p.title, `Puzzle ${p.id} missing title`).toBeTruthy();
      expect(p.description, `Puzzle ${p.id} missing description`).toBeTruthy();
      expect(p.solution, `Puzzle ${p.id} missing solution`).toBeDefined();
      expect(p.solution.length, `Puzzle ${p.id} has empty solution`).toBeGreaterThan(0);
      expect(p.difficultyLabel, `Puzzle ${p.id} missing difficultyLabel`).toBeTruthy();
      expect(['w', 'b'], `Puzzle ${p.id} invalid playerColor`).toContain(p.playerColor);
    });
  });

  it('every puzzle has unique IDs', () => {
    const ids = puzzles.map(p => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('every puzzle FEN is a valid chess position with both kings', () => {
    puzzles.forEach((p) => {
      const game = new Chess();
      let loaded = false;
      try {
        game.load(p.fen);
        loaded = true;
      } catch {
        loaded = false;
      }
      expect(loaded, `Puzzle ${p.id} ("${p.title}") has invalid FEN: ${p.fen}`).toBe(true);

      // Verify both kings exist
      const board = game.board();
      const allPieces = board.flat().filter(Boolean);
      const hasWhiteKing = allPieces.some(piece => piece?.type === 'k' && piece?.color === 'w');
      const hasBlackKing = allPieces.some(piece => piece?.type === 'k' && piece?.color === 'b');
      expect(hasWhiteKing, `Puzzle ${p.id} missing white king`).toBe(true);
      expect(hasBlackKing, `Puzzle ${p.id} missing black king`).toBe(true);
    });
  });

  it('the first solution move is legal in every puzzle', () => {
    puzzles.forEach((p) => {
      const game = new Chess(p.fen);
      const firstMove = p.solution[0];
      let moveResult = null;
      try {
        moveResult = game.move(firstMove);
      } catch {
        moveResult = null;
      }
      expect(moveResult, `Puzzle ${p.id} ("${p.title}") first move "${firstMove}" is illegal from FEN: ${p.fen}`).not.toBeNull();
    });
  });

  it('puzzle playerColor matches the FEN side-to-move', () => {
    puzzles.forEach((p) => {
      const game = new Chess(p.fen);
      expect(
        game.turn(),
        `Puzzle ${p.id}: playerColor "${p.playerColor}" doesn't match FEN turn "${game.turn()}"`
      ).toBe(p.playerColor);
    });
  });

  it('no puzzle has an empty board FEN', () => {
    puzzles.forEach((p) => {
      expect(p.fen, `Puzzle ${p.id} has empty board FEN`).not.toContain('8/8/8/8/8/8/8/8');
    });
  });
});
