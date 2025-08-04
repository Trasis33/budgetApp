import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart3,
  DollarSign,
  CreditCard,
  Calendar,
  Settings,
  LogOut
} from 'lucide-react';

import BottomNavigationBar from '../navigation/BottomNavigationBar';
import FloatingActionButton from '../ui/FloatingActionButton';

const ModernLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3, current: location.pathname === '/' },
    { name: 'Financial', href: '/budget', icon: DollarSign, current: location.pathname === '/budget' },
    { name: 'Expenses', href: '/expenses', icon: CreditCard, current: location.pathname === '/expenses' },
    { name: 'Monthly Statement', href: `/monthly/${new Date().getFullYear()}/${new Date().getMonth() + 1}`, icon: Calendar, current: location.pathname.includes('/monthly') },
    { name: 'Settings', href: '/settings', icon: Settings, current: location.pathname === '/settings' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="logo">Expense Tracker</div>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`nav-item ${item.current ? 'active' : ''}`}
            >
              <Icon className="nav-icon" />
              {item.name}
            </Link>
          );
        })}
        {/* User info and logout at the bottom of sidebar */}
        <div className="mt-auto pt-8">
          <div className="user-info mb-4">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span>{user?.name || 'User'}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary w-full">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        {/* Page Content - Header removed */}
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