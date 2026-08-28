import { UserProfile, UserRole } from '../types';

export function validateHumanName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, error: 'Name is required' };
  if (trimmed.length < 3) return { valid: false, error: 'Name must be at least 3 characters long' };
  if (trimmed.length > 50) return { valid: false, error: 'Name cannot exceed 50 characters' };
  const lettersRegex = /^[a-zA-Z\s.]+$/;
  if (!lettersRegex.test(trimmed)) return { valid: false, error: 'Name can only contain alphabets and spaces (no numbers or special characters)' };
  for (let i = 0; i < trimmed.length - 3; i++) {
    if (trimmed[i] === trimmed[i+1] && trimmed[i] === trimmed[i+2] && trimmed[i] === trimmed[i+3]) {
      return { valid: false, error: 'Please enter a genuine human name (repeated characters detected)' };
    }
  }
  const lower = trimmed.toLowerCase().replace(/[^a-z]/g, '');
  const mashPatterns = ['asdf', 'qwer', 'zxcv', 'hjkl', 'ghjk', 'tyui', 'bnm', 'dfgh', 'jkl', 'xcvb'];
  for (const pattern of mashPatterns) {
    if (lower.includes(pattern) && lower.length < 8) return { valid: false, error: 'Please enter a genuine name (keyboard mash detected)' };
  }
  const vowels = lower.match(/[aeiou]/g) || [];
  if (lower.length >= 5 && vowels.length === 0) return { valid: false, error: 'Invalid name: Please provide your real name.' };
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(lower)) return { valid: false, error: 'Invalid name: Please provide your genuine name (no random characters).' };
  return { valid: true };
}

export function validateRegNumber(regNo: string, role: UserRole): { valid: boolean; error?: string } {
  const trimmed = regNo.trim().toUpperCase();
  if (!trimmed) return { valid: false, error: role === 'student' ? 'Registration / Roll Number is required' : 'Faculty / Employee ID is required' };
  if (trimmed.length < 4 || trimmed.length > 20) return { valid: false, error: 'ID must be between 4 and 20 alphanumeric characters (e.g. 21B91A0501)' };
  const regRegex = /^[A-Z0-9-]+$/;
  if (!regRegex.test(trimmed)) return { valid: false, error: 'Registration Number must contain only letters, numbers, or hyphens (no spaces)' };
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < 6) return { valid: false, error: 'Password must be at least 6 characters long' };
  return { valid: true };
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const trimmed = (email || '').trim().toLowerCase();
  if (!trimmed) {
    return { valid: false, error: 'Email address is required to receive resolution notifications' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address (e.g. yourname@gmail.com)' };
  }
  return { valid: true };
}

const REGISTERED_USERS_KEY = 'campusfix_registered_users_db';

export const userService = {
  getUsers(): UserProfile[] {
    try {
      const data = localStorage.getItem(REGISTERED_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveUsers(users: UserProfile[]): void {
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    } catch {}
  },

  findByRegOrEmail(identifier: string): UserProfile | null {
    const clean = identifier.trim().toLowerCase();
    const users = this.getUsers();
    return users.find(u => 
      (u.regNumber && u.regNumber.toLowerCase() === clean) ||
      (u.email && u.email.toLowerCase() === clean)
    ) || null;
  },

  register(user: UserProfile): { success: boolean; user?: UserProfile; message?: string } {
    const existing = this.findByRegOrEmail(user.regNumber || user.email || '');
    if (existing) {
      return {
        success: false,
        message: 'Account already exists for ID "' + user.regNumber + '". Please click "Sign In" instead.'
      };
    }
    const users = this.getUsers();
    this.saveUsers([...users, user]);
    return { success: true, user };
  },

  login(identifier: string, password: string): { success: boolean; user?: UserProfile; message?: string } {
    const user = this.findByRegOrEmail(identifier);
    if (!user) {
      return {
        success: false,
        message: 'No account found with Registration ID "' + identifier + '". Please Sign Up first.'
      };
    }
    if (user.password && user.password !== password) {
      return {
        success: false,
        message: 'Incorrect password. Please try again.'
      };
    }
    return { success: true, user };
  }
};