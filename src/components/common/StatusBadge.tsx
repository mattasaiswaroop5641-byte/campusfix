import React from 'react';
import { IssueStatus } from '../../types';
import { Clock, CheckCircle2, AlertCircle, Wrench, UserCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: IssueStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let IconComponent = Clock;
  let pulse = false;

  switch (status) {
    case 'Submitted':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200/80';
      IconComponent = Clock;
      break;
    case 'Acknowledged':
      colorClasses = 'bg-purple-50 text-purple-700 border-purple-200/80';
      IconComponent = AlertCircle;
      break;
    case 'Assigned':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200/80';
      IconComponent = UserCheck;
      break;
    case 'In Progress':
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      IconComponent = Wrench;
      pulse = true;
      break;
    case 'Resolved':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      IconComponent = CheckCircle2;
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3.5 py-1.5 gap-2'
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs transition-all ${colorClasses} ${sizeClasses}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
        </span>
      )}
      {showIcon && !pulse && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{status}</span>
    </span>
  );
};
