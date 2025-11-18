# Agwakwagan UI Redesign Specification

**Project:** Agwakwagan Kanban Board - Complete UI Overhaul
**Brand:** Ozhiaki Identity System
**Target:** Desktop-first Professional Development Tool
**Date:** November 2025

---

## Executive Summary

Complete redesign of Agwakwagan's UI to fix critical functionality (drag-drop), eliminate generic AI aesthetics, and establish distinctive Ozhiaki brand presence. This spec provides implementation-ready component architecture with working drag-drop, professional desktop layout, and cultural design elements.

---

## Part 1: Design System Foundation

### Color Palette

```typescript
// Ozhiaki Brand Colors - CSS Variables
const ozhiakiColors = {
  // Primary
  cmuMaroon: '#6D2E42',      // Primary brand
  forestGreen: '#0A3622',    // Secondary brand
  
  // Supporting (extract from brand guide if available)
  earthBrown: '#3E2723',     // Dark UI elements
  cedarRed: '#8B3A3A',       // Warnings, active states
  skyBlue: '#4A6FA5',        // Info states
  sageGreen: '#7A8B7F',      // Muted backgrounds
  birchCream: '#F5E6D3',     // Light backgrounds
  snowWhite: '#FAFAFA',      // Pure white alternative
  
  // Functional
  charcoal: '#1A1A1A',       // Text primary
  graphite: '#2D2D2D',       // Deep backgrounds
  slate: '#4A4A4A',          // Borders, dividers
  ash: '#787878',            // Muted text
  pearl: '#E8E8E8',          // Light borders
  
  // State colors
  success: '#0A3622',        // Forest green
  warning: '#8B3A3A',        // Cedar red
  info: '#4A6FA5',           // Sky blue
  error: '#A62828',          // Deeper red
}

// CSS Variables Setup
:root {
  --maroon: #6D2E42;
  --forest: #0A3622;
  --earth: #3E2723;
  --cedar: #8B3A3A;
  --sky: #4A6FA5;
  --sage: #7A8B7F;
  --birch: #F5E6D3;
  --snow: #FAFAFA;
  
  --bg-primary: #FAFAFA;
  --bg-secondary: #F5E6D3;
  --bg-card: #FFFFFF;
  --bg-hover: #F5E6D3;
  
  --text-primary: #1A1A1A;
  --text-secondary: #4A4A4A;
  --text-muted: #787878;
  
  --border-default: #E8E8E8;
  --border-focus: #6D2E42;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1A1A1A;
    --bg-secondary: #2D2D2D;
    --bg-card: #2D2D2D;
    --bg-hover: #3E2723;
    
    --text-primary: #FAFAFA;
    --text-secondary: #E8E8E8;
    --text-muted: #787878;
    
    --border-default: #4A4A4A;
    --border-focus: #8B3A3A;
  }
}
```

### Typography

```css
/* Font Stack - Avoiding generic AI choices */
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Fira+Code:wght@400;500;600&display=swap');

:root {
  --font-display: 'Crimson Pro', 'Iowan Old Style', 'Palatino', serif;
  --font-body: 'Fira Code', 'Cascadia Code', 'SF Mono', monospace;
  --font-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  /* Type Scale - Desktop First */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.5rem;     /* 24px */
  --text-2xl: 2rem;      /* 32px */
  --text-3xl: 2.5rem;    /* 40px */
  
  /* Line Heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* Letter Spacing */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.02em;
}
```

### Spacing System

```css
:root {
  /* 8px base unit */
  --space-1: 0.5rem;   /* 8px */
  --space-2: 1rem;     /* 16px */
  --space-3: 1.5rem;   /* 24px */
  --space-4: 2rem;     /* 32px */
  --space-5: 2.5rem;   /* 40px */
  --space-6: 3rem;     /* 48px */
  --space-8: 4rem;     /* 64px */
  --space-10: 5rem;    /* 80px */
  --space-12: 6rem;    /* 96px */
  --space-16: 8rem;    /* 128px */
}
```

### Visual Effects

