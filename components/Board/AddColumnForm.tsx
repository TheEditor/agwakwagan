'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';

const FormContainer = styled.div`
  background: var(--bg-card);
  border-radius: 8px;
  padding: 12px;
  border: 2px solid var(--maroon);
  animation: slideDown 0.2s var(--ease-out);
  min-width: 180px;

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
  box-sizing: border-box;

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
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    font-family: var(--font-body);
    font-size: 13px;
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

interface AddColumnFormProps {
  onSubmit: (title: string) => void;
  onCancel: () => void;
}

export function AddColumnForm({ onSubmit, onCancel }: AddColumnFormProps) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
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
          ref={inputRef}
          type="text"
          placeholder="Column name..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={50}
          aria-label="Column name"
          autoFocus
        />

        <ButtonGroup>
          <button
            type="submit"
            className="primary"
            disabled={!title.trim()}
            aria-label="Add column"
          >
            Add
          </button>
          <button
            type="button"
            className="secondary"
            onClick={onCancel}
            aria-label="Cancel"
          >
            Cancel
          </button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
}
