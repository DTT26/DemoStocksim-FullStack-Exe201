import { useState, useEffect } from 'react';
import { X, Check, ChevronRight, ChevronLeft, Target, BookOpen, AlertCircle, Calendar } from 'lucide-react';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  assignmentToEdit?: any | null;
  simulations: any[];
}

export const AssignmentModal = ({ isOpen, onClose, onSaved, assignmentToEdit, simulations }: AssignmentModalProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    symbol: 'FPT',
    description: '',
    instructions: '',
    simulationId: '',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError('');
      if (assignmentToEdit) {
        setFormData({
          title: assignmentToEdit.title || '',
          symbol: assignmentToEdit.symbol || 'FPT',
          description: assignmentToEdit.description || '',
          instructions: assignmentToEdit.instructions || '',
          simulationId: assignmentToEdit.simulationId?._id || assignmentToEdit.simulationId || '',
          deadline: assignmentToEdit.deadline ? new Date(assignmentToEdit.deadline).toISOString().split('T')[0] : '',
        });
      } else {
        setFormData({
          title: '',
          symbol: 'FPT',
          description: '',
          instructions: '',
          simulationId: simulations.length > 0 ? simulations[0]._id : '',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
      }
    }
  }, [assignmentToEdit, isOpen, simulations]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(s => Math.min(3, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      const url = assignmentToEdit 
        ? `${apiUrl}/assignments/${assignmentToEdit._id}` 
        : `${apiUrl}/assignments`;
        
      const method = assignmentToEdit ? 'PUT' : 'POST';

      const response = await fetch(url, { 
        credentials: 'include',
        method,
        headers: { 'Content-Type': 'application/json' },
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

  const steps = [
    { num: 1, title: 'Details', icon: <Target className="w-4 h-4" /> },
    { num: 2, title: 'Content', icon: <BookOpen className="w-4 h-4" /> },
    { num: 3, title: 'Review', icon: <Check className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#080C14]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-[#253047]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#253047] flex justify-between items-center bg-[#172033]">
          <h2 className="text-xl font-bold text-white">
            {assignmentToEdit ? 'Edit Assignment' : 'Create New Assignment'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-[#253047] rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Stepper */}
        <div className="px-6 py-4 bg-[#111827] border-b border-[#253047]">
          <div className="flex items-center justify-between max-w-md mx-auto">
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
          
          <div className="max-w-xl mx-auto py-2">
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-white mb-4">Assignment Details</h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Assignment Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Technical Analysis on VN30"
                      className="w-full px-4 py-2.5 bg-[#172033] border border-[#253047] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-slate-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Link to Simulation *</label>
                    <select
                      name="simulationId"
                      required
                      value={formData.simulationId}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-[#172033] border border-[#253047] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
                    >
                      <option value="" disabled>Select a simulation...</option>
                      {simulations.map(sim => (
                        <option key={sim._id} value={sim._id}>{sim.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Target Stock Symbol (Mã cổ phiếu) *</label>
                    <input
                      type="text"
                      name="symbol"
                      required
                      value={formData.symbol}
                      onChange={handleChange}
                      placeholder="e.g. FPT, HPG, VNM, VN30"
                      className="w-full px-4 py-2.5 bg-[#172033] border border-[#253047] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-slate-500 font-mono uppercase"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Deadline *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="date"
                        name="deadline"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.deadline}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#172033] border border-[#253047] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-white mb-4">Assignment Content</h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Brief Description</label>
                    <textarea
                      name="description"
                      rows={2}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Short summary of what students will do..."
                      className="w-full px-4 py-2.5 bg-[#172033] border border-[#253047] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-slate-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Requirements / Instructions</label>
                    <textarea
                      name="instructions"
                      rows={6}
                      value={formData.instructions}
                      onChange={handleChange}
                      placeholder="Detailed instructions, rules, or questions for students..."
                      className="w-full px-4 py-2.5 bg-[#172033] border border-[#253047] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-slate-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-white mb-4">Review Assignment</h3>
                
                <div className="bg-[#172033] border border-[#253047] rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4 pb-4 border-b border-[#253047]">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Title</p>
                      <p className="text-white font-medium">{formData.title || <span className="text-rose-400">Required</span>}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Linked Simulation</p>
                      <p className="text-indigo-400 font-medium">
                        {simulations.find(s => s._id === formData.simulationId)?.name || <span className="text-rose-400">Required</span>}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pb-4 border-b border-[#253047]">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Description</p>
                    <p className="text-white text-sm whitespace-pre-line">{formData.description || 'No description provided'}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Deadline</p>
                      <p className="text-emerald-400 font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> {formData.deadline}
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
            
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && (!formData.title || !formData.simulationId || !formData.deadline)}
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
                {assignmentToEdit ? 'Save Changes' : 'Create Assignment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
