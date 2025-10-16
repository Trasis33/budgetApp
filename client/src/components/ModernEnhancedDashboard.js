import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import formatCurrency from '../utils/formatCurrency';
import { useScope } from '../context/ScopeContext';
import { cn } from '../lib/utils';
import KPISummaryCard from './dashboard/cards/KPISummaryCard';
import SpendingTrendsCard from './dashboard/cards/SpendingTrendsCard';
import SavingsRateCard from './dashboard/cards/SavingsRateCard';
import BudgetPerformanceCard from './dashboard/cards/BudgetPerformanceCard';
import SettlementCard from './dashboard/cards/SettlementCard';
import SharedGoalsCard from './dashboard/cards/SharedGoalsCard';
import AnalyticsDeepDiveModal from './dashboard/modals/AnalyticsDeepDiveModal';

const getDateRange = (monthsBack = 6) => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - monthsBack);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

const LoadingChecklist = () => {
  const steps = [
    'Syncing shared accounts',
    'Analyzing spending patterns',
    'Surfacing opportunities',
    'Preparing shared insights'
  ];
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 rounded-3xl border border-white/60 bg-white/60 p-8 shadow-lg backdrop-blur-xl">
      <div className="flex items-center gap-3 text-indigo-600">
        <Sparkles className="h-6 w-6" />
        <h2 className="text-lg font-semibold text-slate-900">Preparing our financial check-up…</h2>
      </div>
      <ul className="space-y-3 text-sm text-slate-600">
        {steps.map((step, index) => (
          <li key={step} className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-xs font-semibold text-indigo-500">
              {index + 1}
            </span>
            <span className="animate-pulse">{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ModernEnhancedDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { scope, setScope, couple, isPartnerConnected } = useScope();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      const { start, end } = getDateRange(6);
      try {
        const trendsPromise = axios.get(`/analytics/trends/${start}/${end}`, {
          params: { scope }
        });
        const incomeExpensesPromise = axios.get(`/analytics/income-expenses/${start}/${end}`, {
          params: { scope }
        });
        const savingsPromise = axios
          .get(`/analytics/savings-analysis/${start}/${end}`, { params: { scope } })
          .catch(() => ({ data: null }));
        const optimizationAnalysisPromise = axios
          .get('/optimization/analyze', { params: { scope } })
          .catch(() => ({ data: null }));
        const settlementPromise = axios
          .get('/analytics/current-settlement', { params: { scope } })
          .catch(() => ({ data: null }));
        const goalsPromise = axios
          .get('/savings/goals', { params: { scope } })
          .catch(() => ({ data: [] }));

        const [
          trendsRes,
          incomeExpensesRes,
          savingsRes,
          optimizationAnalysisRes,
          settlementRes,
          goalsRes
        ] = await Promise.all([
          trendsPromise,
          incomeExpensesPromise,
          savingsPromise,
          optimizationAnalysisPromise,
          settlementPromise,
          goalsPromise
        ]);

        if (!isMounted) {
          return;
        }

        setDashboardData({
          analytics: {
            trends: trendsRes.data,
            incomeExpenses: incomeExpensesRes.data,
            settlement: settlementRes.data
          },
          savings: savingsRes.data,
          optimization: {
            analysis: optimizationAnalysisRes.data
          },
          goals: Array.isArray(goalsRes.data) ? goalsRes.data : []
        });
      } catch (err) {
        console.error('Error fetching dashboard data', err);
        if (isMounted) {
          setError('We couldn’t load the latest insights. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, [scope, refreshKey]);

  const scopedMonthlyTotals = useMemo(() => {
    const trends = dashboardData?.analytics?.trends;
    if (!trends) return [];
    const scoped = trends.scopes?.[scope];
    if (scoped?.monthlyTotals) return scoped.monthlyTotals;
    if (Array.isArray(scoped)) return scoped;
    return trends.monthlyTotals || [];
  }, [dashboardData, scope]);

  const savingsData = useMemo(() => {
    const base = dashboardData?.savings;
    if (!base) return null;
    const scoped = base.scopes?.[scope];
    if (scoped) return scoped;
    return base;
  }, [dashboardData, scope]);

  const incomeVsExpenses = useMemo(() => {
    const incomeData = dashboardData?.analytics?.incomeExpenses?.monthlyData || [];
    const scoped = dashboardData?.analytics?.incomeExpenses?.scopes?.[scope];
    const rows = scoped?.monthlyData || incomeData;
    const latest = rows[rows.length - 1] || {};
    const income = latest.total_income ?? latest.income ?? 0;
    const expenses = latest.total_expenses ?? latest.expenses ?? 0;
    return { income, expenses };
  }, [dashboardData, scope]);

  const settlementData = useMemo(() => {
    const base = dashboardData?.analytics?.settlement;
    if (!base) {
      return null;
    }
    const scoped = base.scopes?.[scope];
    if (scoped) {
      return {
        ...scoped,
        requestedScope: base.requestedScope ?? scope
      };
    }
    return base;
  }, [dashboardData, scope]);

  const budgetInsight = useMemo(() => {
    const variances = dashboardData?.optimization?.analysis?.budgetVariances
      || dashboardData?.optimization?.analysis?.budget_variances
      || [];
    if (!variances.length) return null;
    const sorted = [...variances].sort(
      (a, b) => Math.abs((b.variance ?? 0)) - Math.abs((a.variance ?? 0))
    );
    const pick = sorted[0];
    return {
      category: pick.name || pick.category || 'Budget focus',
      budgetAmount: pick.budgetAmount ?? pick.budget_amount ?? 0,
      actualAmount: pick.actualAmount ?? pick.actual_amount ?? pick.actual ?? 0,
      variance: pick.variance ?? 0
    };
  }, [dashboardData]);

  const sharedGoal = useMemo(() => {
    if (!Array.isArray(dashboardData?.goals) || dashboardData.goals.length === 0) {
      return null;
    }
    return dashboardData.goals[0];
  }, [dashboardData]);

  const scopeOptions = useMemo(() => {
    const partnerLabel = couple?.partner?.name
      ? `${couple.partner.name.split(' ')[0]}'s view`
      : "Partner's view";
    return [
      { value: 'ours', label: 'Ours', description: 'See everything together', disabled: false },
      { value: 'mine', label: 'Mine', description: 'Focus on my activity', disabled: false },
      {
        value: 'partner',
        label: partnerLabel,
        description: isPartnerConnected ? 'Spot partner trends' : 'Link partner to enable',
        disabled: !isPartnerConnected
      }
    ];
  }, [couple, isPartnerConnected]);

  if (loading && !dashboardData) {
    return (
      <div className="px-4 py-12">
        <LoadingChecklist />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-12">
        <div className="mx-auto max-w-xl rounded-3xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-rose-600">We hit a snag</h2>
          <p className="mt-2 text-sm text-rose-600">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoading(true);
              setRefreshKey((key) => key + 1);
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const cards = [
    {
      key: 'kpi',
      shouldRender: true,
      node: (
        <KPISummaryCard
          scope={scope}
          couple={couple}
          income={incomeVsExpenses.income}
          expenses={incomeVsExpenses.expenses}
          totalSavings={savingsData?.summary?.totalSavings ?? savingsData?.summary?.total_savings ?? 0}
          settlement={settlementData}
          formatCurrency={formatCurrency}
          onViewReport={() => setDeepDiveOpen(true)}
        />
      )
    },
    {
      key: 'settlement',
      shouldRender: Boolean(settlementData?.settlement),
      node: <SettlementCard scope={scope} settlement={settlementData} couple={couple} />
    },
    {
      key: 'spending',
      shouldRender: scopedMonthlyTotals.length > 0,
      node: (
        <SpendingTrendsCard
          scope={scope}
          monthlyTotals={scopedMonthlyTotals}
          formatCurrency={formatCurrency}
          onExplore={() => setDeepDiveOpen(true)}
        />
      )
    },
    {
      key: 'savings',
      shouldRender: Boolean(savingsData),
      node: (
        <SavingsRateCard
          scope={scope}
          savingsData={savingsData}
          formatCurrency={formatCurrency}
          onAdjustGoal={() => navigate('/budget')}
        />
      )
    },
    {
      key: 'budget',
      shouldRender: Boolean(budgetInsight),
      node: (
        <BudgetPerformanceCard
          scope={scope}
          insight={budgetInsight}
          formatCurrency={formatCurrency}
          onViewTransactions={() => navigate('/budget')}
        />
      )
    },
    {
      key: 'goals',
      shouldRender: Boolean(sharedGoal),
      node: <SharedGoalsCard scope={scope} goal={sharedGoal} />
    }
  ].filter((item) => item.shouldRender);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="rounded-3xl border border-slate-100 bg-gradient-to-r from-indigo-100 via-white to-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-500">
              <Sparkles className="h-4 w-4" />
              Our Financial Check-up
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              {scope === 'mine'
                ? 'How my finances are trending'
                : scope === 'partner'
                  ? `${couple?.partner?.name?.split(' ')[0] || 'Partner'}’s recent highlights`
                  : 'Our key insights for this month'}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              We’ve gathered the wins, opportunities, and next steps for {scope === 'ours' ? 'our shared finances' : 'this view'}.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Scope</span>
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
              {scopeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => setScope(option.value)}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200',
                    option.value === scope
                      ? 'bg-white text-indigo-600 shadow'
                      : 'text-slate-500 hover:text-indigo-500',
                    option.disabled && 'cursor-not-allowed opacity-60'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500">
              {scopeOptions.find((option) => option.value === scope)?.description}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {cards.map((card, index) => (
          <div
            key={card.key}
            className="animate-slide-fade-in"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {card.node}
          </div>
        ))}
      </div>
      <AnalyticsDeepDiveModal
        open={deepDiveOpen}
        onClose={() => setDeepDiveOpen(false)}
        scope={scope}
        initialTrends={dashboardData?.analytics?.trends}
        initialIncomeExpenses={dashboardData?.analytics?.incomeExpenses}
      />
    </div>
  );
};

export default ModernEnhancedDashboard;
