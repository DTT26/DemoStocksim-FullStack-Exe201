import { useState, useEffect } from 'react';
import { X, Check, ChevronRight, ChevronLeft, Target, BookOpen, AlertCircle, Calendar, ListChecks, Plus, Trash2, Sparkles } from 'lucide-react';

interface RequirementItem {
  id: string;
  text: string;
}

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  assignmentToEdit?: any | null;
  simulations: any[];
}

const DEFAULT_REQUIREMENTS: RequirementItem[] = [
  { id: 'r1', text: 'Quan sát và áp dụng chỉ báo MACD trên biểu đồ' },
  { id: 'r2', text: 'Quan sát và áp dụng chỉ báo RSI trên biểu đồ' },
  { id: 'r3', text: 'Viết nhận định tóm tắt về xu hướng giá' },
  { id: 'r4', text: 'Thực hành đặt lệnh Mua (Limit BUY) trên Trading Terminal' },
  { id: 'r5', text: 'Thiết lập mức Cắt lỗ (Stop Loss) an toàn cho lệnh' }
];

const PRESET_SUGGESTIONS = [
  'Quan sát và áp dụng chỉ báo MACD trên biểu đồ',
  'Quan sát và áp dụng chỉ báo RSI trên biểu đồ',
  'Phân tích đường trung bình động MA20/MA50',
  'Thực hành đặt lệnh Mua (Limit BUY) trên Trading Terminal',
  'Thực hành đặt lệnh Bán (Limit SELL) chốt lời',
  'Thiết lập mức Cắt lỗ (Stop Loss) an toàn cho lệnh',
  'Viết nhận định tóm tắt xu hướng và khối lượng giao dịch',
  'Đạt tỷ lệ R:R (Risk/Reward) tối thiểu 1:2'
];

