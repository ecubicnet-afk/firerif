export interface SavingsEntry {
  id?: number;
  date: string;           // 'YYYY-MM-DD'
  timestamp: number;      // Date.now()
  amount: number;         // Savings amount in yen
  categoryId: string;
  stampId: number | null;
  label: string;
  icon: string;
}

export interface Stamp {
  id?: number;
  label: string;
  icon: string;
  amount: number;
  categoryId: string;
  sortOrder: number;
  isDefault: boolean;
  notificationMessage?: string;
}

export interface DreamGoal {
  id: number;             // Always 1 (singleton)
  title: string;
  targetAmount: number;
  photoData: string;      // Base64 data URL
  createdAt: number;
}

export interface Course {
  id: 'aggressive' | 'standard' | 'balanced' | 'conservative';
  label: string;
  icon: string;
  multiplier: number;
  multiplier50: number;
  annualRate: number;
  indexName: string;
  color: string;
}

export type CourseId = Course['id'];

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export type ViewMode = 'monthly' | 'weekly' | 'yearly';

export interface Preferences {
  courseId: CourseId;
  viewMode: ViewMode;
}
