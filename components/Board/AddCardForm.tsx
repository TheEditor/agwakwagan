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
