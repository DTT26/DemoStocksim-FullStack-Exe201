import { useState, useEffect } from 'react';
import { X, Check, ChevronRight, ChevronLeft, Target, Users, Settings as SettingsIcon, AlertCircle } from 'lucide-react';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  simulationToEdit?: any | null;
}

export const SimulationModal = ({ isOpen, onClose, onSaved, simulationToEdit }: SimulationModalProps) => {
  const [step, setStep] = useState(1);
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
        initialBalance: simulationToEdit.initialBalance || 100000000,
        market: simulationToEdit.market || 'GLOBAL',
        startDate: simulationToEdit.startDate ? new Date(simulationToEdit.startDate).toISOString().split('T')[0] : '',
        endDate: simulationToEdit.endDate ? new Date(simulationToEdit.endDate).toISOString().split('T')[0] : '',
      });
    }
  }, [simulationToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(s => Math.min(4, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const url = simulationToEdit 
        ? `${apiUrl}/simulations/${simulationToEdit._id}` 
        : `${apiUrl}/simulations`;
      const method = simulationToEdit ? 'PUT' : 'POST';

      const response = await fetch(url, { 
        credentials: 'include',
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          initialBalance: formData.initialBalance,
          market: formData.market,
          startDate: formData.startDate,
          endDate: formData.endDate
        })
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

  const steps = [
    { num: 1, title: 'Basic Info', icon: <Target className="w-4 h-4" /> },
    { num: 2, title: 'Trading Settings', icon: <SettingsIcon className="w-4 h-4" /> },
    { num: 3, title: 'Students', icon: <Users className="w-4 h-4" /> },
    { num: 4, title: 'Review', icon: <Check className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#080C14]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] border border-[#253047]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#253047] flex justify-between items-center bg-[#172033]">
          <h2 className="text-xl font-bold text-white">
            {simulationToEdit ? 'Edit Simulation' : 'Create New Simulation'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-[#253047] rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Stepper */}
        <div className="px-6 py-4 bg-[#111827] border-b border-[#253047] overflow-x-auto scrollbar-hide">
          <div className="flex items-center min-w-[600px]">
            {steps.map((s, i) => (
              <div key={s.num} className="flex-1 flex items-center">
                <div className={`flex flex-col items-center gap-2 w-full relative ${s.num <= step ? 'text-indigo-400' : 'text-slate-500'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    s.num < step ? 'bg-indigo-600 border-indigo-600 text-white' : 
                    s.num === step ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 
                    'border-[#253047] bg-[#172033] text-slate-500'
                  }`}>
                    {s.num < step ? <Check className="w-5 h-5" /> : s.icon}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider">{s.title}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-px w-full -mt-6 mx-2 transition-colors ${s.num < step ? 'bg-indigo-600' : 'bg-[#253047]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#111827]">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          <div className="max-w-2xl mx-auto py-2">
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Simulation Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Vietnam Stock Challenge #01"
                      className="w-full px-4 py-2.5 bg-[#172033] border border-[#253047] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-slate-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the rules and goals..."
                      className="w-full px-4 py-2.5 bg-[#172033] border border-[#253047] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-slate-500 resize-none"
                    />
                  </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-[#d1d4dc] mb-2">Vốn khởi tạo (Initial Balance)</label>
                <input
                  type="number"
                  name="initialBalance"
                  required
                  min="0"
                  step="1000"
                  value={formData.initialBalance}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#1e222d] transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-[#d1d4dc] mb-2">Thị trường (Market)</label>
                <select
                  name="market"
                  value={formData.market}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#131722] border border-slate-200 dark:border-[#2a2e39] text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#1e222d] transition-colors"
                >
                  <option value="GLOBAL">Crypto & US Stocks (Quốc tế)</option>
                  <option value="VN">Cổ phiếu Việt Nam (HOSE, HNX)</option>
                  <option value="CRYPTO">Crypto Only</option>
                  <option value="US">US Stocks Only</option>
                  <option value="FOREX">Ngoại hối (Forex)</option>
                </select>
              </div>
            </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Start Date *</label>
                      <input
                        type="date"
                        name="startDate"
                        required
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-[#172033] border border-[#253047] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white [color-scheme:dark]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">End Date *</label>
                      <input
                        type="date"
                        name="endDate"
                        required
                        min={formData.startDate}
                        value={formData.endDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-[#172033] border border-[#253047] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-white mb-4">Trading Settings</h3>
                <div className="bg-[#172033] border border-[#253047] rounded-xl p-8 flex flex-col items-center justify-center text-center">
                  <SettingsIcon className="w-12 h-12 text-slate-500 mb-4 opacity-50" />
                  <h4 className="text-white font-medium mb-2">Advanced settings are not yet supported</h4>
                  <p className="text-slate-400 text-sm max-w-md">
                    Features like Commission, Transaction Fee, Trading Limit, and Short Selling will be available in a future backend update. For now, default simulator rules apply.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-white mb-4">Add Students</h3>
                <div className="bg-[#172033] border border-[#253047] rounded-xl p-8 flex flex-col items-center justify-center text-center">
                  <Users className="w-12 h-12 text-indigo-500 mb-4 opacity-50" />
                  <h4 className="text-white font-medium mb-2">Assign Participants Later</h4>
                  <p className="text-slate-400 text-sm max-w-md">
                    To add students, please finish creating this simulation first. Then, use the "Manage Participants" action from the Simulations list to invite students.
                  </p>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-white mb-4">Review Simulation</h3>
                
                <div className="bg-[#172033] border border-[#253047] rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4 pb-4 border-b border-[#253047]">
                    <div className="col-span-3">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Name</p>
                      <p className="text-white font-medium">{formData.name || <span className="text-rose-400">Required</span>}</p>
                    </div>
                    <div className="col-span-3">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Description</p>
                      <p className="text-white text-sm">{formData.description || 'No description'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Market</p>
                      <p className="text-white font-medium flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-400" />
                        {formData.market === 'VN' ? 'Vietnam (HOSE, HNX)' : formData.market}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Initial Capital</p>
                      <p className="text-white font-medium text-emerald-400">
                        {Number(formData.initialBalance).toLocaleString('vi-VN')} VND
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Duration</p>
                      <p className="text-white text-sm">
                        {formData.startDate} → {formData.endDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#253047] flex justify-between bg-[#172033]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={handlePrev}
                className="px-6 py-2.5 text-sm font-semibold text-slate-300 bg-[#111827] border border-[#253047] rounded-lg hover:bg-[#253047] transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            
            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && (!formData.name || !formData.initialBalance || !formData.startDate || !formData.endDate)}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {simulationToEdit ? 'Save Changes' : 'Create Simulation'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
