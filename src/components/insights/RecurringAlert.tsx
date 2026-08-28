import React from 'react';
import { RecurringIssueCluster } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  Bot, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Flame, 
  Building, 
  MapPin, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface RecurringAlertProps {
  cluster: RecurringIssueCluster;
}

export const RecurringAlert: React.FC<RecurringAlertProps> = ({ cluster }) => {
  const { setSelectedIssue, setSearchQuery, setActiveTab, currentUser } = useApp();

  const handleInspectCluster = () => {
    setSearchQuery(cluster.location);
    if (currentUser?.role === 'admin') {
      setActiveTab('all-issues');
    } else {
      setActiveTab('my-reports');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border-2 border-amber-400/80 p-6 shadow-md">
      
      {/* Top Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/30">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <span>🤖 RECURRING ISSUE DETECTED</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-200/90 text-amber-900 text-[10px] font-bold">
                {cluster.count} Complaints Logged
              </span>
            </span>
            <p className="text-[11px] text-amber-800/80 font-medium">
              AI Hotspot Pattern Matching in {cluster.block}
            </p>
          </div>
        </div>

        <button
          onClick={handleInspectCluster}
          className="px-3.5 py-1.5 text-xs font-bold text-amber-950 bg-amber-200/80 hover:bg-amber-300 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span>View All {cluster.count} Reports</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Alert Message */}
      <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-xs border border-amber-200/90 mb-3">
        <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-500" />
          "{cluster.location} has received multiple {cluster.category} complaints."
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          Both students and faculty members have submitted recurring tickets for {cluster.category.toLowerCase()} instability in {cluster.location} ({cluster.block}).
        </p>
      </div>

      {/* AI Recommendation */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 text-white shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-indigo-300" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Automated Root-Cause Recommendation
          </span>
        </div>
        <p className="text-xs sm:text-sm text-indigo-100 font-medium leading-relaxed">
          "{cluster.recommendation}"
        </p>
      </div>
    </div>
  );
};
