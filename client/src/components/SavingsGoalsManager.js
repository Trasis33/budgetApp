import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from '../api/axios';
import formatCurrency from '../utils/formatCurrency';
import AddContributionModal from './AddContributionModal';
import { useScope } from '../context/ScopeContext';
import { assignGoalColors, getGoalColorScheme } from '../utils/goalColorPalette';
import { cn } from '../lib/utils';
import { PlusCircle, CalendarDays } from 'lucide-react';

const extractScopedGoals = (payload, scope) => {
  if (!payload || typeof payload !== 'object') {
    return Array.isArray(payload) ? payload : [];
  }
  const scoped = payload.scopes?.[scope];
  if (scoped?.goals) {
    return scoped.goals;
  }
  if (Array.isArray(payload.goals)) {
    return payload.goals;
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  return [];
};

const SavingsGoalsManager = () => {
  const { scope } = useScope();
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
  const goalAccents = useMemo(() => assignGoalColors(goals), [goals]);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/savings/goals', { params: { scope } });
      const scopedGoals = extractScopedGoals(response.data, scope).map((goal, index) => {
        const colorIndex =
          typeof goal.color_index === 'number' && !Number.isNaN(goal.color_index)
            ? goal.color_index
            : index;
        return {
          ...goal,
          target_amount: Number(goal.target_amount ?? 0),
          current_amount: Number(goal.current_amount ?? 0),
          color_index: colorIndex
        };
      });
      setGoals(scopedGoals);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError('Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/savings/goals', {
        ...formData,
        target_amount: parseFloat(formData.target_amount)
      });
      await fetchGoals();
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
      await fetchGoals();
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Failed to delete savings goal');
    }
  };

  const calculateProgress = (goal) => {
    const target = Number(goal.target_amount || 0);
    if (!target) return 0;
    return Math.min((Number(goal.current_amount || 0) / target) * 100, 100);
  };

  const openContribution = (goal) => {
    setSelectedGoal(goal);
    setContribOpen(true);
  };

  const onContributionSuccess = (updatedGoal) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === updatedGoal.id
          ? {
              ...g,
              current_amount: Number(updatedGoal.current_amount ?? g.current_amount ?? 0),
              target_amount: Number(updatedGoal.target_amount ?? g.target_amount ?? 0),
              color_index:
                typeof updatedGoal.color_index === 'number' && !Number.isNaN(updatedGoal.color_index)
                  ? updatedGoal.color_index
                  : g.color_index
            }
          : g
      )
    );
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
          goals.map((goal, index) => {
            const progress = calculateProgress(goal);
            const remaining = Math.max(0, Number(goal.target_amount || 0) - Number(goal.current_amount || 0));
            const accent = goalAccents[goal.id] || getGoalColorScheme(goal.color_index ?? index);

            return (
              <div
                key={goal.id}
                className={cn(
                  'rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md',
                  accent.surface,
                  accent.border
                )}
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className={cn('text-base font-semibold', accent.heading)}>{goal.goal_name}</h4>
                    <p className={cn('text-sm capitalize', accent.body)}>{goal.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openContribution(goal)}
                      className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold', accent.quickButton, 'bg-white')}
                    >
                      <PlusCircle className="h-4 w-4" /> Add
                    </button>
                    <div className={cn('text-right text-sm', accent.body)}>
                      <div className={cn('font-semibold', accent.heading)}>{formatCurrency(goal.target_amount)}</div>
                      {goal.target_date && (
                        <div>{new Date(goal.target_date).toLocaleDateString()}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-rose-500 hover:text-rose-600"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.12em] text-slate-500">
                    <span>Progress</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className={cn('h-2 w-full rounded-full', accent.progressTrack)}>
                    <div
                      className={cn('h-2 rounded-full transition-all duration-300', accent.progressBar)}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {goal.target_date && (
                  <div className={cn('mt-3 inline-flex items-center gap-2 text-xs', accent.body)}>
                    <CalendarDays className="h-4 w-4" />
                    Target: {new Date(goal.target_date).toLocaleDateString()}
                  </div>
                )}

                <div className={cn('mt-3 flex items-center justify-between text-sm', accent.body)}>
                  <span>Saved: {formatCurrency(goal.current_amount)}</span>
                  <span>Remaining: {formatCurrency(remaining)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AddContributionModal
        open={contribOpen}
        onClose={() => setContribOpen(false)}
        goal={selectedGoal ? { id: selectedGoal.id, name: selectedGoal.goal_name, color_index: selectedGoal.color_index } : null}
        onSuccess={(goal) => onContributionSuccess(goal)}
        capAmount={selectedGoal ? Math.max(0, parseFloat(selectedGoal.target_amount) - parseFloat(selectedGoal.current_amount || 0)) : null}
        enforceCap={true}
      />
    </div>
  );
};

export default SavingsGoalsManager;
