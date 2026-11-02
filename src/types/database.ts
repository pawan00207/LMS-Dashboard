export type UserRole = 'admin' | 'librarian' | 'member';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  email: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string;
  year?: number;
  total_copies: number;
  available_copies: number;
  cover_url?: string;
  shelf_location: string;
  created_at: string;
}

export interface Member {
  id: string;
  member_code: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  joined_at: string;
  status: 'active' | 'suspended' | 'expired';
}

export interface Transaction {
  id: string;
  book_id: string;
  member_id: string;
  issued_by: string; // profile id or name
  issue_date: string; // YYYY-MM-DD
  due_date: string; // YYYY-MM-DD
  return_date?: string | null; // YYYY-MM-DD
  status: 'issued' | 'returned' | 'overdue';
  fine_amount: number;
  fine_paid: boolean;
  notes?: string;
}

export interface SystemSettings {
  id: string;
  fine_per_day: number;
  loan_period_days: number;
  max_books_per_member: number;
  library_name: string;
  library_email: string;
  contact_phone: string;
  currency_symbol: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  role: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimePayload<T = any> {
  eventType: RealtimeEventType;
  table: string;
  new: T;
  old: T | null;
  commit_timestamp?: string;
}
