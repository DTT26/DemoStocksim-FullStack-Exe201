import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, BarChart2, PlusCircle, ArrowRight } from 'lucide-react';
import { useAlert } from '../../contexts/AlertContext';

export const SimulationsList = () => {
  const { showAlert } = useAlert();
  const [simulations, setSimulations] = useState<any[]>([]);
  const [participations, setParticipations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const headers = { };

      const [simRes, partRes] = await Promise.all([
        fetch(`${apiUrl}/simulations`, { credentials: 'include', headers }),
        fetch(`${apiUrl}/simulations/participations/me`, { credentials: 'include', headers })
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      const response = await fetch(`${apiUrl}/simulations/${simId}/join`, { credentials: 'include',
        method: 'POST',
        });

      if (response.ok) {
        // Refresh data to show "Enter Simulation" button
        fetchData();
        showAlert('Successfully joined the simulation', 'success');
      } else {
        const data = await response.json();
        showAlert(data.message || 'Failed to join simulation', 'error');
      }
    } catch (error) {
      console.error('Error joining simulation:', error);
      showAlert('An error occurred while joining the simulation', 'error');
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
        <p className="text-slate-400 mt-2 text-lg">Practice trading, compete with other students, and improve your investment skills.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-[#253047] overflow-x-auto scrollbar-hide">
        {['All', 'Live', 'Upcoming', 'Completed'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
              filter === tab 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          Loading simulations...
        </div>
      ) : filteredSimulations.length === 0 ? (
        <div className="bg-[#111827] rounded-2xl border border-[#253047] shadow-lg p-12 text-center text-slate-400">
          No simulations found matching this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredSimulations.map((sim) => {
            const joined = hasJoined(sim._id);
            const participation = getParticipation(sim._id);
            
            return (
              <div key={sim._id} className="bg-[#111827] rounded-2xl border border-[#253047] shadow-lg p-6 hover:shadow-xl hover:border-[#253047]/80 transition-all relative overflow-hidden flex flex-col group">
                <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${
                  sim.status === 'ACTIVE' ? 'bg-emerald-500 group-hover:bg-emerald-400' :
                  sim.status === 'ENDED' ? 'bg-slate-500' : 'bg-amber-500'
                }`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`text-xs px-2.5 py-0.5 rounded font-bold uppercase tracking-wider mb-3 inline-flex items-center gap-1.5 border ${
                      sim.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      sim.status === 'ENDED' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 
                      'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {sim.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                      {sim.status === 'PUBLISHED' ? 'Upcoming' : sim.status}
                    </span>
                    <h2 className="text-xl font-bold text-white mt-1 group-hover:text-indigo-400 transition-colors">{sim.name}</h2>
                  </div>
                </div>
                
                <p className="text-slate-400 mb-6 text-sm flex-1">
                  {sim.description}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex items-center gap-1 text-slate-500">
                      <DollarSign className="w-3.5 h-3.5" /> Capital
                    </div>
                    <span className="font-semibold text-white">{(sim.initialBalance / 1000000).toFixed(0)}M ₫</span>
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex items-center gap-1 text-slate-500">
                      <BarChart2 className="w-3.5 h-3.5" /> Market
                    </div>
                    <span className="font-semibold text-white">{sim.market || 'VN'}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" /> Ends
                    </div>
                    <span className="font-semibold text-white">{new Date(sim.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {joined ? (
                  <>
                    <div className="bg-[#172033] p-4 rounded-xl border border-[#253047] flex justify-between items-center mb-6">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Your Return</p>
                        <p className={`text-lg font-bold ${participation.returnRate >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {participation.returnRate > 0 ? '+' : ''}{participation.returnRate.toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Status</p>
                        <p className="text-sm font-bold text-indigo-400">Joined</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-auto">
                      <Link to={`/trade/${sim._id}`} className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                        Enter Simulation
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link to={`/leaderboard?sim=${sim._id}`} className="bg-[#172033] hover:bg-[#253047] text-white border border-[#253047] font-medium py-2.5 px-4 rounded-lg transition-colors">
                        Leaderboard
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-3 mt-auto pt-6 border-t border-[#253047]">
                    <button 
                      onClick={() => handleJoinSimulation(sim._id)}
                      disabled={joiningId === sim._id || sim.status === 'ENDED'}
                      className="flex-1 text-center bg-[#172033] hover:bg-[#253047] text-indigo-400 border border-indigo-500/30 font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {joiningId === sim._id ? (
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <PlusCircle className="w-5 h-5" />
                      )}
                      Join Simulation
                    </button>
                    <Link to={`/leaderboard?sim=${sim._id}`} className="bg-[#172033] hover:bg-[#253047] text-white border border-[#253047] font-medium py-2.5 px-4 rounded-lg transition-colors">
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
