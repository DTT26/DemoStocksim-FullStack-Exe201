import React, { useState, useEffect } from 'react';
import { X, Pencil, ChevronDown } from 'lucide-react';

export interface OverlaySettings {
  title?: string;
  lineColor: string;
  lineSize: number;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  extendLeft?: boolean;
  extendRight?: boolean;
  showMiddlePoint?: boolean;
  leftCap?: boolean;
  rightCap?: boolean;
  
  // Text tab
  enableText?: boolean;
  textContent: string;
  textColor: string;
  textSize: number;
  isBold?: boolean;
  isItalic?: boolean;
  vAlign?: 'top' | 'middle' | 'bottom';
  hAlign?: 'left' | 'center' | 'right';
  textPosition?: 'start' | 'middle' | 'end';

  // Coordinates tab
  point1Price?: number;
  point1Bar?: number;
  point2Price?: number;
  point2Bar?: number;

  // Visibility tab
  visSeconds?: boolean;
  secMin?: number; secMax?: number;
  visMinutes?: boolean;
  minMin?: number; minMax?: number;
  visHours?: boolean;
  hourMin?: number; hourMax?: number;
  visDays?: boolean;
  dayMin?: number; dayMax?: number;
  visWeeks?: boolean;
  weekMin?: number; weekMax?: number;
  visMonths?: boolean;
  monthMin?: number; monthMax?: number;
}

interface OverlaySettingsModalProps {
  isOpen: boolean;
  activeTab?: 'style' | 'text' | 'coords' | 'visibility';
  onClose: () => void;
  initialSettings?: Partial<OverlaySettings>;
  onSave: (settings: OverlaySettings) => void;
}

const COLOR_PALETTE_GRID = [
  ['#ffffff', '#e0e0e0', '#d6d6d6', '#c2c2c2', '#a8a8a8', '#8f8f8f', '#666666', '#000000'],
  ['#f23645', '#ff9800', '#ffd700', '#089981', '#26a69a', '#2962ff', '#8e7cc3', '#e91e63'],
  ['#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'],
  ['#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4c6e7', '#b4a7d6', '#d5a6bd'],
  ['#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8ea2c6', '#8e7cc3', '#c27ba0'],
  ['#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#45818e', '#674ea7', '#a64d79'],
  ['#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#1155cc', '#3b23a7', '#881b4b'],
  ['#990000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#073763', '#20124d', '#4c1130']
];

