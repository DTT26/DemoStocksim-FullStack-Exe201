import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  assignmentToEdit?: any | null;
  simulations: any[];
}

export const AssignmentModal = ({ isOpen, onClose, onSaved, assignmentToEdit, simulations }: AssignmentModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    simulationId: '',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (assignmentToEdit) {
      setFormData({
        title: assignmentToEdit.title || '',
        description: assignmentToEdit.description || '',
        instructions: assignmentToEdit.instructions || '',
        simulationId: assignmentToEdit.simulationId?._id || assignmentToEdit.simulationId || '',
        deadline: assignmentToEdit.deadline ? new Date(assignmentToEdit.deadline).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        instructions: '',
        simulationId: simulations.length > 0 ? simulations[0]._id : '',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    }
  }, [assignmentToEdit, isOpen, simulations]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      const url = assignmentToEdit 
        ? `${apiUrl}/assignments/${assignmentToEdit._id}` 
        : `${apiUrl}/assignments`;
        
      const method = assignmentToEdit ? 'PUT' : 'POST';

      const response = await fetch(url, { credentials: 'include',
        method,
        headers: {
          'Content-Type': 'application/json',
          },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSaved();
      } else {
        const data = await response.json();
        setError(data.message || 'An error occurred');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e222d] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[#2a2e39] flex justify-between items-center bg-[#131722]">
          <h2 className="text-xl font-bold text-white">
            {assignmentToEdit ? 'Edit Assignment' : 'Create New Assignment'}
          </h2>
          <button onClick={onClose} className="p-2 text-[#787b86] hover:text-[#787b86] hover:bg-[#2a2e39] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form id="assignment-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#d1d4dc] mb-2">Assignment Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Technical Analysis on VN30"
                className="w-full px-4 py-2.5 bg-[#131722] border border-[#2a2e39] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-[#1e222d] transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#d1d4dc] mb-2">Link to Simulation</label>
                <select
                  name="simulationId"
                  required
                  value={formData.simulationId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#131722] border border-[#2a2e39] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-[#1e222d] transition-colors"
                >
                  <option value="" disabled>Select a simulation...</option>
                  {simulations.map(sim => (
                    <option key={sim._id} value={sim._id}>{sim.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#d1d4dc] mb-2">Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#131722] border border-[#2a2e39] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-[#1e222d] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#d1d4dc] mb-2">Description</label>
              <textarea
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the assignment..."
                className="w-full px-4 py-2.5 bg-[#131722] border border-[#2a2e39] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-[#1e222d] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#d1d4dc] mb-2">Requirements / Instructions</label>
              <textarea
                name="instructions"
                rows={4}
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Specific requirements for students to follow..."
                className="w-full px-4 py-2.5 bg-[#131722] border border-[#2a2e39] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-[#1e222d] transition-colors resize-none"
              />
            </div>
          </form>
        </div>
        
        <div className="px-6 py-4 border-t border-[#2a2e39] flex justify-end gap-3 bg-[#131722]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-[#d1d4dc] bg-[#1e222d] border border-[#2a2e39] rounded-lg hover:bg-[#131722] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="assignment-form"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {assignmentToEdit ? 'Save Changes' : 'Create Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
};
