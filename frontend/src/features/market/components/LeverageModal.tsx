import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface LeverageModalProps {
  isOpen: boolean;
  onClose: () => void;
  leverage: number;
  maxLeverage: number;
  leverageMarks: number[];
  onConfirm: (val: number, applyAll: boolean) => void;
}

export const LeverageModal = ({ isOpen, onClose, leverage: initialLeverage, maxLeverage, leverageMarks, onConfirm }: LeverageModalProps) => {
  const [val, setVal] = useState(initialLeverage);
  const [applyAll, setApplyAll] = useState(false);

  useEffect(() => {
    if (isOpen) setVal(initialLeverage);
  }, [isOpen, initialLeverage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1e222d] w-[400px] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#d1d4dc] border border-[#2a2e39]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-lg font-bold text-white">Chỉnh sửa đòn bẩy</h2>
          <button onClick={onClose} className="p-1.5 bg-[#2a2e39] hover:bg-[#363a45] rounded-full text-[#787b86] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 flex flex-col gap-5">
          
          {/* Input Box */}
          <div className="border border-[#2a2e39] rounded-lg p-3 bg-[#131722] flex flex-col relative focus-within:border-blue-500 transition-colors">
            <span className="text-xs text-[#787b86]">Đòn bẩy</span>
            <div className="flex items-center justify-between mt-1">
              <input 
                type="number" 
                value={val}
                onChange={(e) => {
                  let v = parseInt(e.target.value);
                  if (isNaN(v)) v = 1;
                  if (v > maxLeverage) v = maxLeverage;
                  setVal(v);
                }}
                className="bg-transparent border-none outline-none text-xl font-bold text-white w-full"
              />
              <span className="text-[#787b86] font-semibold text-lg">X</span>
            </div>
          </div>

          {/* Slider */}
          <div className="flex flex-col mt-2">
            <input
              type="range"
              min="1"
              max={maxLeverage}
              value={val}
              onChange={e => setVal(parseInt(e.target.value))}
              className="w-full h-1 bg-[#2a2e39] rounded-lg appearance-none cursor-pointer accent-white"
              style={{
                background: `linear-gradient(to right, white ${((val - 1) / (maxLeverage - 1)) * 100}%, #2a2e39 ${((val - 1) / (maxLeverage - 1)) * 100}%)`
              }}
            />
            <div className="flex justify-between mt-3 px-0.5 text-xs font-semibold text-[#787b86]">
              <span>1X</span>
              {leverageMarks.map(m => (
                <span 
                  key={m} 
                  onClick={() => setVal(m)}
                  className={`cursor-pointer hover:text-white transition-colors ${val >= m ? 'text-[#d1d4dc]' : ''}`}
                >
                  {m}X
                </span>
              ))}
            </div>
          </div>

          {/* Info Text */}
          <div className="text-xs text-[#787b86] mt-1">
            Giá trị vị thế tối đa: <span className="text-white font-bold font-mono">10,000,000.00 USDT</span>{' '}
            <span className="text-blue-500 hover:text-blue-400 cursor-pointer">Xem chi tiết</span>
          </div>

          <div className="text-[13px] text-[#787b86] leading-relaxed mt-2">
            Việc điều chỉnh đòn bẩy sẽ ảnh hưởng đến đòn bẩy và ký quỹ của các vị thế cũng như các lệnh chờ xử lý, tuy nhiên sẽ không ảnh hưởng đến kích cỡ, giá trị vị thế và Lãi Lỗ chưa thực hiện.
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-between mt-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${applyAll ? 'bg-blue-500' : 'bg-[#2a2e39]'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${applyAll ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm text-[#787b86] group-hover:text-[#d1d4dc] transition-colors">Áp dụng cho toàn bộ các cặp</span>
            </label>

            <button 
              onClick={() => {
                onConfirm(val, applyAll);
                onClose();
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-8 rounded-full transition-colors shadow-lg shadow-blue-900/20"
            >
              Xác nhận
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
