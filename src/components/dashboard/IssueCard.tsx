import React from 'react';
import { CampusIssue } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { MapPin, Calendar, Sparkles, ChevronRight, User } from 'lucide-react';
import { CATEGORIES } from '../../data/demoData';

interface IssueCardProps {
  issue: CampusIssue;
  onClick: () => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onClick }) => {
  const catObj = CATEGORIES.find(c => c.name === issue.category);

  return (
    <div
      onClick={onClick}
      className="group relative glass-card glass-card-hover rounded-3xl p-5 transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top bar: Issue ID + Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs shadow-2xs">
              {issue.id}
            </span>
            <span className="text-base" title={issue.category}>
              {catObj?.icon || '⚙️'}
            </span>
            <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
              {issue.category}
            </span>
          </div>

          <StatusBadge status={issue.status} size="sm" />
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-1">
          {issue.title}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {issue.description}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 font-medium text-slate-700 truncate max-w-[65%]">
            <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <span className="truncate">{issue.block} • {issue.location}</span>
          </div>

          <PriorityBadge priority={issue.priority} size="sm" />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{issue.createdAt}</span>
          </div>

          <div className="flex items-center gap-1 text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>View Timeline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
