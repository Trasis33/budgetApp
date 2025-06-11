import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="ml-2 md:ml-0 text-xl font-semibold text-gray-800">Expense Tracker</h1>
        </div>
        
        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-full"
            id="user-menu"
            aria-expanded="false"
            aria-haspopup="true"
          >
            <span className="sr-only">Open user menu</span>
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:block">{user?.name}</span>
          </button>
          
          {/* Dropdown menu, show/hide based on menu state. */}
          {/* We'll implement the dropdown functionality later */}
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="ml-2 px-3 py-1 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
