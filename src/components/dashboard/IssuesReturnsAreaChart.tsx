import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useLibraryData } from '../../context/LibraryDataContext';

export const IssuesReturnsAreaChart: React.FC = () => {
  const { transactions } = useLibraryData();

  // Aggregate past 30 days
  const chartData = useMemo(() => {
    const today = new Date('2026-11-01T12:00:00Z');
    const daysMap = new Map<string, { date: string; label: string; issues: number; returns: number }>();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const iso = d.toISOString().split('T')[0];
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      daysMap.set(iso, { date: iso, label: monthDay, issues: 0, returns: 0 });
    }

    // Tally from transactions
    transactions.forEach((tx) => {
      if (tx.issue_date && daysMap.has(tx.issue_date)) {
        daysMap.get(tx.issue_date)!.issues += 1;
      }
      if (tx.return_date && daysMap.has(tx.return_date)) {
        daysMap.get(tx.return_date)!.returns += 1;
      }
    });

    return Array.from(daysMap.values());
  }, [transactions]);

  return (
    <div className="p-5 rounded-xl bg-white/80 dark:bg-[#161C19]/90 border border-stone-200/90 dark:border-stone-800 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-2 border-b border-stone-100 dark:border-stone-800/80">
        <div>
          <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
            Circulation Velocity (Last 30 Days)
          </h3>
          <p className="text-xs text-stone-500 font-mono">
            Daily checkout velocity versus completed reader returns
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#12372A] dark:bg-emerald-400"></span>
            <span className="text-stone-700 dark:text-stone-300">Books Issued</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C8962E]"></span>
            <span className="text-stone-700 dark:text-stone-300">Books Returned</span>
          </div>
        </div>
      </div>

      <div className="w-full h-64 font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="issuesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#12372A" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#12372A" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="returnsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C8962E" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#C8962E" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#888' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(150, 150, 150, 0.2)' }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: '#888' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(150, 150, 150, 0.2)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(18, 24, 21, 0.95)',
                border: '1px solid rgba(200, 150, 46, 0.3)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}
              labelStyle={{ fontWeight: 'bold', color: '#C8962E', marginBottom: '4px' }}
            />
            <Area
              type="monotone"
              dataKey="issues"
              name="Issues"
              stroke="#12372A"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#issuesGrad)"
              isAnimationActive={true}
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="returns"
              name="Returns"
              stroke="#C8962E"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#returnsGrad)"
              isAnimationActive={true}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
