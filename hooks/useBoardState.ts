"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Board } from "@/types/board";
import { DEFAULT_BOARD } from "@/utils/constants";

const STORAGE_KEY_PREFIX = 'agwakwagan';
const SAVE_DEBOUNCE_MS = 1000; // 1 second

export interface StorageStatus {
  lastSaved: Date | null;
  saving: boolean;
  error: string | null;
}

/**
 * Board State Hook
 *
 * Manages board data and persistence with debounced auto-save.
 * Integrates storage adapter pattern with debounced localStorage.
 */
export function useBoardState(boardId: string = "board-default") {
  const defaultBoard = { ...DEFAULT_BOARD, id: boardId };
  const storageKey = `${STORAGE_KEY_PREFIX}-${boardId}`;

  // Initialize state from localStorage or default
  const [board, setBoardInternal] = useState<Board>(() => {
    try {
      if (typeof window === 'undefined') {
        return defaultBoard;
      }
      const item = window.localStorage.getItem(storageKey);
      if (!item) {
        return defaultBoard;
      }

      // Parse and hydrate dates
      const parsed = JSON.parse(item) as Board;
      parsed.metadata.createdAt = new Date(parsed.metadata.createdAt);
      parsed.metadata.updatedAt = new Date(parsed.metadata.updatedAt);
      Object.values(parsed.cards).forEach((card) => {
        card.createdAt = new Date(card.createdAt);
        card.updatedAt = new Date(card.updatedAt);
        card.notes.forEach((note) => {
          note.createdAt = new Date(note.createdAt);
        });
      });

      return parsed;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return defaultBoard;
    }
  });

  const [storageStatus, setStorageStatus] = useState<StorageStatus>({
    lastSaved: null,
    saving: false,
    error: null
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mark as loaded once we have board data
  useEffect(() => {
    if (board) {
      setIsLoaded(true);
    }
  }, [board]);

  // Save to localStorage (debounced)
  const setBoard = useCallback((newBoard: Board) => {
    setBoardInternal(newBoard);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set saving state
    setStorageStatus(prev => ({ ...prev, saving: true, error: null }));

    // Debounce save
    saveTimeoutRef.current = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(storageKey, JSON.stringify(newBoard));
          setStorageStatus({
            lastSaved: new Date(),
            saving: false,
            error: null
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        setStorageStatus({
          lastSaved: null,
          saving: false,
          error: `Failed to save: ${message}`
        });
        console.error('Failed to save to localStorage:', error);
      }
    }, SAVE_DEBOUNCE_MS);
  }, [storageKey]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    board: board || defaultBoard,
    setBoard,
    isLoaded,
    storageStatus,
  };
}
