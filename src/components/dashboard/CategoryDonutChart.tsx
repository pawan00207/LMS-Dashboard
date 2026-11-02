import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useLibraryData } from '../../context/LibraryDataContext';

const CATEGORY_COLORS: Record<string, string> = {
  Technology: '#12372A',
  Fiction: '#C8962E',
  Science: '#2C5E4A',
  Philosophy: '#7A3E26',
  History: '#8C7A5B',
  Economics: '#3F4E4F',
  Psychology: '#9D6B53',
  'Art & Design': '#687980',
  Literature: '#A27B5C',
};

const DEFAULT_COLORS = ['#12372A', '#C8962E', '#3D6A56', '#8C7A5B', '#A27B5C', '#5C6B73', '#9A8262'];

export const CategoryDonutChart: React.FC = () => {
  const { books } = useLibraryData();

  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach((b) => {
      const cat = b.category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + (b.total_copies || 1);
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [books]);

  const totalCopies = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  return (
    <div className="p-5 rounded-xl bg-white/80 dark:bg-[#161C19]/90 border border-stone-200/90 dark:border-stone-800 shadow-2xs flex flex-col justify-between">
      <div className="pb-3 border-b border-stone-100 dark:border-stone-800/80">
        <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
          Holdings by Discipline
        </h3>
        <p className="text-xs text-stone-500 font-mono">
          Distribution of {totalCopies} catalogued copies
        </p>
      </div>

      <div className="relative w-full h-52 flex items-center justify-center my-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(18, 24, 21, 0.95)',
                border: '1px solid rgba(200, 150, 46, 0.3)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '11px',
                fontFamily: 'monospace',
              }}
              formatter={(value: any, name: any) => [`${value} copies`, name]}
            />
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
            {data.length}
          </span>
          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">
            Disciplines
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-2 border-t border-stone-100 dark:border-stone-800/80 text-xs font-mono">
        {data.slice(0, 6).map((item, idx) => (
          <div key={item.name} className="flex items-center justify-between truncate">
            <div className="flex items-center gap-1.5 truncate">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor: CATEGORY_COLORS[item.name] || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
                }}
              />
              <span className="text-stone-700 dark:text-stone-300 truncate text-[11px]">{item.name}</span>
            </div>
            <span className="text-stone-400 text-[10px] tabular-nums shrink-0 ml-1">
              {Math.round((item.value / (totalCopies || 1)) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
