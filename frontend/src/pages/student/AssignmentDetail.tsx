import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, CheckCircle2, User, PlayCircle } from 'lucide-react';
import { MOCK_ASSIGNMENTS } from '../../data/mockStudentData';

export const StudentAssignmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const assignment = MOCK_ASSIGNMENTS.find(a => a.id === id);

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <h2 className="text-xl font-bold text-white mb-2">Assignment not found</h2>
        <p>This assignment might have been removed or doesn't exist.</p>
        <Link to="/student/assignments" className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Back to Assignments
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'In Progress': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'Completed': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'Overdue': return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/student/assignments" className="p-2 text-slate-400 hover:text-white hover:bg-[#172033] rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            {assignment.title}
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${getStatusColor(assignment.status)}`}>
              {assignment.status}
            </span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] rounded-2xl border border-[#253047] p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">Instructions</h2>
            <div className="prose prose-invert max-w-none text-slate-300">
              <p>{assignment.instructions}</p>
            </div>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-[#253047] overflow-hidden shadow-lg">
            <div className="p-6 border-b border-[#253047] flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Requirements checklist</h2>
              <span className="text-sm font-semibold text-indigo-400">
                {assignment.requirementsCompleted} / {assignment.totalRequirements} completed
              </span>
            </div>
            <div className="divide-y divide-[#253047]">
              {assignment.requirements.map(req => (
                <div key={req.id} className="p-4 sm:p-6 flex items-start gap-4 hover:bg-[#172033]/50 transition-colors">
                  <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                    req.completed ? 'border-emerald-500 bg-emerald-500/20 text-emerald-500' : 'border-slate-500 border-dashed text-transparent'
                  }`}>
                    {req.completed && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className={`text-base font-medium ${req.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                      {req.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111827] rounded-2xl border border-[#253047] p-6 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Assignment Info</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Simulation</p>
                <p className="text-sm font-medium text-white">{assignment.simulation}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Lecturer</p>
                <p className="text-sm font-medium text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  {assignment.lecturer}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Deadline</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-400" />
                  <p className="text-sm font-medium text-rose-400">
                    {new Date(assignment.deadline).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#253047]">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400">Overall Progress</span>
                <span className="text-white font-bold">{assignment.progress}%</span>
              </div>
              <div className="w-full bg-[#253047] rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${assignment.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                  style={{ width: `${assignment.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/40 to-[#111827] rounded-2xl border border-indigo-500/20 p-6 shadow-lg text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <PlayCircle className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Ready to complete?</h3>
            <p className="text-sm text-slate-400 mb-6">Enter the simulation to execute the required trades and analysis.</p>
            <Link to="/trade/sim-01" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-lg shadow-indigo-600/20">
              Open Trading Terminal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
