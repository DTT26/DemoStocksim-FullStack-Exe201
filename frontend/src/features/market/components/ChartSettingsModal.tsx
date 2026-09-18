import { useState, useRef, useEffect } from 'react';
import { X, CandlestickChart, List, TrendingUp, Edit3, Clock, Calendar, Check, ChevronDown } from 'lucide-react';

import { type ChartSettings } from '../chartSettings';

interface ChartSettingsModalProps {
  onClose: () => void;
  chartSettings: ChartSettings;
  onSettingsChange: (settings: ChartSettings) => void;
}

type TabType = 'symbol' | 'status' | 'scales' | 'canvas' | 'alerts' | 'events';

// Reusable UI Components
const CheckboxRow = ({ checked, label, colorPickers, onChange }: { checked: boolean; label: string; colorPickers?: React.ReactNode; onChange?: (checked: boolean) => void }) => (
  <label className="flex items-center justify-between cursor-pointer group py-2">
    <div className="flex items-center gap-3">
      <div className={`w-[18px] h-[18px] rounded flex items-center justify-center border transition-colors ${checked ? 'bg-[#089981] border-[#089981]' : 'border-[#434651] group-hover:border-[#787b86]'}`}>
        <input type="checkbox" className="hidden" checked={checked} onChange={(e) => onChange?.(e.target.checked)} />
        {checked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
      </div>
      <span className="text-[13px] text-[#d1d4dc]">{label}</span>
    </div>
    {colorPickers && <div className="flex items-center gap-2">{colorPickers}</div>}
  </label>
);

const ColorBox = ({ color, onChange }: { color: string; onChange?: (color: string) => void }) => (
  <label className="w-6 h-6 rounded flex-shrink-0 border border-[#2a2e39] cursor-pointer hover:border-white transition-colors relative overflow-hidden block" style={{ backgroundColor: color }}>
    <input 
      type="color" 
      value={color} 
      onChange={(e) => onChange?.(e.target.value)} 
      className="absolute opacity-0 w-full h-full cursor-pointer left-0 top-0"
    />
  </label>
);

const SelectDropdown = ({ value, options, onChange, className }: { value: string; options?: string[]; onChange?: (val: string) => void; className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-3 py-1.5 bg-[#1e222d] border ${isOpen ? 'border-[#089981]' : 'border-[#2a2e39]'} rounded hover:border-[#434651] transition-colors text-[13px] text-white focus:outline-none ${className || 'w-48'}`}
      >
        <span>{value}</span>
        <ChevronDown className="w-4 h-4 text-[#787b86]" />
      </button>
      
      {isOpen && options && options.length > 0 && (
        <div className="absolute z-[110] top-full mt-1 left-0 w-full bg-[#1e222d] border border-[#2a2e39] rounded shadow-xl py-1 max-h-48 overflow-y-auto">
          {options.map((opt, i) => (
            <div 
              key={i} 
              onClick={() => {
                onChange?.(opt);
                setIsOpen(false);
              }}
              className={`px-3 py-2 text-[13px] cursor-pointer transition-colors ${opt === value ? 'bg-[#089981] text-white' : 'text-[#d1d4dc] hover:bg-[#2a2e39] hover:text-white'}`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-[11px] font-bold text-[#787b86] uppercase tracking-wider mb-2 mt-4">{title}</h3>
);

// Tab Components
const SymbolTab = ({ settings, onChange }: { settings: ChartSettings; onChange: (s: ChartSettings) => void }) => {
  const updateCandle = (key: keyof ChartSettings['candle'], val: string) => {
    onChange({ ...settings, candle: { ...settings.candle, [key]: val } });
  };
  const updateSymbol = (key: keyof ChartSettings['symbol'], val: any) => {
    onChange({ ...settings, symbol: { ...settings.symbol, [key]: val } });
  };

  return (
    <div className="flex flex-col">
      <SectionTitle title="NẾN" />
      <CheckboxRow 
        checked={settings.symbol.colorBasedOnPreviousClose} 
        onChange={(v) => updateSymbol('colorBasedOnPreviousClose', v)} 
        label="Đổi màu nến theo giá đóng cửa trước đó" 
      />
      <CheckboxRow 
        checked={true} 
        label="Thân nến" 
        colorPickers={<>
          <ColorBox color={settings.candle.bodyUp} onChange={(v) => updateCandle('bodyUp', v)} />
          <ColorBox color={settings.candle.bodyDown} onChange={(v) => updateCandle('bodyDown', v)} />
        </>} 
      />
      <CheckboxRow 
        checked={true} 
        label="Viền nến" 
        colorPickers={<>
          <ColorBox color={settings.candle.borderUp} onChange={(v) => updateCandle('borderUp', v)} />
          <ColorBox color={settings.candle.borderDown} onChange={(v) => updateCandle('borderDown', v)} />
        </>} 
      />
      <CheckboxRow 
        checked={true} 
        label="Bóng nến" 
        colorPickers={<>
          <ColorBox color={settings.candle.wickUp} onChange={(v) => updateCandle('wickUp', v)} />
          <ColorBox color={settings.candle.wickDown} onChange={(v) => updateCandle('wickDown', v)} />
        </>} 
      />
      
      <div className="mt-4 mb-2 h-px bg-[#2a2e39] w-full" />
      
      <SectionTitle title="ĐIỀU CHỈNH DỮ LIỆU" />
      <div className="flex items-center justify-between py-2">
        <span className="text-[13px] text-[#d1d4dc]">Precision</span>
        <SelectDropdown 
          value={settings.symbol.precision} 
          onChange={(v) => updateSymbol('precision', v)}
          options={['Default', '1', '1/10', '1/100', '1/1000']} 
        />
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-[13px] text-[#d1d4dc]">Timezone</span>
        <SelectDropdown 
          value={settings.symbol.timezone} 
          onChange={(v) => updateSymbol('timezone', v)}
          options={['UTC', 'Asia/Ho_Chi_Minh']} 
        />
      </div>
    </div>
  );
};

const StatusTab = ({ settings, onChange }: { settings: ChartSettings; onChange: (s: ChartSettings) => void }) => {
  const updateStatus = (key: keyof ChartSettings['status'], val: any) => {
    onChange({ ...settings, status: { ...settings.status, [key]: val } });
  };

  return (
    <div className="flex flex-col">
      <SectionTitle title="INSTRUMENT" />
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-[18px] h-[18px] rounded flex items-center justify-center border bg-[#089981] border-[#089981]">
            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
          </div>
          <span className="text-[13px] text-[#d1d4dc]">Title</span>
        </div>
        <SelectDropdown 
          value={settings.status.title} 
          onChange={(v) => updateStatus('title', v)}
          options={['Name', 'Ticker', 'Description', 'Ticker and description']}
          className="w-48"
        />
      </div>
      <CheckboxRow checked={settings.status.openMarketStatus} onChange={(v) => updateStatus('openMarketStatus', v)} label="Open market status" />
      <CheckboxRow checked={settings.status.chartValues} onChange={(v) => updateStatus('chartValues', v)} label="Chart values" />
      <CheckboxRow checked={settings.status.barChangeValues} onChange={(v) => updateStatus('barChangeValues', v)} label="Bar change values" />
      <CheckboxRow checked={settings.status.volume} onChange={(v) => updateStatus('volume', v)} label="Volume" />

      <div className="mt-4 mb-2 h-px bg-[#2a2e39] w-full" />

      <SectionTitle title="INDICATORS" />
      <CheckboxRow checked={settings.status.indicatorTitles} onChange={(v) => updateStatus('indicatorTitles', v)} label="Titles" />
      <div className="pl-8">
        <CheckboxRow checked={settings.status.indicatorInputs} onChange={(v) => updateStatus('indicatorInputs', v)} label="Inputs" />
      </div>
      <CheckboxRow checked={settings.status.indicatorValues} onChange={(v) => updateStatus('indicatorValues', v)} label="Values" />
      <CheckboxRow 
        checked={settings.status.indicatorBackground} 
        onChange={(v) => updateStatus('indicatorBackground', v)} 
        label="Background" 
        colorPickers={<ColorBox color={settings.status.indicatorBackgroundColor} onChange={(v) => updateStatus('indicatorBackgroundColor', v)} />} 
      />
    </div>
  );
};

const ScalesTab = ({ settings, onChange }: { settings: ChartSettings; onChange: (s: ChartSettings) => void }) => {
  const updateScale = (key: keyof ChartSettings['scales'], val: any) => {
    onChange({ ...settings, scales: { ...settings.scales, [key]: val } });
  };

  return (
    <div className="flex flex-col pb-24">
      <CheckboxRow checked={settings.scales.noOverlappingLabels} onChange={(v) => updateScale('noOverlappingLabels', v)} label="No overlapping labels" />
      <CheckboxRow checked={settings.scales.plusButton} onChange={(v) => updateScale('plusButton', v)} label="Plus button" />
      <CheckboxRow checked={settings.scales.countdown} onChange={(v) => updateScale('countdown', v)} label="Countdown to bar close" />
      
      <div className="flex items-center justify-between py-2">
        <span className="text-[13px] text-[#d1d4dc]">Symbol</span>
        <div className="flex items-center gap-2">
          <SelectDropdown 
            value={settings.scales.symbolVal} 
            onChange={(v) => updateScale('symbolVal', v)}
            options={["Name, value, line", "Value and line", "Value only", "Line only", "Hidden"]}
            className="w-40" 
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between py-2">
        <span className="text-[13px] text-[#d1d4dc]">Symbol label color</span>
        <div className="flex items-center gap-2">
          <ColorBox color={settings.scales.symbolLabelColor1} onChange={(v) => updateScale('symbolLabelColor1', v)} />
          <ColorBox color={settings.scales.symbolLabelColor2} onChange={(v) => updateScale('symbolLabelColor2', v)} />
        </div>
      </div>
      
      <div className="flex items-center justify-between py-2">
        <span className="text-[13px] text-[#d1d4dc]">Indicators and financials</span>
        <SelectDropdown 
          value={settings.scales.indVal} 
          onChange={(v) => updateScale('indVal', v)}
          options={["Value", "Name and value", "Name", "Hidden"]}
          className="w-48"
        />
      </div>
      
      <div className="flex items-center justify-between py-2">
        <span className="text-[13px] text-[#d1d4dc]">High and low</span>
        <div className="flex items-center gap-2">
          <SelectDropdown 
            value={settings.scales.hlVal} 
            onChange={(v) => updateScale('hlVal', v)}
            options={["Hidden", "Labels only", "Lines only", "Labels and lines"]}
            className="w-40" 
          />
          <ColorBox color={settings.scales.hlColor} onChange={(v) => updateScale('hlColor', v)} />
        </div>
      </div>
      
      <div className="mt-4 mb-2 h-px bg-[#2a2e39] w-full" />
      
      <SectionTitle title="TIME SCALE" />
      <CheckboxRow checked={settings.scales.dayOfWeek} onChange={(v) => updateScale('dayOfWeek', v)} label="Day of week on labels" />
      
      <div className="flex items-center justify-between py-2">
        <span className="text-[13px] text-[#d1d4dc]">Date format</span>
        <SelectDropdown 
          value={settings.scales.dateFormat} 
          onChange={(v) => updateScale('dateFormat', v)}
          options={["Mon 29 Sep '97", "29 Sep '97", "Sep '97", "09/29/1997", "29/09/1997", "1997-09-29"]}
          className="w-40"
        />
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-[13px] text-[#d1d4dc]">Time hours format</span>
        <SelectDropdown 
          value={settings.scales.timeFormat} 
          onChange={(v) => updateScale('timeFormat', v)}
          options={["24-hours", "12-hours"]}
          className="w-40"
        />
      </div>
    </div>
  );
};

const CanvasTab = ({ settings, onChange }: { settings: ChartSettings; onChange: (s: ChartSettings) => void }) => {

  const updateCanvas = (key: keyof ChartSettings['canvas'], val: any) => {
    onChange({ ...settings, canvas: { ...settings.canvas, [key]: val } });
  };
  const updateScale = (key: keyof ChartSettings['scales'], val: any) => {
    onChange({ ...settings, scales: { ...settings.scales, [key]: val } });
  };

  return (
    <div className="flex flex-col pb-24">
      <div className="flex items-center justify-between py-2">
        <span className="text-[13px] text-[#d1d4dc]">Background</span>
        <div className="flex items-center gap-2">
          <SelectDropdown 
            value={settings.canvas.bgType} 
            onChange={(v) => updateCanvas('bgType', v as any)}
            options={['Solid', 'Gradient']}
            className="w-32" 
          />
          <ColorBox 
            color={settings.canvas.bgType === 'Solid' ? settings.canvas.bgSolid : settings.canvas.bgGradientTop} 
            onChange={(v) => updateCanvas(settings.canvas.bgType === 'Solid' ? 'bgSolid' : 'bgGradientTop', v)} 
          />
          {settings.canvas.bgType === 'Gradient' && (
            <ColorBox 
              color={settings.canvas.bgGradientBottom} 
              onChange={(v) => updateCanvas('bgGradientBottom', v)} 
            />
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div 
            className={`w-[18px] h-[18px] rounded flex items-center justify-center border cursor-pointer transition-colors ${settings.canvas.vGridShow ? 'bg-[#089981] border-[#089981]' : 'border-[#434651] hover:border-[#787b86]'}`}
            onClick={() => updateCanvas('vGridShow', !settings.canvas.vGridShow)}
          >
            {settings.canvas.vGridShow && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
          </div>
          <span className="text-[13px] text-[#d1d4dc]">Vertical grid lines</span>
        </div>
        <div className="flex items-center gap-2">
          <ColorBox color={settings.canvas.vGridColor} onChange={(v) => updateCanvas('vGridColor', v)} />
          <SelectDropdown value={settings.canvas.vGridStyle} onChange={(v) => updateCanvas('vGridStyle', v as any)} options={['—', '- - -', '· · ·']} className="w-24 text-center font-bold" />
        </div>
      </div>
      
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div 
            className={`w-[18px] h-[18px] rounded flex items-center justify-center border cursor-pointer transition-colors ${settings.canvas.hGridShow ? 'bg-[#089981] border-[#089981]' : 'border-[#434651] hover:border-[#787b86]'}`}
            onClick={() => updateCanvas('hGridShow', !settings.canvas.hGridShow)}
          >
            {settings.canvas.hGridShow && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
          </div>
          <span className="text-[13px] text-[#d1d4dc]">Horizontal grid lines</span>
        </div>
        <div className="flex items-center gap-2">
          <ColorBox color={settings.canvas.hGridColor} onChange={(v) => updateCanvas('hGridColor', v)} />
          <SelectDropdown value={settings.canvas.hGridStyle} onChange={(v) => updateCanvas('hGridStyle', v as any)} options={['—', '- - -', '· · ·']} className="w-24 text-center font-bold" />
        </div>
      </div>
      
      <div className="flex items-center justify-between py-2">
        <span className="text-[13px] text-[#d1d4dc]">Crosshair</span>
        <div className="flex items-center gap-2">
          <ColorBox color={settings.canvas.crosshairColor} onChange={(v) => updateCanvas('crosshairColor', v)} />
          <SelectDropdown value={settings.canvas.crosshairStyle} onChange={(v) => updateCanvas('crosshairStyle', v as any)} options={['—', '- - -', '· · ·']} className="w-24 text-center font-bold" />
        </div>
      </div>
      
      <div className="flex items-center justify-between py-2">
        <span className="text-[13px] text-[#d1d4dc]">Watermark</span>
        <div className="flex items-center gap-2">
          <SelectDropdown 
            value={settings.canvas.watermarkVal} 
            onChange={(v) => updateCanvas('watermarkVal', v)}
            options={['Hidden', 'Ticker', 'Interval', 'Description', 'Replay mode']}
            className="w-32" 
          />
        </div>
      </div>
      
      <div className="mt-4 mb-2 h-px bg-[#2a2e39] w-full" />
      
      <SectionTitle title="SCALES" />
      <div className="flex items-center justify-between py-2">
        <span className="text-[13px] text-[#d1d4dc]">Text</span>
        <div className="flex items-center gap-2">
          <ColorBox color={settings.scales.textColor} onChange={(v) => updateScale('textColor', v)} />
          <SelectDropdown value={settings.scales.textSize.toString()} onChange={(v) => updateScale('textSize', parseInt(v))} options={['10', '11', '12', '14', '16', '20']} className="w-16 text-center" />
        </div>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-[13px] text-[#d1d4dc]">Lines</span>
        <div className="flex items-center gap-2">
          <ColorBox color={settings.scales.lineColor} onChange={(v) => updateScale('lineColor', v)} />
          <SelectDropdown value="—" options={['—', '- - -', '· · ·']} className="w-24 text-center font-bold" />
        </div>
      </div>
      
      <div className="mt-4 mb-2 h-px bg-[#2a2e39] w-full" />
      
      <SectionTitle title="BUTTONS" />
      <div className="flex items-center justify-between py-2">
        <span className="text-[13px] text-[#d1d4dc]">Navigation</span>
        <SelectDropdown 
          value={settings.canvas.navVal} 
          onChange={(v) => updateCanvas('navVal', v)}
          options={['Visible on mouse over', 'Always visible', 'Always invisible']}
          className="w-48" 
        />
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-[13px] text-[#d1d4dc]">Pane</span>
        <SelectDropdown 
          value={settings.canvas.paneVal} 
          onChange={(v) => updateCanvas('paneVal', v)}
          options={['Visible on mouse over', 'Always visible', 'Always invisible']}
          className="w-48" 
        />
      </div>

      <div className="mt-4 mb-2 h-px bg-[#2a2e39] w-full" />

      <SectionTitle title="MARGINS" />
      <div className="flex items-center justify-between py-2">
        <span className="text-[13px] text-[#d1d4dc]">Top</span>
        <div className="flex items-center gap-2">
          <input type="number" value={settings.canvas.marginTop} onChange={(e) => updateCanvas('marginTop', parseInt(e.target.value) || 0)} className="w-16 bg-[#1e222d] border border-[#2a2e39] rounded px-2 py-1 text-[13px] text-white text-right focus:outline-none focus:border-[#089981]" />
          <span className="text-[13px] text-[#787b86] w-6">%</span>
        </div>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-[13px] text-[#d1d4dc]">Bottom</span>
        <div className="flex items-center gap-2">
          <input type="number" value={settings.canvas.marginBottom} onChange={(e) => updateCanvas('marginBottom', parseInt(e.target.value) || 0)} className="w-16 bg-[#1e222d] border border-[#2a2e39] rounded px-2 py-1 text-[13px] text-white text-right focus:outline-none focus:border-[#089981]" />
          <span className="text-[13px] text-[#787b86] w-6">%</span>
        </div>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-[13px] text-[#d1d4dc]">Right</span>
        <div className="flex items-center gap-2">
          <input type="number" value={settings.canvas.marginRight} onChange={(e) => updateCanvas('marginRight', parseInt(e.target.value) || 0)} className="w-16 bg-[#1e222d] border border-[#2a2e39] rounded px-2 py-1 text-[13px] text-white text-right focus:outline-none focus:border-[#089981]" />
          <span className="text-[13px] text-[#787b86] w-6">bars</span>
        </div>
      </div>
    </div>
  );
};

const AlertsTab = ({ settings, onChange }: { settings: ChartSettings; onChange: (s: ChartSettings) => void }) => {
  const updateAlerts = (key: keyof ChartSettings['alerts'], val: any) => {
    onChange({ ...settings, alerts: { ...settings.alerts, [key]: val } });
  };
  return (
    <div className="flex flex-col">
      <SectionTitle title="ALERTS" />
      <CheckboxRow checked={settings.alerts.alertLines} onChange={(v) => updateAlerts('alertLines', v)} label="Alert lines" />
    </div>
  );
};

const EventsTab = ({ settings, onChange }: { settings: ChartSettings; onChange: (s: ChartSettings) => void }) => {
  const updateEvents = (key: keyof ChartSettings['events'], val: any) => {
    onChange({ ...settings, events: { ...settings.events, [key]: val } });
  };
  return (
    <div className="flex flex-col">
      <SectionTitle title="EVENTS" />
      <CheckboxRow 
        checked={settings.events.sessionBreaks} 
        onChange={(v) => updateEvents('sessionBreaks', v)}
        label="Session breaks" 
        colorPickers={
          <>
            <ColorBox color={settings.events.sessionBreaksColor} onChange={(v) => updateEvents('sessionBreaksColor', v)} />
            <SelectDropdown 
              value={settings.events.sessionBreaksStyle} 
              onChange={(v) => updateEvents('sessionBreaksStyle', v as any)}
              options={['—', '- - -', '· · ·']} 
              className="w-24 font-bold text-center"
            />
          </>
        } 
      />
    </div>
  );
};

// Main Modal Component
export const ChartSettingsModal = ({ onClose, chartSettings, onSettingsChange }: ChartSettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('symbol');

  const tabs = [
    { id: 'symbol', label: 'Mã giao dịch', icon: <CandlestickChart className="w-[18px] h-[18px]" /> },
    { id: 'status', label: 'Status line', icon: <List className="w-[18px] h-[18px]" /> },
    { id: 'scales', label: 'Thang đo & Đường kẻ', icon: <TrendingUp className="w-[18px] h-[18px]" /> },
    { id: 'canvas', label: 'Nền vẽ', icon: <Edit3 className="w-[18px] h-[18px]" /> },
    { id: 'alerts', label: 'Alerts', icon: <Clock className="w-[18px] h-[18px]" /> },
    { id: 'events', label: 'Events', icon: <Calendar className="w-[18px] h-[18px]" /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-[#1e222d] w-[750px] rounded flex flex-col shadow-2xl font-sans" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2e39]">
          <h2 className="text-lg font-bold text-white">Cài đặt biểu đồ</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[#2a2e39] rounded transition-colors text-[#787b86] hover:text-[#d1d4dc]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex h-[460px]">
          {/* Sidebar */}
          <div className="w-[220px] border-r border-[#2a2e39] flex flex-col py-3 shrink-0 relative">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded transition-colors text-[13px] relative ${
                  activeTab === tab.id 
                    ? 'bg-[#2a2e39] text-white font-medium' 
                    : 'text-[#d1d4dc] hover:bg-[#2a2e39]/50'
                }`}
              >
                {/* Active indicator bar */}
                {activeTab === tab.id && (
                  <div className="absolute -left-2 w-1 h-6 bg-[#089981] rounded-r" />
                )}
                <span className={`${activeTab === tab.id ? 'text-[#089981]' : 'text-[#787b86]'} shrink-0`}>
                  {tab.icon}
                </span>
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-[#131722] p-6 overflow-y-auto">
            {activeTab === 'symbol' && <SymbolTab settings={chartSettings} onChange={onSettingsChange} />}
            {activeTab === 'status' && <StatusTab settings={chartSettings} onChange={onSettingsChange} />}
            {activeTab === 'scales' && <ScalesTab settings={chartSettings} onChange={onSettingsChange} />}
            {activeTab === 'canvas' && <CanvasTab settings={chartSettings} onChange={onSettingsChange} />}
            {activeTab === 'alerts' && <AlertsTab settings={chartSettings} onChange={onSettingsChange} />}
            {activeTab === 'events' && <EventsTab settings={chartSettings} onChange={onSettingsChange} />}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#2a2e39] bg-[#1e222d]">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-[#d1d4dc] hover:bg-[#2a2e39] border border-transparent hover:border-[#434651] transition-colors">
            <span>Bản mẫu</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          <div className="flex gap-2">
            <button onClick={onClose} className="px-5 py-1.5 rounded text-sm text-[#d1d4dc] hover:text-white border border-[#2a2e39] hover:bg-[#2a2e39] transition-colors font-medium">
              Hủy
            </button>
            <button onClick={onClose} className="px-5 py-1.5 bg-[#089981] hover:bg-[#089981]/90 rounded text-sm text-white transition-colors font-medium">
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
