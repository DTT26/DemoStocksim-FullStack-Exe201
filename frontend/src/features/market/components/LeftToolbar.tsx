import { useState, useRef, useEffect } from 'react';
import { Crosshair, TrendingUp, AlignLeft, Brush, Type, Waypoints, SlidersHorizontal, Smile, Ruler, ZoomIn, Magnet, PenTool, Lock, Eye, Trash2, ChevronRight, Share, GitCommit, Play, FastForward, SkipForward, TrendingDown, BarChart2, Activity, AlignRight, MoveVertical, MoveHorizontal, Maximize, Square, Circle, MessageSquare, Bug, Coffee, Rocket, Lightbulb, Heart, Flag, MousePointer2, Dot, Eraser, Highlighter, ArrowUpRight, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CircleDot, Triangle, Spline, Box, Milestone, Anchor, FileText, DollarSign, MapPin, Table, MessageCircle, Tag, Compass, User } from 'lucide-react';

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    title: 'NỤ CƯỜI VÀ MỌI NGƯỜI',
    icon: Smile,
    emojis: ['😀','😃','😄','😁','😆','😅','😂','🤣','🥲','☺️','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','😈','👿','👹','👺','🤡','💩','👻','💀','☠️','👽','👾','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀','😿','😾']
  },
  {
    id: 'animals',
    title: 'ĐỘNG VẬT VÀ THIÊN NHIÊN',
    icon: Bug,
    emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🐓','🦃','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦦','🦥','🐁','🐀','🐿️','🦔','🐉','🐲','🌵','🎄','🌲','🌳','🌴','🌱','🌿','☘️','🍀','🎍','🪴','🎋','🍃','🍂','🍁','🍄','🌾','💐','🌷','🌹','🥀','🌺','🌸','🌼','🌻']
  },
  {
    id: 'food',
    title: 'THỨC ĂN VÀ ĐỒ UỐNG',
    icon: Coffee,
    emojis: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🌽','🥕','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🥪','🥙','🧆','🌮','🌯','🥗','🥘','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','☕','🍵','🧃','🥤','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🧊','🥄','🍴','🍽️','🥣','🥡','🥢','🧂']
  },
  {
    id: 'travel',
    title: 'DU LỊCH VÀ ĐỊA ĐIỂM',
    icon: Rocket,
    emojis: ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🚚','🚛','🚜','🦯','🦽','🦼','🛴','🚲','🛵','🏍️','🛺','🚨','🚔','🚍','🚘','🚖','🚡','🚠','🚟','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚂','🚆','🚇','🚊','🚉','✈️','🛫','🛬','🛩️','💺','🛰️','🚀','🛸','🚁','🛶','⛵','🚤','🛥️','🛳️','⛴️','🚢','⚓','⛽','🚧','🚦','🚥','🚏','🗺️','🗿','🗽','🗼','🏰','🏯','🏟️','🎡','🎢','🎠','⛲','⛱️','🏖️','🏝️','🏜️','🌋','⛰️','🏔️','🗻','🏕️','⛺','🏠','🏡','🏘️','🏚️','🏗️','🏭','🏢','🏬','🏣','🏤','🏥','🏦','🏨','🏪','🏫','🏩','💒','🏛️','⛪','🕌','🕍','🛕','🕋','⛩️','🛤️','🛣️','🗾','🎑','🏞️','🌅','🌄','🌠','🎇','🎆','🌇','🌆','🏙️','🌃','🌌','🌉','🌁']
  },
  {
    id: 'objects',
    title: 'ĐỒ VẬT',
    icon: Lightbulb,
    emojis: ['⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','🗜️','💽','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💸','💵','💴','💶','💷','🪙','💰','💳','💎','⚖️','🪜','🧰','🪛','🔧','🔨','⚒️','🛠️','⛏️','🪚','🔩','⚙️','🪤','🧱','⛓️','🧲','🔫','💣','🧨','🪓','🔪','🗡️','⚔️','🛡️','🚬','⚰️','🪦','⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳️','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🪠','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪥','🪒','🧽','🪣','🧴','🛎️','🔑','🗝️','🚪','🪑','🛋️','🛏️','🛌','🧸','🪆','🖼️','🪞','🪟','🛍️','🛒','🎁','🎈','🎏','🎀','🪄','🪅','🎊','🎉','🎎','🏮','🎐','🧧','✉️','📩','📨','📧','💌','📥','📤','📦','🏷️','🪧','📪','📫','📬','📭','📮','📯','📜','📃','📄','📑','🧾','📊','📈','📉','🗒️','🗓️','📆','📅','🗑️','📇','🗃️','🗳️','🗄️','📋','📁','📂','🗂️','🗞️','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🧷','🔗','📎','🖇️','📐','📏','🧮','📌','📍','✂️','🖊️','🖋️','✒️','🖌️','🖍️','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓']
  }
];

