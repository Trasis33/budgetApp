import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { BudgetManager } from './components/BudgetManager';
import { Analytics } from './components/Analytics';
import { BillSplitting } from './components/BillSplitting';
import { MonthlyStatement } from './components/MonthlyStatement';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { mockUsers, mockExpenses, mockBudgets, mockIncome } from './lib/mockData';
import { Expense, Budget } from './types';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { useAuth } from './context/AuthContext';

const MainApp = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView={currentView} onNavigate={setCurrentView} onLogout={logout} />
      <main className="mx-auto max-w-7xl p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard onNavigate={setCurrentView} />} />
          <Route path="/add-expense" element={<ExpenseForm onCancel={() => setCurrentView('dashboard')} />} />
          <Route path="/expenses" element={<ExpenseList onNavigate={setCurrentView} />} />
          <Route path="/budgets" element={<BudgetManager onNavigate={setCurrentView} />} />
          <Route path="/analytics" element={<Analytics onNavigate={setCurrentView} />} />
          <Route path="/split" element={<BillSplitting onNavigate={setCurrentView} />} />
          <Route path="/statement" element={<MonthlyStatement onNavigate={setCurrentView} />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
