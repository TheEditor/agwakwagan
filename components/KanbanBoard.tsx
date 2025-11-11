"use client";

import { useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useBoard } from "@/hooks/useBoard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { exportBoard } from "@/utils/export";
import { BoardHeader } from "./BoardHeader";
import { Column } from "./Column";

/**
 * KanbanBoard - Root component for the kanban board
 *
 * Orchestrates the board layout, fetches data via useBoard,
 * renders columns with their cards, and handles drag & drop operations.
 */
export function KanbanBoard() {
  const { board, isLoaded, getAllColumnsWithCards, addCard, moveCard, storageStatus } =
    useBoard();

  /**
   * Handle the end of a drag operation
   *
   * Validates drop destination and calls moveCard with the new position.
   * No-op if dropped outside valid area or in same position.
   */
  const handleDragEnd = useCallback((result: DropResult) => {
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
  }, [moveCard]);

  /**
   * Handle export triggered via keyboard shortcut or button
   */
  const handleExport = useCallback(() => {
    if (board) {
      exportBoard(board);
    }
  }, [board]);

  // Set up keyboard shortcuts
  useKeyboardShortcuts(handleExport);

  if (!isLoaded || !board) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-bg)]">
        <p className="text-[var(--color-text-secondary)]">
          Loading board...
        </p>
      </div>
    );
  }

  const columns = getAllColumnsWithCards;

  return (
    <>
      {board && <BoardHeader board={board} storageStatus={storageStatus} />}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-surface)]
                        p-4 sm:p-6 lg:p-8">

          {/* Board Columns */}
          <div className="flex gap-4 sm:gap-5 lg:gap-6 overflow-x-auto pb-4 sm:pb-6 lg:pb-8">
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
              <p className="text-[var(--color-text-tertiary)]">
                No columns found
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        <footer className="text-xs text-[var(--color-text-tertiary)]
                           mt-8 pt-6 border-t border-[var(--color-border-light)]">
          Total cards: {Object.keys(board.cards).length}
        </footer>
        </div>
      </DragDropContext>
    </>
  );
}