const TOOLS = [
  { 
    id: 'cursor_group',               
    icon: Crosshair,         
    label: 'Con trỏ',                      
    separator: true,  
    hasDropdown: true,
    subItems: [
      {
        category: 'CON TRỎ',
        items: [
          { id: 'cursor', label: 'Đường chéo', icon: Crosshair },
          { id: 'cursor_dot', label: 'Dấu chấm', icon: Dot },
          { id: 'cursor_arrow', label: 'Mũi tên', icon: MousePointer2 },
          { id: 'eraser', label: 'Tẩy', icon: Eraser }
        ]
      }
    ]
  },
  { 
    id: 'segment',                  
    icon: TrendingUp,        
    label: 'Các công cụ Đường xu hướng',   
    separator: false, 
    hasDropdown: true,
    subItems: [
      {
        category: 'ĐƯỜNG',
        items: [
          { id: 'segment', label: 'Đường Xu hướng', icon: TrendingUp, shortcut: 'Alt + T' },
          { id: 'rayLine', label: 'Tia', icon: TrendingUp },
          { id: 'infoLine', label: 'Đường Thông tin', icon: TrendingUp },
          { id: 'straightLine', label: 'Đường Mở rộng', icon: MoveHorizontal },
          { id: 'trendAngle', label: 'Góc Xu hướng', icon: TrendingUp },
          { id: 'horizontalStraightLine', label: 'Đường nằm ngang', icon: MoveHorizontal, shortcut: 'Alt + H' },
          { id: 'horizontalRayLine', label: 'Tia nằm ngang', icon: MoveHorizontal, shortcut: 'Alt + J' },
          { id: 'verticalStraightLine', label: 'Đường thẳng đứng', icon: MoveVertical, shortcut: 'Alt + V' },
          { id: 'crossLine', label: 'Đường giao nhau', icon: Crosshair, shortcut: 'Alt + C' }
        ]
      },
      {
        category: 'KÊNH',
        items: [
          { id: 'priceChannelLine', label: 'Kênh Song song', icon: SlidersHorizontal },
          { id: 'regressionTrend', label: 'Xu hướng hồi quy', icon: TrendingUp },
          { id: 'flatTopBottom', label: 'Mặt phẳng đỉnh/đáy', icon: MoveHorizontal },
          { id: 'disjointChannel', label: 'Không kết nối Kênh', icon: SlidersHorizontal }
        ]
      },
      {
        category: 'PITCHFORKS',
        items: [
          { id: 'pitchfork', label: 'Mô hình Pitchfork', icon: Waypoints },
          { id: 'schiffPitchfork', label: 'Mô hình Schiff Pitchfork', icon: Waypoints },
          { id: 'modifiedSchiffPitchfork', label: 'Mô hình Schiff Pitchfork Biến đổi', icon: Waypoints },
          { id: 'insidePitchfork', label: 'Mô hình Pitchfork mặt trong', icon: Waypoints }
        ]
      }
    ]
  },
  { id: 'fibonacciLine',            icon: AlignLeft,         label: 'Các công cụ Gann và Fibonacci',separator: false, hasDropdown: false },
  { 
    id: 'brush',                  
    icon: Brush,             
    label: 'Các Hình dạng Hình học & Cọ vẽ',       
    separator: false, 
    hasDropdown: true,
    subItems: [
      {
        category: 'CỌ',
        items: [
          { id: 'brush', label: 'Cọ vẽ', icon: Brush },
          { id: 'highlighter', label: 'Bút đánh dấu', icon: Highlighter }
        ]
      },
      {
        category: 'MŨI TÊN',
        items: [
          { id: 'arrowMarker', label: 'Mũi tên đánh dấu', icon: ArrowUpRight },
          { id: 'arrow', label: 'Mũi tên', icon: ArrowUpRight },
          { id: 'arrowUp', label: 'Mũi tên chỉ lên', icon: ArrowUp },
          { id: 'arrowDown', label: 'Mũi tên chỉ xuống', icon: ArrowDown },
          { id: 'arrowLeft', label: 'Mũi tên chỉ sang trái', icon: ArrowLeft },
          { id: 'arrowRight', label: 'Mũi tên chỉ sang phải', icon: ArrowRight }
        ]
      },
      {
        category: 'HÌNH DẠNG',
        items: [
          { id: 'rect', label: 'Hình chữ nhật', icon: Square, shortcut: 'Alt + Shift + R' },
          { id: 'rotatedRect', label: 'Hình chữ nhật xoay', icon: Box },
          { id: 'path', label: 'Đường dẫn', icon: Milestone },
          { id: 'circle', label: 'Vòng tròn', icon: CircleDot },
          { id: 'ellipse', label: 'Hình elip', icon: Circle },
          { id: 'polyline', label: 'Hình Polyline', icon: Waypoints },
          { id: 'triangle', label: 'Hình tam giác', icon: Triangle },
          { id: 'arc', label: 'Hình vòng cung', icon: Spline },
          { id: 'curve', label: 'Đường cong', icon: Spline },
          { id: 'doubleCurve', label: 'Đường cong đôi', icon: Activity }
        ]
      }
    ]
  },
  { 
    id: 'simpleAnnotation',         
    icon: Type,              
    label: 'Công cụ Chú thích',            
    separator: false, 
    hasDropdown: true,
    subItems: [
      {
        category: 'VĂN BẢN & CHÚ THÍCH',
        items: [
          { id: 'simpleAnnotation', label: 'Văn bản', icon: Type },
          { id: 'anchoredText', label: 'Đoạn văn bản được ghim', icon: Anchor },
          { id: 'note', label: 'Ghi chú', icon: FileText },
          { id: 'priceNote', label: 'Ghi chú Giá', icon: DollarSign },
          { id: 'pinMark', label: 'Mã Pin', icon: MapPin },
          { id: 'tableMark', label: 'Bảng', icon: Table },
          { id: 'callout', label: 'Chú thích', icon: MessageSquare },
          { id: 'comment', label: 'Bình luận', icon: MessageCircle },
          { id: 'priceLabel', label: 'Nhãn Giá', icon: Tag },
          { id: 'signpost', label: 'Biển chỉ dẫn', icon: Compass },
          { id: 'flagMark', label: 'Cờ đánh dấu', icon: Flag }
        ]
      }
    ]
  },
  { 
    id: 'xabcd',                    
    icon: Waypoints,         
    label: 'Các Mô hình (XABCD, Elliott...)',
    separator: false, 
    hasDropdown: true,
    subItems: [
      {
        category: 'CÁC MẪU',
        items: [
          { id: 'xabcd', label: 'Mẫu hình XABCD', icon: Waypoints },
          { id: 'cypher', label: 'Mẫu cypher', icon: Waypoints },
          { id: 'abcd', label: 'Mẫu hình ABCD', icon: GitCommit },
          { id: 'triangle', label: 'Mẫu hình Tam giác', icon: Play },
          { id: 'threeDrives', label: 'Mô hình Three Drives', icon: FastForward },
          { id: 'headAndShoulders', label: 'Mẫu vai đầu vai', icon: User }
        ]
      },
      {
        category: 'SÓNG ELLIOTT',
        items: [
          { id: 'elliottImpulse', label: 'Sóng đẩy Elliott (12345)', icon: TrendingUp },
          { id: 'elliottTriangle', label: 'Sóng điều chỉnh Elliott (ABC)', icon: SkipForward },
          { id: 'elliottABCDE', label: 'Sóng Elliott Tam giác (ABCDE)', icon: GitCommit },
          { id: 'elliottWXY', label: 'Sóng đôi kết hợp Elliott (WXY)', icon: Waypoints },
          { id: 'elliottTriple', label: 'Sóng Elliott kết hợp ba (WXYXZ)', icon: Waypoints }
        ]
      },
      {
        category: 'CHU KỲ',
        items: [
          { id: 'cycleLines', label: 'Các đường chu kỳ', icon: AlignRight },
          { id: 'timeCycles', label: 'Vòng thời gian', icon: Circle },
          { id: 'sineLine', label: 'Đường Sine', icon: Spline }
        ]
      }
    ]
  },
  { 
    id: 'priceChannelLine',         
    icon: SlidersHorizontal, 
    label: 'Công cụ Dự đoán và Đo lường',  
    separator: false, 
    hasDropdown: true,
    subItems: [
      {
        category: 'PHÉP CHIẾU',
        items: [
          { id: 'longPosition', label: 'Thế giá lên', icon: TrendingUp },
          { id: 'shortPosition', label: 'Thế giá xuống', icon: TrendingDown },
          { id: 'ghostFeed', label: 'Mô hình Ghost Feed', icon: Activity },
          { id: 'projection', label: 'Phép chiếu', icon: Waypoints }
        ]
      },
      {
        category: 'DỰA TRÊN KHỐI LƯỢNG',
        items: [
          { id: 'anchoredVWAP', label: 'Anchored VWAP', icon: Activity },
          { id: 'fixedRangeVolumeProfile', label: 'Khối lượng Giao dịch Phạm vi Cố định', icon: AlignRight }
        ]
      },
      {
        category: 'CÔNG CỤ ĐO LƯỜNG',
        items: [
          { id: 'priceRange', label: 'Khoảng Giá', icon: MoveVertical },
          { id: 'dateRange', label: 'Phạm vi Ngày', icon: MoveHorizontal },
          { id: 'dateAndPriceRange', label: 'Phạm vi Ngày và Giá', icon: Maximize }
        ]
      }
    ]
  },
  { 
    id: 'simpleTag',                
    icon: Smile,             
    label: 'Biểu tượng',                   
    separator: true,  
    hasDropdown: true,
    isEmojiPicker: true 
  },
  { id: 'priceLine',                icon: Ruler,             label: 'Đo lường',                     separator: false, hasDropdown: false },
  { id: 'zoomIn',                   icon: ZoomIn,            label: 'Phóng to',                     separator: true,  hasDropdown: false },
  { id: 'magnet',                   icon: Magnet,            label: 'Chế độ Magnet',                separator: false, hasDropdown: false },
  { id: 'stayInDrawing',            icon: PenTool,           label: 'Giữ ở Chế độ Vẽ',              separator: false, hasDropdown: false },
  { id: 'lock',                     icon: Lock,              label: 'Khóa tất cả công cụ vẽ',       separator: false, hasDropdown: false },
  { id: 'hide',                     icon: Eye,               label: 'Ẩn tất cả công cụ vẽ',         separator: true,  hasDropdown: false },
  { id: 'clear',                    icon: Trash2,            label: 'Xóa công cụ vẽ',               separator: false, hasDropdown: false },
];

