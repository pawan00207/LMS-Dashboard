import React, { useState } from 'react';
import { motion } from 'motion/react';
import adminLoginImage from '../../assets/images/login_admin_vault_1793601877790.jpg';
import { Shield, Lock, Mail, ArrowRight, AlertTriangle, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface AdminLoginPageProps {
  onOpenAbout?: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onOpenAbout }) => {
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

    const res = await login(email, password, 'admin');
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Authentication failed');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@alexandria.lib');
    setPassword('AdminPass123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0D110F] text-[#E0EBE4] flex flex-col justify-between selection:bg-[#C8962E]/30 selection:text-white">
      {/* Top minimal bar */}
      <header className="px-8 py-5 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#162B22] border border-[#C8962E]/40 flex items-center justify-center text-[#C8962E] font-serif font-bold text-sm">
            A
          </div>
          <div>
            <span className="font-serif tracking-tight text-white font-medium text-sm block">
              The Alexandria Library
            </span>
            <span className="text-[10px] font-mono tracking-widest text-emerald-500 uppercase">
              Administrative Terminal // Restricted Access
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-stone-500">Other Portals:</span>
          <button
            onClick={() => navigate('/librarian/login')}
            className="text-stone-400 hover:text-[#C8962E] transition-colors cursor-pointer"
          >
            Librarian Desk →
          </button>
          <button
            onClick={() => navigate('/member/login')}
            className="text-stone-400 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Member Portal →
          </button>
        </div>
      </header>

      {/* Main split container */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-xl overflow-hidden border border-stone-800/90 bg-[#141A17] shadow-2xl">
          {/* Left illustration panel: Vault / Control room */}
          <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-8 bg-stone-900 border-r border-stone-800/80 overflow-hidden">
            <img
              src={adminLoginImage}
              alt="Archival Vault Control Room"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity filter contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E1311] via-[#0E1311]/60 to-transparent" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#1B2721] border border-emerald-800/50 text-[11px] font-mono text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                <span>ROOT CLEARANCE ONLY</span>
              </div>
            </div>

            <div className="relative z-10 space-y-3">
              <h2 className="font-serif text-2xl font-medium text-white leading-snug">
                Archive Supervision &amp; Policy Control
              </h2>
              <p className="text-xs text-stone-400 leading-relaxed">
                Configure global circulation thresholds, fine accruals, staff credentials, and inspect cryptographic audit trails across all branches.
              </p>
              <div className="pt-2 font-mono text-[10px] text-stone-500">
                SEC-ID: 0x48A9 · PROTOCOL V2.4 · REALTIME AUDITED
              </div>
            </div>
          </div>

          {/* Right form panel */}
          <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-[#C8962E] mb-2 uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Administrative Authentication</span>
                </div>
                <h1 className="font-serif text-2xl md:text-3xl font-normal text-white">
                  Access Library Control Room
                </h1>
                <p className="text-xs text-stone-400 mt-1.5">
                  Sign in with registered Administrator credentials.
                </p>
              </div>

              {/* Demo Account Quick-Fill Card */}
              <div className="mb-6 p-3.5 rounded bg-[#1A231F] border border-[#273B31] text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-stone-300">
                    <span className="text-[#C8962E] font-medium">Demo Administrator:</span>{' '}
                    admin@alexandria.lib
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="px-2.5 py-1 bg-[#12372A] hover:bg-[#1C4E3C] text-emerald-300 font-mono text-[11px] rounded transition-colors cursor-pointer"
                  >
                    Auto Fill
                  </button>
                </div>
                <div className="text-[11px] text-stone-400 font-mono mt-1">
                  Pass: AdminPass123! · Full access to staff, settings &amp; audit
                </div>
              </div>

              {/* Error notice */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-3 rounded bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
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
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@alexandria.lib"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#0F1412] border border-stone-700/80 rounded text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-[#C8962E] focus:ring-1 focus:ring-[#C8962E] transition-colors"
                    />
                    <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-stone-400">
                      Security Passphrase
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
                      className="w-full pl-9 pr-3 py-2.5 bg-[#0F1412] border border-stone-700/80 rounded text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-[#C8962E] focus:ring-1 focus:ring-[#C8962E] transition-colors"
                    />
                    <Key className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 bg-[#12372A] hover:bg-[#1A4C3A] text-white font-mono text-xs uppercase tracking-wider rounded border border-[#275342] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isLoading ? 'Verifying Clearance...' : 'Authenticate & Enter Vault'}</span>
                  <ArrowRight className="w-4 h-4 text-[#C8962E]" />
                </button>
              </motion.form>

              <div className="mt-6 text-center text-xs text-stone-500 font-mono">
                Looking for another department?{' '}
                <button
                  onClick={() => navigate('/librarian/login')}
                  className="text-stone-400 hover:text-white underline cursor-pointer"
                >
                  Go to Circulation Desk
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-stone-900 text-center text-[11px] font-mono text-stone-600 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>The Alexandria Library System · Protected under Section 4 Row-Level Security</span>
        {onOpenAbout && (
          <button
            onClick={onOpenAbout}
            className="text-[#C8962E] hover:underline cursor-pointer"
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
