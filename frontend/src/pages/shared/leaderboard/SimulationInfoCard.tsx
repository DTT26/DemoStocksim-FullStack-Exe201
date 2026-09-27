import type { SimulationInfo } from './types';

interface SimulationInfoCardProps {
  simulation: SimulationInfo;
  loading: boolean;
}

export const SimulationInfoCard = ({ simulation, loading }: SimulationInfoCardProps) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1e222d] rounded-2xl border border-slate-200 dark:border-[#2a2e39] shadow-sm p-6 animate-pulse mt-4 transition-colors">
        <div className="h-4 w-32 bg-slate-200 dark:bg-[#2a2e39] rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-20 bg-slate-200 dark:bg-[#2a2e39] rounded"></div>
              <div className="h-3 w-24 bg-slate-200 dark:bg-[#2a2e39] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatMoney = (val: number) => {
    if (!val) return '$0';
    const amount = val >= 1000000 ? val / 1000 : val;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-[#1e222d] rounded-2xl border border-slate-200 dark:border-[#2a2e39] shadow-sm p-6 mt-4 transition-colors">
      <h3 className="text-sm font-bold text-slate-500 dark:text-[#787b86] uppercase tracking-wider mb-6">Simulation Info</h3>
      
      <div className="space-y-4 text-sm">
        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-[#2a2e39]/50">
          <span className="text-slate-500 dark:text-[#787b86]">Name</span>
          <span className="text-slate-900 dark:text-white font-medium text-right max-w-[150px] truncate" title={simulation.name}>{simulation.name}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-[#2a2e39]/50">
          <span className="text-slate-500 dark:text-[#787b86]">Market</span>
          <span className="text-slate-900 dark:text-white font-medium">{simulation.market}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-[#2a2e39]/50">
          <span className="text-slate-500 dark:text-[#787b86]">Duration</span>
          <span className="text-slate-900 dark:text-white font-medium text-right text-xs">
            {formatDate(simulation.startDate)} –<br/>{formatDate(simulation.endDate)}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-[#2a2e39]/50">
          <span className="text-slate-500 dark:text-[#787b86]">Participants</span>
          <span className="text-slate-900 dark:text-white font-medium">{simulation.participants}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-[#2a2e39]/50">
          <span className="text-slate-500 dark:text-[#787b86]">Initial Balance</span>
          <span className="text-slate-900 dark:text-white font-mono font-medium">{formatMoney(simulation.initialBalance)}</span>
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-slate-500 dark:text-[#787b86]">Status</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
            simulation.status === 'LIVE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' :
            simulation.status === 'UPCOMING' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-500' :
            'bg-slate-500/10 text-slate-600 dark:text-slate-400'
          }`}>
            {simulation.status}
          </span>
        </div>
      </div>
    </div>
  );
};
