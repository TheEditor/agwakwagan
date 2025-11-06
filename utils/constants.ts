import { Board } from "@/types/board";

/**
 * Default board configuration
 *
 * This is the initial state when a user first opens the app
 * or when no saved board exists.
 *
 * ⭐ Note: Includes board ID for future API/agent integration
 */
export const DEFAULT_BOARD: Board = {
  id: "board-default", // ⭐ CRITICAL: Required for Phase 7-8 agent integration

  cards: {}, // Start with no cards

  columns: {
    "col-todo": {
      id: "col-todo",
      title: "TODO",
      order: 0,
    },
    "col-progress": {
      id: "col-progress",
      title: "In Progress",
      order: 1,
    },
    "col-done": {
      id: "col-done",
      title: "Done",
      order: 2,
    },
  },

  columnOrder: ["col-todo", "col-progress", "col-done"],

  metadata: {
    version: "1.0",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

/**
 * LocalStorage key for board data
 *
 * Format includes board ID for future multi-board support
 */
export const STORAGE_KEY = "agwakwagan-board";

/**
 * Application version
 * Used for data migration and compatibility checks
 */
export const APP_VERSION = "1.0.0";

/**
 * Default column titles
 * Used when creating new boards
 */
export const DEFAULT_COLUMN_TITLES = [
  "TODO",
  "In Progress",
  "Done",
] as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  CARD_TITLE_MIN_LENGTH: 1,
  CARD_TITLE_MAX_LENGTH: 500,
  CARD_DESCRIPTION_MAX_LENGTH: 5000,
  NOTE_MIN_LENGTH: 1,
  NOTE_MAX_LENGTH: 2000,
  COLUMN_TITLE_MIN_LENGTH: 1,
  COLUMN_TITLE_MAX_LENGTH: 100,
} as const;

/**
 * Performance thresholds
 * When to show warnings or enable optimizations
 */
export const PERFORMANCE = {
  CARD_COUNT_WARNING: 200, // Warn user at this many cards
  CARD_COUNT_VIRTUALIZE: 300, // Enable virtualization at this count
  AUTO_SAVE_DEBOUNCE_MS: 500, // Wait time before saving after change
} as const;
