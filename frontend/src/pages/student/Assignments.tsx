import { Link } from 'react-router-dom';
import { Calendar, FileText } from 'lucide-react';

export const StudentAssignments = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Assignments</h1>
        <p className="text-[#787b86] mt-2 text-lg">Complete trading exercises assigned by your lecturer.</p>
      </div>

      <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#131722] border-b border-[#2a2e39] text-[#787b86] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Assignment</th>
                <th className="px-6 py-4 font-semibold">Simulation</th>
                <th className="px-6 py-4 font-semibold">Deadline</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]">
              {/* Row 1 */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-white">Technical Analysis: FPT</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#787b86]">Trading Challenge #01</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-[#787b86]">
                    <Calendar className="w-4 h-4 text-[#787b86]" />
                    Sep 15, 2026
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-amber-50 text-amber-600 text-xs px-2.5 py-1 rounded-md font-semibold border border-amber-200">
                    In Progress
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 font-semibold hover:text-blue-700 hover:underline text-sm">
                    View
                  </button>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#2a2e39] text-[#787b86] rounded-lg">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-white">Value Investing Portfolio</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#787b86]">Advanced Trading #02</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-[#787b86]">
                    <Calendar className="w-4 h-4 text-[#787b86]" />
                    Sep 20, 2026
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-[#2a2e39] text-[#787b86] text-xs px-2.5 py-1 rounded-md font-semibold border border-[#2a2e39]">
                    Not Started
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 font-semibold hover:text-blue-700 hover:underline text-sm">
                    View
                  </button>
                </td>
              </tr>
              {/* Row 3 */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-white">Basic Order Types</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#787b86]">Intro to Markets</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-[#787b86]">
                    <Calendar className="w-4 h-4 text-[#787b86]" />
                    Aug 30, 2026
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-md font-semibold border border-emerald-200">
                    Completed
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[#787b86] font-semibold hover:text-[#d1d4dc] hover:underline text-sm">
                    Review
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
