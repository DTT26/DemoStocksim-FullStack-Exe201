import { useState, useEffect } from 'react';
import { X, UserPlus, User, Search, Users, ShieldAlert, Mail, Trash2, Check, Clock } from 'lucide-react';
import { ConfirmModal } from '../../../components/ConfirmModal';

interface ParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulation: any | null;
}

export const ParticipantsModal = ({ isOpen, onClose, simulation }: ParticipantsModalProps) => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, studentId: string|null}>({
    isOpen: false, studentId: null
  });

  useEffect(() => {
    if (isOpen && simulation) {
      setSearchQuery('');
      setSelectedStudent('');
      fetchData();
    }
  }, [isOpen, simulation]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const headers = {};

      const [partRes, stuRes] = await Promise.all([
        fetch(`${apiUrl}/simulations/${simulation._id}/participants`, { credentials: 'include', headers }),
        fetch(`${apiUrl}/users?role=student`, { credentials: 'include', headers })
      ]);

      if (partRes.ok && stuRes.ok) {
        setParticipants(await partRes.json());
        setAllStudents(await stuRes.json());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (participantId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiUrl}/simulations/${simulation._id}/participants/${participantId}/approve`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (participantId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiUrl}/simulations/${simulation._id}/participants/${participantId}/reject`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudent) return;
    setAdding(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      const response = await fetch(`${apiUrl}/simulations/${simulation._id}/add-student`, { 
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudent })
      });

      if (response.ok) {
        const newParticipant = await response.json();
        setParticipants([...participants, newParticipant]);
        setSelectedStudent('');
        setSearchQuery('');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add student');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while adding student');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/simulations/${simulation._id}/participants/${studentId}`, { 
        credentials: 'include',
        method: 'DELETE',
      });

      if (response.ok) {
        setParticipants(participants.filter(p => (p.userId?._id || p.userId) !== studentId));
        setConfirmState({ isOpen: false, studentId: null });
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to remove student');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while removing student');
    }
  };

  if (!isOpen || !simulation) return null;

  const isEnded = simulation.status === 'ENDED';

  const participantIds = participants.map(p => p.userId?._id || p.userId);
  const availableStudents = allStudents.filter(stu => !participantIds.includes(stu._id));
  const filteredAvailable = availableStudents.filter(stu => 
    (stu.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (stu.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const pendingParticipants = participants.filter(p => p.status === 'PENDING');
  const activeParticipants = participants.filter(p => p.status === 'ACTIVE' || !p.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#080C14]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#253047]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#253047] flex justify-between items-center bg-[#172033]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Manage Participants
            </h2>
            <p className="text-sm text-slate-400 mt-1">{simulation.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-[#253047] rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 flex flex-col bg-[#111827] gap-6">
          {error && (
            <div className="p-4 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-sm flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Pending Requests Section */}
          {pendingParticipants.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Yêu cầu chờ duyệt ({pendingParticipants.length})
              </h3>
              <ul className="divide-y divide-amber-500/20">
                {pendingParticipants.map(p => (
                  <li key={p._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        {p.userId?.name ? p.userId.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{p.userId?.name || 'Student'}</p>
                        <p className="text-xs text-slate-400">{p.userId?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(p._id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(p._id)}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Từ chối
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add Student Section */}
          {!isEnded && (
            <div className="bg-[#172033] p-5 rounded-xl border border-[#253047]">
              <label className="block text-sm font-semibold text-white mb-3">Add Student Directly</label>
            
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search available students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#111827] border border-[#253047] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-slate-500 text-sm"
                  />
                </div>
              </div>

              {searchQuery && (
                <div className="mt-2 border border-[#253047] rounded-lg overflow-hidden max-h-40 overflow-y-auto bg-[#111827]">
                  {filteredAvailable.length > 0 ? (
                    <ul className="divide-y divide-[#253047]">
                      {filteredAvailable.map(stu => (
                        <li 
                          key={stu._id} 
                          onClick={() => { setSelectedStudent(stu._id); setSearchQuery(stu.name || stu.email); }}
                          className="px-4 py-2 hover:bg-[#172033] cursor-pointer text-sm flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                              {stu.name ? stu.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
                            </div>
                            <span className="text-white">{stu.name || stu.email}</span>
                          </div>
                          <span className="text-xs text-slate-500">{stu.email}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500 text-center">No students found matching "{searchQuery}"</div>
                  )}
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAddStudent}
                  disabled={adding || !selectedStudent}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium text-sm shadow-lg shadow-indigo-600/20"
                >
                  {adding ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  Add Selected Student
                </button>
              </div>
            </div>
          )}

          {/* Current Active Participants List */}
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              Active Participants 
              <span className="bg-[#253047] text-slate-300 px-2 py-0.5 rounded-full text-xs">{activeParticipants.length}</span>
            </h3>
            
            <div className="bg-[#172033] border border-[#253047] rounded-xl overflow-hidden flex-1 flex flex-col">
              {loading ? (
                <div className="p-12 flex flex-col items-center justify-center text-slate-500">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  Loading participants...
                </div>
              ) : activeParticipants.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-slate-500">
                  <Users className="w-12 h-12 mb-4 opacity-20" />
                  <p>No active participants yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-[#253047] overflow-y-auto">
                  {activeParticipants.map(p => (
                    <li key={p._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-[#111827] transition-colors gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md">
                          {p.userId?.name ? p.userId.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-white">{p.userId?.name || 'Unknown User'}</p>
                          <p className="text-sm text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {p.userId?.email}
                          </p>
                        </div>
                      </div>
                      <div className="sm:text-right flex items-center sm:block bg-[#111827] sm:bg-transparent p-2 sm:p-0 rounded-lg border border-[#253047] sm:border-none">
                        <span className="text-xs font-medium text-slate-500 mr-2 sm:mr-0 sm:block sm:mb-1">Joined</span>
                        <p className="text-sm font-medium text-slate-300">
                          {new Date(p.joinedAt || p.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      {!isEnded && (
                        <button 
                          onClick={() => setConfirmState({ isOpen: true, studentId: p.userId?._id || p.userId })}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-2"
                          title="Remove student"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, studentId: null })}
        onConfirm={() => {
          if (confirmState.studentId) {
            handleRemoveStudent(confirmState.studentId);
          }
        }}
        title="Remove Student"
        message="Are you sure you want to remove this student from the simulation? This action cannot be undone."
        confirmText="Remove Student"
        type="danger"
      />
    </div>
  );
};
