'use client';

import { useMemo, useState } from 'react';
import { GridConfig, GridItem, useGridDrag } from '../_hooks/useGridDrag';
import TestWidget from './widgets/TestWidget';

interface GridDashboardProps {
  items: GridItem[];
  setItems: (items: GridItem[]) => void;
  config: GridConfig;
}

export default function GridDashboard({
  items,
  setItems,
  config,
}: GridDashboardProps) {
  // 드래그 상태 추적
  const [isDragging, setIsDragging] = useState(false);

  const {
    cols: columnSize,
    rows: rowSize,
    cellSize,
    gap: gapSize,
    padding,
  } = config;

  const { onPointerDown } = useGridDrag({
    items,
    config,
    onItemChange: setItems,
    onDragStateChange: setIsDragging,
  });

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${columnSize}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${rowSize}, ${cellSize}px)`,
      gap: `${config.gap}px`,
      width: `${columnSize * cellSize + (columnSize - 1) * gapSize + padding * 2 + 4}px`, // 32px = padding (16px * 2)
      height: `${rowSize * cellSize + (rowSize - 1) * gapSize + padding * 2 + 4}px`, // 32px = padding (16px * 2)
      padding: `${padding}px`,
    }),
    [config, rowSize, columnSize]
  );

  const renderWidget = (item: GridItem) => {
    const gridColumn = `${item.col} / span ${item.colSpan}`;
    const gridRow = `${item.row} / span ${item.rowSpan}`;

    // 위젯 타입에 따라 다른 컴포넌트 렌더링 (확장 가능)
    const getWidgetComponent = () => {
      switch (item.type) {
        case 'test':
        default:
          return (
            <TestWidget
              id={item.id}
              title={`Widget ${item.id}`}
              color={getRandomColor(item.id)}
              size={`${item.colSpan}×${item.rowSpan}`}
            />
          );
      }
    };

    return (
      <div
        key={item.id}
        style={{ gridColumn, gridRow }}
        onPointerDown={(e) => onPointerDown(e, item)}
        className="relative"
      >
        {getWidgetComponent()}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* 그리드 헤더 */}
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-800">
          Mini Widgets Dashboard
        </h1>
        <p className="text-gray-600">
          위젯을 드래그해서 자유롭게 배치하세요. {config.cols}열 그리드 영역
          내에서 충돌 없이 배치됩니다.
        </p>
      </div>

      {/* 그리드 컨테이너 */}
      <div
        className={`relative box-border grid select-none overflow-hidden rounded-xl border-2 transition-all duration-200 ${
          isDragging
            ? 'border-blue-400 bg-blue-50/30 shadow-lg'
            : 'border-gray-300 bg-gray-50'
        } `}
        style={{
          ...gridStyle,
        }}
        aria-label="Widget grid dashboard"
      >
        {items.map(renderWidget)}
      </div>

      {/* 상태 디버그 정보 */}
      <div className="mt-6 rounded-lg bg-gray-100 p-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Grid State</h3>
        <div className="text-xs text-gray-600">
          <div className="mb-2">
            <strong>Config:</strong> {config.cols} cols, {config.cellSize}px
            cells, {config.gap}px gap
          </div>
          <pre className="max-h-32 overflow-auto rounded bg-white p-2 text-[10px]">
            {JSON.stringify(items, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

// 아이디 기반으로 일관된 색상 생성
function getRandomColor(id: string): string {
  const colors = ['blue', 'green', 'purple', 'orange', 'red'];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
