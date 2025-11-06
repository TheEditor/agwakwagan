"use client";

import { useCallback, useMemo } from "react";
import { Board, Card, ColumnWithCards } from "@/types/board";

/**
 * Board Selectors Hook
 *
 * Contains derived data and queries.
 * Memoized for performance.
 * Placeholder for now - will be implemented in Phase 1.
 */
export function useBoardSelectors(board: Board | null) {
  // Placeholder selectors - will implement in Phase 1
  const getColumnCards = useCallback(
    (columnId: string): Card[] => {
      if (!board) return [];
      return Object.values(board.cards)
        .filter((card) => card.columnId === columnId)
        .sort((a, b) => a.order - b.order);
    },
    [board]
  );

  const getAllColumnsWithCards = useMemo((): ColumnWithCards[] => {
    if (!board) return [];

    return board.columnOrder
      .map((colId) => {
        const column = board.columns[colId];
        if (!column) return null;

        return {
          ...column,
          cards: getColumnCards(colId),
        };
      })
      .filter((col): col is ColumnWithCards => col !== null);
  }, [board, getColumnCards]);

  return {
    getColumnCards,
    getAllColumnsWithCards,
  };
}
