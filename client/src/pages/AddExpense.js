import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AddExpense = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = !!id;
  
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    paid_by_user_id: user ? user.id : '',
    split_type: '50/50',
    split_ratio_user1: '50',
    split_ratio_user2: '50',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, usersRes] = await Promise.all([
          apiClient.get('/categories'),
          apiClient.get('/users')
        ]);
        
        setCategories(catRes.data);
        setUsers(usersRes.data);

        if (catRes.data.length > 0 && !isEditing) {
          setFormData(prev => ({ ...prev, category_id: catRes.data[0].id }));
        }
        
        if (user && !isEditing) {
          setFormData(prev => ({ ...prev, paid_by_user_id: user.id }));
        }

      } catch (err) {
        setError('Error loading initial data');
        console.error(err);
      }
    };

    fetchInitialData();
    
    if (isEditing) {
      const fetchExpense = async () => {
        try {
          const res = await apiClient.get(`/expenses/${id}`);
          const expense = res.data;
          setFormData({
            description: expense.description,
            amount: expense.amount,
            date: new Date(expense.date).toISOString().split('T')[0],
            category_id: expense.category_id,
            paid_by_user_id: expense.paid_by_user_id,
            split_type: expense.split_type,
            split_ratio_user1: expense.split_ratio_user1,
            split_ratio_user2: expense.split_ratio_user2,
            notes: expense.notes || ''
          });
        } catch (err) {
          setError('Error loading expense');
          console.error(err);
        }
      };
      fetchExpense();
    }
  }, [id, isEditing, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'split_type') {
      if (value === '50/50') {
        setFormData(prev => ({ ...prev, split_ratio_user1: '50', split_ratio_user2: '50' }));
      } else if (value === 'personal') {
        setFormData(prev => ({ ...prev, split_ratio_user1: '100', split_ratio_user2: '0' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await apiClient.put(`/expenses/${id}`, formData);
      } else {
        await apiClient.post('/expenses', formData);
      }
      navigate('/expenses');
    } catch (err) {
      setError('Error saving expense');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Edit' : 'Add'} Expense</h1>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <input
            type="text"
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
            Amount (SEK)
          </label>
          <input
            type="number"
            name="amount"
            id="amount"
            value={formData.amount}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            step="0.01"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
            Date
          </label>
          <input
            type="date"
            name="date"
            id="date"
            value={formData.date}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category_id">
            Category
          </label>
          <select
            name="category_id"
            id="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Paid By</label>
          <div className="flex space-x-2">
            {users.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paid_by_user_id: u.id }))}
                className={`flex-1 py-2 px-4 rounded ${formData.paid_by_user_id === u.id ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
              >
                {u.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Split</label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, split_type: 'personal', split_ratio_user1: 100, split_ratio_user2: 0 }))}
              className={`py-2 px-4 rounded ${formData.split_type === 'personal' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
            >
              Personal
            </button>
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.split_ratio_user1}
                onChange={(e) => {
                  const user1Ratio = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    split_type: 'custom',
                    split_ratio_user1: user1Ratio,
                    split_ratio_user2: 100 - user1Ratio,
                  }));
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>{users[0]?.name} {formData.split_ratio_user1}%</span>
                <span>{users[1]?.name} {formData.split_ratio_user2}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            id="notes"
            value={formData.notes}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="3"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Expense' : 'Add Expense'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/expenses')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpense;
