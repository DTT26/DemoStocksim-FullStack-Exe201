import React, { useState } from 'react';
import { X, Download, Copy, Link2, ExternalLink, MessageSquare, Check, Sparkles } from 'lucide-react';
import { downloadChartSnapshot, copyChartSnapshotToClipboard, openChartSnapshotInNewTab } from '../utils/chartSnapshot';

interface ChartSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  symbol?: string;
  timeframe?: string;
  isDark?: boolean;
  onShareToChat?: (imageUrl: string) => void;
}

export const ChartSnapshotModal: React.FC<ChartSnapshotModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  symbol = 'BTCUSDT',
  timeframe = '15m',
  isDark = true,
  onShareToChat
}) => {
  const [copiedType, setCopiedType] = useState<'image' | 'link' | null>(null);

  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    downloadChartSnapshot(imageUrl, symbol);
  };

  const handleCopyImage = async () => {
    try {
      await copyChartSnapshotToClipboard(imageUrl);
      setCopiedType('image');
      setTimeout(() => setCopiedType(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopiedType('link');
      setTimeout(() => setCopiedType(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenTab = () => {
    openChartSnapshotInNewTab(imageUrl, symbol, isDark);
  };

  const handleShare = () => {
    if (onShareToChat && imageUrl) {
      onShareToChat(imageUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-[#2a2e39] bg-slate-50 dark:bg-[#161a25]">
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>Ảnh chụp biểu đồ</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-xs border border-blue-500/20">
                {symbol} · {timeframe}
              </span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#2a2e39] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image Preview Container */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100/70 dark:bg-[#131722]/90 min-h-[300px]">
          <img
            src={imageUrl}
            alt="Chart Snapshot"
            className="max-h-[62vh] w-auto max-w-full rounded-lg shadow-lg border border-slate-300 dark:border-[#2a2e39] object-contain"
          />
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-slate-200 dark:border-[#2a2e39] bg-white dark:bg-[#1e222d]">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải ảnh về</span>
            </button>

            <button
              onClick={handleCopyImage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#2a2e39] dark:hover:bg-[#363a45] text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors cursor-pointer"
            >
              {copiedType === 'image' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Đã chép ảnh</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép ảnh</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#2a2e39] dark:hover:bg-[#363a45] text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors cursor-pointer"
            >
              {copiedType === 'link' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Đã chép liên kết</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Sao chép liên kết</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenTab}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2a2e39] font-medium text-xs transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Tab mới</span>
            </button>
          </div>

          {onShareToChat && (
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold text-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Chia sẻ vào AI Tutor</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
