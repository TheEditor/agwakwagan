import { NextRequest } from 'next/server';

/**
 * Authentication provider interface
 *
 * Implement this interface to add new authentication strategies.
 * Examples: API keys, JWT tokens, OAuth 2.0, service accounts
 *
 * The provider pattern allows swapping authentication methods without
 * changing route handler code.
 */
export interface AuthProvider {
  /**
   * Authenticate a request for access to a specific board
   *
   * @param request - The HTTP request from the client
   * @param boardId - The board ID being accessed
   * @returns Promise<boolean> - true if authenticated, false otherwise
   */
  authenticate(request: NextRequest, boardId: string): Promise<boolean>;
}
