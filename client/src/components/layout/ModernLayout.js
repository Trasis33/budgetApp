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
      </nav>

      <main className="main-content">
        {/* Header */}
        <header className="header">
          <h1 className="header-title">Expense Tracker</h1>
          <div className="header-actions">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span>{user?.name || 'User'}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ModernLayout;