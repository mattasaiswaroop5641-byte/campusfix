import { CampusIssue, Department, Block, Section, Category } from '../types';

export const DEPARTMENTS: Department[] = [
  'CSE',
  'AI & ML',
  'Data Science',
  'IT',
  'ECE',
  'EEE',
  'Mechanical',
  'Civil',
  'MCA',
  'MTech',
  'MBA',
  'BCA',
  'BSc',
  'BCom',
  'BBA',
  'Pharmacy',
  'Other'
];

export const BLOCKS: Block[] = [
  'Block A',
  'Block B',
  'Block C',
  'Block D'
];

export const SECTIONS: Section[] = [
  'Section A',
  'Section B',
  'Section C',
  'Section D'
];

export const CATEGORIES: { name: Category; icon: string; description: string }[] = [
  { name: 'Electrical', icon: '💡', description: 'Lights, switches, power sockets, wiring' },
  { name: 'Wi-Fi / Network', icon: '📶', description: 'Internet access, slow connection, router issues' },
  { name: 'AC / HVAC', icon: '❄️', description: 'Air conditioning, cooling, heating, ventilation' },
  { name: 'Plumbing', icon: '🚰', description: 'Water leakages, taps, washrooms, drainage' },
  { name: 'Furniture', icon: '🪑', description: 'Broken chairs, desks, podiums, benches' },
  { name: 'Cleanliness', icon: '🧹', description: 'Dust, waste disposal, hygiene, washrooms' },
  { name: 'Computer / Equipment', icon: '💻', description: 'Lab PCs, projectors, monitors, lab gear' },
  { name: 'Other', icon: '❓', description: 'General campus infrastructure issues' }
];

export const MAINTENANCE_STAFF = [
  'Ravi Kumar',
  'Suresh',
  'Priya',
  'Maintenance Team A'
];

// Production Clean Slate: Starts with zero issues
export const INITIAL_DEMO_ISSUES: CampusIssue[] = [];

