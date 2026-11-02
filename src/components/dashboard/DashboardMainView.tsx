import React from 'react';
import { LiveKPIStrip } from './LiveKPIStrip';
import { IssuesReturnsAreaChart } from './IssuesReturnsAreaChart';
import { CategoryDonutChart } from './CategoryDonutChart';
import { LiveActivityFeed } from './LiveActivityFeed';
import { OverdueAlertsList } from './OverdueAlertsList';
import { TopBooksAndMembers } from './TopBooksAndMembers';
import { BookUp, RotateCcw, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DashboardMainViewProps {
  onOpenIssue: () => void;
  onOpenReturn: (preselectedTxId?: string) => void;
}

export const DashboardMainView: React.FC<DashboardMainViewProps> = ({
  onOpenIssue,
  onOpenReturn,
}) => {
  const { user, role } = useAuth();

  return (
    <div className="space-y-6">
      {/* Top Greeting & Action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-stone-850">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C8962E] mb-1 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Circulation Terminal · Realtime Operational Overview</span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-medium text-stone-900 dark:text-stone-100">
            Welcome, {user?.full_name || 'Staff Member'}
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Continuous sync active across all catalog nodes. Zero manual refresh required.
          </p>
        </div>

        {role !== 'member' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenReturn()}
              className="px-3.5 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-mono rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C8962E]" />
              <span>Process Return</span>
            </button>
            <button
              onClick={onOpenIssue}
              className="px-4 py-2 bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs font-mono uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <BookUp className="w-4 h-4 text-[#C8962E]" />
              <span>Issue New Loan</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Tiles Strip */}
      <LiveKPIStrip />

      {/* Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 30-day velocity chart */}
          <IssuesReturnsAreaChart />

          {/* Overdue alerts with 1-click return */}
          <OverdueAlertsList onProcessReturn={(txId) => onOpenReturn(txId)} />

          {/* Top Borrowed Books & Active Readers */}
          <TopBooksAndMembers />
        </div>

        {/* Side Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Category Donut */}
          <CategoryDonutChart />

          {/* Live Activity Feed */}
          <LiveActivityFeed />
        </div>
      </div>
    </div>
  );
};