```css
:root {
  /* Shadows - Layered depth */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
  
  /* Borders */
  --radius-sm: 0.25rem;  /* 4px */
  --radius-md: 0.5rem;   /* 8px */
  --radius-lg: 0.75rem;  /* 12px */
  --radius-xl: 1rem;     /* 16px */
  
  /* Transitions */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## Part 2: Component Architecture

### Board Layout

```tsx
// Main Board Container
interface BoardLayoutProps {
  board: Board;
  onCardMove: (cardId: string, targetColumnId: string, targetIndex: number) => void;
}

const BoardLayout = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100vh;
  background: var(--bg-primary);
  position: relative;
  
  /* Subtle texture overlay */
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
  }
`;

const BoardHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-default);
  
  h1 {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--maroon);
    letter-spacing: var(--tracking-tight);
    
    /* Ojibwe syllabics as decoration */
    &::before {
      content: 'ᐊᑲᐗᑲᐣ';
      font-size: var(--text-sm);
      color: var(--text-muted);
      margin-right: var(--space-2);
      opacity: 0.6;
    }
  }
`;

const ColumnsContainer = styled.div`
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  overflow-x: auto;
  overflow-y: hidden;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--sage);
    border-radius: var(--radius-sm);
    
    &:hover {
      background: var(--maroon);
    }
  }
`;
```

### Column Component

```tsx
interface ColumnProps {
  column: Column;
  cards: Card[];
  onCardMove: (cardId: string, targetIndex: number) => void;
}

const ColumnContainer = styled.div<{ isDragOver: boolean }>`
  flex: 0 0 320px;
  min-height: 600px;
  background: ${props => props.isDragOver ? 'var(--bg-hover)' : 'var(--bg-secondary)'};
  border-radius: var(--radius-lg);
  border: 2px solid ${props => props.isDragOver ? 'var(--maroon)' : 'transparent'};
  transition: all 0.2s var(--ease-out);
  display: flex;
  flex-direction: column;
  position: relative;
  
  /* Column shadow effect */
  box-shadow: 
    inset 0 0 0 1px var(--border-default),
    var(--shadow-md);
`;

const ColumnHeader = styled.div`
  padding: var(--space-3);
  border-bottom: 1px solid var(--border-default);
  
  h2 {
    font-family: var(--font-body);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  
  .card-count {
    font-size: var(--text-sm);
    color: var(--text-muted);
    background: var(--bg-primary);
    padding: 2px 8px;
    border-radius: var(--radius-sm);
  }
`;

const CardsContainer = styled.div`
  flex: 1;
  padding: var(--space-2);
  overflow-y: auto;
  
  /* Smooth scroll */
  scroll-behavior: smooth;
  
  /* Cards gap */
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

const DropZone = styled.div<{ isActive: boolean }>`
  height: ${props => props.isActive ? '80px' : '4px'};
  margin: var(--space-1) 0;
  background: ${props => props.isActive 
    ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, var(--maroon) 10px, var(--maroon) 20px)' 
    : 'transparent'};
  opacity: ${props => props.isActive ? 0.2 : 0};
  border-radius: var(--radius-sm);
  transition: all 0.2s var(--ease-out);
`;
```

### Card Component with Drag & Drop

```tsx
interface CardProps {
  card: Card;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const CardContainer = styled.div<{ isDragging: boolean }>`
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  cursor: grab;
  user-select: none;
  position: relative;
  
  /* Multi-layer shadow for depth */
  box-shadow: ${props => props.isDragging 
    ? 'var(--shadow-xl)' 
    : 'var(--shadow-sm)'};
  
  /* Border accent */
  border-left: 3px solid var(--maroon);
  
  /* Smooth transitions */
  transition: all 0.2s var(--ease-out);
  transform: ${props => props.isDragging ? 'rotate(5deg) scale(1.05)' : 'none'};
  opacity: ${props => props.isDragging ? 0.8 : 1};
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
  
  &:active {
    cursor: grabbing;
  }
  
  /* External ID indicator */
  &[data-external]::before {
    content: '⚡';
    position: absolute;
    top: 8px;
    right: 8px;
    color: var(--sky);
    font-size: var(--text-sm);
  }
