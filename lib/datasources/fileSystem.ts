import { promises as fs } from 'fs';
import { resolve, dirname } from 'path';
import { Board } from '@/types/board';
import { DataSource, BoardSummary } from '@/types/datasource';
import { DEFAULT_BOARD } from '@/utils/constants';

const BOARDS_INDEX_FILE = 'index.json';

/**
 * FileSystem implementation of DataSource
 *
 * Stores boards as JSON files on the server filesystem.
 * Used by API routes for server-side persistence.
 * Mirrors LocalStorageDataSource behavior but uses Node.js fs module.
 *
 * Directory structure:
 * ```
 * data/boards/
 * ├── index.json           (list of all boards)
 * ├── board-abc123.json
 * ├── board-def456.json
 * └── ...
 * ```
 */
export class FileSystemDataSource implements DataSource {
  id = 'file-system';
  name = 'File System';
  type = 'local' as const;

  private baseDir: string;

  constructor(baseDir: string = './data/boards') {
    this.baseDir = baseDir;
  }

  /**
   * Ensure data directory exists
   */
  private async ensureDir(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (error) {
      console.error(`Failed to create directory ${this.baseDir}:`, error);
      throw new Error(`Failed to create data directory: ${error}`);
    }
  }

  /**
   * Get full path for a board file
   */
  private getBoardPath(boardId: string): string {
    return resolve(this.baseDir, `${boardId}.json`);
  }

  /**
   * Get full path for the index file
   */
  private getIndexPath(): string {
    return resolve(this.baseDir, BOARDS_INDEX_FILE);
  }

  async loadBoard(boardId: string): Promise<Board> {
    try {
      await this.ensureDir();

      const path = this.getBoardPath(boardId);
      const data = await fs.readFile(path, 'utf-8').catch(() => null);

      if (!data) {
        // No saved board, return default with correct ID
        return { ...DEFAULT_BOARD, id: boardId, dataSourceId: this.id };
      }

      // Parse and hydrate dates
      const board = JSON.parse(data) as Board;
      this.hydrateDates(board);

      // Ensure dataSourceId is set (migration for old boards)
      if (!board.dataSourceId) {
        board.dataSourceId = this.id;
      }

      return board;
    } catch (error) {
      console.error(`Error loading board ${boardId}:`, error);
      throw new Error(
        `Failed to load board: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async saveBoard(board: Board): Promise<void> {
    try {
      await this.ensureDir();

      const path = this.getBoardPath(board.id);
      const serialized = JSON.stringify(board, null, 2);
      await fs.writeFile(path, serialized, 'utf-8');

      // Update boards index
      await this.updateBoardsIndex(board);
    } catch (error) {
      console.error(`Error saving board ${board.id}:`, error);
      throw new Error(
        `Failed to save board: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async listBoards(): Promise<BoardSummary[]> {
    try {
      await this.ensureDir();

      const indexPath = this.getIndexPath();
      const indexData = await fs.readFile(indexPath, 'utf-8').catch(() => null);

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
      console.error('Error listing boards:', error);
      return [];
    }
  }

  async deleteBoard(boardId: string): Promise<void> {
    try {
      await this.ensureDir();

      const path = this.getBoardPath(boardId);
      await fs.unlink(path).catch(() => {
        // File doesn't exist, that's fine
      });

      // Update boards index
      const index = await this.listBoards();
      const updatedIndex = index.filter((b) => b.id !== boardId);
      await this.writeIndex(updatedIndex);
    } catch (error) {
      console.error(`Error deleting board ${boardId}:`, error);
      throw new Error(
        `Failed to delete board: ${
          error instanceof Error ? error.message : 'Unknown error'
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

    await this.writeIndex(index);
  }

  /**
   * Write index to file
   */
  private async writeIndex(index: BoardSummary[]): Promise<void> {
    try {
      await this.ensureDir();
      const indexPath = this.getIndexPath();
      const serialized = JSON.stringify(index, null, 2);
      await fs.writeFile(indexPath, serialized, 'utf-8');
    } catch (error) {
      console.error('Error writing boards index:', error);
      throw new Error(
        `Failed to write boards index: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
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
