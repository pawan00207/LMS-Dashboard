import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Plus, Search, ShieldCheck, ShieldAlert, Phone, Mail, MapPin, BookOpen, X, Edit3, ArrowRight } from 'lucide-react';
import { Member, Transaction, Book } from '../../types/database';
import { useLibraryData } from '../../context/LibraryDataContext';
import { useAuth } from '../../context/AuthContext';
import { calculateOverdueAndFine } from '../../utils/libraryRules';

interface MembersDirectoryViewProps {
  onIssueBookToMember?: (memberId: string) => void;
}

export const MembersDirectoryView: React.FC<MembersDirectoryViewProps> = ({ onIssueBookToMember }) => {
  const { members, transactions, books, settings, addMember, updateMember, toggleMemberStatus, payFine } = useLibraryData();
  const { role } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Drawer / Detail state
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Add/Edit Member state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filtered members
  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.member_code.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone && m.phone.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [members, search, statusFilter]);

  // Active loans & fines for selected member in drawer
  const memberLoans = useMemo(() => {
    if (!selectedMember) return [];
    return transactions.filter((t) => t.member_id === selectedMember.id && t.status !== 'returned');
  }, [transactions, selectedMember]);

  const memberHistory = useMemo(() => {
    if (!selectedMember) return [];
    return transactions.filter((t) => t.member_id === selectedMember.id && t.status === 'returned');
  }, [transactions, selectedMember]);

  const totalUnpaidFine = useMemo(() => {
    if (!selectedMember) return 0;
    return transactions
      .filter((t) => t.member_id === selectedMember.id && !t.fine_paid && t.fine_amount > 0)
      .reduce((sum, t) => sum + t.fine_amount, 0);
  }, [transactions, selectedMember]);

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMember(m);
    setFormName(m.name);
    setFormEmail(m.email);
    setFormPhone(m.phone || '');
    setFormAddress(m.address || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    if (editingMember) {
      await updateMember(editingMember.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        address: formAddress.trim() || undefined,
      });
      if (selectedMember?.id === editingMember.id) {
        setSelectedMember((prev) => (prev ? { ...prev, name: formName, email: formEmail } : null));
      }
    } else {
      await addMember({
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        address: formAddress.trim() || undefined,
        status: 'active',
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top action strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-stone-850">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-medium text-stone-900 dark:text-stone-100">
            Reader Membership Directory
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            {members.length} registered patrons · Maximum {settings.max_books_per_member} borrowed titles per card
          </p>
        </div>

        {role !== 'member' && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs font-mono uppercase tracking-wider rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#C8962E]" />
            <span>Register New Reader</span>
          </button>
        )}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reader name, card ID (MEM-1001), email, or phone..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white/90 dark:bg-stone-900/90 border border-stone-300 dark:border-stone-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C8962E] text-stone-900 dark:text-stone-100"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center p-1 bg-stone-200/60 dark:bg-stone-800/60 rounded-lg text-xs font-mono shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-semibold'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            All Patrons
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-semibold'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            Active Only
          </button>
          <button
            onClick={() => setStatusFilter('suspended')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              statusFilter === 'suspended'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-semibold'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            Suspended
          </button>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const activeLoans = transactions.filter(
            (t) => t.member_id === member.id && t.status !== 'returned'
          ).length;

          const hasUnpaidFines = transactions.some(
            (t) => t.member_id === member.id && !t.fine_paid && t.fine_amount > 0
          );

          return (
            <motion.div
              key={member.id}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              onClick={() => setSelectedMember(member)}
              className="p-4 rounded-xl bg-white/85 dark:bg-[#161C19]/90 border border-stone-200/90 dark:border-stone-800 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#12372A] text-amber-200 flex items-center justify-center font-serif text-sm font-semibold">
                      {member.name[0]}
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-medium text-stone-900 dark:text-stone-100 leading-snug">
                        {member.name}
                      </h3>
                      <div className="text-xs font-mono text-stone-500">
                        {member.member_code}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize font-medium ${
                      member.status === 'active'
                        ? 'text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'text-rose-800 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>

                <div className="space-y-1 mt-3 text-xs text-stone-600 dark:text-stone-400">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.address && (
                    <div className="flex items-center gap-2 truncate text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{member.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-850 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-stone-400">Borrowed: </span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {activeLoans} / {settings.max_books_per_member}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {hasUnpaidFines && (
                    <span className="text-rose-600 text-[10px] font-bold">Unpaid Fine</span>
                  )}
                  <span className="text-[#C8962E] hover:underline flex items-center gap-0.5">
                    Profile →
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Member Profile Drawer */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl h-full bg-[#FCFAF6] dark:bg-[#18201C] border-l border-stone-300 dark:border-stone-800 p-6 shadow-2xl z-10 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#12372A] text-amber-200 flex items-center justify-center font-serif text-xl font-bold">
                      {selectedMember.name[0]}
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">
                        {selectedMember.name}
                      </h2>
                      <div className="text-xs font-mono text-stone-500">
                        {selectedMember.member_code} · Joined {selectedMember.joined_at}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Member contact & status */}
                <div className="my-4 p-4 rounded-lg bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Membership Status</span>
                    <span
                      className={`capitalize font-semibold ${
                        selectedMember.status === 'active' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {selectedMember.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Email</span>
                    <span className="text-stone-900 dark:text-stone-100">{selectedMember.email}</span>
                  </div>
                  {selectedMember.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Phone</span>
                      <span className="text-stone-900 dark:text-stone-100">{selectedMember.phone}</span>
                    </div>
                  )}
                  {selectedMember.address && (
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Residence</span>
                      <span className="text-stone-900 dark:text-stone-100">{selectedMember.address}</span>
                    </div>
                  )}
                </div>

                {/* Fines notice */}
                {totalUnpaidFine > 0 && (
                  <div className="mb-4 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-rose-700 dark:text-rose-300 font-bold block">
                        Outstanding Fines: ₹{totalUnpaidFine}
                      </span>
                      <span className="text-rose-600/80 text-[11px]">
                        Lending blocked until cleared.
                      </span>
                    </div>
                  </div>
                )}

                {/* Active Borrowed Books */}
                <div className="my-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif text-sm font-medium text-stone-900 dark:text-stone-100">
                      Currently Issued Books ({memberLoans.length})
                    </h3>
                    {onIssueBookToMember && selectedMember.status === 'active' && memberLoans.length < settings.max_books_per_member && (
                      <button
                        onClick={() => {
                          const mId = selectedMember.id;
                          setSelectedMember(null);
                          onIssueBookToMember(mId);
                        }}
                        className="text-xs text-[#C8962E] hover:underline font-mono cursor-pointer"
                      >
                        + Issue Book
                      </button>
                    )}
                  </div>

                  {memberLoans.length === 0 ? (
                    <div className="p-4 rounded border border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500 font-mono">
                      No books currently borrowed by this reader.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {memberLoans.map((loan) => {
                        const book = books.find((b) => b.id === loan.book_id);
                        const { overdueDays, fineAmount } = calculateOverdueAndFine(
                          loan.due_date,
                          todayStr,
                          settings.fine_per_day
                        );

                        return (
                          <div
                            key={loan.id}
                            className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 text-xs flex items-center justify-between"
                          >
                            <div>
                              <div className="font-serif font-medium text-stone-900 dark:text-stone-100">
                                {book?.title || 'Unknown Title'}
                              </div>
                              <div className="text-[11px] font-mono text-stone-500">
                                Issued: {loan.issue_date} · Due: {loan.due_date}
                              </div>
                            </div>
                            <div className="text-right font-mono">
                              {overdueDays > 0 ? (
                                <span className="text-rose-600 font-semibold block">
                                  {overdueDays}d Late (Fine: ₹{fineAmount})
                                </span>
                              ) : (
                                <span className="text-emerald-600 font-semibold block">On Schedule</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Past Reading History */}
                <div className="my-4">
                  <h3 className="font-serif text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">
                    Completed Loans ({memberHistory.length})
                  </h3>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-stone-100 dark:divide-stone-850">
                    {memberHistory.slice(0, 5).map((tx) => {
                      const book = books.find((b) => b.id === tx.book_id);
                      return (
                        <div key={tx.id} className="pt-1.5 text-xs flex items-center justify-between">
                          <span className="font-serif text-stone-800 dark:text-stone-200 truncate mr-2">
                            {book?.title}
                          </span>
                          <span className="font-mono text-[10px] text-stone-400 shrink-0">
                            Returned {tx.return_date}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              {role !== 'member' && (
                <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => toggleMemberStatus(selectedMember.id)}
                    className={`px-3 py-2 text-xs font-mono rounded cursor-pointer ${
                      selectedMember.status === 'active'
                        ? 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                    }`}
                  >
                    {selectedMember.status === 'active' ? 'Suspend Membership' : 'Reactivate Membership'}
                  </button>

                  <button
                    onClick={(e) => handleOpenEdit(selectedMember, e)}
                    className="px-4 py-2 bg-stone-900 dark:bg-stone-800 text-white text-xs font-mono rounded hover:bg-stone-800 cursor-pointer"
                  >
                    Edit Reader Info
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Member Modal */}
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
                  {editingMember ? 'Edit Reader Record' : 'Register New Reader'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs font-mono">
                <div>
                  <label className="block uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Vikramaditya Roy"
                    className="w-full px-3 py-2 text-sm font-sans bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded focus:outline-none focus:ring-1 focus:ring-[#C8962E] text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="reader@example.com"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded focus:outline-none focus:ring-1 focus:ring-[#C8962E] text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98110 00000"
                    className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded focus:outline-none focus:ring-1 focus:ring-[#C8962E] text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="e.g. 42 Crescent Avenue, New Delhi"
                    className="w-full px-3 py-2 text-sm font-sans bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded focus:outline-none focus:ring-1 focus:ring-[#C8962E] text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#12372A] hover:bg-[#1A4D3B] text-white rounded font-mono uppercase tracking-wider cursor-pointer"
                  >
                    {editingMember ? 'Update Reader' : 'Register Reader'}
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
