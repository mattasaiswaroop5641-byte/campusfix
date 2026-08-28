import React, { useState, useEffect } from 'react';
import { CampusIssue } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { Sparkles, CheckCircle2, ArrowRight, Bot, Cpu, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AIScanModalProps {
  issue: CampusIssue;
  onClose: () => void;
  onViewIssue: (issue: CampusIssue) => void;
}

export const AIScanModal: React.FC<AIScanModalProps> = ({ issue, onClose, onViewIssue }) => {
  const [scanStep, setScanStep] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);

  useEffect(() => {
    // Stepped AI analysis simulation
    const t1 = setTimeout(() => setScanStep(1), 600); // Keyword extraction
    const t2 = setTimeout(() => setScanStep(2), 1200); // Category classification
    const t3 = setTimeout(() => setScanStep(3), 1800); // Priority & root-cause inference
    const t4 = setTimeout(() => {
      setIsDone(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {
        // ignore confetti if browser restricts
      }
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Animated AI Scanner Header */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 p-6 text-white text-center relative overflow-hidden">
          <div className="ai-scan-line"></div>
          
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white mb-3 shadow-lg shadow-blue-500/30">
            <Bot className="w-7 h-7 animate-pulse" />
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-white mb-1">
            🤖 CampusFix AI Analysis
          </h2>
          <p className="text-xs text-indigo-200 font-medium">
            {!isDone ? "Analyzing report context, location & urgency..." : "AI Triage & Classification Complete"}
          </p>
        </div>

        {/* Scan Status Steps */}
        <div className="p-6">
          {!isDone ? (
            <div className="py-8 space-y-4">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  scanStep >= 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {scanStep >= 1 ? <CheckCircle2 className="w-4 h-4" /> : <Cpu className="w-3.5 h-3.5 animate-spin" />}
                </div>
                <span>Scanning keywords and description context...</span>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  scanStep >= 2 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {scanStep >= 2 ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-3.5 h-3.5" />}
                </div>
                <span>Classifying category: <strong>{issue.category}</strong></span>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  scanStep >= 3 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {scanStep >= 3 ? <CheckCircle2 className="w-4 h-4" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                </div>
                <span>Generating recommended action & priority score...</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-6">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${(scanStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
              {/* Generated Issue ID Banner */}
              <div className="p-3.5 bg-blue-50/90 rounded-2xl border border-blue-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                    Generated Ticket ID
                  </span>
                  <span className="text-lg font-mono font-extrabold text-blue-950">
                    {issue.id}
                  </span>
                </div>
                <StatusBadge status={issue.status} size="md" />
              </div>

              {/* AI Diagnostic Output */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Detected Category
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {issue.category}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Assessed Priority
                  </span>
                  <PriorityBadge priority={issue.priority} size="sm" />
                </div>
              </div>

              {/* Summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  AI Summary
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  "{issue.aiAnalysis.summary}"
                </p>
              </div>

              {/* Recommended Action */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Recommended Action
                </span>
                <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                  {issue.aiAnalysis.recommendedAction}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Done
                </button>

                <button
                  onClick={() => onViewIssue(issue)}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Track Issue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
