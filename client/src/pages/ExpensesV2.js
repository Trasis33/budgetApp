"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useExpenseModal } from '../context/ExpenseModalContext';
import axios from '../api/axios';
import formatCurrency from '../utils/formatCurrency';
import { Select, Accordion, AccordionPanel, AccordionTitle, AccordionContent } from 'flowbite-react';
import CategoryBoard from '../components/ui/CategoryBoard';
import '../styles/expenses-v2.css';

const ExpensesV2 = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recurringTemplates, setRecurringTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { openAddModal, openEditModal } = useExpenseModal();

  const today = new Date();
  const [filters, setFilters] = useState({ month: '', year: String(today.getFullYear()), category: '' });

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [expRes, catRes, recRes] = await Promise.all([
          axios.get('/expenses'),
          axios.get('/categories'),
          axios.get('/recurring-expenses'),
        ]);
        if (!mounted) return;
        setExpenses(Array.isArray(expRes.data) ? expRes.data : []);
        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        setRecurringTemplates(Array.isArray(recRes.data) ? recRes.data : []);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError('Unable to load expenses.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAll();
    return () => { mounted = false; };
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value }));
  };

  const resetFilters = () => setFilters({ month: '', year: String(today.getFullYear()), category: '' });

  const filteredExpenses = useMemo(() => {
    const filtered = expenses.filter((exp) => {
      if (!exp || !exp.date) return false;
      const d = new Date(exp.date);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear());
      if (filters.month && month !== filters.month) return false;
      if (filters.year && year !== filters.year) return false;
      if (filters.category && String(exp.category_id) !== String(filters.category)) return false;
      return true;
    });
    return filtered;
  }, [expenses, filters]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await axios.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete expense.');
    }
  };

  const handleExpenseSuccess = (savedExpense) => {
    // Refresh expenses list after add/edit
    const fetchExpenses = async () => {
      try {
        const expRes = await axios.get('/expenses');
        setExpenses(Array.isArray(expRes.data) ? expRes.data : []);
      } catch (err) {
        console.error('Failed to refresh expenses', err);
      }
    };
    fetchExpenses();
  };

  const exportCsv = () => {
    const headers = ['date', 'description', 'category', 'amount'];
    const rows = filteredExpenses.map((r) => [
      new Date(r.date).toISOString().slice(0, 10),
      (r.description || '').replace(/\n/g, ' '),
      r.category_name || (categories.find((c) => c.id === r.category_id)?.name || ''),
      String(r.amount || ''),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${filters.year || 'all'}-${filters.month || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateRecurring = async () => {
    const year = filters.year || String(today.getFullYear());
    const month = (filters.month ? String(parseInt(filters.month, 10)) : String(today.getMonth() + 1));
    try {
      await axios.get(`/summary/monthly/${year}/${month}`);
      const expRes = await axios.get('/expenses');
      setExpenses(Array.isArray(expRes.data) ? expRes.data : []);
    } catch (err) {
      console.error(err);
      setError('Could not generate recurring bills right now.');
    }
  };

  if (loading) return <div className="p-4">Loading expenses…</div>;
  if (error) return <div className="p-4 text-danger">{error}</div>;

  return (
    <div className="expenses-v2-container">
{/*       <header className="page-header">
        <div className="container-max-width flex items-center justify-between">
          <div>
            <h1>Expenses</h1>
            <p className="header-subtitle">Hybrid B · Table-first with collapsible Category Boards</p>
          </div>
          <div role="toolbar" aria-label="Top actions" className="flex items-center gap-2">
            <button onClick={exportCsv} className="btn btn-secondary">Export CSV</button>
            <button onClick={() => openAddModal(handleExpenseSuccess)} className="btn btn-primary" data-testid="add-expense-modal-trigger">Add Expense</button>
          </div>
        </div>
      </header> */}

      <main className="main-grid container-max-width">
        <section className="space-y-4">
          {/* Filters toolbar */}
          <div className="toolbar" role="search" aria-label="Filters">
            <label htmlFor="month-filter">Month</label>
            <Select id="month-filter" value={filters.month} onChange={handleFilterChange} name="month" aria-label="Filter by month">
              <option value="">All</option>
              {Array.from({ length: 12 }).map((_, i) => {
                const m = String(i + 1).padStart(2, '0');
                const monthName = new Date(2025, i, 1).toLocaleDateString('en', { month: 'short' });
                return <option key={m} value={m}>{monthName}</option>;
              })}
            </Select>
            
            <label htmlFor="year-filter" className="ml-2">Year</label>
            <Select id="year-filter" value={filters.year} onChange={handleFilterChange} name="year" aria-label="Filter by year">
              {Array.from({ length: 5 }).map((_, i) => {
                const y = String(today.getFullYear() - i);
                return <option key={y} value={y}>{y}</option>;
              })}
            </Select>
            
            <label htmlFor="category-filter" className="ml-2">Category</label>
            <Select id="category-filter" value={filters.category} onChange={handleFilterChange} name="category" aria-label="Filter by category">
              <option value="">All</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>

            <div className="ml-auto">
              <button onClick={resetFilters} className="btn btn-secondary btn-xs">Reset</button>
            </div>
          </div>
          
          <div role="separator" aria-orientation="horizontal" className="h-px bg-neutral-200/70 my-2"></div>

          {/* Summary KPI cards */}
          <div className="kpi-grid">
            <div className="card kpi-card">
              <div className="kpi-label">Total (Aug 2025)</div>
              <div className="kpi-value">{formatCurrency(filteredExpenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0))}</div>
            </div>
            <div className="card kpi-card">
              <div className="kpi-label">Recurring</div>
              <div className="kpi-value">{formatCurrency(recurringTemplates.reduce((s, r) => s + (parseFloat(r.default_amount) || 0), 0))}</div>
            </div>
            <div className="card kpi-card">
              <div className="kpi-label">Transactions</div>
              <div className="kpi-value">{filteredExpenses.length}</div>
            </div>
            <div className="card kpi-card">
              <div className="kpi-label">Avg / day</div>
              <div className="kpi-value">{formatCurrency((filteredExpenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0) / 31).toFixed(2))}</div>
            </div>
          </div>

          {/* Category boards (collapsible) */}
          <details className="card" aria-label="Category Boards">
            <summary>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                <h2 className="summary-title">Category Boards (preview)</h2>
              </div>
              <span className="summary-subtitle">Show category totals and latest items</span>
            </summary>
            <div className="category-boards-content">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {categories
                  .map((c) => {
                    const categoryExpenses = filteredExpenses.filter((e) => String(e.category_id) === String(c.id));
                    const categoryTotal = categoryExpenses.reduce((s, x) => s + (parseFloat(x.amount)||0), 0);
                    return { category: c, expenses: categoryExpenses, total: categoryTotal };
                  })
                  .filter(({ expenses }) => expenses.length > 0)
                  .map(({ category, expenses, total }) => (
                    <CategoryBoard 
                      key={category.id} 
                      category={category} 
                      expenses={expenses} 
                      total={total} 
                    />
                  ))}
              </div>
            </div>
          </details>

          {/* Main table */}
          <div className="card table-card">
            <div className="table-header">
              <h2>Expenses</h2>
              <div className="table-count" aria-live="polite">Showing {filteredExpenses.length}</div>
            </div>
            <div className="table-wrapper overflow-auto max-h-[60vh]">
              <table className="min-w-full text-sm table-sticky">
                <thead>
                  <tr className="text-left text-[12px] text-neutral-600">
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                        No expenses found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((e, index) => (
                      <tr key={e.id || index} className="hover:bg-neutral-50">
                        <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">
                          {new Date(e.date).toLocaleDateString('en-CA')}
                        </td>
                        <td className="px-4 py-2">
                          {e.description}
                          {e.recurring_expense_id && <span className="badge-rec">Recurring</span>}
                        </td>
                        <td className="px-4 py-2">{e.category_name || categories.find((c) => c.id === e.category_id)?.name || '—'}</td>
                        <td className="px-4 py-2 font-semibold">{formatCurrency(e.amount)}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditModal(e, handleExpenseSuccess)} className="btn btn-secondary btn-xs">Edit</button>
                            <button onClick={() => handleDelete(e.id)} className="btn btn-secondary btn-xs">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Right rail */}
        <aside className="right-rail space-y-4">
          <section className="card">
            <Accordion collapseAll>
              <AccordionPanel>
                <AccordionTitle className="flex items-center justify-between w-full">
                  <span>Recurring Templates</span>
                  <button onClick={handleGenerateRecurring} className="btn btn-primary btn-xs ml-2">Generate for month</button>
                </AccordionTitle>
                <AccordionContent>
                  <div className="mt-3 space-y-3">
                    {recurringTemplates.length === 0 ? (
                      <div className="text-sm text-neutral-500">No templates yet.</div>
                    ) : (
                      recurringTemplates.map((r) => (
                        <div key={r.id} className="recurring-item">
                          <div>
                            <div className="item-name">{r.description}</div>
                            <div className="item-category">{categories.find((c) => c.id === r.category_id)?.name || '—'}</div>
                          </div>
                          <div className="text-right">
                            <div className="item-amount">{formatCurrency(r.default_amount)}</div>
                            <div className="item-status">Active</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </AccordionContent>
              </AccordionPanel>
            </Accordion>
          </section>

          <section className="card">
            <h2>Quick Insights</h2>
            <ul className="quick-insights-list">
              <li>Groceries down 12% vs last month</li>
              <li>2 new recurring charges detected</li>
              <li>Transport trending up this week</li>
            </ul>
          </section>
        </aside>
      </main>
    </div>
  );
};

export default ExpensesV2;
