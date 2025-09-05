import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import formatCurrency from '../utils/formatCurrency';
import AddContributionModal from './AddContributionModal';

const SavingsGoalsManager = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    goal_name: '',
    target_amount: '',
    target_date: '',
    category: 'general'
  });
  const [contribOpen, setContribOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/savings/goals');
      setGoals(response.data);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError('Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/savings/goals', {
        ...formData,
        target_amount: parseFloat(formData.target_amount)
      });
      setGoals([...goals, response.data]);
      setFormData({
        goal_name: '',
        target_amount: '',
        target_date: '',
        category: 'general'
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding goal:', err);
      setError('Failed to add savings goal');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this savings goal?')) {
      return;
    }
    
    try {
      await axios.delete(`/savings/goals/${goalId}`);
      setGoals(goals.filter(goal => goal.id !== goalId));
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Failed to delete savings goal');
    }
  };

  const calculateProgress = (goal) => {
    if (!goal.target_amount) return 0;
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const openContribution = (goal) => {
    setSelectedGoal(goal);
    setContribOpen(true);
  };

  const onContributionSuccess = (updatedGoal) => {
    setGoals((prev) => prev.map((g) => g.id === updatedGoal.id ? { ...g, current_amount: updatedGoal.current_amount } : g));
  };

  const categoryOptions = [
    { value: 'general', label: 'General' },
    { value: 'emergency', label: 'Emergency Fund' },
    { value: 'vacation', label: 'Vacation' },
    { value: 'house', label: 'House' },
    { value: 'car', label: 'Car' },
    { value: 'education', label: 'Education' },
    { value: 'retirement', label: 'Retirement' }
  ];

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">🎯 Savings Goals</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Goal'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Add Goal Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium mb-4">Add New Savings Goal</h4>
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal Name
              </label>
              <input
                type="text"
                value={formData.goal_name}
                onChange={(e) => setFormData({...formData, goal_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Emergency Fund"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount
                </label>
                <input
                  type="number"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="10000"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Add Goal
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎯</div>
            <p>No savings goals set yet</p>
            <p className="text-sm mt-1">Add your first goal to start tracking progress</p>
          </div>
        ) : (
          goals.map(goal => {
            const progress = calculateProgress(goal);
            const progressColor = getProgressColor(progress);
            
            return (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{goal.goal_name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{goal.category}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openContribution(goal)}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors"
                    >
                      ➕ Add
                    </button>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(goal.target_amount)}</div>
                      {goal.target_date && (
                        <div className="text-sm text-gray-500">
                          {new Date(goal.target_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress: {formatCurrency(goal.current_amount)}</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${progressColor}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>
                    Remaining: {formatCurrency(Math.max(0, goal.target_amount - goal.current_amount))}
                  </span>
                  {goal.target_date && (
                    <span>
                      {new Date(goal.target_date) > new Date() ? (
                        <>
                          {Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24))} days left
                        </>
                      ) : (
                        <span className="text-red-600">Overdue</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <AddContributionModal
        open={contribOpen}
        onClose={() => setContribOpen(false)}
        goal={selectedGoal ? { id: selectedGoal.id, name: selectedGoal.goal_name } : null}
        onSuccess={(goal) => onContributionSuccess(goal)}
        capAmount={selectedGoal ? Math.max(0, parseFloat(selectedGoal.target_amount) - parseFloat(selectedGoal.current_amount || 0)) : null}
        enforceCap={true}
      />
    </div>
  );
};

export default SavingsGoalsManager;
