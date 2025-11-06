import { Board } from "@/types/board";
import { DEFAULT_BOARD } from "@/utils/constants";

/**
 * Storage Adapter Interface
 *
 * This abstraction allows swapping storage backends without
 * changing business logic. Phase 0-6 use localStorage,
 * Phase 7+ can use API backend.
 */
export interface StorageAdapter {
  /**
   * Load board data by ID
   * @param boardId - Board identifier
   * @returns Promise resolving to Board data
   */
  loadBoard(boardId: string): Promise<Board>;

  /**
   * Save board data
   * @param board - Complete board state
   */
  saveBoard(board: Board): Promise<void>;

  /**
   * Subscribe to external changes (optional)
   * Useful for real-time sync in Phase 7+
   */
  subscribeToChanges?(callback: (board: Board) => void): () => void;
}

/**
 * LocalStorage implementation of StorageAdapter
 * Used for Phase 0-6 (client-side only)
 */
export function useLocalStorageAdapter(): StorageAdapter {
  return {
    loadBoard: async (boardId: string): Promise<Board> => {
      try {
        const key = `agwakwagan-${boardId}`;
        const data = localStorage.getItem(key);

        if (!data) {
          // No saved board, return default with correct ID
          return { ...DEFAULT_BOARD, id: boardId };
        }

        // Parse and hydrate dates
        const board = JSON.parse(data) as Board;

        // Convert date strings back to Date objects
        board.metadata.createdAt = new Date(board.metadata.createdAt);
        board.metadata.updatedAt = new Date(board.metadata.updatedAt);

        Object.values(board.cards).forEach((card) => {
          card.createdAt = new Date(card.createdAt);
          card.updatedAt = new Date(card.updatedAt);
          card.notes.forEach((note) => {
            note.createdAt = new Date(note.createdAt);
          });
        });

        return board;
      } catch (error) {
        console.error("Error loading board from localStorage:", error);
        // Return default board on error
        return { ...DEFAULT_BOARD, id: boardId };
      }
    },

    saveBoard: async (board: Board): Promise<void> => {
      try {
        const key = `agwakwagan-${board.id}`;
        const serialized = JSON.stringify(board);
        localStorage.setItem(key, serialized);
      } catch (error) {
        console.error("Error saving board to localStorage:", error);
        // Check if quota exceeded
        if (
          error instanceof DOMException &&
          error.name === "QuotaExceededError"
        ) {
          console.error(
            "LocalStorage quota exceeded. Consider export/import or IndexedDB migration."
          );
        }
        throw error;
      }
    },
  };
}

/**
 * API implementation of StorageAdapter
 * To be implemented in Phase 7
 *
 * Example usage:
 * export function useApiStorageAdapter(apiKey: string): StorageAdapter {
 *   return {
 *     loadBoard: async (boardId) => {
 *       const response = await fetch(`/api/boards/${boardId}`, {
 *         headers: { 'Authorization': `Bearer ${apiKey}` }
 *       });
 *       return response.json();
 *     },
 *     saveBoard: async (board) => {
 *       await fetch(`/api/boards/${board.id}`, {
 *         method: 'PUT',
 *         headers: {
 *           'Authorization': `Bearer ${apiKey}`,
 *           'Content-Type': 'application/json'
 *         },
 *         body: JSON.stringify(board)
 *       });
 *     },
 *     subscribeToChanges: (callback) => {
 *       // WebSocket or SSE implementation
 *     }
 *   };
 * }
 */
