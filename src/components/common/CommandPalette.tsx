import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Book as BookIcon, User, PlusCircle, ArrowRight, X } from 'lucide-react';
import { useLibraryData } from '../../context/LibraryDataContext';
import { useAuth } from '../../context/AuthContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionKey: string, payload?: any) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { books, members } = useLibraryData();
  const { role, navigate } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter items
  const cleanQuery = query.trim().toLowerCase();

  const matchingBooks = cleanQuery
    ? books
        .filter(
          (b) =>
            b.title.toLowerCase().includes(cleanQuery) ||
            b.author.toLowerCase().includes(cleanQuery) ||
            b.isbn.toLowerCase().includes(cleanQuery) ||
            b.category.toLowerCase().includes(cleanQuery) ||
            b.shelf_location.toLowerCase().includes(cleanQuery)
        )
        .slice(0, 5)
    : books.slice(0, 3);

  const matchingMembers = cleanQuery && role !== 'member'
    ? members
        .filter(
          (m) =>
            m.name.toLowerCase().includes(cleanQuery) ||
            m.member_code.toLowerCase().includes(cleanQuery) ||
            m.email.toLowerCase().includes(cleanQuery)
        )
        .slice(0, 4)
    : [];

  const actions = [
    { id: 'about_founder', title: 'About Founder: Yashita Saini (Contact, Email & LinkedIn)', category: 'Institutional Info', role: 'all' },
    ...(role !== 'member'
      ? [
          { id: 'issue_book', title: 'Issue Book to Member', category: 'Circulation', role: 'staff' },
          { id: 'return_book', title: 'Process Book Return', category: 'Circulation', role: 'staff' },
          { id: 'add_book', title: 'Add New Title to Catalog', category: 'Inventory', role: 'staff' },
          { id: 'register_member', title: 'Register New Library Member', category: 'Membership', role: 'staff' },
          { id: 'view_reports', title: 'View Circulation & Fines Reports', category: 'Analytics', role: 'staff' },
        ]
      : [
          { id: 'browse_catalog', title: 'Explore Full Book Catalog', category: 'Navigation', role: 'member' },
          { id: 'my_loans', title: 'View My Borrowed Books & Due Dates', category: 'My Account', role: 'member' },
        ]),
    ...(role === 'admin'
      ? [
          { id: 'settings', title: 'System Parameters & Loan Policies', category: 'Administration', role: 'admin' },
          { id: 'audit_logs', title: 'View Security Audit Trail', category: 'Administration', role: 'admin' },
          { id: 'staff_mgmt', title: 'Manage Librarian Credentials', category: 'Administration', role: 'admin' },
        ]
      : []),
  ].filter((a) => !cleanQuery || a.title.toLowerCase().includes(cleanQuery));

  const totalItems = matchingBooks.length + matchingMembers.length + actions.length;

  const handleSelect = (type: 'book' | 'member' | 'action', item: any) => {
    onClose();
    if (type === 'action') {
      if (item.id === 'about_founder') onSelectAction('open_about_founder');
      else if (item.id === 'issue_book') onSelectAction('open_issue_modal');
      else if (item.id === 'return_book') onSelectAction('open_return_modal');
      else if (item.id === 'add_book') onSelectAction('open_add_book');
      else if (item.id === 'register_member') onSelectAction('open_add_member');
      else if (item.id === 'view_reports') navigate(`/${role}/reports`);
      else if (item.id === 'settings') navigate('/admin/settings');
      else if (item.id === 'audit_logs') navigate('/admin/audit');
      else if (item.id === 'staff_mgmt') navigate('/admin/librarians');
      else if (item.id === 'browse_catalog') navigate('/member/catalog');
      else if (item.id === 'my_loans') navigate('/member/portal');
    } else if (type === 'book') {
      onSelectAction('view_book', item);
    } else if (type === 'member') {
      onSelectAction('view_member', item);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          className="relative w-full max-w-2xl bg-[#FCFAF6] dark:bg-[#161C19] border border-stone-300 dark:border-stone-800 rounded-lg shadow-2xl overflow-hidden z-10"
        >
          {/* Input Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-stone-200 dark:border-stone-800 gap-3">
            <Search className="w-5 h-5 text-stone-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books, authors, ISBN, members, or circulation actions..."
              className="w-full bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-stone-400 border border-stone-200 dark:border-stone-800 rounded bg-stone-100 dark:bg-stone-900">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-stone-100 dark:divide-stone-850">
            {totalItems === 0 ? (
              <div className="py-12 text-center text-sm text-stone-500">
                No matching catalog records, members, or system actions found for &ldquo;{query}&rdquo;.
              </div>
            ) : null}

            {/* Quick Actions */}
            {actions.length > 0 && (
              <div className="py-1.5">
                <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-stone-400">
                  Quick Actions
                </div>
                {actions.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => handleSelect('action', act)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors text-stone-800 dark:text-stone-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <PlusCircle className="w-4 h-4 text-[#C8962E]" />
                      <span>{act.title}</span>
                    </div>
                    <span className="text-xs font-mono text-stone-400">{act.category}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Books */}
            {matchingBooks.length > 0 && (
              <div className="py-1.5">
                <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-stone-400">
                  Catalogue Matches
                </div>
                {matchingBooks.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleSelect('book', b)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <BookIcon className="w-4 h-4 text-[#12372A] dark:text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <div className="font-serif font-medium text-stone-900 dark:text-stone-100 truncate">
                          {b.title}
                        </div>
                        <div className="text-xs text-stone-500 truncate">
                          {b.author} · <span className="font-mono">{b.isbn}</span> · Loc: {b.shelf_location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span
                        className={`text-xs font-mono font-medium ${
                          b.available_copies > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'
                        }`}
                      >
                        {b.available_copies} / {b.total_copies} available
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Members */}
            {matchingMembers.length > 0 && (
              <div className="py-1.5">
                <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-stone-400">
                  Registered Members
                </div>
                {matchingMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelect('member', m)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <User className="w-4 h-4 text-stone-500 shrink-0" />
                      <div className="truncate">
                        <div className="font-medium text-stone-900 dark:text-stone-100 truncate">
                          {m.name}
                        </div>
                        <div className="text-xs text-stone-500 truncate">
                          <span className="font-mono">{m.member_code}</span> · {m.email}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded capitalize ${
                        m.status === 'active'
                          ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40'
                          : 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40'
                      }`}
                    >
                      {m.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-stone-100/70 dark:bg-stone-900/60 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500 font-mono">
            <span>Navigation: ↑↓ Enter</span>
            <span>The Alexandria Library Realtime Index</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
