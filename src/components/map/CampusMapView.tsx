import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Block, CampusIssue } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { 
  MapPin, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Sparkles, 
  ChevronRight, 
  X,
  Layers,
  ArrowRight
} from 'lucide-react';

export const CampusMapView: React.FC = () => {
  const { issues, setSelectedIssue } = useApp();
  const [selectedBlock, setSelectedBlock] = useState<Block>('Block A');

  // Campus blocks metadata
  const blocksData: {
    id: Block;
    name: string;
    depts: string[];
    description: string;
    color: string;
  }[] = [
    {
      id: 'Block A',
      name: 'Block A - Turing Hall',
      depts: ['CSE', 'Information Tech', 'Cybersecurity'],
      description: 'Houses computer laboratories 1-5, faculty offices, and server room.',
      color: 'blue'
    },
    {
      id: 'Block B',
      name: 'Block B - Shannon Hall',
      depts: ['AI & ML', 'ECE', 'Robotics Lab'],
      description: 'Specialized deep learning servers, seminar halls, and electronics labs.',
      color: 'indigo'
    },
    {
      id: 'Block C',
      name: 'Block C - Ramanujan Wing',
      depts: ['BCA', 'Civil Engineering', 'Applied Sciences'],
      description: 'Classrooms 101-300, material testing labs, and adjacent campus cafeteria.',
      color: 'emerald'
    },
    {
      id: 'Block D',
      name: 'Block D - Edison Complex',
      depts: ['Mechanical', 'EEE', 'Mechatronics Workshops'],
      description: 'Heavy machinery labs, fluid mechanics facilities, and electrical substation.',
      color: 'amber'
    }
  ];

  // Helper to compute block metrics
  const getBlockStats = (blockId: Block) => {
    const blockIssues = issues.filter(i => i.block === blockId);
    const activeIssues = blockIssues.filter(i => i.status !== 'Resolved');
    const highPriorityActive = blockIssues.filter(i => i.priority === 'High' && i.status !== 'Resolved');
    const mediumPriorityActive = blockIssues.filter(i => i.priority === 'Medium' && i.status !== 'Resolved');
    const resolved = blockIssues.filter(i => i.status === 'Resolved');

    let health: 'critical' | 'warning' | 'healthy' = 'healthy';
    if (highPriorityActive.length > 0) {
      health = 'critical'; // 🔴
    } else if (mediumPriorityActive.length > 0 || activeIssues.length > 0) {
      health = 'warning'; // 🟡
    } else {
      health = 'healthy'; // 🟢
    }

    return {
      total: blockIssues.length,
      active: activeIssues.length,
      high: highPriorityActive.length,
      medium: mediumPriorityActive.length,
      resolved: resolved.length,
      health,
      issues: blockIssues
    };
  };

  const currentStats = getBlockStats(selectedBlock);
  const currentBlockObj = blocksData.find(b => b.id === selectedBlock)!;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Campus Problem & Infrastructure Map
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Interactive real-time campus facility status. Select any block to inspect open tickets and health.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-100 animate-pulse"></span>
            <span>🔴 Urgent Issue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-100"></span>
            <span>🟡 Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
            <span>🟢 All Clear</span>
          </div>
        </div>
      </div>

      {/* Visual Campus Interactive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {blocksData.map(b => {
          const stats = getBlockStats(b.id);
          const isSelected = selectedBlock === b.id;

          let healthBorder = 'border-slate-200';
          let healthBadge = <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">🟢 Healthy</span>;

          if (stats.health === 'critical') {
            healthBorder = isSelected ? 'border-rose-500 ring-2 ring-rose-400' : 'border-rose-300 bg-rose-50/30';
            healthBadge = <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-200 animate-pulse">🔴 {stats.high} Urgent</span>;
          } else if (stats.health === 'warning') {
            healthBorder = isSelected ? 'border-amber-500 ring-2 ring-amber-400' : 'border-amber-300 bg-amber-50/30';
            healthBadge = <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">🟡 {stats.active} Pending</span>;
          }

          return (
            <div
              key={b.id}
              onClick={() => setSelectedBlock(b.id)}
              className={`p-5 rounded-3xl bg-white border-2 cursor-pointer transition-all hover:shadow-md ${healthBorder} ${
                isSelected ? 'shadow-lg -translate-y-1' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  {b.id.replace('Block ', '')}
                </div>
                {healthBadge}
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">
                {b.id}
              </h3>
              <p className="text-xs font-medium text-slate-500 mb-3">
                {b.name.split(' - ')[1]}
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Active Complaints:</span>
                <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-900 font-bold">
                  {stats.active} / {stats.total}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Block Detailed Inspector Drawer */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg font-extrabold shadow-md shadow-blue-500/30">
              {selectedBlock.replace('Block ', '')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{currentBlockObj.name}</h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  currentStats.health === 'critical' ? 'bg-rose-100 text-rose-800' :
                  currentStats.health === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {currentStats.health.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500">{currentBlockObj.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center min-w-[80px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
              <span className="text-base font-extrabold text-slate-900">{currentStats.total}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center min-w-[80px]">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Active</span>
              <span className="text-base font-extrabold text-amber-800">{currentStats.active}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center min-w-[80px]">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Resolved</span>
              <span className="text-base font-extrabold text-emerald-800">{currentStats.resolved}</span>
            </div>
          </div>
        </div>

        {/* List of issues in this block */}
        <div className="mt-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Open & Historical Incidents in {selectedBlock}
          </h4>

          {currentStats.issues.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl">
              No reports registered for {selectedBlock}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentStats.issues.map(issue => (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {issue.id}
                      </span>
                      <StatusBadge status={issue.status} size="sm" />
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 mb-1 line-clamp-1">
                      {issue.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                      {issue.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{issue.location}</span>
                    <PriorityBadge priority={issue.priority} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
