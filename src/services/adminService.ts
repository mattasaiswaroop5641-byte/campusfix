export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  twoFactorSecret: string;
  role: 'Super Admin' | 'Campus Admin' | 'Facility Manager';
  department?: string;
  createdAt: string;
}

const ADMIN_REGISTRY_KEY = 'campusfix_admin_accounts_db';

const DEFAULT_ADMINS: AdminAccount[] = [
  {
    id: 'adm_1',
    name: 'Sai Swaroop (Super Admin)',
    email: 'mattasaiswaroop5641@gmail.com',
    password: 'Mgsai@1025',
    twoFactorSecret: 'JBSWY3DPEHPK3PXP',
    role: 'Super Admin',
    department: 'Campus Infrastructure',
    createdAt: 'Aug 28, 2026'
  },
  {
    id: 'adm_2',
    name: 'CampusFix Official Dispatch',
    email: 'campusfix5641@gmail.com',
    password: 'Mgsai@1025',
    twoFactorSecret: 'JBSWY3DPEHPK3PXP',
    role: 'Campus Admin',
    department: 'Central Maintenance',
    createdAt: 'Aug 28, 2026'
  },
  {
    id: 'adm_3',
    name: 'Hemanth Vaka (Admin)',
    email: 'hemanthvaka6170@gmail.com',
    password: 'Mgsai@1025',
    twoFactorSecret: 'JBSWY3DPEHPK3PXP',
    role: 'Campus Admin',
    department: 'Campus Infrastructure',
    createdAt: 'Aug 29, 2026'
  }
];

export const adminService = {
  getAdmins(): AdminAccount[] {
    try {
      const data = localStorage.getItem(ADMIN_REGISTRY_KEY);
      if (!data) {
        localStorage.setItem(ADMIN_REGISTRY_KEY, JSON.stringify(DEFAULT_ADMINS));
        return DEFAULT_ADMINS;
      }
      const parsed = JSON.parse(data);
      // Clean out any legacy demo emails
      const cleaned = parsed.filter((a: AdminAccount) => a.email !== 'admin@campusfix.edu' && a.email !== 'admin@campusfix.demo');
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(ADMIN_REGISTRY_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return DEFAULT_ADMINS;
    }
  },

  addAdmin(newAdmin: Omit<AdminAccount, 'id' | 'createdAt'>): { success: boolean; admin?: AdminAccount; message?: string } {
    const cleanEmail = newAdmin.email.trim().toLowerCase();
    const admins = this.getAdmins();

    if (admins.some(a => a.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An administrator account with email "' + cleanEmail + '" already exists.' };
    }

    const admin: AdminAccount = {
      ...newAdmin,
      id: 'adm_' + Date.now(),
      email: cleanEmail,
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };

    const updated = [admin, ...admins];
    try {
      localStorage.setItem(ADMIN_REGISTRY_KEY, JSON.stringify(updated));
    } catch {}

    return { success: true, admin };
  },

  removeAdmin(email: string): boolean {
    const cleanEmail = email.trim().toLowerCase();
    const admins = this.getAdmins();
    const filtered = admins.filter(a => a.email.toLowerCase() !== cleanEmail);
    try {
      localStorage.setItem(ADMIN_REGISTRY_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  },

  isAuthorized(email: string, password?: string): boolean {
    const cleanEmail = email.trim().toLowerCase();
    const admins = this.getAdmins();
    const found = admins.find(a => a.email.toLowerCase() === cleanEmail);
    if (!found) return false;
    if (password && found.password && found.password !== password) return false;
    return true;
  },

  isTwoFactorRequired(): boolean {
    try {
      const val = localStorage.getItem('campusfix_admin_2fa_enabled');
      if (val === null) return false; // Default is OFF (can be toggled ON anytime in Admin Panel)
      return val === 'true';
    } catch {
      return false;
    }
  },

  setTwoFactorRequired(enabled: boolean): void {
    try {
      localStorage.setItem('campusfix_admin_2fa_enabled', enabled ? 'true' : 'false');
    } catch {}
  }
};
