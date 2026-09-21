import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Square, Users, Edit3, Settings, UserPlus, Search, Filter, MoreVertical, Trash2, Copy, BarChart3, Clock, Target, PlusCircle, Activity } from 'lucide-react';
import { SimulationModal } from './components/SimulationModal';
import { ParticipantsModal } from './components/ParticipantsModal';

export const LecturerSimulations = () => {
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [simulationToEdit, setSimulationToEdit] = useState<any>(null);
  const [simulationForParticipants, setSimulationForParticipants] = useState<any>(null);
  
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const fetchSimulations = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/simulations`, { credentials: 'include' });
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/simulations/${id}/${action}`, { 
        credentials: 'include',
        method: 'PATCH',
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
    setOpenDropdownId(null);
  };

  const handleOpenParticipantsModal = (sim: any) => {
    setSimulationForParticipants(sim);
    setIsParticipantsModalOpen(true);
    setOpenDropdownId(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredSimulations = simulations.filter(sim => {
    const matchesSearch = sim.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'All') return matchesSearch;
    if (activeTab === 'Live') return matchesSearch && sim.status === 'ACTIVE';
    if (activeTab === 'Upcoming') return matchesSearch && sim.status === 'PUBLISHED';
    if (activeTab === 'Completed') return matchesSearch && sim.status === 'ENDED';
    if (activeTab === 'Draft') return matchesSearch && sim.status === 'DRAFT';
    return matchesSearch;
  });

  const getStatusCounts = () => {
    return {
      All: simulations.length,
      Live: simulations.filter(s => s.status === 'ACTIVE').length,
      Upcoming: simulations.filter(s => s.status === 'PUBLISHED').length,
      Completed: simulations.filter(s => s.status === 'ENDED').length,
      Draft: simulations.filter(s => s.status === 'DRAFT').length,
    };
  };
  const counts = getStatusCounts();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Simulations</h1>
          <p className="text-slate-400 mt-2 text-lg">Create, manage and monitor trading simulations.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Create Simulation
        </button>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-[#253047] pb-4">
        <div className="flex overflow-x-auto scrollbar-hide gap-2">
          {['All', 'Live', 'Upcoming', 'Completed', 'Draft'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#172033] border border-transparent'
              }`}
            >
              {tab} <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-indigo-600/20' : 'bg-[#253047]'}`}>{(counts as any)[tab]}</span>
            </button>
          ))}
        </div>
        
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400" />
            <input
              type="text"
              placeholder="Search simulations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#111827] border border-[#253047] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full md:w-64 transition-colors"
            />
          </div>
          <button className="p-2 border border-[#253047] rounded-lg text-slate-400 hover:text-white hover:bg-[#172033] transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Simulation Cards */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          Loading simulations...
        </div>
      ) : filteredSimulations.length === 0 ? (
        <div className="bg-[#111827] rounded-2xl border border-[#253047] py-20 text-center flex flex-col items-center justify-center">
          <Target className="w-16 h-16 text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No simulations found</h3>
          <p className="text-slate-400 mb-6">Create your first trading simulation to get started.</p>
          <button onClick={handleOpenCreateModal} className="bg-[#172033] hover:bg-[#253047] text-white border border-[#253047] px-6 py-2 rounded-lg transition-colors font-medium">
            + Create Simulation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSimulations.map((sim) => (
            <div key={sim._id} className="bg-[#111827] rounded-2xl border border-[#253047] overflow-hidden group hover:border-indigo-500/30 transition-all shadow-lg relative flex flex-col">
              {/* Top border colored by status */}
              <div className={`absolute top-0 left-0 w-full h-1 ${
                sim.status === 'ACTIVE' ? 'bg-emerald-500' :
                sim.status === 'PUBLISHED' ? 'bg-indigo-500' :
                sim.status === 'ENDED' ? 'bg-slate-600' : 'bg-amber-500'
              }`} />

              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                    sim.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    sim.status === 'PUBLISHED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                    sim.status === 'ENDED' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {sim.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                    {sim.status === 'PUBLISHED' ? 'UPCOMING' : sim.status}
                  </span>

                  {/* Dropdown Menu */}
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === sim._id ? null : sim._id);
                      }}
                      className="text-slate-500 hover:text-white p-1 rounded-md hover:bg-[#172033]"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {openDropdownId === sim._id && (
                      <div className="absolute right-0 mt-1 w-48 bg-[#172033] border border-[#253047] rounded-lg shadow-xl z-10 py-1 overflow-hidden">
                        <button onClick={() => handleOpenEditModal(sim)} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-indigo-500/20 flex items-center gap-2">
                          <Edit3 className="w-4 h-4" /> Edit Details
                        </button>
                        <button onClick={() => handleOpenParticipantsModal(sim)} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-indigo-500/20 flex items-center gap-2">
                          <UserPlus className="w-4 h-4" /> Participants
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-indigo-500/20 flex items-center gap-2">
                          <Copy className="w-4 h-4" /> Duplicate
                        </button>
                        <div className="h-px bg-[#253047] my-1" />
                        <button className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{sim.name}</h3>
                <p className="text-sm text-slate-400 line-clamp-2 min-h-[40px] mb-6">
                  {sim.description || 'No description provided.'}
                </p>

                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs uppercase mb-1">Market</p>
                    <p className="text-white font-medium flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-indigo-400" />
                      {sim.market || 'Vietnam'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase mb-1">Capital</p>
                    <p className="text-white font-medium flex items-center gap-1.5 font-mono">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      {(sim.initialBalance / 1000000).toLocaleString()}M VND
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase mb-1">Participants</p>
                    <p className="text-white font-medium flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-400" />
                      ? Students
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase mb-1">Duration</p>
                    <p className="text-white font-medium flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-rose-400" />
                      {new Date(sim.startDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {new Date(sim.endDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 border-t border-[#253047] bg-[#172033]/50 flex gap-2">
                {(sim.status === 'DRAFT' || sim.status === 'PUBLISHED') && (
                  <button onClick={() => handleUpdateStatus(sim._id, 'start')} className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-2 rounded-lg font-medium text-sm transition-colors">
                    <Play className="w-4 h-4 fill-current" /> Start
                  </button>
                )}
                {sim.status === 'ACTIVE' && (
                  <button onClick={() => handleUpdateStatus(sim._id, 'end')} className="flex-1 flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-2 rounded-lg font-medium text-sm transition-colors">
                    <Square className="w-4 h-4 fill-current" /> End
                  </button>
                )}
                <Link to={`/lecturer/simulations/${sim._id}/results`} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
                  <BarChart3 className="w-4 h-4" /> Results
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals remain mostly unchanged in logic, but UI can be updated internally */}
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
