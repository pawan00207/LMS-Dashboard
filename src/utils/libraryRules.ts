/**
 * Pure business logic and calculation rules for Library Management System
 */

export interface SystemSettings {
  fine_per_day: number; // default ₹5
  loan_period_days: number; // default 14 days
  max_books_per_member: number; // default 3
}

export interface BookItem {
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
  shelf_location?: string;
}

export interface MemberItem {
  id: string;
  member_code: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  joined_at: string;
  status: 'active' | 'suspended' | 'expired';
}

export interface TransactionItem {
  id: string;
  book_id: string;
  member_id: string;
  issued_by: string;
  issue_date: string; // YYYY-MM-DD
  due_date: string; // YYYY-MM-DD
  return_date?: string | null; // YYYY-MM-DD
  status: 'issued' | 'returned' | 'overdue';
  fine_amount: number;
  fine_paid: boolean;
  notes?: string;
}

/**
 * Calculates due date string (YYYY-MM-DD) from issue date and loan period
 */
export function calculateDueDate(issueDateStr: string, loanPeriodDays: number = 14): string {
  const d = new Date(issueDateStr + 'T00:00:00');
  d.setDate(d.getDate() + loanPeriodDays);
  return d.toISOString().split('T')[0];
}

/**
 * Calculates overdue days and fine amount
 */
export function calculateOverdueAndFine(
  dueDateStr: string,
  returnDateStr: string = new Date().toISOString().split('T')[0],
  finePerDay: number = 5
): { overdueDays: number; fineAmount: number } {
  const due = new Date(dueDateStr + 'T00:00:00');
  const ret = new Date(returnDateStr + 'T00:00:00');
  
  const diffTime = ret.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const overdueDays = Math.max(0, diffDays);
  const fineAmount = overdueDays * finePerDay;
  
  return { overdueDays, fineAmount };
}

/**
 * Checks if a book can be issued to a member based on library policies
 */
export function canIssueBook(
  member: MemberItem,
  book: BookItem,
  memberActiveTransactions: TransactionItem[],
  settings: SystemSettings,
  memberUnpaidFines: number = 0
): { allowed: boolean; reason?: string } {
  if (member.status !== 'active') {
    return { allowed: false, reason: `Member status is '${member.status}'. Only active members can borrow books.` };
  }

  if (book.available_copies <= 0) {
    return { allowed: false, reason: `No available copies left for "${book.title}". All copies are currently checked out.` };
  }

  if (memberActiveTransactions.length >= settings.max_books_per_member) {
    return {
      allowed: false,
      reason: `Member has reached the limit of ${settings.max_books_per_member} borrowed books (Currently holding ${memberActiveTransactions.length}).`,
    };
  }

  if (memberUnpaidFines > 0) {
    return {
      allowed: false,
      reason: `Member has pending unpaid fines of ₹${memberUnpaidFines}. Fines must be cleared before issuing new books.`,
    };
  }

  const alreadyHolding = memberActiveTransactions.some((t) => t.book_id === book.id && t.status !== 'returned');
  if (alreadyHolding) {
    return { allowed: false, reason: `Member already holds an active copy of "${book.title}".` };
  }

  return { allowed: true };
}

/**
 * Calculates dashboard Key Performance Indicators
 */
export function calculateKPIs(
  books: BookItem[],
  members: MemberItem[],
  transactions: TransactionItem[],
  settings: SystemSettings,
  todayStr: string = new Date().toISOString().split('T')[0]
) {
  const totalBooksCount = books.reduce((acc, b) => acc + (b.total_copies || 0), 0);
  const availableBooksCount = books.reduce((acc, b) => acc + (b.available_copies || 0), 0);
  const issuedBooksCount = totalBooksCount - availableBooksCount;

  const activeMembersCount = members.filter((m) => m.status === 'active').length;

  let issuedTodayCount = 0;
  let returnsTodayCount = 0;
  let overdueCount = 0;
  let finesCollectedToday = 0;
  let totalFinesPending = 0;

  for (const t of transactions) {
    if (t.issue_date === todayStr) {
      issuedTodayCount++;
    }
    if (t.return_date === todayStr) {
      returnsTodayCount++;
      if (t.fine_paid && t.fine_amount > 0) {
        finesCollectedToday += t.fine_amount;
      }
    }
    if (t.status === 'issued') {
      const { overdueDays } = calculateOverdueAndFine(t.due_date, todayStr, settings.fine_per_day);
      if (overdueDays > 0) {
        overdueCount++;
      }
    }
    if (!t.fine_paid && t.fine_amount > 0) {
      totalFinesPending += t.fine_amount;
    }
  }

  return {
    totalBooksCount,
    availableBooksCount,
    issuedBooksCount,
    activeMembersCount,
    issuedTodayCount,
    returnsTodayCount,
    overdueCount,
    finesCollectedToday,
    totalFinesPending,
  };
}
