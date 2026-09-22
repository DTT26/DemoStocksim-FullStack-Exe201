import { useState, useEffect } from 'react';
import { X, Plus, Trash2, RotateCcw } from 'lucide-react';

export interface FibonacciLevel {
  id: string;
  level: number;
  color: string;
  fill: string;
  active: boolean;
}

export interface FibonacciConfig {
  levels: FibonacciLevel[];
  extendRight: boolean;
  showLabels: boolean;
  showPrices: boolean;
  showBackground: boolean;
  lineWidth: number;
  backgroundOpacity: number;
}

export const DEFAULT_FIBONACCI_CONFIG: FibonacciConfig = {
  extendRight: false,
  showLabels: true,
  showPrices: true,
  showBackground: true,
  lineWidth: 1,
  backgroundOpacity: 0.2,
  levels: [
    { id: '1.618', level: 1.618, color: '#2196f3', fill: 'rgba(180, 40, 40, 0.22)', active: true },
    { id: '1',     level: 1,     color: '#2962ff', fill: 'rgba(33, 80, 180, 0.22)', active: true },
    { id: '0.786', level: 0.786, color: '#00bcd4', fill: 'rgba(0, 150, 180, 0.18)', active: true },
    { id: '0.618', level: 0.618, color: '#089981', fill: 'rgba(8, 153, 129, 0.18)', active: true },
    { id: '0.5',   level: 0.5,   color: '#4caf50', fill: 'rgba(76, 175, 80, 0.18)', active: true },
    { id: '0.382', level: 0.382, color: '#ff9800', fill: 'rgba(210, 120, 20, 0.18)', active: true },
    { id: '0.236', level: 0.236, color: '#f23645', fill: 'rgba(200, 40, 50, 0.22)', active: true },
    { id: '0',     level: 0,     color: '#787b86', fill: 'rgba(120, 123, 134, 0.15)', active: true },
    { id: '2.618', level: 2.618, color: '#9c27b0', fill: 'rgba(156, 39, 176, 0.15)', active: false },
    { id: '3.618', level: 3.618, color: '#e91e63', fill: 'rgba(233, 30, 99, 0.15)', active: false },
    { id: '4.236', level: 4.236, color: '#009688', fill: 'rgba(0, 150, 136, 0.15)', active: false },
  ]
};

interface FibonacciSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FibonacciConfig;
  onSave: (newConfig: FibonacciConfig) => void;
}

export const FibonacciSettingsModal = ({ isOpen, onClose, config, onSave }: FibonacciSettingsModalProps) => {
  const [localConfig, setLocalConfig] = useState<FibonacciConfig>(config || DEFAULT_FIBONACCI_CONFIG);

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleLevelChange = (index: number, field: keyof FibonacciLevel, value: any) => {
    setLocalConfig(prev => {
      const newLevels = [...prev.levels];
      newLevels[index] = { ...newLevels[index], [field]: value };
      return { ...prev, levels: newLevels };
    });
  };

  const handleAddLevel = () => {
    setLocalConfig(prev => ({
      ...prev,
      levels: [
        ...prev.levels,
        {
          id: `custom_${Date.now()}`,
          level: 0.886,
          color: '#e040fb',
          fill: 'rgba(224, 64, 251, 0.15)',
          active: true
        }
      ]
    }));
  };

  const handleDeleteLevel = (index: number) => {
    setLocalConfig(prev => ({
      ...prev,
      levels: prev.levels.filter((_, i) => i !== index)
    }));
  };

  const handleResetDefaults = () => {
    setLocalConfig(DEFAULT_FIBONACCI_CONFIG);
  };

  const handleApply = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl shadow-2xl w-full max-w-[540px] flex flex-col max-h-[85vh] overflow-hidden text-[#d1d4dc]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2e39]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <h3 className="font-semibold text-white text-base">Cài đặt Fibonacci Thoái lui</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-5 text-xs">
          {/* General Display Options */}
          <div className="grid grid-cols-2 gap-3 bg-[#131722] p-3 rounded-lg border border-[#2a2e39]">
            <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={localConfig.showBackground}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, showBackground: e.target.checked }))}
                className="rounded border-[#2a2e39] text-blue-600 focus:ring-0 focus:ring-offset-0 bg-[#2a2e39] cursor-pointer"
              />
              <span>Tô màu vùng nền (Background)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={localConfig.extendRight}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, extendRight: e.target.checked }))}
                className="rounded border-[#2a2e39] text-blue-600 focus:ring-0 focus:ring-offset-0 bg-[#2a2e39] cursor-pointer"
              />
              <span>Kéo dài đường sang phải</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={localConfig.showPrices}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, showPrices: e.target.checked }))}
                className="rounded border-[#2a2e39] text-blue-600 focus:ring-0 focus:ring-offset-0 bg-[#2a2e39] cursor-pointer"
              />
              <span>Hiển thị giá trị (Prices)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={localConfig.showLabels}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, showLabels: e.target.checked }))}
                className="rounded border-[#2a2e39] text-blue-600 focus:ring-0 focus:ring-offset-0 bg-[#2a2e39] cursor-pointer"
              />
              <span>Hiển thị tỷ lệ (Levels)</span>
            </label>
          </div>

          {/* Levels Table */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[#787b86] font-semibold uppercase tracking-wider text-[11px] px-1">
              <span>Các mức Fibonacci (Levels)</span>
              <span>Độ dày nét: {localConfig.lineWidth}px</span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-[#131722] p-3 rounded-lg border border-[#2a2e39] max-h-[300px] overflow-y-auto">
              {localConfig.levels.map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex items-center gap-2 bg-[#1e222d] p-1.5 rounded border border-[#2a2e39] hover:border-[#363a45] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.active}
                    onChange={(e) => handleLevelChange(index, 'active', e.target.checked)}
                    className="rounded border-[#2a2e39] text-blue-600 bg-[#2a2e39] cursor-pointer"
                  />

                  {/* Level Number Input */}
                  <input
                    type="number"
                    step="0.001"
                    value={item.level}
                    onChange={(e) => handleLevelChange(index, 'level', parseFloat(e.target.value) || 0)}
                    className="w-16 bg-[#131722] border border-[#2a2e39] rounded px-1.5 py-0.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />

                  {/* Color Picker */}
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={item.color}
                      onChange={(e) => handleLevelChange(index, 'color', e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                      title="Chọn màu đường kẻ"
                    />
                  </div>

                  {localConfig.levels.length > 2 && (
                    <button
                      onClick={() => handleDeleteLevel(index)}
                      className="text-[#787b86] hover:text-red-400 p-1 rounded transition-colors ml-auto"
                      title="Xóa mức này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleAddLevel}
              className="flex items-center justify-center gap-1.5 w-full py-2 bg-[#2a2e39]/50 hover:bg-[#2a2e39] text-blue-400 rounded-lg font-medium transition-colors border border-dashed border-[#363a45]"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm mức Fibonacci mới</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#2a2e39] bg-[#161a25]">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-[#787b86] hover:text-white px-3 py-1.5 rounded-lg transition-colors text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-[#2a2e39] hover:bg-[#2a2e39] text-[#d1d4dc] text-xs font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
