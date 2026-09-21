import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { TradingTerminal } from './features/market/TradingTerminal';

import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentAssignments } from './pages/student/Assignments';
import { StudentAssignmentDetail } from './pages/student/AssignmentDetail';
import { StudentPerformance } from './pages/student/Performance';
import { SimulationsList } from './pages/shared/Simulations';
import { SimulationDetail } from './pages/shared/SimulationDetail';
import { Leaderboard } from './pages/shared/Leaderboard';
import { LecturerDashboard } from './pages/lecturer/LecturerDashboard';
import { LecturerSimulations } from './pages/lecturer/LecturerSimulations';
import { LecturerAssignments } from './pages/lecturer/LecturerAssignments';
import { LecturerStudents } from './pages/lecturer/LecturerStudents';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/Users';

import { StudentLayout } from './layouts/StudentLayout';
import { StudentJournal } from './pages/student/Journal';
import { StudentTradeDetail } from './pages/student/TradeDetail';
import { StudentProfile } from './pages/student/Profile';
import { StudentSettings } from './pages/student/Settings';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-[#0b0e14] text-[#1e2329] dark:text-white transition-colors">Loading...</div>;
  }

  return (
    <Routes>
      {/* Route for Trading Terminal (Isolated) */}
      <Route path="/trade/:simulationId" element={
        <div className="h-screen w-screen bg-white dark:bg-[#131722] overflow-hidden flex flex-col text-[#1e2329] dark:text-slate-200 transition-colors">
          <TradingTerminal />
        </div>
      } />

      {/* Student Routes (Isolated Layout) */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<StudentLayout />}>
          <Route path="/student">
            <Route index element={<StudentDashboard />} />
            <Route path="simulations" element={<SimulationsList />} />
            <Route path="simulations/:id" element={<SimulationDetail />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="assignments/:id" element={<StudentAssignmentDetail />} />
            <Route path="performance" element={<StudentPerformance />} />
            <Route path="journal" element={<StudentJournal />} />
            <Route path="journal/:tradeId" element={<StudentTradeDetail />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="settings" element={<StudentSettings />} />
          </Route>
        </Route>
      </Route>

      {/* App Shell Routes (Admin & Lecturer) */}
      <Route path="/" element={<AppLayout />}>
        {/* Default route based on role */}
        <Route index element={
          !user ? <Navigate to="/trade/fpt" /> :
          user.role === 'admin' ? <Navigate to="/admin" /> : 
          user.role === 'lecturer' ? <Navigate to="/lecturer" /> : 
          <Navigate to="/student" />
        } />

        {/* Shared Routes (require login but any role, legacy paths) */}
        <Route element={<ProtectedRoute />}>
          <Route path="simulations">
            <Route index element={<SimulationsList />} />
            <Route path=":id" element={<SimulationDetail />} />
          </Route>
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>

        {/* Lecturer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['lecturer']} />}>
          <Route path="lecturer">
            <Route index element={<LecturerDashboard />} />
            <Route path="simulations" element={<LecturerSimulations />} />
            <Route path="assignments" element={<LecturerAssignments />} />
            <Route path="students" element={<LecturerStudents />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="admin">
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
