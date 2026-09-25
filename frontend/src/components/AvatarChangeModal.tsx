import React, { useState, useRef } from 'react';
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Trash2, Check, Loader2, Sparkles, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AvatarChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPicture?: string;
  userName?: string;
  onSuccess?: () => void;
}

const PRESET_AVATARS = [
  { id: 'av1', label: 'Trader 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { id: 'av2', label: 'Trader 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { id: 'av3', label: 'Analyst 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80' },
  { id: 'av4', label: 'Executive', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80' },
  { id: 'av5', label: 'Student 1', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80' },
  { id: 'av6', label: 'Student 2', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' },
  { id: 'av7', label: 'Tech Lead', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
  { id: 'av8', label: 'Robot Algo', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=StockSimBot' },
  { id: 'av9', label: 'Smart Trader', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StockTrader' },
  { id: 'av10', label: 'Finance Bull', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=BullMarket' },
];

export const AvatarChangeModal: React.FC<AvatarChangeModalProps> = ({
  isOpen,
  onClose,
  currentPicture,
  userName = 'User',
  onSuccess,
}) => {
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [previewImage, setPreviewImage] = useState<string>(currentPicture || '');
  const [urlInput, setUrlInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process file upload with client-side resize
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh (PNG, JPG, WEBP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh tối đa là 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setPreviewImage(dataUrl);
      };
      img.onerror = () => setError('Không thể đọc file ảnh này');
      img.src = event.target?.result as string;
    };
    reader.onerror = () => setError('Lỗi khi đọc file ảnh');
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setError(null);
    setPreviewImage(urlInput.trim());
  };

  const handleSaveAvatar = async (avatarToSave?: string) => {
    setLoading(true);
    setError(null);
    const pictureVal = avatarToSave !== undefined ? avatarToSave : previewImage;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/users/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ picture: pictureVal }),
      });

      if (res.ok) {
        await refreshUser();
        onSuccess?.();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Lỗi khi lưu ảnh đại diện');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setPreviewImage('');
    handleSaveAvatar('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-[#253047] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-[#253047] flex items-center justify-between bg-slate-50 dark:bg-[#172033]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Đổi ảnh đại diện</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Chọn hoặc tải lên ảnh đại diện mới của bạn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Current / New Avatar Preview */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative group">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Avatar Preview"
                  referrerPolicy="no-referrer"
                  className="w-28 h-28 rounded-full border-4 border-indigo-500 shadow-xl object-cover bg-slate-100 dark:bg-[#172033]"
                  onError={() => setError('Không thể tải trước hình ảnh này. Vui lòng kiểm tra lại đường link.')}
                />
              ) : (
                <div className="w-28 h-28 rounded-full border-4 border-slate-300 dark:border-slate-700 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl">
                  {userName.charAt(0).toUpperCase() || <User className="w-12 h-12" />}
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {previewImage ? 'Hình ảnh hiển thị hiện tại' : 'Chưa có ảnh (sử dụng chữ cái mặc định)'}
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-[#253047] gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Upload className="w-4 h-4" /> Tải ảnh từ máy
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
                activeTab === 'presets'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Mẫu có sẵn
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
                activeTab === 'url'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LinkIcon className="w-4 h-4" /> Đường dẫn link ảnh
            </button>
          </div>

          {/* Tab 1: Upload from device */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-[#253047] hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-[#172033]/30 flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Bấm để chọn ảnh từ máy tính
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Hỗ trợ PNG, JPG, JPEG, WEBP tối đa 5MB (ảnh sẽ tự động tối ưu tỉ lệ vuông)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Chọn một hình mẫu trong bộ sưu tập:
              </p>
              <div className="grid grid-cols-5 gap-3 max-h-52 overflow-y-auto p-1">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = previewImage === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setError(null);
                        setPreviewImage(preset.url);
                      }}
                      className={`relative rounded-full aspect-square overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-500/40 scale-105'
                          : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 opacity-80 hover:opacity-100'
                      }`}
                      title={preset.label}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover rounded-full bg-slate-100 dark:bg-[#172033]"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center rounded-full">
                          <Check className="w-4 h-4 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: URL input */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nhập đường dẫn URL ảnh (HTTPS):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#253047] rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Xem thử
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 dark:border-[#253047] bg-slate-50 dark:bg-[#172033]/60 flex items-center justify-between gap-3">
          {currentPicture ? (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={loading}
              className="px-3.5 py-2 text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Gỡ ảnh</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => handleSaveAvatar()}
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 hover:scale-[1.02]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
