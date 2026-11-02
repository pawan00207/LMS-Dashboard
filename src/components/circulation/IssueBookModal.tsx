import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Book as BookIcon, User, Calendar, X, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useLibraryData } from '../../context/LibraryDataContext';
import { calculateDueDate, canIssueBook } from '../../utils/libraryRules';

interface IssueBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBookId?: string;
  preselectedMemberId?: string;
}

export const IssueBookModal: React.FC<IssueBookModalProps> = ({
  isOpen,
  onClose,
  preselectedBookId,
  preselectedMemberId,
}) => {
  const { books, members, transactions, settings, issueBook } = useLibraryData();

  const [selectedBookId, setSelectedBookId] = useState<string>(preselectedBookId || '');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(preselectedMemberId || '');
  const [bookSearch, setBookSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync if preselected props change
  React.useEffect(() => {
    if (preselectedBookId) setSelectedBookId(preselectedBookId);
    if (preselectedMemberId) setSelectedMemberId(preselectedMemberId);
  }, [preselectedBookId, preselectedMemberId]);

  const selectedBook = useMemo(() => books.find((b) => b.id === selectedBookId), [books, selectedBookId]);
  const selectedMember = useMemo(() => members.find((m) => m.id === selectedMemberId), [members, selectedMemberId]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const calculatedDueDate = useMemo(
    () => calculateDueDate(todayStr, settings.loan_period_days),
    [todayStr, settings.loan_period_days]
  );

  // Filter books and members
  const availableBooks = useMemo(() => {
    const q = bookSearch.trim().toLowerCase();
    return books
      .filter((b) => {
        if (!q) return true;
        return (
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [books, bookSearch]);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    return members
      .filter((m) => {
        if (!q) return true;
        return (
          m.name.toLowerCase().includes(q) ||
          m.member_code.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [members, memberSearch]);

  // Validation status
  const validationCheck = useMemo(() => {
    if (!selectedMember || !selectedBook) return null;
    const activeMemberLoans = transactions.filter(
      (t) => t.member_id === selectedMember.id && t.status !== 'returned'
    );
    const unpaidFines = transactions
      .filter((t) => t.member_id === selectedMember.id && !t.fine_paid && t.fine_amount > 0)
      .reduce((s, t) => s + t.fine_amount, 0);

    return canIssueBook(selectedMember, selectedBook, activeMemberLoans, settings, unpaidFines);
  }, [selectedMember, selectedBook, transactions, settings]);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !selectedMemberId) {
      setError('Please select both a reader and a book to issue.');
      return;
    }

    if (validationCheck && !validationCheck.allowed) {
      setError(validationCheck.reason || 'Cannot issue book due to library policy.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const result = await issueBook({
      bookId: selectedBookId,
      memberId: selectedMemberId,
      customDueDate: calculatedDueDate,
      notes: notes.trim() || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#C8962E', '#12372A', '#EFE9DC'],
        });
      } catch {
        // ignore if confetti blocked
      }
      onClose();
    } else {
      setError(result.error || 'Failed to issue volume.');
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
                Circulation Desk · New Loan
              </span>
              <h2 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">
                Issue Book to Member
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleIssue} className="mt-5 space-y-5">
            {/* Step 1: Member Selector */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                1. Select Reader (Member)
              </label>
              {selectedMember ? (
                <div className="p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#12372A] text-amber-200 flex items-center justify-center font-serif text-sm font-bold">
                      {selectedMember.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                        {selectedMember.name}
                      </div>
                      <div className="text-xs text-stone-500 font-mono">
                        {selectedMember.member_code} · {selectedMember.email} · Status: {selectedMember.status}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMemberId('')}
                    className="text-xs text-[#C8962E] hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search by reader name, member code (e.g. MEM-1001), or email..."
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C8962E] dark:text-stone-100"
                  />
                  <div className="max-h-36 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-850 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-900">
                    {filteredMembers.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMemberId(m.id)}
                        className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                      >
                        <div>
                          <span className="font-medium text-stone-900 dark:text-stone-100">{m.name}</span>
                          <span className="text-stone-500 ml-2 font-mono">({m.member_code})</span>
                        </div>
                        <span
                          className={`font-mono text-[10px] capitalize px-1.5 py-0.5 rounded ${
                            m.status === 'active'
                              ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40'
                              : 'text-rose-700 bg-rose-50 dark:bg-rose-950/40'
                          }`}
                        >
                          {m.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Book Selector */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                2. Select Title (Catalogue)
              </label>
              {selectedBook ? (
                <div className="p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-12 rounded bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-600 font-serif text-sm shrink-0 border border-stone-300 dark:border-stone-700">
                      📖
                    </div>
                    <div>
                      <div className="text-sm font-medium text-stone-900 dark:text-stone-100 font-serif">
                        {selectedBook.title}
                      </div>
                      <div className="text-xs text-stone-500 font-mono">
                        {selectedBook.author} · Loc: {selectedBook.shelf_location} ·{' '}
                        <span
                          className={
                            selectedBook.available_copies > 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600'
                          }
                        >
                          {selectedBook.available_copies} of {selectedBook.total_copies} available
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBookId('')}
                    className="text-xs text-[#C8962E] hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    placeholder="Search by title, author, category, or ISBN..."
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C8962E] dark:text-stone-100"
                  />
                  <div className="max-h-36 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-850 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-900">
                    {availableBooks.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBookId(b.id)}
                        className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                      >
                        <div className="truncate mr-2">
                          <span className="font-serif font-medium text-stone-900 dark:text-stone-100">
                            {b.title}
                          </span>
                          <span className="text-stone-500 ml-2">by {b.author}</span>
                        </div>
                        <span
                          className={`font-mono text-[10px] shrink-0 font-medium ${
                            b.available_copies > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'
                          }`}
                        >
                          {b.available_copies} available
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Loan parameters summary */}
            <div className="p-3.5 bg-stone-100/70 dark:bg-stone-900/60 rounded-lg border border-stone-200 dark:border-stone-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Issue Date</span>
                <span className="text-stone-900 dark:text-stone-100 font-medium">{todayStr}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Loan Period</span>
                <span className="text-stone-900 dark:text-stone-100 font-medium">
                  {settings.loan_period_days} Days
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Calculated Due Date</span>
                <span className="text-[#C8962E] font-medium">{calculatedDueDate}</span>
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                Circulation Note (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Reference section checkout, special course reserve"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C8962E] dark:text-stone-100"
              />
            </div>

            {/* Validation Feedback & Restrictions */}
            {validationCheck && !validationCheck.allowed && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Issue Blocked by Policy:</span>
                  <span>{validationCheck.reason}</span>
                </div>
              </div>
            )}

            {validationCheck && validationCheck.allowed && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Reader is eligible. Copy available and all lending invariants verified.</span>
              </div>
            )}

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
                disabled={isSubmitting || (validationCheck ? !validationCheck.allowed : false)}
                className="px-5 py-2.5 bg-[#12372A] hover:bg-[#1A4D3B] text-white font-mono text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Recording Loan...' : 'Confirm Book Issue'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C8962E]" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
