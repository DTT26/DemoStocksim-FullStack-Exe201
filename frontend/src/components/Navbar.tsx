import React from 'react';
import { Activity, Bell, User, Settings } from 'lucide-react';

export const Navbar = () => {
  return (
    <nav className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Activity className="text-primary w-6 h-6" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          StockSim
        </span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-slate-400">
          <button className="hover:text-white transition-colors"><Bell className="w-5 h-5" /></button>
          <button className="hover:text-white transition-colors"><Settings className="w-5 h-5" /></button>
        </div>
        <div className="h-8 w-px bg-border"></div>
        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
            ST
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200 leading-none">Student 01</span>
            <span className="text-xs text-slate-500 mt-1">100,000,000 VND</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
