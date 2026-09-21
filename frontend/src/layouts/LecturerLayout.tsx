import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LecturerSidebar } from '../components/lecturer/LecturerSidebar';
import { LecturerTopbar } from '../components/lecturer/LecturerTopbar';

export const LecturerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#080C14] text-slate-200 font-sans flex overflow-x-hidden">
      {/* Sidebar */}
      <LecturerSidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full ${
          collapsed ? 'md:ml-[80px]' : 'md:ml-[260px]'
        }`}
      >
        <LecturerTopbar 
          mobileOpen={mobileOpen} 
          setMobileOpen={setMobileOpen} 
        />
        
        <main className="flex-1 w-full max-w-[1500px] mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LecturerLayout;
