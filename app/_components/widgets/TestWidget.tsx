'use client';
import BaseWidget, { WidgetProps } from './BaseWidget';

interface TestWidgetProps extends WidgetProps {
  color?: string;
  size?: string;
}

export default function TestWidget({
  id,
  title = 'Test Widget',
  color = 'blue',
  size,
  className = '',
  ...props
}: TestWidgetProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
  };

  return (
    <BaseWidget
      id={id}
      title={title}
      className={`${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} ${className}`}
      {...props}
    >
      <div className="flex min-h-[100px] flex-1 flex-col items-center justify-center">
        <div className="mb-2 text-2xl font-bold text-gray-600">
          {id.toUpperCase()}
        </div>
        {size && <div className="text-xs text-gray-500">Size: {size}</div>}
        <div className="mt-1 text-xs text-gray-400">Drag me around!</div>
      </div>
    </BaseWidget>
  );
}