interface LeftToolbarProps {
  activeTool: string;
  onToolSelect: (toolName: string) => void;
  magnetMode?: boolean;
  onToggleMagnet?: () => void;
  stayInDrawingMode?: boolean;
  onToggleStayInDrawingMode?: () => void;
  lockDrawing?: boolean;
  onToggleLock?: () => void;
  hideDrawing?: boolean;
  onToggleHide?: () => void;
}

export const LeftToolbar = ({ 
  activeTool, 
  onToolSelect,
  magnetMode,
  onToggleMagnet,
  stayInDrawingMode,
  onToggleStayInDrawingMode,
  lockDrawing,
  onToggleLock,
  hideDrawing,
  onToggleHide
}: LeftToolbarProps) => {
  const [activeDropdown, setActiveDropdown] = useState<{ id: string, top: number, items?: any[], isEmoji?: boolean } | null>(null);
  const [activeEmojiTab, setActiveEmojiTab] = useState<string>(EMOJI_CATEGORIES[0].id);
  const [lastSelectedSubItems, setLastSelectedSubItems] = useState<Record<string, string>>({
    cursor_group: 'cursor',
    segment: 'segment',
    brush: 'brush',
    simpleAnnotation: 'simpleAnnotation',
    xabcd: 'xabcd',
    priceChannelLine: 'longPosition'
  });
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Sync last selected sub-item whenever activeTool changes to a known sub-item
  useEffect(() => {
    if (!activeTool || activeTool === 'cursor' || activeTool === 'clear') return;
    TOOLS.forEach(tool => {
      if (tool.subItems) {
        const found = tool.subItems.flatMap(cat => cat.items).find(sub => sub.id === activeTool);
        if (found) {
          setLastSelectedSubItems(prev => ({ ...prev, [tool.id]: activeTool }));
        }
      }
    });
  }, [activeTool]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.shiftKey) {
          if (e.key.toLowerCase() === 'r') {
            e.preventDefault();
            setLastSelectedSubItems(prev => ({ ...prev, brush: 'rect' }));
            onToolSelect('rect');
          }
        } else {
          switch (e.key.toLowerCase()) {
            case 't':
              e.preventDefault();
              setLastSelectedSubItems(prev => ({ ...prev, segment: 'segment' }));
              onToolSelect('segment');
              break;
            case 'h':
              e.preventDefault();
              setLastSelectedSubItems(prev => ({ ...prev, segment: 'horizontalStraightLine' }));
              onToolSelect('horizontalStraightLine');
              break;
            case 'j':
              e.preventDefault();
              setLastSelectedSubItems(prev => ({ ...prev, segment: 'horizontalRayLine' }));
              onToolSelect('horizontalRayLine');
              break;
            case 'v':
              e.preventDefault();
              setLastSelectedSubItems(prev => ({ ...prev, segment: 'verticalStraightLine' }));
              onToolSelect('verticalStraightLine');
              break;
            case 'c':
              e.preventDefault();
              setLastSelectedSubItems(prev => ({ ...prev, segment: 'crossLine' }));
              onToolSelect('crossLine');
              break;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToolSelect]);

  return (
    <div ref={toolbarRef} className="w-[52px] bg-white dark:bg-[#1e222d] border-r border-[#e6e8ea] dark:border-[#2a2e39] flex flex-col items-center py-2 gap-1 shrink-0 z-10 transition-colors relative">
      <div className="w-full h-full flex flex-col items-center overflow-y-auto hide-scrollbar">
        {TOOLS.map((tool) => {
          const isToolActive = activeTool === tool.id || 
                               (tool.subItems && tool.subItems.some(cat => cat.items.some(sub => sub.id === activeTool))) ||
                               (tool.isEmojiPicker && activeTool.startsWith('emojiMark'));

          const currentSubItemId = isToolActive 
            ? activeTool 
            : (lastSelectedSubItems[tool.id] || (tool.subItems ? tool.subItems[0]?.items[0]?.id : tool.id));

          const activeSubItem = tool.subItems?.flatMap(cat => cat.items).find(sub => sub.id === currentSubItemId);
          const Icon = activeSubItem ? activeSubItem.icon : tool.icon;

          // Check if it's a toggle tool
          const isMagnet = tool.id === 'magnet';
          const isStay = tool.id === 'stayInDrawing';
          const isLock = tool.id === 'lock';
          const isHide = tool.id === 'hide';
          
          const isActiveToggle = 
            (isMagnet && magnetMode) ||
            (isStay && stayInDrawingMode) ||
            (isLock && lockDrawing) ||
            (isHide && hideDrawing);

          const isActive = (isToolActive || isActiveToggle) && tool.id !== 'clear';
          
          return (
            <div key={tool.id} className="w-full flex flex-col items-center">
              <div className="relative group w-10 h-10 flex items-center justify-center">
                <button
                  onClick={() => {
                    if (isMagnet) onToggleMagnet?.();
                    else if (isStay) onToggleStayInDrawingMode?.();
                    else if (isLock) onToggleLock?.();
                    else if (isHide) onToggleHide?.();
                    else {
                      const targetTool = lastSelectedSubItems[tool.id] || (tool.id === 'cursor_group' ? 'cursor' : tool.id);
                      onToolSelect(targetTool);
                    }
                  }}
                  title={activeSubItem ? activeSubItem.label : tool.label}
                  className={`w-full h-full flex items-center justify-center rounded-lg transition-colors relative ${
                    isActive 
                      ? 'bg-[#f0f3fa] dark:bg-[#2a2e39] text-blue-500' 
                      : 'text-[#787b86] hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] hover:text-[#131722] dark:hover:text-[#d1d4dc]'
                  }`}
                >
                  <Icon strokeWidth={isActive ? 2 : 1.5} className="w-[22px] h-[22px]" />
                </button>
                
                {tool.hasDropdown && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setActiveDropdown(prev => prev?.id === tool.id ? null : { 
                        id: tool.id, 
                        top: rect.top, 
                        items: tool.subItems || [], 
                        isEmoji: tool.isEmojiPicker 
                      });
                    }}
                    className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center text-[#787b86] hover:bg-black/10 dark:hover:bg-white/10 rounded-r-lg"
                  >
                    <ChevronRight strokeWidth={2.5} className="w-[8px] h-[8px]" />
                  </button>
                )}
              </div>
              {tool.separator && <div className="w-8 h-[1px] bg-[#e6e8ea] dark:bg-[#2a2e39] my-1 transition-colors" />}
            </div>
          );
        })}
      </div>

      {/* Dropdown Menu Portal */}
      {activeDropdown && (
        <div 
          className={`fixed z-50 bg-white dark:bg-[#1e222d] shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.1)] border border-[#e6e8ea] dark:border-[#2a2e39] rounded-lg py-2 flex flex-col ${activeDropdown.isEmoji ? 'w-64 max-h-[300px] overflow-y-auto hide-scrollbar' : 'w-72 max-h-[420px] overflow-y-auto hide-scrollbar'}`}
          style={{ top: Math.max(10, activeDropdown.top - 20), left: 52 }}
        >
          {activeDropdown.isEmoji ? (
            <div className="flex flex-col h-full">
              {/* Tabs */}
              <div className="flex items-center justify-between px-2 pb-2 border-b border-[#e6e8ea] dark:border-[#2a2e39] mb-2 shrink-0">
                {EMOJI_CATEGORIES.map(cat => {
                  const CatIcon = cat.icon;
                  const isActiveCat = activeEmojiTab === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveEmojiTab(cat.id)}
                      title={cat.title}
                      className={`p-1.5 rounded transition-colors relative ${isActiveCat ? 'text-blue-500' : 'text-[#787b86] hover:text-[#131722] dark:hover:text-[#d1d4dc] hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                      <CatIcon strokeWidth={isActiveCat ? 2 : 1.5} className="w-4 h-4" />
                      {isActiveCat && <div className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />}
                    </button>
                  );
                })}
              </div>
              
              {/* Active Category Content */}
              <div className="flex flex-col flex-1 min-h-0">
                {EMOJI_CATEGORIES.map(cat => (
                  <div key={cat.id} className={`${activeEmojiTab === cat.id ? 'flex' : 'hidden'} flex-col h-full`}>
                    <span className="text-[11px] font-semibold text-[#787b86] px-4 py-1.5 uppercase tracking-wider shrink-0">
                      {cat.title}
                    </span>
                    <div className="flex flex-wrap gap-1 p-2 justify-start overflow-y-auto hide-scrollbar flex-1">
                      {cat.emojis.map((emoji, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            onToolSelect(`emojiMark:${emoji}`);
                            setActiveDropdown(null);
                          }}
                          className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] rounded transition-colors shrink-0"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            activeDropdown.items?.map((category, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-[11px] font-semibold text-[#787b86] px-4 py-1.5 uppercase tracking-wider">
                  {category.category}
                </span>
                {category.items.map((item: any) => {
                  const ItemIcon = item.icon;
                  const isSelected = activeTool === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setLastSelectedSubItems(prev => ({ ...prev, [activeDropdown.id]: item.id }));
                        onToolSelect(item.id);
                        setActiveDropdown(null);
                      }}
                      className={`flex items-center justify-between px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] transition-colors ${
                        isSelected ? 'text-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'text-[#131722] dark:text-[#d1d4dc]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ItemIcon strokeWidth={1.5} className={`w-5 h-5 shrink-0 ${isSelected ? 'text-blue-500' : 'text-[#787b86]'}`} />
                        <span className="text-[13px] truncate">{item.label}</span>
                      </div>
                      {item.shortcut && (
                        <span className="text-[11px] text-[#787b86] font-mono ml-3 shrink-0">{item.shortcut}</span>
                      )}
                    </button>
                  );
                })}
                {idx < (activeDropdown.items?.length || 0) - 1 && (
                  <div className="w-full h-[1px] bg-[#e6e8ea] dark:bg-[#2a2e39] my-1" />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
