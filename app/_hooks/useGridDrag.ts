'use client';

import { useCallback, useEffect, useRef } from 'react';

export interface GridItem {
  id: string;
  row: number; // 1-based
  col: number; // 1-based
  rowSpan: number; // >=1
  colSpan: number; // >=1
  type?: string; // widget type
}

export interface GridConfig {
  cols: number;
  rows: number;
  cellSize: number;
  gap: number;
  padding: number;
}

interface DragState {
  id: string | null;
  startX: number;
  startY: number;
  originRow: number;
  originCol: number;
  element: HTMLElement | null;
  dx: number;
  dy: number;
  rafId?: number;
}

const INITIAL_DRAG_STATE = {
  id: null,
  startX: 0,
  startY: 0,
  originRow: 0,
  originCol: 0,
  element: null,
  dx: 0,
  dy: 0,
};

type UseGridDrag = (args: {
  items: GridItem[];
  config: GridConfig;
  onItemChange: (items: GridItem[]) => void;
  onDragStateChange?: (isDragging: boolean) => void;
}) => {
  onPointerDown: Function;
};

export const useGridDrag: UseGridDrag = ({
  config,
  items,
  onItemChange,
  onDragStateChange,
}) => {
  const dragRef = useRef<DragState>(INITIAL_DRAG_STATE);

  const { cols: columnSize, rows: rowSize } = config;

  // 그리드 경계 계산
  const calculateBounds = useCallback(
    (item: GridItem) => {
      return {
        minCol: 1,
        maxCol: columnSize - item.colSpan + 1,
        minRow: 1,
        maxRow: rowSize - item.rowSpan + 1,
      };
    },
    [items, columnSize, rowSize]
  );

  // 이동 거리 제한
  const constrainMovement = useCallback(
    (
      rawDx: number,
      rawDy: number,
      item: GridItem,
      originCol: number,
      originRow: number
    ) => {
      const cellWithGap = config.cellSize + config.gap;
      const bounds = calculateBounds(item);

      // 최대 이동 가능 거리 (픽셀)
      const maxLeft = (originCol - bounds.minCol) * cellWithGap;
      const maxRight = (bounds.maxCol - originCol) * cellWithGap;
      const maxUp = (originRow - bounds.minRow) * cellWithGap;
      const maxDown = (bounds.maxRow - originRow) * cellWithGap;

      return {
        dx: Math.max(-maxLeft, Math.min(maxRight, rawDx)),
        dy: Math.max(-maxUp, Math.min(maxDown, rawDy)),
      };
    },
    [config, calculateBounds]
  );

  // 드래그 시작
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, item: GridItem) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const drag = dragRef.current;
      drag.id = item.id;
      drag.startX = e.clientX;
      drag.startY = e.clientY;
      drag.originRow = item.row;
      drag.originCol = item.col;
      drag.element = target;
      drag.dx = 0;
      drag.dy = 0;

      // 드래그 시작 시각적 효과
      target.style.willChange = 'transform';
      target.style.zIndex = '50';
      target.style.transform = 'scale(1.02)';
      target.classList.add('shadow-lg');

      // 드래그 상태 변경 알림
      onDragStateChange?.(true);
    },
    [onDragStateChange]
  );

  // 포인터 이벤트 핸들러들
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.id || !drag.element) return;

      const rawDx = e.clientX - drag.startX;
      const rawDy = e.clientY - drag.startY;

      const currentItem = items.find((item) => item.id === drag.id);
      if (!currentItem) return;

      // 이동 거리 제한
      const constrainedMovement = constrainMovement(
        rawDx,
        rawDy,
        currentItem,
        drag.originCol,
        drag.originRow
      );

      drag.dx = constrainedMovement.dx;
      drag.dy = constrainedMovement.dy;

      // 부드러운 애니메이션
      if (!drag.rafId) {
        drag.rafId = requestAnimationFrame(() => {
          if (drag.element) {
            drag.element.style.transform = `translate(${drag.dx}px, ${drag.dy}px) scale(1.02)`;
            drag.element.style.transition = 'none';
          }
          drag.rafId = undefined;
        });
      }
    },
    [items, constrainMovement]
  );

  const handlePointerUp = useCallback(() => {
    const drag = dragRef.current;
    if (!drag.id || !drag.element) return;

    const currentItem = items.find((item) => item.id === drag.id);
    if (!currentItem) return;

    // 스냅 계산
    const cellWithGap = config.cellSize + config.gap;
    const deltaCols = Math.round(drag.dx / cellWithGap);
    const deltaRows = Math.round(drag.dy / cellWithGap);

    // 새 위치 계산 및 경계 제한
    const bounds = calculateBounds(currentItem);
    let newCol = Math.max(
      bounds.minCol,
      Math.min(bounds.maxCol, drag.originCol + deltaCols)
    );
    let newRow = Math.max(
      bounds.minRow,
      Math.min(bounds.maxRow, drag.originRow + deltaRows)
    );

    // 충돌 검사
    const hasCollision = checkCollision(currentItem, newRow, newCol, items);
    const finalRow = hasCollision ? currentItem.row : newRow;
    const finalCol = hasCollision ? currentItem.col : newCol;

    console.log(drag.originCol, drag.originRow, finalCol, finalRow);

    const finalDx = (finalCol - drag.originCol) * cellWithGap;
    const finalDy = (finalRow - drag.originRow) * cellWithGap;

    // DOM 스타일 복구
    drag.element.style.transform = '';
    drag.element.style.willChange = '';
    drag.element.style.zIndex = '';

    drag.element.classList.remove('shadow-lg');

    // 상태 업데이트
    onItemChange(
      items.map((item) =>
        item.id === drag.id ? { ...item, row: finalRow, col: finalCol } : item
      )
    );

    // 드래그 상태 초기화
    drag.id = null;
    drag.element = null;

    // 드래그 종료 알림
    onDragStateChange?.(false);
  }, [
    items,
    config,
    onItemChange,
    calculateBounds,
    checkCollision,
    onDragStateChange,
  ]);

  // 전역 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  return {
    onPointerDown: handlePointerDown,
  };
};

// AABB 충돌 검사
const checkCollision = (
  item: GridItem,
  newRow: number,
  newCol: number,
  allItems: GridItem[]
): boolean => {
  return allItems.some((other) => {
    if (other.id === item.id) return false;

    const itemBounds = {
      r1: newRow,
      r2: newRow + item.rowSpan - 1,
      c1: newCol,
      c2: newCol + item.colSpan - 1,
    };

    const otherBounds = {
      r1: other.row,
      r2: other.row + other.rowSpan - 1,
      c1: other.col,
      c2: other.col + other.colSpan - 1,
    };

    return !(
      itemBounds.r2 < otherBounds.r1 ||
      otherBounds.r2 < itemBounds.r1 ||
      itemBounds.c2 < otherBounds.c1 ||
      otherBounds.c2 < itemBounds.c1
    );
  });
};
