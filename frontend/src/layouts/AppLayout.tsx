import { Outlet } from 'react-router-dom';
import { AppNavbar } from '../components/AppNavbar';

export const AppLayout = () => {
  return (
    <div className="min-h-screen w-full bg-[#0b0e14] text-white font-sans flex flex-col">
      <AppNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
