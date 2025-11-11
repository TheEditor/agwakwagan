"use client";

import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { ColumnWithCards } from "@/types/board";
import { Card } from "./Card";

/**
 * Column - Represents a single column in the kanban board
 *
 * Displays column title, cards, and an inline add card form.
 * Supports Enter to add, Escape to cancel.
 * Cards can be dragged within or between columns.
 */
interface ColumnProps {
  column: ColumnWithCards;
  onAddCard?: (columnId: string, title: string) => void;
}

export function Column({ column, onAddCard }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  /**
   * Handle adding a new card
   * Validates input, calls onAddCard, clears form
   */
  const handleAddCard = () => {
    const trimmedTitle = newCardTitle.trim();

    if (!trimmedTitle) {
      return; // Silently fail on empty title
    }

    if (onAddCard) {
      onAddCard(column.id, trimmedTitle);
    }

    setNewCardTitle("");
    setIsAdding(false);
  };

  /**
   * Handle keyboard input in add card form
   * Enter: submit, Escape: cancel
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddCard();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewCardTitle("");
    }
  };

  return (
    <div className="flex-shrink-0 min-w-[280px] max-w-[400px] flex-1 bg-gray-50
                    rounded-lg p-6 shadow-sm border border-gray-200">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-[var(--color-primary)]">
          {column.title}
        </h2>
        <span className="text-sm font-bold text-white
                         bg-[var(--color-primary)]
                         px-2.5 py-1 rounded-full">
          {column.cards.length}
        </span>
      </div>

      {/* Cards Container */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-3 min-h-[300px] rounded-md transition-colors duration-200 p-3
                        ${
                          snapshot.isDraggingOver
                            ? "bg-blue-50 ring-2 ring-blue-400"
                            : "bg-white"
                        }`}
          >
            {column.cards.length > 0 ? (
              column.cards.map((card) => (
                <Card key={card.id} card={card} index={card.order} />
              ))
            ) : (
              <p
                className={`text-sm text-[var(--color-text-tertiary)]
                            text-center py-8 transition-opacity ${
                              snapshot.isDraggingOver ? "opacity-50" : ""
                            }`}
              >
                {snapshot.isDraggingOver ? "Drop card here" : "No cards yet"}
              </p>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Card Form/Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full text-left text-sm font-medium text-[var(--color-primary)]
                       py-2 px-3 rounded-md bg-white
                       hover:bg-[var(--color-primary)] hover:text-white
                       transition-colors duration-200"
            aria-label={`Add card to ${column.title}`}
          >
            + Add Card
          </button>
        ) : (
          <div className="space-y-3">
            <input
              autoFocus
              type="text"
              placeholder="Card title..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 text-sm border border-[var(--color-primary)]
                         rounded-md bg-white
                         text-[var(--color-text)]
                         placeholder-[var(--color-text-tertiary)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                         focus:ring-offset-0"
              aria-label="New card title"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCard}
                disabled={!newCardTitle.trim()}
                className="flex-1 text-xs font-medium px-3 py-2 rounded-md
                           bg-[var(--color-primary)] text-white
                           hover:bg-[var(--color-primary-hover)]
                           disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-disabled-text)]
                           disabled:cursor-not-allowed
                           transition-colors duration-200"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewCardTitle("");
                }}
                className="flex-1 text-xs font-medium px-3 py-2 rounded-md
                           border border-gray-300
                           text-[var(--color-text)]
                           hover:bg-gray-100
                           transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)]
                          text-center">
              Press Enter to add or Esc to cancel
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
