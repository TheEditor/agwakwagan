'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { Column as ColumnType, Card as CardType } from '@/types/board';
import { Card } from './Card';
import { AddCardForm } from './AddCardForm';
import { DeleteColumnModal } from './DeleteColumnModal';

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

  &:hover {
    .column-actions {
      opacity: 1;
    }
  }

  &:focus {
    outline: 2px solid var(--maroon);
    outline-offset: 2px;
  }

  &:focus:not(:focus-visible) {
    outline: none;
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

const ColumnTitleInput = styled.input`
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  background: var(--bg-card);
  border: 2px solid var(--maroon);
  border-radius: 4px;
  padding: 4px 8px;
  width: 100%;
  outline: none;

  &:focus {
    box-shadow: 0 0 0 3px rgba(109, 46, 66, 0.1);
  }
`;

const ColumnTitleDisplay = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s var(--ease-out);
`;

const ColumnActions = styled.div`
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
    font-size: 14px;
    transition: all 0.2s var(--ease-out);
    padding: 0;

    &:hover {
      background: var(--maroon);
      color: white;
    }
  }

  @media (hover: none) {
    opacity: 1;
  }
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
  editingCardId?: string | null;
  onEditCard?: (cardId: string) => void;
  onDeleteCard?: (cardId: string) => void;
  onUpdateCard?: (cardId: string, updates: Partial<Pick<CardType, 'title' | 'description'>>) => void;
  onCancelEditCard?: () => void;
  onUpdateColumn?: (columnId: string, updates: Partial<Pick<ColumnType, 'title'>>) => void;
  onDeleteColumn?: (columnId: string, moveCardsTo?: string) => void;
  otherColumns?: ColumnType[];
  totalColumnCount?: number;
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
  editingCardId,
  onEditCard,
  onDeleteCard,
  onUpdateCard,
  onCancelEditCard,
  onUpdateColumn,
  onDeleteColumn,
  otherColumns = [],
  totalColumnCount = 1,
}: ColumnProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only respond when column is hovered/focused and not already editing
      if (!isEditingTitle && isHovered) {
        // F2 to edit column name
        if (e.key === 'F2') {
          e.preventDefault();
          handleStartEdit();
        }

        // Delete or Backspace to delete column
        if ((e.key === 'Delete' || e.key === 'Backspace') && totalColumnCount > 1) {
          e.preventDefault();
          setShowDeleteModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHovered, isEditingTitle, totalColumnCount]);

  const handleStartEdit = () => {
    setEditTitle(column.title);
    setIsEditingTitle(true);
  };

  const handleSaveEdit = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== column.title && trimmed.length <= 100) {
      onUpdateColumn?.(column.id, { title: trimmed });
    }
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(column.title);
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

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
      role="region"
      aria-label={`${column.title} column with ${cards.length} ${cards.length === 1 ? 'card' : 'cards'}`}
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={(e) => {
        // Only clear hover if focus is leaving the column entirely
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsHovered(false);
        }
      }}
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
          {isEditingTitle ? (
            <ColumnTitleInput
              ref={titleInputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              maxLength={100}
              aria-label="Edit column title"
            />
          ) : (
            <>
              <span className="column-title">
                <ColumnTitleDisplay>{column.title}</ColumnTitleDisplay>
                <span className="card-count">{cards.length}</span>
              </span>

              <ColumnActions className="column-actions">
                <button
                  onClick={handleStartEdit}
                  aria-label={`Edit column name: ${column.title}`}
                  title="Edit column name (F2)"
                >
                  ✏️
                </button>
                {totalColumnCount > 1 && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    aria-label={`Delete column: ${column.title}`}
                    title="Delete column (Del)"
                  >
                    🗑️
                  </button>
                )}
              </ColumnActions>
            </>
          )}
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
              isEditing={editingCardId === card.id}
              onEdit={() => onEditCard?.(card.id)}
              onDelete={() => {
                if (window.confirm(`Delete card "${card.title}"?`)) {
                  onDeleteCard?.(card.id);
                }
              }}
              onUpdate={onUpdateCard}
              onCancelEdit={onCancelEditCard}
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
          <AddButton
            onClick={onStartAddCard}
            aria-label={`Add a new card to ${column.title} column`}
            title={`Add a new card to ${column.title} column`}
          >
            + Add a card
          </AddButton>
        )}
      </CardsContainer>

      {showDeleteModal && (
        <DeleteColumnModal
          column={column}
          cardCount={cards.length}
          targetColumns={otherColumns}
          onConfirm={(moveCardsTo) => {
            onDeleteColumn?.(column.id, moveCardsTo);
            setShowDeleteModal(false);
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </ColumnContainer>
  );
}
