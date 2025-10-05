import React, { useEffect, useMemo, useState } from 'react';
import axios from '../api/axios';
import formatCurrency from '../utils/formatCurrency';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MonthYearNavigator } from '../components/ui/month-year-navigator';
import { useExpenseModal } from '../context/ExpenseModalContext';

/**
 * Expenses page — rewritten for clarity and accessibility.
 * Features:
 * - Fetch expenses and categories
 * - Filter by month/year and category
 * - Show total and per-category summary
 * - Export visible rows to CSV
 * - Edit / Delete actions
 */
const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recurringTemplates, setRecurringTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRecurring, setShowRecurring] = useState(true);
  const { openAddModal, openEditModal } = useExpenseModal();

  const today = new Date();
  const [filters, setFilters] = useState({
    month: '', // '01'..'12' or '' for all
    year: String(today.getFullYear()),
    category: '',
  });

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
        console.error('Failed to fetch expenses or categories', err);
        if (!mounted) return;
        setError('Unable to load expenses. Try again later.');
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
    return expenses.filter((exp) => {
      if (!exp || !exp.date) return false;
      const d = new Date(exp.date);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear());
      if (filters.month && month !== filters.month) return false;
      if (filters.year && year !== filters.year) return false;
      if (filters.category && String(exp.category_id) !== String(filters.category)) return false;
      return true;
    });
  }, [expenses, filters]);

  // Totals previously used for the removed stats section are no longer needed.

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await axios.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete expense', err);
      setError('Failed to delete expense. Please try again.');
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

  // Trigger recurring generation for the selected month/year (reuses summary endpoint)
  const handleGenerateRecurring = async () => {
    const today = new Date();
    const year = filters.year || String(today.getFullYear());
    const month = (filters.month ? String(parseInt(filters.month, 10)) : String(today.getMonth() + 1));
    try {
      // This endpoint generates recurring expenses before returning summary
      await axios.get(`/summary/monthly/${year}/${month}`);
      // Refresh list after generation
      const expRes = await axios.get('/expenses');
      setExpenses(Array.isArray(expRes.data) ? expRes.data : []);
    } catch (err) {
      console.error('Failed to generate recurring expenses', err);
      setError('Could not generate recurring bills right now.');
    }
  };

  if (loading) return <div className="p-4">Loading expenses…</div>;
  if (error) return <div className="p-4 text-danger">{error}</div>;

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Expenses</h2>
        <div className="dashboard-header-right">
          <div className="dashboard-actions" role="toolbar" aria-label="Expenses actions">
            <button type="button" className="btn btn-primary" onClick={() => openAddModal(handleExpenseSuccess)}>Add Expense</button>
            <button type="button" className="btn btn-secondary" onClick={exportCsv} aria-label="Export filtered expenses">Export CSV</button>
          </div>
        </div>
      </div>

      {/* Filters — tightened paddings/margins and constrained layout */}
      <Card className="hover-lift filters-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <CardHeader style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 'var(--spacing-sm)', paddingTop: 'var(--spacing-lg)' }}>
          <CardTitle className="section-title">Filters</CardTitle>
          <div style={{ minWidth: 220 }}>
            <MonthYearNavigator
              month={filters.month ? parseInt(filters.month, 10) : undefined}
              year={filters.year ? parseInt(filters.year, 10) : undefined}
              onMonthChange={(m) => setFilters((f) => ({ ...f, month: m ? String(m).padStart(2, '0') : '' }))}
              onYearChange={(y) => setFilters((f) => ({ ...f, year: y ? String(y) : '' }))}
            />
          </div>
        </CardHeader>
        <CardContent style={{ paddingTop: 0 }}>
          <form onSubmit={(e) => e.preventDefault()} role="search" aria-label="Filter expenses">
            <fieldset className="filters-grid" style={{ border: 'none', padding: 0, paddingBottom: 'var(--spacing-lg)', margin: 0 }}>
              <legend className="sr-only">Filter expenses</legend>
              <div className="form-field">
                <select id="filter-category" name="category" value={filters.category} onChange={handleFilterChange} className="form-select">
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-field" aria-live="polite">
                <div className="form-label">Timeframe</div>
                <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                  {filters.month ? `Month ${parseInt(filters.month, 10)}` : 'All months'} · {filters.year || today.getFullYear()}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={resetFilters}>Reset</button>
              </div>
            </fieldset>
          </form>
        </CardContent>
      </Card>

      {/* Recurring bills management inline (replaces removed stats section) */}
      <Card className="hover-lift recurring-bills-card" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <CardHeader style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <CardTitle className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span role="img" aria-label="recurring">🔄</span>
            Recurring Bills
            <Badge variant="neutral" style={{ marginLeft: 8 }}>{recurringTemplates.length}</Badge>
          </CardTitle>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowRecurring((s) => !s)}>
              {showRecurring ? 'Hide' : 'Show'}
            </button>
            <button type="button" className="btn btn-primary" onClick={handleGenerateRecurring} aria-label="Generate recurring bills for selected month">
              Generate for month
            </button>
          </div>
        </CardHeader>
        {showRecurring && (
          <CardContent>
            {recurringTemplates.length === 0 ? (
              <div className="text-muted">No templates yet. Use Add Expense or Settings to create recurring templates.</div>
            ) : (
              <div className="table-container">
                <table className="data-table" role="table" aria-label="Recurring bill templates">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell" scope="col">Description</th>
                      <th className="table-header-cell" scope="col">Default amount</th>
                      <th className="table-header-cell" scope="col">Category</th>
                      <th className="table-header-cell" scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {recurringTemplates.map((t) => (
                      <tr key={t.id} className="table-row">
                        <td className="table-cell">{t.description}</td>
                        <td className="table-cell">{formatCurrency(t.default_amount)}</td>
                        <td className="table-cell">{categories.find((c) => c.id === t.category_id)?.name || '—'}</td>
                        <td className="table-cell">{t.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
      </Card>

  <Card className="table-card expenses-card">
        <CardHeader>
          <CardTitle className="section-title">Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-container">
            {filteredExpenses.length === 0 ? (
              <div className="p-4 text-muted">No expenses found for the selected filters.</div>
            ) : (
              <table className="data-table" role="table" aria-label="Expenses list">
                <caption className="sr-only">Filtered expenses</caption>
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell" scope="col">Date</th>
                    <th className="table-header-cell" scope="col">Description</th>
                    <th className="table-header-cell" scope="col">Category</th>
                    <th className="table-header-cell" scope="col">Amount</th>
                    <th className="table-header-cell" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredExpenses.map((e) => (
                    <tr key={e.id} className="table-row">
                      <td className="table-cell">{new Date(e.date).toLocaleDateString()}</td>
                      <td className="table-cell">
                        <div className="table-cell-primary">{e.description}</div>
                        {e.recurring_expense_id && <Badge variant="success" style={{ marginLeft: 'var(--spacing-sm)' }}>Recurring</Badge>}
                      </td>
                      <td className="table-cell">{e.category_name || categories.find((c) => c.id === e.category_id)?.name || '—'}</td>
                      <td className="table-cell table-cell-primary">{formatCurrency(e.amount)}</td>
                      <td className="table-cell">
                        <button type="button" className="btn btn-ghost" style={{ marginRight: 'var(--spacing-sm)' }} onClick={() => openEditModal(e, handleExpenseSuccess)}>Edit</button>
                        <button type="button" className="btn btn-secondary" onClick={() => handleDelete(e.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;
