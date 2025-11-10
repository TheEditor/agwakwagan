"use client";

import { useBoardState } from "./useBoardState";
import { useBoardActions } from "./useBoardActions";
import { useBoardSelectors } from "./useBoardSelectors";

/**
 * Board Hook (Composition)
 *
 * Combines all board-related hooks into single API.
 * This is the main hook components will use.
 * Includes storage status for UI feedback on save state.
 */
export function useBoard(boardId?: string) {
  const { board, setBoard, isLoaded, storageStatus } = useBoardState(boardId);
  const actions = useBoardActions(board, setBoard);
  const selectors = useBoardSelectors(board);

  return {
    // State
    board,
    setBoard,
    isLoaded,

    // Storage
    storageStatus,

    // Actions
    ...actions,

    // Selectors
    ...selectors,
  };
}
