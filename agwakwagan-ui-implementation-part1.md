# Agwakwagan UI Implementation Files - Part 1

## Complete React Component Files

### 1. Main Board Component

**File: `app/components/Board/KanbanBoard.tsx`**

```tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import styled from '@emotion/styled';
import { Board, Column as ColumnType, Card as CardType } from '@/types/board';
import { Column } from './Column';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useBoard } from '@/hooks/useBoard';

const BoardContainer = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100vh;
  background: var(--bg-primary);
  position: relative;
  
  /* Ozhiaki texture overlay */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: 
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 35px,
        rgba(109, 46, 66, 0.01) 35px,
        rgba(109, 46, 66, 0.01) 70px
      );
    pointer-events: none;
    z-index: 1;
  }
`;

const BoardHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-default);
  position: relative;
  z-index: 10;
  
  h1 {
    font-family: var(--font-display);
    font-size: 32px;
    font-weight: 600;
    color: var(--maroon);
    letter-spacing: -0.02em;
    display: flex;
    align-items: baseline;
    gap: 16px;
    
    /* Ojibwe syllabics */
    &::before {
      content: 'ᐊᑲᐗᑲᐣ';
      font-size: 14px;
      color: var(--text-muted);
      opacity: 0.6;
    }
    
    .board-name {
      font-size: 24px;
      color: var(--text-secondary);
      font-weight: 400;
    }
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  
  button {
    padding: 8px 16px;
    background: var(--maroon);
    color: white;
    border: none;
    border-radius: 6px;
    font-family: var(--font-body);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s var(--ease-out);
    
    &:hover {
      background: var(--cedar);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
`;

const ColumnsWrapper = styled.div`
  overflow: hidden;
  position: relative;
  z-index: 5;
`;

const ColumnsContainer = styled.div`
  display: flex;
  gap: 24px;
  padding: 32px;
  overflow-x: auto;
  overflow-y: hidden;
  height: 100%;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--sage);
    border-radius: 4px;
    
    &:hover {
      background: var(--maroon);
    }
  }
`;

interface KanbanBoardProps {
  boardId: string;
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const { board, loading, error, moveCard, addCard, updateCard, deleteCard } = useBoard(boardId);
  const {
    dragState,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useDragAndDrop(moveCard);
  
  const [isAddingCard, setIsAddingCard] = useState<string | null>(null);
  
  // Animate on mount
  useEffect(() => {
    const columns = document.querySelectorAll('.column');
    columns.forEach((col, index) => {
      (col as HTMLElement).style.animationDelay = `${index * 0.1}s`;
    });
  }, [board]);
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (error) {
    return <ErrorState error={error} />;
  }
  
  if (!board) {
    return null;
  }
  
  const getCardsForColumn = (columnId: string): CardType[] => {
    return Object.values(board.cards)
      .filter(card => card.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  };
  
  return (
    <BoardContainer>
      <BoardHeader>
        <h1>
          Agwakwagan
          <span className="board-name">{board.metadata.name}</span>
        </h1>
        <HeaderActions>
          <button onClick={() => window.location.reload()}>
            Sync
          </button>
          <button onClick={() => console.log('Settings')}>
            Settings
          </button>
        </HeaderActions>
      </BoardHeader>
      
      <ColumnsWrapper>
        <ColumnsContainer>
          {board.columnOrder.map((columnId) => {
            const column = board.columns[columnId];
            if (!column) return null;
            
            const cards = getCardsForColumn(columnId);
            const isDragOver = dragState.dragOverColumn === columnId;
            
            return (
              <Column
                key={columnId}
                column={column}
                cards={cards}
                isDragOver={isDragOver}
                isAddingCard={isAddingCard === columnId}
                onDragEnter={(e) => handleDragEnter(e, columnId)}
                onDragOver={(e) => handleDragOver(e, columnId, cards.length)}
                onDrop={(e) => handleDrop(e, columnId)}
                onCardDragStart={(cardId) => 
                  handleDragStart({} as React.DragEvent, cardId, columnId)
                }
                onCardDragEnd={handleDragEnd}
                onAddCard={(title, description) => {
                  addCard(columnId, title, description);
                  setIsAddingCard(null);
                }}
                onStartAddCard={() => setIsAddingCard(columnId)}
                onCancelAddCard={() => setIsAddingCard(null)}
                dropIndicatorIndex={
                  dragState.dragOverColumn === columnId 
                    ? dragState.dropIndicatorIndex 
                    : null
                }
              />
            );
          })}
        </ColumnsContainer>
      </ColumnsWrapper>
    </BoardContainer>
  );
}

// Loading skeleton
const LoadingState = styled.div`
  display: flex;
  gap: 24px;
  padding: 32px;
  
  .skeleton-column {
    width: 320px;
    height: 600px;
    background: linear-gradient(
      to right,
      var(--bg-secondary) 8%,
      var(--bg-hover) 38%,
      var(--bg-secondary) 54%
    );
    background-size: 936px 104px;
    animation: shimmer 1.5s linear infinite;
    border-radius: 12px;
  }
  
  @keyframes shimmer {
    0% { background-position: -468px 0; }
    100% { background-position: 468px 0; }
  }
`;

// Error state
const ErrorState = ({ error }: { error: string }) => (
  <div style={{ padding: '32px', color: 'var(--cedar)' }}>
    Error loading board: {error}
  </div>
);
```

### 2. Column Component

**File: `app/components/Board/Column.tsx`**

```tsx
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
  onCardDragStart: (cardId: string) => void;
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
          // Reset drag over state
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
              onDragStart={() => onCardDragStart(card.id)}
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
```

### 3. Card Component

**File: `app/components/Board/Card.tsx`**

```tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  
  /* External ID indicator */
  ${props => props.hasExternalId && `
    &::after {
      content: '⚡';
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
      width: ${e.currentTarget.offsetWidth}px;
      background: var(--bg-card);
      border-radius: 8px;
      padding: 16px;
      box-shadow: var(--shadow-xl);
      transform: rotate(5deg);
      opacity: 0.9;
      pointer-events: none;
    `;
    dragImage.innerHTML = e.currentTarget.innerHTML;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, e.currentTarget.offsetWidth / 2, 20);
    
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
      draggable
      isDragging={isDragging}
      hasExternalId={!!card.externalId}
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
```

### 4. Add Card Form

**File: `app/components/Board/AddCardForm.tsx`**

```tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';

const FormContainer = styled.div`
  background: var(--bg-card);
  border-radius: 8px;
  padding: 16px;
  border: 2px solid var(--maroon);
  animation: slideDown 0.2s var(--ease-out);
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  font-family: var(--font-display);
  font-size: 16px;
  border: 1px solid var(--border-default);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  margin-bottom: 8px;
  
  &:focus {
    outline: none;
    border-color: var(--maroon);
    box-shadow: 0 0 0 3px rgba(109, 46, 66, 0.1);
  }
  
  &::placeholder {
    color: var(--text-muted);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  font-family: var(--font-body);
  font-size: 14px;
  border: 1px solid var(--border-default);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  resize: vertical;
  min-height: 60px;
  margin-bottom: 12px;
  
  &:focus {
    outline: none;
    border-color: var(--maroon);
    box-shadow: 0 0 0 3px rgba(109, 46, 66, 0.1);
  }
  
  &::placeholder {
    color: var(--text-muted);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  
  button {
    flex: 1;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-family: var(--font-body);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s var(--ease-out);
    
    &.primary {
      background: var(--maroon);
      color: white;
      
      &:hover {
        background: var(--cedar);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    
    &.secondary {
      background: var(--bg-secondary);
      color: var(--text-primary);
      
      &:hover {
        background: var(--border-default);
      }
    }
  }
`;

interface AddCardFormProps {
  onSubmit: (title: string, description?: string) => void;
  onCancel: () => void;
}

export function AddCardForm({ onSubmit, onCancel }: AddCardFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim(), description.trim() || undefined);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };
  
  return (
    <FormContainer onKeyDown={handleKeyDown}>
      <form onSubmit={handleSubmit}>
        <Input
          ref={titleInputRef}
          type="text"
          placeholder="Enter card title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        
        <TextArea
          placeholder="Add a description (optional)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        
        <ButtonGroup>
          <button 
            type="submit" 
            className="primary"
            disabled={!title.trim()}
          >
            Add Card
          </button>
          <button 
            type="button" 
            className="secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
}
```
