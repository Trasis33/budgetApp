import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AlertTriangle, CheckCircle, Info, Settings } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Expense, Category } from '../../types';
import { useNavigate } from 'react-router-dom';

interface SpendingRoleData {
  role: 'need' | 'want' | 'save';
  label: string;
  spent: number;
  budgeted: number;
  targetPercent: number;
  actualPercent: number;
  color: string;
}

interface BudgetVsActualWidgetProps {
  expenses: Expense[];
  categories: Category[];
  totalIncome: number;
  fixedExpensesTotal: number;
  /** Target distribution from strategy (e.g., 50/30/20) */
  strategy?: {
    needs: number;
    wants: number;
    saves: number;
  };
}

export function BudgetVsActualWidget({
  expenses,
  categories,
  totalIncome,
  fixedExpensesTotal,
  strategy = { needs: 0.5, wants: 0.3, saves: 0.2 }
}: BudgetVsActualWidgetProps) {
  const navigate = useNavigate();

  // Build a map of category_id -> spending_role
  const categoryRoleMap = useMemo(() => {
    const map = new Map<number, 'need' | 'want' | 'save'>();
    categories.forEach(cat => {
      map.set(cat.id, cat.spending_role || 'need');
    });
    return map;
  }, [categories]);

  // Calculate spending by role
  const spendingByRole = useMemo(() => {
    const totals = { need: 0, want: 0, save: 0 };
    expenses.forEach(exp => {
      const role = categoryRoleMap.get(exp.category_id) || 'need';
      totals[role] += exp.amount || 0;
    });
    return totals;
  }, [expenses, categoryRoleMap]);

  const totalSpent = spendingByRole.need + spendingByRole.want + spendingByRole.save;

  // Calculate role data for display
  const roleData: SpendingRoleData[] = useMemo(() => {
    const roles: Array<{ key: 'need' | 'want' | 'save'; label: string; target: number; color: string }> = [
      { key: 'need', label: 'Needs', target: strategy.needs, color: '#10b981' },
      { key: 'want', label: 'Wants', target: strategy.wants, color: '#f59e0b' },
      { key: 'save', label: 'Saves', target: strategy.saves, color: '#6366f1' },
    ];

    return roles.map(({ key, label, target, color }) => {
      const spent = spendingByRole[key];
      const budgeted = totalIncome * target;
      // Calculate as percentage of INCOME (not total spending) to match SmartBudgetWizard
      const actualPercent = totalIncome > 0 ? (spent / totalIncome) * 100 : 0;
      const targetPercent = target * 100;

      return {
        role: key,
        label,
        spent,
        budgeted,
        targetPercent,
        actualPercent,
        color,
      };
    });
  }, [spendingByRole, totalIncome, strategy]);

  // Determine overall status
  const overallStatus = useMemo(() => {
    const needsData = roleData.find(r => r.role === 'need');
    if (!needsData) return 'success';
    
    const deviation = needsData.actualPercent - needsData.targetPercent;
    if (deviation > 10) return 'danger';
    if (deviation > 0) return 'warning';
    return 'success';
  }, [roleData]);

  const getStatusBadge = () => {
    switch (overallStatus) {
      case 'danger':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            <AlertTriangle className="w-3.5 h-3.5" />
            Over Budget
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5" />
            Slightly Over
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            <CheckCircle className="w-3.5 h-3.5" />
            On Track
          </span>
        );
    }
  };

  const getDeviationText = (data: SpendingRoleData) => {
    const diff = data.actualPercent - data.targetPercent;
    if (Math.abs(diff) < 1) {
      return { text: 'On target', color: 'text-indigo-600' };
    }
    if (diff > 0) {
      return { text: `${Math.abs(diff).toFixed(0)}% over target`, color: 'text-amber-600' };
    }
    return { text: `${Math.abs(diff).toFixed(0)}% under target`, color: 'text-emerald-600' };
  };

  const getRoleStatusBadge = (data: SpendingRoleData) => {
    const diff = data.actualPercent - data.targetPercent;
    if (Math.abs(diff) < 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
          <CheckCircle className="w-3 h-3" />
          Perfect
        </span>
      );
    }
    if (diff > 5) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
          <AlertTriangle className="w-3 h-3" />
          +{diff.toFixed(0)}%
        </span>
      );
    }
    if (diff > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
          +{diff.toFixed(0)}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
        <CheckCircle className="w-3 h-3" />
        On track
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Budget vs Actual</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Role Breakdown */}
        {roleData.map((data) => {
          const deviation = getDeviationText(data);
          return (
            <div key={data.role}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: data.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{data.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {formatCurrency(data.spent)} / {formatCurrency(data.budgeted)}
                  </span>
                  {getRoleStatusBadge(data)}
                </div>
              </div>
              
              {/* Progress bar with target marker */}
              <div className="relative h-3 bg-gray-100 rounded-lg overflow-visible">
                <div 
                  className="h-full rounded-lg transition-all duration-500"
                  style={{ 
                    width: `${Math.min(data.actualPercent, 100)}%`,
                    backgroundColor: data.color 
                  }}
                />
                {/* Target marker */}
                <div 
                  className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-gray-800 rounded-sm z-10"
                  style={{ left: `${data.targetPercent}%` }}
                >
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-gray-800" />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  You're at <span className="font-semibold text-gray-700">{data.actualPercent.toFixed(0)}% {data.label.toLowerCase()}</span> vs <span className="font-semibold text-gray-700">{data.targetPercent.toFixed(0)}% target</span>
                </p>
                <span className={`text-xs font-medium ${deviation.color}`}>
                  {deviation.text}
                </span>
              </div>
            </div>
          );
        })}

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Overall Allocation Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Overall Allocation</span>
            <span className="text-xs text-gray-500">{formatCurrency(totalSpent)} total</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
            {roleData.map((data) => (
              <div 
                key={data.role}
                style={{ 
                  width: `${data.actualPercent}%`,
                  backgroundColor: data.color 
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {roleData.map((data) => (
              <span key={data.role}>{data.actualPercent.toFixed(0)}% {data.label}</span>
            ))}
          </div>
        </div>

        {/* Quick Insight */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Quick Insight</p>
              <p className="text-sm font-semibold text-gray-900">
                Fixed bills are {formatCurrency(fixedExpensesTotal)} this month
              </p>
              {totalIncome > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  This accounts for {((fixedExpensesTotal / totalIncome) * 100).toFixed(0)}% of your total income
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="ghost"
          className="w-full bg-gray-50 hover:bg-gray-100"
          onClick={() => navigate('/budgets')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Adjust Budget Strategy
        </Button>
      </CardContent>
    </Card>
  );
}
