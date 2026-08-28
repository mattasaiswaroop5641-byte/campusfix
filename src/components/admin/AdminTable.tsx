import React from 'react';
import { useApp } from '../../context/AppContext';
import { CampusIssue, Department, Block, Category, Priority, IssueStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { DEPARTMENTS, BLOCKS, CATEGORIES } from '../../data/demoData';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  ChevronRight, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Layers, 
  UserCheck,
  AlertCircle,
  Trash2
} from 'lucide-react';

export const AdminTable: React.FC = () => {
  const { 
    issues, 
    setSelectedIssue,
    deleteIssue,
    searchQuery,
    setSearchQuery,
    filterRole,
    setFilterRole,
    filterDept,
    setFilterDept,
    filterBlock,
    setFilterBlock,
    filterCategory,
    setFilterCategory,
    filterPriority,
    setFilterPriority,
    filterStatus,
    setFilterStatus,
    clearFilters,
    purgeAllIssues,
    purgeResolvedOlderThan3Days
  } = useApp();


  // Multi-dimensional filtering logic
  const filteredIssues = issues.filter(issue => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        issue.id.toLowerCase().includes(q) ||
        issue.title.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q) ||
        issue.reporter.toLowerCase().includes(q) ||
        issue.location.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Role
    if (filterRole !== 'All' && issue.reporterType !== filterRole) return false;

    // Dept
    if (filterDept !== 'All' && issue.department !== filterDept) return false;

    // Block
    if (filterBlock !== 'All' && issue.block !== filterBlock) return false;

    // Category
    if (filterCategory !== 'All' && issue.category !== filterCategory) return false;

    // Priority
    if (filterPriority !== 'All' && issue.priority !== filterPriority) return false;

    // Status
    if (filterStatus !== 'All' && issue.status !== filterStatus) return false;

    return true;
  });

  const isFiltered = 
    searchQuery.trim() !== '' ||
    filterRole !== 'All' ||
    filterDept !== 'All' ||
    filterBlock !== 'All' ||
    filterCategory !== 'All' ||
    filterPriority !== 'All' ||
    filterStatus !== 'All';

  return (
    <div className="space-y-4">
      
      {/* Filter & Search Bar */}
      <div className="glass-card p-5 rounded-3xl shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID (CF-1001), keywords, location, or reporter..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-900"
            />
          </div>

          {/* Results count & Action buttons */}
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
            <span className="text-xs font-semibold text-slate-500 mr-1">
              Showing <strong>{filteredIssues.length}</strong> of {issues.length} tickets
            </span>

            {/* 3-Day Retention Clean Button */}
            <button
              onClick={() => purgeResolvedOlderThan3Days()}
              title="Auto-purge resolved tickets older than 3 days"
              className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 flex items-center gap-1 cursor-pointer"
            >
              <span>🧹 3-Day Retention</span>
            </button>

            {/* Danger Zone: Purge Whole DB Button */}
            <button
              onClick={() => {
                if (window.confirm('⚠️ WARNING: Are you sure you want to permanently delete ALL issues from MongoDB Atlas and local storage?')) {
                  purgeAllIssues();
                }
              }}
              title="Permanently delete all tickets from database"
              className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Purge DB</span>
            </button>

            {isFiltered && (
              <button
                onClick={clearFilters}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Role Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Reporter Type
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Department
            </label>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Depts</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Block Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Block
            </label>
            <select
              value={filterBlock}
              onChange={(e) => setFilterBlock(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Blocks</option>
              {BLOCKS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Priority
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/70 backdrop-blur-md text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3.5">Issue ID</th>
                <th className="px-4 py-3.5">Reporter</th>
                <th className="px-3 py-3.5">Type</th>
                <th className="px-3 py-3.5">Dept</th>
                <th className="px-3 py-3.5">Block</th>
                <th className="px-3 py-3.5">Section</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-3 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No issues match the selected filters</p>
                    <button
                      onClick={clearFilters}
                      className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                    >
                      Reset all filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => {
                  const isFaculty = issue.reporterType === 'Faculty';
                  return (
                    <tr
                      key={issue.id}
                      onClick={() => setSelectedIssue(issue)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      {/* ID */}
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                          {issue.id}
                        </span>
                      </td>

                      {/* Reporter */}
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {issue.reporter}
                      </td>

                      {/* Type */}
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          isFaculty 
                            ? 'bg-indigo-100 text-indigo-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isFaculty ? <Briefcase className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                          {issue.reporterType}
                        </span>
                      </td>

                      {/* Dept */}
                      <td className="px-3 py-3 font-medium text-slate-700">
                        {issue.department}
                      </td>

                      {/* Block */}
                      <td className="px-3 py-3 font-medium text-slate-700 whitespace-nowrap">
                        {issue.block}
                      </td>

                      {/* Section (CRITICAL: 'N/A' for faculty, actual section for student) */}
                      <td className="px-3 py-3 font-medium">
                        {isFaculty ? (
                          <span className="text-slate-400 font-semibold px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                            N/A
                          </span>
                        ) : (
                          <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-[11px]">
                            {issue.section || 'Sec A'}
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                        {issue.category}
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3 font-medium text-slate-700 max-w-[140px] truncate" title={issue.location}>
                        {issue.location}
                      </td>

                      {/* Priority */}
                      <td className="px-3 py-3">
                        <PriorityBadge priority={issue.priority} size="sm" />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={issue.status} size="sm" />
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-[11px] text-slate-400 whitespace-nowrap">
                        {issue.createdAt.split(' ')[0]}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIssue(issue);
                            }}
                            className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-lg transition-all border border-blue-200 hover:border-blue-600 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Triage</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteIssue(issue.id);
                            }}
                            title="Delete ticket"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
