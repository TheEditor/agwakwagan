"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Board } from "@/types/board";
import { StorageStatus } from "@/hooks/useBoardState";
import { useToast } from "@/hooks/useToast";
import { exportBoard } from "@/utils/export";
import { ToastContainer } from "./ToastContainer";
import { ThemeToggle } from "./ThemeToggle";

/**
 * BoardHeader - Header with theme toggle, export, import, and save status
 *
 * Displays board title and ID, provides export/import/theme buttons
 * with error handling and toast notifications. Shows auto-save status.
 */
interface BoardHeaderProps {
  board: Board;
  storageStatus?: StorageStatus;
  onImport?: (board: Board) => void;
}

export function BoardHeader({ board, storageStatus, onImport }: BoardHeaderProps) {
  const { toasts, removeToast, success, error } = useToast();

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

  return (
    <>
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Agwakwagan
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {board.id}
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
    </>
  );
}
