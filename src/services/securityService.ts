import { logService } from './logService';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface SecurityState {
  failedAttempts: number;
  lockoutUntil: number | null;
}

const SECURITY_STORAGE_KEY = 'campusfix_security_state';

export const securityService = {
  getSecurityState(): SecurityState {
    try {
      const data = localStorage.getItem(SECURITY_STORAGE_KEY);
      if (data) {
        const state: SecurityState = JSON.parse(data);
        // Check if lockout has expired
        if (state.lockoutUntil && Date.now() > state.lockoutUntil) {
          state.failedAttempts = 0;
          state.lockoutUntil = null;
          this.saveSecurityState(state);
        }
        return state;
      }
    } catch {}
    return { failedAttempts: 0, lockoutUntil: null };
  },

  saveSecurityState(state: SecurityState): void {
    try {
      localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(state));
    } catch {}
  },

  isLockedOut(): { locked: boolean; remainingSeconds: number } {
    const state = this.getSecurityState();
    if (state.lockoutUntil && state.lockoutUntil > Date.now()) {
      const remainingSeconds = Math.ceil((state.lockoutUntil - Date.now()) / 1000);
      return { locked: true, remainingSeconds };
    }
    return { locked: false, remainingSeconds: 0 };
  },

  recordFailedAttempt(actor: string, reason: string): { locked: boolean; attemptsLeft: number; remainingSeconds: number } {
    const state = this.getSecurityState();
    state.failedAttempts += 1;

    if (state.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      state.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      this.saveSecurityState(state);

      logService.addLog({
        eventType: '2FA_AUTH_FAILED',
        title: 'SECURITY ALARM: Account Lockout Triggered',
        description: `Account ${actor} locked for 5 minutes after ${MAX_FAILED_ATTEMPTS} consecutive failed attempts.`,
        actor,
        actorRole: 'System Bot',
        severity: 'CRITICAL'
      });

      return { locked: true, attemptsLeft: 0, remainingSeconds: LOCKOUT_DURATION_MS / 1000 };
    }

    this.saveSecurityState(state);

    logService.addLog({
      eventType: '2FA_AUTH_FAILED',
      title: `Failed Authentication Attempt (${state.failedAttempts}/${MAX_FAILED_ATTEMPTS})`,
      description: `Failed attempt for account ${actor}: ${reason}`,
      actor,
      actorRole: 'Admin',
      severity: 'WARNING'
    });

    return { 
      locked: false, 
      attemptsLeft: MAX_FAILED_ATTEMPTS - state.failedAttempts, 
      remainingSeconds: 0 
    };
  },

  recordSuccessfulLogin(actor: string): void {
    this.saveSecurityState({ failedAttempts: 0, lockoutUntil: null });

    logService.addLog({
      eventType: '2FA_AUTH_SUCCESS',
      title: `Admin Session Authorized: ${actor}`,
      description: `2FA cryptographic challenge validated. Secure session initiated.`,
      actor,
      actorRole: 'Admin',
      severity: 'SUCCESS'
    });
  },

  resetLockout(): void {
    this.saveSecurityState({ failedAttempts: 0, lockoutUntil: null });
  }
};
