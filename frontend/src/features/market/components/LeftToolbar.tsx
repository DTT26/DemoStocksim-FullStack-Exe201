import { MousePointer2, TrendingUp, Minus, ArrowUpDown, BarChart2, Square, GitBranch, Type, Scissors, Percent } from 'lucide-react';

const TOOLS = [
  { id: 'cursor',          icon: MousePointer2, label: 'Cursor (Thoát chế độ vẽ)',    separator: false, color: 'default' },
  { id: 'trendLine',       icon: TrendingUp,    label: 'Trend Line (Đường xu hướng)', separator: false, color: 'default' },
  { id: 'horizontalLine',  icon: Minus,         label: 'Horizontal Line (Đường ngang)',separator: false, color: 'default' },
  { id: 'verticalLine',    icon: ArrowUpDown,   label: 'Vertical Line (Đường dọc)',    separator: false, color: 'default' },
  { id: 'rayLine',         icon: GitBranch,     label: 'Ray / Tia',                    separator: true,  color: 'default' },
  { id: 'fibonacciLine',   icon: Percent,       label: 'Fibonacci Retracement',        separator: false, color: 'default' },
  { id: 'rect',            icon: Square,        label: 'Rectangle (Hình chữ nhật)',    separator: false, color: 'default' },
  { id: 'parallelChannel', icon: BarChart2,     label: 'Parallel Channel',             separator: true,  color: 'default' },
  { id: 'text',            icon: Type,          label: 'Text Annotation',              separator: false, color: 'default' },
  { id: 'clear',           icon: Scissors,      label: 'Xóa toàn bộ nét vẽ',          separator: false, color: 'red'     },
];

interface LeftToolbarProps {
  activeTool: string;
  onToolClick: (toolName: string) => void;
}

export const LeftToolbar = ({ activeTool, onToolClick }: LeftToolbarProps) => {
  return (
    <div className="w-[50px] bg-[#131722] border-r border-[#2a2e39] flex flex-col items-center py-1 shrink-0">
      {TOOLS.map((tool) => {
        const isActive = activeTool === tool.id && tool.id !== 'clear';
        return (
          <div key={tool.id} className="w-full flex flex-col items-center">
            <button
              title={tool.label}
              onClick={() => onToolClick(tool.id)}
              className={`w-full flex justify-center p-2.5 transition-colors group relative ${
                isActive
                  ? 'text-blue-400 bg-blue-900/30'
                  : tool.color === 'red'
                  ? 'text-[#787b86] hover:text-red-400 hover:bg-red-900/20'
                  : 'text-[#787b86] hover:text-blue-400 hover:bg-[#2a2e39]'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-blue-500 rounded-r" />
              )}
              <tool.icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
            </button>
            {tool.separator && <div className="w-6 h-px bg-[#2a2e39] my-0.5" />}
          </div>
        );
      })}
    </div>
  );
};
