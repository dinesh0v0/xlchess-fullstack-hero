/**
 * Core TypeScript interfaces for the XLChess application.
 * Provides strict type safety across the frontend.
 */

// ──────────────────────────────────────────────────
// Authentication Types
// ──────────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  elo_rating: number;
  games_played: number;
  games_won: number;
  win_rate: number;
  avatar_url: string;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  display_name?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

// ──────────────────────────────────────────────────
// Chess / Game Types
// ──────────────────────────────────────────────────

export type PieceColor = 'white' | 'black';

export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export type BoardPosition = (ChessPiece | null)[][];

export interface GameState {
  id: number;
  white_player_name: string;
  black_player_name: string | null;
  status: 'waiting' | 'active' | 'completed' | 'abandoned';
  result: 'white' | 'black' | 'draw' | 'none';
  fen: string;
  pgn: string;
  time_control: number;
  created_at: string;
  updated_at: string;
}

export interface PuzzleData {
  title: string;
  description: string;
  fen: string;
  moves_left: number;
  game_info: {
    white: string;
    black: string;
    year: number;
  };
}

// ──────────────────────────────────────────────────
// API Types
// ──────────────────────────────────────────────────

export interface ApiError {
  error?: string;
  detail?: string;
  [key: string]: unknown;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
}
