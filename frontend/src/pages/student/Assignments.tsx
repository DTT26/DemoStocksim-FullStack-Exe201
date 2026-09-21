import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { MOCK_ASSIGNMENTS } from '../../data/mockStudentData';

export const StudentAssignments = () => {
  const [filter, setFilter] = useState('All');

  const filteredAssignments = MOCK_ASSIGNMENTS.filter(a => {
    if (filter === 'All') return true;
    return a.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'In Progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Overdue': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'In Progress': return <Clock className="w-3.5 h-3.5 mr-1" />;
      case 'Completed': return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      case 'Overdue': return <AlertCircle className="w-3.5 h-3.5 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Assignments</h1>
        <p className="text-slate-400 mt-2 text-lg">Complete trading exercises assigned by your lecturer.</p>
      </div>

      <div className="bg-[#111827] rounded-2xl border border-[#253047] shadow-lg overflow-hidden">
        <div className="flex border-b border-[#253047] px-4">
          {['All', 'In Progress', 'Not Started', 'Completed', 'Overdue'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-4 font-medium text-sm transition-colors border-b-2 ${
                filter === tab ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#172033] border-b border-[#253047] text-slate-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Assignment</th>
                <th className="px-6 py-4 font-semibold">Simulation</th>
                <th className="px-6 py-4 font-semibold">Deadline</th>
                <th className="px-6 py-4 font-semibold">Progress</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#253047]">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-[#172033]/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        assignment.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                        assignment.status === 'Overdue' ? 'bg-rose-500/10 text-rose-500' :
                        'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-white group-hover:text-indigo-400 transition-colors">{assignment.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{assignment.simulation}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(assignment.deadline).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-[#253047] rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${assignment.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                          style={{ width: `${assignment.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">{assignment.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold uppercase border ${getStatusColor(assignment.status)}`}>
                      {getStatusIcon(assignment.status)}
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/student/assignments/${assignment.id}`} className="text-indigo-400 font-semibold hover:text-indigo-300 text-sm">
                      {assignment.status === 'Completed' ? 'Review' : 'View Details'}
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredAssignments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No assignments found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
