import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Shield, CheckCircle, Ban, Trash2, X, Mail } from 'lucide-react';
import { useLibraryData } from '../../context/LibraryDataContext';
import { Profile } from '../../types/database';

export const StaffManagementView: React.FC = () => {
  const { librarians, createLibrarian, toggleLibrarianStatus, deleteLibrarian } = useLibraryData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setIsSubmitting(true);
    await createLibrarian({
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
    });
    setIsSubmitting(false);
    setIsModalOpen(false);
    setFullName('');
    setEmail('');
  };

  const handleDelete = async (staff: Profile) => {
    if (confirm(`Revoke credentials and permanently delete librarian "${staff.full_name}"?`)) {
      await deleteLibrarian(staff.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-stone-850">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-medium text-stone-900 dark:text-stone-100">
            Librarian Staff Management
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Admin access control: Issue credentials, manage desk clearances, or revoke circulation privileges
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs font-mono uppercase tracking-wider rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4 text-[#C8962E]" />
          <span>Appoint New Librarian</span>
        </button>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {librarians.map((staff) => (
          <div
            key={staff.id}
            className={`p-5 rounded-xl border transition-all ${
              staff.is_active
                ? 'bg-white/85 dark:bg-[#161C19]/90 border-stone-200/90 dark:border-stone-800'
                : 'bg-stone-100/60 dark:bg-stone-900/40 border-dashed border-stone-300 dark:border-stone-800 opacity-75'
            } shadow-2xs flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#12372A] text-amber-200 flex items-center justify-center font-serif text-base font-semibold">
                    {staff.full_name[0]}
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-medium text-stone-900 dark:text-stone-100">
                      {staff.full_name}
                    </h3>
                    <div className="text-xs font-mono text-stone-500">
                      ID: {staff.id}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize font-medium ${
                    staff.is_active
                      ? 'text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'text-stone-700 bg-stone-200 dark:bg-stone-800 dark:text-stone-400'
                  }`}
                >
                  {staff.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="space-y-1 text-xs text-stone-600 dark:text-stone-400 font-mono">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{staff.email}</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-1">
                  Registered: {new Date(staff.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-850 flex items-center justify-between text-xs font-mono">
              <button
                onClick={() => toggleLibrarianStatus(staff.id)}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                  staff.is_active
                    ? 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
                    : 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
                }`}
              >
                {staff.is_active ? (
                  <>
                    <Ban className="w-3 h-3" />
                    <span>Disable Desk</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    <span>Enable Desk</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDelete(staff)}
                title="Delete staff account"
                className="p-1.5 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Appoint Librarian Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#FCFAF6] dark:bg-[#18201C] border border-stone-300 dark:border-stone-800 rounded-xl p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
                  Appoint Library Staff Member
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs font-mono">
                <div>
                  <label className="block uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                    Staff Member Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Margaret Lockwood"
                    className="w-full px-3 py-2 text-sm font-sans bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded focus:outline-none focus:ring-1 focus:ring-[#C8962E] text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                    Official Library Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="m.lockwood@alexandria.lib"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded focus:outline-none focus:ring-1 focus:ring-[#C8962E] text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="p-3 bg-stone-100 dark:bg-stone-900 rounded text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                  Default temporary password will be assigned: <span className="font-bold">LibPass123!</span>. Staff member will sign in via the Librarian Desk portal.
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#12372A] hover:bg-[#1A4D3B] text-white rounded font-mono uppercase tracking-wider cursor-pointer"
                  >
                    {isSubmitting ? 'Creating...' : 'Issue Credentials'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
