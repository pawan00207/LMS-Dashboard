import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LiveIndicator } from './LiveIndicator';
import { Search, Moon, Sun, LogOut, Shield, BookOpen, User } from 'lucide-react';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onOpenAbout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette, onOpenAbout }) => {
  const { user, role, logout, currentPath, navigate } = useAuth();
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      localStorage.getItem('alexandria_theme') === 'dark' ||
      document.documentElement.classList.contains('dark')
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('alexandria_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('alexandria_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Nav links based on role
  const getNavLinks = () => {
    if (role === 'admin') {
      return [
        { label: 'Overview', path: '/admin/dashboard' },
        { label: 'Catalogue', path: '/admin/books' },
        { label: 'Members', path: '/admin/members' },
        { label: 'Circulation', path: '/admin/circulation' },
        { label: 'Staff', path: '/admin/librarians' },
        { label: 'Audit', path: '/admin/audit' },
      ];
    }
    if (role === 'librarian') {
      return [
        { label: 'Overview', path: '/librarian/dashboard' },
        { label: 'Catalogue', path: '/librarian/books' },
        { label: 'Members', path: '/librarian/members' },
        { label: 'Circulation', path: '/librarian/circulation' },
        { label: 'Ledger', path: '/librarian/transactions' },
        { label: 'Reports', path: '/librarian/reports' },
      ];
    }
    // Member
    return [
      { label: 'My Books', path: '/member/portal' },
      { label: 'Catalogue', path: '/member/catalog' },
      { label: 'History', path: '/member/history' },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F6F1E7]/90 dark:bg-[#101513]/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-850 px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand title/wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              if (role === 'admin') navigate('/admin/dashboard');
              else if (role === 'librarian') navigate('/librarian/dashboard');
              else navigate('/member/portal');
            }}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded bg-[#12372A] text-[#C8962E] flex items-center justify-center font-serif text-lg font-bold shadow-sm ring-1 ring-[#C8962E]/30">
              A
            </div>
            <div>
              <span className="font-serif text-lg font-semibold tracking-tight text-[#12372A] dark:text-[#E2ECE6] whitespace-nowrap block leading-none">
                The Alexandria
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-stone-500 block mt-0.5">
                Library System
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`whitespace-nowrap transition-colors py-1 cursor-pointer text-xs font-mono uppercase tracking-wider ${
                  isActive
                    ? 'text-[#12372A] dark:text-emerald-400 font-semibold border-b-2 border-[#C8962E]'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action & controls cluster */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Global search trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded text-xs bg-white/70 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors shadow-2xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search catalogue...</span>
            <kbd className="text-[10px] font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-stone-400">
              ⌘K
            </kbd>
          </button>

          {/* Real-time Live indicator */}
          <LiveIndicator />

          {/* About Founder Button */}
          {onOpenAbout && (
            <button
              onClick={onOpenAbout}
              title="About Founder: Yashita Saini"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono border border-[#C8962E]/40 bg-[#C8962E]/10 hover:bg-[#C8962E]/20 text-[#12372A] dark:text-[#C8962E] transition-colors cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8962E]"></span>
              <span>About Founder</span>
            </button>
          )}

          {/* Theme switch */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>

          {/* User profile & Logout */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-stone-200 dark:border-stone-800">
              <div className="hidden lg:block text-right">
                <div className="text-xs font-medium text-stone-900 dark:text-stone-100 truncate max-w-[120px]">
                  {user.full_name}
                </div>
                <div className="text-[10px] font-mono uppercase text-[#C8962E]">
                  {user.role}
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out of library session"
                className="p-1.5 text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
