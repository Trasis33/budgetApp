import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useScope } from '../../context/ScopeContext';
import formatCurrency from '../../utils/formatCurrency';

// Utility function to get current page title based on pathname
const getPageTitle = (pathname) => {
  const pathSegments = pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0 || pathSegments[0] === 'dashboard') {
    return 'Dashboard';
  }

  switch (pathSegments[0]) {
    case 'expenses':
      return 'Expenses';
    case 'budget':
      return 'Budget';
    case 'savings':
      return 'Savings';
    case 'monthly':
      return 'Monthly Statement';
    case 'settings':
      return 'Settings';
    default:
      return 'Dashboard';
  }
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { scope, setScope: setActiveScope, totals, isPartnerConnected, loading: scopeLoading } = useScope();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get current page title based on location
  const currentPageTitle = useMemo(() => getPageTitle(location.pathname), [location.pathname]);

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handle keyboard navigation for dropdown
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  // Handle scope selector keyboard navigation
  const scopeOptions = useMemo(() => ([
    { key: 'ours', label: 'Ours', amount: totals?.ours || 0, disabled: false },
    { key: 'mine', label: 'Mine', amount: totals?.mine || 0, disabled: false },
    { key: 'partner', label: 'Partner', amount: totals?.partner || 0, disabled: !isPartnerConnected }
  ]), [totals, isPartnerConnected]);

  const activeScopeMeta = useMemo(() => {
    return scopeOptions.find((option) => option.key === scope) || scopeOptions[0];
  }, [scope, scopeOptions]);

  const handleScopeSelect = (option) => {
    if (option.disabled) {
      return;
    }
    setActiveScope(option.key);
  };

  const handleScopeKeyDown = (event, option) => {
    if ((event.key === 'Enter' || event.key === ' ') && !option.disabled) {
      event.preventDefault();
      setActiveScope(option.key);
    }
  };

  return (
    <nav
      className="header"
      role="navigation"
      aria-label="Main navigation"
      onKeyDown={handleKeyDown}
    >
      <div className="topbar">
        <div className="navbar-container">
          {/* Left Section - Scope Selector */}
          <div className="navbar-section">
            <div className="scope-selector" role="tablist" aria-label="Expense scope selector">
              {scopeOptions.map((option) => {
                const isActive = scope === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-disabled={option.disabled}
                    aria-label={`View ${option.label.toLowerCase()} expenses`}
                    className={`scope-button ${isActive ? 'scope-button-active' : 'scope-button-inactive'} ${
                      option.disabled ? 'scope-button-disabled' : ''
                    }`}
                    title={option.disabled ? 'Link a partner account in Settings to enable' : undefined}
                    onClick={() => handleScopeSelect(option)}
                    onKeyDown={(e) => handleScopeKeyDown(e, option)}
                    disabled={option.disabled}
                  >
                    <span className="scope-label">{option.label}</span>
                    <span className="scope-amount">
                      {scopeLoading ? '…' : formatCurrency(option.amount)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center Section - Page Title */}
          <div className="navbar-section navbar-section-center">
            <h1 className="page-title">
              {currentPageTitle}
            </h1>
          </div>

          {/* Right Section - User Profile & Actions */}
          <div className="navbar-section navbar-section-right">
            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="user-menu-button"
                id="user-menu"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                aria-label="Open user menu"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {/* User Avatar */}
                <div className="user-avatar">
                  <div className="avatar-gradient">
                    <span className="avatar-initial">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <span className="user-name hidden md:block">
                  {user?.name || 'User'}
                </span>
                <svg
                  className={`chevron ${isDropdownOpen ? 'chevron-open' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  className="dropdown-menu"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user?.name}</p>
                    <p className="dropdown-email">{user?.email}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item"
                    role="menuitem"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/settings');
                    }}
                  >
                    <svg className="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                  <button
                    className="dropdown-item dropdown-item-danger"
                    role="menuitem"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                  >
                    <svg className="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Scope Selector */}
        {isMobileMenuOpen && (
          <div className="mobile-scope-menu">
            <div className="mobile-scope-content">
              <p className="mobile-scope-label">
                Viewing: <span className="mobile-scope-value">{activeScopeMeta?.label || 'Ours'}</span>
              </p>
              <div className="mobile-scope-buttons">
                {scopeOptions.map((option) => {
                  const isActive = scope === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      className={`mobile-scope-button ${isActive ? 'mobile-scope-button-active' : 'mobile-scope-button-inactive'} ${
                        option.disabled ? 'mobile-scope-button-disabled' : ''
                      }`}
                      onClick={() => {
                        if (option.disabled) {
                          return;
                        }
                        handleScopeSelect(option);
                        setIsMobileMenuOpen(false);
                      }}
                      disabled={option.disabled}
                      title={option.disabled ? 'Link a partner account in Settings to enable' : undefined}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
