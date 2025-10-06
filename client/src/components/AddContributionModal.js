import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import formatCurrency from '../utils/formatCurrency';

const AddContributionModal = ({ open, onClose, goal, onSuccess, capAmount = null, enforceCap = true }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [recent, setRecent] = useState([]);
  const [capped, setCapped] = useState(false);

  useEffect(() => {
    if (!open || !goal) return;
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setAmount('');
    setNote('');
    setError(null);
    // Load recent contributions for context
    axios.get(`/savings/goals/${goal.id}/contributions`).then((res) => {
      setRecent(res.data.slice(0, 5));
    }).catch(() => setRecent([]));
  }, [open, goal]);

  const applyCap = (val) => {
    if (capAmount == null || !enforceCap) return { value: val, wasCapped: false };
    if (val > capAmount) return { value: capAmount, wasCapped: true };
    return { value: val, wasCapped: false };
  };

  const setAmountCapped = (val) => {
    const numeric = parseFloat(val || '0') || 0;
    const { value, wasCapped } = applyCap(numeric);
    setCapped(wasCapped);
    setAmount(String(value));
  };

  const quickAdd = (val) => {
    const current = parseFloat(amount || '0') || 0;
    setAmountCapped(current + val);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!goal) return;
    setSubmitting(true);
    setError(null);
    // Validations
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Amount must be a positive number');
      setSubmitting(false);
      return;
    }
    const today = new Date();
    const chosen = new Date(date);
    if (isNaN(chosen.getTime()) || chosen > today) {
      setError('Date must be today or earlier');
      setSubmitting(false);
      return;
    }

    try {
      const payload = { amount: numericAmount, date, note };
      const res = await axios.post(`/savings/goals/${goal.id}/contributions`, payload);
      onSuccess?.(res.data.goal, res.data.contribution);
      onClose?.();
    } catch (err) {
      console.error('Add contribution failed', err);
      setError('Failed to add contribution');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !goal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3xl)' }}>
          <h3 className="section-title" style={{ margin: 0 }}>Add to {goal.name || goal.goal_name}</h3>
          <button onClick={onClose} className="btn btn-ghost">✖</button>
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
              onChange={(e) => setAmountCapped(e.target.value)}
              placeholder="0.00"
              className="input"
              style={{ padding: '10px', border: '1px solid var(--input-border-color)', borderRadius: 8 }}
              required
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {[100, 500, 1000].map((v) => (
                <button key={v} type="button" className="btn" onClick={() => quickAdd(v)}>+{formatCurrency(v)}</button>
              ))}
            </div>
            {capAmount != null && (
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>
                Max allowed: {formatCurrency(capAmount)} {capped ? '(capped)' : ''}
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
            <label className="text-sm" style={{ marginBottom: 6 }}>Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Transfer from paycheck"
              className="input"
              style={{ padding: '10px', border: '1px solid var(--input-border-color)', borderRadius: 8 }}
            />
          </div>

          <div className="form-actions" style={{ gridColumn: 'span 2', marginTop: 'var(--spacing-3xl)' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Saving…' : 'Add Contribution'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 'var(--spacing-5xl)' }}>
          <div className="text-sm" style={{ color: 'var(--muted)', marginBottom: 8 }}>Recent contributions</div>
          {recent.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>No contributions yet</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
              {recent.map((c) => (
                <li key={c.id} className="glass-effect" style={{ padding: '10px 12px', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{new Date(c.date).toLocaleDateString()}</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(parseFloat(c.amount))}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddContributionModal;
