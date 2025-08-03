import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ModernLayout from './components/layout/ModernLayout';

// Route-level code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Expenses = lazy(() => import('./pages/Expenses'));
const AddExpense = lazy(() => import('./pages/AddExpense'));
const Budget = lazy(() => import('./pages/Budget'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));
const MonthlyStatement = lazy(() => import('./pages/MonthlyStatement'));

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

function App() {
  return (
    <Router>
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
            <Route path="expenses/add" element={<AddExpense />} />
            <Route path="budget" element={<Budget />} />
            <Route path="monthly/:year/:month" element={<MonthlyStatement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
