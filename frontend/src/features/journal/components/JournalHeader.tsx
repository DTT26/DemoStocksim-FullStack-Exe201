import React from 'react';
import { Layers, ChevronDown } from 'lucide-react';

interface JournalHeaderProps {
  simulations: { id: string; name: string }[];
  selectedSimulation: string;
  onSelectSimulation: (simId: string) => void;
}

export const JournalHeader: React.FC<JournalHeaderProps> = ({
  simulations,
  selectedSimulation,
  onSelectSimulation
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-[#253047]">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Trading Journal
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1.5 max-w-2xl">
          Review your trading sessions, analyze performance, and learn from every trade.
        </p>
      </div>

      {/* Simulation Selector Dropdown */}
      <div className="relative self-start md:self-auto min-w-[220px]">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
          Simulation
        </label>
        <div className="relative">
          <select
            value={selectedSimulation}
            onChange={(e) => onSelectSimulation(e.target.value)}
            className="w-full appearance-none bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] text-slate-900 dark:text-white text-sm font-semibold rounded-xl px-3.5 py-2.5 pr-9 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
          >
            <option value="ALL">All Simulations</option>
            {simulations.map(sim => (
              <option key={sim.id} value={sim.id}>
                {sim.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
