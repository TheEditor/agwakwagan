import { Board } from '@/types/board';

export interface ExportMetadata {
  exportedAt: string;
  version: string;
  appName: string;
}

export interface ExportedBoard {
  metadata: ExportMetadata;
  board: Board;
}

/**
 * Export board to JSON file with metadata
 */
export function exportBoard(board: Board): void {
  const exportData: ExportedBoard = {
    metadata: {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      appName: 'Agwakwagan'
    },
    board
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  // Generate filename with date
  const dateStr = new Date().toISOString().split('T')[0];
  const boardName = (board.metadata.title || board.id || 'board').toLowerCase().replace(/\s+/g, '-');
  const filename = `agwakwagan-${boardName}-${dateStr}.json`;
  
  // Trigger download
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename from board
 */
export function generateExportFilename(board: Board): string {
  const dateStr = new Date().toISOString().split('T')[0];
  const boardName = (board.metadata.title || board.id || 'board').toLowerCase().replace(/\s+/g, '-');
  return `agwakwagan-${boardName}-${dateStr}.json`;
}
