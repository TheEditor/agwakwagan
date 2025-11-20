'use client';

import React, { useEffect } from 'react';
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

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContent>
        <ModalHeader>
          <h2>{title}</h2>
          <p>{message}</p>
        </ModalHeader>

        <ModalFooter>
          <button
            className={isDanger ? 'danger' : ''}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button className="secondary" onClick={onCancel}>
            {cancelText}
          </button>
        </ModalFooter>
      </ModalContent>
    </Overlay>
  );
}
