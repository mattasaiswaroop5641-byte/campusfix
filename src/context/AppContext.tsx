import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, CampusIssue, IssueStatus, Department, Block, Section, Category, Priority, AIAnalysis } from '../types';
import { storageService } from '../services/storageService';
import { analyzeCampusReport, detectRecurringIssues } from '../services/aiService';
import { emailService } from '../services/emailService';
import { apiService } from '../services/apiService';
import { logService } from '../services/logService';
import { adminService, AdminAccount } from '../services/adminService';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  currentUser: UserProfile | null;
  issues: CampusIssue[];
  activeTab: string;
  selectedIssue: CampusIssue | null;
  isReportModalOpen: boolean;
  isWelcomeModalOpen: boolean;
  isEmailInboxOpen: boolean;
  toasts: ToastMessage[];
  searchQuery: string;
  filterRole: string;
  filterDept: string;
  filterBlock: string;
  filterCategory: string;
  filterPriority: string;
  filterStatus: string;
  
  // Actions
  setCurrentUser: (user: UserProfile | null) => void;
  setActiveTab: (tab: string) => void;
  setSelectedIssue: (issue: CampusIssue | null) => void;
  setIsReportModalOpen: (open: boolean) => void;
  setIsWelcomeModalOpen: (open: boolean) => void;
  setIsEmailInboxOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilterRole: (role: string) => void;
  setFilterDept: (dept: string) => void;
  setFilterBlock: (block: string) => void;
  setFilterCategory: (cat: string) => void;
  setFilterPriority: (priority: string) => void;

  setFilterStatus: (status: string) => void;
  clearFilters: () => void;
  
  // Auth
  login: (user: UserProfile) => void;
  loginStudent: (name: string, department: Department, block: Block, section: Section, regNumber?: string) => void;
  loginFaculty: (name: string, department: Department, block: Block, facultyId?: string) => void;
  loginAdmin: (adminEmail?: string) => void;
  logout: () => void;
  
  // Issue operations
  createIssue: (data: {
    title: string;
    description: string;
    category: Category;
    location: string;
    block: Block;
    imageUrl?: string;
    reporterEmail?: string;
    customAI?: AIAnalysis;
  }) => CampusIssue;
  updateIssueStatus: (issueId: string, status: IssueStatus, note?: string, staffName?: string) => void;
  assignStaff: (issueId: string, staffName: string) => void;
  deleteIssue: (issueId: string) => void;
  resetAllData: () => void;
  purgeAllIssues: () => Promise<void>;
  purgeResolvedOlderThan3Days: () => Promise<void>;
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always require login when opening a tab or starting a session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [issues, setIssues] = useState<CampusIssue[]>(() => storageService.getIssues());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedIssue, setSelectedIssue] = useState<CampusIssue | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(true);
  const [isEmailInboxOpen, setIsEmailInboxOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterDept, setFilterDept] = useState<string>('All');
  const [filterBlock, setFilterBlock] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  useEffect(() => {
    storageService.saveIssues(issues);
  }, [issues]);

  // Real-time live synchronization (polling backend API every 1.5s + cross-tab storage listener)
  useEffect(() => {
    let isMounted = true;
    
    const syncLiveIssues = async () => {
      try {
        const remoteIssues = await apiService.fetchIssues();
        if (isMounted && remoteIssues && Array.isArray(remoteIssues)) {
          setIssues(prev => {
            // Merge remote with any unsaved local issues
            const map = new Map<string, CampusIssue>();
            remoteIssues.forEach(i => map.set(i.id, i));
            prev.forEach(i => {
              if (!map.has(i.id)) {
                map.set(i.id, i);
              }
            });
            const merged = Array.from(map.values());
            if (JSON.stringify(prev) !== JSON.stringify(merged)) {
              return merged;
            }
            return prev;
          });
        }
      } catch (err) {
        // Fallback gracefully
      }
    };

    // Initial sync
    syncLiveIssues();

    // Fast live background polling every 1.5 seconds for instant multi-device / multi-user updates
    const pollInterval = setInterval(syncLiveIssues, 1500);

    // Cross-tab instant update listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'campusfix_issues_live' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setIssues(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    storageService.saveUserProfile(currentUser);
    if (!currentUser) {
      setIsWelcomeModalOpen(true);
    }
  }, [currentUser]);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const login = (user: UserProfile) => {
    setCurrentUser(user);
    setIsWelcomeModalOpen(false);
    setActiveTab('dashboard');
    if (user.email) {
      apiService.sendAuthEmail('login', user);
      addToast('info', 'Security Alert Dispatched', `Login confirmation email sent to ${user.email} (Check Inbox & Spam)`);
    }
  };

  const loginStudent = (name: string, department: Department, block: Block, section: Section, regNumber?: string, email?: string) => {
    const userEmail = email || `${name.toLowerCase().replace(/\s+/g, '.') || 'student'}@gmail.com`;
    const user: UserProfile = {
      id: 'usr_' + Date.now(),
      regNumber: regNumber || '21B91A0501',
      name: name.trim(),
      role: 'student',
      department,
      block,
      section,
      email: userEmail
    };
    setCurrentUser(user);
    setIsWelcomeModalOpen(false);
    setActiveTab('dashboard');
    apiService.sendAuthEmail('login', user);
    addToast('success', 'Welcome Student', `Logged in as ${user.name} (${user.department} - ${user.section})`);
    addToast('info', 'Security Email Sent', `Login alert dispatched to ${user.email}`);
  };

  const loginFaculty = (name: string, department: Department, block: Block, facultyId?: string, email?: string) => {
    // IMPORTANT: Section is strictly omitted for Faculty
    const userEmail = email || `${name.toLowerCase().replace(/\s+/g, '.') || 'faculty'}@gmail.com`;
    const user: UserProfile = {
      id: 'usr_' + Date.now(),
      regNumber: facultyId || 'FAC-1024',
      name: name.trim(),
      role: 'faculty',
      department,
      block,
      email: userEmail
    };
    setCurrentUser(user);
    setIsWelcomeModalOpen(false);
    setActiveTab('dashboard');
    apiService.sendAuthEmail('login', user);
    addToast('success', 'Welcome Faculty', `Logged in as ${user.name} (${user.department})`);
    addToast('info', 'Security Email Sent', `Login alert dispatched to ${user.email}`);
  };

  const loginAdmin = (adminEmail?: string) => {
    const cleanEmail = (adminEmail || 'mattasaiswaroop5641@gmail.com').trim().toLowerCase();
    const allAdmins = adminService.getAdmins();
    const matched = allAdmins.find((a: AdminAccount) => a.email.toLowerCase() === cleanEmail);

    const user: UserProfile = {
      id: matched?.id || 'admin_1',
      regNumber: 'ADMIN-001',
      name: matched?.name || 'Campus Administrator',
      role: 'admin',
      department: (matched?.department || 'Other') as Department,
      block: 'Block A',
      email: cleanEmail
    };
    setCurrentUser(user);
    setIsWelcomeModalOpen(false);
    setActiveTab('dashboard');
    apiService.sendAuthEmail('login', user);
    addToast('info', 'Admin Access Granted', `Welcome ${user.name} to CampusFix Central Command Dashboard`);
  };

  const logout = () => {
    if (currentUser && currentUser.email) {
      apiService.sendAuthEmail('logout', currentUser);
      addToast('info', 'Logout Alert Sent', `Session ended email dispatched to ${currentUser.email}`);
    }
    setCurrentUser(null);
    storageService.saveUserProfile(null);
    try {
      sessionStorage.clear();
      localStorage.removeItem('campusfix_user_live');
    } catch {}
    setIsWelcomeModalOpen(true);
    setActiveTab('dashboard');
  };

  const createIssue = (data: {
    title: string;
    description: string;
    category: Category;
    location: string;
    block: Block;
    imageUrl?: string;
    reporterEmail?: string;
    customAI?: AIAnalysis;
  }): CampusIssue => {
    // Run AI analysis
    const aiAnalysis = data.customAI || analyzeCampusReport({
      title: data.title,
      description: data.description,
      location: data.location,
      block: data.block,
      reporterType: currentUser?.role === 'faculty' ? 'Faculty' : 'Student'
    });

    const highestIdNum = issues.reduce((max, issue) => {
      const match = issue.id.match(/CF-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 1023);

    const newId = `CF-${highestIdNum + 1}`;
    const now = new Date();
    const timeString = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + 
                       now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const reporterType = currentUser?.role === 'faculty' ? 'Faculty' : 'Student';
    const reporterName = currentUser?.name || (currentUser?.role === 'faculty' ? 'Faculty Member' : 'Student');
    
    // IMPORTANT: Section strictly 'N/A' for faculty!
    const sectionValue = currentUser?.role === 'faculty' ? 'N/A' : (currentUser?.section || 'Section A');

    const newIssue: CampusIssue = {
      id: newId,
      title: data.title || (data.description.length > 50 ? data.description.substring(0, 47) + '...' : data.description),
      description: data.description,
      reporter: reporterName,
      reporterId: currentUser?.id,
      reporterRegNo: currentUser?.regNumber,
      reporterEmail: data.reporterEmail || currentUser?.email,
      reporterType,
      department: currentUser?.department || 'CSE',
      block: data.block || currentUser?.block || 'Block A',
      section: sectionValue,
      category: data.category || aiAnalysis.category,
      location: data.location || 'General Area',
      priority: aiAnalysis.priority,
      status: 'Submitted',
      createdAt: timeString,
      updatedAt: timeString,
      aiAnalysis,
      imageUrl: data.imageUrl,
      timeline: [
        {
          status: 'Submitted',
          timestamp: timeString,
          by: `${reporterName} (${reporterType})`
        }
      ]
    };

    setIssues(prev => [newIssue, ...prev]);

    // Async sync to MongoDB Atlas
    apiService.createIssue(newIssue).catch(() => {});

    // Dispatch automated email alert to Admin
    try {
      emailService.sendAdminIssueAlert(newIssue);
    } catch (e) {}

    // Add Audit Log Entry
    try {
      logService.addLog({
        eventType: 'ISSUE_CREATED',
        title: `Ticket Logged: ${newId}`,
        description: `${newIssue.title} in ${newIssue.location} (${newIssue.block})`,
        actor: reporterName,
        actorRole: reporterType,
        targetId: newId,
        severity: newIssue.priority === 'High' ? 'CRITICAL' : 'INFO'
      });
    } catch (e) {}

    addToast('success', 'Report Submitted & Dispatched', `Ticket ${newId} logged to MongoDB. Email alert sent to ${emailService.getInbox()[0]?.to || 'Admins'}`);
    return newIssue;
  };

  const updateIssueStatus = (issueId: string, status: IssueStatus, note?: string, staffName?: string) => {
    const now = new Date();
    const timeString = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + 
                       now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        const updatedTimeline = [
          ...issue.timeline,
          {
            status,
            timestamp: timeString,
            note: note || (status === 'Resolved' ? 'Issue marked resolved after maintenance inspection.' : undefined),
            by: staffName || (currentUser?.role === 'admin' ? 'Campus Admin' : currentUser?.name || 'Staff')
          }
        ];

        const updated = {
          ...issue,
          status,
          updatedAt: timeString,
          assignedStaff: staffName || issue.assignedStaff,
          timeline: updatedTimeline
        };

        if (selectedIssue && selectedIssue.id === issueId) {
          setSelectedIssue(updated);
        }

        // Sync updates to MongoDB Atlas
        apiService.updateIssue(issueId, { 
          status, 
          assignedStaff: updated.assignedStaff, 
          timeline: updatedTimeline 
        }).catch(() => {});

        return updated;
      }
      return issue;
    }));

    // Add Audit Log
    try {
      logService.addLog({
        eventType: status === 'Assigned' ? 'STAFF_ASSIGNED' : 'STATUS_UPDATED',
        title: `Status Changed: ${issueId} -> ${status}`,
        description: note || `Ticket status updated to ${status}${staffName ? ' (Assigned: ' + staffName + ')' : ''}`,
        actor: currentUser?.name || 'Campus Admin',
        actorRole: 'Admin',
        targetId: issueId,
        severity: status === 'Resolved' ? 'SUCCESS' : 'INFO'
      });
    } catch {}

    addToast('info', 'Status Updated', `${issueId} is now ${status}`);
  };

  const assignStaff = (issueId: string, staffName: string) => {
    updateIssueStatus(issueId, 'Assigned', `Assigned to ${staffName}`, staffName);
  };

  const deleteIssue = (issueId: string) => {
    setIssues(prev => prev.filter(i => i.id !== issueId));
    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue(null);
    }

    // Clean up corresponding email notification
    try {
      emailService.removeEmailByIssueId(issueId);
    } catch {}

    // Delete in MongoDB Atlas
    apiService.deleteIssue(issueId).catch(() => {});

    // Add Audit Log
    try {
      logService.addLog({
        eventType: 'TICKET_DELETED',
        title: `Ticket Deleted: ${issueId}`,
        description: `Ticket ${issueId} removed from registry by administrator.`,
        actor: currentUser?.name || 'Campus Admin',
        actorRole: 'Admin',
        targetId: issueId,
        severity: 'WARNING'
      });
    } catch {}

    addToast('warning', 'Ticket Deleted', `Issue ${issueId} was removed from registry.`);
  };

  const resetAllData = () => {
    const fresh = storageService.clearIssues();
    setIssues(fresh);
    try {
      emailService.clearInbox();
    } catch {}
    addToast('info', 'Database Cleared', 'All issues have been cleared for a fresh session.');
  };

  const purgeAllIssues = async () => {
    storageService.clearIssues();
    setIssues([]);
    setSelectedIssue(null);
    try {
      emailService.clearInbox();
    } catch {}
    try {
      await apiService.purgeAllIssues();
    } catch {}
    try {
      logService.addLog({
        eventType: 'TICKET_DELETED',
        title: 'Database Reset (Purged)',
        description: 'Complete issues database was permanently cleared by administrator.',
        actor: currentUser?.name || 'Super Admin',
        actorRole: 'Admin',
        severity: 'CRITICAL'
      });
    } catch {}
    addToast('error', 'Database Reset', 'All issues permanently cleared from MongoDB Atlas and local storage.');
  };

  const purgeResolvedOlderThan3Days = async () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const beforeCount = issues.length;
    const remaining = issues.filter(issue => {
      if (issue.status !== 'Resolved') return true;
      const dateToCheck = issue.updatedAt ? new Date(issue.updatedAt) : new Date(issue.createdAt);
      return dateToCheck >= threeDaysAgo;
    });

    setIssues(remaining);
    storageService.saveIssues(remaining);
    try {
      emailService.syncWithIssues(remaining);
    } catch {}
    const deletedCount = beforeCount - remaining.length;

    let remoteCount = 0;
    try {
      const res = await apiService.purgeResolvedOlderThan3Days();
      remoteCount = res.deletedCount || 0;
    } catch {}

    const totalCleaned = Math.max(deletedCount, remoteCount);
    if (totalCleaned > 0) {
      addToast('info', '3-Day Retention Policy Executed', `Cleaned ${totalCleaned} resolved ticket(s) older than 3 days.`);
    } else {
      addToast('info', 'Database Storage Optimized', 'No resolved tickets older than 3 days found to purge.');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterRole('All');
    setFilterDept('All');
    setFilterBlock('All');
    setFilterCategory('All');
    setFilterPriority('All');
    setFilterStatus('All');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        issues,
        activeTab,
        selectedIssue,
        isReportModalOpen,
        isWelcomeModalOpen,
        isEmailInboxOpen,
        toasts,
        searchQuery,
        filterRole,
        filterDept,
        filterBlock,
        filterCategory,
        filterPriority,
        filterStatus,
        setCurrentUser,
        setActiveTab,
        setSelectedIssue,
        setIsReportModalOpen,
        setIsWelcomeModalOpen,
        setIsEmailInboxOpen,
        setSearchQuery,
        setFilterRole,
        setFilterDept,
        setFilterBlock,
        setFilterCategory,
        setFilterPriority,
        setFilterStatus,
        clearFilters,
        login,
        loginStudent,
        loginFaculty,
        loginAdmin,
        logout,
        createIssue,
        updateIssueStatus,
        assignStaff,
        deleteIssue,
        resetAllData,
        purgeAllIssues,
        purgeResolvedOlderThan3Days,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
