import { NextRequest } from 'next/server';
import { AuthProvider } from './provider';

/**
 * JWT authentication provider (future implementation)
 *
 * This is a skeleton for future JWT-based authentication.
 * When implemented, it will:
 * - Extract JWT from Authorization header
 * - Verify token signature
 * - Check token expiration
 * - Validate board access claims
 *
 * TODO: Implement JWT validation logic
 */
export class JwtAuthProvider implements AuthProvider {
  async authenticate(request: NextRequest, boardId: string): Promise<boolean> {
    // TODO: Implement JWT validation
    // 1. Extract JWT from Authorization header (Bearer <token>)
    // 2. Verify signature using secret/public key
    // 3. Check expiration (exp claim)
    // 4. Validate board access (claims like 'boards: ["board-1", "board-2"]')
    // 5. Return true if valid, false otherwise
    throw new Error('JWT authentication not yet implemented');
  }
}
