import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/app/api/middleware';
import { FileSystemDataSource } from '@/lib/datasources/fileSystem';
import { Card } from '@/types/board';
import { generateId } from '@/utils/ids';
import { generateCardHash } from '@/utils/hash';
import { findColumnByHash } from '@/utils/cardLookup';

const dataSource = new FileSystemDataSource();

/**
 * GET /api/boards/:boardId/cards
 * List all cards with their external hashes
 */
async function getHandler(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;
    const board = await dataSource.loadBoard(boardId);

    // Convert internal cards to external view
    const externalCards = Object.values(board.cards)
      .filter(card => card.cardHash) // Only return cards with hashes
      .map(card => {
        const column = board.columns[card.columnId];
        return {
          cardHash: card.cardHash,
          title: card.title,
          description: card.description,
          columnHash: column?.columnHash,
          columnName: getColumnName(column),
          createdAt: card.createdAt.toISOString(),
          updatedAt: card.updatedAt.toISOString(),
        };
      });

    return NextResponse.json({ cards: externalCards });
  } catch (error) {
    console.error('Failed to list cards:', error);
    return NextResponse.json(
      { error: 'Failed to load board' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);

/**
 * POST /api/boards/:boardId/cards
 * Create new card → returns kanban-assigned cardHash
 */
async function postHandler(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    const board = await dataSource.loadBoard(boardId);

    // Determine column
    let columnId: string | undefined;

    if (body.columnHash) {
      columnId = findColumnByHash(board, body.columnHash);
      if (!columnId) {
        return NextResponse.json(
          { error: `Column with hash '${body.columnHash}' not found` },
          { status: 400 }
        );
      }
    } else if (body.columnName) {
      columnId = findColumnByName(board, body.columnName);
      if (!columnId) {
        return NextResponse.json(
          { error: `Column '${body.columnName}' not found` },
          { status: 400 }
        );
      }
    } else {
      // Default to first column
      columnId = board.columnOrder[0];
    }

    if (!columnId) {
      return NextResponse.json(
        { error: 'No columns available' },
        { status: 500 }
      );
    }

    // Calculate order (append to end of column)
    const cardsInColumn = Object.values(board.cards)
      .filter(c => c.columnId === columnId);
    const maxOrder = Math.max(0, ...cardsInColumn.map(c => c.order));

    // Generate kanban-assigned hash (format: card-xxxx)
    const cardHash = generateCardHash();

    // Create new card
    const now = new Date();
    const newCard: Card = {
      id: generateId('card'),
      title: body.title,
      description: body.description,
      columnId,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
      notes: [],
      cardHash, // ← Kanban-assigned
    };

    // Add to board
    board.cards[newCard.id] = newCard;
    board.metadata.updatedAt = now;

    await dataSource.saveBoard(board);

    const column = board.columns[columnId];

    // Return external view with kanban-assigned hash
    return NextResponse.json(
      {
        cardHash: newCard.cardHash,
        title: newCard.title,
        description: newCard.description,
        columnHash: column.columnHash,
        columnName: getColumnName(column),
        createdAt: newCard.createdAt.toISOString(),
        updatedAt: newCard.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create card:', error);
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler);

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
