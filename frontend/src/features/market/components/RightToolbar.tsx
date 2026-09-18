import { List, ArrowLeftRight, BarChart2, Calculator } from 'lucide-react';

interface RightToolbarProps {
  activePanel: 'watchlist' | 'order' | 'simulation' | 'calculator' | null;
  onChangePanel: (panel: 'watchlist' | 'order' | 'simulation' | 'calculator' | null) => void;
}

export const RightToolbar = ({ activePanel, onChangePanel }: RightToolbarProps) => {
  return (
    <div className="w-12 border-l border-[#e6e8ea] dark:border-[#2a2e39] bg-white dark:bg-[#131722] shrink-0 flex flex-col items-center py-2 gap-2 h-full">
      <button
        onClick={() => onChangePanel(activePanel === 'watchlist' ? null : 'watchlist')}
        className={`p-2 rounded transition-colors ${
          activePanel === 'watchlist' 
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
            : 'text-[#787b86] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2e39]/50 hover:text-[#1e2329] dark:hover:text-white'
        }`}
        title="Danh sách theo dõi"
      >
        <List className="w-[22px] h-[22px] stroke-[1.5]" />
      </button>

      <button
        onClick={() => onChangePanel(activePanel === 'simulation' ? null : 'simulation')}
        className={`p-2 rounded transition-colors ${
          activePanel === 'simulation' 
            ? 'bg-[#089981] text-white dark:bg-[#089981] dark:text-white' 
            : 'text-[#787b86] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2e39]/50 hover:text-[#1e2329] dark:hover:text-white'
        }`}
        title="Mô phỏng Giao dịch"
      >
        <BarChart2 className="w-[22px] h-[22px] stroke-[1.5]" />
      </button>

      <button
        onClick={() => onChangePanel(activePanel === 'order' ? null : 'order')}
        className={`p-2 rounded transition-colors ${
          activePanel === 'order' 
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
            : 'text-[#787b86] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2e39]/50 hover:text-[#1e2329] dark:hover:text-white'
        }`}
        title="Bảng đặt lệnh"
      >
        <ArrowLeftRight className="w-[22px] h-[22px] stroke-[1.5]" />
      </button>

      {/* Calculator at the bottom (or just below order) */}
      <button
        onClick={() => onChangePanel(activePanel === 'calculator' ? null : 'calculator')}
        className={`p-2 rounded transition-colors mt-auto ${
          activePanel === 'calculator' 
            ? 'bg-transparent text-[#089981] border-2 border-[#089981] dark:border-[#089981]' 
            : 'text-[#787b86] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2e39]/50 hover:text-[#1e2329] dark:hover:text-white border-2 border-transparent'
        }`}
        title="Tính khối lượng vị thế"
      >
        <Calculator className="w-[20px] h-[20px] stroke-[1.5]" />
      </button>
    </div>
  );
};
