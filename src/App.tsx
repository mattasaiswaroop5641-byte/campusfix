import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { ToastContainer } from './components/common/Toast';
import { WelcomeModal } from './components/onboarding/WelcomeModal';
import { ReportModal } from './components/report/ReportModal';
import { IssueDetailModal } from './components/dashboard/IssueDetailModal';
import { AdminIssueModal } from './components/admin/AdminIssueModal';
import { AdminEmailInboxModal } from './components/admin/AdminEmailInboxModal';
import { StatCard } from './components/dashboard/StatCard';
import { IssueCard } from './components/dashboard/IssueCard';
import { AdminTable } from './components/admin/AdminTable';
import { AdminLogsView } from './components/admin/AdminLogsView';
import { Admin2FASetupView } from './components/admin/Admin2FASetupView';
import { AdminManagementView } from './components/admin/AdminManagementView';
import { InsightsView } from './components/insights/InsightsView';
import { CampusMapView } from './components/map/CampusMapView';
import { detectRecurringIssues } from './services/aiService';
import { emailService } from './services/emailService';
import { 
  PlusCircle, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  Search, 
  Sparkles, 
  ArrowRight,
  Filter,
  User,
  RotateCcw,
  Mail,
  Database,
  FileText,
  BarChart3
} from 'lucide-react';

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (hour >= 12 && hour < 17) {
    timeGreeting = 'Good afternoon';
  } else if (hour >= 17) {
    timeGreeting = 'Good evening';
  }
  return `${timeGreeting}, ${name || 'User'} 👋`;
}

