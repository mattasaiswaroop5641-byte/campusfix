import { CampusIssue } from '../types';
import { logService } from './logService';

export interface AdminEmailNotification {
  id: string;
  to: string;
  from: string;
  subject: string;
  timestamp: string;
  read: boolean;
  issueId: string;
  category: string;
  location: string;
  block: string;
  reporter: string;
  reporterType: string;
  priority: string;
  summary: string;
  recommendedAction: string;
  htmlBody: string;
}

const EMAIL_STORAGE_KEY = 'campusfix_admin_email_inbox';
export const PRIMARY_ADMIN_EMAIL = 'mattasaiswaroop5641@gmail.com';
export const SECONDARY_ADMIN_EMAIL = 'campusfix5641@gmail.com';
export const TERTIARY_ADMIN_EMAIL = 'hemanthvaka6170@gmail.com';
export const ADMIN_EMAILS = [PRIMARY_ADMIN_EMAIL, SECONDARY_ADMIN_EMAIL, TERTIARY_ADMIN_EMAIL];

/**
 * ============================================================================
 * CAMPUSFIX ENTERPRISE EMAIL NOTIFICATION SYSTEM
 * ============================================================================
 * Production SMTP Integration (Node.js nodemailer / Gmail SMTP):
 * 
 * import nodemailer from 'nodemailer';
 * const transporter = nodemailer.createTransport({
 *   service: 'gmail',
 *   auth: {
 *     user: 'campusfix88@gmail.com', // or mattasaiswaroop5641@gmail.com
 *     pass: 'Mgsai@1025' // or 16-digit Google App Password
 *   }
 * });
 * await transporter.sendMail({ 
 *   from: '"CampusFix Alert System" <campusfix88@gmail.com>', 
 *   to: 'mattasaiswaroop5641@gmail.com, campusfix88@gmail.com', 
 *   subject, 
 *   html 
 * });
 * ============================================================================
 */

