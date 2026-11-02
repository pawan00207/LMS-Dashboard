import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    const res = await forgotPassword(email);
    if (res.success) {
      setStatus('success');
      setFeedback(res.message);
    } else {
      setStatus('error');
      setFeedback(res.message);
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
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[#FCFAF6] dark:bg-[#1A221E] border border-stone-300 dark:border-stone-800 rounded-lg p-6 shadow-2xl z-10"
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#C8962E]" />
              <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
                Password Recovery
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {status === 'success' ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-base font-medium text-stone-900 dark:text-stone-100">
                Recovery Dispatch Sent
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed px-4">
                {feedback}
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-[#12372A] text-white text-xs font-mono uppercase tracking-wider rounded hover:bg-[#1A4D3B] transition-colors cursor-pointer"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Enter the email address registered with your Alexandria Library credentials. We will issue a secure reset token.
              </p>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                  Registered Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. member@alexandria.lib"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded focus:outline-none focus:ring-1 focus:ring-[#C8962E] dark:text-stone-100"
                />
              </div>

              {status === 'error' && (
                <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded border border-rose-200 dark:border-rose-900">
                  {feedback}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-4 py-2 bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs font-mono uppercase tracking-wider rounded transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  <span>{status === 'loading' ? 'Verifying...' : 'Send Recovery Link'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
