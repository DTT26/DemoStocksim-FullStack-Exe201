import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { StudentSidebar } from '../components/student/StudentSidebar';
import { StudentTopbar } from '../components/student/StudentTopbar';

export const StudentLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] dark:bg-[#080C14] text-slate-800 dark:text-slate-200 font-sans flex overflow-x-hidden transition-colors">
      {/* Sidebar */}
      <StudentSidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full min-w-0 ${
          collapsed ? 'md:ml-[80px]' : 'md:ml-[260px]'
        }`}
      >
        <StudentTopbar 
          mobileOpen={mobileOpen} 
          setMobileOpen={setMobileOpen} 
        />
        
        <main className="flex-1 w-full min-w-0 max-w-[1500px] mx-auto p-3.5 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
