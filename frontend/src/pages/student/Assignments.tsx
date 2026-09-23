import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Clock, CheckCircle2, AlertCircle, Award, ArrowRight } from 'lucide-react';
import { MOCK_ASSIGNMENTS } from '../../data/mockStudentData';

export const StudentAssignments = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/assignments/my`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAssignments(data);
          return;
        }
      }
      // Fallback sang mock nếu chưa có dữ liệu backend
      setAssignments(MOCK_ASSIGNMENTS);
    } catch (err) {
      console.warn('Lỗi lấy bài tập từ backend, sử dụng mock:', err);
      setAssignments(MOCK_ASSIGNMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const getStatus = (a: any) => {
    if (a.studentStatus) {
      if (a.studentStatus === 'GRADED') return 'Graded';
      if (a.studentStatus === 'SUBMITTED') return 'Submitted';
      if (a.studentStatus === 'OVERDUE') return 'Overdue';
      return 'In Progress';
    }
    return a.status || 'In Progress';
  };

  const filteredAssignments = assignments.filter(a => {
    const status = getStatus(a);
    if (filter === 'All') return true;
    if (filter === 'In Progress') return status === 'In Progress' || status === 'Not Started';
    if (filter === 'Submitted') return status === 'Submitted';
    if (filter === 'Graded') return status === 'Graded' || status === 'Completed';
    if (filter === 'Overdue') return status === 'Overdue';
    return true;
  });

  const getStatusBadge = (status: string, score?: number) => {
    switch (status) {
      case 'Graded':
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold uppercase border bg-purple-500/10 text-purple-400 border-purple-500/20">
            <Award className="w-3.5 h-3.5" />
            {score !== undefined ? `Đã chấm: ${score}đ` : 'Đã chấm điểm'}
          </span>
        );
      case 'Submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã nộp bài
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold uppercase border bg-rose-500/10 text-rose-400 border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Quá hạn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold uppercase border bg-amber-500/10 text-amber-400 border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Đang làm
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Bài tập & Phân tích (Assignments)</h1>
        <p className="text-slate-400 mt-2 text-base">
          Hoàn thành các bài tập phân tích kỹ thuật và quản trị vốn do Giảng viên giao.
        </p>
      </div>

      <div className="bg-[#111827] rounded-2xl border border-[#253047] shadow-xl overflow-hidden">
        {/* Filter Tabs */}
        <div className="flex border-b border-[#253047] px-4 overflow-x-auto">
          {['All', 'In Progress', 'Submitted', 'Graded', 'Overdue'].map(tab => {
            const labelMap: Record<string, string> = {
              'All': 'Tất cả',
              'In Progress': 'Đang làm',
              'Submitted': 'Đã nộp',
              'Graded': 'Đã chấm điểm',
              'Overdue': 'Quá hạn'
            };
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-5 py-4 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
                  filter === tab
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {labelMap[tab] || tab}
              </button>
            );
          })}
        </div>
        
        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <span>Đang tải danh sách bài tập...</span>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#172033] border-b border-[#253047] text-slate-400 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tên bài tập</th>
                  <th className="px-6 py-4 font-semibold">Kỳ thi mô phỏng</th>
                  <th className="px-6 py-4 font-semibold">Hạn nộp</th>
                  <th className="px-6 py-4 font-semibold">Tiến độ checklist</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#253047]">
                {filteredAssignments.map((assignment) => {
                  const id = assignment._id || assignment.id;
                  const status = getStatus(assignment);
                  const progress = assignment.progress !== undefined ? assignment.progress : (status === 'Submitted' || status === 'Graded' ? 100 : 0);
                  const simName = assignment.simulationId?.name || assignment.simulation || 'Vietnam Stock Challenge';
                  const score = assignment.mySubmission?.score;

                  return (
                    <tr key={id} className="hover:bg-[#172033]/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${
                            status === 'Graded' ? 'bg-purple-500/10 text-purple-400' :
                            status === 'Submitted' ? 'bg-emerald-500/10 text-emerald-400' :
                            status === 'Overdue' ? 'bg-rose-500/10 text-rose-400' :
                            'bg-indigo-500/10 text-indigo-400'
                          }`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-white group-hover:text-indigo-400 transition-colors block">
                              {assignment.title}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              Mã CP: <strong className="text-slate-400">{assignment.symbol || 'FPT'}</strong>
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-300 font-medium">
                        {simName}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span>{new Date(assignment.deadline).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-[#253047] rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-300">{progress}%</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(status, score)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link 
                          to={`/student/assignments/${id}`} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg font-semibold text-xs transition-colors"
                        >
                          <span>{status === 'Submitted' || status === 'Graded' ? 'Xem bài làm' : 'Làm bài'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {filteredAssignments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                      <FileText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                      <p className="text-base font-semibold text-slate-300">Không có bài tập nào trong mục này</p>
                      <p className="text-xs text-slate-500 mt-1">Các bài tập mới từ giảng viên sẽ xuất hiện tại đây.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
