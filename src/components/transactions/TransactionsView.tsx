import React, { useState, useMemo } from 'react';
import { Search, Filter, RotateCcw, Check, DollarSign, Calendar, IndianRupee } from 'lucide-react';
import { useLibraryData } from '../../context/LibraryDataContext';
import { calculateOverdueAndFine } from '../../utils/libraryRules';

interface TransactionsViewProps {
  onProcessReturn?: (transactionId: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onProcessReturn }) => {
  const { transactions, books, members, settings, payFine } = useLibraryData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'issued' | 'returned' | 'overdue'>('all');
  const [finesOnly, setFinesOnly] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filtered transactions
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return transactions.filter((tx) => {
      const book = books.find((b) => b.id === tx.book_id);
      const member = members.find((m) => m.id === tx.member_id);

      const matchesSearch =
        !q ||
        tx.id.toLowerCase().includes(q) ||
        book?.title.toLowerCase().includes(q) ||
        member?.name.toLowerCase().includes(q) ||
        member?.member_code.toLowerCase().includes(q);

      const { overdueDays } = calculateOverdueAndFine(tx.due_date, todayStr, settings.fine_per_day);
      const isActuallyOverdue = tx.status === 'issued' && overdueDays > 0;

      let matchesStatus = true;
      if (statusFilter === 'issued') matchesStatus = tx.status === 'issued' && !isActuallyOverdue;
      else if (statusFilter === 'returned') matchesStatus = tx.status === 'returned';
      else if (statusFilter === 'overdue') matchesStatus = isActuallyOverdue;

      const matchesFines = !finesOnly || tx.fine_amount > 0;

      return matchesSearch && matchesStatus && matchesFines;
    });
  }, [transactions, books, members, search, statusFilter, finesOnly, todayStr, settings]);

  const handlePay = async (txId: string) => {
    await payFine(txId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-stone-850">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-medium text-stone-900 dark:text-stone-100">
            Circulation Ledger
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Full chronological record of {transactions.length} lending events, returns, and fine settlements
          </p>
        </div>

        {/* Fines toggle */}
        <label className="flex items-center gap-2 text-xs font-mono text-stone-700 dark:text-stone-300 cursor-pointer bg-white/70 dark:bg-stone-900/70 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-800">
          <input
            type="checkbox"
            checked={finesOnly}
            onChange={(e) => setFinesOnly(e.target.checked)}
            className="rounded border-stone-400 text-[#12372A]"
          />
          <span>Fines Accrued Only</span>
        </label>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by transaction ID, book title, borrower name, or member code..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white/90 dark:bg-stone-900/90 border border-stone-300 dark:border-stone-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C8962E] text-stone-900 dark:text-stone-100"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center p-1 bg-stone-200/60 dark:bg-stone-800/60 rounded-lg text-xs font-mono shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-semibold'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            All Loans
          </button>
          <button
            onClick={() => setStatusFilter('issued')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              statusFilter === 'issued'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-semibold'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('returned')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              statusFilter === 'returned'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-semibold'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            Returned
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              statusFilter === 'overdue'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-semibold'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            Overdue
          </button>
        </div>
      </div>

      {/* Table view */}
      <div className="rounded-xl border border-stone-200/90 dark:border-stone-800 bg-white/80 dark:bg-[#161C19]/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-stone-100/70 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 text-[11px] uppercase tracking-wider text-stone-500">
              <tr>
                <th className="py-3 px-4">TX ID</th>
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Borrower</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Return Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Fine Accrued</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-500 font-mono">
                    No matching circulation transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const book = books.find((b) => b.id === tx.book_id);
                  const member = members.find((m) => m.id === tx.member_id);

                  const { overdueDays, fineAmount } = calculateOverdueAndFine(
                    tx.due_date,
                    todayStr,
                    settings.fine_per_day
                  );
                  const isOverdue = tx.status === 'issued' && overdueDays > 0;
                  const currentFine = tx.status === 'returned' ? tx.fine_amount : (isOverdue ? fineAmount : 0);

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-stone-800 dark:text-stone-200">
                        {tx.id}
                      </td>
                      <td className="py-3 px-4 font-serif text-sm font-medium text-stone-900 dark:text-stone-100 max-w-[200px] truncate">
                        {book?.title || 'Unknown Title'}
                      </td>
                      <td className="py-3 px-4 truncate">
                        <span className="font-sans font-medium text-stone-800 dark:text-stone-200 block">
                          {member?.name || 'Reader'}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {member?.member_code}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                        {tx.issue_date}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={
                            isOverdue
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : 'text-stone-600 dark:text-stone-400'
                          }
                        >
                          {tx.due_date}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                        {tx.return_date || '—'}
                      </td>
                      <td className="py-3 px-4">
                        {tx.status === 'returned' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300">
                            Returned
                          </span>
                        ) : isOverdue ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-rose-800 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300">
                            {overdueDays}d Late
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-amber-800 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300">
                            Active Loan
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {currentFine > 0 ? (
                          <div>
                            <span className="font-bold text-rose-600 dark:text-rose-400">
                              ₹{currentFine}
                            </span>
                            <span className="text-[10px] text-stone-400 ml-1">
                              ({tx.fine_paid ? 'Paid' : 'Unpaid'})
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-400">₹0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {tx.status === 'issued' && onProcessReturn && (
                            <button
                              onClick={() => onProcessReturn(tx.id)}
                              className="px-2.5 py-1 bg-[#12372A] hover:bg-[#1A4D3B] text-white text-[11px] rounded transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3 text-[#C8962E]" />
                              <span>Return</span>
                            </button>
                          )}
                          {!tx.fine_paid && tx.fine_amount > 0 && (
                            <button
                              onClick={() => handlePay(tx.id)}
                              className="px-2.5 py-1 bg-[#C8962E] hover:bg-[#B38324] text-white text-[11px] rounded transition-colors cursor-pointer"
                            >
                              Collect ₹{tx.fine_amount}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
