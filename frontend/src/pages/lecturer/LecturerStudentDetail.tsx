import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, TrendingUp, Clock, BookOpen, Target, Shield, AlertCircle } from 'lucide-react';

export const LecturerStudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [student, setStudent] = useState<any>(location.state?.student || null);
  const [loading, setLoading] = useState(!student);
  
  // Dummy data for visualization if backend lacks detailed student activity endpoints
  const [stats] = useState({
    totalSimulations: 3,
    completedAssignments: 5,
    averageScore: 88,
    winRate: 64,
    totalProfit: 12450.50,
  });

  useEffect(() => {
    // In a real scenario, we'd fetch specific student details here if not passed in state
    if (!student) {
      setLoading(false);
      // For this implementation, we rely on the state from the list page.
      // If we land here directly, we'd need a backend endpoint like /api/users/:id for lecturers.
    }
  }, [student]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] animate-in fade-in duration-500">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 gap-4 animate-in fade-in duration-500">
        <AlertCircle className="w-12 h-12 text-rose-500 opacity-80" />
        <h2 className="text-xl font-bold text-white">Student Not Found</h2>
        <p>Could not load student information. Please return to the directory.</p>
        <button 
          onClick={() => navigate('/lecturer/students')}
          className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Navigation & Header */}
      <div>
        <button 
          onClick={() => navigate('/lecturer/students')}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-2 border-indigo-500/30 text-indigo-400 flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-500/10">
              {student.name ? student.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">{student.name || 'Unknown Student'}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {student.email}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {new Date(student.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 border ${
              student.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {student.status === 'active' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
              {student.status || 'inactive'}
            </span>
            <span className="px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              <Shield className="w-3.5 h-3.5" />
              Student
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111827] p-5 rounded-2xl border border-[#253047] shadow-lg">
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <Target className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-medium">Active Simulations</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalSimulations}</p>
        </div>
        
        <div className="bg-[#111827] p-5 rounded-2xl border border-[#253047] shadow-lg">
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-medium">Completed Tasks</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.completedAssignments}</p>
        </div>
        
        <div className="bg-[#111827] p-5 rounded-2xl border border-[#253047] shadow-lg">
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-medium">Win Rate</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{stats.winRate}%</p>
        </div>
        
        <div className="bg-[#111827] p-5 rounded-2xl border border-[#253047] shadow-lg">
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-medium">Total Profit</h3>
          </div>
          <p className={`text-3xl font-bold ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${stats.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] rounded-2xl border border-[#253047] shadow-lg overflow-hidden">
            <div className="p-5 border-b border-[#253047] bg-[#172033]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                Recent Submissions
              </h2>
            </div>
            <div className="p-0">
              <div className="divide-y divide-[#253047]">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-5 hover:bg-[#172033]/50 transition-colors flex justify-between items-center group">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mt-1">
                        <BookOpen className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">Assignment {i}: Market Analysis</h4>
                        <p className="text-sm text-slate-400 mt-1">Simulation: VN30 Trading</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">Graded</span>
                      <p className="text-sm text-slate-500 mt-2 font-medium">Score: 85/100</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Enrolled Simulations */}
        <div className="space-y-6">
          <div className="bg-[#111827] rounded-2xl border border-[#253047] shadow-lg overflow-hidden">
            <div className="p-5 border-b border-[#253047] bg-[#172033]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                Enrolled Simulations
              </h2>
            </div>
            <div className="p-5 space-y-4">
              {[
                { name: 'Basic Technical Analysis', status: 'Active', color: 'emerald' },
                { name: 'Derivatives Trading', status: 'Active', color: 'emerald' },
                { name: 'Risk Management 101', status: 'Completed', color: 'indigo' },
              ].map((sim, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#172033] border border-[#253047] hover:border-indigo-500/30 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full bg-${sim.color}-500 shadow-[0_0_8px_rgba(0,0,0,0.5)] shadow-${sim.color}-500/50`}></div>
                    <span className="font-medium text-white group-hover:text-indigo-400 transition-colors">{sim.name}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider text-${sim.color}-400`}>{sim.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
