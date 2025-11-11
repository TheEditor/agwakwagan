"use client";

import { useState, useEffect } from "react";
import { BoardSummary, DataSource } from "@/types/datasource";

interface BoardSelectorProps {
  dataSource: DataSource;
  currentBoardId: string;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard?: () => void;
  onDeleteBoard?: (boardId: string) => void;
}

/**
 * BoardSelector - Dropdown component for selecting and managing boards
 *
 * Displays list of available boards with card/column counts,
 * allows switching between boards, and provides create/delete functionality.
 */
export function BoardSelector({
  dataSource,
  currentBoardId,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
}: BoardSelectorProps) {
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadBoards();
  }, [dataSource]);

  const loadBoards = async () => {
    try {
      setIsLoading(true);
      if (dataSource.listBoards) {
        const boardList = await dataSource.listBoards();
        setBoards(boardList);
      }
    } catch (error) {
      console.error("Failed to load boards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBoard = (boardId: string) => {
    onSelectBoard(boardId);
    setIsOpen(false);
  };

  const handleDeleteBoard = async (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this board?")) {
      return;
    }

    try {
      if (dataSource.deleteBoard) {
        await dataSource.deleteBoard(boardId);
        await loadBoards();
        if (onDeleteBoard) {
          onDeleteBoard(boardId);
        }
      }
    } catch (error) {
      console.error("Failed to delete board:", error);
      alert("Failed to delete board");
    }
  };

  const currentBoard = boards.find((b) => b.id === currentBoardId);

  return (
    <div className="relative">
      {/* Current Board Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded
                   bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
                   transition-colors text-sm"
      >
        <span className="font-medium text-gray-900 dark:text-white">
          {currentBoard?.title || currentBoardId}
        </span>
        <span className="text-gray-500 dark:text-gray-400">▼</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg
                       shadow-lg border border-gray-200 dark:border-gray-700 z-50"
        >
          {/* Board List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                Loading boards...
              </div>
            ) : boards.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                No boards found
              </div>
            ) : (
              boards.map((board) => (
                <div
                  key={board.id}
                  className={`flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700
                             border-b border-gray-100 dark:border-gray-700 cursor-pointer
                             ${
                               board.id === currentBoardId
                                 ? "bg-blue-50 dark:bg-gray-600"
                                 : ""
                             }`}
                >
                  <div
                    onClick={() => handleSelectBoard(board.id)}
                    className="flex-1"
                  >
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {board.title || board.id}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {board.cardCount} cards • {board.columnCount} columns
                    </div>
                  </div>

                  {onDeleteBoard && board.id !== currentBoardId && (
                    <button
                      onClick={(e) => handleDeleteBoard(board.id, e)}
                      className="px-2 py-1 text-xs text-red-600 dark:text-red-400
                                 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Create New Board Button */}
          {onCreateBoard && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  onCreateBoard();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-sm font-medium
                           bg-blue-500 text-white rounded
                           hover:bg-blue-600 transition-colors"
              >
                + Create New Board
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
