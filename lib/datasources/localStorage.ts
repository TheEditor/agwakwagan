import { Board } from "@/types/board";
import { DataSource, BoardSummary } from "@/types/datasource";
import { DEFAULT_BOARD } from "@/utils/constants";

const STORAGE_KEY_PREFIX = "agwakwagan";
const BOARDS_INDEX_KEY = "agwakwagan-boards-index";

/**
 * LocalStorage implementation of DataSource
 *
 * Stores boards in browser localStorage with JSON serialization.
 * Maintains an index of all boards for listBoards() functionality.
 */
export class LocalStorageDataSource implements DataSource {
  id = "local-storage";
  name = "Local Storage";
  type = "local" as const;

  async loadBoard(boardId: string): Promise<Board> {
    try {
      const key = `${STORAGE_KEY_PREFIX}-${boardId}`;
      const data = localStorage.getItem(key);

      if (!data) {
        // No saved board, return default with correct ID
        return { ...DEFAULT_BOARD, id: boardId };
      }

      // Parse and hydrate dates
      const board = JSON.parse(data) as Board;
      this.hydrateDates(board);

      return board;
    } catch (error) {
      console.error(`Error loading board ${boardId}:`, error);
      throw new Error(
        `Failed to load board: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async saveBoard(board: Board): Promise<void> {
    try {
      const key = `${STORAGE_KEY_PREFIX}-${board.id}`;
      const serialized = JSON.stringify(board);
      localStorage.setItem(key, serialized);

      // Update boards index
      await this.updateBoardsIndex(board);
    } catch (error) {
      console.error(`Error saving board ${board.id}:`, error);

      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        throw new Error(
          "Storage quota exceeded. Consider exporting and clearing old boards."
        );
      }

      throw new Error(
        `Failed to save board: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async listBoards(): Promise<BoardSummary[]> {
    try {
      const indexData = localStorage.getItem(BOARDS_INDEX_KEY);
      if (!indexData) {
        return [];
      }

      const index = JSON.parse(indexData) as BoardSummary[];

      // Hydrate dates
      index.forEach((summary) => {
        summary.createdAt = new Date(summary.createdAt);
        summary.updatedAt = new Date(summary.updatedAt);
      });

      return index.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      );
    } catch (error) {
      console.error("Error listing boards:", error);
      return [];
    }
  }

  async deleteBoard(boardId: string): Promise<void> {
    try {
      const key = `${STORAGE_KEY_PREFIX}-${boardId}`;
      localStorage.removeItem(key);

      // Update boards index
      const index = await this.listBoards();
      const updatedIndex = index.filter((b) => b.id !== boardId);
      localStorage.setItem(BOARDS_INDEX_KEY, JSON.stringify(updatedIndex));
    } catch (error) {
      console.error(`Error deleting board ${boardId}:`, error);
      throw new Error(
        `Failed to delete board: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update the boards index with current board info
   */
  private async updateBoardsIndex(board: Board): Promise<void> {
    const index = await this.listBoards();

    const summary: BoardSummary = {
      id: board.id,
      title: board.metadata.title,
      createdAt: board.metadata.createdAt,
      updatedAt: board.metadata.updatedAt,
      cardCount: Object.keys(board.cards).length,
      columnCount: Object.keys(board.columns).length,
      dataSource: this.id,
    };

    // Update or add this board
    const existingIndex = index.findIndex((b) => b.id === board.id);
    if (existingIndex >= 0) {
      index[existingIndex] = summary;
    } else {
      index.push(summary);
    }

    localStorage.setItem(BOARDS_INDEX_KEY, JSON.stringify(index));
  }

  /**
   * Convert date strings to Date objects
   */
  private hydrateDates(board: Board): void {
    board.metadata.createdAt = new Date(board.metadata.createdAt);
    board.metadata.updatedAt = new Date(board.metadata.updatedAt);

    Object.values(board.cards).forEach((card) => {
      card.createdAt = new Date(card.createdAt);
      card.updatedAt = new Date(card.updatedAt);
      card.notes.forEach((note) => {
        note.createdAt = new Date(note.createdAt);
      });
    });
  }
}
