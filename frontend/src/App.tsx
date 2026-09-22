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
import { LecturerStudentDetail } from './pages/lecturer/LecturerStudentDetail';
import { LecturerPerformance } from './pages/lecturer/LecturerPerformance';
import { LecturerProfile } from './pages/lecturer/LecturerProfile';
import { LecturerSimulationResults } from './pages/lecturer/LecturerSimulationResults';
import { LecturerLayout } from './layouts/LecturerLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/Users';
import { AdminSimulations } from './pages/admin/AdminSimulations';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminProfile } from './pages/admin/AdminProfile';

import { StudentLayout } from './layouts/StudentLayout';
import { StudentJournal } from './pages/student/Journal';
import { StudentTradeDetail } from './pages/student/TradeDetail';
import { StudentProfile } from './pages/student/Profile';
import { StudentSettings } from './pages/student/Settings';

import { LandingPage } from './pages/shared/LandingPage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-[#080C14] text-white">Loading...</div>;
  }

  return (
    <Routes>
      {/* Route for Trading Terminal (Isolated) */}
      <Route path="/trade/:simulationId" element={
        <div className="h-screen w-screen bg-[#131722] overflow-hidden flex flex-col text-[#d1d4dc] transition-colors">
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
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Route>
      </Route>

      {/* Lecturer Routes (Isolated Layout) */}
      <Route element={<ProtectedRoute allowedRoles={['lecturer']} />}>
        <Route element={<LecturerLayout />}>
          <Route path="/lecturer">
            <Route index element={<LecturerDashboard />} />
            <Route path="simulations" element={<LecturerSimulations />} />
            <Route path="simulations/:id/results" element={<LecturerSimulationResults />} />
            <Route path="assignments" element={<LecturerAssignments />} />
            <Route path="students" element={<LecturerStudents />} />
            <Route path="students/:id" element={<LecturerStudentDetail />} />
            <Route path="performance" element={<LecturerPerformance />} />
            <Route path="profile" element={<LecturerProfile />} />
          </Route>
        </Route>
      </Route>

      {/* Admin Routes (Isolated Layout) */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin">
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="simulations" element={<AdminSimulations />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Route>
      </Route>

      {/* App Shell Routes (shared/fallback) */}
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
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

