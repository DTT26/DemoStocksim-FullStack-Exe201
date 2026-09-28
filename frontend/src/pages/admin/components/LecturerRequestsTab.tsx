import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  Check, 
  X, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building, 
  Phone, 
  Mail, 
  ExternalLink, 
  Eye, 
  Loader2,
  Filter
} from 'lucide-react';

interface LecturerApplication {
  _id: string;
  userId: {
    _id: string;
    name?: string;
    email: string;
    picture?: string;
    studentId?: string;
    status?: string;
    role?: string;
  };
  fullName: string;
  email: string;
  phone: string;
  university?: string;
  department?: string;
  experience: string;
  linkedinOrPortfolio?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  reviewedBy?: {
    name?: string;
    email: string;
  };
  reviewedAt?: string;
  createdAt: string;
}

interface LecturerRequestsTabProps {
  onRoleChanged?: () => void;
  onPendingCountChange?: (count: number) => void;
}

export const LecturerRequestsTab = ({ onRoleChanged, onPendingCountChange }: LecturerRequestsTabProps) => {
  const [applications, setApplications] = useState<LecturerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [detailApp, setDetailApp] = useState<LecturerApplication | null>(null);
  const [rejectingApp, setRejectingApp] = useState<LecturerApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvingApp, setApprovingApp] = useState<LecturerApplication | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/lecturer-applications`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setApplications(data);
          const pendingCount = data.filter((a: LecturerApplication) => a.status === 'PENDING').length;
          if (onPendingCountChange) onPendingCountChange(pendingCount);
        }
      }
    } catch (err) {
      console.error('Error fetching lecturer applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (appId: string) => {
    setActionLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/lecturer-applications/${appId}/approve`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        setToastMsg({ text: '✅ Đã phê duyệt hồ sơ và nâng cấp quyền Giảng viên thành công!', type: 'success' });
        setApprovingApp(null);
        setDetailApp(null);
        fetchApplications();
        if (onRoleChanged) onRoleChanged();
      } else {
        const err = await res.json().catch(() => ({}));
        setToastMsg({ text: err.message || 'Lỗi khi phê duyệt hồ sơ', type: 'error' });
      }
    } catch (err: any) {
      setToastMsg({ text: err.message || 'Lỗi kết nối máy chủ', type: 'error' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const handleReject = async () => {
    if (!rejectingApp) return;
    setActionLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/lecturer-applications/${rejectingApp._id}/reject`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ reason: rejectionReason.trim() })
      });

      if (res.ok) {
        setToastMsg({ text: 'Đã từ chối đơn đăng ký Giảng viên.', type: 'success' });
        setRejectingApp(null);
        setRejectionReason('');
        setDetailApp(null);
        fetchApplications();
      } else {
        const err = await res.json().catch(() => ({}));
        setToastMsg({ text: err.message || 'Lỗi khi từ chối hồ sơ', type: 'error' });
      }
    } catch (err: any) {
      setToastMsg({ text: err.message || 'Lỗi kết nối máy chủ', type: 'error' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = (app.fullName || '').toLowerCase().includes(q);
      const matchEmail = (app.email || '').toLowerCase().includes(q);
      const matchUni = (app.university || '').toLowerCase().includes(q);
      return matchName || matchEmail || matchUni;
    }
    return true;
  });

  const counts = {
    ALL: applications.length,
    PENDING: applications.filter(a => a.status === 'PENDING').length,
    APPROVED: applications.filter(a => a.status === 'APPROVED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Bị từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Chờ duyệt
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between border ${
          toastMsg.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
        }`}>
          <span>{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-slate-200 dark:border-[#262626] p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 shadow-sm">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {(['PENDING', 'ALL', 'APPROVED', 'REJECTED'] as const).map(tab => {
            const labels: Record<string, string> = {
              PENDING: 'Chờ duyệt',
              ALL: 'Tất cả',
              APPROVED: 'Đã duyệt',
              REJECTED: 'Đã từ chối',
            };
            const active = statusFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#121214] dark:hover:bg-[#1c1c1f] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#262626]'
                }`}
              >
                <span>{labels[tab]}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                  active ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}>
                  {counts[tab]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, trường..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-[#262626] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-slate-200 dark:border-[#262626] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
            <p className="text-sm">Đang tải danh sách hồ sơ đăng ký...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <GraduationCap className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Không tìm thấy yêu cầu đăng ký nào</p>
            <p className="text-xs text-slate-500 mt-1">Khi sinh viên gửi yêu cầu làm Giảng viên, danh sách sẽ hiển thị tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#262626] bg-slate-50/50 dark:bg-[#121214] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 sm:px-6">Ứng viên</th>
                  <th className="py-3.5 px-4">Đơn vị & Khoa</th>
                  <th className="py-3.5 px-4">Liên hệ</th>
                  <th className="py-3.5 px-4">Kinh nghiệm / Lý do</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#262626] text-xs sm:text-sm">
                {filteredApplications.map(app => (
                  <tr key={app._id} className="hover:bg-slate-50/80 dark:hover:bg-[#121214]/60 transition-colors">
                    {/* User info */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        {app.userId?.picture ? (
                          <img src={app.userId.picture} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-[#262626]" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-sm">
                            {app.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{app.fullName}</p>
                          <p className="text-xs text-slate-500 truncate">{app.email}</p>
                          {app.userId?.studentId && (
                            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                              MSSV: {app.userId.studentId}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* School / Department */}
                    <td className="py-4 px-4">
                      <div className="text-xs">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.university || 'Chưa cập nhật'}</span>
                        </p>
                        {app.department && (
                          <p className="text-slate-500 mt-0.5 truncate">{app.department}</p>
                        )}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-4">
                      <div className="text-xs space-y-1">
                        <p className="font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.phone}</span>
                        </p>
                        {app.linkedinOrPortfolio && (
                          <a
                            href={app.linkedinOrPortfolio.startsWith('http') ? app.linkedinOrPortfolio : `https://${app.linkedinOrPortfolio}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <span>Link CV/Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Experience excerpt */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {app.experience}
                      </p>
                      <button
                        onClick={() => setDetailApp(app)}
                        className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline mt-1 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Xem chi tiết</span>
                      </button>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(app.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      {app.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setApprovingApp(app)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                            title="Duyệt làm Giảng viên"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Duyệt</span>
                          </button>
                          <button
                            onClick={() => {
                              setRejectingApp(app);
                              setRejectionReason('');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            title="Từ chối yêu cầu"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Từ chối</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDetailApp(app)}
                          className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-[#172033] rounded-lg transition-colors cursor-pointer"
                        >
                          Chi tiết
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: View Full Details */}
      {detailApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDetailApp(null)}>
          <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-slate-200 dark:border-[#262626] shadow-2xl w-full max-w-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 dark:border-[#262626] flex justify-between items-center bg-slate-50/50 dark:bg-[#121214]">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Chi tiết hồ sơ Giảng viên</h3>
              </div>
              <button onClick={() => setDetailApp(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-[#262626]">
                {detailApp.userId?.picture ? (
                  <img src={detailApp.userId.picture} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-[#262626]" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
                    {detailApp.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{detailApp.fullName}</h4>
                  <p className="text-xs text-slate-500">{detailApp.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    {getStatusBadge(detailApp.status)}
                    <span className="text-[11px] text-slate-400">
                      Nộp ngày: {new Date(detailApp.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Số điện thoại:</span>
                  <span className="font-semibold text-slate-900 dark:text-white font-mono">{detailApp.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Đơn vị / Trường học:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{detailApp.university || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Khoa / Bộ môn:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{detailApp.department || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Hồ sơ LinkedIn / CV:</span>
                  {detailApp.linkedinOrPortfolio ? (
                    <a href={detailApp.linkedinOrPortfolio.startsWith('http') ? detailApp.linkedinOrPortfolio : `https://${detailApp.linkedinOrPortfolio}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px]">
                      <span>Xem liên kết</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : <span className="text-slate-400">—</span>}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1 font-semibold">Kinh nghiệm giảng dạy & Lý do đăng ký:</span>
                <div className="p-3 bg-slate-50 dark:bg-[#121214] rounded-xl border border-slate-200 dark:border-[#262626] text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {detailApp.experience}
                </div>
              </div>

              {detailApp.rejectionReason && (
                <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-600 dark:text-rose-400">
                  <span className="font-bold block mb-0.5">Lý do từ chối:</span>
                  <p>{detailApp.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-[#262626] flex justify-end gap-2 bg-slate-50/50 dark:bg-[#121214]">
              {detailApp.status === 'PENDING' ? (
                <>
                  <button
                    onClick={() => {
                      setRejectingApp(detailApp);
                      setRejectionReason('');
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={() => handleApprove(detailApp._id)}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                  >
                    {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Phê duyệt ngay</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setDetailApp(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Approve */}
      {approvingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setApprovingApp(null)}>
          <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-slate-200 dark:border-[#262626] shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Phê duyệt làm Giảng viên?</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                Bạn có chắc chắn muốn duyệt và nâng cấp tài khoản của <strong className="text-slate-900 dark:text-white">{approvingApp.fullName}</strong> lên vai trò <strong>Giảng viên (Lecturer)</strong>?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setApprovingApp(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => handleApprove(approvingApp._id)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Xác nhận duyệt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Reject */}
      {rejectingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setRejectingApp(null)}>
          <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-slate-200 dark:border-[#262626] shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <X className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Từ chối đơn đăng ký?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Từ chối hồ sơ xin làm Giảng viên của <strong className="text-slate-900 dark:text-white">{rejectingApp.fullName}</strong>.
              </p>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lý do từ chối (Gửi thông báo tới ứng viên):
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Nhập lý do chưa đáp ứng yêu cầu (tùy chọn)..."
                className="w-full bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-[#262626] rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 resize-none text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRejectingApp(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                <span>Xác nhận từ chối</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
