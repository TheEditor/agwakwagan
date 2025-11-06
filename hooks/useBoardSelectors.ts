"use client";

import { useCallback, useMemo } from "react";
import { Board, Card, ColumnWithCards } from "@/types/board";

/**
 * Board Selectors Hook
 *
 * Provides derived data and queries from board state.
 * All selectors are memoized for performance.
 */
export function useBoardSelectors(board: Board | null) {
  /**
   * Get all cards for a specific column, sorted by order
   *
   * @param columnId - Column to get cards from
   * @returns Array of cards, sorted by order (ascending)
   */
  const getColumnCards = useCallback(
    (columnId: string): Card[] => {
      if (!board) return [];

      return Object.values(board.cards)
        .filter((card) => card.columnId === columnId)
        .sort((a, b) => a.order - b.order);
    },
    [board?.cards]
  ); // Only depend on cards, not entire board

  /**
   * Get a single column with its cards
   *
   * @param columnId - Column ID
   * @returns Column with cards array, or null if not found
   */
  const getColumnWithCards = useCallback(
    (columnId: string): ColumnWithCards | null => {
      if (!board) return null;

      const column = board.columns[columnId];
      if (!column) return null;

      return {
        ...column,
        cards: getColumnCards(columnId),
      };
    },
    [board?.columns, getColumnCards]
  );

  /**
   * Get all columns with their cards, in display order
   *
   * This is the main selector used by KanbanBoard component.
   * Memoized to prevent unnecessary recalculations.
   *
   * @returns Array of columns with cards, in columnOrder sequence
   */
  const getAllColumnsWithCards = useMemo((): ColumnWithCards[] => {
    if (!board) return [];

    return board.columnOrder
      .map((columnId) => getColumnWithCards(columnId))
      .filter((column): column is ColumnWithCards => column !== null);
  }, [board?.columnOrder, getColumnWithCards]);

  /**
   * Get total number of cards across all columns
   *
   * @returns Total card count
   */
  const getTotalCardCount = useMemo((): number => {
    if (!board) return 0;
    return Object.keys(board.cards).length;
  }, [board?.cards]);

  /**
   * Get number of cards in a specific column
   *
   * @param columnId - Column ID
   * @returns Number of cards in that column
   */
  const getColumnCardCount = useCallback(
    (columnId: string): number => {
      if (!board) return 0;

      return Object.values(board.cards).filter(
        (card) => card.columnId === columnId
      ).length;
    },
    [board?.cards]
  );

  /**
   * Get a single card by ID
   *
   * @param cardId - Card ID
   * @returns Card object or null if not found
   */
  const getCardById = useCallback(
    (cardId: string): Card | null => {
      if (!board) return null;
      return board.cards[cardId] || null;
    },
    [board?.cards]
  );

  /**
   * Check if a column exists
   *
   * @param columnId - Column ID
   * @returns True if column exists
   */
  const columnExists = useCallback(
    (columnId: string): boolean => {
      if (!board) return false;
      return columnId in board.columns;
    },
    [board?.columns]
  );

  /**
   * Get all column IDs in order
   *
   * @returns Array of column IDs
   */
  const getColumnOrder = useMemo((): string[] => {
    if (!board) return [];
    return [...board.columnOrder]; // Return copy to prevent mutations
  }, [board?.columnOrder]);

  return {
    // Primary selectors
    getColumnCards,
    getColumnWithCards,
    getAllColumnsWithCards,

    // Utility selectors
    getTotalCardCount,
    getColumnCardCount,
    getCardById,
    columnExists,
    getColumnOrder,
  };
}
