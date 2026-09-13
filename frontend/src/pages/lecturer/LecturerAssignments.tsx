import { useState, useEffect } from 'react';
import { Settings, Edit3, CheckCircle, Clock, Users } from 'lucide-react';
import { AssignmentModal } from './components/AssignmentModal';
import { AssignStudentsModal } from './components/AssignStudentsModal';

export const LecturerAssignments = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<any>(null);
  const [assignmentToAssign, setAssignmentToAssign] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const headers = { 'Authorization': `Bearer ${token}` };

      const [assRes, simRes] = await Promise.all([
        fetch(`${apiUrl}/assignments`, { headers }),
        fetch(`${apiUrl}/simulations`, { headers })
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
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/assignments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Manage Assignments</h1>
          <p className="text-[#787b86] mt-2 text-lg">Create trading assignments and evaluate student submissions.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2"
        >
          <Settings className="w-5 h-5" />
          Create Assignment
        </button>
      </div>

      <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#131722] border-b border-[#2a2e39] text-[#787b86] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Assignment Title</th>
                <th className="px-6 py-4 font-semibold">Simulation</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Deadline</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#787b86]">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading assignments...
                    </div>
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#787b86]">
                    No assignments found. Create one to get started.
                  </td>
                </tr>
              ) : (
                assignments.map((ass) => (
                  <tr key={ass._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <h4 className="font-bold text-white text-base group-hover:text-blue-600 transition-colors">{ass.title}</h4>
                        <p className="text-xs text-[#787b86] mt-1 truncate max-w-xs">{ass.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#d1d4dc] font-medium">
                      {ass.simulationId?.name || 'Unknown Simulation'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs px-2.5 py-1.5 rounded-md font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                        ass.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-[#2a2e39] text-[#d1d4dc]'
                      }`}>
                        {ass.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-medium text-[#d1d4dc] flex items-center justify-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#787b86]" />
                        {new Date(ass.deadline).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenAssignModal(ass)}
                          className="p-2 text-[#787b86] hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Assign to Students"
                        >
                          <Users className="w-5 h-5" />
                        </button>
                        
                        <button 
                          onClick={() => handleOpenEditModal(ass)}
                          className="p-2 text-[#787b86] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Assignment"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>

                        {ass.status === 'OPEN' ? (
                          <button 
                            onClick={() => handleUpdateStatus(ass._id, 'CLOSED')}
                            className="p-2 text-amber-600 hover:text-white hover:bg-amber-600 bg-amber-50 rounded-lg transition-colors ml-2"
                            title="Close Assignment"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateStatus(ass._id, 'OPEN')}
                            className="p-2 text-emerald-600 hover:text-white hover:bg-emerald-600 bg-emerald-50 rounded-lg transition-colors ml-2"
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
    </div>
  );
};
