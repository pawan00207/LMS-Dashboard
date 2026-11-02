import React, { useState, useMemo } from 'react';
import { BookOpen, Clock, AlertCircle, CheckCircle2, Search, Calendar, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLibraryData } from '../../context/LibraryDataContext';
import { calculateOverdueAndFine } from '../../utils/libraryRules';
import { BooksCatalogView } from '../books/BooksCatalogView';

export const MemberPortalView: React.FC = () => {
  const { user } = useAuth();
  const { books, transactions, settings, members } = useLibraryData();
  const [activeTab, setActiveTab] = useState<'loans' | 'catalog' | 'history'>('loans');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Find the current member record (by email or id)
  const currentMember = useMemo(() => {
    return members.find(
      (m) => m.email.toLowerCase() === (user?.email?.toLowerCase() || '')
    ) || members[0]; // fallback to Eleanor Vance if demo
  }, [members, user]);

  // Active loans for this member
  const activeLoans = useMemo(() => {
    if (!currentMember) return [];
    return transactions
      .filter((t) => t.member_id === currentMember.id && t.status !== 'returned')
      .map((t) => {
        const book = books.find((b) => b.id === t.book_id);
        const { overdueDays, fineAmount } = calculateOverdueAndFine(t.due_date, todayStr, settings.fine_per_day);
        return {
          transaction: t,
          book,
          overdueDays,
          fineAmount,
        };
      });
  }, [transactions, books, currentMember, todayStr, settings]);

  // Loan history
  const historyLoans = useMemo(() => {
    if (!currentMember) return [];
    return transactions
      .filter((t) => t.member_id === currentMember.id && t.status === 'returned')
      .map((t) => ({
        transaction: t,
        book: books.find((b) => b.id === t.book_id),
      }))
      .sort((a, b) => (b.transaction.return_date || '').localeCompare(a.transaction.return_date || ''));
  }, [transactions, books, currentMember]);

  // Total unpaid fine
  const unpaidFineTotal = useMemo(() => {
    if (!currentMember) return 0;
    return transactions
      .filter((t) => t.member_id === currentMember.id && !t.fine_paid && t.fine_amount > 0)
      .reduce((sum, t) => sum + t.fine_amount, 0);
  }, [transactions, currentMember]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Hero Card */}
      <div className="relative p-6 md:p-8 rounded-2xl bg-[#FCFAF6] dark:bg-[#18201C] border border-stone-200/90 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#C8962E] mb-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reader Account · {currentMember.member_code}</span>
            </div>
            <h1 className="font-serif text-3xl font-medium text-stone-900 dark:text-stone-100">
              Welcome, {currentMember.name}
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-lg leading-relaxed">
              You are currently holding <span className="font-semibold text-stone-900 dark:text-stone-100">{activeLoans.length}</span> of your allowed{' '}
              <span className="font-semibold text-stone-900 dark:text-stone-100">{settings.max_books_per_member}</span> volumes. Keep reading at your pace.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
            <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-center min-w-[100px]">
              <span className="text-[10px] text-stone-400 uppercase block">Active Loans</span>
              <span className="text-xl font-serif font-bold text-[#12372A] dark:text-emerald-400">
                {activeLoans.length}
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-center min-w-[100px]">
              <span className="text-[10px] text-stone-400 uppercase block">Fines Pending</span>
              <span
                className={`text-xl font-serif font-bold ${
                  unpaidFineTotal > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                ₹{unpaidFineTotal}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 text-xs font-mono">
        <button
          onClick={() => setActiveTab('loans')}
          className={`pb-3 px-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'loans'
              ? 'border-[#12372A] dark:border-emerald-400 text-stone-900 dark:text-stone-100 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          My Checked Out Volumes ({activeLoans.length})
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'catalog'
              ? 'border-[#12372A] dark:border-emerald-400 text-stone-900 dark:text-stone-100 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Search Library Holdings
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'history'
              ? 'border-[#12372A] dark:border-emerald-400 text-stone-900 dark:text-stone-100 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Borrowing History ({historyLoans.length})
        </button>
      </div>

      {/* Tab 1: Current Loans */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          {activeLoans.length === 0 ? (
            <div className="py-16 text-center rounded-xl border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 p-8">
              <BookOpen className="w-10 h-10 text-stone-400 mx-auto mb-2 opacity-50" />
              <h3 className="font-serif text-base font-medium text-stone-800 dark:text-stone-200">
                You currently have no books checked out.
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Explore the catalog to discover titles available on library shelves.
              </p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="mt-4 px-4 py-2 bg-[#12372A] text-white text-xs font-mono rounded hover:bg-[#1A4D3B] transition-colors cursor-pointer"
              >
                Browse Available Books
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeLoans.map(({ transaction, book, overdueDays, fineAmount }) => (
                <div
                  key={transaction.id}
                  className="p-5 rounded-xl bg-white/85 dark:bg-[#161C19]/90 border border-stone-200/90 dark:border-stone-800 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-stone-500 mb-2">
                      <span>{book?.category}</span>
                      <span>Loc: {book?.shelf_location}</span>
                    </div>

                    <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100 leading-snug">
                      {book?.title || 'Unknown Title'}
                    </h3>
                    <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                      by {book?.author}
                    </div>

                    <div className="mt-4 p-3 bg-stone-50 dark:bg-stone-900/60 rounded-lg border border-stone-200/60 dark:border-stone-800 text-xs font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Issue Date:</span>
                        <span className="text-stone-800 dark:text-stone-200">{transaction.issue_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Return Deadline:</span>
                        <span className="font-semibold text-stone-900 dark:text-stone-100">
                          {transaction.due_date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-850 flex items-center justify-between">
                    {overdueDays > 0 ? (
                      <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold text-rose-800 bg-rose-50 dark:bg-rose-950/40">
                        {overdueDays} Days Overdue (Fine: ₹{fineAmount})
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded text-xs font-mono font-medium text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40">
                        ✓ On Schedule
                      </span>
                    )}

                    <span className="text-[11px] font-mono text-stone-400">
                      Loan #{transaction.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Catalog View for Member */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <BooksCatalogView />
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div className="rounded-xl border border-stone-200/90 dark:border-stone-800 bg-white/80 dark:bg-[#161C19]/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-stone-100/70 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase text-stone-500">
                <tr>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Return Date</th>
                  <th className="py-3 px-4">Fine Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                {historyLoans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-500">
                      No previous completed loans recorded.
                    </td>
                  </tr>
                ) : (
                  historyLoans.map(({ transaction, book }) => (
                    <tr key={transaction.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                      <td className="py-3 px-4 font-serif text-sm font-medium text-stone-900 dark:text-stone-100">
                        {book?.title || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-400">{book?.author}</td>
                      <td className="py-3 px-4 text-stone-500">{transaction.issue_date}</td>
                      <td className="py-3 px-4 text-stone-700 dark:text-stone-300 font-medium">
                        {transaction.return_date}
                      </td>
                      <td className="py-3 px-4">
                        {transaction.fine_amount > 0 ? (
                          <span className="text-stone-600 font-mono">
                            ₹{transaction.fine_amount} ({transaction.fine_paid ? 'Paid' : 'Unpaid'})
                          </span>
                        ) : (
                          <span className="text-emerald-700 dark:text-emerald-400 font-mono">
                            Returned on time (₹0)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
