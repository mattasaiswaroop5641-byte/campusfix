import { CampusIssue, UserProfile } from '../types';
import { storageService } from './storageService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Dual-Mode API Service:
 * Automatically synchronizes with MongoDB backend when online,
 * or operates in high-performance local storage mode if the backend server is offline.
 */
export const apiService = {
  async isBackendOnline(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(1200) });
      return res.ok;
    } catch {
      return false;
    }
  },

  async fetchIssues(): Promise<CampusIssue[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/issues`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        storageService.saveIssues(data); // Cache in local store
        return data;
      }
    } catch (e) {}
    return storageService.getIssues();
  },

  async createIssue(issue: CampusIssue): Promise<CampusIssue> {
    try {
      const res = await fetch(`${API_BASE_URL}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issue),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return issue;
  },

  async updateIssue(id: string, updates: Partial<CampusIssue>): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/issues/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(2000)
      });
    } catch (e) {}
  },

  async deleteIssue(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/issues/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(2000)
      });
    } catch (e) {}
  },

  async purgeAllIssues(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/issues`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(3000)
      });
    } catch (e) {}
  },

  async purgeResolvedOlderThan3Days(): Promise<{ deletedCount: number }> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/purge-resolved-3days`, {
        method: 'POST',
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return { deletedCount: 0 };
  },

  async sendAuthEmail(type: 'login' | 'logout', user: Partial<UserProfile>): Promise<void> {
    try {
      if (!user.email) return;
      await fetch(`${API_BASE_URL}/auth-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, user }),
        signal: AbortSignal.timeout(3000)
      });
    } catch (e) {}
  }
};
