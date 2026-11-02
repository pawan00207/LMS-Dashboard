import React, { useMemo } from 'react';
import { AlertCircle, RotateCcw, Calendar, Phone } from 'lucide-react';
import { useLibraryData } from '../../context/LibraryDataContext';
import { calculateOverdueAndFine } from '../../utils/libraryRules';

interface OverdueAlertsListProps {
  onProcessReturn: (transactionId: string) => void;
}

export const OverdueAlertsList: React.FC<OverdueAlertsListProps> = ({ onProcessReturn }) => {
  const { transactions, books, members, settings } = useLibraryData();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const overdueItems = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'issued')
      .map((t) => {
        const { overdueDays, fineAmount } = calculateOverdueAndFine(t.due_date, todayStr, settings.fine_per_day);
        const book = books.find((b) => b.id === t.book_id);
        const member = members.find((m) => m.id === t.member_id);
        return {
          transaction: t,
          book,
          member,
          overdueDays,
          fineAmount,
        };
      })
      .filter((item) => item.overdueDays > 0)
      .sort((a, b) => b.overdueDays - a.overdueDays);
  }, [transactions, books, members, settings, todayStr]);

  return (
    <div className="p-5 rounded-xl bg-white/80 dark:bg-[#161C19]/90 border border-stone-200/90 dark:border-stone-800 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800/80 mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#B84034]" />
          <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
            Overdue Loans Register
          </h3>
        </div>
        <span className="text-xs font-mono font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
          {overdueItems.length} Overdue
        </span>
      </div>

      {overdueItems.length === 0 ? (
        <div className="py-8 text-center text-xs text-stone-500 font-mono">
          ✓ All borrowed volumes are currently within their permitted loan period.
        </div>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-stone-850 max-h-72 overflow-y-auto">
          {overdueItems.slice(0, 6).map((item) => (
            <div
              key={item.transaction.id}
              className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-stone-50/60 dark:hover:bg-stone-850/40 px-1 rounded transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="font-serif font-medium text-stone-900 dark:text-stone-100 truncate">
                  {item.book?.title || 'Unknown Title'}
                </div>
                <div className="text-stone-500 text-[11px] font-mono flex items-center gap-2 mt-0.5">
                  <span className="text-stone-800 dark:text-stone-200">{item.member?.name}</span>
                  <span>·</span>
                  <span>{item.member?.member_code}</span>
                  {item.member?.phone && (
                    <>
                      <span>·</span>
                      <span className="text-stone-400">{item.member.phone}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right font-mono">
                  <div className="text-rose-600 dark:text-rose-400 font-bold text-xs">
                    {item.overdueDays} days late
                  </div>
                  <div className="text-[11px] text-stone-500">Fine: ₹{item.fineAmount}</div>
                </div>

                <button
                  onClick={() => onProcessReturn(item.transaction.id)}
                  title="Process return for this overdue volume"
                  className="px-2.5 py-1.5 bg-[#12372A] hover:bg-[#1A4D3B] text-white text-[11px] font-mono rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-[#C8962E]" />
                  <span>Return</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
