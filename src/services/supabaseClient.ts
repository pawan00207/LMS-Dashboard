import {
  Book,
  Member,
  Transaction,
  SystemSettings,
  AuditLog,
  Profile,
  RealtimePayload,
  UserRole
} from '../types/database';
import {
  INITIAL_BOOKS,
  INITIAL_MEMBERS,
  INITIAL_TRANSACTIONS,
  INITIAL_SETTINGS,
  INITIAL_PROFILES,
  INITIAL_AUDIT_LOGS
} from './seedData';
import { calculateOverdueAndFine } from '../utils/libraryRules';

const STORAGE_KEYS = {
  BOOKS: 'alexandria_lms_books_v1',
  MEMBERS: 'alexandria_lms_members_v1',
  TRANSACTIONS: 'alexandria_lms_transactions_v1',
  SETTINGS: 'alexandria_lms_settings_v1',
  PROFILES: 'alexandria_lms_profiles_v1',
  AUDIT_LOGS: 'alexandria_lms_audit_logs_v1',
  SESSION: 'alexandria_lms_session_v1',
};

// Check if localStorage has existing state, else populate seed data
function getStored<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse localStorage for', key, err);
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Failed to set localStorage for', key, err);
  }
}

// Global broadcast channel for multi-tab real-time postgres_changes
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('alexandria_library_realtime');
  } catch (e) {
    console.warn('BroadcastChannel not supported or blocked', e);
  }
}

// In-process event emitter for subscriptions
type ChangeCallback = (payload: RealtimePayload) => void;
const subscribers = new Set<{ table: string; callback: ChangeCallback }>();

// Listen to other browser tabs
if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    if (event.data && event.data.type === 'POSTGRES_CHANGES') {
      const payload: RealtimePayload = event.data.payload;
      subscribers.forEach((sub) => {
        if (sub.table === '*' || sub.table === payload.table) {
          sub.callback(payload);
        }
      });
    }
  };
}

export function notifyChange(table: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE', newRecord: any, oldRecord: any = null) {
  const payload: RealtimePayload = {
    eventType,
    table,
    new: newRecord,
    old: oldRecord,
    commit_timestamp: new Date().toISOString(),
  };

  // Local tab notification
  subscribers.forEach((sub) => {
    if (sub.table === '*' || sub.table === table) {
      sub.callback(payload);
    }
  });

  // Cross-tab broadcast notification
  if (broadcastChannel) {
    broadcastChannel.postMessage({
      type: 'POSTGRES_CHANGES',
      payload,
    });
  }
}

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

let currentConnectionStatus: ConnectionStatus = 'connected';
const statusListeners = new Set<(status: ConnectionStatus) => void>();

export function setRealtimeStatus(status: ConnectionStatus) {
  currentConnectionStatus = status;
  statusListeners.forEach((fn) => fn(status));
}

export function getRealtimeStatus(): ConnectionStatus {
  return currentConnectionStatus;
}

export function subscribeToStatus(fn: (status: ConnectionStatus) => void): () => void {
  statusListeners.add(fn);
  fn(currentConnectionStatus);
  return () => statusListeners.delete(fn);
}

/**
 * Universal Supabase-compatible real-time database interface
 */
