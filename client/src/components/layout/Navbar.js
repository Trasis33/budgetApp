import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scope, setScope] = useState('Ours');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="header">
      <div className="px-4 py-3 flex items-center justify-between topbar">
        <div className="flex items-center gap-3">
          <div className="avatar" aria-hidden="true"></div>
          <div className="segmented" role="tablist" aria-label="Scope">
            {['Ours','Mine','Partner'].map(label => (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={scope === label}
                onClick={() => setScope(label)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        
        {/* User Profile Dropdown */}
        <div className='header-actions'>
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
      </div>
    </nav>
  );
};

export default Navbar;
