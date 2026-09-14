import { Crosshair, TrendingUp, AlignLeft, Share2, Waypoints, SlidersHorizontal, Brush, Type, Smile, Ruler, ZoomIn, Magnet, PenTool, Lock, Eye, Trash2, ChevronRight } from 'lucide-react';

const TOOLS = [
  { id: 'cursor',                   icon: Crosshair,         label: 'Con trỏ',                      separator: true,  hasDropdown: true },
  { id: 'segment',                  icon: TrendingUp,        label: 'Các công cụ Đường xu hướng',   separator: false, hasDropdown: true },
  { id: 'fibonacciLine',            icon: AlignLeft,         label: 'Các công cụ Gann và Fibonacci',separator: false, hasDropdown: true },
  { id: 'rect',                     icon: Share2,            label: 'Các Hình dạng Hình học',       separator: false, hasDropdown: true },
  { id: 'xabcd',                    icon: Waypoints,         label: 'Các Mô hình (XABCD, Elliott...)',separator: false, hasDropdown: true },
  { id: 'priceChannelLine',         icon: SlidersHorizontal, label: 'Công cụ Dự đoán và Đo lường',  separator: false, hasDropdown: true },
  { id: 'rayLine',                  icon: Brush,             label: 'Cọ vẽ',                        separator: false, hasDropdown: true },
  { id: 'simpleAnnotation',         icon: Type,              label: 'Công cụ Chú thích',            separator: false, hasDropdown: true },
  { id: 'simpleTag',                icon: Smile,             label: 'Biểu tượng',                   separator: true,  hasDropdown: true },
  { id: 'priceLine',                icon: Ruler,             label: 'Đo lường',                     separator: false, hasDropdown: false },
  { id: 'zoomIn',                   icon: ZoomIn,            label: 'Phóng to',                     separator: true,  hasDropdown: false },
  { id: 'magnet',                   icon: Magnet,            label: 'Chế độ Magnet',                separator: false, hasDropdown: true },
  { id: 'stayInDrawing',            icon: PenTool,           label: 'Giữ ở Chế độ Vẽ',              separator: false, hasDropdown: false },
  { id: 'lock',                     icon: Lock,              label: 'Khóa tất cả công cụ vẽ',       separator: false, hasDropdown: false },
  { id: 'hide',                     icon: Eye,               label: 'Ẩn tất cả công cụ vẽ',         separator: true,  hasDropdown: true },
  { id: 'clear',                    icon: Trash2,            label: 'Xóa công cụ vẽ',               separator: false, hasDropdown: true },
];

interface LeftToolbarProps {
  activeTool: string;
  onToolSelect: (toolName: string) => void;
}

export const LeftToolbar = ({ activeTool, onToolSelect }: LeftToolbarProps) => {
  return (
    <div className="w-[52px] bg-white dark:bg-[#1e222d] border-r border-[#e6e8ea] dark:border-[#2a2e39] flex flex-col items-center py-2 gap-1 shrink-0 overflow-y-auto hide-scrollbar z-10 transition-colors">
      {TOOLS.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id && tool.id !== 'clear';
        
        return (
          <div key={tool.id} className="w-full flex flex-col items-center">
            <button
              onClick={() => onToolSelect(tool.id)}
              title={tool.label}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors group relative ${
                isActive 
                  ? 'bg-[#f0f3fa] dark:bg-[#2a2e39] text-[#131722] dark:text-[#d1d4dc]' 
                  : 'text-[#787b86] hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] hover:text-[#131722] dark:hover:text-[#d1d4dc]'
              }`}
            >
              <Icon strokeWidth={1.5} className="w-[22px] h-[22px]" />
              {tool.hasDropdown && (
                <ChevronRight strokeWidth={2.5} className="w-[8px] h-[8px] absolute right-[2px] top-1/2 -translate-y-1/2 text-[#787b86]" />
              )}
            </button>
            {tool.separator && <div className="w-8 h-[1px] bg-[#e6e8ea] dark:bg-[#2a2e39] my-1 transition-colors" />}
          </div>
        );
      })}
    </div>
  );
};
