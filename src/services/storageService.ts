import { CampusIssue, UserProfile } from '../types';

const ISSUES_KEY = 'campusfix_issues_live';
const USER_KEY = 'campusfix_user_live';

export const storageService = {
  getIssues(): CampusIssue[] {
    try {
      // Clean up legacy test keys if present
      if (localStorage.getItem('campusfix_issues_v1')) {
        localStorage.removeItem('campusfix_issues_v1');
      }

      const data = localStorage.getItem(ISSUES_KEY);
      if (!data) {
        localStorage.setItem(ISSUES_KEY, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading issues from storage:', e);
      return [];
    }
  },

  saveIssues(issues: CampusIssue[]): void {
    try {
      localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
    } catch (e) {
      console.error('Error saving issues to storage:', e);
    }
  },

  getUserProfile(): UserProfile | null {
    try {
      // Clear legacy permanent localStorage session so new tabs require login
      if (localStorage.getItem(USER_KEY)) {
        localStorage.removeItem(USER_KEY);
      }
      const data = sessionStorage.getItem(USER_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading user from session storage:', e);
      return null;
    }
  },

  saveUserProfile(user: UserProfile | null): void {
    try {
      if (user) {
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        sessionStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.error('Error saving user to session storage:', e);
    }
  },

  clearIssues(): CampusIssue[] {
    localStorage.setItem(ISSUES_KEY, JSON.stringify([]));
    return [];
  },

  purgeResolvedOlderThan3Days(): { issues: CampusIssue[]; deletedCount: number } {
    const issues = this.getIssues();
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const retained = issues.filter(issue => {
      if (issue.status !== 'Resolved') return true;
      const resolvedTimeline = issue.timeline ? issue.timeline.find(t => t.status === 'Resolved') : null;
      let dateToCheck = issue.updatedAt ? new Date(issue.updatedAt) : new Date(issue.createdAt);
      if (resolvedTimeline && resolvedTimeline.timestamp) {
        const parsed = new Date(resolvedTimeline.timestamp);
        if (!isNaN(parsed.getTime())) dateToCheck = parsed;
      }
      return dateToCheck >= threeDaysAgo;
    });

    const deletedCount = issues.length - retained.length;
    if (deletedCount > 0) {
      this.saveIssues(retained);
    }
    return { issues: retained, deletedCount };
  }
};

