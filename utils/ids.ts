/**
 * ID Generation Utilities
 *
 * Pattern: {type}-{timestamp}-{random}
 * Example: card-1730867234567-a3b4c5d
 *
 * Benefits:
 * - Type prefix aids debugging
 * - Timestamp provides rough chronological sorting
 * - Random suffix prevents collisions
 * - Human-readable in exports
 */

/**
 * Generate a unique ID for a given entity type
 *
 * @param type - Type of entity (card, column, note, or board)
 * @returns Unique ID string
 *
 * @example
 * generateId('card') // => 'card-1730867234567-a3b4c5d'
 */
export function generateId(
  type: "card" | "column" | "note" | "board"
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${type}-${timestamp}-${random}`;
}

/**
 * Generate a unique board ID
 * Convenience wrapper for generateId('board')
 *
 * @returns Unique board ID string
 *
 * @example
 * generateBoardId() // => 'board-1730867234567-a3b4c5d'
 */
export function generateBoardId(): string {
  return generateId("board");
}

/**
 * Extract timestamp from an ID
 * Useful for debugging and sorting
 *
 * @param id - ID string
 * @returns Timestamp in milliseconds, or null if invalid format
 *
 * @example
 * getTimestampFromId('card-1730867234567-a3b4c5d') // => 1730867234567
 */
export function getTimestampFromId(id: string): number | null {
  const parts = id.split("-");
  if (parts.length < 2) return null;

  const timestamp = parseInt(parts[1], 10);
  return isNaN(timestamp) ? null : timestamp;
}

/**
 * Extract type from an ID
 *
 * @param id - ID string
 * @returns Entity type, or null if invalid format
 *
 * @example
 * getTypeFromId('card-1730867234567-a3b4c5d') // => 'card'
 */
export function getTypeFromId(id: string): string | null {
  const parts = id.split("-");
  return parts.length > 0 ? parts[0] : null;
}
