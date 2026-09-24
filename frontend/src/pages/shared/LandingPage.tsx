import { useAuth } from '../../contexts/AuthContext';
import { BarChart2, TrendingUp, Users, Award } from 'lucide-react';

export const LandingPage = () => {
  const { login } = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-in fade-in duration-700">
      <div className="w-20 h-20 bg-blue-900/30 rounded-2xl flex items-center justify-center mb-8">
        <TrendingUp className="w-10 h-10 text-blue-500" />
      </div>
      
      <h1 className="text-5xl font-extrabold text-white tracking-tight mb-6">
        Welcome to StockSim Edu
      </h1>
      
      <p className="text-xl text-[#787b86] max-w-2xl mb-12 leading-relaxed">
        The ultimate educational trading platform. Practice investing in real-time markets, compete in simulations, and hone your financial skills without any real-world risk.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl">
        <div className="bg-[#1e222d] border border-[#2a2e39] p-6 rounded-2xl flex flex-col items-center text-center">
          <BarChart2 className="w-8 h-8 text-emerald-500 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Real Market Data</h3>
          <p className="text-sm text-[#787b86]">Experience live trading with real prices from Global Crypto, US Stocks, and Forex Markets.</p>
        </div>
        
        <div className="bg-[#1e222d] border border-[#2a2e39] p-6 rounded-2xl flex flex-col items-center text-center">
          <Users className="w-8 h-8 text-blue-500 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Multiplayer Simulations</h3>
          <p className="text-sm text-[#787b86]">Join custom trading challenges hosted by your lecturers and compete with classmates.</p>
        </div>
        
        <div className="bg-[#1e222d] border border-[#2a2e39] p-6 rounded-2xl flex flex-col items-center text-center">
          <Award className="w-8 h-8 text-amber-500 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Global Leaderboards</h3>
          <p className="text-sm text-[#787b86]">Track your performance, analyze your return rates, and climb to the top of the ranks.</p>
        </div>
      </div>
      
      <button 
        onClick={() => login()}
        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 text-lg flex items-center gap-2"
      >
        Log in to Start Trading
      </button>
    </div>
  );
};
