import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookMarked, Heart, Mail, Key, ArrowRight, AlertTriangle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface MemberLoginPageProps {
  onOpenAbout?: () => void;
}

export const MemberLoginPage: React.FC<MemberLoginPageProps> = ({ onOpenAbout }) => {
  const { login, navigate } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await login(email, password, 'member');
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Authentication failed');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleFillDemo = () => {
    setEmail('member@alexandria.lib');
    setPassword('MemberPass123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#242E28] flex flex-col justify-between selection:bg-[#C8962E]/25 selection:text-[#12372A]">
      {/* Top bar */}
      <header className="px-8 py-5 border-b border-[#EAE3D8] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#12372A] flex items-center justify-center text-[#C8962E] font-serif font-bold text-sm shadow-xs">
            A
          </div>
          <div>
            <span className="font-serif tracking-tight text-[#12372A] font-medium text-sm block">
              The Alexandria Library
            </span>
            <span className="text-[10px] font-mono tracking-widest text-emerald-800 uppercase">
              Reader&apos;s Sanctuary &amp; Catalog
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-stone-400">Library Staff:</span>
          <button
            onClick={() => navigate('/librarian/login')}
            className="text-stone-600 hover:text-[#12372A] font-medium transition-colors cursor-pointer"
          >
            Librarian Desk →
          </button>
          <button
            onClick={() => navigate('/admin/login')}
            className="text-stone-600 hover:text-stone-900 font-medium transition-colors cursor-pointer"
          >
            Admin Room →
          </button>
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-[#E4DBD0] bg-white shadow-xl">
          {/* Left panel: Sunlit reading room illustration */}
          <div className="lg:col-span-6 relative hidden lg:flex flex-col justify-between p-8 bg-[#3E342B] overflow-hidden">
            <img
              src="/src/assets/images/login_member_reading_1793601877510.jpg"
              alt="Cozy sunlit library armchair reading nook"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#251D17]/85 via-[#251D17]/25 to-transparent" />

            <div className="relative z-10 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#12372A] text-xs font-medium shadow-xs flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5 text-[#C8962E]" />
                <span>MEMBER PORTAL</span>
              </span>
            </div>

            <div className="relative z-10 text-white space-y-2">
              <h2 className="font-serif text-3xl font-normal leading-snug">
                Welcome back to your quiet corner.
              </h2>
              <p className="text-xs text-stone-200 leading-relaxed max-w-sm">
                Track borrowed volumes, check upcoming due dates, explore new arrivals, and keep reading without interruptions.
              </p>
              <div className="pt-2 text-[10px] font-mono text-amber-200/80">
                ACTIVE READER REGISTRY · CARD ID: MEM-1001
              </div>
            </div>
          </div>

          {/* Right form panel */}
          <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-center bg-[#FAF8F5]">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-6">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#C8962E] mb-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Reader Access</span>
                </div>
                <h1 className="font-serif text-2xl md:text-3xl font-medium text-[#12372A]">
                  Sign into Your Reading Account
                </h1>
                <p className="text-xs text-stone-600 mt-1">
                  Enter your member credentials or registered email to view your books.
                </p>
              </div>

              {/* Demo Account Quick-Fill */}
              <div className="mb-6 p-3.5 rounded-xl bg-[#F0EAE1] border border-[#DDD3C6] text-xs">
                <div className="flex items-center justify-between">
                  <div className="text-stone-800">
                    <span className="text-[#12372A] font-semibold">Demo Member:</span>{' '}
                    <span className="font-mono">member@alexandria.lib</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="px-2.5 py-1 bg-[#12372A] hover:bg-[#1C4E3C] text-amber-200 font-mono text-[11px] rounded transition-colors cursor-pointer"
                  >
                    Auto Fill
                  </button>
                </div>
                <div className="text-[11px] text-stone-600 font-mono mt-1">
                  Reader: Eleanor Vance (MEM-1001) · Pass: MemberPass123!
                </div>
              </div>

              {/* Error notice */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{error}</div>
                </motion.div>
              )}

              {/* Form */}
              <motion.form
                animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                transition={{ duration: 0.4 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-1.5">
                    Member Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. member@alexandria.lib"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D8CEBF] rounded-lg text-sm text-[#1A2621] placeholder:text-stone-400 focus:outline-none focus:border-[#12372A] focus:ring-1 focus:ring-[#12372A] transition-colors shadow-2xs"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-stone-600">
                      Member Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotOpen(true)}
                      className="text-xs text-[#C8962E] hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D8CEBF] rounded-lg text-sm text-[#1A2621] placeholder:text-stone-400 focus:outline-none focus:border-[#12372A] focus:ring-1 focus:ring-[#12372A] transition-colors shadow-2xs"
                    />
                    <Key className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 bg-[#12372A] hover:bg-[#1A4D3B] text-white font-mono text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isLoading ? 'Accessing Bookshelf...' : 'Open Reader Account'}</span>
                  <ArrowRight className="w-4 h-4 text-[#C8962E]" />
                </button>
              </motion.form>

              <div className="mt-6 text-center text-xs text-stone-500 font-mono">
                Staff member?{' '}
                <button
                  onClick={() => navigate('/librarian/login')}
                  className="text-[#12372A] hover:underline font-medium cursor-pointer"
                >
                  Log into Circulation Desk
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-[#EAE3D8] text-center text-[11px] font-mono text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>The Alexandria Library System · Dedicated to Lifelong Learning</span>
        {onOpenAbout && (
          <button
            onClick={onOpenAbout}
            className="text-[#12372A] hover:underline font-medium cursor-pointer"
          >
            Founder: Yashita Saini (About &amp; Contact)
          </button>
        )}
      </footer>

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        defaultEmail={email}
      />
    </div>
  );
};
