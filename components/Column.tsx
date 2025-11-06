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
    <div className="flex-shrink-0 w-80 bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)]
                    rounded-lg p-4 shadow-sm border border-[var(--color-border-light)]
                    dark:border-[var(--color-dark-border-light)]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--color-text)] dark:text-[var(--color-dark-text)]">
          {column.title}
        </h2>
        <span className="text-xs font-medium text-[var(--color-text-tertiary)]
                         dark:text-[var(--color-dark-text-tertiary)]
                         bg-[var(--color-bg)] dark:bg-[var(--color-dark-bg)]
                         px-2 py-1 rounded">
          {column.cards.length}
        </span>
      </div>

      {/* Cards Container */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-2 min-h-[200px] rounded transition-colors duration-200 p-1
                        ${
                          snapshot.isDraggingOver
                            ? "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-300 dark:ring-blue-700"
                            : ""
                        }`}
          >
            {column.cards.length > 0 ? (
              column.cards.map((card, index) => (
                <Card key={card.id} card={card} index={index} />
              ))
            ) : (
              <p
                className={`text-sm text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text-tertiary)]
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
      <div className="mt-4 pt-4 border-t border-[var(--color-border-light)] dark:border-[var(--color-dark-border-light)]">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full text-left text-sm font-medium text-[var(--color-text-secondary)]
                       dark:text-[var(--color-dark-text-secondary)]
                       hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)]
                       py-2 px-3 rounded hover:bg-[var(--color-bg)] dark:hover:bg-[var(--color-dark-bg)]
                       transition-colors duration-200"
            aria-label={`Add card to ${column.title}`}
          >
            + Add Card
          </button>
        ) : (
          <div className="space-y-2">
            <input
              autoFocus
              type="text"
              placeholder="Card title..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 text-sm border border-[var(--color-primary)]
                         dark:border-[var(--color-primary)]
                         rounded bg-white dark:bg-[var(--color-dark-bg)]
                         text-[var(--color-text)] dark:text-[var(--color-dark-text)]
                         placeholder-[var(--color-text-tertiary)]
                         dark:placeholder-[var(--color-dark-text-tertiary)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                         focus:ring-offset-0"
              aria-label="New card title"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCard}
                disabled={!newCardTitle.trim()}
                className="flex-1 text-xs font-medium px-3 py-2 rounded
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
                className="flex-1 text-xs font-medium px-3 py-2 rounded
                           border border-[var(--color-border)]
                           text-[var(--color-text)] dark:text-[var(--color-dark-text)]
                           hover:bg-[var(--color-bg)] dark:hover:bg-[var(--color-dark-bg)]
                           transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text-tertiary)]
                          text-center">
              Press Enter to add or Esc to cancel
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
