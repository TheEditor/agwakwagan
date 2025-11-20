'use client';

import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { useToast } from '@/hooks/useToast';

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
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  h2 {
    font-family: var(--font-display);
    font-size: 24px;
    color: var(--text-primary);
    margin: 0;
  }

  button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    color: var(--text-secondary);
    transition: color 0.2s var(--ease-out);

    &:hover {
      color: var(--text-primary);
    }
  }
`;

const SettingsSection = styled.div`
  margin-bottom: 24px;

  h3 {
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 12px 0;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
  }
`;

const InfoBox = styled.div`
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 12px;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-primary);
  word-break: break-all;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;

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

    &.primary {
      background: var(--maroon);
      color: white;

      &:hover {
        background: var(--cedar);
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

interface SettingsModalProps {
  boardId: string;
  onClose: () => void;
}

export function SettingsModal({ boardId, onClose }: SettingsModalProps) {
  const { error: showError } = useToast();

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContent>
        <ModalHeader>
          <h2>Board Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close settings modal"
            title="Close (Escape)"
          >
            ✕
          </button>
        </ModalHeader>

        <SettingsSection>
          <h3>Board ID</h3>
          <p>This unique identifier is used to track your board's data.</p>
          <InfoBox>{boardId}</InfoBox>
        </SettingsSection>

        <SettingsSection>
          <h3>Data Management</h3>
          <p>Your board is automatically saved to your browser's local storage.</p>
          <ButtonGroup>
            <button
              className="secondary"
              onClick={() => {
                const boardData = localStorage.getItem(`agwakwagan-${boardId}`);
                if (boardData) {
                  const blob = new Blob([boardData], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `board-${boardId}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }}
              aria-label="Export board data as JSON"
            >
              Export
            </button>
            <button
              className="secondary"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e: Event) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      try {
                        // Validate JSON before importing
                        JSON.parse(content);
                        localStorage.setItem(`agwakwagan-${boardId}`, content);
                        window.location.reload();
                      } catch (err) {
                        showError('Invalid board file. Please select a valid JSON export.');
                      }
                    };
                    reader.readAsText(file);
                  }
                };
                input.click();
              }}
              aria-label="Import board data from JSON file"
            >
              Import
            </button>
          </ButtonGroup>
        </SettingsSection>

        <SettingsSection>
          <h3>Theme</h3>
          <p>Theme support coming soon.</p>
        </SettingsSection>

        <ModalFooter>
          <button className="secondary" onClick={onClose}>
            Close
          </button>
        </ModalFooter>
      </ModalContent>
    </Overlay>
  );
}
