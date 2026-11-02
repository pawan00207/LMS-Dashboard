import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { RotateCcw, X, CheckCircle2, AlertTriangle, ArrowRight, DollarSign } from 'lucide-react';
import { useLibraryData } from '../../context/LibraryDataContext';
import { calculateOverdueAndFine } from '../../utils/libraryRules';

interface ReturnBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTransactionId?: string;
}

export const ReturnBookModal: React.FC<ReturnBookModalProps> = ({
  isOpen,
  onClose,
  preselectedTransactionId,
}) => {
  const { books, members, transactions, settings, returnBook } = useLibraryData();

  const [selectedTxId, setSelectedTxId] = useState<string>(preselectedTransactionId || '');
  const [search, setSearch] = useState('');
  const [markPaid, setMarkPaid] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (preselectedTransactionId) setSelectedTxId(preselectedTransactionId);
  }, [preselectedTransactionId]);

  // Active issued transactions
  const activeTransactions = useMemo(() => {
    return transactions.filter((t) => t.status === 'issued');
  }, [transactions]);

  const selectedTransaction = useMemo(
    () => activeTransactions.find((t) => t.id === selectedTxId),
    [activeTransactions, selectedTxId]
  );

  const selectedBook = useMemo(
    () => (selectedTransaction ? books.find((b) => b.id === selectedTransaction.book_id) : null),
    [books, selectedTransaction]
  );

  const selectedMember = useMemo(
    () => (selectedTransaction ? members.find((m) => m.id === selectedTransaction.member_id) : null),
    [members, selectedTransaction]
  );

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Fine calculation
  const fineCalculation = useMemo(() => {
    if (!selectedTransaction) return { overdueDays: 0, fineAmount: 0 };
    return calculateOverdueAndFine(selectedTransaction.due_date, todayStr, settings.fine_per_day);
  }, [selectedTransaction, todayStr, settings.fine_per_day]);

  // Filtered transactions for picker
  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeTransactions.slice(0, 10);

    return activeTransactions
      .filter((t) => {
        const b = books.find((x) => x.id === t.book_id);
        const m = members.find((x) => x.id === t.member_id);
        return (
          t.id.toLowerCase().includes(q) ||
          b?.title.toLowerCase().includes(q) ||
          m?.name.toLowerCase().includes(q) ||
          m?.member_code.toLowerCase().includes(q)
        );
      })
      .slice(0, 10);
  }, [activeTransactions, books, members, search]);

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxId) {
      setError('Please select an active transaction to return.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const res = await returnBook({
      transactionId: selectedTxId,
      markFinePaid: markPaid,
      notes: notes.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      try {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#12372A', '#C8962E', '#F6F1E7'],
        });
      } catch {
        // ignore
      }
      onClose();
    } else {
      setError(res.error || 'Failed to process return.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[#FCFAF6] dark:bg-[#18201C] border border-stone-300 dark:border-stone-800 rounded-xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#C8962E]">
                Circulation Desk · Return Desk
              </span>
              <h2 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">
                Process Book Return
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleReturn} className="mt-5 space-y-5">
            {/* Step 1: Select Active Loan */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                Select Active Loan Transaction
              </label>

              {selectedTransaction && selectedBook && selectedMember ? (
                <div className="p-3.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-[#12372A]/10 text-[#12372A] dark:text-emerald-300 flex items-center justify-center font-serif text-lg shrink-0">
                      📚
                    </div>
                    <div>
                      <div className="font-serif font-medium text-sm text-stone-900 dark:text-stone-100">
                        {selectedBook.title}
                      </div>
                      <div className="text-xs text-stone-500 font-mono">
                        Borrower: {selectedMember.name} ({selectedMember.member_code}) · Issued: {selectedTransaction.issue_date} · Due: {selectedTransaction.due_date}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTxId('')}
                    className="text-xs text-[#C8962E] hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by book title, member name, or member code..."
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C8962E] dark:text-stone-100"
                  />
                  <div className="max-h-48 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-850 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-900">
                    {filteredTransactions.length === 0 ? (
                      <div className="p-4 text-center text-xs text-stone-500">
                        No active loans found matching search criteria.
                      </div>
                    ) : (
                      filteredTransactions.map((tx) => {
                        const b = books.find((x) => x.id === tx.book_id);
                        const m = members.find((x) => x.id === tx.member_id);
                        const { overdueDays } = calculateOverdueAndFine(tx.due_date, todayStr, settings.fine_per_day);
                        return (
                          <button
                            key={tx.id}
                            type="button"
                            onClick={() => setSelectedTxId(tx.id)}
                            className="w-full px-3 py-2.5 text-left text-xs flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                          >
                            <div className="truncate mr-3">
                              <span className="font-serif font-medium text-stone-900 dark:text-stone-100">
                                {b?.title || 'Unknown Title'}
                              </span>
                              <div className="text-stone-500 text-[11px] font-mono">
                                {m?.name} ({m?.member_code}) · Due: {tx.due_date}
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              {overdueDays > 0 ? (
                                <span className="font-mono text-[10px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                                  {overdueDays}d Late (₹{overdueDays * settings.fine_per_day})
                                </span>
                              ) : (
                                <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                                  On Schedule
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Overdue and Fine Calculation Box */}
            {selectedTransaction && (
              <div
                className={`p-4 rounded-xl border ${
                  fineCalculation.overdueDays > 0
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                    : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                }`}
              >
                <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase">Original Due Date</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">
                      {selectedTransaction.due_date}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase">Overdue Days</span>
                    <span
                      className={`font-semibold ${
                        fineCalculation.overdueDays > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'
                      }`}
                    >
                      {fineCalculation.overdueDays} Days
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase">
                      Fine Rate (₹{settings.fine_per_day}/day)
                    </span>
                    <span
                      className={`text-base font-bold ${
                        fineCalculation.fineAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'
                      }`}
                    >
                      ₹{fineCalculation.fineAmount}
                    </span>
                  </div>
                </div>

                {fineCalculation.fineAmount > 0 && (
                  <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
                    <span className="text-xs text-amber-900 dark:text-amber-200">
                      Collect ₹{fineCalculation.fineAmount} from reader at desk:
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-medium text-stone-800 dark:text-stone-200">
                      <input
                        type="checkbox"
                        checked={markPaid}
                        onChange={(e) => setMarkPaid(e.target.checked)}
                        className="rounded border-stone-400 text-[#12372A] focus:ring-[#12372A]"
                      />
                      <span>Mark fine paid now</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Return Notes */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                Return Inspection Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Returned in pristine condition, spine intact"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C8962E] dark:text-stone-100"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedTxId}
                className="px-5 py-2.5 bg-[#12372A] hover:bg-[#1A4D3B] text-white font-mono text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Registering Return...' : 'Complete Return'}</span>
                <RotateCcw className="w-3.5 h-3.5 text-[#C8962E]" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
