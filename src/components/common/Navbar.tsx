import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wrench, 
  PlusCircle, 
  User, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  LogOut, 
  Sparkles,
  Mail,
  Database
} from 'lucide-react';
import { emailService } from '../../services/emailService';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    setIsReportModalOpen, 
    setIsWelcomeModalOpen, 
    setIsEmailInboxOpen,
    logout 
  } = useApp();

  const unreadEmails = emailService.getInbox().filter(e => !e.read).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/75 backdrop-blur-xl border-b border-white/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsWelcomeModalOpen(true)}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 border border-white/40">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-800 bg-clip-text text-transparent">
                  CAMPUSFIX
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-50/80 text-blue-700 border border-blue-200/80 backdrop-blur-xs">
                  <span>Smart Campus Portal</span>
                </span>
                <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-50/80 text-emerald-700 border border-emerald-200/80">
                  <Database className="w-3 h-3 text-emerald-500" />
                  MongoDB Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide">
                Report. Track. Resolve.
              </p>
            </div>
          </div>

          {/* User Profile Badge & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {currentUser && (
              <div className="hidden md:flex items-center gap-2.5 bg-white/80 backdrop-blur-md border border-white/80 px-3 py-1.5 rounded-2xl shadow-xs">
                <div className="w-7 h-7 rounded-xl bg-blue-100/90 text-blue-700 flex items-center justify-center font-bold text-xs">
                  {currentUser.role === 'student' && <GraduationCap className="w-4 h-4" />}
                  {currentUser.role === 'faculty' && <Briefcase className="w-4 h-4" />}
                  {currentUser.role === 'admin' && <ShieldCheck className="w-4 h-4" />}
                </div>
                <div className="text-left leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">{currentUser.name}</span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {currentUser.role === 'student' && (
                      <>{currentUser.department} • {currentUser.block} • <strong className="text-blue-600">{currentUser.section}</strong></>
                    )}
                    {currentUser.role === 'faculty' && (
                      <>{currentUser.department} • {currentUser.block}</> // Strictly NO Section!
                    )}
                    {currentUser.role === 'admin' && (
                      <>Campus Admin Console</>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Email Dispatch Hub Button (Visible ONLY to Admin) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setIsEmailInboxOpen(true)}
                title="Admin Email Alerts (admin@campusfix.edu)"
                className="relative p-2 text-slate-600 hover:text-blue-600 bg-white/80 hover:bg-blue-50/80 border border-slate-200/80 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="hidden xl:inline text-slate-700">Admin Emails</span>
                {unreadEmails > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadEmails}
                  </span>
                )}
              </button>
            )}

            {/* Switch Role Button */}
            <button
              onClick={() => setIsWelcomeModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white/80 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Switch Role</span>
            </button>

            {/* Explicit Logout Button */}
            {currentUser && (
              <button
                onClick={logout}
                title="Log out from current session"
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50/80 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            {/* Report a Problem CTA (for Student & Faculty) */}
            {currentUser?.role !== 'admin' && (
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 transform active:scale-95 cursor-pointer border border-white/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Report a Problem</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

