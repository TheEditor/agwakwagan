'use client';

import React, { useState, useCallback, useEffect } from 'react';
import styled from '@emotion/styled';
import { Board, Column as ColumnType, Card as CardType } from '@/types/board';
import { Column } from './Column';
import { SettingsModal } from './SettingsModal';
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
  const { board, isLoaded, moveCard, addCard, updateCard, deleteCard, updateColumn } = useBoard(boardId);
  const {
    dragState,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useDragAndDrop(moveCard);

  const [isAddingCard, setIsAddingCard] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // Animate on mount
  useEffect(() => {
    const columns = document.querySelectorAll('.column');
    columns.forEach((col, index) => {
      (col as HTMLElement).style.animationDelay = `${index * 0.1}s`;
    });
  }, [board]);

  // Keyboard shortcuts for accessibility
  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      // Alt+N: Add new card (focus first "Add a card" button)
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        const firstAddButton = document.querySelector('button[aria-label*="Add a new card"]') as HTMLButtonElement;
        if (firstAddButton) {
          firstAddButton.focus();
          firstAddButton.click();
        }
      }
      // Alt+S: Sync board
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        window.location.reload();
      }
    };

    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  }, []);

  if (!isLoaded) {
    return <LoadingState />;
  }

  if (!board) {
    return <ErrorState error="Failed to load board" />;
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
          <span className="board-name">{board.id}</span>
        </h1>
        <HeaderActions>
          <button
            onClick={() => window.location.reload()}
            aria-label="Sync board with server (Alt+S)"
            title="Sync board with server (Alt+S)"
          >
            Sync
          </button>
          <button
            onClick={() => setShowSettings(true)}
            aria-label="Board settings"
            title="Board settings"
          >
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
                onCardDragStart={(cardId, e) =>
                  handleDragStart(e, cardId, columnId)
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
                editingCardId={editingCardId}
                onEditCard={setEditingCardId}
                onDeleteCard={(cardId) => {
                  deleteCard(cardId);
                  if (editingCardId === cardId) {
                    setEditingCardId(null);
                  }
                }}
                onUpdateCard={updateCard}
                onCancelEditCard={() => setEditingCardId(null)}
                onUpdateColumn={updateColumn}
              />
            );
          })}
        </ColumnsContainer>
      </ColumnsWrapper>

      {showSettings && (
        <SettingsModal boardId={boardId} onClose={() => setShowSettings(false)} />
      )}
    </BoardContainer>
  );
}

// Loading skeleton
const LoadingStateContainer = styled.div`
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

function LoadingState() {
  return (
    <LoadingStateContainer>
      <div className="skeleton-column" />
      <div className="skeleton-column" />
      <div className="skeleton-column" />
    </LoadingStateContainer>
  );
}

// Error state
function ErrorState({ error }: { error: string }) {
  return (
    <div style={{ padding: '32px', color: 'var(--cedar)' }}>
      Error loading board: {error}
    </div>
  );
}
