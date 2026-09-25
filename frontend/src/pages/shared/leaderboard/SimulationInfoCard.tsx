import type { SimulationInfo } from './types';

interface SimulationInfoCardProps {
  simulation: SimulationInfo;
  loading: boolean;
}

export const SimulationInfoCard = ({ simulation, loading }: SimulationInfoCardProps) => {
  if (loading) {
    return (
      <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm p-6 animate-pulse mt-4">
        <div className="h-4 w-32 bg-[#2a2e39] rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-20 bg-[#2a2e39] rounded"></div>
              <div className="h-3 w-24 bg-[#2a2e39] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm p-6 mt-4">
      <h3 className="text-sm font-bold text-[#787b86] uppercase tracking-wider mb-6">Simulation Info</h3>
      
      <div className="space-y-4 text-sm">
        <div className="flex justify-between items-center py-2 border-b border-[#2a2e39]/50">
          <span className="text-[#787b86]">Name</span>
          <span className="text-white font-medium text-right max-w-[150px] truncate" title={simulation.name}>{simulation.name}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-[#2a2e39]/50">
          <span className="text-[#787b86]">Market</span>
          <span className="text-white font-medium">{simulation.market}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-[#2a2e39]/50">
          <span className="text-[#787b86]">Duration</span>
          <span className="text-white font-medium text-right text-xs">
            {formatDate(simulation.startDate)} –<br/>{formatDate(simulation.endDate)}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-[#2a2e39]/50">
          <span className="text-[#787b86]">Participants</span>
          <span className="text-white font-medium">{simulation.participants}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-[#2a2e39]/50">
          <span className="text-[#787b86]">Initial Balance</span>
          <span className="text-white font-mono font-medium">{formatMoney(simulation.initialBalance)}</span>
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-[#787b86]">Status</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
            simulation.status === 'LIVE' ? 'bg-emerald-500/10 text-emerald-500' :
            simulation.status === 'UPCOMING' ? 'bg-blue-500/10 text-blue-500' :
            'bg-slate-500/10 text-slate-400'
          }`}>
            {simulation.status}
          </span>
        </div>
      </div>
    </div>
  );
};
