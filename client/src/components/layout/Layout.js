import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNavigationBar from '../navigation/BottomNavigationBar';
import FloatingActionButton from '../ui/FloatingActionButton';
import useSwipeNavigation from '../../hooks/useSwipeNavigation';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // enable lightweight swipe navigation on mobile
  useSwipeNavigation();

  return (
    // <div className="flex h-screen bg-gray-100">
    <div className="app-container">
      {/* Sidebar for larger screens */}
      {/* <div className="hidden md:block md:w-64 bg-white shadow-md"> */}
      <div className="sidebar">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={toggleSidebar}
          ></div>
          <div className="relative flex flex-col flex-1 w-full max-w-xs bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleSidebar}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* <div className="flex flex-col flex-1 overflow-hidden"> */}
      <div className="main-content">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile-only utilities */}
      <FloatingActionButton />
      <BottomNavigationBar />
    </div>
  );
};

export default Layout;
