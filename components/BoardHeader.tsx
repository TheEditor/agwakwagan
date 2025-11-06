"use client";

import { Board } from "@/types/board";

/**
 * BoardHeader - Header with theme toggle, export, import
 *
 * Placeholder for Phase 0. Full implementation in Phase 3-4.
 */
interface BoardHeaderProps {
  board: Board;
  onImport?: (board: Board) => void;
}

export function BoardHeader({ board, onImport }: BoardHeaderProps) {
  return (
    <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Agwakwagan
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {board.id}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() =>
              console.log("Theme toggle - will implement in Phase 4")
            }
            className="px-4 py-2 text-sm border border-[var(--color-border)]
                       text-[var(--color-text)] rounded hover:bg-[var(--color-surface-hover)]
                       transition-colors"
          >
            🌙 Theme
          </button>

          <button
            onClick={() =>
              console.log("Export - will implement in Phase 3")
            }
            className="px-4 py-2 text-sm bg-[var(--color-secondary)] text-white
                       rounded hover:bg-[var(--color-secondary-hover)] transition-colors"
          >
            Export
          </button>

          <button
            onClick={() =>
              console.log("Import - will implement in Phase 3")
            }
            className="px-4 py-2 text-sm border border-[var(--color-border)]
                       text-[var(--color-text)] rounded hover:bg-[var(--color-surface-hover)]
                       transition-colors"
          >
            Import
          </button>
        </div>
      </div>
    </header>
  );
}
