'use client';

import { useSyncStorage } from '@app/_hooks/useSyncStorage';
import { useState } from 'react';
import GridDashboard from './_components/GridDashboard';
import { GridConfig, GridItem } from './_hooks/useGridDrag';

// 그리드 설정
const GRID_CONFIG: GridConfig = {
  cols: 6, // 12열 그리드
  rows: 6, // 6행 그리드
  cellSize: 120, // 각 셀 크기 (px)
  gap: 12, // 셀 간격 (px)
  padding: 16, // 패딩 (px)
};

// 초기 테스트 위젯들
const INITIAL_ITEMS: GridItem[] = [
  { id: 'widget-1', row: 1, col: 1, rowSpan: 2, colSpan: 3, type: 'test' },
  { id: 'widget-2', row: 1, col: 4, rowSpan: 1, colSpan: 2, type: 'test' },
  { id: 'widget-3', row: 2, col: 4, rowSpan: 1, colSpan: 1, type: 'test' },
  { id: 'widget-4', row: 3, col: 1, rowSpan: 1, colSpan: 4, type: 'test' },
  { id: 'widget-5', row: 1, col: 5, rowSpan: 3, colSpan: 2, type: 'test' },
];

export default function Page() {
  const [items, setItems] = useState<GridItem[]>(INITIAL_ITEMS);
  const { isSyncing } = useSyncStorage<GridItem[]>(
    'gridItems',
    items,
    (value) => setItems(value)
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="">
        <GridDashboard
          items={items}
          setItems={setItems}
          config={GRID_CONFIG}
          isLoading={isSyncing}
        />
      </div>
    </main>
  );
}
