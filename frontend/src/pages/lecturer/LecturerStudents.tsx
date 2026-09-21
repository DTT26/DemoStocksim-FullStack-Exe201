import { useState, useEffect } from 'react';
import { Mail, Users, TrendingUp, Search, GraduationCap, ChevronRight, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LecturerStudents = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/users?role=student`, { credentials: 'include' });
        
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => 
    (student.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    (student.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Student Directory</h1>
          <p className="text-slate-400 mt-2 text-lg">View and track all students enrolled in your simulations.</p>
        </div>
        <button className="bg-[#172033] hover:bg-[#253047] text-white border border-[#253047] font-medium py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
          <Download className="w-4 h-4" />
          Export List
        </button>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111827] p-5 rounded-2xl border border-[#253047] shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-12 h-12 text-white" />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1 relative z-10">Total Students</p>
          <h3 className="text-3xl font-bold text-white relative z-10">{loading ? '-' : students.length}</h3>
        </div>

        <div className="bg-[#111827] p-5 rounded-2xl border border-[#253047] shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <GraduationCap className="w-12 h-12 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1 relative z-10">Active Students</p>
          <h3 className="text-3xl font-bold text-emerald-400 relative z-10">
            {loading ? '-' : students.filter(s => s.status === 'active').length}
          </h3>
        </div>

        <div className="bg-[#111827] p-5 rounded-2xl border border-[#253047] shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-12 h-12 text-indigo-500" />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1 relative z-10">Avg Participation Rate</p>
          <h3 className="text-3xl font-bold text-indigo-400 relative z-10">
            {loading ? '-' : '87%'}
          </h3>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#111827] rounded-2xl border border-[#253047] shadow-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#253047] flex justify-between items-center bg-[#172033]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Class Roster
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#111827] border border-[#253047] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-64 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#172033]/50 border-b border-[#253047] text-slate-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Student Profile</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Registered Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#253047]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <p>Loading students directory...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-10 h-10 opacity-20 mb-2" />
                      <p>No students found.</p>
                      {searchQuery && <p className="text-sm">Try adjusting your search criteria.</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr 
                    key={student._id} 
                    className="hover:bg-[#172033] transition-colors group cursor-pointer"
                    onClick={() => navigate(`/lecturer/students/${student._id}`, { state: { student } })}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold shadow-sm">
                          {student.name ? student.name.charAt(0).toUpperCase() : student.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-white group-hover:text-indigo-400 transition-colors block">
                            {student.name || 'Unknown User'}
                          </span>
                          <span className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {student.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                        student.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {student.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                        {student.status || 'inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-slate-300 font-medium">
                        {new Date(student.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1 text-slate-400 group-hover:text-indigo-400 transition-colors font-medium">
                        View Details <ChevronRight className="w-4 h-4" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
