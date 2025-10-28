import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from '../../api/axios';
import { ANALYTICS_EVENTS, track } from '../../utils/analytics';
import { useExpenseCreateForm } from '../../hooks/useExpenseCreateForm';
import { createExpense } from '../../services/expenses/createExpense';
import { insertExpense } from '../../utils/expensesListUtils';

// ExpenseCreateModal (scaffold)
// Phase 3.1: Skeleton only. No business logic, submission, validation or focus trap yet.
// Will be implemented across tasks T019+.

/**
 * ExpenseCreateModal
 * In-context dialog for creating expenses with optimistic UI, validation, analytics, and optional
 * budget remaining display. (Implements tasks T019-T028, T029, T030, T033, T038)
 */
export function ExpenseCreateModal({ isOpen, onClose, expenses = [], setExpenses = () => {}, categories: externalCategories, monthContext }) {
  const firstFieldRef = useRef(null);
  const form = useExpenseCreateForm();
  const [showDiscard, setShowDiscard] = useState(false);
  const [optimisticIds, setOptimisticIds] = useState([]);
  const [retryData, setRetryData] = useState(null); // holds failed payload
  const [budgetRemaining, setBudgetRemaining] = useState(null);
  const abortRef = useRef(null);
  const [categories, setCategories] = useState(externalCategories || []);
  const [users, setUsers] = useState([]);

  const closeHandler = useCallback(() => {
    if (form.dirty && !showDiscard) {
      setShowDiscard(true);
      track(ANALYTICS_EVENTS.EXPENSE_CREATE_CANCEL_DISCARD, { dirty: true });
      return;
    }
    setShowDiscard(false);
    onClose();
  }, [form.dirty, showDiscard, onClose]);

  useEffect(() => {
    if (isOpen) {
      // Fire open event (T024 will formalize payload)
      track(ANALYTICS_EVENTS.EXPENSE_CREATE_OPEN, { ts: Date.now() });
      // Focus first input once mounted
      requestAnimationFrame(() => {
        firstFieldRef.current?.focus();
      });
      // Lazy load categories/users if not provided yet
      (async () => {
        try {
          if (!externalCategories) {
            const catRes = await axios.get('/categories');
            if (Array.isArray(catRes.data)) setCategories(catRes.data);
          }
          const userRes = await axios.get('/users');
          if (Array.isArray(userRes.data)) setUsers(userRes.data);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[expense-modal] failed to fetch categories/users', err);
        }
      })();
    }
  }, [isOpen, externalCategories]);

  // Budget fetch effect when category changes (T025)
  useEffect(() => {
    if (!isOpen) return;
    if (!form.fields.category_id) return;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 400);
    fetch('/api/summary/monthly/' + new Date().getFullYear() + '/' + (new Date().getMonth() + 1), { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        // naive extraction (future: refine to category-specific)
        setBudgetRemaining(data?.remaining_budget || null);
      })
      .catch(() => {})
      .finally(() => clearTimeout(timeout));
    return () => controller.abort();
  }, [form.fields.category_id, isOpen]);

  if (!isOpen) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="expense-create-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 border border-gray-200" data-testid="expense-create-modal">
        <h2 id="expense-create-title" className="text-lg font-semibold mb-4 text-gray-900">Add Expense</h2>
        <form onSubmit={async (e) => {
          e.preventDefault();
          track(ANALYTICS_EVENTS.EXPENSE_CREATE_SUBMIT_START, {});
          // Run validation first; if errors, abort
          const validation = form.validate();
          if (Object.keys(validation).length) {
            track(ANALYTICS_EVENTS.EXPENSE_CREATE_VALIDATION_ERROR, { fields: Object.keys(validation) });
            return;
          }
          const optimistic = {
            id: `temp-${Date.now()}`,
            date: form.fields.date || new Date().toISOString().slice(0,10),
            amount: form.fields.amount || '0',
            description: form.fields.description,
            category_id: form.fields.category_id,
            paid_by_user_id: form.fields.paid_by_user_id,
            split_type: form.fields.split_type,
            split_ratio_user1: form.fields.split_ratio_user1,
            split_ratio_user2: form.fields.split_ratio_user2,
            category_name: '—',
            paid_by_name: '—'
          };
          setExpenses(prev => insertExpense(prev, optimistic));
          setOptimisticIds(ids => [...ids, optimistic.id]);
          const result = await form.submit(async (fields) => {
            try {
              const created = await createExpense({
                amount: Number(fields.amount),
                category_id: fields.category_id || 0,
                paid_by_user_id: fields.paid_by_user_id || 0,
                description: fields.description || '',
                date: fields.date || undefined,
                split_type: fields.split_type,
                split_ratio_user1: fields.split_ratio_user1 || null,
                split_ratio_user2: fields.split_ratio_user2 || null
              });
              setExpenses(prev => prev.map(e => e.id === optimistic.id ? created : e));
              track(ANALYTICS_EVENTS.EXPENSE_CREATE_SUBMIT_SUCCESS, { id: created.id, latency_ms: created._latencyMs });
            } catch (err) {
              // Rollback optimistic row
              setExpenses(prev => prev.filter(e => e.id !== optimistic.id));
              setRetryData({ optimistic, payload: { ...fields } });
              track(ANALYTICS_EVENTS.EXPENSE_CREATE_SUBMIT_ERROR, { status: err.status });
            }
          });
          if (!result.ok) {
            track(ANALYTICS_EVENTS.EXPENSE_CREATE_VALIDATION_ERROR, { fields: Object.keys(result.errors) });
          }
        }}>
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="amount">Amount</label>
              <input ref={firstFieldRef} id="amount" aria-label="Amount" type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm" value={form.fields.amount} onChange={e=>form.setField('amount', e.target.value)} />
              {form.errors.amount && <span className="text-xs text-red-600" role="alert">{form.errors.amount}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date">Date</label>
              <input id="date" aria-label="Date" type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm" value={form.fields.date} onChange={e=>form.setField('date', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">Category</label>
              <select id="category" aria-label="Category" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm bg-white" value={form.fields.category_id} onChange={e=>form.setField('category_id', e.target.value)}>
                <option value="">Select a category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="payer">Paid By</label>
              <select id="payer" aria-label="Paid By" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm bg-white" value={form.fields.paid_by_user_id} onChange={e=>form.setField('paid_by_user_id', e.target.value)}>
                <option value="">Select user</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">Description</label>
              <textarea id="description" aria-label="Description" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm h-24 resize-none" value={form.fields.description} onChange={e=>form.setField('description', e.target.value)} />
              {form.errors.description && <span className="text-xs text-red-600" role="alert">{form.errors.description}</span>}
              <div className="text-right text-xs text-gray-500 mt-1" aria-live="polite">{Math.max(0, 140 - (form.fields.description?.length || 0))} remaining</div>
            </div>
            <fieldset className="col-span-2 border border-gray-300 rounded-md p-3">
              <legend className="text-sm font-medium text-gray-700">Split</legend>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                <label className="flex items-center gap-1"><input type="radio" name="split_type" value="50/50" checked={form.fields.split_type==='50/50'} onChange={e=>form.setField('split_type', e.target.value)} /> 50/50</label>
                <label className="flex items-center gap-1"><input type="radio" name="split_type" value="custom" checked={form.fields.split_type==='custom'} onChange={e=>form.setField('split_type', e.target.value)} /> Custom</label>
                <input aria-label="User 1 Ratio" type="number" className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="%" disabled={form.fields.split_type!=='custom'} value={form.fields.split_ratio_user1} onChange={e=>form.setField('split_ratio_user1', e.target.value)} />
                <input aria-label="User 2 Ratio" type="number" className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="%" disabled={form.fields.split_type!=='custom'} value={form.fields.split_ratio_user2} onChange={e=>form.setField('split_ratio_user2', e.target.value)} />
                {form.errors.split && <span className="text-xs text-red-600">{form.errors.split}</span>}
              </div>
            </fieldset>
          </div>
          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={closeHandler} className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700">Close</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50" disabled={form.submitting}>Save</button>
            <button type="button" className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50" disabled={form.submitting} onClick={(e)=>{
              e.preventDefault();
              form.submit(async () => {})
                .then(r => { if (!r.ok) return; track(ANALYTICS_EVENTS.EXPENSE_CREATE_SAVE_ADD_ANOTHER, { sequence_count: optimisticIds.length }); form.setField('amount',''); form.setField('description',''); form.setField('date',''); });
            }}>Save & Add Another</button>
            {retryData && (
              <button type="button" className="px-4 py-2 text-sm font-medium rounded-md bg-orange-600 hover:bg-orange-700 text-white" onClick={async ()=>{
                try {
                  const created = await createExpense(retryData.payload);
                  setExpenses(prev => insertExpense(prev, created));
                  setRetryData(null);
                  track(ANALYTICS_EVENTS.EXPENSE_CREATE_SUBMIT_SUCCESS, { id: created.id, latency_ms: created._latencyMs, retry: true });
                } catch (err) {
                  track(ANALYTICS_EVENTS.EXPENSE_CREATE_SUBMIT_ERROR, { status: err.status, retry: true });
                }
              }}>Retry</button>
            )}
          </div>
        </form>
        {budgetRemaining != null && (
          <div className="mt-4 text-xs text-gray-600" data-testid="budget-remaining">Budget remaining: {budgetRemaining}</div>
        )}
        {showDiscard && (
          <div role="alertdialog" aria-modal="true" className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-200 max-w-sm w-full">
              <p className="mb-4">Discard changes?</p>
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200" onClick={()=>setShowDiscard(false)}>Cancel</button>
                <button className="px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white" onClick={()=>{ setShowDiscard(false); onClose(); }}>Discard</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpenseCreateModal;
