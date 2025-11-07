"use client";

import { memo } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Card as CardType } from "@/types/board";

/**
 * Card - Represents a single task card
 *
 * Displays card title, description, and notes count with Ozhiaki theme styling.
 * Includes smooth hover states and transitions for better UX.
 * Cards can be dragged to reorder within columns or move between columns.
 */
interface CardProps {
  card: CardType;
  index: number;
  onUpdate?: (cardId: string, updates: Partial<CardType>) => void;
  onDelete?: (cardId: string) => void;
}

function CardComponent({ card, index, onUpdate, onDelete }: CardProps) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white
                     border border-[var(--color-border)]
                     rounded-lg p-3 mb-2
                     shadow-sm hover:shadow-md
                     cursor-grab active:cursor-grabbing
                     hover:border-[var(--color-primary)]
                     hover:translate-y-[-2px]`}
          role="article"
          aria-label={`Card: ${card.title}`}
          style={{
            ...provided.draggableProps.style,
          }}
        >
      {/* Card Title */}
      <h3 className="text-sm font-medium text-[var(--color-text)]
                     leading-snug break-words">
        {card.title}
      </h3>

      {/* Card Description (if present) */}
      {card.description && (
        <p className="text-xs text-[var(--color-text-secondary)]
                      mt-2 leading-relaxed break-words">
          {card.description}
        </p>
      )}

      {/* Notes Count (if notes exist) */}
      {card.notes.length > 0 && (
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[var(--color-border-light)]">
          <span className="text-xs text-[var(--color-text-tertiary)]">
            💬
          </span>
          <span className="text-xs font-medium text-[var(--color-text-tertiary)]">
            {card.notes.length} note{card.notes.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Card Metadata (if present) */}
      {card.createdAt && (
        <div className="text-xs text-[var(--color-text-tertiary)]
                        mt-2 pt-2 border-t border-[var(--color-border-light)]">
          Created {new Date(card.createdAt).toLocaleDateString()}
        </div>
      )}
        </div>
      )}
    </Draggable>
  );
}

export const Card = memo(CardComponent, (prevProps, nextProps) => {
  // Only re-render if card ID or index changed
  // Ignore onUpdate/onDelete prop changes
  return prevProps.card.id === nextProps.card.id &&
         prevProps.index === nextProps.index;
});
