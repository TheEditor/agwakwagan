"use client";

import { useBoardState } from "./useBoardState";
import { useBoardActions } from "./useBoardActions";
import { useBoardSelectors } from "./useBoardSelectors";

/**
 * Board Hook (Composition)
 *
 * Combines all board-related hooks into single API.
 * This is the main hook components will use.
 */
export function useBoard(boardId?: string) {
  const { board, setBoard, isLoaded } = useBoardState(boardId);
  const actions = useBoardActions(board, setBoard);
  const selectors = useBoardSelectors(board);

  return {
    // State
    board,
    setBoard,
    isLoaded,

    // Actions
    ...actions,

    // Selectors
    ...selectors,
  };
}
