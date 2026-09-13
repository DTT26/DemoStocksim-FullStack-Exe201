import React from 'react';

const LecturerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#2a2e39] flex flex-col">
      <header className="bg-green-700 text-white p-4">
        <h1>StockSim - Lecturer Portal</h1>
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};

export default LecturerLayout;
