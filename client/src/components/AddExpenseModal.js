import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import formatCurrency from '../utils/formatCurrency';
import { useAuth } from '../context/AuthContext';

const AddExpenseModal = ({ open, onClose, expense = null, onSuccess }) => {
  const { user } = useAuth();
  const isEditMode = !!expense;
  
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('50/50');
  const [splitRatio1, setSplitRatio1] = useState('');
  const [splitRatio2, setSplitRatio2] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    if (!open) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    if (isEditMode && expense) {
      setAmount(String(expense.amount || ''));
      setDate(expense.date ? new Date(expense.date).toISOString().split('T')[0] : today);
      setDescription(expense.description || '');
      setCategoryId(String(expense.category_id || ''));
      setPaidBy(String(expense.paid_by_user_id || user?.id || ''));
      setSplitType(expense.split_type || '50/50');
      setSplitRatio1(expense.split_ratio_user1 ? String(expense.split_ratio_user1) : '');
      setSplitRatio2(expense.split_ratio_user2 ? String(expense.split_ratio_user2) : '');
    } else {
      setAmount('');
      setDate(today);
      setDescription('');
      setCategoryId('');
      setPaidBy(String(user?.id || ''));
      setSplitType('50/50');
      setSplitRatio1('');
      setSplitRatio2('');
    }
    
    setError(null);
    
    // Load categories and users
    const fetchData = async () => {
      try {
        const [catRes, usersRes, recentRes] = await Promise.all([
          axios.get('/categories'),
          axios.get('/auth/users').catch(() => ({ data: [] })),
          axios.get('/expenses/recent').catch(() => ({ data: [] }))
        ]);
        setCategories(catRes.data || []);
        // If no users from API, use current user as fallback
        const usersList = (usersRes.data || []).length > 0 ? usersRes.data : (user ? [user] : []);
        setUsers(usersList);
        setRecent((recentRes.data || []).slice(0, 5));
      } catch (err) {
        console.error('Failed to load data', err);
        // Fallback to current user if fetch fails
        if (user) {
          setUsers([user]);
        }
      }
    };
    fetchData();
  }, [open, expense, isEditMode, user]);

  const quickAdd = (val) => {
    const current = parseFloat(amount || '0') || 0;
    setAmount(String(current + val));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validations
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Amount must be a positive number');
      setSubmitting(false);
      return;
    }

    if (!categoryId) {
      setError('Please select a category');
      setSubmitting(false);
      return;
    }

    if (!paidBy) {
      setError('Please select who paid');
      setSubmitting(false);
      return;
    }

    const chosen = new Date(date);
    if (isNaN(chosen.getTime())) {
      setError('Please enter a valid date');
      setSubmitting(false);
      return;
    }

    // Validate split ratios if custom
    if (splitType === 'custom') {
      const r1 = parseFloat(splitRatio1);
      const r2 = parseFloat(splitRatio2);
      if (isNaN(r1) || isNaN(r2) || r1 < 0 || r2 < 0) {
        setError('Split ratios must be valid numbers');
        setSubmitting(false);
        return;
      }
      if (Math.abs((r1 + r2) - 100) > 0.01) {
        setError('Split ratios must add up to 100%');
        setSubmitting(false);
        return;
      }
    }

    try {
      const payload = {
        amount: numericAmount,
        date,
        description,
        category_id: parseInt(categoryId),
        paid_by_user_id: parseInt(paidBy),
        split_type: splitType,
        split_ratio_user1: splitType === 'custom' ? parseFloat(splitRatio1) : null,
        split_ratio_user2: splitType === 'custom' ? parseFloat(splitRatio2) : null
      };

      let result;
      if (isEditMode) {
        result = await axios.put(`/expenses/${expense.id}`, payload);
      } else {
        result = await axios.post('/expenses', payload);
      }

      onSuccess?.(result.data);
      onClose?.();
    } catch (err) {
      console.error(`${isEditMode ? 'Update' : 'Add'} expense failed`, err);
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} expense`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3xl)' }}>
          <h3 className="section-title" style={{ margin: 0 }}>
            {isEditMode ? 'Edit Expense' : 'Add Expense'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost" aria-label="Close">✖</button>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: 'var(--spacing-2xl)' }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="form-field" style={{ gridColumn: 'span 2' }}>
            <label className="text-sm" style={{ marginBottom: 6 }}>Amount</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input"
              style={{ padding: '10px', border: '1px solid var(--input-border-color)', borderRadius: 8 }}
              required
              autoFocus
            />
            {!isEditMode && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {[100, 500, 1000].map((v) => (
                  <button key={v} type="button" className="btn" onClick={() => quickAdd(v)}>
                    +{formatCurrency(v)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="form-field">
            <label className="text-sm" style={{ marginBottom: 6 }}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
              style={{ padding: '10px', border: '1px solid var(--input-border-color)', borderRadius: 8 }}
              required
            />
          </div>

          <div className="form-field">
            <label className="text-sm" style={{ marginBottom: 6 }}>Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input"
              style={{ padding: '10px', border: '1px solid var(--input-border-color)', borderRadius: 8 }}
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-field" style={{ gridColumn: 'span 2' }}>
            <label className="text-sm" style={{ marginBottom: 6 }}>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Groceries, Dinner, etc."
              className="input"
              style={{ padding: '10px', border: '1px solid var(--input-border-color)', borderRadius: 8 }}
              required
            />
          </div>

          <div className="form-field">
            <label className="text-sm" style={{ marginBottom: 6 }}>Paid By</label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="input"
              style={{ padding: '10px', border: '1px solid var(--input-border-color)', borderRadius: 8 }}
              required
            >
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name || u.email}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="text-sm" style={{ marginBottom: 6 }}>Split Type</label>
            <select
              value={splitType}
              onChange={(e) => {
                setSplitType(e.target.value);
                if (e.target.value === '50/50') {
                  setSplitRatio1('50');
                  setSplitRatio2('50');
                }
              }}
              className="input"
              style={{ padding: '10px', border: '1px solid var(--input-border-color)', borderRadius: 8 }}
            >
              <option value="50/50">50/50</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {splitType === 'custom' && (
            <>
              <div className="form-field">
                <label className="text-sm" style={{ marginBottom: 6 }}>User 1 Ratio (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={splitRatio1}
                  onChange={(e) => setSplitRatio1(e.target.value)}
                  placeholder="50"
                  className="input"
                  style={{ padding: '10px', border: '1px solid var(--input-border-color)', borderRadius: 8 }}
                />
              </div>
              <div className="form-field">
                <label className="text-sm" style={{ marginBottom: 6 }}>User 2 Ratio (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={splitRatio2}
                  onChange={(e) => setSplitRatio2(e.target.value)}
                  placeholder="50"
                  className="input"
                  style={{ padding: '10px', border: '1px solid var(--input-border-color)', borderRadius: 8 }}
                />
              </div>
            </>
          )}

          <div className="form-actions" style={{ gridColumn: 'span 2', marginTop: 'var(--spacing-3xl)' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Saving…' : (isEditMode ? 'Update Expense' : 'Add Expense')}
            </button>
          </div>
        </form>

        {!isEditMode && recent.length > 0 && (
          <div style={{ marginTop: 'var(--spacing-5xl)' }}>
            <div className="text-sm" style={{ color: 'var(--muted)', marginBottom: 8 }}>Recent expenses</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
              {recent.map((exp) => (
                <li key={exp.id} className="glass-effect" style={{ padding: '10px 12px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{exp.description}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {new Date(exp.date).toLocaleDateString()} · {exp.category_name || 'Uncategorized'}
                    </div>
                  </div>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(parseFloat(exp.amount))}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddExpenseModal;
