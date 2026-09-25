import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, BarChart2, PlusCircle, ArrowRight } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';

export const SimulationsList = () => {
  const { showAlert } = useModal();
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
        showAlert({
          title: 'Thành công',
          message: 'Tham gia mô phỏng thành công!',
          type: 'success'
        });
      } else {
        const data = await response.json();
        showAlert({
          title: 'Tham gia mô phỏng thất bại',
          message: data.message || 'Failed to join simulation',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error joining simulation:', error);
      showAlert({
        title: 'Lỗi',
        message: 'An error occurred while joining the simulation',
        type: 'error'
      });
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Simulations</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Practice trading, compete with other students, and improve your investment skills.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#253047] overflow-x-auto scrollbar-hide">
        {['All', 'Live', 'Upcoming', 'Completed'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
              filter === tab 
                ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          Loading simulations...
        </div>
      ) : filteredSimulations.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-lg p-12 text-center text-slate-500 dark:text-slate-400">
          No simulations found matching this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredSimulations.map((sim) => {
            const joined = hasJoined(sim._id);
            const participation = getParticipation(sim._id);
            
            return (
              <div key={sim._id} className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#253047] shadow-sm dark:shadow-lg p-6 hover:shadow-md dark:hover:shadow-xl hover:border-slate-300 dark:hover:border-[#253047]/80 transition-all relative overflow-hidden flex flex-col group">
                <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${
                  sim.status === 'ACTIVE' ? 'bg-emerald-500 group-hover:bg-emerald-400' :
                  sim.status === 'ENDED' ? 'bg-slate-400 dark:bg-slate-500' : 'bg-amber-500'
                }`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`text-xs px-2.5 py-0.5 rounded font-bold uppercase tracking-wider mb-3 inline-flex items-center gap-1.5 border ${
                      sim.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20' :
                      sim.status === 'ENDED' ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' : 
                      'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20'
                    }`}>
                      {sim.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                      {sim.status === 'PUBLISHED' ? 'Upcoming' : sim.status}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{sim.name}</h2>
                  </div>
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm flex-1">
                  {sim.description}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                      <DollarSign className="w-3.5 h-3.5" /> Capital
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-white">{(sim.initialBalance / 1000000).toFixed(0)}M ₫</span>
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                      <BarChart2 className="w-3.5 h-3.5" /> Market
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-white">{sim.market || 'VN'}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                      <Calendar className="w-3.5 h-3.5" /> Ends
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-white">{new Date(sim.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {joined ? (
                  <>
                    <div className="bg-slate-50 dark:bg-[#172033] p-4 rounded-xl border border-slate-200 dark:border-[#253047] flex justify-between items-center mb-6">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Your Return</p>
                        <p className={`text-lg font-bold ${participation.returnRate >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                          {participation.returnRate > 0 ? '+' : ''}{participation.returnRate.toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Status</p>
                        <p className={`text-sm font-bold ${
                          participation.status === 'ACTIVE' ? 'text-emerald-600 dark:text-emerald-400' :
                          participation.status === 'PENDING' ? 'text-amber-600 dark:text-amber-400' :
                          participation.status === 'REJECTED' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          {participation.status === 'ACTIVE' ? 'Đã duyệt (Active)' :
                           participation.status === 'PENDING' ? 'Chờ phê duyệt' :
                           participation.status === 'REJECTED' ? 'Bị từ chối' : participation.status}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-auto">
                      {participation.status === 'ACTIVE' ? (
                        <Link to={`/trade/${sim._id}`} className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20">
                          Enter Simulation
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      ) : participation.status === 'PENDING' ? (
                        <button disabled className="flex-1 text-center bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium py-2.5 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                          Chờ Giảng viên duyệt...
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleJoinSimulation(sim._id)}
                          disabled={joiningId === sim._id}
                          className="flex-1 text-center bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          {joiningId === sim._id ? (
                            <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <PlusCircle className="w-5 h-5" />
                          )}
                          Xin nộp lại yêu cầu
                        </button>
                      )}
                      <Link to={`/leaderboard?sim=${sim._id}`} className="bg-slate-100 hover:bg-slate-200 dark:bg-[#172033] dark:hover:bg-[#253047] text-slate-800 dark:text-white border border-slate-200 dark:border-[#253047] font-medium py-2.5 px-3 rounded-lg transition-colors text-xs flex items-center">
                        Leaderboard
                      </Link>
                      <Link to="/student/journal" className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-medium py-2.5 px-3 rounded-lg transition-colors text-xs flex items-center">
                        Journal
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-3 mt-auto pt-6 border-t border-slate-200 dark:border-[#253047]">
                    <button 
                      onClick={() => handleJoinSimulation(sim._id)}
                      disabled={joiningId === sim._id || sim.status === 'ENDED'}
                      className="flex-1 text-center bg-indigo-50 hover:bg-indigo-100 dark:bg-[#172033] dark:hover:bg-[#253047] text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {joiningId === sim._id ? (
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <PlusCircle className="w-5 h-5" />
                      )}
                      Join Simulation
                    </button>
                    <Link to={`/leaderboard?sim=${sim._id}`} className="bg-slate-100 hover:bg-slate-200 dark:bg-[#172033] dark:hover:bg-[#253047] text-slate-800 dark:text-white border border-slate-200 dark:border-[#253047] font-medium py-2.5 px-4 rounded-lg transition-colors">
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
