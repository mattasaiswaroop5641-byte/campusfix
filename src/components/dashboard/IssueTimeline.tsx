import React from 'react';
import { IssueStatus, TimelineStep } from '../../types';
import { Check, Clock, UserCheck, Wrench, CheckCircle2 } from 'lucide-react';

interface IssueTimelineProps {
  currentStatus: IssueStatus;
  timeline: TimelineStep[];
  assignedStaff?: string;
}

export const IssueTimeline: React.FC<IssueTimelineProps> = ({
  currentStatus,
  timeline,
  assignedStaff
}) => {
  const steps: { status: IssueStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { status: 'Submitted', label: 'Submitted', icon: Clock },
    { status: 'Acknowledged', label: 'Acknowledged', icon: Check },
    { status: 'Assigned', label: 'Assigned', icon: UserCheck },
    { status: 'In Progress', label: 'In Progress', icon: Wrench },
    { status: 'Resolved', label: 'Resolved', icon: CheckCircle2 }
  ];

  const statusOrder: IssueStatus[] = ['Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="py-3">
      <div className="relative">
        
        {/* Step Items */}
        <div className="grid grid-cols-5 gap-2 relative z-10">
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isUpcoming = index > currentIndex;
            
            // Find recorded timestamp from timeline
            const recorded = timeline.find(t => t.status === step.status);

            let circleClass = 'bg-slate-100 text-slate-400 border-slate-200';
            if (isCompleted) {
              circleClass = 'bg-emerald-500 text-white border-emerald-500 shadow-sm';
            } else if (isCurrent) {
              if (step.status === 'Resolved') {
                circleClass = 'bg-emerald-600 text-white border-emerald-600 ring-4 ring-emerald-100 animate-pulse';
              } else {
                circleClass = 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100 animate-pulse';
              }
            }

            return (
              <div key={step.status} className="flex flex-col items-center text-center">
                <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center mb-2 transition-all ${circleClass}`}>
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>

                <span className={`text-xs font-bold leading-tight ${
                  isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {step.label}
                </span>

                {isCurrent && (
                  <span className="mt-0.5 inline-block w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                )}

                {recorded?.timestamp && (
                  <span className="text-[10px] text-slate-500 font-medium mt-1 leading-tight block">
                    {recorded.timestamp.split(' ')[0]} {recorded.timestamp.split(' ')[1]?.replace(',', '')}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Connecting Progress Line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(currentIndex / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Assigned Staff Callout if in progress/assigned */}
      {assignedStaff && (
        <div className="mt-4 p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
          <span className="font-semibold flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-amber-600" />
            Assigned Specialist:
          </span>
          <span className="font-bold bg-amber-200/60 px-2 py-0.5 rounded-md text-amber-900">
            {assignedStaff}
          </span>
        </div>
      )}
    </div>
  );
};
