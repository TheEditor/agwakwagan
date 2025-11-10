"use client";

import { useCallback } from "react";
import { Board, Card } from "@/types/board";
import { generateId } from "@/utils/ids";

/**
 * Board Actions Hook
 *
 * Contains all business logic for board mutations.
 * All functions return void and update board via setBoard.
 */
export function useBoardActions(
  board: Board | null,
  setBoard: (board: Board) => void
) {
  /**
   * Add a new card to a column
   *
   * @param columnId - Target column ID
   * @param title - Card title (required, 1-500 chars)
   * @param description - Optional card description
   */
  const addCard = useCallback(
    (columnId: string, title: string, description?: string) => {
      if (!board) {
        console.error("Cannot add card: board not loaded");
        return;
      }

      // Validate column exists
      if (!board.columns[columnId]) {
        console.error(
          `Cannot add card: column ${columnId} does not exist`
        );
        return;
      }

      // Validate title
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        console.error("Cannot add card: title is required");
        return;
      }

      if (trimmedTitle.length > 500) {
        console.error("Cannot add card: title exceeds 500 characters");
        return;
      }

      // Calculate next order number in this column
      const cardsInColumn = Object.values(board.cards).filter(
        (card) => card.columnId === columnId
      );

      const maxOrder =
        cardsInColumn.length > 0
          ? Math.max(...cardsInColumn.map((c) => c.order))
          : -1;

      const nextOrder = maxOrder + 1;

      // Create new card
      const newCard: Card = {
        id: generateId("card"),
        title: trimmedTitle,
        description: description?.trim() || undefined,
        columnId,
        order: nextOrder,
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: [],
      };

      // Update board state immutably
      const updatedBoard: Board = {
        ...board,
        cards: {
          ...board.cards,
          [newCard.id]: newCard,
        },
        metadata: {
          ...board.metadata,
          updatedAt: new Date(),
        },
      };

      setBoard(updatedBoard);
    },
    [board, setBoard]
  );

  /**
   * Move a card to a different column or position
   *
   * Properly reorders cards in both source and destination columns.
   * Maintains sequential order numbers (0, 1, 2...) for all cards.
   *
   * @param cardId - Card to move
   * @param toColumnId - Destination column ID
   * @param newOrder - Position in destination column (0-based index)
   */
  const moveCard = useCallback(
    (cardId: string, toColumnId: string, newOrder: number) => {
      if (!board) {
        console.error("Cannot move card: board not loaded");
        return;
      }

      const card = board.cards[cardId];
      if (!card) {
        console.error(`Cannot move card: card ${cardId} not found`);
        return;
      }

      if (!board.columns[toColumnId]) {
        console.error(`Cannot move card: column ${toColumnId} not found`);
        return;
      }

      const fromColumnId = card.columnId;
      const fromOrder = card.order;

      // If moving to same column and same position, no-op
      if (fromColumnId === toColumnId && fromOrder === newOrder) {
        return;
      }

      // Get all cards as array for easier manipulation
      const allCards = Object.values(board.cards);
      const updatedCards = { ...board.cards };

      // Step 1: Remove card from source column (update order for cards after it)
      if (fromColumnId === toColumnId) {
        // Moving within same column
        const columnCards = allCards
          .filter((c) => c.columnId === toColumnId && c.id !== cardId)
          .sort((a, b) => a.order - b.order);

        // Insert the card at the new position
        columnCards.splice(newOrder, 0, card);

        // Update order for all cards in this column
        columnCards.forEach((c, index) => {
          updatedCards[c.id] = {
            ...c,
            order: index,
            updatedAt: new Date(),
          };
        });
      } else {
        // Moving to different column

        // Update source column: shift cards after the removed card
        const sourceColumnCards = allCards
          .filter((c) => c.columnId === fromColumnId && c.id !== cardId)
          .sort((a, b) => a.order - b.order);

        sourceColumnCards.forEach((c, index) => {
          updatedCards[c.id] = {
            ...c,
            order: index,
            updatedAt: new Date(),
          };
        });

        // Update destination column: insert card at new position
        const destColumnCards = allCards
          .filter((c) => c.columnId === toColumnId)
          .sort((a, b) => a.order - b.order);

        destColumnCards.splice(newOrder, 0, card);

        destColumnCards.forEach((c, index) => {
          updatedCards[c.id] = {
            ...c,
            columnId: toColumnId,
            order: index,
            updatedAt: new Date(),
          };
        });
      }

      // Create updated board
      const updatedBoard: Board = {
        ...board,
        cards: updatedCards,
        metadata: {
          ...board.metadata,
          updatedAt: new Date(),
        },
      };

      setBoard(updatedBoard);
    },
    [board, setBoard]
  );

  return {
    addCard,
    moveCard,
    // Phase 3+ functions will be added here as needed:
    // updateCard, deleteCard, addNote, deleteNote, addColumn, deleteColumn
  };
}
