/**
 * Card and Column Lookup Utilities
 *
 * Helpers for finding cards and columns by their kanban-assigned hashes.
 * Used by API routes to map external hash references to internal IDs.
 */

import { Board } from '@/types/board';

/**
 * Find a card by its kanban-assigned hash
 *
 * External API clients reference cards using their hash (card-a3f2).
 * This function maps that hash to the internal card ID for lookups.
 *
 * @param board - The board to search in
 * @param cardHash - The hash to look for (format: card-xxxx)
 * @returns The internal card ID if found, undefined otherwise
 *
 * @example
 * const cardId = findCardByHash(board, 'card-a3f2');
 * if (cardId) {
 *   const card = board.cards[cardId];
 * }
 */
export function findCardByHash(
  board: Board,
  cardHash: string
): string | undefined {
  const entry = Object.entries(board.cards).find(
    ([_, card]) => card.cardHash === cardHash
  );
  return entry?.[0]; // Return internal card ID
}

/**
 * Find a column by its kanban-assigned hash
 *
 * External API clients reference columns using their hash (col-x9k2).
 * This function maps that hash to the internal column ID for lookups.
 *
 * @param board - The board to search in
 * @param columnHash - The hash to look for (format: col-xxxx)
 * @returns The internal column ID if found, undefined otherwise
 *
 * @example
 * const columnId = findColumnByHash(board, 'col-x9k2');
 * if (columnId) {
 *   const column = board.columns[columnId];
 * }
 */
export function findColumnByHash(
  board: Board,
  columnHash: string
): string | undefined {
  const entry = Object.entries(board.columns).find(
    ([_, column]) => column.columnHash === columnHash
  );
  return entry?.[0]; // Return internal column ID
}
