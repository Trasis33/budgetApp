import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNavigationBar from '../navigation/BottomNavigationBar';
import FloatingActionButton from '../ui/FloatingActionButton';

const ModernLayout = () => {
  return (
    <div className="app-container no-sidebar">
      {/* Top User Bar */}
      <Navbar />

      <main className="main-content">
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>

      {/* Mobile-only utilities */}
      <FloatingActionButton />
      <BottomNavigationBar />
    </div>
  );
};

export default ModernLayout;