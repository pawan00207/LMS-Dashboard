import React from 'react';
import { useLibraryData } from '../../context/LibraryDataContext';
import { Radio } from 'lucide-react';

export const LiveIndicator: React.FC = () => {
  const { connectionStatus, simulateConnectionDrop } = useLibraryData();

  return (
    <button
      onClick={simulateConnectionDrop}
      title="Supabase Realtime postgres_changes connection. Click to simulate reconnect test."
      className="group flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono transition-colors border border-stone-200/80 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-900/60 hover:bg-stone-200/50 dark:hover:bg-stone-800 cursor-pointer"
    >
      {connectionStatus === 'connected' ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="text-stone-700 dark:text-stone-300 font-medium">REALTIME: LIVE</span>
        </>
      ) : connectionStatus === 'reconnecting' ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
          </span>
          <span className="text-amber-700 dark:text-amber-400 font-medium animate-pulse">RECONNECTING...</span>
        </>
      ) : (
        <>
          <span className="inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
          <span className="text-rose-700 dark:text-rose-400 font-medium">DISCONNECTED</span>
        </>
      )}
      <Radio className="w-3 h-3 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200" />
    </button>
  );
};
