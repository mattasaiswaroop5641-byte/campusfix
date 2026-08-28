import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEPARTMENTS, BLOCKS, CATEGORIES } from '../../data/demoData';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Layers, 
  PieChart,
  Activity,
  AlertTriangle,
  Wrench,
  Building2,
  SlidersHorizontal
} from 'lucide-react';

export const InsightsView: React.FC = () => {
  const { issues, setSelectedIssue } = useApp();
  const [activeChartFilter, setActiveChartFilter] = useState<'All' | 'High' | 'Resolved'>('All');

  const total = issues.length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const inProgress = issues.filter(i => i.status === 'In Progress').length;
  const pending = issues.filter(i => i.status === 'Submitted' || i.status === 'Acknowledged' || i.status === 'Assigned').length;
  const highPriority = issues.filter(i => i.priority === 'High' && i.status !== 'Resolved').length;
  const medPriority = issues.filter(i => i.priority === 'Medium').length;
  const lowPriority = issues.filter(i => i.priority === 'Low').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const pendingRate = total > 0 ? Math.round((pending / total) * 100) : 0;
  const inProgressRate = total > 0 ? Math.round((inProgress / total) * 100) : 0;

  // Filtered issues for charts if user selects quick filter
  const displayedIssues = activeChartFilter === 'All' 
    ? issues 
    : activeChartFilter === 'High' 
    ? issues.filter(i => i.priority === 'High') 
    : issues.filter(i => i.status === 'Resolved');

  // Category statistics
  const categoryStats = CATEGORIES.map(cat => {
    const count = displayedIssues.filter(i => i.category === cat.name).length;
    const pct = displayedIssues.length > 0 ? Math.round((count / displayedIssues.length) * 100) : 0;
    return { name: cat.name, icon: cat.icon, count, pct };
  }).sort((a, b) => b.count - a.count);

  // Department statistics
  const deptStats = DEPARTMENTS.map(dept => {
    const count = displayedIssues.filter(i => i.department === dept).length;
    const pct = displayedIssues.length > 0 ? Math.round((count / displayedIssues.length) * 100) : 0;
    return { name: dept, count, pct };
  }).sort((a, b) => b.count - a.count);

  // Block statistics
  const blockStats = BLOCKS.map(b => {
    const blockIssues = issues.filter(i => i.block === b);
    const activeHigh = blockIssues.filter(i => i.priority === 'High' && i.status !== 'Resolved').length;
    const blockResolved = blockIssues.filter(i => i.status === 'Resolved').length;
    const blockPending = blockIssues.filter(i => i.status !== 'Resolved').length;
    const resRate = blockIssues.length > 0 ? Math.round((blockResolved / blockIssues.length) * 100) : 0;
    return {
      name: b,
      count: blockIssues.length,
      activeHigh,
      resolved: blockResolved,
      pending: blockPending,
      resRate
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Graphical KPI Overview */}
      <div className="glass-card p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-blue-100/80 text-blue-700">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Campus Facilities Analytics & Charts
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Graphical breakdown of campus maintenance tickets, block density, and category distribution.
          </p>
        </div>

        {/* Quick Filter Controls */}
        <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 self-start md:self-auto">
          <button
            onClick={() => setActiveChartFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeChartFilter === 'All'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All ({total})
          </button>
          <button
            onClick={() => setActiveChartFilter('High')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeChartFilter === 'High'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            High Priority ({issues.filter(i => i.priority === 'High').length})
          </button>
          <button
            onClick={() => setActiveChartFilter('Resolved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeChartFilter === 'Resolved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Resolved ({resolved})
          </button>
        </div>
      </div>

      {/* Row 1: Resolution Health & Status Distribution Graphical Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Visual Gauge 1: Status Distribution Bar */}
        <div className="glass-card p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Ticket Resolution Status
              </h3>
            </div>
            <span className="text-xs font-extrabold text-slate-900 font-mono">{total} Total</span>
          </div>

          {/* Multi-segment Graphical Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${resolutionRate}%` }}
                className="h-full bg-emerald-500 transition-all duration-700 hover:opacity-90"
                title={`Resolved: ${resolved} (${resolutionRate}%)`}
              />
              <div
                style={{ width: `${inProgressRate}%` }}
                className="h-full bg-indigo-500 transition-all duration-700 hover:opacity-90"
                title={`In Progress: ${inProgress} (${inProgressRate}%)`}
              />
              <div
                style={{ width: `${pendingRate}%` }}
                className="h-full bg-amber-400 transition-all duration-700 hover:opacity-90"
                title={`Pending: ${pending} (${pendingRate}%)`}
              />
            </div>

            {/* Legend & Count Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/60">
                <span className="text-[10px] font-bold uppercase text-emerald-700 block">Resolved</span>
                <span className="text-sm font-extrabold text-emerald-800">{resolved}</span>
                <span className="text-[10px] text-emerald-600 block">({resolutionRate}%)</span>
              </div>
              <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200/60">
                <span className="text-[10px] font-bold uppercase text-indigo-700 block">In Progress</span>
                <span className="text-sm font-extrabold text-indigo-800">{inProgress}</span>
                <span className="text-[10px] text-indigo-600 block">({inProgressRate}%)</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/60">
                <span className="text-[10px] font-bold uppercase text-amber-700 block">Pending</span>
                <span className="text-sm font-extrabold text-amber-800">{pending}</span>
                <span className="text-[10px] text-amber-600 block">({pendingRate}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Gauge 2: Severity Distribution Graph */}
        <div className="glass-card p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Severity Ratio
              </h3>
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
              {highPriority} High Priority
            </span>
          </div>

          <div className="space-y-3">
            {/* High Priority Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-rose-700 flex items-center gap-1">🔴 High Urgency</span>
                <span className="font-mono font-bold text-slate-800">{issues.filter(i => i.priority === 'High').length}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${total > 0 ? (issues.filter(i => i.priority === 'High').length / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Medium Priority Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-amber-700 flex items-center gap-1">🟡 Medium Priority</span>
                <span className="font-mono font-bold text-slate-800">{medPriority}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${total > 0 ? (medPriority / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Low Priority Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-700 flex items-center gap-1">🟢 Low Priority</span>
                <span className="font-mono font-bold text-slate-800">{lowPriority}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${total > 0 ? (lowPriority / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visual Gauge 3: Campus Block Resolution Velocity */}
        <div className="glass-card p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Block Resolution Rates
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">4 Blocks</span>
          </div>

          <div className="space-y-3">
            {blockStats.map(b => (
              <div key={b.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">{b.name}</span>
                  <span className="text-slate-600 font-mono">
                    {b.resRate}% <span className="text-[10px] text-slate-400">({b.resolved}/{b.count})</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${b.resRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 2: Category & Department Visual Frequency Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Horizontal Bar Graph */}
        <div className="glass-card p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Issues by Category
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              {categoryStats.filter(c => c.count > 0).length} active categories
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {categoryStats.map(cat => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-800">
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{cat.count}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({cat.pct}%)</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Distribution Bar Graph */}
        <div className="glass-card p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Issues by Department
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              {DEPARTMENTS.length} Academic Depts
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {deptStats.map(dept => (
              <div key={dept.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{dept.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{dept.count}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({dept.pct}%)</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${dept.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 3: Active High Priority Dispatch Matrix */}
      <div className="glass-card p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Urgent Facility Dispatch Queue
            </h3>
          </div>
          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            {issues.filter(i => i.priority === 'High' && i.status !== 'Resolved').length} Active
          </span>
        </div>

        <div className="space-y-2">
          {issues.filter(i => i.priority === 'High' && i.status !== 'Resolved').length === 0 ? (
            <div className="p-6 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 text-xs font-medium text-emerald-800 text-center">
              ✓ All high-priority tickets are resolved. No emergency maintenance required.
            </div>
          ) : (
            issues.filter(i => i.priority === 'High' && i.status !== 'Resolved').map(issue => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200/80 hover:bg-rose-100/60 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-[10px]">
                      {issue.id}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{issue.title}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {issue.block} • {issue.location} • Reported by {issue.reporter} ({issue.reporterType})
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    {issue.status}
                  </span>
                  <button className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs">
                    Triage Ticket
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
