import React from 'react';

const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#131722] flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <h1>StockSim - Student Portal</h1>
        {/* Navigation placeholder */}
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
      <footer className="p-4 text-center text-gray-500">
        StockSim Educational Platform
      </footer>
    </div>
  );
};

export default StudentLayout;
