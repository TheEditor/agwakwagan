import { NextRequest } from 'next/server';
import { AuthProvider } from './provider';

interface ApiKeyConfig {
  name: string;
  boards: string[]; // '*' for all boards, or specific board IDs
}

/**
 * Simple API key authentication provider
 *
 * Loads API keys from environment variables with format:
 * - {SERVICE}_API_KEY=<key>
 *
 * Examples:
 * - BEADS_API_KEY=beads-key-abc123...
 * - CI_API_KEY=ci-key-xyz789...
 *
 * Keys are scoped to specific boards or all boards via '*'
 */
export class ApiKeyAuthProvider implements AuthProvider {
  private keys: Map<string, ApiKeyConfig>;

  constructor() {
    // Load API keys from environment
    this.keys = new Map<string, ApiKeyConfig>();

    // Load from environment variables
    if (process.env.BEADS_API_KEY) {
      this.keys.set(process.env.BEADS_API_KEY, {
        name: 'Beads Agent',
        boards: ['*'], // Access to all boards
      });
    }

    if (process.env.CI_API_KEY) {
      this.keys.set(process.env.CI_API_KEY, {
        name: 'CI/CD Pipeline',
        boards: ['board-ci'], // Restricted to specific board
      });
    }

    // Add more keys from environment as needed
    // Pattern: {SERVICE}_API_KEY environment variable
    // Examples:
    // if (process.env.AGENT_API_KEY) {
    //   this.keys.set(process.env.AGENT_API_KEY, {
    //     name: 'AI Agent',
    //     boards: ['*'],
    //   });
    // }
  }

  async authenticate(request: NextRequest, boardId: string): Promise<boolean> {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const apiKey = authHeader.substring(7); // Remove "Bearer " prefix
    const keyConfig = this.keys.get(apiKey);

    if (!keyConfig) {
      return false;
    }

    // Check if this key has access to this board
    if (keyConfig.boards.includes('*') || keyConfig.boards.includes(boardId)) {
      return true;
    }

    return false;
  }
}
