import { useState, useEffect, useRef } from 'react';
import { Search, Filter, MoreVertical, UserX, UserCheck, Shield, ChevronLeft, ChevronRight, AlertTriangle, Users, X, ArrowUpDown } from 'lucide-react';

interface UserData {
  _id: string;
  name?: string;
  email: string;
  picture?: string;
  role: string;
  status: string;
  createdAt?: string;
}

// --- Modals ---
const EditRoleModal = ({ user, onClose, onSave }: { user: UserData; onClose: () => void; onSave: (userId: string, newRole: string) => void }) => {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [confirming, setConfirming] = useState(false);

  const handleSave = () => {
    if (selectedRole === user.role) { onClose(); return; }
    if (!confirming) { setConfirming(true); return; }
    onSave(user._id, selectedRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#111827] rounded-2xl border border-[#1e293b] shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[#1e293b] flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Edit User Role</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            {user.picture ? (
              <img src={user.picture} alt="" className="w-12 h-12 rounded-full border border-[#1e293b]" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-lg font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-bold text-white">{user.name || 'Unknown'}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Role</label>
            <select
              value={selectedRole}
              onChange={e => { setSelectedRole(e.target.value); setConfirming(false); }}
              className="w-full bg-[#172033] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {confirming && selectedRole !== user.role && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm">
              ⚠️ Are you sure you want to change this user's role from <strong>{user.role}</strong> to <strong>{selectedRole}</strong>?
            </div>
          )}
        </div>
        <div className="p-6 border-t border-[#1e293b] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-[#172033] border border-[#1e293b] rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-600/20">
            {confirming ? 'Confirm Change' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SuspendModal = ({ user, onClose, onConfirm }: { user: UserData; onClose: () => void; onConfirm: () => void }) => {
  const isActive = user.status === 'ACTIVE' || user.status === 'active';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#111827] rounded-2xl border border-[#1e293b] shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[#1e293b]">
          <h3 className="text-lg font-bold text-white">{isActive ? 'Suspend User?' : 'Activate User?'}</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            {user.picture ? (
              <img src={user.picture} alt="" className="w-12 h-12 rounded-full border border-[#1e293b]" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-lg font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-bold text-white">{user.name || 'Unknown'}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>
          <p className="text-sm text-slate-300">
            {isActive
              ? 'Are you sure you want to suspend this account? The user will lose access to the platform.'
              : 'Are you sure you want to activate this account? The user will regain access to the platform.'}
          </p>
        </div>
        <div className="p-6 border-t border-[#1e293b] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-[#172033] border border-[#1e293b] rounded-lg transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors shadow-lg ${
            isActive ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
          }`}>
            {isActive ? 'Suspend User' : 'Activate User'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---
export const AdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editRoleUser, setEditRoleUser] = useState<UserData | null>(null);
  const [suspendUser, setSuspendUser] = useState<UserData | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      let queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (roleFilter) queryParams.append('role', roleFilter);

      const response = await fetch(`${apiUrl}/users?${queryParams.toString()}`, { credentials: 'include' });
      if (response.ok) {
        setUsers(await response.json());
      } else {
        setError('Unable to load users.');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter]);

  // Close action menu on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleStatusChange = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = (currentStatus === 'ACTIVE' || currentStatus === 'active') ? 'DISABLED' : 'ACTIVE';
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/users/${userId}/status`, {
        credentials: 'include',
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) fetchUsers();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/users/${userId}/role`, {
        credentials: 'include',
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) fetchUsers();
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  // Client-side filtering & sorting
  let filtered = [...users];
  if (statusFilter) {
    filtered = filtered.filter(u => {
      const s = (u.status || 'ACTIVE').toUpperCase();
      if (statusFilter === 'active') return s === 'ACTIVE';
      return s !== 'ACTIVE';
    });
  }
  if (sortBy === 'newest') filtered.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  if (sortBy === 'oldest') filtered.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  if (sortBy === 'nameAZ') filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  if (sortBy === 'nameZA') filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      student: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      lecturer: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      admin: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    return styles[role] || styles.student;
  };

  if (error && !loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 gap-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 opacity-80" />
        <h2 className="text-xl font-bold text-white">Unable to load users</h2>
        <p>{error}</p>
        <button onClick={fetchUsers} className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Try Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
        <p className="text-slate-400 mt-2 text-lg">View, search, filter and manage users in the system.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] shadow-lg">
        <div className="p-4 flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-[#172033] border border-[#1e293b] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#172033] border border-[#1e293b] rounded-lg px-3 py-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="bg-transparent border-none text-sm text-slate-300 outline-none cursor-pointer">
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5 bg-[#172033] border border-[#1e293b] rounded-lg px-3 py-2">
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="bg-transparent border-none text-sm text-slate-300 outline-none cursor-pointer">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5 bg-[#172033] border border-[#1e293b] rounded-lg px-3 py-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-transparent border-none text-sm text-slate-300 outline-none cursor-pointer">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="nameAZ">Name A-Z</option>
                <option value="nameZA">Name Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#172033]/50 border-y border-[#1e293b] text-slate-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-5 py-3.5 font-semibold">User</th>
                <th className="px-5 py-3.5 font-semibold">Email</th>
                <th className="px-5 py-3.5 font-semibold">Role</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Joined Date</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-4"><div className="h-6 bg-[#1e293b] rounded animate-pulse"></div></td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <Users className="w-10 h-10 opacity-20 mb-2" />
                      <p className="font-medium">No users found</p>
                      <p className="text-sm">Try changing your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map(u => {
                  const isUserActive = u.status === 'ACTIVE' || u.status === 'active';
                  return (
                    <tr key={u._id} className="hover:bg-[#172033]/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {u.picture ? (
                            <img src={u.picture} alt="" className="w-9 h-9 rounded-full border border-[#1e293b]" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xs font-bold">
                              {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-white">{u.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider inline-flex items-center gap-1 border ${
                          isUserActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isUserActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {isUserActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs font-medium">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="relative inline-block" ref={openMenuId === u._id ? menuRef : null}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === u._id ? null : u._id)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#172033] rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenuId === u._id && (
                            <div className="absolute right-0 mt-1 w-44 bg-[#172033] rounded-lg shadow-2xl border border-[#1e293b] overflow-hidden z-40">
                              <button
                                onClick={() => { setEditRoleUser(u); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                <Shield className="w-4 h-4 text-blue-400" /> Edit Role
                              </button>
                              <button
                                onClick={() => { setSuspendUser(u); setOpenMenuId(null); }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                                  isUserActive ? 'text-rose-400 hover:bg-rose-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'
                                }`}
                              >
                                {isUserActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                {isUserActive ? 'Suspend User' : 'Activate User'}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="p-4 border-t border-[#1e293b] flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
              <span className="text-slate-600">|</span>
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="bg-[#172033] border border-[#1e293b] text-slate-300 rounded px-2 py-1 text-xs outline-none">
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-[#172033] border border-[#1e293b] rounded-lg disabled:opacity-30 hover:bg-[#1e293b] transition-colors flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)} className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                    page === pageNum ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-[#172033]'
                  }`}>
                    {pageNum}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-[#172033] border border-[#1e293b] rounded-lg disabled:opacity-30 hover:bg-[#1e293b] transition-colors flex items-center gap-1">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {editRoleUser && (
        <EditRoleModal user={editRoleUser} onClose={() => setEditRoleUser(null)} onSave={handleRoleChange} />
      )}
      {suspendUser && (
        <SuspendModal user={suspendUser} onClose={() => setSuspendUser(null)} onConfirm={() => { handleStatusChange(suspendUser._id, suspendUser.status || 'ACTIVE'); setSuspendUser(null); }} />
      )}
    </div>
  );
};
