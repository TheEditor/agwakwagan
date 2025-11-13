import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/app/api/middleware';
import { FileSystemDataSource } from '@/lib/datasources/fileSystem';
import { findCardByHash, findColumnByHash } from '@/utils/cardLookup';

const dataSource = new FileSystemDataSource();

/**
 * GET /api/boards/:boardId/cards/:cardHash
 */
async function getHandler(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; cardHash: string }> }
) {
  try {
    const { boardId, cardHash } = await params;
    const board = await dataSource.loadBoard(boardId);
    const cardId = findCardByHash(board, cardHash);

    if (!cardId) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    const card = board.cards[cardId];
    const column = board.columns[card.columnId];

    return NextResponse.json({
      cardHash: card.cardHash,
      title: card.title,
      description: card.description,
      columnHash: column?.columnHash,
      columnName: getColumnName(column),
      createdAt: card.createdAt.toISOString(),
      updatedAt: card.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Failed to get card:', error);
    return NextResponse.json(
      { error: 'Failed to load card' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);

/**
 * PUT /api/boards/:boardId/cards/:cardHash
 */
async function putHandler(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; cardHash: string }> }
) {
  try {
    const { boardId, cardHash } = await params;
    const body = await request.json();
    const board = await dataSource.loadBoard(boardId);
    const cardId = findCardByHash(board, cardHash);

    if (!cardId) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    const card = board.cards[cardId];

    // Update fields
    if (body.title !== undefined) card.title = body.title;
    if (body.description !== undefined) card.description = body.description;

    // Handle column change (by hash or name)
    let newColumnId: string | undefined;

    if (body.columnHash !== undefined) {
      newColumnId = findColumnByHash(board, body.columnHash);
      if (!newColumnId) {
        return NextResponse.json(
          { error: `Column with hash '${body.columnHash}' not found` },
          { status: 400 }
        );
      }
    } else if (body.columnName !== undefined) {
      newColumnId = findColumnByName(board, body.columnName);
      if (!newColumnId) {
        return NextResponse.json(
          { error: `Column '${body.columnName}' not found` },
          { status: 400 }
        );
      }
    }

    // If column changed, move to end of new column
    if (newColumnId && newColumnId !== card.columnId) {
      card.columnId = newColumnId;

      const cardsInNewColumn = Object.values(board.cards)
        .filter(c => c.columnId === newColumnId && c.id !== cardId);
      const maxOrder = Math.max(0, ...cardsInNewColumn.map(c => c.order));
      card.order = maxOrder + 1;
    }

    card.updatedAt = new Date();
    board.metadata.updatedAt = new Date();

    await dataSource.saveBoard(board);

    const column = board.columns[card.columnId];

    return NextResponse.json({
      cardHash: card.cardHash,
      title: card.title,
      description: card.description,
      columnHash: column?.columnHash,
      columnName: getColumnName(column),
      updatedAt: card.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Failed to update card:', error);
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(putHandler);

/**
 * DELETE /api/boards/:boardId/cards/:cardHash
 */
async function deleteHandler(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; cardHash: string }> }
) {
  try {
    const { boardId, cardHash } = await params;
    const board = await dataSource.loadBoard(boardId);
    const cardId = findCardByHash(board, cardHash);

    if (!cardId) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    delete board.cards[cardId];
    board.metadata.updatedAt = new Date();

    await dataSource.saveBoard(board);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete card:', error);
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    );
  }
}

export const DELETE = withAuth(deleteHandler);

// Helper functions
function getColumnName(column: any): string {
  return column?.title.toLowerCase().replace(/\s+/g, '-') || '';
}

function findColumnByName(board: any, name: string): string | undefined {
  const entry = Object.entries(board.columns).find(([_, col]: [string, any]) =>
    col.title.toLowerCase().replace(/\s+/g, '-') === name.toLowerCase()
  );
  return entry?.[0];
}
