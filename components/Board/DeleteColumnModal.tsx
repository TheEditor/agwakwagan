'use client';

import React, { useState, useEffect } from 'react';
import { Column } from '@/types/board';
import styled from '@emotion/styled';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s var(--ease-out);

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: var(--bg-card);
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.2s var(--ease-out);

  @keyframes slideUp {
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

const ModalHeader = styled.div`
  margin-bottom: 24px;

  h2 {
    font-family: var(--font-display);
    font-size: 24px;
    color: var(--text-primary);
    margin: 0 0 12px 0;
  }

  p {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }
`;

const CardHandlingSection = styled.div`
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 16px;
  margin: 24px 0;

  label {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16px;
    cursor: pointer;

    &:last-child {
      margin-bottom: 0;
    }

    input[type='radio'] {
      margin-right: 12px;
      margin-top: 3px;
      cursor: pointer;
    }

    span {
      flex: 1;
    }
  }
`;

const SelectContainer = styled.div`
  margin-left: 28px;
  margin-top: 8px;
  margin-bottom: 16px;

  select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-default);
    border-radius: 4px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: var(--maroon);
      box-shadow: 0 0 0 3px rgba(109, 46, 66, 0.1);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 32px;

  button {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: 4px;
    font-family: var(--font-body);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s var(--ease-out);

    &.danger {
      background: #dc2626;
      color: white;

      &:hover {
        background: #b91c1c;
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

interface DeleteColumnModalProps {
  column: Column;
  cardCount: number;
  targetColumns: Column[];
  onConfirm: (moveCardsTo?: string) => void;
  onCancel: () => void;
}

export function DeleteColumnModal({
  column,
  cardCount,
  targetColumns,
  onConfirm,
  onCancel,
}: DeleteColumnModalProps) {
  const [strategy, setStrategy] = useState<'move' | 'delete'>(
    targetColumns.length > 0 ? 'move' : 'delete'
  );
  const [targetColumnId, setTargetColumnId] = useState(
    targetColumns[0]?.id || ''
  );

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleConfirm = () => {
    if (strategy === 'move' && targetColumnId) {
      onConfirm(targetColumnId);
    } else if (strategy === 'delete') {
      onConfirm(undefined);
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContent>
        <ModalHeader>
          <h2>Delete "{column.title}"?</h2>
          {cardCount > 0 && (
            <p>This column contains {cardCount} card(s).</p>
          )}
          {cardCount === 0 && (
            <p>This column is empty.</p>
          )}
        </ModalHeader>

        {cardCount > 0 && targetColumns.length > 0 && (
          <CardHandlingSection>
            <label>
              <input
                type="radio"
                name="strategy"
                checked={strategy === 'move'}
                onChange={() => setStrategy('move')}
              />
              <span>Move cards to another column</span>
            </label>
            {strategy === 'move' && (
              <SelectContainer>
                <select
                  value={targetColumnId}
                  onChange={(e) => setTargetColumnId(e.target.value)}
                >
                  {targetColumns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </SelectContainer>
            )}

            <label>
              <input
                type="radio"
                name="strategy"
                checked={strategy === 'delete'}
                onChange={() => setStrategy('delete')}
              />
              <span>Delete all cards (cannot be undone)</span>
            </label>
          </CardHandlingSection>
        )}

        <ModalFooter>
          <button className="danger" onClick={handleConfirm}>
            Delete Column
          </button>
          <button className="secondary" onClick={onCancel}>
            Cancel
          </button>
        </ModalFooter>
      </ModalContent>
    </Overlay>
  );
}