export const OverlaySettingsModal = ({ 
  isOpen, 
  activeTab: initialActiveTab = 'style', 
  onClose, 
  initialSettings, 
  onSave 
}: OverlaySettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<'style' | 'text' | 'coords' | 'visibility'>('style');
  const [showColorPicker, setShowColorPicker] = useState<'line' | 'text' | null>(null);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [settings, setSettings] = useState<OverlaySettings>({
    title: 'Đường Xu hướng',
    lineColor: '#9c27b0',
    lineSize: 2,
    lineStyle: 'solid',
    extendLeft: false,
    extendRight: false,
    showMiddlePoint: false,
    leftCap: false,
    rightCap: false,
    
    // Text
    enableText: false,
    textContent: '',
    textColor: '#2962ff',
    textSize: 14,
    isBold: false,
    isItalic: false,
    vAlign: 'top',
    hAlign: 'center',
    textPosition: 'middle',

    // Coordinates
    point1Price: 278.784,
    point1Bar: 260,
    point2Price: 291.970,
    point2Bar: 291,

    // Visibility
    visSeconds: true, secMin: 1, secMax: 59,
    visMinutes: true, minMin: 1, minMax: 59,
    visHours: true, hourMin: 1, hourMax: 24,
    visDays: true, dayMin: 1, dayMax: 366,
    visWeeks: true, weekMin: 1, weekMax: 52,
    visMonths: true, monthMin: 1, monthMax: 12,
  });

  useEffect(() => {
    if (isOpen && initialSettings) {
      setSettings(prev => ({ ...prev, ...initialSettings }));
      if (initialActiveTab === 'text') setActiveTab('text');
      else if (initialActiveTab === 'coords') setActiveTab('coords');
      else if (initialActiveTab === 'visibility') setActiveTab('visibility');
      else setActiveTab('style');
    }
  }, [isOpen, initialSettings, initialActiveTab]);

  if (!isOpen) return null;

  const handleChange = (key: keyof OverlaySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm select-none"
      onClick={() => {
        setShowColorPicker(null);
        setShowTemplateDropdown(false);
      }}
    >
      <div 
        className="bg-[#1c202b] text-[#d1d4dc] w-[460px] rounded-xl shadow-2xl border border-[#2a2e39] overflow-hidden flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input 
                type="text"
                value={settings.title || 'Đường Xu hướng'}
                onChange={(e) => handleChange('title', e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                autoFocus
                className="bg-[#2a2e39] text-white px-2 py-0.5 rounded text-lg font-bold outline-none border border-blue-500"
              />
            ) : (
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {settings.title || 'Đường Xu hướng'}
                <button 
                  onClick={() => setIsEditingTitle(true)}
                  className="text-[#787b86] hover:text-white transition-colors"
                  title="Chỉnh sửa tên"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </h2>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-[#787b86] hover:text-white transition-colors p-1 rounded-md hover:bg-[#2a2e39]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-5 border-b border-[#2a2e39] gap-6 text-sm font-semibold">
          {[
            { id: 'style', label: 'Định dạng' },
            { id: 'text', label: 'Văn bản' },
            { id: 'coords', label: 'Tọa độ' },
            { id: 'visibility', label: 'Hiển thị' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2.5 transition-colors relative ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 overflow-y-auto max-h-[460px] text-sm text-[#d1d4dc] min-h-[260px]">
          
          {/* TAB 1: Định dạng (Style) */}
          {activeTab === 'style' && (
            <div className="flex flex-col gap-5">
              {/* Row 1: Line color swatch + Cap controls */}
              <div className="flex items-center justify-between">
                <span className="text-[#d1d4dc] font-medium">Đường thẳng</span>
                <div className="flex items-center gap-2 relative">
                  
                  {/* Color & Line preview button */}
                  <button 
                    onClick={() => setShowColorPicker(prev => prev === 'line' ? null : 'line')}
                    className="flex items-center gap-2 bg-[#2a2e39] hover:bg-[#363a45] border border-[#363a45] rounded-lg px-2.5 py-1.5 transition-colors"
                  >
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: settings.lineColor }} />
                    <div className="w-8 h-[2px]" style={{ backgroundColor: settings.lineColor }} />
                  </button>

                  {/* Start Cap button (o—) */}
                  <button 
                    onClick={() => handleChange('leftCap', !settings.leftCap)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      settings.leftCap 
                        ? 'bg-blue-600/30 border-blue-500 text-blue-400' 
                        : 'bg-[#2a2e39] hover:bg-[#363a45] border-[#363a45] text-[#787b86]'
                    }`}
                    title="Đầu mút trái"
                  >
                    <div className="flex items-center gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      <div className="w-3 h-[1.5px] bg-current" />
                    </div>
                  </button>

                  {/* End Cap button (—o) */}
                  <button 
                    onClick={() => handleChange('rightCap', !settings.rightCap)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      settings.rightCap 
                        ? 'bg-blue-600/30 border-blue-500 text-blue-400' 
                        : 'bg-[#2a2e39] hover:bg-[#363a45] border-[#363a45] text-[#787b86]'
                    }`}
                    title="Đầu mút phải"
                  >
                    <div className="flex items-center gap-0.5">
                      <div className="w-3 h-[1.5px] bg-current" />
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    </div>
                  </button>

                  {/* Color Picker Dropdown */}
                  {showColorPicker === 'line' && (
                    <div 
                      className="absolute top-full right-0 mt-2 p-3 bg-[#1e222d] border border-[#2a2e39] rounded-xl shadow-2xl z-50 w-64"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="grid grid-cols-8 gap-1.5">
                        {COLOR_PALETTE_GRID.flatMap(row => row).map((c, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              handleChange('lineColor', c);
                              setShowColorPicker(null);
                            }}
                            className="w-5 h-5 rounded-sm transition-transform hover:scale-110"
                            style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #434651' : 'none' }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Checkbox 1: Mở rộng dòng bên trái */}
              <label className="flex items-center gap-3 cursor-pointer hover:text-white transition-colors">
                <input 
                  type="checkbox"
                  checked={settings.extendLeft || false}
                  onChange={(e) => handleChange('extendLeft', e.target.checked)}
                  className="w-4 h-4 rounded border-[#363a45] bg-[#2a2e39] accent-blue-500 cursor-pointer"
                />
                <span>Mở rộng dòng bên trái</span>
              </label>

              {/* Checkbox 2: Mở rộng dòng bên phải */}
              <label className="flex items-center gap-3 cursor-pointer hover:text-white transition-colors">
                <input 
                  type="checkbox"
                  checked={settings.extendRight || false}
                  onChange={(e) => handleChange('extendRight', e.target.checked)}
                  className="w-4 h-4 rounded border-[#363a45] bg-[#2a2e39] accent-blue-500 cursor-pointer"
                />
                <span>Mở rộng dòng bên phải</span>
              </label>

              {/* Checkbox 3: Điểm giữa */}
              <label className="flex items-center gap-3 cursor-pointer hover:text-white transition-colors">
                <input 
                  type="checkbox"
                  checked={settings.showMiddlePoint || false}
                  onChange={(e) => handleChange('showMiddlePoint', e.target.checked)}
                  className="w-4 h-4 rounded border-[#363a45] bg-[#2a2e39] accent-blue-500 cursor-pointer"
                />
                <span>Điểm giữa</span>
              </label>
            </div>
          )}

          {/* TAB 2: Văn bản (Text) */}
          {activeTab === 'text' && (
            <div className="flex flex-col gap-4">
              {/* Row 1: Enable checkbox, Color, Font Size, Bold, Italic */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer hover:text-white transition-colors">
                  <input 
                    type="checkbox"
                    checked={settings.enableText || false}
                    onChange={(e) => handleChange('enableText', e.target.checked)}
                    className="w-4 h-4 rounded border-[#363a45] bg-[#2a2e39] accent-blue-500 cursor-pointer"
                  />
                  <span className="font-medium">Văn bản</span>
                </label>

                <div className="flex items-center gap-2 relative">
                  {/* Color Picker Box */}
                  <button 
                    onClick={() => setShowColorPicker(prev => prev === 'text' ? null : 'text')}
                    className="w-7 h-7 rounded-lg border border-[#363a45] bg-[#2a2e39] p-1 flex items-center justify-center"
                  >
                    <div className="w-full h-full rounded" style={{ backgroundColor: settings.textColor }} />
                  </button>

                  {/* Font Size Select */}
                  <select 
                    value={settings.textSize}
                    onChange={(e) => handleChange('textSize', Number(e.target.value))}
                    className="bg-[#2a2e39] border border-[#363a45] text-white rounded-lg px-2.5 py-1 text-xs outline-none focus:border-blue-500"
                  >
                    {[10, 12, 14, 16, 20, 24, 28, 32].map(sz => (
                      <option key={sz} value={sz}>{sz}</option>
                    ))}
                  </select>

                  {/* Bold Button */}
                  <button 
                    onClick={() => handleChange('isBold', !settings.isBold)}
                    className={`w-7 h-7 rounded-lg font-bold border transition-colors ${
                      settings.isBold ? 'bg-blue-600/30 border-blue-500 text-blue-400' : 'bg-[#2a2e39] border-[#363a45] text-[#787b86]'
                    }`}
                  >
                    B
                  </button>

                  {/* Italic Button */}
                  <button 
                    onClick={() => handleChange('isItalic', !settings.isItalic)}
                    className={`w-7 h-7 rounded-lg italic font-serif border transition-colors ${
                      settings.isItalic ? 'bg-blue-600/30 border-blue-500 text-blue-400' : 'bg-[#2a2e39] border-[#363a45] text-[#787b86]'
                    }`}
                  >
                    I
                  </button>

                  {/* Text Color Picker Dropdown */}
                  {showColorPicker === 'text' && (
                    <div 
                      className="absolute top-full right-0 mt-2 p-3 bg-[#1e222d] border border-[#2a2e39] rounded-xl shadow-2xl z-50 w-64"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="grid grid-cols-8 gap-1.5">
                        {COLOR_PALETTE_GRID.flatMap(row => row).map((c, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              handleChange('textColor', c);
                              setShowColorPicker(null);
                            }}
                            className="w-5 h-5 rounded-sm transition-transform hover:scale-110"
                            style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #434651' : 'none' }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Text Area */}
              <textarea 
                rows={4}
                value={settings.textContent}
                onChange={(e) => {
                  const val = e.target.value;
                  setSettings(prev => ({
                    ...prev,
                    textContent: val,
                    enableText: val.trim().length > 0
                  }));
                }}
                placeholder="Nhập tên / văn bản hiển thị cho đường xu hướng ở đây..."
                className="w-full bg-[#2a2e39] border border-blue-500/60 focus:border-blue-500 rounded-xl p-3 text-sm text-white placeholder-[#787b86] outline-none resize-none transition-colors"
              />

              {/* Text Alignment Row */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[#787b86] font-medium">Căn chỉnh chữ</span>
                <div className="flex items-center gap-2">
                  {/* Vertical Alignment */}
                  <select 
                    value={settings.vAlign || 'top'}
                    onChange={(e) => handleChange('vAlign', e.target.value)}
                    className="bg-[#2a2e39] border border-[#363a45] text-white rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="top">Trên đầu</option>
                    <option value="middle">Trung tâm</option>
                    <option value="bottom">Dưới cùng</option>
                  </select>

                  {/* Horizontal Alignment */}
                  <select 
                    value={settings.hAlign || 'center'}
                    onChange={(e) => handleChange('hAlign', e.target.value)}
                    className="bg-[#2a2e39] border border-[#363a45] text-white rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="left">Bên trái</option>
                    <option value="center">Trung tâm</option>
                    <option value="right">Bên phải</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Tọa độ (Coordinates) */}
          {activeTab === 'coords' && (
            <div className="flex flex-col gap-4">
              {/* Point #1 */}
              <div className="flex items-center justify-between">
                <span className="text-[#d1d4dc] font-medium">#1 (giá, thanh)</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    step="0.001"
                    value={settings.point1Price ?? 278.784}
                    onChange={(e) => handleChange('point1Price', parseFloat(e.target.value))}
                    className="w-28 bg-[#2a2e39] border border-blue-500 text-white rounded-lg px-2.5 py-1.5 text-sm outline-none font-mono focus:ring-1 focus:ring-blue-500"
                  />
                  <input 
                    type="number"
                    value={settings.point1Bar ?? 260}
                    onChange={(e) => handleChange('point1Bar', parseInt(e.target.value))}
                    className="w-24 bg-[#2a2e39] border border-[#363a45] text-white rounded-lg px-2.5 py-1.5 text-sm outline-none font-mono focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Point #2 */}
              <div className="flex items-center justify-between">
                <span className="text-[#d1d4dc] font-medium">#2 (giá, thanh)</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    step="0.001"
                    value={settings.point2Price ?? 291.970}
                    onChange={(e) => handleChange('point2Price', parseFloat(e.target.value))}
                    className="w-28 bg-[#2a2e39] border border-[#363a45] text-white rounded-lg px-2.5 py-1.5 text-sm outline-none font-mono focus:border-blue-500"
                  />
                  <input 
                    type="number"
                    value={settings.point2Bar ?? 291}
                    onChange={(e) => handleChange('point2Bar', parseInt(e.target.value))}
                    className="w-24 bg-[#2a2e39] border border-[#363a45] text-white rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Hiển thị (Visibility) */}
          {activeTab === 'visibility' && (
            <div className="flex flex-col gap-3.5 pr-1">
              {[
                { key: 'visSeconds', minKey: 'secMin', maxKey: 'secMax', label: 'Giây', defMin: 1, defMax: 59, maxLimit: 59 },
                { key: 'visMinutes', minKey: 'minMin', maxKey: 'minMax', label: 'Sóng nhỏ', defMin: 1, defMax: 59, maxLimit: 59 },
                { key: 'visHours', minKey: 'hourMin', maxKey: 'hourMax', label: 'Giờ', defMin: 1, defMax: 24, maxLimit: 24 },
                { key: 'visDays', minKey: 'dayMin', maxKey: 'dayMax', label: 'Ngày', defMin: 1, defMax: 366, maxLimit: 366 },
                { key: 'visWeeks', minKey: 'weekMin', maxKey: 'weekMax', label: 'Tuần', defMin: 1, defMax: 52, maxLimit: 52 },
                { key: 'visMonths', minKey: 'monthMin', maxKey: 'monthMax', label: 'Tháng', defMin: 1, defMax: 12, maxLimit: 12 },
              ].map(tf => (
                <div key={tf.key} className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-2.5 w-24 cursor-pointer shrink-0 hover:text-white transition-colors">
                    <input 
                      type="checkbox"
                      checked={(settings as any)[tf.key] ?? true}
                      onChange={(e) => handleChange(tf.key as any, e.target.checked)}
                      className="w-4 h-4 rounded border-[#363a45] bg-[#2a2e39] accent-blue-500 cursor-pointer"
                    />
                    <span className="font-medium text-sm">{tf.label}</span>
                  </label>

                  <input 
                    type="number"
                    value={(settings as any)[tf.minKey] ?? tf.defMin}
                    onChange={(e) => handleChange(tf.minKey as any, parseInt(e.target.value) || 1)}
                    className="w-14 bg-[#2a2e39] border border-[#363a45] text-white rounded-lg px-2 py-1 text-center font-mono outline-none focus:border-blue-500"
                  />

                  <div className="flex-1 flex items-center px-1">
                    <input 
                      type="range"
                      min="1"
                      max={tf.maxLimit}
                      value={(settings as any)[tf.maxKey] ?? tf.defMax}
                      onChange={(e) => handleChange(tf.maxKey as any, parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#2a2e39] rounded-lg appearance-none cursor-pointer accent-[#d1d4dc]"
                    />
                  </div>

                  <input 
                    type="number"
                    value={(settings as any)[tf.maxKey] ?? tf.defMax}
                    onChange={(e) => handleChange(tf.maxKey as any, parseInt(e.target.value) || tf.maxLimit)}
                    className="w-14 bg-[#2a2e39] border border-[#363a45] text-white rounded-lg px-2 py-1 text-center font-mono outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="px-5 py-3 border-t border-[#2a2e39] flex items-center justify-between bg-[#1c202b] relative">
          
          {/* Templates Dropdown Button */}
          <div className="relative">
            <button 
              onClick={() => setShowTemplateDropdown(prev => !prev)}
              className="flex items-center gap-2 bg-[#2a2e39] hover:bg-[#363a45] border border-[#363a45] text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
            >
              <span>Bản mẫu</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#787b86]" />
            </button>

            {showTemplateDropdown && (
              <div 
                className="absolute bottom-full left-0 mb-2 w-48 bg-[#1e222d] border border-[#2a2e39] rounded-xl shadow-2xl py-1 z-50 text-xs text-[#d1d4dc]"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => {
                    setSettings(prev => ({
                      ...prev,
                      lineColor: '#2962ff',
                      lineSize: 1,
                      lineStyle: 'solid',
                      extendLeft: false,
                      extendRight: false,
                      showMiddlePoint: false
                    }));
                    setShowTemplateDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#2a2e39] transition-colors"
                >
                  Áp dụng Mặc định
                </button>
                <button 
                  onClick={() => setShowTemplateDropdown(false)}
                  className="w-full text-left px-4 py-2 hover:bg-[#2a2e39] transition-colors"
                >
                  Lưu dạng...
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={onClose}
              className="px-5 py-1.5 rounded-lg border border-[#363a45] text-white hover:bg-[#2a2e39] text-sm font-semibold transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-1.5 rounded-lg bg-[#2962ff] text-white hover:bg-blue-600 text-sm font-semibold transition-colors shadow-md"
            >
              Ok
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
