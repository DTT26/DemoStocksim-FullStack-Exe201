import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Square, Users, Edit3, Settings, UserPlus } from 'lucide-react';
import { SimulationModal } from './components/SimulationModal';
import { ParticipantsModal } from './components/ParticipantsModal';

export const LecturerSimulations = () => {
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [simulationToEdit, setSimulationToEdit] = useState<any>(null);
  const [simulationForParticipants, setSimulationForParticipants] = useState<any>(null);

  const fetchSimulations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/simulations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSimulations(data);
      }
    } catch (error) {
      console.error('Error fetching simulations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulations();
  }, []);

  const handleUpdateStatus = async (id: string, action: 'start' | 'end') => {
    if (!window.confirm(`Are you sure you want to ${action} this simulation?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/simulations/${id}/${action}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchSimulations();
      }
    } catch (error) {
      console.error(`Error ${action}ing simulation:`, error);
    }
  };

  const handleOpenCreateModal = () => {
    setSimulationToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sim: any) => {
    setSimulationToEdit(sim);
    setIsModalOpen(true);
  };

  const handleOpenParticipantsModal = (sim: any) => {
    setSimulationForParticipants(sim);
    setIsParticipantsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Manage Simulations</h1>
          <p className="text-[#787b86] mt-2 text-lg">Create and configure trading simulations for your students.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2"
        >
          <Settings className="w-5 h-5" />
          Create Simulation
        </button>
      </div>

      <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#131722] border-b border-[#2a2e39] text-[#787b86] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Simulation Name</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Initial Balance</th>
                <th className="px-6 py-4 font-semibold text-center">Duration</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#787b86]">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading simulations...
                    </div>
                  </td>
                </tr>
              ) : simulations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#787b86]">
                    No simulations found. Create one to get started.
                  </td>
                </tr>
              ) : (
                simulations.map((sim) => (
                  <tr key={sim._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <h4 className="font-bold text-white text-base group-hover:text-blue-600 transition-colors">{sim.name}</h4>
                        <p className="text-xs text-[#787b86] mt-1 truncate max-w-xs">{sim.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs px-2.5 py-1.5 rounded-md font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                        sim.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                        sim.status === 'ENDED' ? 'bg-[#2a2e39] text-[#d1d4dc]' : 
                        sim.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {sim.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                        {sim.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium">
                      {(sim.initialBalance / 1000000).toFixed(0)}M
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-medium text-[#d1d4dc]">
                        {new Date(sim.startDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-[#787b86] mt-0.5">
                        to {new Date(sim.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(sim)}
                          className="p-2 text-[#787b86] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Simulation"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        
                        <button 
                          onClick={() => handleOpenParticipantsModal(sim)}
                          className="p-2 text-[#787b86] hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Manage Participants"
                        >
                          <UserPlus className="w-5 h-5" />
                        </button>

                        <Link 
                          to={`/leaderboard?sim=${sim._id}`}
                          className="p-2 text-[#787b86] hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Leaderboard"
                        >
                          <Users className="w-5 h-5" />
                        </Link>

                        {(sim.status === 'DRAFT' || sim.status === 'PUBLISHED') && (
                          <button 
                            onClick={() => handleUpdateStatus(sim._id, 'start')}
                            className="p-2 text-emerald-600 hover:text-white hover:bg-emerald-600 bg-emerald-50 rounded-lg transition-colors ml-2"
                            title="Start Simulation"
                          >
                            <Play className="w-5 h-5 fill-current" />
                          </button>
                        )}
                        
                        {sim.status === 'ACTIVE' && (
                          <button 
                            onClick={() => handleUpdateStatus(sim._id, 'end')}
                            className="p-2 text-red-600 hover:text-white hover:bg-red-600 bg-red-50 rounded-lg transition-colors ml-2"
                            title="End Simulation"
                          >
                            <Square className="w-5 h-5 fill-current" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <SimulationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        simulationToEdit={simulationToEdit}
        onSaved={() => {
          setIsModalOpen(false);
          fetchSimulations();
        }}
      />
      
      <ParticipantsModal
        isOpen={isParticipantsModalOpen}
        onClose={() => setIsParticipantsModalOpen(false)}
        simulation={simulationForParticipants}
      />
    </div>
  );
};
