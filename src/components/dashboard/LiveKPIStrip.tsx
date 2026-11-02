import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { BookOpen, CheckCircle, Clock, AlertTriangle, Users, IndianRupee } from 'lucide-react';
import { useLibraryData } from '../../context/LibraryDataContext';
import { calculateKPIs } from '../../utils/libraryRules';

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className="font-mono tabular-nums">{display}</motion.span>;
}

export const LiveKPIStrip: React.FC = () => {
  const { books, members, transactions, settings } = useLibraryData();

  const kpis = calculateKPIs(books, members, transactions, settings);

  const tiles = [
    {
      label: 'Total Volumes',
      value: kpis.totalBooksCount,
      sub: `${books.length} unique titles`,
      icon: BookOpen,
      accent: 'border-[#12372A]/15 dark:border-stone-800 text-[#12372A] dark:text-[#E2ECE6]',
      iconColor: 'text-[#12372A] dark:text-emerald-400',
    },
    {
      label: 'Available Copies',
      value: kpis.availableBooksCount,
      sub: `${Math.round((kpis.availableBooksCount / (kpis.totalBooksCount || 1)) * 100)}% on shelves`,
      icon: CheckCircle,
      accent: 'border-emerald-600/20 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Issued Today',
      value: kpis.issuedTodayCount,
      sub: `${kpis.returnsTodayCount} returned today`,
      icon: Clock,
      accent: 'border-[#C8962E]/25 dark:border-[#C8962E]/30 text-amber-900 dark:text-amber-200',
      iconColor: 'text-[#C8962E]',
    },
    {
      label: 'Overdue Loans',
      value: kpis.overdueCount,
      sub: 'Action required',
      icon: AlertTriangle,
      accent: 'border-rose-500/20 dark:border-rose-900/40 text-rose-800 dark:text-rose-300',
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
    {
      label: 'Active Readers',
      value: kpis.activeMembersCount,
      sub: `${members.length} registered cards`,
      icon: Users,
      accent: 'border-stone-300 dark:border-stone-800 text-stone-800 dark:text-stone-200',
      iconColor: 'text-stone-600 dark:text-stone-300',
    },
    {
      label: 'Fines Collected Today',
      value: kpis.finesCollectedToday,
      sub: `₹${kpis.totalFinesPending} outstanding`,
      isCurrency: true,
      icon: IndianRupee,
      accent: 'border-[#C8962E]/30 dark:border-stone-800 text-stone-900 dark:text-stone-100',
      iconColor: 'text-[#C8962E]',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {tiles.map((tile, i) => (
        <motion.div
          key={tile.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.05 }}
          className={`relative p-4 rounded-lg bg-white/80 dark:bg-[#161C19]/90 border ${tile.accent} shadow-2xs backdrop-blur-xs flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-stone-500 dark:text-stone-400 truncate">
              {tile.label}
            </span>
            <tile.icon className={`w-3.5 h-3.5 ${tile.iconColor} shrink-0`} />
          </div>

          <div className="my-1">
            <span className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              {tile.isCurrency ? '₹' : ''}
              <AnimatedNumber value={tile.value} />
            </span>
          </div>

          <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 truncate">
            {tile.sub}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
