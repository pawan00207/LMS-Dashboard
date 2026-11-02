import React, { useMemo } from 'react';
import { Award, BookOpen, Users } from 'lucide-react';
import { useLibraryData } from '../../context/LibraryDataContext';

export const TopBooksAndMembers: React.FC = () => {
  const { books, members, transactions } = useLibraryData();

  // Top borrowed books
  const topBooks = useMemo(() => {
    const borrowCounts: Record<string, number> = {};
    transactions.forEach((t) => {
      borrowCounts[t.book_id] = (borrowCounts[t.book_id] || 0) + 1;
    });

    return books
      .map((b) => ({
        ...b,
        borrowCount: borrowCounts[b.id] || 0,
      }))
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 5);
  }, [books, transactions]);

  // Most active members
  const topMembers = useMemo(() => {
    const memberCounts: Record<string, number> = {};
    transactions.forEach((t) => {
      memberCounts[t.member_id] = (memberCounts[t.member_id] || 0) + 1;
    });

    return members
      .map((m) => ({
        ...m,
        borrowCount: memberCounts[m.id] || 0,
      }))
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 5);
  }, [members, transactions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Top Borrowed Titles */}
      <div className="p-5 rounded-xl bg-white/80 dark:bg-[#161C19]/90 border border-stone-200/90 dark:border-stone-800 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800/80 mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#12372A] dark:text-emerald-400" />
            <h3 className="font-serif text-base font-medium text-stone-900 dark:text-stone-100">
              Most Borrowed Volumes
            </h3>
          </div>
          <span className="text-[10px] font-mono uppercase text-stone-400">Circulation Highs</span>
        </div>

        <div className="space-y-3">
          {topBooks.map((book, idx) => (
            <div key={book.id} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded font-mono text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center shrink-0 font-medium">
                  0{idx + 1}
                </span>
                <div className="truncate">
                  <div className="font-serif font-medium text-stone-900 dark:text-stone-100 truncate">
                    {book.title}
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">
                    {book.author} · {book.category}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 font-mono">
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  {book.borrowCount}
                </span>
                <span className="text-stone-400 text-[10px] ml-1">loans</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most Active Readers */}
      <div className="p-5 rounded-xl bg-white/80 dark:bg-[#161C19]/90 border border-stone-200/90 dark:border-stone-800 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800/80 mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#C8962E]" />
            <h3 className="font-serif text-base font-medium text-stone-900 dark:text-stone-100">
              Most Active Readers
            </h3>
          </div>
          <span className="text-[10px] font-mono uppercase text-stone-400">Reader Hall</span>
        </div>

        <div className="space-y-3">
          {topMembers.map((member, idx) => (
            <div key={member.id} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-full bg-[#12372A] text-amber-200 flex items-center justify-center font-serif text-xs shrink-0 font-semibold">
                  {member.name[0]}
                </div>
                <div className="truncate">
                  <div className="font-medium text-stone-900 dark:text-stone-100 truncate">
                    {member.name}
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono truncate">
                    {member.member_code} · Joined {member.joined_at}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 font-mono">
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  {member.borrowCount}
                </span>
                <span className="text-stone-400 text-[10px] ml-1">read</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
