import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDueDate,
  calculateOverdueAndFine,
  canIssueBook,
  calculateKPIs,
  BookItem,
  MemberItem,
  TransactionItem,
  SystemSettings
} from './libraryRules';

test('calculateDueDate adds loan period correctly', () => {
  const issueDate = '2026-11-01';
  const dueDate = calculateDueDate(issueDate, 14);
  assert.equal(dueDate, '2026-11-15');
});

test('calculateOverdueAndFine handles on-time return with 0 fine', () => {
  const res = calculateOverdueAndFine('2026-11-15', '2026-11-15', 5);
  assert.equal(res.overdueDays, 0);
  assert.equal(res.fineAmount, 0);

  const resEarly = calculateOverdueAndFine('2026-11-15', '2026-11-10', 5);
  assert.equal(resEarly.overdueDays, 0);
  assert.equal(resEarly.fineAmount, 0);
});

test('calculateOverdueAndFine calculates 4 days late correctly at ₹5/day', () => {
  const res = calculateOverdueAndFine('2026-11-15', '2026-11-19', 5);
  assert.equal(res.overdueDays, 4);
  assert.equal(res.fineAmount, 20);
});

test('canIssueBook blocks inactive members', () => {
  const member: MemberItem = {
    id: 'm1',
    member_code: 'MEM-1001',
    name: 'John Doe',
    email: 'john@example.com',
    joined_at: '2026-01-01',
    status: 'suspended'
  };
  const book: BookItem = {
    id: 'b1',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    category: 'Technology',
    total_copies: 5,
    available_copies: 3
  };
  const settings: SystemSettings = { fine_per_day: 5, loan_period_days: 14, max_books_per_member: 3 };

  const check = canIssueBook(member, book, [], settings, 0);
  assert.equal(check.allowed, false);
  assert.match(check.reason!, /suspended/);
});

test('canIssueBook blocks when no copies are available', () => {
  const member: MemberItem = {
    id: 'm1',
    member_code: 'MEM-1001',
    name: 'John Doe',
    email: 'john@example.com',
    joined_at: '2026-01-01',
    status: 'active'
  };
  const book: BookItem = {
    id: 'b1',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    category: 'Technology',
    total_copies: 5,
    available_copies: 0
  };
  const settings: SystemSettings = { fine_per_day: 5, loan_period_days: 14, max_books_per_member: 3 };

  const check = canIssueBook(member, book, [], settings, 0);
  assert.equal(check.allowed, false);
  assert.match(check.reason!, /No available copies/);
});

test('canIssueBook blocks if member reached maximum loan limit', () => {
  const member: MemberItem = {
    id: 'm1',
    member_code: 'MEM-1001',
    name: 'John Doe',
    email: 'john@example.com',
    joined_at: '2026-01-01',
    status: 'active'
  };
  const book: BookItem = {
    id: 'b1',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    category: 'Technology',
    total_copies: 5,
    available_copies: 2
  };
  const settings: SystemSettings = { fine_per_day: 5, loan_period_days: 14, max_books_per_member: 2 };
  const activeTx: TransactionItem[] = [
    { id: 't1', book_id: 'b2', member_id: 'm1', issued_by: 'u1', issue_date: '2026-10-20', due_date: '2026-11-03', status: 'issued', fine_amount: 0, fine_paid: false },
    { id: 't2', book_id: 'b3', member_id: 'm1', issued_by: 'u1', issue_date: '2026-10-25', due_date: '2026-11-08', status: 'issued', fine_amount: 0, fine_paid: false },
  ];

  const check = canIssueBook(member, book, activeTx, settings, 0);
  assert.equal(check.allowed, false);
  assert.match(check.reason!, /reached the limit of 2/);
});

test('canIssueBook blocks if member has unpaid fines', () => {
  const member: MemberItem = {
    id: 'm1',
    member_code: 'MEM-1001',
    name: 'John Doe',
    email: 'john@example.com',
    joined_at: '2026-01-01',
    status: 'active'
  };
  const book: BookItem = {
    id: 'b1',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    category: 'Technology',
    total_copies: 5,
    available_copies: 2
  };
  const settings: SystemSettings = { fine_per_day: 5, loan_period_days: 14, max_books_per_member: 3 };

  const check = canIssueBook(member, book, [], settings, 45);
  assert.equal(check.allowed, false);
  assert.match(check.reason!, /unpaid fines of ₹45/);
});

test('calculateKPIs aggregates metrics accurately', () => {
  const books: BookItem[] = [
    { id: 'b1', title: 'B1', author: 'A1', isbn: '111', category: 'Fiction', total_copies: 10, available_copies: 7 },
    { id: 'b2', title: 'B2', author: 'A2', isbn: '222', category: 'Science', total_copies: 5, available_copies: 5 },
  ];
  const members: MemberItem[] = [
    { id: 'm1', member_code: 'MEM-1001', name: 'M1', email: 'm1@lib.com', joined_at: '2026-01-01', status: 'active' },
    { id: 'm2', member_code: 'MEM-1002', name: 'M2', email: 'm2@lib.com', joined_at: '2026-01-01', status: 'suspended' },
  ];
  const settings: SystemSettings = { fine_per_day: 5, loan_period_days: 14, max_books_per_member: 3 };
  const transactions: TransactionItem[] = [
    { id: 't1', book_id: 'b1', member_id: 'm1', issued_by: 'u1', issue_date: '2026-11-01', due_date: '2026-11-15', status: 'issued', fine_amount: 0, fine_paid: false },
    { id: 't2', book_id: 'b1', member_id: 'm2', issued_by: 'u1', issue_date: '2026-10-01', due_date: '2026-10-15', status: 'issued', fine_amount: 0, fine_paid: false }, // overdue
  ];

  const kpis = calculateKPIs(books, members, transactions, settings, '2026-11-01');
  assert.equal(kpis.totalBooksCount, 15);
  assert.equal(kpis.availableBooksCount, 12);
  assert.equal(kpis.activeMembersCount, 1);
  assert.equal(kpis.issuedTodayCount, 1);
  assert.equal(kpis.overdueCount, 1);
});
