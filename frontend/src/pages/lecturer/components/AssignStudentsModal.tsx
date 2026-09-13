import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  studentId?: string;
}

interface AssignStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: any | null;
  onSaved: () => void;
}

export const AssignStudentsModal = ({ isOpen, onClose, assignment, onSaved }: AssignStudentsModalProps) => {
  const [students, setStudents] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && assignment) {
      fetchStudents();
      // Pre-select already assigned students
      if (assignment.assignedTo && Array.isArray(assignment.assignedTo)) {
        setSelectedIds(assignment.assignedTo.map((id: any) => typeof id === 'string' ? id : id._id || id));
      } else {
        setSelectedIds([]);
      }
    }
  }, [isOpen, assignment]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/users?role=student`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setStudents(await response.json());
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!assignment) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/assignments/${assignment._id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentIds: selectedIds })
      });
      
      if (response.ok) {
        onSaved();
      }
    } catch (error) {
      console.error('Error assigning students:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleStudent = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredStudents.length && filteredStudents.length > 0) {
      // If all currently filtered are selected, unselect them from the overall list
      const filteredIds = filteredStudents.map(s => s._id);
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // Add all currently filtered to selection
      const filteredIds = filteredStudents.map(s => s._id);
      const newSelection = new Set([...selectedIds, ...filteredIds]);
      setSelectedIds(Array.from(newSelection));
    }
  };

  if (!isOpen) return null;

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const allFilteredSelected = filteredStudents.length > 0 && 
    filteredStudents.every(s => selectedIds.includes(s._id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e222d] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#2a2e39] overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center p-6 border-b border-[#2a2e39]">
          <div>
            <h2 className="text-xl font-bold text-white">Assign to Students</h2>
            <p className="text-sm text-[#787b86] mt-1">Assignment: <span className="text-white font-medium">{assignment?.title}</span></p>
          </div>
          <button onClick={onClose} className="text-[#787b86] hover:text-white transition-colors p-2 hover:bg-[#2a2e39] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-hidden flex flex-col gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#787b86]" />
            <input 
              type="text" 
              placeholder="Search students by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#131722] border border-[#2a2e39] rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex justify-between items-center px-2">
            <span className="text-sm font-medium text-white">
              {selectedIds.length} selected
            </span>
            <button 
              onClick={toggleAll}
              className="text-sm text-blue-500 hover:text-blue-400 font-medium"
            >
              {allFilteredSelected ? 'Deselect All Filtered' : 'Select All Filtered'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#131722] rounded-xl border border-[#2a2e39]">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="flex justify-center items-center h-32 text-[#787b86]">
                No students found.
              </div>
            ) : (
              <ul className="divide-y divide-[#2a2e39]">
                {filteredStudents.map(student => (
                  <li 
                    key={student._id}
                    onClick={() => toggleStudent(student._id)}
                    className="flex items-center gap-4 p-4 hover:bg-[#1e222d] cursor-pointer transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        selectedIds.includes(student._id) 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'border-[#787b86] bg-transparent'
                      }`}>
                        {selectedIds.includes(student._id) && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{student.name}</span>
                      <span className="text-[#787b86] text-xs">{student.email}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-[#2a2e39] bg-[#1a1e29] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-white font-medium hover:bg-[#2a2e39] transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Saving...</>
            ) : (
              'Save Assignments'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
