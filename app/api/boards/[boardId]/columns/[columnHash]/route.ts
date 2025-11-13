import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/app/api/middleware';
import { FileSystemDataSource } from '@/lib/datasources/fileSystem';
import { findColumnByHash } from '@/utils/cardLookup';

const dataSource = new FileSystemDataSource();

/**
 * DELETE /api/boards/:boardId/columns/:columnHash
 * Delete column only if empty
 */
async function deleteHandler(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; columnHash: string }> }
) {
  try {
    const { boardId, columnHash } = await params;
    const board = await dataSource.loadBoard(boardId);
    const columnId = findColumnByHash(board, columnHash);

    if (!columnId) {
      return NextResponse.json(
        { error: 'Column not found' },
        { status: 404 }
      );
    }

    // Check if column contains any cards
    const cardsInColumn = Object.values(board.cards)
      .filter(card => card.columnId === columnId);

    if (cardsInColumn.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete column with cards. Column contains ${cardsInColumn.length} card(s).` },
        { status: 400 }
      );
    }

    // Remove column from board
    delete board.columns[columnId];

    // Remove from column order
    const orderIndex = board.columnOrder.indexOf(columnId);
    if (orderIndex > -1) {
      board.columnOrder.splice(orderIndex, 1);
    }

    board.metadata.updatedAt = new Date();

    await dataSource.saveBoard(board);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete column:', error);
    return NextResponse.json(
      { error: 'Failed to delete column' },
      { status: 500 }
    );
  }
}

export const DELETE = withAuth(deleteHandler);
