import { Users, Shield, BookOpen, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface UserData {
  _id: string;
  name?: string;
  email: string;
  role: string;
  status: string;
}

export const AdminDashboard = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/users`, { credentials: 'include',
          });
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const studentsCount = users.filter(u => u.role === 'student').length;
  const lecturersCount = users.filter(u => u.role === 'lecturer').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-[#787b86] mt-2 text-lg">System overview and user management.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#787b86]">Total Users</p>
              <h3 className="text-2xl font-bold text-white">{loading ? '...' : totalUsers}</h3>
            </div>
          </div>
        </div>
        <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#787b86]">Students</p>
              <h3 className="text-2xl font-bold text-white">{loading ? '...' : studentsCount}</h3>
            </div>
          </div>
        </div>
        <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#787b86]">Lecturers</p>
              <h3 className="text-2xl font-bold text-white">{loading ? '...' : lecturersCount}</h3>
            </div>
          </div>
        </div>
        <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#787b86]">Active Simulations</p>
              <h3 className="text-2xl font-bold text-white">14</h3>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Quick View */}
      <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#2a2e39] flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-white">Recent Users</h2>
          <Link to="/admin/users" className="text-blue-600 font-medium hover:text-blue-700">View All Users →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#131722] border-b border-[#2a2e39] text-[#787b86] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#787b86]">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#787b86]">No users found.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{user.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-[#787b86]">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        user.role === 'student' ? 'bg-blue-50 text-blue-700' :
                        user.role === 'lecturer' ? 'bg-purple-50 text-purple-700' :
                        'bg-[#2a2e39] text-[#d1d4dc]'
                      }`}>
                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                        user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {user.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right"><button className="text-blue-600 hover:underline font-medium">Edit</button></td>
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