`;

const CardTitle = styled.h3`
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  line-height: var(--leading-tight);
`;

const CardDescription = styled.p`
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-normal);
  
  /* Truncate after 3 lines */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--border-default);
  
  .timestamp {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    color: var(--text-muted);
  }
  
  .notes-indicator {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--sage);
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;
```

---

## Part 3: Drag & Drop Implementation

### Core DnD System

```typescript
// hooks/useDragAndDrop.ts
import { useState, useCallback, useRef, useEffect } from 'react';

interface DragState {
  draggedCardId: string | null;
  draggedFromColumn: string | null;
  dragOverColumn: string | null;
  dragOverIndex: number | null;
  dropIndicatorIndex: number | null;
}

export function useDragAndDrop(onCardMove: (cardId: string, targetColumnId: string, targetIndex: number) => void) {
  const [dragState, setDragState] = useState<DragState>({
    draggedCardId: null,
    draggedFromColumn: null,
    dragOverColumn: null,
    dragOverIndex: null,
    dropIndicatorIndex: null,
  });

  const dragImageRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, cardId: string, columnId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
    
    // Create custom drag image
    const dragImage = document.createElement('div');
    dragImage.className = 'drag-ghost';
    dragImage.innerHTML = e.currentTarget.innerHTML;
    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      width: ${e.currentTarget.offsetWidth}px;
      transform: rotate(5deg);
      opacity: 0.8;
      pointer-events: none;
    `;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, e.currentTarget.offsetWidth / 2, 20);
    dragImageRef.current = dragImage;

    setDragState({
      draggedCardId: cardId,
      draggedFromColumn: columnId,
      dragOverColumn: null,
      dragOverIndex: null,
      dropIndicatorIndex: null,
    });
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (dragState.draggedCardId) {
      setDragState(prev => ({ ...prev, dragOverColumn: columnId }));
    }
  }, [dragState.draggedCardId]);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Calculate drop position based on mouse position
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const dropIndex = y > height / 2 ? index + 1 : index;
    
    setDragState(prev => ({
      ...prev,
      dragOverColumn: columnId,
      dragOverIndex: index,
      dropIndicatorIndex: dropIndex,
    }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    const dropIndex = dragState.dropIndicatorIndex ?? 0;
    
    if (cardId && columnId) {
      onCardMove(cardId, columnId, dropIndex);
    }
    
    // Cleanup
    if (dragImageRef.current) {
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
  }, [dragState.dropIndicatorIndex, onCardMove]);

  const handleDragEnd = useCallback(() => {
    // Cleanup if drop didn't happen
    if (dragImageRef.current) {
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

  return {
    dragState,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
}
```

### Touch Support for Tablets

```typescript
// hooks/useTouchDragAndDrop.ts
import { useState, useCallback, useRef } from 'react';

interface TouchDragState {
  isDragging: boolean;
  draggedElement: HTMLElement | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function useTouchDragAndDrop() {
  const [touchState, setTouchState] = useState<TouchDragState>({
    isDragging: false,
    draggedElement: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent, cardId: string) => {
    const touch = e.touches[0];
    const element = e.currentTarget as HTMLElement;
    
    // Start long press detection
    longPressTimer.current = setTimeout(() => {
      // Trigger haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      setTouchState({
        isDragging: true,
        draggedElement: element,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
      });
      
      // Create floating clone
      const clone = element.cloneNode(true) as HTMLElement;
      clone.id = 'touch-drag-clone';
      clone.style.cssText = `
        position: fixed;
        left: ${touch.clientX}px;
        top: ${touch.clientY}px;
        width: ${element.offsetWidth}px;
        pointer-events: none;
        z-index: 9999;
        transform: rotate(5deg) scale(1.05);
        transition: none;
      `;
      document.body.appendChild(clone);
    }, 500); // 500ms long press
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchState.isDragging) return;
    
    const touch = e.touches[0];
    const clone = document.getElementById('touch-drag-clone');
    
    if (clone) {
      clone.style.left = `${touch.clientX - 50}px`;
      clone.style.top = `${touch.clientY - 20}px`;
    }
    
    setTouchState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
    }));
  }, [touchState.isDragging]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    const clone = document.getElementById('touch-drag-clone');
    if (clone) {
      document.body.removeChild(clone);
    }
    
    if (touchState.isDragging) {
      // Find drop target
      const dropTarget = document.elementFromPoint(
        touchState.currentX,
        touchState.currentY
      );
      
      // Trigger drop if valid target
      if (dropTarget?.classList.contains('column-drop-zone')) {
        // Handle drop logic
      }
    }
    
    setTouchState({
      isDragging: false,
      draggedElement: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
    });
  }, [touchState]);

  return {
    touchState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
```

---

## Part 4: Animations & Interactions

### Page Load Animation

```css
/* Staggered reveal animation */
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

.board-header {
  animation: fadeInUp 0.6s var(--ease-out);
}

.column {
  animation: fadeInUp 0.6s var(--ease-out) backwards;
}

.column:nth-child(1) { animation-delay: 0.1s; }
.column:nth-child(2) { animation-delay: 0.2s; }
.column:nth-child(3) { animation-delay: 0.3s; }
.column:nth-child(4) { animation-delay: 0.4s; }

.card {
  animation: fadeInUp 0.4s var(--ease-out) backwards;
}

/* Shimmer effect for loading */
@keyframes shimmer {
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
}

.skeleton-card {
  background: linear-gradient(
    to right,
    var(--bg-secondary) 8%,
    var(--bg-hover) 38%,
    var(--bg-secondary) 54%
  );
  background-size: 936px 104px;
  animation: shimmer 1.5s linear infinite;
}
```

### Micro-interactions

```typescript
// Card hover effect with magnetic cursor
const CardInteractive = styled(CardContainer)`
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: var(--mouse-y, 50%);
    left: var(--mouse-x, 50%);
    transform: translate(-50%, -50%);
    width: 300px;
    height: 300px;
    background: radial-gradient(
      circle,
      rgba(109, 46, 66, 0.1) 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.3s var(--ease-out);
    pointer-events: none;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

// JavaScript for magnetic effect
const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
  e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
};
```

### Scroll-triggered animations

```typescript
// Intersection Observer for scroll animations
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    },
    { threshold: 0.1 }
  );
  
  document.querySelectorAll('.card').forEach((card) => {
    observer.observe(card);
  });
  
  return () => observer.disconnect();
}, []);
```

---

## Part 5: Responsive & Accessibility

### Desktop-First Responsive

```css
/* Base: Desktop (1440px+) */
.columns-container {
  display: flex;
  gap: 24px;
  padding: 32px;
}