export const AssignmentModal = ({ isOpen, onClose, onSaved, assignmentToEdit, simulations }: AssignmentModalProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    symbol: 'FPT',
    description: '',
    instructions: '',
    simulationId: '',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    requirements: DEFAULT_REQUIREMENTS as RequirementItem[]
  });
  const [newReqText, setNewReqText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError('');
      setNewReqText('');
      if (assignmentToEdit) {
        setFormData({
          title: assignmentToEdit.title || '',
          symbol: assignmentToEdit.symbol || 'FPT',
          description: assignmentToEdit.description || '',
          instructions: assignmentToEdit.instructions || '',
          simulationId: assignmentToEdit.simulationId?._id || assignmentToEdit.simulationId || '',
          deadline: assignmentToEdit.deadline ? new Date(assignmentToEdit.deadline).toISOString().split('T')[0] : '',
          requirements: Array.isArray(assignmentToEdit.requirements) && assignmentToEdit.requirements.length > 0
            ? assignmentToEdit.requirements
            : DEFAULT_REQUIREMENTS
        });
      } else {
        setFormData({
          title: '',
          symbol: 'FPT',
          description: '',
          instructions: '',
          simulationId: simulations.length > 0 ? simulations[0]._id : '',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          requirements: [...DEFAULT_REQUIREMENTS]
        });
      }
    }
  }, [assignmentToEdit, isOpen, simulations]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddRequirement = (customText?: string) => {
    const text = (customText || newReqText).trim();
    if (!text) return;
    if (formData.requirements.some(r => r.text.toLowerCase() === text.toLowerCase())) {
      return;
    }
    const newId = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, { id: newId, text }]
    }));
    if (!customText) {
      setNewReqText('');
    }
  };

  const handleRemoveRequirement = (id: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(r => r.id !== id)
    }));
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
    { num: 2, title: 'Checklist & Content', icon: <BookOpen className="w-4 h-4" /> },
    { num: 3, title: 'Review', icon: <Check className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#080C14]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-[#253047]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#253047] flex justify-between items-center bg-[#172033]">
          <h2 className="text-xl font-bold text-white">
            {assignmentToEdit ? 'Chỉnh sửa bài tập (Edit Assignment)' : 'Tạo bài tập mới (Create Assignment)'}
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
                <h3 className="text-lg font-semibold text-white mb-4">Thông tin cơ bản (Assignment Details)</h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Tiêu đề bài tập (Title) *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Ví dụ: Phân tích kỹ thuật cổ phiếu FPT & Thực hành vào lệnh"
                      className="w-full px-4 py-2.5 bg-[#172033] border border-[#253047] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-slate-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Liên kết Kỳ mô phỏng (Linked Simulation) *</label>
                    <select
                      name="simulationId"
                      required
                      value={formData.simulationId}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-[#172033] border border-[#253047] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
                    >
                      <option value="" disabled>Chọn một kỳ mô phỏng...</option>
                      {simulations.map(sim => (
                        <option key={sim._id} value={sim._id}>{sim.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Mã cổ phiếu trọng tâm (Target Stock Symbol) *</label>
                    <input
                      type="text"
                      name="symbol"
                      required
                      value={formData.symbol}
                      onChange={handleChange}
                      placeholder="Ví dụ: FPT, HPG, VNM, VIC"
                      className="w-full px-4 py-2.5 bg-[#172033] border border-[#253047] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-slate-500 font-mono uppercase"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Hạn nộp bài (Deadline) *</label>
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
                <div>
                  <h3 className="text-lg font-semibold text-white">Nội dung & Tiêu chí Checklist</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Cấu hình mô tả và thiết lập danh sách checklist các tiêu chí để sinh viên tick hoàn thành khi làm bài.
                  </p>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Mô tả tóm tắt (Brief Description)</label>
                    <textarea
                      name="description"
                      rows={2}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Tóm tắt ngắn gọn mục tiêu của bài tập..."
                      className="w-full px-4 py-2.5 bg-[#172033] border border-[#253047] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-slate-500 resize-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Hướng dẫn chi tiết (Detailed Instructions)</label>
                    <textarea
                      name="instructions"
                      rows={3}
                      value={formData.instructions}
                      onChange={handleChange}
                      placeholder="Chi tiết yêu cầu, câu hỏi định hướng, quy tắc nộp bài..."
                      className="w-full px-4 py-2.5 bg-[#172033] border border-[#253047] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-slate-500 resize-none text-sm"
                    />
                  </div>

                  {/* Checklist Builder */}
                  <div className="pt-3 border-t border-[#253047]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-indigo-400" />
                        <label className="text-sm font-semibold text-white">
                          Tiêu chí Checklist (Student Completion Checklist)
                        </label>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                        {formData.requirements.length} tiêu chí
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                      Sinh viên sẽ thấy danh sách này và tick đánh dấu <strong className="text-emerald-400">"Đã hoàn thành"</strong> trong quá trình làm bài và thực hành trên sàn mô phỏng.
                    </p>

                    {/* Input thêm tiêu chí mới */}
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newReqText}
                        onChange={(e) => setNewReqText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddRequirement();
                          }
                        }}
                        placeholder="Nhập tiêu chí mới (nhấn Enter hoặc bấm Thêm)..."
                        className="flex-1 px-4 py-2 bg-[#172033] border border-[#253047] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-slate-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddRequirement()}
                        disabled={!newReqText.trim()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Thêm</span>
                      </button>
                    </div>

                    {/* Gợi ý thêm nhanh */}
                    <div className="mb-4">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Gợi ý thêm nhanh tiêu chí phổ biến:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_SUGGESTIONS.map((preset, idx) => {
                          const alreadyAdded = formData.requirements.some(r => r.text.toLowerCase() === preset.toLowerCase());
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAddRequirement(preset)}
                              disabled={alreadyAdded}
                              className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                                alreadyAdded
                                  ? 'bg-slate-800/40 text-slate-500 border-slate-700/50 cursor-not-allowed'
                                  : 'bg-[#172033] text-slate-300 border-[#253047] hover:border-indigo-500 hover:text-indigo-300'
                              }`}
                            >
                              + {preset}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Danh sách tiêu chí checklist */}
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {formData.requirements.length === 0 ? (
                        <div className="p-4 text-center rounded-lg border border-dashed border-[#253047] text-slate-500 text-xs">
                          Chưa có tiêu chí nào. Vui lòng thêm ít nhất 1 tiêu chí để sinh viên có thể tick hoàn thành.
                        </div>
                      ) : (
                        formData.requirements.map((req, idx) => (
                          <div
                            key={req.id}
                            className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-[#172033] border border-[#253047] rounded-lg group hover:border-slate-600 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-sm text-slate-200 truncate" title={req.text}>
                                {req.text}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveRequirement(req.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors shrink-0"
                              title="Xoá tiêu chí này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-white mb-4">Xem lại bài tập (Review Assignment)</h3>
                
                <div className="bg-[#172033] border border-[#253047] rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#253047]">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tiêu đề bài tập</p>
                      <p className="text-white font-medium">{formData.title || <span className="text-rose-400">Chưa nhập tiêu đề</span>}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Mã cổ phiếu</p>
                      <p className="text-cyan-400 font-mono font-bold">{formData.symbol}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#253047]">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Kỳ mô phỏng</p>
                      <p className="text-indigo-400 font-medium">
                        {simulations.find(s => s._id === formData.simulationId)?.name || <span className="text-rose-400">Chưa chọn</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Hạn nộp</p>
                      <p className="text-emerald-400 font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> {formData.deadline}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pb-4 border-b border-[#253047]">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Mô tả tóm tắt</p>
                    <p className="text-white text-sm whitespace-pre-line">{formData.description || 'Không có mô tả'}</p>
                  </div>

                  {/* Checklist Review */}
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                      Tiêu chí Checklist sinh viên sẽ tick hoàn thành ({formData.requirements.length})
                    </p>
                    {formData.requirements.length === 0 ? (
                      <p className="text-xs text-amber-400">Chưa có tiêu chí checklist nào.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {formData.requirements.map((req, idx) => (
                          <div key={req.id} className="flex items-center gap-2.5 text-xs text-slate-300">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span><strong className="text-slate-400 font-mono">{idx + 1}.</strong> {req.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
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
