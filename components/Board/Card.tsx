'use client';

import React, { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { Card as CardType } from '@/types/board';
import { formatDistanceToNow } from 'date-fns';

const CardContainer = styled.div<{ isDragging: boolean; hasExternalId: boolean }>`
  background: var(--bg-card);
  border-radius: 8px;
  padding: 16px;
  cursor: grab;
  user-select: none;
  position: relative;
  border-left: 3px solid var(--maroon);
  box-shadow: ${props => props.isDragging
    ? 'var(--shadow-xl)'
    : 'var(--shadow-sm)'};
  transition: all 0.2s var(--ease-out);
  transform: ${props => props.isDragging
    ? 'rotate(5deg) scale(1.05)'
    : 'none'};
  opacity: ${props => props.isDragging ? 0.8 : 1};
  animation: cardEnter 0.4s var(--ease-out) backwards;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);

    .card-actions {
      opacity: 1;
    }
  }

  &:active {
    cursor: grabbing;
  }

  /* Card Hash indicator */
  ${props => props.hasExternalId && `
    &::after {
      content: '🔗';
      position: absolute;
      top: 12px;
      right: 12px;
      color: var(--sky);
      font-size: 14px;
      opacity: 0.7;
    }
  `}

  /* Magnetic cursor effect */
  &::before {
    content: '';
    position: absolute;
    top: var(--mouse-y, 50%);
    left: var(--mouse-x, 50%);
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    background: radial-gradient(
      circle,
      rgba(109, 46, 66, 0.08) 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.3s var(--ease-out);
    pointer-events: none;
  }

  &:hover::before {
    opacity: 1;
  }

  @keyframes cardEnter {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CardTitle = styled.h3`
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.2;
  padding-right: 24px; // Space for external indicator
`;

const CardDescription = styled.p`
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-default);

  .timestamp {
    font-family: var(--font-body);
    font-size: 12px;
    color: var(--text-muted);
  }

  .notes-indicator {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--sage);
    font-size: 12px;

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const CardActions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s var(--ease-out);

  button {
    width: 24px;
    height: 24px;
    border: none;
    background: var(--bg-secondary);
    border-radius: 4px;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s var(--ease-out);

    &:hover {
      background: var(--maroon);
      color: white;
    }
  }
`;

interface CardProps {
  card: CardType;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export function Card({ card, onDragStart, onDragEnd }: CardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.id);

    // Create custom drag image
    const dragImage = document.createElement('div');
    dragImage.className = 'drag-ghost';
    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      width: ${(e.currentTarget as HTMLElement).offsetWidth}px;
      background: var(--bg-card);
      border-radius: 8px;
      padding: 16px;
      box-shadow: var(--shadow-xl);
      transform: rotate(5deg);
      opacity: 0.9;
      pointer-events: none;
    `;
    dragImage.innerHTML = (e.currentTarget as HTMLElement).innerHTML;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, (e.currentTarget as HTMLElement).offsetWidth / 2, 20);

    // Clean up after a moment
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);

    setIsDragging(true);
    onDragStart();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Open card details
      console.log('Open card:', card.id);
    }
  };

  return (
    <CardContainer
      ref={cardRef}
      className="card"
      data-card-id={card.id}
      draggable
      isDragging={isDragging}
      hasExternalId={!!card.cardHash}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseMove={handleMouseMove}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`Card: ${card.title}`}
    >
      <CardActions className="card-actions">
        <button aria-label="Edit card" title="Edit">
          ✏️
        </button>
        <button aria-label="Delete card" title="Delete">
          🗑️
        </button>
      </CardActions>

      <CardTitle>{card.title}</CardTitle>

      {card.description && (
        <CardDescription>{card.description}</CardDescription>
      )}

      <CardMeta>
        <span className="timestamp">
          {formatDistanceToNow(new Date(card.updatedAt), { addSuffix: true })}
        </span>

        {card.notes && card.notes.length > 0 && (
          <span className="notes-indicator">
            📝 {card.notes.length}
          </span>
        )}
      </CardMeta>
    </CardContainer>
  );
}
