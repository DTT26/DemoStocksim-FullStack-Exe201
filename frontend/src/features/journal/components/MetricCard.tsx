import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  tooltip?: string;
  icon?: React.ReactNode;
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  trend,
  tooltip,
  icon,
  badge
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-500 dark:text-emerald-400';
    if (trend === 'down') return 'text-rose-500 dark:text-rose-400';
    return 'text-slate-900 dark:text-white';
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#253047] rounded-xl p-4 sm:p-5 relative transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
            {label}
          </span>
          {tooltip && (
            <div className="relative inline-flex items-center">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded"
                aria-label={`Info about ${label}`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              {showTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 sm:w-64 p-2.5 bg-slate-900 dark:bg-[#1e2329] border border-slate-700 dark:border-[#363c4e] text-xs text-slate-200 rounded-lg shadow-xl z-50 pointer-events-none leading-relaxed text-left animate-in fade-in zoom-in-95">
                  <p>{tooltip}</p>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900 dark:border-t-[#1e2329]" />
                </div>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div className="text-slate-400 dark:text-slate-500 shrink-0">
            {icon}
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="flex items-baseline justify-between gap-2 mt-1">
        <h3 className={`text-xl sm:text-2xl font-bold tracking-tight ${getTrendColor()}`}>
          {value}
        </h3>
        {badge && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {badge}
          </span>
        )}
      </div>

      {/* Subtext */}
      {subValue && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium truncate">
          {subValue}
        </p>
      )}
    </div>
  );
};
