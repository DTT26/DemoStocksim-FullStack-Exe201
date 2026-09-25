import { useState, useEffect } from 'react';
import { Edit3, CheckCircle, Clock, Users, Search, Filter, BookOpen, PlusCircle, Target, Lock, MoreVertical, ClipboardCheck, ListChecks } from 'lucide-react';
import { AssignmentModal } from './components/AssignmentModal';
import { AssignStudentsModal } from './components/AssignStudentsModal';
import { SubmissionListModal } from './components/SubmissionListModal';

export const LecturerAssignments = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<any>(null);
  const [assignmentToAssign, setAssignmentToAssign] = useState<any>(null);
  const [assignmentForSubmissions, setAssignmentForSubmissions] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const headers = { };

      const [assRes, simRes] = await Promise.all([
        fetch(`${apiUrl}/assignments`, { credentials: 'include', headers }),
        fetch(`${apiUrl}/simulations`, { credentials: 'include', headers })
      ]);

      if (assRes.ok && simRes.ok) {
        setAssignments(await assRes.json());
        setSimulations(await simRes.json());
      }
    } catch (error) {
      console.error('Error fetching assignments data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/assignments/${id}/status`, { 
        credentials: 'include',
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating assignment status:', error);
    }
  };

  const handleOpenCreateModal = () => {
    setAssignmentToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ass: any) => {
    setAssignmentToEdit(ass);
    setIsModalOpen(true);
  };

  const handleOpenAssignModal = (ass: any) => {
    setAssignmentToAssign(ass);
    setIsAssignModalOpen(true);
  };

  const filteredAssignments = assignments.filter(ass => {
    const matchesSearch = ass.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'All') return matchesSearch;
    if (activeTab === 'Open') return matchesSearch && ass.status === 'OPEN';
    if (activeTab === 'Closed') return matchesSearch && ass.status === 'CLOSED';
    if (activeTab === 'Draft') return matchesSearch && ass.status === 'DRAFT';
    return matchesSearch;
  });

  const counts = {
    All: assignments.length,
    Open: assignments.filter(a => a.status === 'OPEN').length,
    Closed: assignments.filter(a => a.status === 'CLOSED').length,
    Draft: assignments.filter(a => a.status === 'DRAFT').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Assignments</h1>
          <p className="text-slate-400 mt-2 text-lg">Create trading assignments and evaluate student submissions.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Create Assignment
        </button>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-[#253047] pb-4">
        <div className="flex overflow-x-auto scrollbar-hide gap-2">
          {['All', 'Open', 'Closed', 'Draft'].map((tab) => (
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
              placeholder="Search assignments..."
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

      {/* Data Table */}
      <div className="bg-[#111827] rounded-2xl border border-[#253047] shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#172033]/50 border-b border-[#253047] text-slate-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Assignment Details</th>
                <th className="px-6 py-4 font-semibold">Simulation</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Deadline</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#253047]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <p>Loading assignments...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <BookOpen className="w-10 h-10 opacity-20 mb-2" />
                      <p>No assignments found.</p>
                      {searchQuery && <p className="text-sm">Try adjusting your search filters.</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((ass) => (
                  <tr key={ass._id} className="hover:bg-[#172033] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg mt-0.5 ${ass.status === 'CLOSED' ? 'bg-slate-500/10 text-slate-400' : 'bg-amber-500/10 text-amber-500'}`}>
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">{ass.title}</h4>
                            {ass.symbol && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                {ass.symbol}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1 max-w-sm">{ass.description}</p>
                          {ass.requirements && ass.requirements.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-indigo-400">
                              <ListChecks className="w-3.5 h-3.5" />
                              <span>{ass.requirements.length} tiêu chí checklist</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-300 font-medium">
                        <Target className="w-4 h-4 text-emerald-500" />
                        {ass.simulationId?.name || 'Unknown Simulation'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                        ass.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        ass.status === 'DRAFT' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {ass.status === 'OPEN' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                        {ass.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-medium text-slate-300 flex items-center justify-center gap-1.5">
                        <Clock className={`w-4 h-4 ${new Date(ass.deadline) < new Date() ? 'text-rose-400' : 'text-slate-500'}`} />
                        <span className={new Date(ass.deadline) < new Date() ? 'text-rose-400' : ''}>
                          {new Date(ass.deadline).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setAssignmentForSubmissions(ass)}
                          className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          title="Xem bài nộp và chấm điểm"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                          <span>Bài nộp ({ass.submissionCount || 0})</span>
                        </button>

                        <button 
                          onClick={() => handleOpenAssignModal(ass)}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="Assign to Students"
                        >
                          <Users className="w-5 h-5" />
                        </button>
                        
                        <button 
                          onClick={() => handleOpenEditModal(ass)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                          title="Edit Assignment"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>

                        {ass.status === 'OPEN' ? (
                          <button 
                            onClick={() => handleUpdateStatus(ass._id, 'CLOSED')}
                            className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
                            title="Close Assignment"
                          >
                            <Lock className="w-5 h-5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateStatus(ass._id, 'OPEN')}
                            className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors ml-1"
                            title="Open Assignment"
                          >
                            <CheckCircle className="w-5 h-5" />
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
      
      <AssignmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        simulations={simulations}
        assignmentToEdit={assignmentToEdit}
        onSaved={() => {
          setIsModalOpen(false);
          fetchData();
        }}
      />
      
      <AssignStudentsModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        assignment={assignmentToAssign}
        onSaved={() => {
          setIsAssignModalOpen(false);
          fetchData();
        }}
      />

      <SubmissionListModal
        isOpen={!!assignmentForSubmissions}
        assignment={assignmentForSubmissions}
        onClose={() => {
          setAssignmentForSubmissions(null);
          fetchData();
        }}
      />
    </div>
  );
};
