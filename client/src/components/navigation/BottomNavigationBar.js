import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Wallet, PlusCircle, BarChart2, Settings } from 'lucide-react';
import { useExpenseModal } from '../../context/ExpenseModalContext';

const BottomNavigationBar = () => {
  const location = useLocation();
  const { openAddModal } = useExpenseModal();

  const items = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/expenses', label: 'Expenses', icon: Wallet },
    { action: 'add-expense', label: 'Add', icon: PlusCircle, isPrimary: true },
    { to: '/budget', label: 'Budget', icon: BarChart2 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className="bn-container"
    >
      <div className="bn-inner">
        {items.map(({ to, action, label, icon: Icon, isPrimary }) => {
          if (action === 'add-expense') {
            // Render as button for modal trigger
            return (
              <button
                key={action}
                onClick={() => openAddModal()}
                className={['bn-item', isPrimary ? 'bn-primary' : ''].join(' ')}
                aria-label={label}
                type="button"
              >
                <span className="bn-icon-wrap">
                  <Icon className="bn-icon" aria-hidden="true" />
                </span>
                <span className="bn-label">{label}</span>
              </button>
            );
          }
          
          const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'bn-item',
                  (isActive || active) ? 'bn-active' : '',
                  isPrimary ? 'bn-primary' : '',
                ].join(' ')
              }
              aria-label={label}
            >
              <span className="bn-icon-wrap">
                <Icon className="bn-icon" aria-hidden="true" />
              </span>
              <span className="bn-label">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigationBar;