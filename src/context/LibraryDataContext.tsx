import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Book,
  Member,
  Transaction,
  SystemSettings,
  AuditLog,
  Profile,
  RealtimePayload
} from '../types/database';
import {
  supabaseDb,
  getRealtimeStatus,
  subscribeToStatus,
  setRealtimeStatus,
  ConnectionStatus
} from '../services/supabaseClient';
import { canIssueBook, calculateDueDate } from '../utils/libraryRules';
import { useAuth } from './AuthContext';

interface ToastItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

interface LibraryDataContextType {
  books: Book[];
  members: Member[];
  transactions: Transaction[];
  settings: SystemSettings;
  auditLogs: AuditLog[];
  librarians: Profile[];
  connectionStatus: ConnectionStatus;
  toasts: ToastItem[];
  dismissToast: (id: string) => void;
  simulateConnectionDrop: () => void;
  // Circulation
  issueBook: (data: {
    bookId: string;
    memberId: string;
    customDueDate?: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string; transaction?: Transaction }>;
  returnBook: (data: {
    transactionId: string;
    markFinePaid: boolean;
    fineOverride?: number;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string; transaction?: Transaction }>;
  payFine: (transactionId: string) => Promise<{ success: boolean; error?: string }>;
  // Books CRUD
  addBook: (book: Omit<Book, 'id' | 'created_at'>) => Promise<Book>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<Book | null>;
  deleteBook: (id: string) => Promise<boolean>;
  // Members CRUD
  addMember: (member: Omit<Member, 'id' | 'member_code' | 'joined_at'>) => Promise<Member>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<Member | null>;
  toggleMemberStatus: (id: string) => Promise<Member | null>;
  // Admin Staff CRUD
  createLibrarian: (staff: { full_name: string; email: string; avatar_url?: string }) => Promise<Profile>;
  toggleLibrarianStatus: (id: string) => Promise<Profile | null>;
  deleteLibrarian: (id: string) => Promise<boolean>;
  // Settings
  updateSettings: (updates: Partial<SystemSettings>) => Promise<SystemSettings>;
  // Reset demo
  resetDatabase: () => void;
}

const LibraryDataContext = createContext<LibraryDataContextType | undefined>(undefined);

export const LibraryDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [books, setBooks] = useState<Book[]>(() => supabaseDb.getBooks());
  const [members, setMembers] = useState<Member[]>(() => supabaseDb.getMembers());
  const [transactions, setTransactions] = useState<Transaction[]>(() => supabaseDb.getTransactions());
  const [settings, setSettings] = useState<SystemSettings>(() => supabaseDb.getSettings());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => supabaseDb.getAuditLogs());
  const [profiles, setProfiles] = useState<Profile[]>(() => supabaseDb.getProfiles());
  const [connectionStatus, setConnStatus] = useState<ConnectionStatus>(getRealtimeStatus());
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastItem, 'id' | 'timestamp'>) => {
    const item: ToastItem = {
      ...toast,
      id: `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setToasts((prev) => [item, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== item.id));
    }, 5500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state on real-time postgres_changes
  const reloadDataFromStorage = useCallback(() => {
    setBooks(supabaseDb.getBooks());
    setMembers(supabaseDb.getMembers());
    setTransactions(supabaseDb.getTransactions());
    setSettings(supabaseDb.getSettings());
    setAuditLogs(supabaseDb.getAuditLogs());
    setProfiles(supabaseDb.getProfiles());
  }, []);

  useEffect(() => {
    // Subscribe to status changes
    const unsubStatus = subscribeToStatus((s) => setConnStatus(s));

    // Subscribe to Supabase postgres_changes
    const unsubRealtime = supabaseDb.subscribe('*', (payload: RealtimePayload) => {
      reloadDataFromStorage();

      // Show real-time notification
      if (payload.table === 'transactions' && payload.eventType === 'INSERT') {
        const tx = payload.new as Transaction;
        addToast({
          type: 'info',
          title: 'Live Circulation Update',
          message: `New issue recorded: Transaction #${tx.id}`,
        });
      } else if (payload.table === 'transactions' && payload.eventType === 'UPDATE') {
        const tx = payload.new as Transaction;
        if (tx.status === 'returned') {
          addToast({
            type: 'success',
            title: 'Book Return Registered',
            message: `Return completed for transaction #${tx.id}${tx.fine_amount > 0 ? ` (Fine: ₹${tx.fine_amount})` : ''}`,
          });
        }
      }
    });

    return () => {
      unsubStatus();
      unsubRealtime();
    };
  }, [reloadDataFromStorage, addToast]);

  const simulateConnectionDrop = () => {
    setRealtimeStatus('reconnecting');
    addToast({
      type: 'warning',
      title: 'Realtime Connection Interrupted',
      message: 'Attempting to reconnect websocket channel to Alexandria realtime cluster...',
    });

    setTimeout(() => {
      setRealtimeStatus('connected');
      addToast({
        type: 'success',
        title: 'Connection Restored',
        message: 'Connected to Supabase Realtime postgres_changes engine.',
      });
    }, 2800);
  };

  // Issue Book with validation check
  const issueBook = async (data: {
    bookId: string;
    memberId: string;
    customDueDate?: string;
    notes?: string;
  }): Promise<{ success: boolean; error?: string; transaction?: Transaction }> => {
    const book = books.find((b) => b.id === data.bookId);
    if (!book) return { success: false, error: 'Selected book was not found.' };

    const member = members.find((m) => m.id === data.memberId);
    if (!member) return { success: false, error: 'Selected member was not found.' };

    // Active loans for this member
    const activeMemberLoans = transactions.filter(
      (t) => t.member_id === data.memberId && t.status !== 'returned'
    );

    // Unpaid fines
    const memberUnpaidFines = transactions
      .filter((t) => t.member_id === data.memberId && !t.fine_paid && t.fine_amount > 0)
      .reduce((sum, t) => sum + t.fine_amount, 0);

    const check = canIssueBook(member, book, activeMemberLoans, settings, memberUnpaidFines);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const dueDate = data.customDueDate || calculateDueDate(todayStr, settings.loan_period_days);

    const tx = supabaseDb.issueBook({
      book_id: book.id,
      member_id: member.id,
      issued_by: user?.full_name || 'Circulation Desk',
      due_date: dueDate,
      notes: data.notes,
    });

    supabaseDb.addAuditLog({
      user_id: user?.id || 'unknown',
      user_name: user?.full_name || 'Staff',
      role: user?.role || 'librarian',
      action: 'ISSUE_BOOK',
      details: `Issued "${book.title}" to ${member.name} (${member.member_code}). Due: ${dueDate}`,
    });

    reloadDataFromStorage();
    return { success: true, transaction: tx };
  };

  // Return book
  const returnBook = async (data: {
    transactionId: string;
    markFinePaid: boolean;
    fineOverride?: number;
    notes?: string;
  }): Promise<{ success: boolean; error?: string; transaction?: Transaction }> => {
    const targetTx = transactions.find((t) => t.id === data.transactionId);
    if (!targetTx) return { success: false, error: 'Transaction not found.' };

    const book = books.find((b) => b.id === targetTx.book_id);
    const member = members.find((m) => m.id === targetTx.member_id);

    const updatedTx = supabaseDb.returnBook({
      transaction_id: data.transactionId,
      mark_fine_paid: data.markFinePaid,
      fine_override: data.fineOverride,
      notes: data.notes,
    });

    if (!updatedTx) return { success: false, error: 'Failed to process return.' };

    supabaseDb.addAuditLog({
      user_id: user?.id || 'unknown',
      user_name: user?.full_name || 'Staff',
      role: user?.role || 'librarian',
      action: 'RETURN_BOOK',
      details: `Returned "${book?.title || 'Book'}" from ${member?.name || 'Member'}. Fine: ₹${updatedTx.fine_amount} (${updatedTx.fine_paid ? 'Paid' : 'Unpaid'}).`,
    });

    reloadDataFromStorage();
    return { success: true, transaction: updatedTx };
  };

  const payFine = async (transactionId: string): Promise<{ success: boolean; error?: string }> => {
    const tx = supabaseDb.payFine(transactionId);
    if (!tx) return { success: false, error: 'Transaction not found.' };

    supabaseDb.addAuditLog({
      user_id: user?.id || 'unknown',
      user_name: user?.full_name || 'Staff',
      role: user?.role || 'librarian',
      action: 'FINE_COLLECTED',
      details: `Marked fine of ₹${tx.fine_amount} paid for Transaction #${tx.id}.`,
    });

    reloadDataFromStorage();
    return { success: true };
  };

  // Book actions
  const addBook = async (book: Omit<Book, 'id' | 'created_at'>): Promise<Book> => {
    const newBook = supabaseDb.addBook(book);
    supabaseDb.addAuditLog({
      user_id: user?.id || 'unknown',
      user_name: user?.full_name || 'Staff',
      role: user?.role || 'librarian',
      action: 'CREATE_BOOK',
      details: `Added new book: "${newBook.title}" by ${newBook.author} (ISBN: ${newBook.isbn}, Copies: ${newBook.total_copies}).`,
    });
    reloadDataFromStorage();
    return newBook;
  };

  const updateBook = async (id: string, updates: Partial<Book>): Promise<Book | null> => {
    const updated = supabaseDb.updateBook(id, updates);
    if (updated) {
      supabaseDb.addAuditLog({
        user_id: user?.id || 'unknown',
        user_name: user?.full_name || 'Staff',
        role: user?.role || 'librarian',
        action: 'UPDATE_BOOK',
        details: `Updated catalog record for "${updated.title}".`,
      });
      reloadDataFromStorage();
    }
    return updated;
  };

  const deleteBook = async (id: string): Promise<boolean> => {
    const book = books.find((b) => b.id === id);
    const ok = supabaseDb.deleteBook(id);
    if (ok) {
      supabaseDb.addAuditLog({
        user_id: user?.id || 'unknown',
        user_name: user?.full_name || 'Staff',
        role: user?.role || 'librarian',
        action: 'DELETE_BOOK',
        details: `Removed book "${book?.title || id}" from catalog.`,
      });
      reloadDataFromStorage();
    }
    return ok;
  };

  // Member actions
  const addMember = async (member: Omit<Member, 'id' | 'member_code' | 'joined_at'>): Promise<Member> => {
    const newMem = supabaseDb.addMember(member);
    supabaseDb.addAuditLog({
      user_id: user?.id || 'unknown',
      user_name: user?.full_name || 'Staff',
      role: user?.role || 'librarian',
      action: 'REGISTER_MEMBER',
      details: `Registered member ${newMem.name} with code ${newMem.member_code}.`,
    });
    reloadDataFromStorage();
    return newMem;
  };

  const updateMember = async (id: string, updates: Partial<Member>): Promise<Member | null> => {
    const updated = supabaseDb.updateMember(id, updates);
    if (updated) {
      supabaseDb.addAuditLog({
        user_id: user?.id || 'unknown',
        user_name: user?.full_name || 'Staff',
        role: user?.role || 'librarian',
        action: 'UPDATE_MEMBER',
        details: `Updated profile for member ${updated.name} (${updated.member_code}).`,
      });
      reloadDataFromStorage();
    }
    return updated;
  };

  const toggleMemberStatus = async (id: string): Promise<Member | null> => {
    const m = members.find((x) => x.id === id);
    if (!m) return null;
    const nextStatus = m.status === 'active' ? 'suspended' : 'active';
    const updated = supabaseDb.updateMember(id, { status: nextStatus });
    if (updated) {
      supabaseDb.addAuditLog({
        user_id: user?.id || 'unknown',
        user_name: user?.full_name || 'Staff',
        role: user?.role || 'librarian',
        action: 'MEMBER_STATUS_CHANGE',
        details: `Changed status of ${updated.name} from ${m.status} to ${nextStatus}.`,
      });
      reloadDataFromStorage();
    }
    return updated;
  };

  // Admin Staff actions
  const createLibrarian = async (staff: { full_name: string; email: string; avatar_url?: string }): Promise<Profile> => {
    const p = supabaseDb.createProfile({
      full_name: staff.full_name,
      email: staff.email,
      role: 'librarian',
      avatar_url: staff.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      is_active: true,
    });
    supabaseDb.addAuditLog({
      user_id: user?.id || 'unknown',
      user_name: user?.full_name || 'Administrator',
      role: 'admin',
      action: 'CREATE_STAFF',
      details: `Appointed new librarian: ${p.full_name} (${p.email}).`,
    });
    reloadDataFromStorage();
    return p;
  };

  const toggleLibrarianStatus = async (id: string): Promise<Profile | null> => {
    const p = profiles.find((x) => x.id === id);
    if (!p) return null;
    const nextActive = !p.is_active;
    const updated = supabaseDb.updateProfile(id, { is_active: nextActive });
    if (updated) {
      supabaseDb.addAuditLog({
        user_id: user?.id || 'unknown',
        user_name: user?.full_name || 'Administrator',
        role: 'admin',
        action: 'STAFF_STATUS_CHANGE',
        details: `${nextActive ? 'Enabled' : 'Disabled'} credentials for staff member ${updated.full_name}.`,
      });
      reloadDataFromStorage();
    }
    return updated;
  };

  const deleteLibrarian = async (id: string): Promise<boolean> => {
    const p = profiles.find((x) => x.id === id);
    const ok = supabaseDb.deleteProfile(id);
    if (ok) {
      supabaseDb.addAuditLog({
        user_id: user?.id || 'unknown',
        user_name: user?.full_name || 'Administrator',
        role: 'admin',
        action: 'DELETE_STAFF',
        details: `Revoked access and deleted profile for librarian ${p?.full_name || id}.`,
      });
      reloadDataFromStorage();
    }
    return ok;
  };

  const updateSettings = async (updates: Partial<SystemSettings>): Promise<SystemSettings> => {
    const updated = supabaseDb.updateSettings(updates);
    supabaseDb.addAuditLog({
      user_id: user?.id || 'unknown',
      user_name: user?.full_name || 'Administrator',
      role: 'admin',
      action: 'SYSTEM_SETTINGS_CHANGE',
      details: `Updated system circulation parameters: loan=${updated.loan_period_days}d, fine=₹${updated.fine_per_day}/day, limit=${updated.max_books_per_member}.`,
    });
    reloadDataFromStorage();
    return updated;
  };

  const resetDatabase = () => {
    supabaseDb.resetDemoDatabase();
    reloadDataFromStorage();
    addToast({
      type: 'info',
      title: 'Database Reset',
      message: 'Demonstration catalogue, members, and transaction history restored.',
    });
  };

  const librarians = profiles.filter((p) => p.role === 'librarian');

  return (
    <LibraryDataContext.Provider
      value={{
        books,
        members,
        transactions,
        settings,
        auditLogs,
        librarians,
        connectionStatus,
        toasts,
        dismissToast,
        simulateConnectionDrop,
        issueBook,
        returnBook,
        payFine,
        addBook,
        updateBook,
        deleteBook,
        addMember,
        updateMember,
        toggleMemberStatus,
        createLibrarian,
        toggleLibrarianStatus,
        deleteLibrarian,
        updateSettings,
        resetDatabase,
      }}
    >
      {children}
    </LibraryDataContext.Provider>
  );
};

export const useLibraryData = () => {
  const context = useContext(LibraryDataContext);
  if (!context) {
    throw new Error('useLibraryData must be used within a LibraryDataProvider');
  }
  return context;
};
