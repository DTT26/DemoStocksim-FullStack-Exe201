import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LeaderboardHeader } from './leaderboard/LeaderboardHeader';
import { LeaderboardStats } from './leaderboard/LeaderboardStats';
import { LeaderboardTable } from './leaderboard/LeaderboardTable';
import { YourRankCard } from './leaderboard/YourRankCard';
import { SimulationInfoCard } from './leaderboard/SimulationInfoCard';
import { TopPerformersCard } from './leaderboard/TopPerformersCard';
import type { LeaderboardUser, SimulationInfo } from './leaderboard/types';

export const Leaderboard = () => {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const simId = searchParams.get('sim') || 'sim-01';
  
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock simulation data since we don't have an endpoint for it yet
  const [simulation] = useState<SimulationInfo>({
    id: simId,
    name: `Trading Challenge #${simId.slice(-2).toUpperCase()}`,
    status: 'LIVE',
    participants: 0,
    market: 'Vietnam (HOSE, HNX)',
    startDate: '2026-06-01T00:00:00Z',
    endDate: '2026-10-31T23:59:59Z',
    initialBalance: 100000000,
  });

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/users?role=student`, { credentials: 'include', headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
      
      if (response.ok) {
        const data = await response.json();
        
        // Map real users to mock leaderboard data (sorted by mock performance)
        const leaderboardData = data.map((u: any, index: number) => {
          const basePortfolio = simulation.initialBalance;
          // Generate some pseudo-random but consistent performance based on index
          const performanceMulti = 1 + (data.length - index) * 0.05; 
          const portfolio = basePortfolio * performanceMulti;
          const profit = portfolio - basePortfolio;
          const returnRate = (profit / basePortfolio) * 100;
          
          return {
            _id: u._id,
            name: u.name,
            email: u.email,
            portfolio,
            profit,
            returnRate,
            trades: 10 + (data.length - index) * 2
          };
        }).sort((a: LeaderboardUser, b: LeaderboardUser) => b.portfolio - a.portfolio);
        
        setUsers(leaderboardData);
      } else {
        setError('Failed to fetch leaderboard data.');
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Something went wrong while loading the ranking data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [simId]); // Re-fetch if simulation ID changes

  // Update simulation participants count
  useEffect(() => {
    if (users.length > 0) {
      simulation.participants = users.length;
    }
  }, [users, simulation]);

  // Find current user's rank
  const currentUserIndex = users.findIndex(u => u.email === currentUser?.email);
  const currentUserRank = currentUserIndex >= 0 ? currentUserIndex + 1 : undefined;
  const currentUserData = currentUserIndex >= 0 ? users[currentUserIndex] : undefined;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in">
        <div className="bg-[#1e222d] rounded-2xl border border-red-500/20 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Unable to load leaderboard</h2>
          <p className="text-[#787b86] mb-6">{error}</p>
          <button 
            onClick={fetchLeaderboard}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <LeaderboardHeader simulation={simulation} />
      
      <LeaderboardStats users={users} loading={loading} />

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left Column - Main Table */}
        <div className="w-full xl:w-3/4 flex flex-col">
          <LeaderboardTable 
            users={users} 
            currentUserEmail={currentUser?.email} 
            loading={loading}
            onRefresh={fetchLeaderboard}
          />
        </div>

        {/* Right Column - Summary & Info */}
        <div className="w-full xl:w-1/4 flex flex-col gap-6">
          <YourRankCard currentUser={currentUserData} rank={currentUserRank} loading={loading} />
          <SimulationInfoCard simulation={simulation} loading={loading} />
          <TopPerformersCard users={users} loading={loading} />
        </div>
      </div>
    </div>
  );
};
