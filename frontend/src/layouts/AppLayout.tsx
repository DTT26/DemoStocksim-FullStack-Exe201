import { Outlet } from 'react-router-dom';
import { AppNavbar } from '../components/AppNavbar';

export const AppLayout = () => {
  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] dark:bg-[#0b0e14] text-[#1e2329] dark:text-white font-sans flex flex-col transition-colors">
      <AppNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
