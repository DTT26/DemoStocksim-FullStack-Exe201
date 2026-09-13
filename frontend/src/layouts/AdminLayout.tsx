import React from 'react';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <header className="bg-red-800 text-white p-4">
        <h1>StockSim - Admin Portal</h1>
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
