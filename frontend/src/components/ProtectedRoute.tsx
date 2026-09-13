import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: ('student' | 'lecturer' | 'admin')[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="h-full w-full flex items-center justify-center bg-[#0b0e14]">Loading...</div>;
  }

  // If not logged in and requires a specific role, redirect to home
  if (!user && allowedRoles) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // If logged in but role is not allowed, redirect to home
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
