import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminEmailNotification, emailService, PRIMARY_ADMIN_EMAIL, SECONDARY_ADMIN_EMAIL, ADMIN_EMAILS } from '../../services/emailService';
import { 
  Mail, 
  X, 
  Check, 
  Trash2, 
  ExternalLink, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  Inbox, 
  CheckCheck,
  Send
} from 'lucide-react';

interface AdminEmailInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminEmailInboxModal: React.FC<AdminEmailInboxModalProps> = ({ isOpen, onClose }) => {
  const { issues, setSelectedIssue, addToast } = useApp();
  const [emails, setEmails] = useState<AdminEmailNotification[]>(() => emailService.getInbox());
  const [selectedEmail, setSelectedEmail] = useState<AdminEmailNotification | null>(null);

  if (!isOpen) return null;

  const refreshEmails = () => {
    setEmails(emailService.getInbox());
  };

  const handleSelectEmail = (email: AdminEmailNotification) => {
    emailService.markAsRead(email.id);
    setSelectedEmail({ ...email, read: true });
    refreshEmails();
  };

  const handleMarkAllRead = () => {
    emailService.markAllAsRead();
    refreshEmails();
    addToast('info', 'Inbox Updated', 'All admin email notifications marked as read.');
  };

  const handleClearAll = () => {
    emailService.clearInbox();
    setEmails([]);
    setSelectedEmail(null);
    addToast('info', 'Inbox Cleared', 'Email notification logs cleared.');
  };

  const handleJumpToIssue = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      setSelectedIssue(issue);
      onClose();
    } else {
      addToast('warning', 'Issue Not Found', `Ticket ${issueId} may have been resolved or deleted.`);
    }
  };

  const unreadCount = emails.filter(e => !e.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 text-blue-300 border border-blue-400/30 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-white">Admin Email Dispatch Hub</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {PRIMARY_ADMIN_EMAIL}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {SECONDARY_ADMIN_EMAIL}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated email alerts dispatched instantly when issues are raised across campus.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {emails.length > 0 && (
              <>
                <button
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-xs flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Mark Read</span>
                </button>
                <button
                  onClick={handleClearAll}
                  title="Clear inbox"
                  className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[420px]">
          
          {/* Left Email List */}
          <div className="md:col-span-5 border-r border-slate-200/80 bg-slate-50/70 overflow-y-auto divide-y divide-slate-100">
            {emails.length === 0 ? (
              <div className="p-10 text-center text-slate-400 flex flex-col items-center justify-center h-full">
                <Inbox className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No email alerts received yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                  When a student or faculty submits a report, an instant email dispatch notification arrives here.
                </p>
              </div>
            ) : (
              emails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                const isHigh = email.priority === 'High';

                return (
                  <div
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    className={`p-4 transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-blue-50/90 border-l-4 border-l-blue-600 shadow-2xs'
                        : email.read
                        ? 'hover:bg-slate-100/80 bg-transparent'
                        : 'bg-white font-semibold hover:bg-blue-50/40'
                    }`}
                  >
                    {!email.read && (
                      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100 animate-pulse"></span>
                    )}

                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isHigh ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {email.issueId}
                      </span>
                      <span className="text-[11px] text-slate-400">{email.timestamp}</span>
                    </div>

                    <h4 className={`text-xs leading-snug line-clamp-1 mb-1 ${
                      !email.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                    }`}>
                      {email.subject}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {email.summary}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Email Preview Drawer */}
          <div className="md:col-span-7 bg-white p-6 overflow-y-auto flex flex-col justify-between">
            {selectedEmail ? (
              <div className="space-y-4">
                
                {/* Email Metadata */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{selectedEmail.subject}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{selectedEmail.timestamp}</span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-0.5 pt-1 border-t border-slate-200/60">
                    <div><span className="font-semibold text-slate-400">From:</span> {selectedEmail.from}</div>
                    <div><span className="font-semibold text-slate-400">To:</span> {selectedEmail.to}</div>
                  </div>
                </div>

                {/* Rendered HTML Email Body Preview */}
                <div 
                  className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }}
                />

                {/* Direct Action Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleJumpToIssue(selectedEmail.issueId)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Inspect Ticket in Admin Table</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8">
                <Mail className="w-12 h-12 mb-2 text-slate-200" />
                <p className="text-xs font-medium text-slate-500">Select an email notification from the left list to read full dispatch report.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
