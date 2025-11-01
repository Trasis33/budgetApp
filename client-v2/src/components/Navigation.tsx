import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { LayoutDashboard, Receipt, PieChart, DollarSign, BarChart3, FileText, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export function Navigation({ currentView, onNavigate, onLogout }: NavigationProps) {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'add-expense', label: 'Add Expense', icon: Receipt, path: '/add-expense' },
    { id: 'expenses', label: 'Expenses', icon: DollarSign, path: '/expenses' },
    { id: 'budgets', label: 'Budgets', icon: BarChart3, path: '/budgets' },
    { id: 'analytics', label: 'Analytics', icon: PieChart, path: '/analytics' },
    { id: 'split', label: 'Bill Splitting', icon: Users, path: '/split' },
    { id: 'statement', label: 'Statements', icon: FileText, path: '/statement' }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="border-b bg-background">
      <div className="flex items-center h-16 px-6">
        <Link to="/dashboard" className="flex items-center gap-2 mr-8">
          <DollarSign className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">CouplesFlow</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 flex-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={isActive(item.path) ? 'default' : 'ghost'}
                onClick={() => onNavigate(item.id)}
                className="gap-2"
                asChild
              >
                <Link to={item.path}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 ml-auto">
          {user && (
            <span className="text-sm text-gray-600 hidden md:inline">
              {user.name}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>

        <div className="md:hidden flex gap-1 overflow-x-auto ml-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={isActive(item.path) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate(item.id)}
                asChild
              >
                <Link to={item.path}>
                  <Icon className="h-4 w-4" />
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
