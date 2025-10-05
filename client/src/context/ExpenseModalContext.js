import React, { createContext, useContext, useState, useCallback } from 'react';

const ExpenseModalContext = createContext();

export const useExpenseModal = () => {
  const context = useContext(ExpenseModalContext);
  if (!context) {
    throw new Error('useExpenseModal must be used within ExpenseModalProvider');
  }
  return context;
};

export const ExpenseModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [onSuccessCallback, setOnSuccessCallback] = useState(null);

  const openAddModal = useCallback((onSuccess) => {
    setEditingExpense(null);
    setOnSuccessCallback(() => onSuccess);
    setIsOpen(true);
  }, []);

  const openEditModal = useCallback((expense, onSuccess) => {
    setEditingExpense(expense);
    setOnSuccessCallback(() => onSuccess);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setEditingExpense(null);
    setOnSuccessCallback(null);
  }, []);

  const handleSuccess = useCallback((savedExpense) => {
    if (onSuccessCallback) {
      onSuccessCallback(savedExpense);
    }
    closeModal();
  }, [onSuccessCallback, closeModal]);

  const value = {
    isOpen,
    editingExpense,
    openAddModal,
    openEditModal,
    closeModal,
    handleSuccess,
  };

  return (
    <ExpenseModalContext.Provider value={value}>
      {children}
    </ExpenseModalContext.Provider>
  );
};
