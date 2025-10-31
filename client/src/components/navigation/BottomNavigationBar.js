import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Wallet, PlusCircle, BarChart2, PiggyBank } from 'lucide-react';
import { useExpenseModal } from '../../context/ExpenseModalContext';

const BottomNavigationBar = () => {
  const location = useLocation();
  const { openAddModal } = useExpenseModal();
  const [activeItem, setActiveItem] = useState(() => {
    // Determine initial active item based on current path
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/expenses')) return 'expenses';
    if (path.startsWith('/budget')) return 'budget';
    if (path.startsWith('/savings')) return 'savings';
    // if (path.startsWith('/settings')) return 'settings';
    return 'home';
  });

  const items = [
    { to: '/', label: 'Home', icon: Home, id: 'home' },
    { to: '/expenses', label: 'Expenses', icon: Wallet, id: 'expenses' },
    { action: 'add-expense', label: 'Add', icon: PlusCircle, isPrimary: true, id: 'add' },
    { to: '/budget', label: 'Budget', icon: BarChart2, id: 'budget' },
    { to: '/savings', label: 'Savings', icon: PiggyBank, id: 'savings' },
    // { to: '/settings', label: 'Settings', icon: Settings, id: 'settings' },
  ];

  const handleNavClick = (itemId) => {
    setActiveItem(itemId);
  };

  return (
    <nav
      role="navigation"
      aria-label="Primary navigation"
      className="bottom-nav-container"
    >
      <div className="bottom-nav-inner">
        {items.map(({ to, action, label, icon: Icon, isPrimary, id }) => {
          if (action === 'add-expense') {
            // Render as button for modal trigger
            return (
              <button
                key={action}
                onClick={() => {
                  openAddModal();
                  handleNavClick(id);
                }}
                className={`bottom-nav-item ${isPrimary ? 'bottom-nav-primary' : ''}`}
                aria-label={label}
                type="button"
              >
                <span className="bottom-nav-icon-wrap">
                  <Icon className="bottom-nav-icon" aria-hidden="true" />
                </span>
                <span className="bottom-nav-label">{label}</span>
              </button>
            );
          }
          
          const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => handleNavClick(id)}
              className={({ isActive }) =>
                `bottom-nav-item ${(isActive || active) ? 'bottom-nav-active' : ''} ${isPrimary ? 'bottom-nav-primary' : ''}`
              }
              aria-label={label}
            >
              <span className="bottom-nav-icon-wrap">
                <Icon className="bottom-nav-icon" aria-hidden="true" />
              </span>
              <span className="bottom-nav-label">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigationBar;
