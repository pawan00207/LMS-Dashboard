import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookUp, BookDown, IndianRupee, ShieldAlert, Sparkles } from 'lucide-react';
import { useLibraryData } from '../../context/LibraryDataContext';

export const LiveActivityFeed: React.FC = () => {
  const { transactions, books, members } = useLibraryData();

  // Sort recent transactions descending
  const recentActivities = React.useMemo(() => {
    return transactions.slice(0, 15).map((tx) => {
      const book = books.find((b) => b.id === tx.book_id);
      const member = members.find((m) => m.id === tx.member_id);

      const isReturn = tx.status === 'returned';
      const isFine = tx.fine_amount > 0;

      return {
        id: tx.id,
        isReturn,
        isFine,
        fineAmount: tx.fine_amount,
        finePaid: tx.fine_paid,
        bookTitle: book?.title || 'Unknown Title',
        memberName: member?.name || 'Reader',
        memberCode: member?.member_code || 'MEM',
        date: isReturn ? (tx.return_date || tx.issue_date) : tx.issue_date,
        type: isReturn ? 'return' : 'issue',
      };
    });
  }, [transactions, books, members]);

  return (
    <div className="p-5 rounded-xl bg-white/80 dark:bg-[#161C19]/90 border border-stone-200/90 dark:border-stone-800 shadow-2xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800/80 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C8962E]" />
          <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
            Live Circulation Stream
          </h3>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
          Realtime
        </span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[360px] space-y-2 pr-1">
        <AnimatePresence initial={false}>
          {recentActivities.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -16, backgroundColor: 'rgba(200, 150, 46, 0.15)' }}
              animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="p-2.5 rounded-lg border border-stone-100 dark:border-stone-850 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors flex items-start gap-3 text-xs"
            >
              <div
                className={`w-7 h-7 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                  item.type === 'issue'
                    ? 'bg-[#12372A]/10 dark:bg-emerald-950/60 text-[#12372A] dark:text-emerald-400'
                    : 'bg-[#C8962E]/10 dark:bg-amber-950/60 text-[#C8962E]'
                }`}
              >
                {item.type === 'issue' ? (
                  <BookUp className="w-3.5 h-3.5" />
                ) : (
                  <BookDown className="w-3.5 h-3.5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-stone-900 dark:text-stone-100 leading-snug">
                  <span className="font-medium">{item.memberName}</span>{' '}
                  <span className="text-stone-500 font-mono text-[11px]">
                    ({item.type === 'issue' ? 'borrowed' : 'returned'})
                  </span>{' '}
                  <span className="font-serif italic text-stone-800 dark:text-stone-200">
                    &ldquo;{item.bookTitle}&rdquo;
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-stone-500">
                  <span>{item.date}</span>
                  {item.isFine && (
                    <span
                      className={`px-1.5 py-0.2 rounded font-medium ${
                        item.finePaid
                          ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50'
                          : 'text-rose-700 bg-rose-50 dark:bg-rose-950/50'
                      }`}
                    >
                      Fine: ₹{item.fineAmount} ({item.finePaid ? 'Paid' : 'Unpaid'})
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
