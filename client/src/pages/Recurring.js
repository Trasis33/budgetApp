import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
import formatCurrency from '../utils/formatCurrency';

const Recurring = () => {
    const [recurringExpenses, setRecurringExpenses] = useState([]);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category_id: '',
        paid_by_user_id: '',
        split_type: '50/50',
        user1_id: '',
        user2_id: '',
        user1_ratio: 0.5,
        user2_ratio: 0.5,
    });
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchRecurringExpenses();
        fetchCategories();
        fetchUsers();
    }, []);

    const fetchRecurringExpenses = async () => {
        try {
            const response = await apiClient.get('/recurring-expenses');
            setRecurringExpenses(response.data);
        } catch (error) {
            console.error('Error fetching recurring expenses:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await apiClient.get('/users');
            setUsers(response.data);
            if (response.data.length >= 2) {
                setFormData(prev => ({
                    ...prev,
                    user1_id: response.data[0].id,
                    user2_id: response.data[1].id,
                }));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSplitTypeChange = (e) => {
        const { value } = e.target;
        let user1_ratio = 0.5;
        let user2_ratio = 0.5;

        if (value === 'personal') {
            user1_ratio = 1;
            user2_ratio = 0;
        } else if (value === 'custom') {
            // Will be handled by a separate input for custom ratio
            user1_ratio = 0; // Placeholder, will be updated by custom input
            user2_ratio = 0; // Placeholder, will be updated by custom input
        }

        setFormData(prev => ({
            ...prev,
            split_type: value,
            user1_ratio,
            user2_ratio,
        }));
    };

    const handleRatioChange = (e) => {
        const ratio = parseFloat(e.target.value);
        setFormData(prev => ({
            ...prev,
            user1_ratio: ratio,
            user2_ratio: 1 - ratio,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await apiClient.put(`/recurring-expenses/${editingId}`, formData);
            } else {
                await apiClient.post('/recurring-expenses', formData);
            }
            setFormData({
                description: '',
                amount: '',
                category_id: '',
                paid_by_user_id: '',
                split_type: '50/50',
                user1_id: users[0]?.id || '',
                user2_id: users[1]?.id || '',
                user1_ratio: 0.5,
                user2_ratio: 0.5,
            });
            setEditingId(null);
            fetchRecurringExpenses();
        } catch (error) {
            console.error('Error saving recurring expense:', error);
        }
    };

    const handleEdit = (expense) => {
        setFormData({
            description: expense.description,
            amount: expense.amount,
            category_id: expense.category_id,
            paid_by_user_id: expense.paid_by_user_id,
            split_type: expense.split_type,
            user1_id: expense.user1_id,
            user2_id: expense.user2_id,
            user1_ratio: expense.user1_ratio,
            user2_ratio: expense.user2_ratio,
        });
        setEditingId(expense.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this recurring expense?')) {
            try {
                await apiClient.delete(`/recurring-expenses/${id}`);
                fetchRecurringExpenses();
            } catch (error) {
                console.error('Error deleting recurring expense:', error);
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Recurring Expenses</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Recurring Expense' : 'Add New Recurring Expense'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700">Description</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Amount</label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Category</label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700">Paid By</label>
                        <div className="flex space-x-2 mt-1">
                            {users.map(user => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, paid_by_user_id: user.id }))}
                                    className={`flex-1 p-2 rounded ${formData.paid_by_user_id === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                                >
                                    {user.username}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700">Split Type</label>
                        <div className="flex space-x-2 mt-1">
                            <button
                                type="button"
                                onClick={() => handleSplitTypeChange({ target: { value: '50/50' } })}
                                className={`flex-1 p-2 rounded ${formData.split_type === '50/50' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                50/50
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSplitTypeChange({ target: { value: 'personal' } })}
                                className={`flex-1 p-2 rounded ${formData.split_type === 'personal' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                Personal
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSplitTypeChange({ target: { value: 'custom' } })}
                                className={`flex-1 p-2 rounded ${formData.split_type === 'custom' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                Custom
                            </button>
                        </div>
                    </div>
                    {formData.split_type === 'custom' && (
                        <div>
                            <label className="block text-gray-700">User 1 Ratio ({users.find(u => u.id === formData.user1_id)?.username})</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                name="user1_ratio"
                                value={formData.user1_ratio}
                                onChange={handleRatioChange}
                                className="w-full mt-1"
                            />
                            <p className="text-sm text-gray-600">User 1: {(formData.user1_ratio * 100).toFixed(0)}% - User 2: {((1 - formData.user1_ratio) * 100).toFixed(0)}%</p>
                        </div>
                    )}
                </div>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600">
                    {editingId ? 'Update Recurring Expense' : 'Add Recurring Expense'}
                </button>
                {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setFormData({
                        description: '',
                        amount: '',
                        category_id: '',
                        paid_by_user_id: '',
                        split_type: '50/50',
                        user1_id: users[0]?.id || '',
                        user2_id: users[1]?.id || '',
                        user1_ratio: 0.5,
                        user2_ratio: 0.5,
                    }); }} className="bg-gray-500 text-white p-2 rounded mt-4 ml-2 hover:bg-gray-600">
                        Cancel Edit
                    </button>
                )}
            </form>

            <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-semibold mb-4">Existing Recurring Expenses</h2>
                {recurringExpenses.length === 0 ? (
                    <p>No recurring expenses found.</p>
                ) : (
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Description</th>
                                <th className="py-2 px-4 border-b">Amount</th>
                                <th className="py-2 px-4 border-b">Category</th>
                                <th className="py-2 px-4 border-b">Paid By</th>
                                <th className="py-2 px-4 border-b">Split</th>
                                <th className="py-2 px-4 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recurringExpenses.map(expense => (
                                <tr key={expense.id}>
                                    <td className="py-2 px-4 border-b">{expense.description}</td>
                                    <td className="py-2 px-4 border-b">{formatCurrency(expense.amount)}</td>
                                    <td className="py-2 px-4 border-b">{categories.find(cat => cat.id === expense.category_id)?.name}</td>
                                    <td className="py-2 px-4 border-b">{users.find(user => user.id === expense.paid_by_user_id)?.username}</td>
                                    <td className="py-2 px-4 border-b">
                                        {expense.split_type === '50/50' && '50/50'}
                                        {expense.split_type === 'personal' && 'Personal'}
                                        {expense.split_type === 'custom' && `${(expense.user1_ratio * 100).toFixed(0)}% / ${(expense.user2_ratio * 100).toFixed(0)}%`}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        <button onClick={() => handleEdit(expense)} className="bg-yellow-500 text-white p-1 rounded mr-2 hover:bg-yellow-600">Edit</button>
                                        <button onClick={() => handleDelete(expense.id)} className="bg-red-500 text-white p-1 rounded hover:bg-red-600">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Recurring;