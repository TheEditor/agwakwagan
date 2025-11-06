"use client";

import { useBoard } from "@/hooks/useBoard";
import { ColumnWithCards } from "@/types/board";

/**
 * KanbanBoard - Root component for the kanban board
 *
 * Placeholder for Phase 0. Full implementation in Phase 1.
 */
export function KanbanBoard() {
  const { board, isLoaded, getAllColumnsWithCards } = useBoard();

  if (!isLoaded || !board) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-bg)]">
        <p className="text-[var(--color-text-secondary)]">Loading board...</p>
      </div>
    );
  }

  const columns: ColumnWithCards[] = getAllColumnsWithCards;

  return (
    <div className="h-screen bg-[var(--color-bg)] p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Agwakwagan
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Board ID: {board.id}
        </p>
      </div>

      <div className="flex gap-4">
        {columns.map((column: ColumnWithCards) => (
          <div
            key={column.id}
            className="bg-[var(--color-surface)] rounded-lg p-4 w-80"
          >
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
              {column.title}
            </h2>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              {column.cards.length} cards
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
