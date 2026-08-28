import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListFilter, 
  BarChart3, 
  MapPin, 
  ShieldAlert, 
  User, 
  Sparkles, 
  Layers, 
  LogOut,
  FileText,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { detectRecurringIssues } from '../../services/aiService';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  badge?: string;
  action?: () => void;
}

export const Sidebar: React.FC = () => {
  const { currentUser, activeTab, setActiveTab, setIsReportModalOpen, issues, logout } = useApp();

  const role = currentUser?.role || 'student';
  const myReportsCount = issues.filter(i => 
    i.reporter.toLowerCase() === (currentUser?.name || '').toLowerCase() ||
    i.reporterType.toLowerCase() === role
  ).length;

  const recurringClusters = detectRecurringIssues(issues);
  const activeIssuesCount = issues.filter(i => i.status !== 'Resolved').length;

  const studentFacultyNav: NavItem[] = [
    { id: 'dashboard', label: 'Home Dashboard', icon: LayoutDashboard },
    { id: 'report', label: 'Report a Problem', icon: PlusCircle, action: () => setIsReportModalOpen(true) },
    { id: 'my-reports', label: 'My Reports', icon: ListFilter, count: myReportsCount },
    { id: 'campus-status', label: 'Analytics & Charts', icon: BarChart3 },
    { id: 'map', label: 'Campus Problem Map', icon: MapPin },
    { id: 'profile', label: 'User Profile', icon: User }
  ];

  const adminNav: NavItem[] = [
    { id: 'dashboard', label: 'Admin Console', icon: LayoutDashboard },
    { id: 'all-issues', label: 'All Issues', icon: Layers, count: issues.length },
    { id: 'priority-issues', label: 'Priority Triage', icon: ShieldAlert, count: activeIssuesCount },
    { id: 'campus-status', label: 'Analytics & Charts', icon: BarChart3 },
    { id: 'map', label: 'Problem Map', icon: MapPin },
    { id: 'audit-logs', label: 'Audit & Email Logs', icon: FileText },
    { id: 'admin-management', label: 'Admin Management', icon: UserPlus, badge: 'Add Admin' },
    { id: '2fa-setup', label: '2FA Device Enrollment', icon: ShieldCheck }
  ];

  const items: NavItem[] = role === 'admin' ? adminNav : studentFacultyNav;


  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {role === 'admin' ? 'Administration' : `${role} Navigation`}
        </div>

        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-700 animate-pulse">
                  {item.badge}
                </span>
              )}

              {item.count !== undefined && !item.badge && (
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  isActive ? 'bg-blue-200/60 text-blue-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer with Logout */}
      <div className="mt-auto pt-4 space-y-3">
        <button
          onClick={logout}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200/80 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Log Out</span>
          </div>
          <span className="text-[10px] text-rose-400">Exit</span>
        </button>
      </div>
    </aside>
  );
};
