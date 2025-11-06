"use client";

import { useCallback } from "react";
import { Board } from "@/types/board";

/**
 * Board Actions Hook
 *
 * Contains all business logic for mutations.
 * Placeholder for now - will be implemented in Phase 1.
 */
export function useBoardActions(
  board: Board | null,
  setBoard: (board: Board) => void
) {
  // Placeholder actions - will implement in Phase 1
  const addCard = useCallback(
    (columnId: string, title: string) => {
      console.log("addCard will be implemented in Phase 1");
    },
    [board, setBoard]
  );

  const moveCard = useCallback(
    (cardId: string, toColumnId: string, newOrder: number) => {
      console.log("moveCard will be implemented in Phase 2");
    },
    [board, setBoard]
  );

  const updateCard = useCallback(
    (cardId: string, updates: Partial<any>) => {
      console.log("updateCard will be implemented in Phase 3");
    },
    [board, setBoard]
  );

  const deleteCard = useCallback(
    (cardId: string) => {
      console.log("deleteCard will be implemented in Phase 3");
    },
    [board, setBoard]
  );

  return {
    addCard,
    moveCard,
    updateCard,
    deleteCard,
  };
}
