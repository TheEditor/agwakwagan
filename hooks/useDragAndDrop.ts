import { useState, useCallback, useRef } from 'react';

interface DragState {
  draggedCardId: string | null;
  draggedFromColumn: string | null;
  dragOverColumn: string | null;
  dragOverIndex: number | null;
  dropIndicatorIndex: number | null;
}

export function useDragAndDrop(
  onCardMove: (cardId: string, targetColumnId: string, targetIndex: number) => void
) {
  const [dragState, setDragState] = useState<DragState>({
    draggedCardId: null,
    draggedFromColumn: null,
    dragOverColumn: null,
    dragOverIndex: null,
    dropIndicatorIndex: null,
  });

  const dragImageRef = useRef<HTMLDivElement | null>(null);
  const lastDragOverTime = useRef<number>(0);

  const handleDragStart = useCallback((e: React.DragEvent, cardId: string, columnId: string) => {
    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.setData('sourceColumn', columnId);

    // Create custom drag image
    const dragImage = document.createElement('div');
    dragImage.className = 'drag-ghost';
    dragImage.innerHTML = (e.currentTarget as HTMLElement).innerHTML;
    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      width: ${(e.currentTarget as HTMLElement).offsetWidth}px;
      background: var(--bg-card);
      border-radius: 8px;
      padding: 16px;
      box-shadow: var(--shadow-xl);
      transform: rotate(5deg);
      opacity: 0.9;
      pointer-events: none;
    `;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, (e.currentTarget as HTMLElement).offsetWidth / 2, 20);
    dragImageRef.current = dragImage;

    setDragState({
      draggedCardId: cardId,
      draggedFromColumn: columnId,
      dragOverColumn: null,
      dragOverIndex: null,
      dropIndicatorIndex: null,
    });
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent, columnId: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (!dragState.draggedCardId) return;

      setDragState((prev) => ({
        ...prev,
        dragOverColumn: columnId,
      }));
    },
    [dragState.draggedCardId]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, columnId: string, totalCards: number) => {
      e.preventDefault();
      e.stopPropagation();

      // Throttle drag over events for performance
      const now = Date.now();
      if (now - lastDragOverTime.current < 50) return;
      lastDragOverTime.current = now;

      if (!dragState.draggedCardId) return;

      e.dataTransfer.dropEffect = 'move';

      // Calculate drop position based on mouse position
      const container = e.currentTarget as HTMLElement;
      const rect = container.getBoundingClientRect();
      const y = e.clientY - rect.top;

      // Find all card elements in this container
      const cards = container.querySelectorAll('[data-card-id]');
      let dropIndex = totalCards; // Default to end

      // Find insertion point between cards
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i] as HTMLElement;
        const cardRect = card.getBoundingClientRect();
        const cardMiddle = cardRect.top + cardRect.height / 2;

        if (e.clientY < cardMiddle) {
          dropIndex = i;
          break;
        }
      }

      setDragState((prev) => ({
        ...prev,
        dragOverColumn: columnId,
        dragOverIndex: dropIndex,
        dropIndicatorIndex: dropIndex,
      }));
    },
    [dragState.draggedCardId]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, columnId: string) => {
      e.preventDefault();
      e.stopPropagation();

      const cardId = e.dataTransfer.getData('cardId');
      const sourceColumn = e.dataTransfer.getData('sourceColumn');

      if (!cardId || !columnId) return;

      const dropIndex = dragState.dropIndicatorIndex ?? 0;

      // Execute the move
      onCardMove(cardId, columnId, dropIndex);

      // Reset state
      handleDragEnd();
    },
    [dragState.dropIndicatorIndex, dragState.dragOverIndex, onCardMove]
  );

  const handleDragEnd = useCallback(() => {
    // Cleanup
    if (dragImageRef.current && document.body.contains(dragImageRef.current)) {
      document.body.removeChild(dragImageRef.current);
      dragImageRef.current = null;
    }

    setDragState({
      draggedCardId: null,
      draggedFromColumn: null,
      dragOverColumn: null,
      dragOverIndex: null,
      dropIndicatorIndex: null,
    });
  }, []);

  const handleDragLeave = useCallback(
    (e: React.DragEvent, columnId: string) => {
      // Only reset if truly leaving the column
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (!e.currentTarget.contains(relatedTarget)) {
        setDragState((prev) => ({
          ...prev,
          dragOverColumn: prev.dragOverColumn === columnId ? null : prev.dragOverColumn,
          dropIndicatorIndex:
            prev.dragOverColumn === columnId ? null : prev.dropIndicatorIndex,
        }));
      }
    },
    []
  );

  return {
    dragState,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleDragLeave,
  };
}
