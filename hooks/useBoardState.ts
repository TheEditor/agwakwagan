"use client";

import { useState, useEffect, useCallback } from "react";
import { Board } from "@/types/board";
import { useLocalStorageAdapter } from "./useStorageAdapter";

/**
 * Board State Hook
 *
 * Manages board data and persistence via storage adapter.
 * No business logic here - just state and storage.
 */
export function useBoardState(boardId: string = "board-default") {
  const adapter = useLocalStorageAdapter();
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load board on mount
  useEffect(() => {
    adapter.loadBoard(boardId).then((loadedBoard) => {
      setBoard(loadedBoard);
      setIsLoaded(true);
    });
  }, [boardId, adapter]);

  // Save board whenever it changes
  const saveBoardToStorage = useCallback(
    (newBoard: Board) => {
      console.log("saveBoardToStorage called");
      setBoard(newBoard);
      // Defer save to next tick to avoid blocking render
      Promise.resolve().then(() => {
        console.log("Starting async save to storage");
        return adapter.saveBoard(newBoard);
      }).catch((error) => {
        console.error("Failed to save board:", error);
      });
    },
    [adapter]
  );

  return {
    board,
    setBoard: saveBoardToStorage,
    isLoaded,
  };
}
