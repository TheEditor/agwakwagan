'use client';

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Column as ColumnType, Card as CardType } from '@/types/board';
import { Card } from './Card';
import { AddCardForm } from './AddCardForm';

const ColumnContainer = styled.div<{ isDragOver: boolean }>`
  flex: 0 0 320px;
  min-height: 600px;
  background: ${props => props.isDragOver
    ? 'rgba(109, 46, 66, 0.05)'
    : 'var(--bg-secondary)'};
  border-radius: 12px;
  border: 2px solid ${props => props.isDragOver
    ? 'var(--maroon)'
    : 'transparent'};
  transition: all 0.2s var(--ease-out);
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow:
    inset 0 0 0 1px var(--border-default),
    var(--shadow-md);
  animation: fadeInUp 0.6s var(--ease-out) backwards;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ColumnHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--border-default);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px 12px 0 0;

  h2 {
    font-family: var(--font-body);
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .column-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .card-count {
      font-size: 14px;
      color: var(--text-muted);
      background: var(--bg-primary);
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 400;
    }
  }
`;

const AddButton = styled.button`
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 2px dashed var(--border-default);
  border-radius: 8px;
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s var(--ease-out);

  &:hover {
    border-color: var(--maroon);
    color: var(--maroon);
    background: rgba(109, 46, 66, 0.05);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const CardsContainer = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;
  gap: 12px;

  /* Hide scrollbar but keep functionality */
  scrollbar-width: thin;
  scrollbar-color: var(--sage) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--sage);
    border-radius: 3px;

    &:hover {
      background: var(--maroon);
    }
  }
`;

const DropIndicator = styled.div<{ isActive: boolean }>`
  height: ${props => props.isActive ? '4px' : '2px'};
  margin: 4px 0;
  background: ${props => props.isActive
    ? 'var(--maroon)'
    : 'transparent'};
  border-radius: 2px;
  transition: all 0.2s var(--ease-out);
  opacity: ${props => props.isActive ? 0.8 : 0};
`;

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  isDragOver: boolean;
  isAddingCard: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onCardDragStart: (cardId: string, e: React.DragEvent) => void;
  onCardDragEnd: () => void;
  onAddCard: (title: string, description?: string) => void;
  onStartAddCard: () => void;
  onCancelAddCard: () => void;
  dropIndicatorIndex: number | null;
}

export function Column({
  column,
  cards,
  isDragOver,
  isAddingCard,
  onDragEnter,
  onDragOver,
  onDrop,
  onCardDragStart,
  onCardDragEnd,
  onAddCard,
  onStartAddCard,
  onCancelAddCard,
  dropIndicatorIndex,
}: ColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(e);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(e);
  };

  return (
    <ColumnContainer
      className="column"
      isDragOver={isDragOver}
      onDragEnter={onDragEnter}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={(e) => {
        // Only trigger if leaving the column entirely
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          // Reset drag over state handled by parent
        }
      }}
    >
      <ColumnHeader>
        <h2>
          <span className="column-title">
            {column.title}
            <span className="card-count">{cards.length}</span>
          </span>
        </h2>
      </ColumnHeader>

      <CardsContainer className="column-drop-zone">
        {dropIndicatorIndex === 0 && (
          <DropIndicator isActive={true} />
        )}

        {cards.map((card, index) => (
          <React.Fragment key={card.id}>
            <Card
              card={card}
              onDragStart={(e) => onCardDragStart(card.id, e)}
              onDragEnd={onCardDragEnd}
            />
            {dropIndicatorIndex === index + 1 && (
              <DropIndicator isActive={true} />
            )}
          </React.Fragment>
        ))}

        {isAddingCard ? (
          <AddCardForm
            onSubmit={onAddCard}
            onCancel={onCancelAddCard}
          />
        ) : (
          <AddButton onClick={onStartAddCard}>
            + Add a card
          </AddButton>
        )}
      </CardsContainer>
    </ColumnContainer>
  );
}
