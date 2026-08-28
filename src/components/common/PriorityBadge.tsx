import React from 'react';
import { Priority } from '../../types';
import { Flame, AlertTriangle, Check } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let IconComponent = Check;

  switch (priority) {
    case 'High':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/90 font-semibold';
      IconComponent = Flame;
      break;
    case 'Medium':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200/90 font-medium';
      IconComponent = AlertTriangle;
      break;
    case 'Low':
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
      IconComponent = Check;
      break;
  }

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-md border shadow-2xs ${colorClasses} ${sizeClasses}`}
    >
      <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{priority} Priority</span>
    </span>
  );
};
