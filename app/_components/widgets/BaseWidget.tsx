'use client';
import React from 'react';

export interface WidgetProps {
  id: string;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function BaseWidget({
  id,
  title,
  children,
  className = '',
}: WidgetProps) {
  return (
    <div
      className={`flex h-full cursor-grab touch-none flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 ease-out hover:border-gray-300 hover:shadow-md ${className} `}
      role="group"
      aria-roledescription="draggable widget"
      aria-label={`widget-${id}`}
    >
      {title && (
        <div className="mb-2 border-b border-gray-100 pb-2 text-sm font-medium text-gray-600">
          {title}
        </div>
      )}
      <div className="flex flex-1 flex-col text-gray-700">
        {children || (
          <div className="flex min-h-[80px] flex-1 items-center justify-center text-gray-400">
            Widget {id}
          </div>
        )}
      </div>
    </div>
  );
}
