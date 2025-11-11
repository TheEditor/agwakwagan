"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Board } from "@/types/board";
import { DataSource } from "@/types/datasource";
import { DEFAULT_BOARD } from "@/utils/constants";
import { LocalStorageDataSource } from "@/lib/datasources/localStorage";

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
 * Supports pluggable DataSource for flexibility across storage backends.
 *
 * @param boardId - Board identifier (default: "board-default")
 * @param dataSource - Optional DataSource implementation (default: LocalStorageDataSource)
 */
export function useBoardState(
  boardId: string = "board-default",
  dataSource?: DataSource
) {
  const defaultBoard = { ...DEFAULT_BOARD, id: boardId };
  const source = dataSource || new LocalStorageDataSource();

  // Initialize state from data source or default
  const [board, setBoardInternal] = useState<Board>(() => {
    try {
      if (typeof window === 'undefined') {
        return defaultBoard;
      }

      // For now, load synchronously from localStorage
      // In the future, this could use async loading
      if (source.id === 'local-storage') {
        const STORAGE_KEY_PREFIX = 'agwakwagan';
        const storageKey = `${STORAGE_KEY_PREFIX}-${boardId}`;
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
      }

      return defaultBoard;
    } catch (error) {
      console.error('Failed to load board:', error);
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

  // Save to data source (debounced)
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
          // For localStorage compatibility, continue using direct save
          // Future: switch to async source.saveBoard(newBoard)
          if (source.id === 'local-storage') {
            const STORAGE_KEY_PREFIX = 'agwakwagan';
            const storageKey = `${STORAGE_KEY_PREFIX}-${newBoard.id}`;
            window.localStorage.setItem(storageKey, JSON.stringify(newBoard));
          }

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
        console.error('Failed to save board:', error);
      }
    }, SAVE_DEBOUNCE_MS);
  }, [source, boardId]);

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
