"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Board } from "@/types/board";
import { DataSource } from "@/types/datasource";
import { StorageStatus } from "@/hooks/useBoardState";
import { useToast } from "@/hooks/useToast";
import { LocalStorageDataSource } from "@/lib/datasources/localStorage";
import { exportBoard } from "@/utils/export";
import { BoardSelector } from "./BoardSelector";
import { ToastContainer } from "./ToastContainer";
import { ThemeToggle } from "./ThemeToggle";
import { InputDialog } from "./ui/InputDialog";

/**
 * BoardHeader - Header with board selector, theme toggle, export, and save status
 *
 * Displays board selector, title, and action buttons with error handling
 * and toast notifications. Shows auto-save status.
 */
interface BoardHeaderProps {
  board: Board;
  storageStatus?: StorageStatus;
  onImport?: (board: Board) => void;
  dataSource?: DataSource;
}

export function BoardHeader({
  board,
  storageStatus,
  onImport,
  dataSource = new LocalStorageDataSource(),
}: BoardHeaderProps) {
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();
  const [showCreateBoardDialog, setShowCreateBoardDialog] = useState(false);

  /**
   * Format relative time for save status
   */
  const formatSaveTime = (date: Date) => {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Render save status indicator based on storage status
   */
  const renderSaveStatus = () => {
    if (!storageStatus) return null;

    if (storageStatus.saving) {
      return (
        <div className="flex items-center gap-2 text-sm text-[var(--color-saving)]">
          <motion.span
            className="inline-block w-3 h-3 bg-[var(--color-saving)] rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          Saving...
        </div>
      );
    }

    if (storageStatus.error) {
      return (
        <div className="flex items-center gap-2 text-sm text-[var(--color-error)]">
          <span>✕</span>
          Save failed
        </div>
      );
    }

    if (storageStatus.lastSaved) {
      return (
        <div className="flex items-center gap-2 text-sm text-[var(--color-saved)]">
          <span>✓</span>
          Saved {formatSaveTime(storageStatus.lastSaved)}
        </div>
      );
    }

    return null;
  };

  /**
   * Handle export button click
   * Exports board to JSON with error handling
   */
  const handleExport = useCallback(() => {
    try {
      exportBoard(board);
      success(`Board "${board.metadata.title || board.id}" exported successfully`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to export board";
      error(`Export failed: ${errorMessage}`);
      console.error("Export error:", err);
    }
  }, [board, success, error]);

  /**
   * Handle board selection
   * Updates URL to load the selected board
   */
  const handleSelectBoard = useCallback((boardId: string) => {
    router.push(`/?board=${boardId}`);
  }, [router]);

  /**
   * Handle creating a new board
   */
  const handleCreateBoard = useCallback(() => {
    setShowCreateBoardDialog(true);
  }, []);

  /**
   * Handle board creation dialog submission
   */
  const handleCreateBoardSubmit = useCallback((boardName: string) => {
    router.push(`/?board=${encodeURIComponent(boardName)}`);
    setShowCreateBoardDialog(false);
  }, [router]);

  /**
   * Handle deleting a board
   */
  const handleDeleteBoard = useCallback((deletedBoardId: string) => {
    if (deletedBoardId === board.id) {
      // Current board was deleted, navigate to default
      router.push("/");
    }
  }, [board.id, router]);

  return (
    <>
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Board Selector */}
            <BoardSelector
              dataSource={dataSource}
              currentBoardId={board.id}
              onSelectBoard={handleSelectBoard}
              onCreateBoard={handleCreateBoard}
              onDeleteBoard={handleDeleteBoard}
            />

            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Agwakwagan
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {board.metadata.title || board.id}
              </p>
            </div>

            {/* Save Status Indicator */}
            <div className="border-l border-[var(--color-border)] pl-4">
              {renderSaveStatus()}
            </div>
          </div>

          <div className="flex gap-2">
            <ThemeToggle />

            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm bg-[var(--color-secondary)] text-white
                         rounded hover:bg-[var(--color-secondary-hover)] transition-colors
                         flex items-center gap-2"
              title="Export board (Ctrl+E / Cmd+E)"
            >
              <span>📥</span>
              Export
            </button>

            <button
              onClick={() =>
                console.log("Import - will implement in Phase 3")
              }
              className="px-4 py-2 text-sm border border-[var(--color-border)]
                         text-[var(--color-text)] rounded hover:bg-[var(--color-surface-hover)]
                         transition-colors flex items-center gap-2"
              title="Import board (Ctrl+I / Cmd+I)"
            >
              <span>📤</span>
              Import
            </button>
          </div>
        </div>
      </header>

      <ToastContainer toasts={toasts} onClose={removeToast} />

      <InputDialog
        isOpen={showCreateBoardDialog}
        title="Create New Board"
        message="Give your board a name (e.g., 'football-schedule', 'project-plan')"
        placeholder="Board name"
        onSubmit={handleCreateBoardSubmit}
        onCancel={() => setShowCreateBoardDialog(false)}
        validate={(value) => {
          if (!value || !value.trim()) {
            return 'Board name cannot be empty';
          }
          if (value.length > 100) {
            return 'Board name must be 100 characters or less';
          }
          return null;
        }}
      />
    </>
  );
}
