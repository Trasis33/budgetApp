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
      <div className="px-4 py-3 topbar">
        <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
          {/* Left Section - Scope Selector */}
          <div className="flex items-center gap-3">
            <div className="segmented" role="tablist" aria-label="Expense scope selector">
              {scopeOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  role="tab"
                  aria-selected={scope === option.key}
                  aria-disabled={option.disabled}
                  aria-label={`View ${option.label.toLowerCase()} expenses`}
                  className={`segmented-button ${
                    scope === option.key
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  } ${option.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                  title={option.disabled ? 'Link a partner account in Settings to enable' : undefined}
                  onClick={() => handleScopeSelect(option)}
                  onKeyDown={(e) => handleScopeKeyDown(e, option)}
                  disabled={option.disabled}
                >
                  <span className="block leading-tight">{option.label}</span>
                  <span className="block text-[11px] text-gray-500">
                    {scopeLoading ? '…' : formatCurrency(option.amount)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Center Section - Page Title */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-semibold text-gray-900 page-title">
              {currentPageTitle}
            </h1>
          </div>

          {/* Right Section - User Profile & Actions */}
          <div className="header-actions">
            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="navbar-user-button flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 px-2 py-1 hover:bg-gray-50 transition-colors"
                id="user-menu"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                aria-label="Open user menu"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {/* User Avatar with proper styling */}
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <span className="leading-none select-none text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden md:block font-medium text-gray-700 truncate max-w-[120px]">
                  {user?.name || 'User'}
                </span>
                <svg
                  className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
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
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                    role="menuitem"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/settings');
                    }}
                  >
                    Settings
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                    role="menuitem"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            {/* <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Open mobile menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button> */}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="space-y-3">
              <div className="text-sm text-gray-500">
                Viewing: <span className="font-medium text-gray-900">{activeScopeMeta?.label || 'Ours'}</span>
              </div>
              <div className="flex space-x-2">
                {scopeOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      scope === option.key
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } ${option.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
