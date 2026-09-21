import { useEffect, useState } from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import type { SimulationInfo } from './types';

interface LeaderboardHeaderProps {
  simulation: SimulationInfo;
}

export const LeaderboardHeader = ({ simulation }: LeaderboardHeaderProps) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      let targetDate: number;
      let isUpcoming = false;

      if (simulation.status === 'UPCOMING') {
        targetDate = new Date(simulation.startDate).getTime();
        isUpcoming = true;
      } else if (simulation.status === 'LIVE') {
        targetDate = new Date(simulation.endDate).getTime();
      } else {
        setTimeLeft('Simulation Ended');
        return;
      }

      const difference = targetDate - now;
      if (difference <= 0) {
        setTimeLeft(isUpcoming ? 'Starting soon...' : 'Simulation Ended');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      
      const prefix = isUpcoming ? 'Starts in' : 'Ends in';
      setTimeLeft(`${prefix} ${days} Days | ${hours.toString().padStart(2, '0')} Hours | ${minutes.toString().padStart(2, '0')} Minutes`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // update every minute
    return () => clearInterval(timer);
  }, [simulation]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'UPCOMING': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <div className="flex items-center text-sm text-[#787b86] mb-3">
          <span className="hover:text-blue-500 cursor-pointer transition-colors">Dashboard</span>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-white">Leaderboard</span>
        </div>
        
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{simulation.name}</h1>
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getStatusColor(simulation.status)}`}>
            {simulation.status === 'LIVE' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5 align-middle"></span>}
            {simulation.status}
          </span>
        </div>
        
        <p className="text-[#787b86] text-lg mb-4">Compete, learn, and improve your trading performance.</p>
        
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
          <span className="font-semibold text-white">{simulation.participants} Participants</span>
          <span className="text-[#787b86]">•</span>
          <span>{simulation.market} Market</span>
          <span className="text-[#787b86]">•</span>
          <span>Ends {new Date(simulation.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4 min-w-[280px] shadow-sm flex flex-col justify-center h-[88px]">
        <div className="flex items-center gap-2 text-[#787b86] mb-1.5 text-sm font-medium">
          <Clock className="w-4 h-4" />
          {simulation.status === 'LIVE' ? 'Simulation ends in' : simulation.status === 'UPCOMING' ? 'Simulation starts in' : 'Status'}
        </div>
        <p className={`text-lg font-mono font-bold ${simulation.status === 'LIVE' ? 'text-white' : 'text-slate-400'}`}>
          {timeLeft}
        </p>
      </div>
    </div>
  );
};
