import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ModernLayout from './components/layout/ModernLayout';
import { ExpenseModalProvider } from './context/ExpenseModalContext';
import AddExpenseModal from './components/AddExpenseModal';
import { useExpenseModal } from './context/ExpenseModalContext';
import { ScopeProvider } from './context/ScopeContext';

// Route-level code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Expenses = lazy(() => import('./pages/ExpensesV2'));
const Budget = lazy(() => import('./pages/Budget'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));
const MonthlyStatement = lazy(() => import('./pages/MonthlyStatement'));
const Savings = lazy(() => import('./pages/Savings'));

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = require('./context/AuthContext').useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Global modal component that uses the context
const GlobalExpenseModal = () => {
  const { isOpen, editingExpense, closeModal, handleSuccess } = useExpenseModal();
  
  return (
    <AddExpenseModal
      open={isOpen}
      onClose={closeModal}
      expense={editingExpense}
      onSuccess={handleSuccess}
    />
  );
};

function App() {
  return (
    <Router>
      <ExpenseModalProvider>
        <ScopeProvider>
          <Suspense fallback={<div className="p-4">Loading…</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <ModernLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="budget" element={<Budget />} />
                <Route path="savings" element={<Savings />} />
                <Route path="monthly/:year/:month" element={<MonthlyStatement />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <GlobalExpenseModal />
          </Suspense>
        </ScopeProvider>
      </ExpenseModalProvider>
    </Router>
  );
}

export default App;
