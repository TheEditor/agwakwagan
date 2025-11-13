import { NextRequest, NextResponse } from 'next/server';
import { AuthProvider } from './auth/provider';
import { ApiKeyAuthProvider } from './auth/apiKeyProvider';

/**
 * Dependency injection for authentication provider
 *
 * Change this line to swap authentication strategies:
 * - new ApiKeyAuthProvider() ← Current (API keys)
 * - new JwtAuthProvider() ← Future (JWT tokens)
 * - new OAuth2Provider() ← Future (OAuth 2.0)
 *
 * No other code changes needed when switching providers.
 */
const authProvider: AuthProvider = new ApiKeyAuthProvider();

/**
 * Helper to wrap authenticated API routes
 *
 * @param handler - The route handler to protect
 * @param boardIdParam - The name of the boardId parameter (default: 'boardId')
 * @returns Wrapped handler that checks authentication first
 *
 * @example
 * export const GET = withAuth(async (request, { params }) => {
 *   // Route logic here
 * });
 */
export function withAuth(
  handler: (req: NextRequest, params: any) => Promise<NextResponse>,
  boardIdParam: string = 'boardId'
) {
  return async (request: NextRequest, context: any) => {
    try {
      // Get boardId from dynamic route params
      // In Next.js 16, params is a Promise that must be awaited
      const params = await context.params;
      const boardId = params[boardIdParam];

      // Delegate authentication to provider
      const isAuthenticated = await authProvider.authenticate(request, boardId);

      if (!isAuthenticated) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Authentication passed, call the handler
      return handler(request, context);
    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  };
}
