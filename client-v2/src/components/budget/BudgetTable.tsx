import { BudgetTableProps } from '../../types/budget';
import { Card } from '../ui/card';
import { BudgetTableHeader } from './BudgetTableHeader';
import { BudgetTableRow } from './BudgetTableRow';
import { BudgetStatsFooter } from './BudgetStatsFooter';
import { calculateBudgetStats } from '../../lib/budgetUtils';
import { Target } from 'lucide-react';

export function BudgetTable({
  budgets,
  onEdit,
  onDelete,
  editingId,
  selectedPeriod,
  onPeriodChange,
  onRefresh
}: BudgetTableProps) {
  const stats = calculateBudgetStats(budgets);

  if (budgets.length === 0) {
    return (
      <Card>
        <BudgetTableHeader
          title="Category Budgets"
          selectedPeriod={selectedPeriod}
          onPeriodChange={onPeriodChange}
          onRefresh={onRefresh}
        />
        <div className="px-6 py-12 text-center">
          <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No budgets for this period
          </h3>
          <p className="text-gray-600">
            Start by adding a budget for your most common spending categories.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <BudgetTableHeader
        title="Category Budgets"
        selectedPeriod={selectedPeriod}
        onPeriodChange={onPeriodChange}
        onRefresh={onRefresh}
      />
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Category
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Budget
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Spent
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Remaining
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Progress
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {budgets.map(budget => (
              <BudgetTableRow
                key={budget.id}
                budget={budget}
                onEdit={onEdit}
                onDelete={onDelete}
                isEditing={editingId === budget.id}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      <BudgetStatsFooter stats={stats} />
    </Card>
  );
}
