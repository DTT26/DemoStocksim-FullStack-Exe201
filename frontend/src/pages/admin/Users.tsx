import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Edit2, Trash2, UserX, UserCheck } from 'lucide-react';

interface UserData {
  _id: string;
  name?: string;
  email: string;
  role: string;
  status: string;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      let queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (roleFilter) queryParams.append('role', roleFilter);
      
      const response = await fetch(`${apiUrl}/users?${queryParams.toString()}`, { credentials: 'include',
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

  useEffect(() => {
    // Debounce search slightly
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter]);

  const handleStatusChange = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/users/${userId}/status`, { credentials: 'include',
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        fetchUsers(); // Refresh list
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/users/${userId}/role`, { credentials: 'include',
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          },
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok) {
        fetchUsers(); // Refresh list
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
        <p className="text-[#787b86] mt-2 text-lg">View, search, filter and manage all users in the system.</p>
      </div>

      <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-[#2a2e39] bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#787b86]" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-[#2a2e39] rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-[#1e222d]"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-[#1e222d] border border-[#2a2e39] rounded-lg px-3 py-2">
              <Filter className="w-4 h-4 text-[#787b86]" />
              <select
                className="bg-transparent border-none text-sm focus:ring-0 text-[#d1d4dc] outline-none"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="lecturer">Lecturers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#131722] border-b border-[#2a2e39] text-[#787b86] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Name & Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-3 text-[#787b86]">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#787b86]">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#2a2e39] flex items-center justify-center text-[#787b86] font-bold uppercase">
                          {user.name ? user.name.charAt(0) : user.email.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white">{user.name || 'Unknown'}</p>
                          <p className="text-[#787b86] text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-md border outline-none ${
                          user.role === 'admin' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          user.role === 'lecturer' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        <option value="student">Student</option>
                        <option value="lecturer">Lecturer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border inline-flex items-center gap-1.5 ${
                        user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {user.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleStatusChange(user._id, user.status || 'ACTIVE')}
                        className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
                          user.status === 'ACTIVE' ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'
                        }`}
                        title={user.status === 'ACTIVE' ? "Disable User" : "Activate User"}
                      >
                        {user.status === 'ACTIVE' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
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
