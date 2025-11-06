"use client";

import { Card as CardType } from "@/types/board";

/**
 * Card - Represents a single task card
 *
 * Placeholder for Phase 0. Full implementation in Phase 1.
 */
interface CardProps {
  card: CardType;
  index?: number;
  onUpdate?: (cardId: string, updates: Partial<CardType>) => void;
  onDelete?: (cardId: string) => void;
}

export function Card({ card, index = 0, onUpdate, onDelete }: CardProps) {
  return (
    <div
      className="bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)]
                    rounded-lg p-3 mb-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <h3 className="text-sm font-medium text-[var(--color-text)]">
        {card.title}
      </h3>
      {card.description && (
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          {card.description}
        </p>
      )}
      {card.notes.length > 0 && (
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
          {card.notes.length} note{card.notes.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
