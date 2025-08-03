import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Wallet, PlusCircle, BarChart2, Settings } from 'lucide-react';

const BottomNavigationBar = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(max-width: 768px)').matches : false
  );

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(e.matches);
    // Initial set and subscribe
    setIsMobile(mql.matches);
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
    } else {
      // Safari fallback
      mql.addListener(handler);
    }
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handler);
      } else {
        mql.removeListener(handler);
      }
    };
  }, []);

  if (!isMobile) return null;

  const items = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/expenses', label: 'Expenses', icon: Wallet },
    { to: '/expenses/add', label: 'Add', icon: PlusCircle, isPrimary: true },
    { to: '/budget', label: 'Budget', icon: BarChart2 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className="bn-container"
    >
      {items.map(({ to, label, icon: Icon, isPrimary }) => {
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
    </nav>
  );
};

export default BottomNavigationBar;