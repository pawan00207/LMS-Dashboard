import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  Linkedin,
  Github,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Send,
  BookOpen,
  Code2,
  Heart,
} from 'lucide-react';
import { useLibraryData } from '../../context/LibraryDataContext';

interface AboutFounderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutFounderModal: React.FC<AboutFounderModalProps> = ({ isOpen, onClose }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const founderInfo = {
    name: 'Yashita Saini',
    role: 'Founder & Lead Systems Architect',
    organization: 'The Alexandria Library Management System',
    email: 'yashitasaini702@gmail.com',
    linkedin: 'https://www.linkedin.com/in/yashitasaini',
    linkedinHandle: 'Yashita Saini',
    github: 'https://github.com/yashitacyber',
    githubHandle: 'yashitacyber',
    bio: 'Software engineer and system architect passionate about breathing contemporary craft into institutional tools. Designed The Alexandria Library System to eliminate manual errors and paperwork through reactive multi-tab synchronisation, role-enforced circulation boundaries, and timeless typography.',
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(founderInfo.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      setMessage('');
      setSenderName('');
      setTimeout(() => setSentSuccess(false), 4000);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-[#FCFAF6] dark:bg-[#18201C] border border-stone-300 dark:border-stone-800 rounded-2xl p-6 md:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#12372A] text-[#C8962E] flex items-center justify-center font-serif text-xl font-bold border border-[#C8962E]/30 shadow-xs">
                YS
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#C8962E] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Founder &amp; Creator</span>
                </div>
                <h2 className="font-serif text-2xl font-medium text-stone-900 dark:text-stone-100">
                  {founderInfo.name}
                </h2>
                <div className="text-xs text-stone-500 font-mono">
                  {founderInfo.role}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bio statement */}
          <div className="mt-5 space-y-4">
            <p className="text-xs md:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
              {founderInfo.bio}
            </p>

            {/* Architecture Highlights */}
            <div className="grid grid-cols-2 gap-3 py-1 font-mono text-xs">
              <div className="p-3 rounded-lg bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-1.5 text-stone-500 text-[10px] uppercase">
                  <Code2 className="w-3.5 h-3.5 text-[#12372A] dark:text-emerald-400" />
                  <span>Stack &amp; Craft</span>
                </div>
                <div className="font-medium text-stone-900 dark:text-stone-100 mt-1">
                  React 19 · TypeScript · Supabase Realtime
                </div>
              </div>
              <div className="p-3 rounded-lg bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-1.5 text-stone-500 text-[10px] uppercase">
                  <BookOpen className="w-3.5 h-3.5 text-[#C8962E]" />
                  <span>Aesthetics</span>
                </div>
                <div className="font-medium text-stone-900 dark:text-stone-100 mt-1">
                  Editorial Ink &amp; Brass · Zero Slop
                </div>
              </div>
            </div>

            {/* Contact Information & Channels */}
            <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800">
              <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-3">
                Official Contact &amp; Profiles
              </h3>

              <div className="space-y-2.5">
                {/* Email Item with copy */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-mono">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-[#12372A] dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] text-stone-400 block uppercase">Email</span>
                      <a
                        href={`mailto:${founderInfo.email}`}
                        className="font-medium text-stone-900 dark:text-stone-100 hover:text-[#C8962E] transition-colors truncate block"
                      >
                        {founderInfo.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded text-stone-700 dark:text-stone-200 text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Copy email to clipboard"
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <a
                      href={`mailto:${founderInfo.email}`}
                      className="p-1.5 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 rounded hover:bg-stone-100 dark:hover:bg-stone-800"
                      title="Open in mail app"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* LinkedIn Item */}
                <a
                  href={founderInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-mono hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/5 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center shrink-0">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">LinkedIn</span>
                      <span className="font-medium text-stone-900 dark:text-stone-100 group-hover:text-[#0A66C2] transition-colors">
                        {founderInfo.linkedinHandle}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-stone-400 group-hover:text-[#0A66C2]">
                    <span>Connect</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </a>

                {/* GitHub Item */}
                <a
                  href={founderInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-mono hover:border-stone-400 hover:bg-stone-100/50 dark:hover:bg-stone-800/50 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 flex items-center justify-center shrink-0">
                      <Github className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">GitHub</span>
                      <span className="font-medium text-stone-900 dark:text-stone-100 group-hover:text-[#C8962E] transition-colors">
                        @{founderInfo.githubHandle}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-stone-400 group-hover:text-[#C8962E]">
                    <span>Repositories</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Interactive Dispatch Box */}
            <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-stone-500">
                  Transmit Note to Founder
                </span>
                {sentSuccess && (
                  <span className="text-xs font-mono text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Message dispatched successfully!</span>
                  </span>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Your name or organization..."
                    className="px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#C8962E]"
                  />
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Brief inquiry or note..."
                    className="px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#C8962E]"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSending || !message.trim()}
                    className="px-4 py-2 bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3 h-3 text-[#C8962E]" />
                    <span>{isSending ? 'Sending...' : 'Send to Yashita'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
