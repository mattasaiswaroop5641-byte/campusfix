import React from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, PlusCircle, ListFilter, BarChart3, MapPin } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { currentUser, activeTab, setActiveTab, setIsReportModalOpen } = useApp();

  const role = currentUser?.role || 'student';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
          activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Home</span>
      </button>

      {role !== 'admin' && (
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-blue-600"
        >
          <div className="w-10 h-10 -mt-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/40">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span>Report</span>
        </button>
      )}

      <button
        onClick={() => setActiveTab(role === 'admin' ? 'all-issues' : 'my-reports')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
          activeTab === (role === 'admin' ? 'all-issues' : 'my-reports') ? 'text-blue-600 font-bold' : 'text-slate-500'
        }`}
      >
        <ListFilter className="w-5 h-5" />
        <span>{role === 'admin' ? 'Issues' : 'Reports'}</span>
      </button>

      <button
        onClick={() => setActiveTab('campus-status')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
          activeTab === 'campus-status' ? 'text-blue-600 font-bold' : 'text-slate-500'
        }`}
      >
        <BarChart3 className="w-5 h-5" />
        <span>Insights</span>
      </button>

      <button
        onClick={() => setActiveTab('map')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
          activeTab === 'map' ? 'text-blue-600 font-bold' : 'text-slate-500'
        }`}
      >
        <MapPin className="w-5 h-5" />
        <span>Map</span>
      </button>
    </div>
  );
};
