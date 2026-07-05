/**
 * Game service layer for chess game state management.
 *
 * Demonstrates WebSocket-ready architecture — these REST endpoints
 * handle initial state; real-time moves would use WebSocket channels.
 */

import apiClient from './client';
import type { GameState } from '../types';

/**
 * Get a list of active/waiting game sessions.
 * GET /api/game/
 */
export async function listGames(): Promise<GameState[]> {
  const { data } = await apiClient.get<GameState[]>('/game/');
  return data;
}

/**
 * Get a specific game session's state.
 * GET /api/game/:id/
 */
export async function getGameState(gameId: number): Promise<GameState> {
  const { data } = await apiClient.get<GameState>(`/game/${gameId}/`);
  return data;
}

/**
 * Create a new game session.
 * POST /api/game/create/
 */
export async function createGame(timeControl: number = 600): Promise<GameState> {
  const { data } = await apiClient.post<GameState>('/game/create/', {
    time_control: timeControl,
  });
  return data;
}

/**
 * Placeholder for WebSocket move submission.
 * In production, this would open a WebSocket channel to:
 * ws://api.xlchess.com/ws/game/<game_id>/
 *
 * For the hero section demo, this demonstrates the intended architecture.
 */
export function connectToGame(_gameId: number): void {
  // Future: const ws = new WebSocket(`${WS_BASE_URL}/ws/game/${gameId}/`);
  console.info('[Game] WebSocket connection would be established here for real-time play.');
}