.column {
  flex: 0 0 320px;
}

/* Laptop (1024px - 1439px) */
@media (max-width: 1439px) {
  .column {
    flex: 0 0 280px;
  }
}

/* Tablet (768px - 1023px) - Not priority but functional */
@media (max-width: 1023px) {
  .columns-container {
    padding: 16px;
    gap: 16px;
  }
  
  .column {
    flex: 0 0 240px;
  }
}

/* Mobile (< 768px) - Basic support only */
@media (max-width: 767px) {
  .columns-container {
    flex-direction: column;
  }
  
  .column {
    flex: 1 1 auto;
    max-width: 100%;
  }
}
```

### Keyboard Navigation

```typescript
// Full keyboard support
const handleKeyDown = (e: React.KeyboardEvent, cardId: string, columnId: string) => {
  switch(e.key) {
    case 'Enter':
    case ' ':
      // Open card details
      openCardModal(cardId);
      break;
    case 'ArrowLeft':
      // Move to previous column
      moveToPreviousColumn(cardId, columnId);
      break;
    case 'ArrowRight':
      // Move to next column
      moveToNextColumn(cardId, columnId);
      break;
    case 'ArrowUp':
      // Move card up in column
      moveCardUp(cardId, columnId);
      break;
    case 'ArrowDown':
      // Move card down in column
      moveCardDown(cardId, columnId);
      break;
    case 'Delete':
      // Delete card (with confirmation)
      if (e.shiftKey) {
        deleteCard(cardId);
      }
      break;
  }
};
```

### ARIA Labels

```tsx
<div 
  role="region" 
  aria-label="Kanban board"
  className="board-container"
