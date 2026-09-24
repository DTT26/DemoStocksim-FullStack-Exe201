import { Flame, Target, CalendarDays, LineChart } from 'lucide-react';

export const RightPanel = () => {
  const marketIndices = [
    { name: 'S&P 500', value: '5,120.50', change: '+25.4 (+0.50%)', isPositive: true },
    { name: 'Nasdaq 100', value: '18,050.20', change: '+110.5 (+0.62%)', isPositive: true },
    { name: 'Bitcoin (BTC)', value: '$64,200.50', change: '+1,200.5 (+1.90%)', isPositive: true },
    { name: 'Gold (XAU/USD)', value: '$2,350.50', change: '+15.2 (+0.65%)', isPositive: true },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Market Summary */}
      <div className="bg-[#111722] rounded-2xl border border-[#263041] p-5 shadow-sm">
        <h3 className="text-[#F8FAFC] font-bold text-sm mb-4 flex items-center gap-2">
          <LineChart className="w-4 h-4 text-blue-400" />
          Market Summary
        </h3>
        <div className="space-y-3">
          {marketIndices.map((idx, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8]">{idx.name}</span>
              <div className="text-right">
                <div className="text-xs font-medium text-[#F8FAFC]">{idx.value}</div>
                <div className={`text-[10px] ${idx.isPositive ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {idx.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Streak */}
      <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20 p-5 shadow-sm relative overflow-hidden group cursor-pointer">
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <Flame className="w-24 h-24 text-orange-500" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h4 className="text-xs text-orange-200/70 font-semibold uppercase tracking-wider mb-1">Learning Streak</h4>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-orange-400">12</span>
              <span className="text-sm font-medium text-orange-400/80">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Deadline */}
      <div className="bg-[#111722] rounded-2xl border border-[#263041] p-5 shadow-sm">
        <h3 className="text-[#F8FAFC] font-bold text-sm mb-3 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-purple-400" />
          Next Deadline
        </h3>
        <div className="bg-[#171E2B] rounded-lg p-3 border border-[#263041]">
          <h4 className="text-sm font-medium text-[#F8FAFC]">Technical Analysis</h4>
          <p className="text-xs text-red-400 mt-1 font-medium">Due Sep 15</p>
        </div>
      </div>

      {/* Daily Goal */}
      <div className="bg-[#111722] rounded-2xl border border-[#263041] p-5 shadow-sm">
        <h3 className="text-[#F8FAFC] font-bold text-sm mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-green-400" />
          Daily Goal
        </h3>
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs text-[#94A3B8]">Study & Trade</span>
          <span className="text-sm font-bold text-[#F8FAFC]">82%</span>
        </div>
        <div className="h-2 w-full bg-[#263041] rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: '82%' }}></div>
        </div>
      </div>
    </div>
  );
};