export const supabaseDb = {
  // Profiles (Users)
  getProfiles(): Profile[] {
    return getStored<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  },

  updateProfile(id: string, updates: Partial<Profile>): Profile | null {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const old = profiles[idx];
    const updated = { ...old, ...updates };
    profiles[idx] = updated;
    setStored(STORAGE_KEYS.PROFILES, profiles);
    notifyChange('profiles', 'UPDATE', updated, old);
    return updated;
  },

  createProfile(profile: Omit<Profile, 'id' | 'created_at'>): Profile {
    const profiles = this.getProfiles();
    const newProfile: Profile = {
      ...profile,
      id: `usr_${profile.role}_${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    };
    profiles.push(newProfile);
    setStored(STORAGE_KEYS.PROFILES, profiles);
    notifyChange('profiles', 'INSERT', newProfile, null);
    return newProfile;
  },

  deleteProfile(id: string): boolean {
    const profiles = this.getProfiles();
    const old = profiles.find((p) => p.id === id);
    if (!old) return false;
    const filtered = profiles.filter((p) => p.id !== id);
    setStored(STORAGE_KEYS.PROFILES, filtered);
    notifyChange('profiles', 'DELETE', old, old);
    return true;
  },

  // Books
  getBooks(): Book[] {
    return getStored<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
  },

  addBook(book: Omit<Book, 'id' | 'created_at'>): Book {
    const books = this.getBooks();
    const newBook: Book = {
      ...book,
      id: `bk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    books.unshift(newBook);
    setStored(STORAGE_KEYS.BOOKS, books);
    notifyChange('books', 'INSERT', newBook, null);
    return newBook;
  },

  updateBook(id: string, updates: Partial<Book>): Book | null {
    const books = this.getBooks();
    const idx = books.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    const old = books[idx];
    const updated = { ...old, ...updates };
    books[idx] = updated;
    setStored(STORAGE_KEYS.BOOKS, books);
    notifyChange('books', 'UPDATE', updated, old);
    return updated;
  },

  deleteBook(id: string): boolean {
    const books = this.getBooks();
    const old = books.find((b) => b.id === id);
    if (!old) return false;
    const filtered = books.filter((b) => b.id !== id);
    setStored(STORAGE_KEYS.BOOKS, filtered);
    notifyChange('books', 'DELETE', old, old);
    return true;
  },

  // Members
  getMembers(): Member[] {
    return getStored<Member[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  },

  addMember(member: Omit<Member, 'id' | 'member_code' | 'joined_at'>): Member {
    const members = this.getMembers();
    const nextCodeNum = 1000 + members.length + 1;
    const newMember: Member = {
      ...member,
      id: `mem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      member_code: `MEM-${nextCodeNum}`,
      joined_at: new Date().toISOString().split('T')[0],
    };
    members.unshift(newMember);
    setStored(STORAGE_KEYS.MEMBERS, members);
    notifyChange('members', 'INSERT', newMember, null);
    return newMember;
  },

  updateMember(id: string, updates: Partial<Member>): Member | null {
    const members = this.getMembers();
    const idx = members.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    const old = members[idx];
    const updated = { ...old, ...updates };
    members[idx] = updated;
    setStored(STORAGE_KEYS.MEMBERS, members);
    notifyChange('members', 'UPDATE', updated, old);
    return updated;
  },

  // Transactions (Circulation)
  getTransactions(): Transaction[] {
    return getStored<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  },

  /**
   * Issues a book: Creates transaction, decrements book.available_copies, dispatches real-time events & audit
   */
  issueBook(data: {
    book_id: string;
    member_id: string;
    issued_by: string;
    due_date: string;
    notes?: string;
  }): Transaction {
    const transactions = this.getTransactions();
    const today = new Date().toISOString().split('T')[0];

    const newTx: Transaction = {
      id: `tx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      book_id: data.book_id,
      member_id: data.member_id,
      issued_by: data.issued_by,
      issue_date: today,
      due_date: data.due_date,
      return_date: null,
      status: 'issued',
      fine_amount: 0,
      fine_paid: false,
      notes: data.notes,
    };

    transactions.unshift(newTx);
    setStored(STORAGE_KEYS.TRANSACTIONS, transactions);

    // Trigger: Decrement available_copies
    const books = this.getBooks();
    const bookIdx = books.findIndex((b) => b.id === data.book_id);
    if (bookIdx !== -1) {
      const oldBook = books[bookIdx];
      const updatedBook = {
        ...oldBook,
        available_copies: Math.max(0, oldBook.available_copies - 1),
      };
      books[bookIdx] = updatedBook;
      setStored(STORAGE_KEYS.BOOKS, books);
      notifyChange('books', 'UPDATE', updatedBook, oldBook);
    }

    notifyChange('transactions', 'INSERT', newTx, null);
    return newTx;
  },

  /**
   * Returns a book: Calculates fine, increments book.available_copies, updates transaction, dispatches real-time events & audit
   */
  returnBook(data: {
    transaction_id: string;
    return_date?: string;
    mark_fine_paid?: boolean;
    fine_override?: number;
    notes?: string;
  }): Transaction | null {
    const transactions = this.getTransactions();
    const txIdx = transactions.findIndex((t) => t.id === data.transaction_id);
    if (txIdx === -1) return null;

    const oldTx = transactions[txIdx];
    const settings = this.getSettings();
    const today = data.return_date || new Date().toISOString().split('T')[0];

    const { fineAmount } = calculateOverdueAndFine(oldTx.due_date, today, settings.fine_per_day);
    const finalFine = typeof data.fine_override === 'number' ? data.fine_override : fineAmount;

    const updatedTx: Transaction = {
      ...oldTx,
      return_date: today,
      status: 'returned',
      fine_amount: finalFine,
      fine_paid: finalFine === 0 ? true : !!data.mark_fine_paid,
      notes: data.notes ? (oldTx.notes ? `${oldTx.notes} | ${data.notes}` : data.notes) : oldTx.notes,
    };

    transactions[txIdx] = updatedTx;
    setStored(STORAGE_KEYS.TRANSACTIONS, transactions);

    // Trigger: Increment available_copies
    const books = this.getBooks();
    const bookIdx = books.findIndex((b) => b.id === oldTx.book_id);
    if (bookIdx !== -1) {
      const oldBook = books[bookIdx];
      const updatedBook = {
        ...oldBook,
        available_copies: Math.min(oldBook.total_copies, oldBook.available_copies + 1),
      };
      books[bookIdx] = updatedBook;
      setStored(STORAGE_KEYS.BOOKS, books);
      notifyChange('books', 'UPDATE', updatedBook, oldBook);
    }

    notifyChange('transactions', 'UPDATE', updatedTx, oldTx);
    return updatedTx;
  },

  payFine(transaction_id: string): Transaction | null {
    const transactions = this.getTransactions();
    const txIdx = transactions.findIndex((t) => t.id === transaction_id);
    if (txIdx === -1) return null;
    const oldTx = transactions[txIdx];
    const updatedTx: Transaction = {
      ...oldTx,
      fine_paid: true,
    };
    transactions[txIdx] = updatedTx;
    setStored(STORAGE_KEYS.TRANSACTIONS, transactions);
    notifyChange('transactions', 'UPDATE', updatedTx, oldTx);
    return updatedTx;
  },

  // Settings
  getSettings(): SystemSettings {
    return getStored<SystemSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    setStored(STORAGE_KEYS.SETTINGS, updated);
    notifyChange('settings', 'UPDATE', updated, current);
    return updated;
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getStored<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  addAuditLog(entry: {
    user_id: string;
    user_name: string;
    role: UserRole;
    action: string;
    details: string;
  }): AuditLog {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...entry,
      id: `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Keep max 200 logs
    if (logs.length > 200) logs.pop();
    setStored(STORAGE_KEYS.AUDIT_LOGS, logs);
    notifyChange('audit_logs', 'INSERT', newLog, null);
    return newLog;
  },

  // Reset to original seed data for demo testing
  resetDemoDatabase(): void {
    setStored(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    setStored(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
    setStored(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    setStored(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    setStored(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    setStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    notifyChange('*', 'UPDATE', { reset: true }, null);
  },

  /**
   * Supabase-compatible Realtime subscription
   * client.channel('public:table').on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, (payload) => {})
   */
  subscribe(table: string, callback: ChangeCallback): () => void {
    const sub = { table, callback };
    subscribers.add(sub);
    return () => {
      subscribers.delete(sub);
    };
  },
};
