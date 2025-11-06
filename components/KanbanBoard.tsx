"use client";

import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useBoard } from "@/hooks/useBoard";
import { Column } from "./Column";

/**
 * KanbanBoard - Root component for the kanban board
 *
 * Orchestrates the board layout, fetches data via useBoard,
 * renders columns with their cards, and handles drag & drop operations.
 */
export function KanbanBoard() {
  const { board, isLoaded, getAllColumnsWithCards, addCard, moveCard } =
    useBoard();

  /**
   * Handle the end of a drag operation
   *
   * Validates drop destination and calls moveCard with the new position.
   * No-op if dropped outside valid area or in same position.
   */
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside valid area
    if (!destination) {
      return;
    }

    // Dropped in same position - no-op
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Move the card to the new location
    moveCard(draggableId, destination.droppableId, destination.index);
  };

  if (!isLoaded || !board) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-bg)]
                      dark:bg-[var(--color-dark-bg)]">
        <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
          Loading board...
        </p>
      </div>
    );
  }

  const columns = getAllColumnsWithCards;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-surface)]
                      dark:from-[var(--color-dark-bg)] dark:to-[var(--color-dark-surface)]
                      p-6">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-text)] dark:text-[var(--color-dark-text)]
                         mb-2">
            Agwakwagan
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
            Board ID: <code className="bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)]
                                 px-2 py-1 rounded text-xs font-mono">
              {board.id}
            </code>
          </p>
        </header>

        {/* Board Columns */}
        <div className="flex gap-6 overflow-x-auto pb-6">
          {columns.length > 0 ? (
            columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                onAddCard={addCard}
              />
            ))
          ) : (
            <div className="w-full flex items-center justify-center py-12">
              <p className="text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text-tertiary)]">
                No columns found
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        <footer className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text-tertiary)]
                           mt-8 pt-6 border-t border-[var(--color-border-light)]
                           dark:border-[var(--color-dark-border-light)]">
          Total cards: {Object.keys(board.cards).length}
        </footer>
      </div>
    </DragDropContext>
  );
}
