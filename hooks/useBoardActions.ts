"use client";

import { useCallback } from "react";
import { Board, Card, Column } from "@/types/board";
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
          .filter((c) => c.columnId === toColumnId)
          .sort((a, b) => a.order - b.order);

        // Remove card from its current position
        const cardIndex = columnCards.findIndex((c) => c.id === cardId);
        columnCards.splice(cardIndex, 1);

        // Clamp newOrder to valid range
        const clampedOrder = Math.max(0, Math.min(newOrder, columnCards.length));

        // Insert the card at the new position
        columnCards.splice(clampedOrder, 0, card);

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

  /**
   * Update a card's title and/or description
   *
   * @param cardId - Card to update
   * @param updates - Object with title and/or description to update
   */
  const updateCard = useCallback(
    (cardId: string, updates: Partial<Pick<Card, 'title' | 'description'>>) => {
      if (!board) {
        console.error("Cannot update card: board not loaded");
        return;
      }

      const card = board.cards[cardId];
      if (!card) {
        console.error(`Cannot update card: card ${cardId} not found`);
        return;
      }

      // Validate title if provided
      if (updates.title !== undefined) {
        const trimmedTitle = updates.title.trim();
        if (!trimmedTitle) {
          console.error("Cannot update card: title cannot be empty");
          return;
        }
        if (trimmedTitle.length > 500) {
          console.error("Cannot update card: title exceeds 500 characters");
          return;
        }
      }

      const updatedCards = {
        ...board.cards,
        [cardId]: {
          ...card,
          ...(updates.title !== undefined && { title: updates.title.trim() }),
          ...(updates.description !== undefined && {
            description: updates.description.trim() || undefined,
          }),
          updatedAt: new Date(),
        },
      };

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

  /**
   * Delete a card from the board
   *
   * @param cardId - Card to delete
   */
  const deleteCard = useCallback(
    (cardId: string) => {
      if (!board) {
        console.error("Cannot delete card: board not loaded");
        return;
      }

      const card = board.cards[cardId];
      if (!card) {
        console.error(`Cannot delete card: card ${cardId} not found`);
        return;
      }

      const { [cardId]: removed, ...remainingCards } = board.cards;

      const updatedBoard: Board = {
        ...board,
        cards: remainingCards,
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
   * Update a column's title
   *
   * @param columnId - Column to update
   * @param updates - Object with title to update
   */
  const updateColumn = useCallback(
    (columnId: string, updates: Partial<Pick<Column, 'title'>>) => {
      if (!board) {
        console.error("Cannot update column: board not loaded");
        return;
      }

      const column = board.columns[columnId];
      if (!column) {
        console.error(`Cannot update column: column ${columnId} not found`);
        return;
      }

      // Validate title if provided
      if (updates.title !== undefined) {
        const trimmedTitle = updates.title.trim();
        if (!trimmedTitle) {
          console.error("Cannot update column: title cannot be empty");
          return;
        }
        if (trimmedTitle.length > 100) {
          console.error("Cannot update column: title exceeds 100 characters");
          return;
        }
      }

      const updatedColumns = {
        ...board.columns,
        [columnId]: {
          ...column,
          ...(updates.title !== undefined && { title: updates.title.trim() }),
        },
      };

      const updatedBoard: Board = {
        ...board,
        columns: updatedColumns,
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
   * Add a new column to the board
   *
   * @param title - Column title (required, 1-50 chars)
   * @param afterColumnId - Optional column ID to insert after
   */
  const addColumn = useCallback(
    (title: string, afterColumnId?: string) => {
      if (!board) {
        console.error("Cannot add column: board not loaded");
        return;
      }

      // Validate title
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        console.error("Cannot add column: title is required");
        return;
      }

      if (trimmedTitle.length > 50) {
        console.error("Cannot add column: title exceeds 50 characters");
        return;
      }

      const columnId = generateId("column");
      const now = new Date();

      // Create new column
      const newColumn: Column = {
        id: columnId,
        title: trimmedTitle,
        order: 0, // Will recalculate
      };

      // Determine position in columnOrder
      let newColumnOrder = [...board.columnOrder];
      if (afterColumnId && newColumnOrder.includes(afterColumnId)) {
        const index = newColumnOrder.indexOf(afterColumnId);
        newColumnOrder.splice(index + 1, 0, columnId);
      } else {
        newColumnOrder.push(columnId); // Add to end
      }

      // Recalculate order values for all columns
      const updatedColumns = { ...board.columns, [columnId]: newColumn };
      newColumnOrder.forEach((id, index) => {
        if (updatedColumns[id]) {
          updatedColumns[id].order = index;
        }
      });

      const updatedBoard: Board = {
        ...board,
        columns: updatedColumns,
        columnOrder: newColumnOrder,
        metadata: {
          ...board.metadata,
          updatedAt: now,
        },
      };

      setBoard(updatedBoard);
    },
    [board, setBoard]
  );

  /**
   * Delete a column from the board
   *
   * Cannot delete the last column. Cards can be moved to another column
   * or deleted entirely.
   *
   * @param columnId - Column to delete
   * @param moveCardsTo - Optional target column ID to move cards to
   */
  const deleteColumn = useCallback(
    (columnId: string, moveCardsTo?: string) => {
      if (!board) {
        console.error("Cannot delete column: board not loaded");
        return;
      }

      if (!board.columns[columnId]) {
        console.error(`Cannot delete column: column ${columnId} not found`);
        return;
      }

      // Cannot delete last column
      if (board.columnOrder.length <= 1) {
        console.error("Cannot delete the last column");
        return;
      }

      const now = new Date();
      const updatedCards = { ...board.cards };

      // Handle cards in the deleted column
      const cardsInColumn = Object.values(updatedCards).filter(
        (c) => c.columnId === columnId
      );

      if (moveCardsTo && board.columns[moveCardsTo]) {
        // Move cards to target column
        const targetCards = Object.values(updatedCards).filter(
          (c) => c.columnId === moveCardsTo
        );
        const maxOrder =
          targetCards.length > 0
            ? Math.max(...targetCards.map((c) => c.order))
            : -1;

        cardsInColumn.forEach((card, index) => {
          updatedCards[card.id] = {
            ...card,
            columnId: moveCardsTo,
            order: maxOrder + index + 1,
            updatedAt: now,
          };
        });
      } else {
        // Delete all cards in column
        cardsInColumn.forEach((card) => {
          delete updatedCards[card.id];
        });
      }

      // Remove column
      const updatedColumns = { ...board.columns };
      delete updatedColumns[columnId];

      const updatedColumnOrder = board.columnOrder.filter(
        (id) => id !== columnId
      );

      // Recalculate order for remaining columns
      updatedColumnOrder.forEach((id, index) => {
        if (updatedColumns[id]) {
          updatedColumns[id].order = index;
        }
      });

      const updatedBoard: Board = {
        ...board,
        columns: updatedColumns,
        columnOrder: updatedColumnOrder,
        cards: updatedCards,
        metadata: {
          ...board.metadata,
          updatedAt: now,
        },
      };

      setBoard(updatedBoard);
    },
    [board, setBoard]
  );

  return {
    addCard,
    moveCard,
    updateCard,
    deleteCard,
    updateColumn,
    addColumn,
    deleteColumn,
  };
}
