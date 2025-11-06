"use client";

import { Card as CardType } from "@/types/board";

/**
 * Card - Represents a single task card
 *
 * Displays card title, description, and notes count with Ozhiaki theme styling.
 * Includes smooth hover states and transitions for better UX.
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
      className="bg-white dark:bg-[var(--color-surface)]
                 border border-[var(--color-border)] dark:border-[var(--color-dark-border)]
                 rounded-lg p-3 mb-2
                 shadow-sm hover:shadow-md
                 transition-all duration-200
                 cursor-pointer
                 hover:border-[var(--color-primary)] dark:hover:border-[var(--color-primary)]
                 hover:translate-y-[-2px]"
      role="article"
      aria-label={`Card: ${card.title}`}
    >
      {/* Card Title */}
      <h3 className="text-sm font-medium text-[var(--color-text)] dark:text-[var(--color-dark-text)]
                     leading-snug break-words">
        {card.title}
      </h3>

      {/* Card Description (if present) */}
      {card.description && (
        <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]
                      mt-2 leading-relaxed break-words">
          {card.description}
        </p>
      )}

      {/* Notes Count (if notes exist) */}
      {card.notes.length > 0 && (
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[var(--color-border-light)]
                        dark:border-[var(--color-dark-border-light)]">
          <span className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text-tertiary)]">
            💬
          </span>
          <span className="text-xs font-medium text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text-tertiary)]">
            {card.notes.length} note{card.notes.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Card Metadata (if present) */}
      {card.createdAt && (
        <div className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text-tertiary)]
                        mt-2 pt-2 border-t border-[var(--color-border-light)] dark:border-[var(--color-dark-border-light)]">
          Created {new Date(card.createdAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
