export type UserRole = 'student' | 'faculty' | 'admin';

export type Department = 
  | 'CSE'
  | 'AI & ML'
  | 'Data Science'
  | 'IT'
  | 'ECE'
  | 'EEE'
  | 'Mechanical'
  | 'Civil'
  | 'MCA'
  | 'MTech'
  | 'MBA'
  | 'BCA'
  | 'BSc'
  | 'BCom'
  | 'BBA'
  | 'Pharmacy'
  | 'Other';

export type Block = 
  | 'Block A'
  | 'Block B'
  | 'Block C'
  | 'Block D';

export type Section = 
  | 'Section A'
  | 'Section B'
  | 'Section C'
  | 'Section D';

export interface UserProfile {
  id: string;
  regNumber: string; // Registration / Roll Number (Student) or Faculty ID (Faculty)
  name: string;
  role: UserRole;
  department: Department;
  block: Block;
  section?: Section; // ONLY for student, never present for faculty
  email?: string;
  password?: string;
}

export type Category = 
  | 'Electrical'
  | 'Wi-Fi / Network'
  | 'AC / HVAC'
  | 'Plumbing'
  | 'Furniture'
  | 'Cleanliness'
  | 'Computer / Equipment'
  | 'Other';

export type Priority = 'High' | 'Medium' | 'Low';

export type IssueStatus = 
  | 'Submitted'
  | 'Acknowledged'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved';

export interface TimelineStep {
  status: IssueStatus;
  timestamp: string;
  note?: string;
  by?: string;
}

export interface AIAnalysis {
  category: Category;
  priority: Priority;
  summary: string;
  recommendedAction: string;
  confidence: number;
  keywordsDetected: string[];
}

export interface CampusIssue {
  id: string; // e.g. CF-1024
  title: string;
  description: string;
  reporter: string;
  reporterId?: string;
  reporterRegNo?: string;
  reporterEmail?: string;
  reporterType: 'Student' | 'Faculty';
  department: Department;
  block: Block;
  section?: Section | 'N/A'; // 'N/A' for faculty, actual section for student
  category: Category;
  location: string; // e.g. 'Computer Lab 3', 'Room 102'
  priority: Priority;
  status: IssueStatus;
  createdAt: string;
  updatedAt: string;
  assignedStaff?: string;
  aiAnalysis: AIAnalysis;
  imageUrl?: string;
  timeline: TimelineStep[];
}

export interface RecurringIssueCluster {
  id: string;
  category: Category;
  location: string;
  block: Block;
  count: number;
  issues: CampusIssue[];
  severity: Priority;
  recommendation: string;
}

export interface CampusBlockInfo {
  id: Block;
  name: string;
  departments: Department[];
  totalIssues: number;
  activeHighPriority: number;
  activeMediumPriority: number;
  resolved: number;
  health: 'healthy' | 'warning' | 'critical';
}
