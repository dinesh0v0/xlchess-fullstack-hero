/**
 * Authentication service layer.
 *
 * Demonstrates how the "Sign Up" and "Play Now" CTAs
 * would interact with the Django REST API endpoints.
 */

import apiClient from './client';
import type { AuthResponse, RegisterPayload, LoginPayload, User } from '../types';

/**
 * Register a new user account.
 * POST /api/auth/register/
 */
export async function signUp(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register/', payload);
  return data;
}

/**
 * Log in with existing credentials.
 * POST /api/auth/login/
 */
export async function signIn(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login/', payload);
  return data;
}

/**
 * Log out the current user.
 * POST /api/auth/logout/
 */
export async function signOut(): Promise<void> {
  await apiClient.post('/auth/logout/');
}

/**
 * Get the currently authenticated user's profile.
 * GET /api/auth/me/
 */
export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/me/');
  return data;
}
