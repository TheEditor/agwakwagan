'use client';

import React, { useEffect, useState } from 'react';
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

const FormGroup = styled.div`
  margin-bottom: 24px;

  label {
    display: block;
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  input {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-default);
    border-radius: 4px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: 14px;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: var(--maroon);
      box-shadow: 0 0 0 3px rgba(109, 46, 66, 0.1);
    }
  }
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 13px;
  margin-top: 6px;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 8px;

  button {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: 4px;
    font-family: var(--font-body);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s var(--ease-out);

    &.primary {
      background: var(--maroon);
      color: white;

      &:hover:not(:disabled) {
        background: #8b2f42;
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

interface InputDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  onSubmit: (value: string) => void | Promise<void>;
  onCancel: () => void;
  validate?: (value: string) => string | null; // Returns error message or null
}

export function InputDialog({
  isOpen,
  title,
  message,
  placeholder,
  defaultValue = '',
  onSubmit,
  onCancel,
  validate,
}: InputDialogProps) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setError(null);
    }
  }, [isOpen, defaultValue]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter' && !error) {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, error, value, onCancel]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleSubmit = async () => {
    const trimmed = value.trim();

    // Validate if validator provided
    if (validate) {
      const validationError = validate(trimmed);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onSubmit(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContent>
        <ModalHeader>
          <h2>{title}</h2>
          {message && <p>{message}</p>}
        </ModalHeader>

        <FormGroup>
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            autoFocus
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </FormGroup>

        <ModalFooter>
          <button
            className="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !value.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
          <button
            className="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </ModalFooter>
      </ModalContent>
    </Overlay>
  );
}
