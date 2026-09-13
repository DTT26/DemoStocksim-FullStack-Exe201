import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, BarChart2, PlusCircle, ArrowRight } from 'lucide-react';

export const SimulationsList = () => {
  const [simulations, setSimulations] = useState<any[]>([]);
  const [participations, setParticipations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const headers = { 'Authorization': `Bearer ${token}` };

      const [simRes, partRes] = await Promise.all([
        fetch(`${apiUrl}/simulations`, { headers }),
        fetch(`${apiUrl}/simulations/participations/me`, { headers })
      ]);

      if (simRes.ok && partRes.ok) {
        setSimulations(await simRes.json());
        setParticipations(await partRes.json());
      }
    } catch (error) {
      console.error('Error fetching simulations data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleJoinSimulation = async (simId: string) => {
    setJoiningId(simId);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      const response = await fetch(`${apiUrl}/simulations/${simId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh data to show "Enter Simulation" button
        fetchData();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to join simulation');
      }
    } catch (error) {
      console.error('Error joining simulation:', error);
      alert('An error occurred while joining the simulation');
    } finally {
      setJoiningId(null);
    }
  };

  const hasJoined = (simId: string) => {
    return participations.some(p => p.simulationId === simId);
  };

  const getParticipation = (simId: string) => {
    return participations.find(p => p.simulationId === simId);
  };

  const filteredSimulations = simulations.filter(sim => {
    if (filter === 'All') return true;
    if (filter === 'Live' && sim.status === 'ACTIVE') return true;
    if (filter === 'Upcoming' && sim.status === 'PUBLISHED') return true;
    if (filter === 'Completed' && sim.status === 'ENDED') return true;
    return false;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Simulations</h1>
        <p className="text-[#787b86] mt-2 text-lg">Practice trading, compete with other students, and improve your investment skills.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-[#2a2e39]">
        {['All', 'Live', 'Upcoming', 'Completed'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              filter === tab 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#787b86] flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          Loading simulations...
        </div>
      ) : filteredSimulations.length === 0 ? (
        <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm p-12 text-center text-[#787b86]">
          No simulations found matching this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredSimulations.map((sim) => {
            const joined = hasJoined(sim._id);
            const participation = getParticipation(sim._id);
            
            return (
              <div key={sim._id} className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  sim.status === 'ACTIVE' ? 'bg-emerald-500' :
                  sim.status === 'ENDED' ? 'bg-slate-400' : 'bg-amber-500'
                }`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider mb-3 inline-flex items-center gap-1.5 ${
                      sim.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                      sim.status === 'ENDED' ? 'bg-[#2a2e39] text-[#d1d4dc]' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {sim.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                      {sim.status === 'PUBLISHED' ? 'Upcoming' : sim.status}
                    </span>
                    <h2 className="text-xl font-bold text-white mt-1">{sim.name}</h2>
                  </div>
                </div>
                
                <p className="text-[#787b86] mb-6 text-sm flex-1">
                  {sim.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-[#787b86]">
                    <DollarSign className="w-4 h-4 text-[#787b86]" />
                    <span>Capital: <span className="font-semibold text-white">{(sim.initialBalance / 1000000).toFixed(0)}M VND</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#787b86]">
                    <BarChart2 className="w-4 h-4 text-[#787b86]" />
                    <span>Market: <span className="font-semibold text-white">{sim.market || 'VN'}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#787b86]">
                    <Calendar className="w-4 h-4 text-[#787b86]" />
                    <span>Ends: <span className="font-semibold text-white">{new Date(sim.endDate).toLocaleDateString()}</span></span>
                  </div>
                </div>

                {joined ? (
                  <>
                    <div className="bg-[#131722] p-4 rounded-xl border border-[#2a2e39] flex justify-between items-center mb-6">
                      <div>
                        <p className="text-xs text-[#787b86] uppercase tracking-wider font-semibold">Your Return</p>
                        <p className={`text-lg font-bold ${participation.returnRate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {participation.returnRate > 0 ? '+' : ''}{participation.returnRate.toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#787b86] uppercase tracking-wider font-semibold">Status</p>
                        <p className="text-sm font-bold text-blue-600">Joined</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-auto">
                      <Link to={`/trade/${sim._id}`} className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        Enter Simulation
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link to={`/leaderboard?sim=${sim._id}`} className="bg-[#1e222d] hover:bg-[#131722] text-[#d1d4dc] border border-[#2a2e39] font-medium py-2.5 px-4 rounded-lg transition-colors">
                        Leaderboard
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-3 mt-auto pt-6 border-t border-[#2a2e39]">
                    <button 
                      onClick={() => handleJoinSimulation(sim._id)}
                      disabled={joiningId === sim._id || sim.status === 'ENDED'}
                      className="flex-1 text-center bg-[#1e222d] hover:bg-[#131722] text-blue-600 border border-blue-200 font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {joiningId === sim._id ? (
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <PlusCircle className="w-5 h-5" />
                      )}
                      Join Simulation
                    </button>
                    <Link to={`/leaderboard?sim=${sim._id}`} className="bg-[#1e222d] hover:bg-[#131722] text-[#d1d4dc] border border-[#2a2e39] font-medium py-2.5 px-4 rounded-lg transition-colors">
                      Leaderboard
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
