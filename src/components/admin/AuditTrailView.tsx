import React, { useState, useMemo } from 'react';
import { Shield, Search, Filter, Clock } from 'lucide-react';
import { useLibraryData } from '../../context/LibraryDataContext';

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useLibraryData();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'librarian' | 'member'>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return auditLogs.filter((log) => {
      const matchSearch =
        !q ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.user_name.toLowerCase().includes(q);

      const matchRole = roleFilter === 'all' || log.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [auditLogs, search, roleFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-stone-850">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-medium text-stone-900 dark:text-stone-100">
            System Security &amp; Audit Trail
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Immutable log of circulation desk actions, catalog modifications, and authentication events
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, details, or staff name..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white/90 dark:bg-stone-900/90 border border-stone-300 dark:border-stone-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C8962E] text-stone-900 dark:text-stone-100 font-mono text-xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center p-1 bg-stone-200/60 dark:bg-stone-800/60 rounded-lg text-xs font-mono shrink-0">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-semibold'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              roleFilter === 'admin'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-semibold'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            Admin Only
          </button>
          <button
            onClick={() => setRoleFilter('librarian')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              roleFilter === 'librarian'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-semibold'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            Librarians
          </button>
        </div>
      </div>

      {/* Log list */}
      <div className="rounded-xl border border-stone-200/90 dark:border-stone-800 bg-white/80 dark:bg-[#161C19]/90 shadow-2xs overflow-hidden">
        <div className="divide-y divide-stone-100 dark:divide-stone-850">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500 font-mono">
              No audit log entries matching criteria.
            </div>
          ) : (
            filtered.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-stone-50/70 dark:hover:bg-stone-800/30 transition-colors flex items-start gap-4 text-xs font-mono"
              >
                <div
                  className={`w-8 h-8 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                    log.role === 'admin'
                      ? 'bg-stone-900 text-[#C8962E] dark:bg-stone-800'
                      : 'bg-[#12372A]/10 text-[#12372A] dark:text-emerald-400'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900 dark:text-stone-100">
                        {log.action}
                      </span>
                      <span className="text-stone-400">·</span>
                      <span className="text-stone-700 dark:text-stone-300 font-medium">
                        {log.user_name}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded uppercase ${
                          log.role === 'admin'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {log.role}
                      </span>
                    </div>

                    <span className="text-[11px] text-stone-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-stone-600 dark:text-stone-300 font-sans text-xs leading-relaxed">
                    {log.details}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
