import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/app/api/middleware';
import { FileSystemDataSource } from '@/lib/datasources/fileSystem';
import { Column } from '@/types/board';
import { generateId } from '@/utils/ids';
import { generateColumnHash } from '@/utils/hash';
import { findColumnByHash } from '@/utils/cardLookup';

const dataSource = new FileSystemDataSource();

/**
 * GET /api/boards/:boardId/columns
 * List all columns with hashes
 */
async function getHandler(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;
    const board = await dataSource.loadBoard(boardId);

    const columns = board.columnOrder
      .map(colId => board.columns[colId])
      .filter(col => col !== undefined)
      .map(col => ({
        columnHash: col.columnHash,
        name: col.title.toLowerCase().replace(/\s+/g, '-'),
        title: col.title,
        order: col.order,
      }));

    return NextResponse.json({ columns });
  } catch (error) {
    console.error('Failed to list columns:', error);
    return NextResponse.json(
      { error: 'Failed to load board' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);

/**
 * POST /api/boards/:boardId/columns
 * Create new column → returns kanban-assigned columnHash
 */
async function postHandler(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    const board = await dataSource.loadBoard(boardId);

    // Determine insertion order
    let order: number;
    if (body.insertAfter) {
      const afterColumnId = findColumnByHash(board, body.insertAfter);
      if (!afterColumnId) {
        return NextResponse.json(
          { error: `Column with hash '${body.insertAfter}' not found` },
          { status: 400 }
        );
      }

      const afterColumn = board.columns[afterColumnId];
      order = afterColumn.order + 1;

      // Shift subsequent columns
      Object.values(board.columns).forEach(col => {
        if (col.order > afterColumn.order) {
          col.order++;
        }
      });
    } else {
      // Append to end
      const maxOrder = Math.max(0, ...Object.values(board.columns).map(c => c.order));
      order = maxOrder + 1;
    }

    // Generate kanban-assigned hash (format: col-xxxx)
    const columnHash = generateColumnHash();

    // Create new column
    const newColumn: Column = {
      id: generateId('column'),
      title: body.title,
      order,
      columnHash, // ← Kanban-assigned
    };

    // Add to board
    board.columns[newColumn.id] = newColumn;

    // Update column order
    if (body.insertAfter) {
      const afterColumnId = findColumnByHash(board, body.insertAfter);
      const insertIndex = board.columnOrder.indexOf(afterColumnId!) + 1;
      board.columnOrder.splice(insertIndex, 0, newColumn.id);
    } else {
      board.columnOrder.push(newColumn.id);
    }

    board.metadata.updatedAt = new Date();

    await dataSource.saveBoard(board);

    // Return external view with kanban-assigned hash
    return NextResponse.json(
      {
        columnHash: newColumn.columnHash,
        name: newColumn.title.toLowerCase().replace(/\s+/g, '-'),
        title: newColumn.title,
        order: newColumn.order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create column:', error);
    return NextResponse.json(
      { error: 'Failed to create column' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler);
