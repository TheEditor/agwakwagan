import { Board } from "@/types/board";
import { DataSource, BoardSummary } from "@/types/datasource";

/**
 * API implementation of DataSource
 *
 * To be implemented in Phase 7 when API backend is ready.
 * This skeleton shows the integration pattern.
 */
export class ApiDataSource implements DataSource {
  id: string;
  name: string;
  type = "api" as const;

  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string, name?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.id = `api-${baseUrl}`;
    this.name = name || `API (${baseUrl})`;
  }

  async loadBoard(boardId: string): Promise<Board> {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to load board: ${response.statusText}`);
    }

    return response.json();
  }

  async saveBoard(board: Board): Promise<void> {
    const response = await fetch(`${this.baseUrl}/boards/${board.id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(board),
    });

    if (!response.ok) {
      throw new Error(`Failed to save board: ${response.statusText}`);
    }
  }

  async listBoards(): Promise<BoardSummary[]> {
    const response = await fetch(`${this.baseUrl}/boards`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to list boards: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteBoard(boardId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete board: ${response.statusText}`);
    }
  }

  subscribeToChanges(
    boardId: string,
    callback: (board: Board) => void
  ): () => void {
    // TODO: Implement WebSocket or SSE subscription
    console.log("Real-time sync not yet implemented");
    return () => {};
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }
}
