import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { IssueTimeline } from '../dashboard/IssueTimeline';
import { MAINTENANCE_STAFF } from '../../data/demoData';
import { 
  X, 
  MapPin, 
  Calendar, 
  Sparkles, 
  UserCheck, 
  CheckCircle2, 
  Wrench, 
  Clock, 
  GraduationCap, 
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminIssueModal: React.FC = () => {
  const { selectedIssue, setSelectedIssue, updateIssueStatus, assignStaff, deleteIssue, issues } = useApp();

  const issue = (selectedIssue ? issues.find(i => i.id === selectedIssue.id) : null) || selectedIssue;

  const [selectedStaff, setSelectedStaff] = useState<string>(issue?.assignedStaff || MAINTENANCE_STAFF[0]);
  const [customNote, setCustomNote] = useState<string>('');

  if (!issue) return null;

  const handleAcknowledge = () => {
    updateIssueStatus(issue.id, 'Acknowledged', 'Campus Admin acknowledged ticket and initiated review.');
  };

  const handleAssign = () => {
    assignStaff(issue.id, selectedStaff);
  };

  const handleStartWork = () => {
    updateIssueStatus(issue.id, 'In Progress', `Maintenance technician ${issue.assignedStaff || selectedStaff} began on-site repair.`, issue.assignedStaff || selectedStaff);
  };

  const handleResolve = () => {
    updateIssueStatus(issue.id, 'Resolved', customNote || 'Issue diagnosed, repaired, and verified operational by campus maintenance team.');
    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={() => setSelectedIssue(null)}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs shadow-xs">
              {issue.id}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {issue.category}
            </span>
            <StatusBadge status={issue.status} size="sm" />
          </div>

          <h2 className="text-xl font-bold text-white pr-10">
            {issue.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <PriorityBadge priority={issue.priority} size="sm" />
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Logged: {issue.createdAt}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Admin Fast-Action Workflow Control Center */}
          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-blue-600" />
                Administrative Dispatch & Status Workflow
              </span>
              <span className="text-xs font-semibold text-blue-700">
                Current Status: <strong>{issue.status}</strong>
              </span>
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              {/* 1. Acknowledge */}
              <button
                type="button"
                onClick={handleAcknowledge}
                disabled={issue.status !== 'Submitted'}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  issue.status === 'Submitted'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600 shadow-md cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>1. Acknowledge</span>
              </button>

              {/* 2. Assign */}
              <button
                type="button"
                onClick={handleAssign}
                disabled={issue.status === 'Resolved'}
                className="p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-md cursor-pointer transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>2. Assign Staff</span>
              </button>

              {/* 3. Start Work */}
              <button
                type="button"
                onClick={handleStartWork}
                disabled={issue.status === 'In Progress' || issue.status === 'Resolved'}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  issue.status !== 'In Progress' && issue.status !== 'Resolved'
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-md cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>3. Start Work</span>
              </button>

              {/* 4. Mark Resolved */}
              <button
                type="button"
                onClick={handleResolve}
                disabled={issue.status === 'Resolved'}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  issue.status !== 'Resolved'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-md cursor-pointer'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>4. Mark Resolved</span>
              </button>
            </div>

            {/* Staff Dispatch Selector */}
            <div className="pt-3 border-t border-blue-200/80 flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-1/2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Dispatch Maintenance Staff:
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                >
                  {MAINTENANCE_STAFF.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-1/2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Resolution Note (Optional):
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Access point rebooted & tested"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* AI Assistance Analysis Card */}
          {issue.aiAnalysis && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/30 text-indigo-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold tracking-wide uppercase text-indigo-300">
                    AI Auto-Triage & Recommendation
                  </span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200">
                  {issue.aiAnalysis.confidence}% Confidence
                </span>
              </div>

              <div className="space-y-2.5 mt-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Summary
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    "{issue.aiAnalysis.summary}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                    Recommended Maintenance Action
                  </span>
                  <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                    {issue.aiAnalysis.recommendedAction}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Location & Reporter Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Location Detail</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{issue.location}</p>
              <p className="text-xs text-slate-500">{issue.block} • {issue.department} Department</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {issue.reporterType === 'Student' ? (
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                ) : (
                  <Briefcase className="w-4 h-4 text-indigo-500" />
                )}
                <span>Reporter Identity</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{issue.reporter}</p>
              <p className="text-xs text-slate-500">
                {issue.reporterType} • {issue.department}
                {issue.reporterType === 'Student' && issue.section && issue.section !== 'N/A' && (
                  <> • <strong className="text-blue-600">{issue.section}</strong></>
                )}
                {issue.reporterType === 'Faculty' && (
                  <span className="text-slate-400 font-semibold"> (Section: N/A)</span>
                )}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Reported Description
            </h4>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-800 leading-relaxed">
              {issue.description}
            </div>

            {issue.imageUrl && (
              <div className="mt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Attached Photo Evidence
                </span>
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-64 flex items-center justify-center">
                  <img
                    src={issue.imageUrl}
                    alt="Problem attachment"
                    className="w-full h-full object-cover max-h-64 rounded-2xl"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Progress Timeline */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Timeline Status
            </h4>
            <IssueTimeline
              currentStatus={issue.status}
              timeline={issue.timeline}
              assignedStaff={issue.assignedStaff}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => deleteIssue(issue.id)}
            className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Delete Ticket</span>
          </button>

          <button
            onClick={() => setSelectedIssue(null)}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
