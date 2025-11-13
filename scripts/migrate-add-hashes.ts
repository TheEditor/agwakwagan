import { FileSystemDataSource } from '@/lib/datasources/fileSystem';
import { generateCardHash, generateColumnHash } from '@/utils/hash';

/**
 * Migration script: Add cardHash and columnHash to existing boards
 *
 * Adds kanban-assigned hashes to cards and columns that don't have them.
 * This is idempotent - safe to run multiple times.
 *
 * Usage: npx tsx scripts/migrate-add-hashes.ts
 */
async function migrate() {
  const dataSource = new FileSystemDataSource();

  try {
    console.log('Starting migration to add hashes to existing cards/columns...\n');

    const boards = await dataSource.listBoards();

    if (boards.length === 0) {
      console.log('No boards found. Nothing to migrate.');
      return;
    }

    for (const boardSummary of boards) {
      console.log(`Processing board: ${boardSummary.id}`);

      const board = await dataSource.loadBoard(boardSummary.id);

      let cardsChanged = 0;
      let columnsChanged = 0;

      // Add hashes to columns (format: col-xxxx)
      Object.values(board.columns).forEach(column => {
        if (!column.columnHash) {
          column.columnHash = generateColumnHash();
          columnsChanged++;
          console.log(
            `  ✓ Added columnHash to column "${column.title}": ${column.columnHash}`
          );
        }
      });

      // Add hashes to cards (format: card-xxxx)
      Object.values(board.cards).forEach(card => {
        if (!card.cardHash) {
          card.cardHash = generateCardHash();
          cardsChanged++;
          console.log(
            `  ✓ Added cardHash to card "${card.title}": ${card.cardHash}`
          );
        }
      });

      if (cardsChanged > 0 || columnsChanged > 0) {
        board.metadata.updatedAt = new Date();
        await dataSource.saveBoard(board);
        console.log(
          `  → Saved ${boardSummary.id}: +${columnsChanged} column hashes, +${cardsChanged} card hashes\n`
        );
      } else {
        console.log(
          `  → No changes needed - all resources already have hashes\n`
        );
      }
    }

    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrate();
