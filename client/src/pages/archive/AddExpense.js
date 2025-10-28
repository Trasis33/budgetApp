/**
 * @deprecated This page has been replaced with AddExpenseModal.js
 * All add/edit expense functionality now uses a modal triggered from various parts of the app.
 * This file is kept for reference only and should be removed in a future cleanup.
 * See: /client/src/components/AddExpenseModal.js
 *      /client/src/context/ExpenseModalContext.js
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AddExpense = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchExpense = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/expenses/${id}`);
      const expense = response.data;
      setFormData({
        amount: expense.amount.toString(),
        description: expense.description || '',
        category_id: expense.category_id.toString(),
        date: new Date(expense.date).toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Error fetching expense:', err);
      setMessage('Failed to load expense');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchExpense();
    }
  }, [isEditMode, fetchExpense]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (isEditMode) {
        await axios.put(`/expenses/${id}`, {
          ...formData,
          amount: parseFloat(formData.amount),
          paid_by_user_id: user?.id || 1
        });
        setMessage('Expense updated successfully!');
        setTimeout(() => navigate('/expenses'), 1500);
      } else {
        await axios.post('/expenses', {
          ...formData,
          amount: parseFloat(formData.amount),
          paid_by_user_id: user?.id || 1
        });
        setMessage('Expense added successfully!');
        setFormData({
          amount: '',
          description: '',
          category_id: '',
          date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} expense:`, err);
      setMessage(`Failed to ${isEditMode ? 'update' : 'add'} expense`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Groceries, Rent, etc."
            />
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category_id"
              id="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              name="date"
              id="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Expense' : 'Add Expense')}
          </button>

          {message && (
            <div className={`p-4 rounded-md ${
              message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
