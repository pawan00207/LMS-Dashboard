import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Repeat,
  Receipt,
  FileBarChart,
  ShieldAlert,
  Sliders,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookUp,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onOpenIssue: () => void;
  onOpenReturn: () => void;
  onOpenAbout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenIssue, onOpenReturn, onOpenAbout }) => {
  const { role, currentPath, navigate, logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getNavItems = () => {
    if (role === 'admin') {
      return [
        { label: 'Realtime Overview', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Books Catalog', path: '/admin/books', icon: BookOpen },
        { label: 'Reader Members', path: '/admin/members', icon: Users },
        { label: 'Circulation Ledger', path: '/admin/transactions', icon: Receipt },
        { label: 'Librarian Staff', path: '/admin/librarians', icon: Users },
        { label: 'Audits & Reports', path: '/admin/reports', icon: FileBarChart },
        { label: 'Audit Trail', path: '/admin/audit', icon: ShieldAlert },
        { label: 'System Settings', path: '/admin/settings', icon: Sliders },
      ];
    }
    if (role === 'librarian') {
      return [
        { label: 'Circulation Desk', path: '/librarian/dashboard', icon: LayoutDashboard },
        { label: 'Books Catalog', path: '/librarian/books', icon: BookOpen },
        { label: 'Reader Members', path: '/librarian/members', icon: Users },
        { label: 'Ledger & Fines', path: '/librarian/transactions', icon: Receipt },
        { label: 'Audits & Reports', path: '/librarian/reports', icon: FileBarChart },
      ];
    }
    // Member
    return [
      { label: 'My Reading Room', path: '/member/portal', icon: LayoutDashboard },
      { label: 'Browse Holdings', path: '/member/catalog', icon: BookOpen },
      { label: 'Borrowing History', path: '/member/history', icon: Receipt },
    ];
  };

  const navItems = getNavItems();

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 76 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="hidden md:flex flex-col justify-between shrink-0 h-[calc(100vh-57px)] sticky top-[57px] bg-[#FAF7F2] dark:bg-[#141A17] border-r border-stone-200/80 dark:border-stone-850 p-3 select-none z-30"
    >
      <div>
        {/* Collapse toggle */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-stone-200/60 dark:border-stone-800">
          {!isCollapsed && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500">
              {role === 'admin' ? 'Admin Portal' : role === 'librarian' ? 'Circulation' : 'Reader Portal'}
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors ml-auto cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick action buttons for Staff */}
        {role !== 'member' && (
          <div className="mb-4 space-y-1.5">
            <button
              onClick={onOpenIssue}
              className={`w-full py-2 bg-[#12372A] hover:bg-[#1A4D3B] text-white rounded-lg text-xs font-mono transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                isCollapsed ? 'px-2' : 'px-3'
              }`}
              title="Issue Book"
            >
              <BookUp className="w-4 h-4 text-[#C8962E] shrink-0" />
              {!isCollapsed && <span className="font-medium">Issue Book</span>}
            </button>

            <button
              onClick={onOpenReturn}
              className={`w-full py-1.5 bg-stone-200/80 dark:bg-stone-800/80 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg text-xs font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                isCollapsed ? 'px-2' : 'px-3'
              }`}
              title="Return Book"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C8962E] shrink-0" />
              {!isCollapsed && <span>Return Book</span>}
            </button>
          </div>
        )}

        {/* Nav Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-colors cursor-pointer group ${
                  isActive
                    ? 'bg-[#12372A] text-white font-medium shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#C8962E]' : 'text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-300'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* About Founder & Profile */}
      <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800 space-y-2">
        {onOpenAbout && (
          <button
            onClick={onOpenAbout}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-mono text-stone-600 dark:text-stone-300 hover:bg-[#C8962E]/10 hover:text-[#C8962E] transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="About Founder: Yashita Saini"
          >
            <Sparkles className="w-4 h-4 text-[#C8962E] shrink-0" />
            {!isCollapsed && <span className="truncate">About Founder</span>}
          </button>
        )}

        {user && (
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-7 h-7 rounded-full bg-[#12372A] text-amber-200 flex items-center justify-center font-serif text-xs font-bold shrink-0">
              {user.full_name[0]}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-stone-900 dark:text-stone-100 truncate">
                  {user.full_name}
                </div>
                <div className="text-[10px] font-mono text-stone-500 uppercase">
                  {user.role}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.aside>
  );
};
