import React, { useState, useEffect } from 'react';
import { logService, SystemLog, LogEventType, LogSeverity } from '../../services/logService';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Search, 
  Filter, 
  RotateCcw, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  Mail, 
  Key, 
  Wrench, 
  Clock,
  Sparkles
} from 'lucide-react';

export const AdminLogsView: React.FC = () => {
  const { addToast } = useApp();
  const [logs, setLogs] = useState<SystemLog[]>(() => logService.getLogs());
  const [search, setSearch] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');

  const refreshLogs = () => {
    setLogs(logService.getLogs());
  };

  useEffect(() => {
    refreshLogs();
    const interval = setInterval(refreshLogs, 2500);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = 
        log.title.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q) ||
        (log.targetId && log.targetId.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (selectedEventType !== 'All' && log.eventType !== selectedEventType) {
      return false;
    }

    if (selectedSeverity !== 'All' && log.severity !== selectedSeverity) {
      return false;
    }

    return true;
  });

  const handleExportJSON = () => {
    const data = logService.exportAsJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campusfix-audit-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Export Complete', 'Audit logs exported as JSON');
  };

  const handleExportCSV = () => {
    const data = logService.exportAsCSV();
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campusfix-audit-logs-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Export Complete', 'Audit logs exported as CSV');
  };

  const handleClear = () => {
    logService.clearLogs();
    setLogs([]);
    addToast('info', 'Logs Cleared', 'All audit logs cleared.');
  };

  const getEventIcon = (type: LogEventType) => {
    switch (type) {
      case 'EMAIL_DISPATCHED':
        return <Mail className="w-3.5 h-3.5 text-blue-500" />;
      case '2FA_AUTH_SUCCESS':
      case '2FA_AUTH_FAILED':
        return <Key className="w-3.5 h-3.5 text-purple-500" />;
      case 'ISSUE_CREATED':
        return <FileText className="w-3.5 h-3.5 text-amber-500" />;
      case 'STATUS_UPDATED':
      case 'STAFF_ASSIGNED':
        return <Wrench className="w-3.5 h-3.5 text-emerald-500" />;
      case 'TICKET_DELETED':
        return <Trash2 className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getSeverityBadge = (severity: LogSeverity) => {
    switch (severity) {
      case 'SUCCESS':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">SUCCESS</span>;
      case 'INFO':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">INFO</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">WARNING</span>;
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">CRITICAL</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="glass-card p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-purple-100/80 text-purple-700">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              System Dispatch & Security Audit Logs
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Real-time audit trail of all ticket submissions, email dispatches, 2FA authorizations, and status changes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export JSON</span>
          </button>

          {logs.length > 0 && (
            <button
              onClick={handleClear}
              className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all cursor-pointer"
              title="Clear Logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="glass-card p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event, ticket ID, or actor..."
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-medium text-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Event Types</option>
            <option value="ISSUE_CREATED">Ticket Created</option>
            <option value="EMAIL_DISPATCHED">Email Dispatched</option>
            <option value="2FA_AUTH_SUCCESS">2FA Auth Success</option>
            <option value="STATUS_UPDATED">Status Updated</option>
            <option value="STAFF_ASSIGNED">Staff Assigned</option>
            <option value="TICKET_DELETED">Ticket Deleted</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Severities</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>

          <span className="text-xs font-semibold text-slate-400 ml-1">
            {filteredLogs.length} logs
          </span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 backdrop-blur-md text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-3 py-3.5">Event</th>
                <th className="px-3 py-3.5">Severity</th>
                <th className="px-4 py-3.5">Title & Description</th>
                <th className="px-4 py-3.5">Actor / Origin</th>
                <th className="px-3 py-3.5">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                    <p className="text-sm font-bold text-slate-700">No logs found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Events and email dispatches will automatically stream here.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                      {log.timestamp}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                        {getEventIcon(log.eventType)}
                        <span>{log.eventType.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 leading-tight">{log.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{log.description}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{log.actor}</div>
                      <div className="text-[10px] text-slate-400">{log.actorRole}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {log.targetId ? (
                        <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {log.targetId}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
