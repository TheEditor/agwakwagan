import { Board } from "./board";

/**
 * DataSource - Abstraction for board persistence
 *
 * Enables swapping between localStorage, API, Beads, or custom sources
 * without changing component code.
 */
export interface DataSource {
  /** Unique identifier for this data source */
  id: string;

  /** Human-readable name */
  name: string;

  /** Type of data source */
  type: "local" | "api" | "beads" | "custom";

  /**
   * Load a board by ID
   * @param boardId - Board identifier
   * @returns Promise resolving to Board data
   * @throws Error if board not found or load fails
   */
  loadBoard(boardId: string): Promise<Board>;

  /**
   * Save board data
   * @param board - Complete board state
   * @throws Error if save fails
   */
  saveBoard(board: Board): Promise<void>;

  /**
   * List all available boards from this source
   * @returns Promise resolving to array of board summaries
   */
  listBoards?(): Promise<BoardSummary[]>;

  /**
   * Subscribe to real-time changes (optional)
   * Used for collaborative editing or external updates
   * @param boardId - Board to watch
   * @param callback - Called when board changes
   * @returns Unsubscribe function
   */
  subscribeToChanges?(
    boardId: string,
    callback: (board: Board) => void
  ): () => void;

  /**
   * Delete a board (optional)
   * @param boardId - Board to delete
   */
  deleteBoard?(boardId: string): Promise<void>;
}

/**
 * BoardSummary - Minimal board info for list views
 */
export interface BoardSummary {
  id: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  cardCount: number;
  columnCount: number;
  dataSource: string; // DataSource.id
}
