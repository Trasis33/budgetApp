import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Budget, Expense } from '../types';
import { budgetService } from '../api/services/budgetService';
import { expenseService } from '../api/services/expenseService';
import { useScope } from '@/context/ScopeContext';
import { BudgetHeader } from './budget/BudgetHeader';
import { BudgetMetricCard } from './budget/BudgetMetricCard';
import { BudgetTableHeader } from './budget/BudgetTableHeader';
import { BudgetTableRow } from './budget/BudgetTableRow';
import { BudgetStatsFooter } from './budget/BudgetStatsFooter';
import { Table, TableBody } from './ui/table';
import { useBudgetCalculations } from '../hooks';
import { calculateBudgetMetrics, calculateBudgetStats } from '../lib/budgetUtils';
import styles from '../styles/budget/budget-manager.module.css';
import { formatCurrency } from '../lib/utils';

interface BudgetManagerProps {
  onNavigate?: (view: string) => void;
}

export function BudgetManager({ onNavigate }: BudgetManagerProps) {
  const { currentScope, isLoading: scopeLoading } = useScope();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [editingId, setEditingId] = useState<number | null>(null);

  const now = new Date();
  const budgetsWithSpending = useBudgetCalculations(budgets, expenses);
  const metrics = calculateBudgetMetrics(budgetsWithSpending);
  const stats = calculateBudgetStats(budgetsWithSpending);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [budgetsData, expensesData] = await Promise.all([
        budgetService.getBudgets(now.getMonth() + 1, now.getFullYear()),
        expenseService.getExpenses(currentScope),
      ]);
      setBudgets(budgetsData);
      setExpenses(expensesData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!scopeLoading) {
      loadData();
    }
  }, [currentScope, scopeLoading]);

  const handleEdit = (budget: any) => {
    setEditingId(budget.id);
  };

  const handleDelete = async (budgetId: number) => {
    try {
      await budgetService.deleteBudget(budgetId);
      await loadData();
    } catch (err) {
      console.error('Failed to delete budget:', err);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleBack = () => {
    onNavigate?.('dashboard');
  };

  const handleAdd = () => {
    onNavigate?.('add-budget');
  };

  const handleExport = () => {
    const data = budgetsWithSpending.map((b) => ({
      Category: b.category_name,
      Budget: formatCurrency(b.amount),
      Spent: formatCurrency(b.spent),
      Remaining: formatCurrency(b.remaining),
      Progress: `${b.progress.toFixed(1)}%`,
      Status: b.status,
    }));

    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map((row) => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budgets-${now.getFullYear()}-${now.getMonth() + 1}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Getting your budget data ready...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Failed to load budgets</h3>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.budgetManager}>
      <BudgetHeader
        onBack={handleBack}
        onExport={handleExport}
        onAdd={handleAdd}
        title={`${currentScope === 'ours' ? 'Our' : currentScope === 'mine' ? 'My' : "Partner's"} Budgets`}
        subtitle="Track and manage your category budgets"
      />

      <div className={styles.metricsGrid}>
        <BudgetMetricCard
          label="Total Budget"
          value={formatCurrency(metrics.totalBudget)}
          icon={<Wallet className="w-5 h-5" />}
          iconColor="blue"
        />
        <BudgetMetricCard
          label="Total Spent"
          value={formatCurrency(metrics.totalSpent)}
          icon={<TrendingUp className="w-5 h-5" />}
          iconColor="amber"
        />
        <BudgetMetricCard
          label="Remaining"
          value={formatCurrency(metrics.totalRemaining)}
          icon={<CheckCircle className="w-5 h-5" />}
          iconColor="green"
        />
        <BudgetMetricCard
          label="Progress"
          value={`${metrics.overallProgress.toFixed(1)}%`}
          icon={<AlertCircle className="w-5 h-5" />}
          iconColor={metrics.overallStatus === 'success' ? 'green' : metrics.overallStatus === 'warning' ? 'amber' : 'pink'}
        />
      </div>

      <div className={styles.tableContainer}>
        <BudgetTableHeader
          title="Category Budgets"
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          onRefresh={handleRefresh}
        />

        <Table>
          <TableBody>
            {budgetsWithSpending.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <Wallet className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No budgets yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start by creating your first budget to track your spending.
                  </p>
                  <button
                    onClick={handleAdd}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
                  >
                    Create Budget
                  </button>
                </td>
              </tr>
            ) : (
              budgetsWithSpending.map((budget) => (
                <BudgetTableRow
                  key={budget.id}
                  budget={budget}
                  onEdit={() => handleEdit(budget)}
                  onDelete={handleDelete}
                  isEditing={editingId === budget.id}
                />
              ))
            )}
          </TableBody>
        </Table>

        {budgetsWithSpending.length > 0 && (
          <BudgetStatsFooter stats={stats} />
        )}
      </div>
    </div>
  );
}
