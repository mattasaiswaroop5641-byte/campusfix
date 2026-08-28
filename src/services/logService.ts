export type LogEventType = 
  | 'ISSUE_CREATED' 
  | 'EMAIL_DISPATCHED' 
  | '2FA_AUTH_SUCCESS' 
  | '2FA_AUTH_FAILED' 
  | 'STATUS_UPDATED' 
  | 'STAFF_ASSIGNED' 
  | 'TICKET_DELETED' 
  | 'DB_SYNC'
  | 'USER_LOGIN'
  | 'USER_LOGOUT';

export type LogSeverity = 'SUCCESS' | 'INFO' | 'WARNING' | 'CRITICAL';

export interface SystemLog {
  id: string;
  timestamp: string;
  eventType: LogEventType;
  title: string;
  description: string;
  actor: string;
  actorRole: 'Student' | 'Faculty' | 'Admin' | 'System Bot';
  targetId?: string;
  severity: LogSeverity;
  metadata?: Record<string, any>;
}

const LOGS_STORAGE_KEY = 'campusfix_system_audit_logs';

export const logService = {
  getLogs(): SystemLog[] {
    try {
      const data = localStorage.getItem(LOGS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLogs(logs: SystemLog[]): void {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 300))); // Keep last 300 logs
    } catch {}
  },

  addLog(entry: Omit<SystemLog, 'id' | 'timestamp'>): SystemLog {
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
                      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newLog: SystemLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp,
      ...entry
    };

    const currentLogs = this.getLogs();
    const updated = [newLog, ...currentLogs];
    this.saveLogs(updated);
    return newLog;
  },

  clearLogs(): void {
    localStorage.removeItem(LOGS_STORAGE_KEY);
  },

  exportAsJSON(): string {
    return JSON.stringify(this.getLogs(), null, 2);
  },

  exportAsCSV(): string {
    const logs = this.getLogs();
    if (logs.length === 0) return '';
    
    const headers = ['Timestamp', 'Event Type', 'Severity', 'Actor', 'Role', 'Title', 'Description', 'Target ID'];
    const rows = logs.map(l => [
      `"${l.timestamp}"`,
      `"${l.eventType}"`,
      `"${l.severity}"`,
      `"${l.actor}"`,
      `"${l.actorRole}"`,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      `"${l.targetId || ''}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
};
