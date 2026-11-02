import React, { useState } from 'react';
import { Sliders, Save, RefreshCw, CheckCircle2, RotateCcw } from 'lucide-react';
import { useLibraryData } from '../../context/LibraryDataContext';

export const SystemSettingsView: React.FC = () => {
  const { settings, updateSettings, resetDatabase } = useLibraryData();

  const [finePerDay, setFinePerDay] = useState(settings.fine_per_day);
  const [loanPeriod, setLoanPeriod] = useState(settings.loan_period_days);
  const [maxBooks, setMaxBooks] = useState(settings.max_books_per_member);
  const [libraryName, setLibraryName] = useState(settings.library_name);
  const [libraryEmail, setLibraryEmail] = useState(settings.library_email);
  const [phone, setPhone] = useState(settings.contact_phone);

  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      fine_per_day: Number(finePerDay),
      loan_period_days: Number(loanPeriod),
      max_books_per_member: Number(maxBooks),
      library_name: libraryName.trim(),
      library_email: libraryEmail.trim(),
      contact_phone: phone.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResetData = () => {
    if (
      confirm(
        'Warning: This will reset all books, members, transactions, and audit logs to the initial seeded state. Proceed?'
      )
    ) {
      resetDatabase();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-stone-850">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-medium text-stone-900 dark:text-stone-100">
            Circulation Parameters &amp; System Configuration
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Admin controls: Adjust overdue fee scales, lending durations, and borrowing quotas with immediate effect
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core lending policies */}
        <div className="p-6 rounded-xl bg-white/85 dark:bg-[#161C19]/90 border border-stone-200/90 dark:border-stone-800 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800/80">
            <Sliders className="w-4 h-4 text-[#C8962E]" />
            <h2 className="font-serif text-base font-medium text-stone-900 dark:text-stone-100">
              Lending Policy Parameters
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                Overdue Fine Rate (₹ / Day)
              </label>
              <input
                type="number"
                min={0}
                max={500}
                value={finePerDay}
                onChange={(e) => setFinePerDay(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C8962E] text-stone-900 dark:text-stone-100"
              />
              <span className="text-[11px] text-stone-400 font-mono mt-1 block">
                Default: ₹5/day after due date
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                Standard Loan Period (Days)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={loanPeriod}
                onChange={(e) => setLoanPeriod(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C8962E] text-stone-900 dark:text-stone-100"
              />
              <span className="text-[11px] text-stone-400 font-mono mt-1 block">
                Default: 14 days borrowing window
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                Max Books Per Reader
              </label>
              <input
                type="number"
                min={1}
                max={15}
                value={maxBooks}
                onChange={(e) => setMaxBooks(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C8962E] text-stone-900 dark:text-stone-100"
              />
              <span className="text-[11px] text-stone-400 font-mono mt-1 block">
                Default: 3 active checkouts per card
              </span>
            </div>
          </div>
        </div>

        {/* Institution details */}
        <div className="p-6 rounded-xl bg-white/85 dark:bg-[#161C19]/90 border border-stone-200/90 dark:border-stone-800 shadow-2xs space-y-4">
          <h2 className="font-serif text-base font-medium text-stone-900 dark:text-stone-100 pb-3 border-b border-stone-100 dark:border-stone-800/80">
            Institutional Registry
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                Library Name
              </label>
              <input
                type="text"
                value={libraryName}
                onChange={(e) => setLibraryName(e.target.value)}
                className="w-full px-3 py-2 text-sm font-serif bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                Official Circulation Email
              </label>
              <input
                type="email"
                value={libraryEmail}
                onChange={(e) => setLibraryEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>
        </div>

        {/* Submit & feedback */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="px-3.5 py-2 text-xs font-mono text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Database to Pristine Seed</span>
          </button>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Policy parameters applied in real-time</span>
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs font-mono uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-[#C8962E]" />
              <span>Save System Parameters</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