export const emailService = {
  getInbox(): AdminEmailNotification[] {
    try {
      const data = localStorage.getItem(EMAIL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveInbox(emails: AdminEmailNotification[]): void {
    try {
      localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(emails));
    } catch {}
  },

  sendAdminIssueAlert(issue: CampusIssue): AdminEmailNotification {
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
                      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const priorityBadge = issue.priority === 'High' ? '🔴 HIGH PRIORITY' : (issue.priority === 'Medium' ? '🟡 MEDIUM' : '🟢 LOW');
    const subject = `${issue.priority === 'High' ? '🚨 URGENT ALERT: ' : '📋 NEW TICKET: '}Campus Issue #${issue.id} Raised - ${issue.category} (${issue.location})`;

    const htmlBody = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #0f172a, #1e1b4b); padding: 24px; color: #ffffff; text-align: left;">
          <h2 style="margin: 0 0 4px; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">CAMPUSFIX FACILITY DISPATCH ALERT</h2>
          <p style="margin: 0; font-size: 12px; color: #93c5fd;">Automated Maintenance Incident Alert System</p>
        </div>
        <div style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
            <div>
              <span style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Ticket ID:</span>
              <div style="font-family: monospace; font-size: 16px; font-weight: bold; color: #0f172a;">${issue.id}</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Severity:</span>
              <div style="font-size: 13px; font-weight: bold; color: ${issue.priority === 'High' ? '#e11d48' : '#d97706'};">${priorityBadge}</div>
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #334155;"><strong>Reported Issue:</strong> ${issue.title}</p>
            <p style="margin: 0 0 8px; font-size: 13px; color: #334155;"><strong>Location:</strong> ${issue.location} (${issue.block})</p>
            <p style="margin: 0; font-size: 13px; color: #334155;"><strong>Reporter:</strong> ${issue.reporter} (${issue.reporterType} - ${issue.department}${issue.section && issue.section !== 'N/A' ? ' Sec ' + issue.section : ''})</p>
          </div>

          ${issue.imageUrl ? `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 16px; text-align: center;">
            <div style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 8px; text-align: left;">📸 Attached Photo Proof Evidence:</div>
            <img src="${issue.imageUrl}" alt="Photo Proof" style="max-width: 100%; max-height: 240px; border-radius: 8px; object-fit: cover; border: 1px solid #cbd5e1;" />
          </div>
          ` : ''}

          <div style="background: #eef2ff; border-left: 4px solid #6366f1; padding: 14px; border-radius: 8px; margin-bottom: 20px;">
            <div style="font-size: 11px; font-weight: bold; color: #4338ca; text-transform: uppercase; margin-bottom: 4px;">Incident Diagnostic</div>
            <div style="font-size: 13px; color: #1e1b4b; margin-bottom: 6px;">"${issue.aiAnalysis?.summary || issue.description}"</div>
            <div style="font-size: 12px; color: #065f46; font-weight: 600;">Recommended Action: ${issue.aiAnalysis?.recommendedAction || 'Inspect and dispatch technician.'}</div>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="http://localhost:5173" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 13px; display: inline-block;">
              Open Admin Console & Triage Ticket →
            </a>
          </div>
        </div>
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 24px; font-size: 11px; color: #64748b; text-align: center; line-height: 1.6;">
          Dispatched to <strong>${PRIMARY_ADMIN_EMAIL}</strong> & <strong>${SECONDARY_ADMIN_EMAIL}</strong><br />
          CampusFix Smart Facility Dispatch Network
        </div>
      </div>
    `;

    const newEmail: AdminEmailNotification = {
      id: 'eml_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      to: ADMIN_EMAILS.join(', '),
      from: 'dispatch-bot@campusfix.internal',
      subject,
      timestamp,
      read: false,
      issueId: issue.id,
      category: issue.category,
      location: issue.location,
      block: issue.block,
      reporter: issue.reporter,
      reporterType: issue.reporterType,
      priority: issue.priority,
      summary: issue.aiAnalysis?.summary || issue.description,
      recommendedAction: issue.aiAnalysis?.recommendedAction || 'Inspect and triage ticket.',
      htmlBody
    };

    const inbox = this.getInbox();
    const updated = [newEmail, ...inbox];
    this.saveInbox(updated);

    // Audit log
    try {
      logService.addLog({
        eventType: 'EMAIL_DISPATCHED',
        title: `Email Alert Dispatched: ${issue.id}`,
        description: `Dispatched automated ${issue.priority} alert to ${ADMIN_EMAILS.join(', ')}`,
        actor: 'CampusFix Email Dispatcher',
        actorRole: 'System Bot',
        targetId: issue.id,
        severity: issue.priority === 'High' ? 'CRITICAL' : 'INFO'
      });
    } catch {}

    return newEmail;
  },

  markAsRead(emailId: string): void {
    const inbox = this.getInbox().map(em => em.id === emailId ? { ...em, read: true } : em);
    this.saveInbox(inbox);
  },

  markAllAsRead(): void {
    const inbox = this.getInbox().map(em => ({ ...em, read: true }));
    this.saveInbox(inbox);
  },

  removeEmailByIssueId(issueId: string): void {
    const inbox = this.getInbox().filter(em => em.issueId !== issueId);
    this.saveInbox(inbox);
  },

  syncWithIssues(activeIssues: CampusIssue[]): AdminEmailNotification[] {
    const activeIds = new Set(activeIssues.map(i => i.id));
    let currentInbox = this.getInbox().filter(em => activeIds.has(em.issueId));

    // Ensure every active issue has an email notification in the inbox
    const existingEmailIssueIds = new Set(currentInbox.map(e => e.issueId));
    activeIssues.forEach(issue => {
      if (!existingEmailIssueIds.has(issue.id)) {
        const generated = this.sendAdminIssueAlert(issue);
        currentInbox = [generated, ...currentInbox];
      }
    });

    this.saveInbox(currentInbox);
    return currentInbox;
  },

  clearInbox(): void {
    localStorage.removeItem(EMAIL_STORAGE_KEY);
  }
};
