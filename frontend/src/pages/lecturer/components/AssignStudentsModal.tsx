import { useState, useEffect } from 'react';
import { X, Search, Check, Users, User, ShieldAlert } from 'lucide-react';

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
      setSearchTerm('');
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/users?role=student`, { credentials: 'include' });
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/assignments/${assignment._id}/assign`, { 
        credentials: 'include',
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
      const filteredIds = filteredStudents.map(s => s._id);
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#080C14]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border border-[#253047]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#253047] flex justify-between items-center bg-[#172033]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Assign to Students
            </h2>
            <p className="text-sm text-slate-400 mt-1">Assignment: <span className="text-white font-medium">{assignment?.title}</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-[#253047] rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-hidden flex flex-col gap-4 bg-[#111827]">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search students by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#172033] border border-[#253047] rounded-lg py-2.5 pl-9 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors text-sm placeholder-slate-500"
            />
          </div>

          {/* Selection Controls */}
          <div className="flex justify-between items-center px-1">
            <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                {selectedIds.length}
              </div>
              Students Selected
            </span>
            <button 
              onClick={toggleAll}
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {allFilteredSelected ? 'Deselect All Filtered' : 'Select All Filtered'}
            </button>
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-y-auto bg-[#172033] rounded-xl border border-[#253047]">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-full min-h-[200px] text-slate-500">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                Loading students...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full min-h-[200px] text-slate-500 p-6 text-center">
                <ShieldAlert className="w-10 h-10 mb-3 opacity-20" />
                <p>No students found.</p>
                {searchTerm && <p className="text-sm mt-1">Try adjusting your search query.</p>}
              </div>
            ) : (
              <ul className="divide-y divide-[#253047]">
                {filteredStudents.map(student => {
                  const isSelected = selectedIds.includes(student._id);
                  return (
                    <li 
                      key={student._id}
                      onClick={() => toggleStudent(student._id)}
                      className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-500/5 hover:bg-indigo-500/10' : 'hover:bg-[#111827]'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected 
                            ? 'bg-indigo-600 border-indigo-600' 
                            : 'border-[#3b4b72] bg-[#111827]'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-[#253047] text-slate-400'
                        }`}>
                          {student.name ? student.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-bold ${isSelected ? 'text-indigo-400' : 'text-white'}`}>
                            {student.name || 'Unknown User'}
                          </span>
                          <span className="text-slate-500 text-xs">{student.email}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#253047] flex justify-end gap-3 bg-[#172033]">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Check className="w-4 h-4" />
            )}
            Save Assignments
          </button>
        </div>
      </div>
    </div>
  );
};