>
  <div 
    role="list" 
    aria-label="Board columns"
    className="columns-container"
  >
    <div 
      role="listitem"
      aria-label={`${column.title} column with ${cards.length} cards`}
      className="column"
    >
      <div 
        role="list"
        aria-label={`Cards in ${column.title}`}
        className="cards-container"
      >
        <div
          role="listitem"
          aria-label={`Card: ${card.title}`}
          draggable
          tabIndex={0}
          className="card"
        >
          {/* Card content */}
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## Part 6: Performance Optimizations

### Virtual Scrolling for Large Boards

```typescript
// Use react-window for virtualization
import { FixedSizeList } from 'react-window';

const VirtualizedCardList = ({ cards, height }: { cards: Card[], height: number }) => {
  const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => (
    <div style={style}>
      <Card card={cards[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={height}
      itemCount={cards.length}
      itemSize={120} // Approximate card height
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

### Optimistic Updates

```typescript
// Immediate UI updates before API confirmation
const moveCard = useCallback(async (cardId: string, targetColumnId: string, targetIndex: number) => {
  // Optimistic update
  setBoard(prevBoard => {
    const newBoard = { ...prevBoard };
    const card = newBoard.cards[cardId];
    
    if (card) {
      card.columnId = targetColumnId;
      card.order = targetIndex;
      card.updatedAt = new Date();
    }
    
    return newBoard;
  });
  
  try {
    // API call
    await fetch(`/api/boards/${boardId}/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify({ column: targetColumnId, order: targetIndex }),
    });
  } catch (error) {
    // Revert on failure
    console.error('Failed to move card:', error);
    // Reload board from server
    await loadBoard(boardId);
  }
}, [boardId]);
```

### Debounced Search

```typescript
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

// Usage
const searchTerm = useDebounce(inputValue, 300);
```

---

## Implementation Checklist

### Phase 1: Core Components (2 hours)
- [ ] Set up color system with CSS variables
- [ ] Implement typography with Crimson Pro + Fira Code
- [ ] Create base layout components (BoardLayout, ColumnContainer, CardContainer)
- [ ] Add Ozhiaki branding elements

### Phase 2: Drag & Drop (2 hours)
- [ ] Implement useDragAndDrop hook
- [ ] Add HTML5 drag/drop to cards
- [ ] Create drop zones with visual feedback
- [ ] Add custom drag ghost image
- [ ] Test cross-column moves

### Phase 3: Animations (1 hour)
- [ ] Add staggered load animations
- [ ] Implement hover effects
- [ ] Add smooth transitions
- [ ] Create loading skeletons

### Phase 4: Polish & Testing (1 hour)
- [ ] Add keyboard navigation
- [ ] Implement ARIA labels
- [ ] Test with screen reader
- [ ] Performance optimization
- [ ] Dark mode support

---

## Testing Scenarios

### Drag & Drop Tests
1. Drag card within same column - reorder works
2. Drag card to different column - moves correctly
3. Drag card to empty column - becomes first card
4. Drag external card (with externalId) - preserves ID
5. Cancel drag (ESC key) - returns to origin

### Visual Tests
1. Cards show Ozhiaki colors correctly
2. Hover effects trigger smoothly
3. Animations don't cause jank
4. Scrollbars styled consistently
5. Dark mode switches properly

### Accessibility Tests
1. Tab through all cards
2. Arrow keys move cards
3. Screen reader announces changes
4. Focus states visible
5. Color contrast passes WCAG AA

---

## Success Metrics

- ✅ Drag & drop works flawlessly
- ✅ Zero generic AI aesthetics (no Inter, no purple gradients)
- ✅ Ozhiaki brand prominent (maroon/green colors, Ojibwe elements)
- ✅ Desktop-optimized (1440px primary target)
- ✅ Performance: <100ms interaction response
- ✅ Accessibility: WCAG AA compliant
- ✅ External cards identifiable (lightning icon)
- ✅ Professional, not toy-like appearance
