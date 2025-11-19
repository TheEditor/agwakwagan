'use client';

import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';

const HintsContainer = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: var(--shadow-lg);
  z-index: 40;
  font-size: 12px;
  color: var(--text-muted);
  animation: slideUp 0.3s var(--ease-out);

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

  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 220px;

  @media (hover: none) {
    display: none;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const HintRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);

  kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 22px;
    padding: 0 6px;
    background: var(--bg-primary);
    border: 1px solid var(--border-default);
    border-radius: 4px;
    font-family: monospace;
    font-size: 11px;
    font-weight: 500;
    color: var(--text-primary);
    box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.1);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
  transition: color 0.2s var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--text-primary);
  }
`;

interface KeyboardHintsProps {
  onDismiss?: () => void;
}

export function KeyboardHints({ onDismiss }: KeyboardHintsProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has dismissed hints
    const isDismissed = localStorage.getItem('agwakwagan-hints-dismissed') === 'true';
    setIsVisible(!isDismissed);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('agwakwagan-hints-dismissed', 'true');
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <HintsContainer role="region" aria-label="Keyboard shortcuts hints">
      <CloseButton
        onClick={handleDismiss}
        aria-label="Dismiss keyboard hints"
        title="Dismiss"
      >
        ✕
      </CloseButton>

      <div style={{ paddingRight: '16px', paddingTop: '4px' }}>
        <HintRow>
          <kbd>F2</kbd>
          <span>Edit column</span>
        </HintRow>
        <HintRow>
          <kbd>Del</kbd>
          <span>Delete column</span>
        </HintRow>
        <HintRow>
          <kbd>Tab</kbd>
          <span>Navigate</span>
        </HintRow>
      </div>
    </HintsContainer>
  );
}
