import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  simulationToEdit?: any | null;
}

export const SimulationModal = ({ isOpen, onClose, onSaved, simulationToEdit }: SimulationModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    initialBalance: 100000000,
    market: 'VN',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (simulationToEdit) {
      setFormData({
        name: simulationToEdit.name || '',
        description: simulationToEdit.description || '',
        initialBalance: simulationToEdit.initialBalance || 10000,
        market: simulationToEdit.market || 'GLOBAL',
        startDate: simulationToEdit.startDate ? new Date(simulationToEdit.startDate).toISOString().split('T')[0] : '',
        endDate: simulationToEdit.endDate ? new Date(simulationToEdit.endDate).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        initialBalance: 10000,
        market: 'GLOBAL',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    }
  }, [simulationToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      const url = simulationToEdit 
        ? `${apiUrl}/simulations/${simulationToEdit._id}` 
        : `${apiUrl}/simulations`;
        
      const method = simulationToEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
      setError(err.message || 'Failed to save simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e222d] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[#2a2e39] flex justify-between items-center bg-[#131722]">
          <h2 className="text-xl font-bold text-white">
            {simulationToEdit ? 'Edit Simulation' : 'Create New Simulation'}
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
          
          <form id="simulation-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#d1d4dc] mb-2">Simulation Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Summer 2026 Trading Challenge"
                className="w-full px-4 py-2.5 bg-[#131722] border border-[#2a2e39] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-[#1e222d] transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-[#d1d4dc] mb-2">Description</label>
              <textarea
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the rules and goals of this simulation..."
                className="w-full px-4 py-2.5 bg-[#131722] border border-[#2a2e39] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-[#1e222d] transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#d1d4dc] mb-2">Initial Balance (USD)</label>
                <input
                  type="number"
                  name="initialBalance"
                  required
                  min="0"
                  step="1000"
                  value={formData.initialBalance}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#131722] border border-[#2a2e39] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-[#1e222d] transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#d1d4dc] mb-2">Market</label>
                <select
                  name="market"
                  value={formData.market}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#131722] border border-[#2a2e39] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-[#1e222d] transition-colors"
                >
                  <option value="GLOBAL">Crypto & US Stocks</option>
                  <option value="CRYPTO">Crypto Only</option>
                  <option value="US">US Stocks Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#d1d4dc] mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#131722] border border-[#2a2e39] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-[#1e222d] transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#d1d4dc] mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  required
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#131722] border border-[#2a2e39] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-[#1e222d] transition-colors"
                />
              </div>
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
            form="simulation-form"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {simulationToEdit ? 'Save Changes' : 'Create Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
};