export function AppContent() {
  const { 
    currentUser, 
    issues, 
    activeTab, 
    setActiveTab, 
    setSelectedIssue, 
    setIsReportModalOpen, 
    setIsWelcomeModalOpen,
    isEmailInboxOpen,
    setIsEmailInboxOpen,
    resetAllData,
    logout
  } = useApp();

  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Resolved'>('All');
  const [reportsScope, setReportsScope] = useState<'my' | 'all'>('my');

  // Role-filtered user reports (for Student & Faculty "My Reports")
  const role = currentUser?.role || 'student';
  const isFaculty = role === 'faculty';
  const isAdmin = role === 'admin';

  // Strict user isolation matching: Email, Reg Number, ID, or verified reporter name
  const userSubmissions = issues.filter(i => {
    if (!currentUser) return false;
    if (i.reporterEmail && currentUser.email && i.reporterEmail.trim().toLowerCase() === currentUser.email.trim().toLowerCase()) {
      return true;
    }
    if (i.reporterRegNo && currentUser.regNumber && i.reporterRegNo.trim().toUpperCase() === currentUser.regNumber.trim().toUpperCase()) {
      return true;
    }
    if (i.reporterId && currentUser.id && i.reporterId === currentUser.id) {
      return true;
    }
    if (i.reporter && currentUser.name && i.reporter.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) {
      return true;
    }
    return false;
  });

  const myReports = isAdmin ? issues : (reportsScope === 'my' ? userSubmissions : issues);

  // User-specific dashboard stats (Students & Faculty see stats for their own logged reports)
  const statsPool = isAdmin ? issues : userSubmissions;
  const totalReports = statsPool.length;
  const pendingReports = statsPool.filter(i => i.status === 'Submitted' || i.status === 'Acknowledged' || i.status === 'Assigned').length;
  const inProgressReports = statsPool.filter(i => i.status === 'In Progress').length;
  const resolvedReports = statsPool.filter(i => i.status === 'Resolved').length;

  // Filtered reports for the dashboard list
  const displayReports = myReports.filter(issue => {
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const match = issue.title.toLowerCase().includes(q) || 
                    issue.description.toLowerCase().includes(q) || 
                    issue.id.toLowerCase().includes(q) ||
                    issue.location.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (statusFilter === 'Pending') {
      return issue.status === 'Submitted' || issue.status === 'Acknowledged' || issue.status === 'Assigned';
    }
    if (statusFilter === 'In Progress') {
      return issue.status === 'In Progress';
    }
    if (statusFilter === 'Resolved') {
      return issue.status === 'Resolved';
    }
    return true;
  });

  const unreadEmailCount = emailService.getInbox().filter(e => !e.read).length;
  const recurringClusters = detectRecurringIssues(issues);

  return (
    <div className="min-h-screen relative flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Glassmorphic Ambient Mesh Orbs */}
      <div className="ambient-bg">
        <div className="ambient-orb-1" />
        <div className="ambient-orb-2" />
        <div className="ambient-orb-3" />
      </div>

      {/* Top Navigation */}
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-10 overflow-y-auto max-w-full">
          
          {/* 1. ADMIN DASHBOARD VIEW */}
          {isAdmin ? (
            <div className="space-y-6">
              
              {/* Admin Hero Bar */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-white/10 relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-300 uppercase tracking-widest border border-indigo-400/20">
                        Administrative Console
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        MongoDB Ready
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      CAMPUSFIX ADMIN
                    </h1>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                      Central command dispatch: prioritize complaints, assign maintenance personnel, and resolve infrastructure issues across all campus blocks.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Direct Email Dispatch Inbox Button */}
                    <button
                      onClick={() => setIsEmailInboxOpen(true)}
                      className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer border border-blue-400/30"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email Alerts</span>
                      {unreadEmailCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
                          {unreadEmailCount}
                        </span>
                      )}
                    </button>

                    {/* Audit & Email Logs Button */}
                    <button
                      onClick={() => setActiveTab('audit-logs')}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        activeTab === 'audit-logs'
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border-purple-400/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-purple-300" />
                      <span>Audit Logs</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('campus-status')}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        activeTab === 'campus-status'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border-blue-400/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 text-blue-300" />
                      <span>Charts & Analytics</span>
                    </button>

                    <button
                      onClick={() => setIsWelcomeModalOpen(true)}
                      className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Switch Role</span>
                    </button>

                    <button
                      onClick={logout}
                      className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-rose-400/20"
                    >
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Reports"
                  count={totalReports}
                  icon={Layers}
                  colorScheme="blue"
                  subtitle="All campus complaints"
                />
                <StatCard
                  label="Pending"
                  count={pendingReports}
                  icon={Clock}
                  colorScheme="amber"
                  subtitle="Awaiting technician"
                />
                <StatCard
                  label="In Progress"
                  count={inProgressReports}
                  icon={Wrench}
                  colorScheme="indigo"
                  subtitle="Repairs underway"
                />
                <StatCard
                  label="Resolved"
                  count={resolvedReports}
                  icon={CheckCircle2}
                  colorScheme="emerald"
                  subtitle="Closed tickets"
                />
              </div>

              {/* View Switcher based on activeTab */}
              {activeTab === '2fa-setup' ? (
                <Admin2FASetupView />
              ) : activeTab === 'admin-management' ? (
                <AdminManagementView />
              ) : activeTab === 'audit-logs' ? (
                <AdminLogsView />
              ) : activeTab === 'campus-status' ? (
                <InsightsView />
              ) : activeTab === 'map' ? (
                <CampusMapView />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Campus Issues Registry</h2>
                      <p className="text-xs text-slate-500">
                        Filter, assign technicians, and update resolution lifecycle. (Faculty tickets display Section: N/A)
                      </p>
                    </div>
                  </div>
                  <AdminTable />
                </div>
              )}
            </div>
          ) : (
            /* 2. STUDENT & FACULTY DASHBOARD VIEW */
            <div className="space-y-6">
              
              {/* Dynamic View switching */}
              {activeTab === 'campus-status' ? (
                <InsightsView />
              ) : activeTab === 'map' ? (
                <CampusMapView />
              ) : activeTab === 'profile' ? (
                /* Profile View */
                <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${
                      isFaculty ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isFaculty ? <Briefcase className="w-8 h-8" /> : <GraduationCap className="w-8 h-8" />}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{currentUser?.name}</h2>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{currentUser?.role}</p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-3 flex justify-between">
                      <span className="font-semibold text-slate-500">
                        {isFaculty ? 'Faculty / Employee ID' : 'Roll / Registration Number'}
                      </span>
                      <span className="font-mono font-bold text-slate-900 uppercase">
                        {currentUser?.regNumber || 'Not assigned'}
                      </span>
                    </div>
                    <div className="py-3 flex justify-between">
                      <span className="font-semibold text-slate-500">Department</span>
                      <span className="font-bold text-slate-900">{currentUser?.department}</span>
                    </div>
                    <div className="py-3 flex justify-between">
                      <span className="font-semibold text-slate-500">Block / Office</span>
                      <span className="font-bold text-slate-900">{currentUser?.block}</span>
                    </div>
                    {!isFaculty && (
                      <div className="py-3 flex justify-between">
                        <span className="font-semibold text-slate-500">Section</span>
                        <span className="font-bold text-blue-600">{currentUser?.section}</span>
                      </div>
                    )}
                    <div className="py-3 flex justify-between">
                      <span className="font-semibold text-slate-500">Registered Email</span>
                      <span className="font-mono text-slate-700">{currentUser?.email}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => setIsWelcomeModalOpen(true)}
                      className="w-full py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                    >
                      Switch Role
                    </button>
                    <button
                      onClick={logout}
                      className="w-full py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              ) : (
                /* Main Student / Faculty Dashboard */
                <>
                  {/* Greeting Hero Card */}
                  <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-600/15 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      
                      <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-blue-100 uppercase tracking-wider">
                          {isFaculty ? <Briefcase className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                          <span>{isFaculty ? 'Faculty Portal' : 'Student Portal'}</span>
                        </span>

                        {/* Good Morning [Name] Greeting */}
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                          {getGreeting(currentUser?.name || (isFaculty ? 'Faculty Member' : 'Student'))}
                        </h1>

                        {/* Profile Info - Faculty strictly omits Section */}
                        <p className="text-xs sm:text-sm text-blue-100 font-medium">
                          {isFaculty ? (
                            <>Department: <strong className="text-white">{currentUser?.department}</strong> • Block: <strong className="text-white">{currentUser?.block}</strong></>
                          ) : (
                            <>Department: <strong className="text-white">{currentUser?.department}</strong> • Block: <strong className="text-white">{currentUser?.block}</strong> • Section: <strong className="text-white bg-white/20 px-2 py-0.5 rounded">{currentUser?.section}</strong></>
                          )}
                        </p>
                      </div>

                      {/* Main CTA */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsReportModalOpen(true)}
                          className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-blue-50 text-blue-700 font-extrabold text-sm rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
                        >
                          <PlusCircle className="w-5 h-5 text-blue-600 stroke-[2.5]" />
                          <span>+ Report a Problem</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recurring issue alert if present in user block */}
                  {recurringClusters.length > 0 && (
                    <div 
                      onClick={() => setActiveTab('campus-status')}
                      className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500 text-white">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-amber-900 block">
                            📍 Recurring Facility Alert: {recurringClusters[0].location}
                          </span>
                          <span className="text-[11px] text-amber-700">
                            Multiple {recurringClusters[0].category} complaints detected in {recurringClusters[0].block}. Click for maintenance overview.
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                        <span>View Insight</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}

                  {/* Statistics Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      label="Total Reports"
                      count={myReports.length}
                      icon={Layers}
                      colorScheme="blue"
                      subtitle="Your logged tickets"
                      onClick={() => setStatusFilter('All')}
                      isActive={statusFilter === 'All'}
                    />
                    <StatCard
                      label="Pending"
                      count={myReports.filter(i => i.status === 'Submitted' || i.status === 'Acknowledged' || i.status === 'Assigned').length}
                      icon={Clock}
                      colorScheme="amber"
                      subtitle="Awaiting repair"
                      onClick={() => setStatusFilter('Pending')}
                      isActive={statusFilter === 'Pending'}
                    />
                    <StatCard
                      label="In Progress"
                      count={myReports.filter(i => i.status === 'In Progress').length}
                      icon={Wrench}
                      colorScheme="indigo"
                      subtitle="Technician dispatched"
                      onClick={() => setStatusFilter('In Progress')}
                      isActive={statusFilter === 'In Progress'}
                    />
                    <StatCard
                      label="Resolved"
                      count={myReports.filter(i => i.status === 'Resolved').length}
                      icon={CheckCircle2}
                      colorScheme="emerald"
                      subtitle="Successfully fixed"
                      onClick={() => setStatusFilter('Resolved')}
                      isActive={statusFilter === 'Resolved'}
                    />
                  </div>

                  {/* "My Reports" Section */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-lg font-bold text-slate-900">
                            {reportsScope === 'my' ? 'My Submitted Reports' : 'All Campus Reports'}
                          </h2>
                        </div>
                        <p className="text-xs text-slate-500">
                          {reportsScope === 'my' 
                            ? 'Track real-time progress for issues submitted by your profile.' 
                            : 'Browse live infrastructure reports submitted across all campus departments.'}
                        </p>
                      </div>

                      {/* Scope tabs & Search */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Scope Tab (My vs All) */}
                        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold text-slate-600">
                          <button
                            onClick={() => setReportsScope('my')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                              reportsScope === 'my' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'hover:text-slate-900'
                            }`}
                          >
                            My Reports ({userSubmissions.length})
                          </button>
                          <button
                            onClick={() => setReportsScope('all')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                              reportsScope === 'all' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'hover:text-slate-900'
                            }`}
                          >
                            Campus Feed ({issues.length})
                          </button>
                        </div>

                        {/* Search input */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            placeholder="Search reports..."
                            className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 w-36 sm:w-44"
                          />
                        </div>

                        {/* Status Filter Tabs */}
                        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold text-slate-600">
                          {(['All', 'Pending', 'In Progress', 'Resolved'] as const).map(tab => (
                            <button
                              key={tab}
                              onClick={() => setStatusFilter(tab)}
                              className={`px-2.5 py-1 rounded-lg transition-all ${
                                statusFilter === tab ? 'bg-white text-blue-600 shadow-xs font-bold' : 'hover:text-slate-900'
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Reports Grid */}
                    {displayReports.length === 0 ? (
                      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
                        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">No reports found</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {searchFilter ? 'Try changing your search term.' : 'You have not reported any campus problems yet.'}
                          </p>
                        </div>
                        <button
                          onClick={() => setIsReportModalOpen(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>+ Report a Problem Now</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayReports.map(issue => (
                          <IssueCard
                            key={issue.id}
                            issue={issue}
                            onClick={() => setSelectedIssue(issue)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Mobile Navigation Tab Bar */}
      <MobileNav />

      {/* Floating Toast Notification Layer */}
      <ToastContainer />

      {/* Modals & Dialogs */}
      <WelcomeModal />
      <ReportModal />
      <AdminEmailInboxModal isOpen={isEmailInboxOpen} onClose={() => setIsEmailInboxOpen(false)} />
      {isAdmin ? <AdminIssueModal /> : <IssueDetailModal />}
    </div>
  );
}

export default function App() {
  return (
    <AppContent />
  );
}
