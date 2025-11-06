"use client";

import { ColumnWithCards } from "@/types/board";

/**
 * Column - Represents a single column in the kanban board
 *
 * Placeholder for Phase 0. Full implementation in Phase 1.
 */
interface ColumnProps {
  column: ColumnWithCards;
  onAddCard?: (columnId: string, title: string) => void;
}

export function Column({ column, onAddCard }: ColumnProps) {
  return (
    <div className="flex-shrink-0 w-80 bg-[var(--color-surface)] rounded-lg p-4">
      <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
        {column.title}
      </h2>

      <div className="space-y-2 mb-4">
        <p className="text-sm text-[var(--color-text-tertiary)]">
          {column.cards.length} cards in this column
        </p>
        {/* Card components will be rendered here in Phase 1 */}
      </div>

      <button
        className="w-full text-left text-sm text-[var(--color-text-secondary)]
                   hover:text-[var(--color-text)] py-2 px-3 rounded
                   hover:bg-[var(--color-bg)] transition-colors"
        onClick={() =>
          console.log("Add card clicked - will implement in Phase 1")
        }
      >
        + Add Card
      </button>
    </div>
  );
}
