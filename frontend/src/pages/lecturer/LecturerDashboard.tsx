import { Users, BookOpen, Activity, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const LecturerDashboard = () => {
  const [stats, setStats] = useState({
    simulations: 0,
    students: 0,
    assignments: 0,
    avgReturn: 0
  });
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const headers = { 'Authorization': `Bearer ${token}` };

        const [simRes, stuRes, assRes] = await Promise.all([
          fetch(`${apiUrl}/simulations`, { headers }),
          fetch(`${apiUrl}/users?role=student`, { headers }),
          fetch(`${apiUrl}/assignments`, { headers })
        ]);

        if (simRes.ok && stuRes.ok && assRes.ok) {
          const sims = await simRes.json();
          const students = await stuRes.json();
          const assignments = await assRes.json();

          // Assuming lecturer only sees their own or all for now
          setStats({
            simulations: sims.length,
            students: students.length,
            assignments: assignments.length,
            avgReturn: 6.8 // Mock avg return for now until portfolio logic is ready
          });
          
          // Get 4 most recent simulations
          setSimulations(sims.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Lecturer Dashboard</h1>
          <p className="text-[#787b86] mt-2 text-lg">Manage simulations, assignments, and student performance.</p>
        </div>
        <Link to="/lecturer/simulations" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm">
          + Create Simulation
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#787b86]">Active Simulations</p>
              <h3 className="text-2xl font-bold text-white">{loading ? '...' : stats.simulations}</h3>
            </div>
          </div>
        </div>
        <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#787b86]">Total Students</p>
              <h3 className="text-2xl font-bold text-white">{loading ? '...' : stats.students}</h3>
            </div>
          </div>
        </div>
        <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#787b86]">Assignments</p>
              <h3 className="text-2xl font-bold text-white">{loading ? '...' : stats.assignments}</h3>
            </div>
          </div>
        </div>
        <div className="bg-[#1e222d] p-6 rounded-2xl border border-[#2a2e39] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#787b86]">Avg Return</p>
              <h3 className="text-2xl font-bold text-emerald-600">+{stats.avgReturn}%</h3>
            </div>
          </div>
        </div>
      </div>

      {/* My Simulations */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">My Simulations</h2>
          <Link to="/lecturer/simulations" className="text-blue-600 hover:text-blue-700 font-medium text-sm">View All →</Link>
        </div>
        
        {loading ? (
          <div className="text-center py-12 text-[#787b86]">Loading simulations...</div>
        ) : simulations.length === 0 ? (
          <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm p-12 text-center text-[#787b86]">
            No simulations found. Click "Create Simulation" to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {simulations.map((sim) => (
              <div key={sim._id} className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  sim.status === 'ACTIVE' ? 'bg-emerald-500' :
                  sim.status === 'ENDED' ? 'bg-slate-400' : 'bg-amber-500'
                }`}></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">{sim.name}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider mt-2 inline-flex items-center gap-1.5 ${
                      sim.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                      sim.status === 'ENDED' ? 'bg-[#2a2e39] text-[#d1d4dc]' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {sim.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                      {sim.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8 bg-[#131722] p-4 rounded-xl border border-[#2a2e39]">
                  <div>
                    <p className="text-xs text-[#787b86] uppercase font-semibold">Initial Balance</p>
                    <p className="text-base font-bold text-white">{(sim.initialBalance / 1000000).toFixed(0)}M</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#787b86] uppercase font-semibold">Start Date</p>
                    <p className="text-base font-bold text-white">{new Date(sim.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#787b86] uppercase font-semibold">End Date</p>
                    <p className="text-base font-bold text-white">{new Date(sim.endDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link to="/lecturer/simulations" className="flex-1 text-center bg-[#1e222d] hover:bg-[#131722] text-[#d1d4dc] border border-[#2a2e39] font-medium py-2 px-4 rounded-lg transition-colors">
                    Manage
                  </Link>
                  <Link to={`/leaderboard?sim=${sim._id}`} className="flex-1 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors">
                    Results
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
