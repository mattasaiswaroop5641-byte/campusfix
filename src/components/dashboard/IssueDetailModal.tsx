import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { IssueTimeline } from './IssueTimeline';
import { 
  X, 
  MapPin, 
  User, 
  Calendar, 
  Sparkles, 
  ShieldAlert, 
  Wrench, 
  GraduationCap, 
  Briefcase,
  Layers
} from 'lucide-react';
import { CATEGORIES } from '../../data/demoData';

export const IssueDetailModal: React.FC = () => {
  const { selectedIssue, setSelectedIssue, issues } = useApp();

  const issue = (selectedIssue ? issues.find(i => i.id === selectedIssue.id) : null) || selectedIssue;
  if (!issue) return null;

  const catObj = CATEGORIES.find(c => c.name === issue.category);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={() => setSelectedIssue(null)}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs shadow-xs">
              {issue.id}
            </span>
            <span className="text-xl">{catObj?.icon || '⚙️'}</span>
            <span className="text-xs font-semibold text-slate-300">
              {issue.category}
            </span>
          </div>

          <h2 className="text-xl font-bold text-white pr-10">
            {issue.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <PriorityBadge priority={issue.priority} size="sm" />
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Reported on {issue.createdAt}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Progress Timeline */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Resolution Progress Tracking
            </h4>
            <IssueTimeline
              currentStatus={issue.status}
              timeline={issue.timeline}
              assignedStaff={issue.assignedStaff}
            />
          </div>

          {/* Location & Reporter Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Incident Location</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{issue.location}</p>
              <p className="text-xs text-slate-500">{issue.block} • {issue.department} Dept</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {issue.reporterType === 'Student' ? (
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                ) : (
                  <Briefcase className="w-4 h-4 text-indigo-500" />
                )}
                <span>Reported By</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{issue.reporter}</p>
              <p className="text-xs text-slate-500">
                {issue.reporterType} • {issue.department}
                {issue.reporterType === 'Student' && issue.section && issue.section !== 'N/A' && (
                  <> • <strong className="text-blue-600">{issue.section}</strong></>
                )}
                {issue.reporterType === 'Faculty' && (
                  <span className="text-slate-400"> (Section: N/A)</span>
                )}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Problem Description
            </h4>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-800 leading-relaxed">
              {issue.description}
            </div>

            {issue.imageUrl && (
              <div className="mt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Attached Photo Proof
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

          {/* AI Assistance Analysis Card */}
          {issue.aiAnalysis && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/30 text-indigo-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold tracking-wide uppercase text-indigo-300">
                    CampusFix AI Diagnostic
                  </span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200">
                  {issue.aiAnalysis.confidence}% Confidence
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    AI Summary
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    "{issue.aiAnalysis.summary}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-0.5">
                    Recommended Action
                  </span>
                  <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
                    {issue.aiAnalysis.recommendedAction}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline History log */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Status Change History
            </h4>
            <div className="space-y-2">
              {issue.timeline.map((step, idx) => (
                <div key={idx} className="flex items-start justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{step.status}</span>
                    {step.note && <p className="text-slate-600 mt-0.5">{step.note}</p>}
                    {step.by && <span className="text-[11px] text-slate-400 block mt-0.5">by {step.by}</span>}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">{step.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setSelectedIssue(null)}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
