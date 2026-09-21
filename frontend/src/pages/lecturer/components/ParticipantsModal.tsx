import { useState, useEffect } from 'react';
import { X, UserPlus, User } from 'lucide-react';

interface ParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulation: any | null;
}

export const ParticipantsModal = ({ isOpen, onClose, simulation }: ParticipantsModalProps) => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && simulation) {
      fetchData();
    }
  }, [isOpen, simulation]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const headers = { };

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

  const handleAddStudent = async () => {
    if (!selectedStudent) return;
    setAdding(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      const response = await fetch(`${apiUrl}/simulations/${simulation._id}/add-student`, { credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          },
        body: JSON.stringify({ studentId: selectedStudent })
      });

      if (response.ok) {
        const newParticipant = await response.json();
        setParticipants([...participants, newParticipant]);
        setSelectedStudent('');
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

  if (!isOpen || !simulation) return null;

  // Lọc ra những sinh viên chưa tham gia
  const participantIds = participants.map(p => p.userId?._id || p.userId);
  const availableStudents = allStudents.filter(stu => !participantIds.includes(stu._id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e222d] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[#2a2e39] flex justify-between items-center bg-[#131722]">
          <div>
            <h2 className="text-xl font-bold text-white">Manage Participants</h2>
            <p className="text-sm text-[#787b86]">{simulation.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-[#787b86] hover:text-[#787b86] hover:bg-[#2a2e39] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 flex flex-col">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="mb-8">
            <label className="block text-sm font-semibold text-[#d1d4dc] mb-2">Add Student to Simulation</label>
            <div className="flex gap-3">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="flex-1 px-4 py-2 bg-[#131722] border border-[#2a2e39] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a student...</option>
                {availableStudents.map(stu => (
                  <option key={stu._id} value={stu._id}>{stu.name || stu.email}</option>
                ))}
              </select>
              <button
                onClick={handleAddStudent}
                disabled={adding || !selectedStudent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 font-medium"
              >
                {adding ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Add
              </button>
            </div>
            {availableStudents.length === 0 && !loading && (
              <p className="text-xs text-amber-600 mt-2">All registered students are already in this simulation.</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#d1d4dc] mb-3 flex justify-between">
              <span>Current Participants ({participants.length})</span>
            </h3>
            
            <div className="bg-[#131722] border border-[#2a2e39] rounded-xl overflow-hidden">
              {loading ? (
                <div className="py-8 text-center text-[#787b86]">Loading participants...</div>
              ) : participants.length === 0 ? (
                <div className="py-8 text-center text-[#787b86]">No participants yet.</div>
              ) : (
                <ul className="divide-y divide-[#2a2e39] max-h-64 overflow-y-auto">
                  {participants.map(p => (
                    <li key={p._id} className="p-3 flex items-center justify-between hover:bg-[#2a2e39] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          {p.userId?.name ? p.userId.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{p.userId?.name || 'Unknown'}</p>
                          <p className="text-xs text-[#787b86]">{p.userId?.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-[#787b86]">Joined</span>
                        <p className="text-xs text-[#d1d4dc]">{new Date(p.joinedAt || p.createdAt).toLocaleDateString()}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
