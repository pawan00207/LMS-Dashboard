import React, { useState } from 'react';
import { motion } from 'motion/react';
import librarianLoginImage from '../../assets/images/login_librarian_desk_1793601876370.jpg';
import { BookOpen, Stamp, Mail, Key, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LibrarianLoginPageProps {
  onOpenAbout?: () => void;
}

export const LibrarianLoginPage: React.FC<LibrarianLoginPageProps> = ({ onOpenAbout }) => {
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

    const res = await login(email, password, 'librarian');
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Authentication failed');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleFillDemo = () => {
    setEmail('librarian@alexandria.lib');
    setPassword('LibPass123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#1D2923] flex flex-col justify-between selection:bg-[#C8962E]/25 selection:text-[#12372A] paper-texture">
      {/* Top bar */}
      <header className="px-8 py-5 border-b border-[#E2DAD0] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#12372A] flex items-center justify-center text-[#C8962E] font-serif font-bold text-sm shadow-xs">
            A
          </div>
          <div>
            <span className="font-serif tracking-tight text-[#12372A] font-semibold text-sm block">
              The Alexandria Library
            </span>
            <span className="text-[10px] font-mono tracking-widest text-stone-500 uppercase">
              Circulation Desk &amp; Catalog Management
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-stone-400">Other Portals:</span>
          <button
            onClick={() => navigate('/admin/login')}
            className="text-stone-600 hover:text-[#12372A] font-medium transition-colors cursor-pointer"
          >
            Admin Control Room →
          </button>
          <button
            onClick={() => navigate('/member/login')}
            className="text-stone-600 hover:text-[#C8962E] font-medium transition-colors cursor-pointer"
          >
            Member Reading Room →
          </button>
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-xl overflow-hidden border border-[#D9D0C3] bg-[#FCFAF6] shadow-xl">
          {/* Left panel: Warm Oak & Green Banker's Lamp Illustration */}
          <div className="lg:col-span-6 relative hidden lg:flex flex-col justify-between p-8 bg-[#2A1D13] overflow-hidden">
            <img
              src={librarianLoginImage}
              alt="Librarian Circulation Desk"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A120B]/90 via-[#1A120B]/30 to-transparent" />

            <div className="relative z-10 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#12372A]/90 text-amber-200 text-[11px] font-mono border border-emerald-700/50 flex items-center gap-1.5">
                <Stamp className="w-3.5 h-3.5" />
                <span>OFFICIAL CIRCULATION DESK</span>
              </span>
            </div>

            <div className="relative z-10 text-white space-y-2">
              <h2 className="font-serif text-2xl font-normal leading-snug">
                Where books find their readers.
              </h2>
              <p className="text-xs text-stone-200/90 leading-relaxed max-w-sm">
                Issue and return volumes, register readers, manage shelf inventory, and calculate overdue dues in real-time.
              </p>
              <div className="pt-2 text-[10px] font-mono text-amber-200/70">
                LIBRARIAN LEDGER · DESK SHIFT READY
              </div>
            </div>
          </div>

          {/* Right form panel */}
          <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-[#C8962E] mb-1.5 uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Staff Access</span>
                </div>
                <h1 className="font-serif text-2xl md:text-3xl font-medium text-[#12372A]">
                  Librarian Sign In
                </h1>
                <p className="text-xs text-stone-600 mt-1">
                  Authenticate your library credentials to begin circulation duties.
                </p>
              </div>

              {/* Demo Account Quick-Fill */}
              <div className="mb-6 p-3.5 rounded bg-[#F1EAE0] border border-[#DDD3C4] text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-stone-800">
                    <span className="text-[#C8962E] font-semibold">Demo Librarian:</span>{' '}
                    librarian@alexandria.lib
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="px-2.5 py-1 bg-[#12372A] hover:bg-[#1A4D3B] text-amber-200 font-mono text-[11px] rounded transition-colors cursor-pointer"
                  >
                    Auto Fill
                  </button>
                </div>
                <div className="text-[11px] text-stone-600 font-mono mt-1">
                  Pass: LibPass123! · Full circulation &amp; catalog controls
                </div>
              </div>

              {/* Error notice */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5"
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
                    Librarian Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="librarian@alexandria.lib"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D5CBC0] rounded text-sm text-[#1A2621] placeholder:text-stone-400 focus:outline-none focus:border-[#12372A] focus:ring-1 focus:ring-[#12372A] transition-colors"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-stone-600">
                      Staff Password
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
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D5CBC0] rounded text-sm text-[#1A2621] placeholder:text-stone-400 focus:outline-none focus:border-[#12372A] focus:ring-1 focus:ring-[#12372A] transition-colors"
                    />
                    <Key className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 bg-[#12372A] hover:bg-[#1A4D3B] text-white font-mono text-xs uppercase tracking-wider rounded border border-[#1A4D3B] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isLoading ? 'Opening Register...' : 'Sign In to Circulation Desk'}</span>
                  <ArrowRight className="w-4 h-4 text-[#C8962E]" />
                </button>
              </motion.form>

              <div className="mt-6 text-center text-xs text-stone-500 font-mono">
                Looking for Member Portal?{' '}
                <button
                  onClick={() => navigate('/member/login')}
                  className="text-[#12372A] hover:underline font-medium cursor-pointer"
                >
                  Go to Reader Room
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-[#E2DAD0] text-center text-[11px] font-mono text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>The Alexandria Library System · Dedicated to Preservation &amp; Enlightenment</span>
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
