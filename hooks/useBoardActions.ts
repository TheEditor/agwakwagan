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
   * Handles reordering within the destination column to maintain
   * sequential order numbers. Updates only modified cards.
   *
   * @param cardId - Card to move
   * @param toColumnId - Destination column ID
   * @param newOrder - Position in destination column (0-based index)
   */
  const moveCard = useCallback(
    (cardId: string, toColumnId: string, newOrder: number) => {
      console.log(`Moving card ${cardId} to column ${toColumnId}, position ${newOrder}`);
      setBoard((currentBoard) => {
        if (!currentBoard) {
          console.error("Cannot move card: board not loaded");
          return currentBoard;
        }

        const card = currentBoard.cards[cardId];
        if (!card) {
          console.error(`Cannot move card: card ${cardId} not found`);
          return currentBoard;
        }

        if (!currentBoard.columns[toColumnId]) {
          console.error(
            `Cannot move card: destination column ${toColumnId} does not exist`
          );
          return currentBoard;
        }

        // If moving to same column and same position, no-op
        if (card.columnId === toColumnId && card.order === newOrder) {
          console.log("Card already in target position, skipping");
          return currentBoard;
        }

        console.log(`Card found: ${card.title}, moving from column ${card.columnId} to ${toColumnId}`);

        const updatedCards = { ...currentBoard.cards };

        // Update the moved card first
        updatedCards[cardId] = {
          ...card,
          columnId: toColumnId,
          order: newOrder,
          updatedAt: new Date(),
        };

        // Get all cards in destination column and reorder them sequentially
        const destCards = Object.values(updatedCards)
          .filter((c) => c.columnId === toColumnId)
          .sort((a, b) => a.order - b.order);

        // Assign sequential order numbers to all destination column cards
        destCards.forEach((c, index) => {
          if (c.order !== index) {
            updatedCards[c.id] = {
              ...c,
              order: index,
              updatedAt: new Date(),
            };
          }
        });

        // If moving from a different column, reorder cards in source column
        if (card.columnId !== toColumnId) {
          const sourceCards = Object.values(updatedCards)
            .filter((c) => c.columnId === card.columnId)
            .sort((a, b) => a.order - b.order);

          // Assign sequential order numbers to source column cards
          sourceCards.forEach((c, index) => {
            if (c.order !== index) {
              updatedCards[c.id] = {
                ...c,
                order: index,
                updatedAt: new Date(),
              };
            }
          });
        }

        const result = {
          ...currentBoard,
          cards: updatedCards,
          metadata: {
            ...currentBoard.metadata,
            updatedAt: new Date(),
          },
        };
        console.log("Board state updated successfully");
        return result;
      });
    },
    [setBoard]
  );

  /**
   * Update card properties
   * Placeholder - will implement in Phase 3
   */
  const updateCard = useCallback(
    (cardId: string, updates: Partial<Card>) => {
      console.log("updateCard will be implemented in Phase 3");
    },
    [board, setBoard]
  );

  /**
   * Delete a card
   * Placeholder - will implement in Phase 3
   */
  const deleteCard = useCallback(
    (cardId: string) => {
      console.log("deleteCard will be implemented in Phase 3");
    },
    [board, setBoard]
  );

  /**
   * Add a note to a card
   * Placeholder - will implement in Phase 3
   */
  const addNote = useCallback(
    (cardId: string, noteText: string) => {
      console.log("addNote will be implemented in Phase 3");
    },
    [board, setBoard]
  );

  /**
   * Delete a note from a card
   * Placeholder - will implement in Phase 3
   */
  const deleteNote = useCallback(
    (cardId: string, noteId: string) => {
      console.log("deleteNote will be implemented in Phase 3");
    },
    [board, setBoard]
  );

  /**
   * Add a new column
   * Placeholder - will implement in Phase 3
   */
  const addColumn = useCallback(
    (title: string) => {
      console.log("addColumn will be implemented in Phase 3");
    },
    [board, setBoard]
  );

  /**
   * Delete a column and all its cards
   * Placeholder - will implement in Phase 3
   */
  const deleteColumn = useCallback(
    (columnId: string) => {
      console.log("deleteColumn will be implemented in Phase 3");
    },
    [board, setBoard]
  );

  return {
    addCard,
    moveCard,
    updateCard,
    deleteCard,
    addNote,
    deleteNote,
    addColumn,
    deleteColumn,
  };
}
