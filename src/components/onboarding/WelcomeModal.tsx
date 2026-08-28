import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentOnboard } from './StudentOnboard';
import { FacultyOnboard } from './FacultyOnboard';
import { AdminLogin } from './AdminLogin';
import { Wrench, GraduationCap, Briefcase, ShieldCheck, Sparkles, ArrowRight, X } from 'lucide-react';

export const WelcomeModal: React.FC = () => {
  const { isWelcomeModalOpen, setIsWelcomeModalOpen, currentUser } = useApp();
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'admin' | null>(null);

  if (!isWelcomeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden">
        
        {/* Close button if user is already logged in and just browsing roles */}
        {currentUser && (
          <button
            onClick={() => {
              setIsWelcomeModalOpen(false);
              setSelectedRole(null);
            }}
            className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Modal Top Header Gradient */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 px-6 pt-8 pb-7 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl"></div>
          
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white mb-3 shadow-lg shadow-blue-500/30">
            <Wrench className="w-7 h-7" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            CAMPUSFIX
          </h1>
          <p className="text-sm font-semibold text-blue-300 uppercase tracking-widest mb-2">
            "Report. Track. Resolve."
          </p>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Help make your campus better, one report at a time.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {!selectedRole ? (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">
                Select Your Role to Continue
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Student Card */}
                <button
                  onClick={() => setSelectedRole('student')}
                  className="group flex flex-col items-start p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/40 text-left transition-all hover:shadow-md cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors mb-3">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    Student
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    Report classroom, Wi-Fi, lab equipment, or campus maintenance issues.
                  </p>
                  <div className="mt-auto flex items-center text-xs font-semibold text-blue-600 gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Continue as Student</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Faculty Card */}
                <button
                  onClick={() => setSelectedRole('faculty')}
                  className="group flex flex-col items-start p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/40 text-left transition-all hover:shadow-md cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors mb-3">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    Faculty
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    Submit department, lab, faculty room, or projector maintenance requests.
                  </p>
                  <div className="mt-auto flex items-center text-xs font-semibold text-indigo-600 gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Continue as Faculty</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>

              {/* Admin Login Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedRole('admin')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 transition-all text-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-900 block">Administrator Portal</span>
                      <span className="text-[11px] text-slate-500">Access triage dispatch & recurring issues AI</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    Admin Login
                  </span>
                </button>
              </div>
            </div>
          ) : selectedRole === 'student' ? (
            <StudentOnboard onBack={() => setSelectedRole(null)} />
          ) : selectedRole === 'faculty' ? (
            <FacultyOnboard onBack={() => setSelectedRole(null)} />
          ) : (
            <AdminLogin onBack={() => setSelectedRole(null)} />
          )}
        </div>
      </div>
    </div>
  );
};
