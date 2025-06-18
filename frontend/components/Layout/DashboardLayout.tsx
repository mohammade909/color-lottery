// src/components/layout/DashboardLayout.tsx
import React, { useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-auto">
        <div className="">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;