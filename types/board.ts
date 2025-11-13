// Agwakwagan Type Definitions
// Version: 1.0 (Agent-Ready)

/**
 * Card represents a single task/item in the kanban board
 */
export interface Card {
  id: string; // Format: 'card-{timestamp}-{random}'
  title: string; // Required, 1-500 characters
  description?: string; // Optional, longer description
  columnId: string; // Foreign key to Column.id
  order: number; // Position within column (0-indexed)
  createdAt: Date;
  updatedAt: Date;
  notes: Note[]; // List of notes/comments on this card

  // ⭐ NEW (Phase 4): Kanban-assigned stable hash for external API reference
  /**
   * Stable hash identifier assigned by kanban on creation
   * Used by external actors (Beads, CI/CD, agents) to reference this card
   * Format: card-{xxxx} where xxxx is 4-char base36 (0-9, a-z)
   * Generated once, never changes - allows external systems to store permanent references
   * Example: card-a3f2, card-7b2k, card-9qq0
   */
  cardHash?: string;

  // ⭐ RESERVED FOR FUTURE AGENT INTEGRATION (Phase 8)
  // Do not use these field names for other purposes:
  //
  // assignedTo?: string;           // "human:dave" or "agent:gpt-researcher"
  // claimedBy?: string;            // Who's currently working on it
  // claimedAt?: Date;              // When claimed (for timeout detection)
  // status?: TaskStatus;           // 'available' | 'claimed' | 'in_progress' | 'blocked' | 'completed'
  // progress?: number;             // 0-1 for agent progress updates
  // agentMetadata?: Record<string, any>; // Agent-specific data
}

/**
 * Note represents a comment or sub-item within a card
 */
export interface Note {
  id: string; // Format: 'note-{timestamp}-{random}'
  text: string; // Required, 1-2000 characters
  createdAt: Date;
}

/**
 * Column represents a stage/status in the kanban workflow
 */
export interface Column {
  id: string; // Format: 'col-{timestamp}-{random}' or 'col-{name}'
  title: string; // Required, 1-100 characters
  order: number; // Position in board (0-indexed)
  color?: string; // Future: custom column colors
  cardLimit?: number; // Future: WIP (Work In Progress) limits

  // ⭐ NEW (Phase 4): Kanban-assigned stable hash for external API reference
  /**
   * Stable hash identifier assigned by kanban on creation
   * Used by external actors (Beads, CI/CD, agents) to reference this column
   * Format: col-{xxxx} where xxxx is 4-char base36 (0-9, a-z)
   * Generated once, never changes - allows external systems to store permanent references
   * Example: col-x9k2, col-m4n7, col-iic8
   */
  columnHash?: string;
}

/**
 * BoardMetadata contains board-level metadata
 */
export interface BoardMetadata {
  version: string; // Data schema version (e.g., '1.0')
  createdAt: Date;
  updatedAt: Date;
  title?: string; // Future: named boards
}

/**
 * Board represents the complete kanban board state
 *
 * This uses a NORMALIZED structure (flat, not nested) for:
 * - O(1) lookups by ID
 * - Easy updates (change one field vs rebuild arrays)
 * - Simpler undo/redo (store diffs, not full state)
 * - Better performance at scale
 */
export interface Board {
  id: string; // ⭐ CRITICAL: Required for API/agent integration (Phase 7-8)
  cards: Record<string, Card>; // Dictionary/map of cards by ID
  columns: Record<string, Column>; // Dictionary/map of columns by ID
  columnOrder: string[]; // Array of column IDs for render order
  metadata: BoardMetadata;

  // ⭐ NEW (Phase 3): Data source and external system integration

  /**
   * Data source this board is stored in
   * Enables multi-source board management
   * Examples: "local-storage", "api-production", "beads-project-x"
   */
  dataSourceId?: string;

  /**
   * External system reference
   * Used when board mirrors external data (e.g., Beads project, GitHub issues)
   * Examples: Beads project ID, GitHub repo ID
   */
  externalId?: string;

  /**
   * Last sync timestamp (for external systems)
   * Tracks when this board was last synchronized with external source
   */
  lastSyncedAt?: Date;
}

/**
 * ColumnWithCards is a derived type used for rendering
 * Combines column data with its sorted cards
 */
export interface ColumnWithCards extends Column {
  cards: Card[]; // Cards for this column, sorted by order
}

/**
 * Future type for agent integration (Phase 8)
 * Reserved for future use - DO NOT implement yet
 */
// export type TaskStatus =
//   | 'available'
//   | 'claimed'
//   | 'in_progress'
//   | 'blocked'
//   | 'completed';
