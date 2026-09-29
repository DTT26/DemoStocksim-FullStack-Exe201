import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Download, Copy, Link2, ExternalLink, MessageSquare, Eye, Loader2, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import type { Stock } from '../data';
import { 
  captureChartSnapshot, 
  downloadChartSnapshot, 
  copyChartSnapshotToClipboard, 
  openChartSnapshotInNewTab 
} from '../utils/chartSnapshot';
import { ChartSnapshotModal } from './ChartSnapshotModal';

interface ChartSnapshotDropdownProps {
  selectedStock?: Stock;
  activeTimeframe?: string;
  onShareToChat?: (imageUrl: string) => void;
}

export const ChartSnapshotDropdown: React.FC<ChartSnapshotDropdownProps> = ({
  selectedStock,
  activeTimeframe = '15m',
  onShareToChat
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Modal Preview state
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({ text, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Helper to capture current snapshot
  const takeSnapshot = useCallback(async (): Promise<string | null> => {
    try {
      setIsProcessing(true);
      const url = await captureChartSnapshot({
        theme,
        user,
        selectedStock,
        activeTimeframe
      });
      return url;
    } catch (err: any) {
      console.error('Lỗi khi chụp biểu đồ:', err);
      showToast(err?.message || 'Không thể chụp ảnh biểu đồ', 'error');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [theme, user, selectedStock, activeTimeframe, showToast]);

  // Option 1: Tải ảnh về (Alt+Ctrl+S)
  const handleDownload = useCallback(async () => {
    setIsOpen(false);
    const dataUrl = await takeSnapshot();
    if (!dataUrl) return;
    downloadChartSnapshot(dataUrl, selectedStock?.symbol || 'CHART');
    showToast('Đã tải ảnh biểu đồ về máy', 'success');
  }, [takeSnapshot, selectedStock, showToast]);

  // Option 2: Sao chép ảnh ... (Ctrl+Shift+S)
  const handleCopyImage = useCallback(async () => {
    setIsOpen(false);
    const dataUrl = await takeSnapshot();
    if (!dataUrl) return;
    try {
      await copyChartSnapshotToClipboard(dataUrl);
      showToast('Đã sao chép ảnh vào bộ nhớ tạm', 'success');
    } catch (err) {
      showToast('Không thể sao chép ảnh trực tiếp (vui lòng dùng tính năng tải về)', 'error');
    }
  }, [takeSnapshot, showToast]);

  // Option 3: Sao chép liên kết ảnh (Alt+S)
  const handleCopyLink = useCallback(async () => {
    setIsOpen(false);
    const dataUrl = await takeSnapshot();
    if (!dataUrl) return;
    try {
      await navigator.clipboard.writeText(dataUrl);
      showToast('Đã sao chép liên kết ảnh biểu đồ', 'success');
    } catch (err) {
      showToast('Không thể sao chép liên kết', 'error');
    }
  }, [takeSnapshot, showToast]);

  // Option 4: Mở ảnh trong tab mới
  const handleOpenNewTab = useCallback(async () => {
    setIsOpen(false);
    const dataUrl = await takeSnapshot();
    if (!dataUrl) return;
    openChartSnapshotInNewTab(dataUrl, selectedStock?.symbol || 'CHART', isDark);
  }, [takeSnapshot, selectedStock, isDark]);

  // Option 5: Chia sẻ vào đoạn chat
  const handleShareToChat = useCallback(async () => {
    setIsOpen(false);
    const dataUrl = await takeSnapshot();
    if (!dataUrl) return;
    if (onShareToChat) {
      onShareToChat(dataUrl);
      showToast('Đã gửi ảnh biểu đồ vào AI Tutor', 'success');
    } else {
      // Fallback: Open preview modal if chat callback not provided
      setPreviewImageUrl(dataUrl);
      setIsPreviewOpen(true);
    }
  }, [takeSnapshot, onShareToChat, showToast]);

  // Option 6: Xem trước ảnh chụp
  const handleOpenPreview = useCallback(async () => {
    setIsOpen(false);
    const dataUrl = await takeSnapshot();
    if (!dataUrl) return;
    setPreviewImageUrl(dataUrl);
    setIsPreviewOpen(true);
  }, [takeSnapshot]);

  // Keyboard Shortcuts: Alt+Ctrl+S, Ctrl+Shift+S, Alt+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const tag = activeEl?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (activeEl as HTMLElement)?.isContentEditable) {
        return;
      }

      // Alt+Ctrl+S (or Ctrl+Alt+S) -> Tải ảnh về
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.code === 'KeyS' || e.key.toLowerCase() === 's')) {
        e.preventDefault();
        e.stopPropagation();
        handleDownload();
        return;
      }

      // Ctrl+Shift+S -> Sao chép ảnh
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.code === 'KeyS' || e.key.toLowerCase() === 's')) {
        e.preventDefault();
        e.stopPropagation();
        handleCopyImage();
        return;
      }

      // Alt+S (without Ctrl and without Shift) -> Sao chép liên kết ảnh
      if (e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey && (e.code === 'KeyS' || e.key.toLowerCase() === 's')) {
        e.preventDefault();
        e.stopPropagation();
        handleCopyLink();
        return;
      }

      // Escape closes dropdown
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDownload, handleCopyImage, handleCopyLink, isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <div className="relative inline-block" ref={dropdownRef}>
        {/* Nút Camera Icon (Bên trái chữ AI Tutor) */}
        <button
          onClick={() => setIsOpen(prev => !prev)}
          disabled={isProcessing}
          className={`flex items-center justify-center p-1.5 rounded-lg transition-all cursor-pointer relative ${
            isOpen 
              ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30' 
              : 'hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] text-[#787b86] hover:text-[#1e2329] dark:hover:text-[#d1d4dc]'
          }`}
          title="Ảnh chụp biểu đồ (Alt+Ctrl+S)"
          aria-label="Ảnh chụp biểu đồ"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </button>

        {/* Dropdown Menu (Phong cách TradingView như hình 1) */}
        {isOpen && (
          <div 
            className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-[#1e222d] border border-[#e6e8ea] dark:border-[#2a2e39] rounded-xl shadow-2xl py-1.5 z-50 text-xs text-[#1e2329] dark:text-[#d1d4dc] select-none animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: ẢNH CHỤP BIỂU ĐỒ */}
            <div className="px-4 py-2 text-[11px] font-bold text-[#787b86] tracking-wider uppercase border-b border-[#e6e8ea] dark:border-[#2a2e39]/80">
              ẢNH CHỤP BIỂU ĐỒ
            </div>

            {/* Menu Items */}
            <div className="py-1">
              {/* 1. Tải ảnh về (Alt+Ctrl+S) */}
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-[#787b86] group-hover:text-blue-500 transition-colors" />
                  <span className="font-medium text-[#1e2329] dark:text-slate-200">Tải ảnh về</span>
                </div>
                <span className="text-[10px] text-[#787b86] font-mono tracking-tight font-medium">Alt+Ctrl+S</span>
              </button>

              {/* 2. Sao chép ảnh ... (Ctrl+Shift+S) */}
              <button
                onClick={handleCopyImage}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Copy className="w-4 h-4 text-[#787b86] group-hover:text-blue-500 transition-colors" />
                  <span className="font-medium text-[#1e2329] dark:text-slate-200">Sao chép ảnh ...</span>
                </div>
                <span className="text-[10px] text-[#787b86] font-mono tracking-tight font-medium">Ctrl+Shift+S</span>
              </button>

              {/* 3. Sao chép liên kết ảnh (Alt+S) */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Link2 className="w-4 h-4 text-[#787b86] group-hover:text-blue-500 transition-colors" />
                  <span className="font-medium text-[#1e2329] dark:text-slate-200">Sao chép liên kết ảnh</span>
                </div>
                <span className="text-[10px] text-[#787b86] font-mono tracking-tight font-medium">Alt+S</span>
              </button>

              {/* 4. Mở ảnh trong tab mới */}
              <button
                onClick={handleOpenNewTab}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="w-4 h-4 text-[#787b86] group-hover:text-blue-500 transition-colors" />
                  <span className="font-medium text-[#1e2329] dark:text-slate-200">Mở ảnh trong tab mới</span>
                </div>
              </button>

              <div className="w-full h-px bg-[#e6e8ea] dark:bg-[#2a2e39] my-1" />

              {/* 5. Chia sẻ vào đoạn chat */}
              <button
                onClick={handleShareToChat}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-[#787b86] group-hover:text-amber-500 transition-colors" />
                  <span className="font-medium text-[#1e2329] dark:text-slate-200">Chia sẻ vào đoạn chat</span>
                </div>
              </button>

              {/* 6. Xem trước ảnh (Tiện ích bổ sung) */}
              <button
                onClick={handleOpenPreview}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#f0f3fa] dark:hover:bg-[#2a2e39] transition-colors text-left cursor-pointer group text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-[#787b86] group-hover:text-indigo-500 transition-colors" />
                  <span>Xem trước ảnh chụp...</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="fixed top-14 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-200 pointer-events-none">
          <div className={`px-4 py-2.5 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md ${
            toastMessage.type === 'error'
              ? 'bg-red-500/90 text-white border-red-600'
              : 'bg-emerald-600/95 text-white border-emerald-500/30'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      <ChartSnapshotModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        imageUrl={previewImageUrl}
        symbol={selectedStock?.symbol}
        timeframe={activeTimeframe}
        isDark={isDark}
        onShareToChat={onShareToChat}
      />
    </>
  );
};
