import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import formatCurrency from '../utils/formatCurrency';
import SpendingPatternsChart from './SpendingPatternsChart';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import {
  CalendarClock,
  Lightbulb,
  RefreshCcw,
  Sparkles,
  Target,
  TrendingDown,
  Trophy,
  PiggyBank,
  ShieldCheck
} from 'lucide-react';

const ANALYSIS_STEPS = [
  'Connecting to your financial data…',
  'Analyzing your spending patterns…',
  'Comparing against your budgets…',
  'Looking for savings opportunities…',
  'Preparing your personalized insights…'
];

const TIP_TYPE_CONFIG = {
  reduction: {
    label: 'Opportunities to reduce spending',
    Icon: Lightbulb,
    iconClass: 'text-amber-500',
    accentClass: 'from-rose-100 to-pink-50'
  },
  reallocation: {
    label: 'Rebalance your budgets',
    Icon: RefreshCcw,
    iconClass: 'text-indigo-500',
    accentClass: 'from-violet-100 to-indigo-50'
  },
  seasonal: {
    label: 'Seasonal heads-up',
    Icon: CalendarClock,
    iconClass: 'text-amber-500',
    accentClass: 'from-amber-100 to-yellow-50'
  },
  goal_based: {
    label: 'Keep savings goals on track',
    Icon: Target,
    iconClass: 'text-emerald-500',
    accentClass: 'from-emerald-100 to-green-50'
  },
  general: {
    label: 'Opportunities',
    Icon: Sparkles,
    iconClass: 'text-sky-500',
    accentClass: 'from-blue-100 to-sky-50'
  }
};

const buildRecommendationKeys = (item) => {
  if (!item) return [];

  const type = (item.tip_type || item.type || 'general').toLowerCase();
  const clean = (value) => {
    if (value === null || value === undefined) {
      return null;
    }
    const str = String(value).trim();
    return str.length ? str.toLowerCase() : null;
  };

  const keys = new Set();
  const push = (label, value) => {
    const cleaned = clean(value);
    if (cleaned !== null) {
      keys.add(`${type}:${label}:${cleaned}`);
    }
  };

  push('goal_id', item.goal_id);
  push('goal_name', item.goal_name);
  push('category', item.category);
  push('title', item.title);
  push('id', item.id);

  return Array.from(keys);
};

const BudgetOptimizationTips = ({ categories = [], onAdjustBudget, currentMonth, currentYear }) => {
  const navigate = useNavigate();
  const [tips, setTips] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [showPatterns, setShowPatterns] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [stepCycle, setStepCycle] = useState(0);
  const [tipActionBusy, setTipActionBusy] = useState(null);

  const categoryMap = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.name] = category;
      return acc;
    }, {});
  }, [categories]);

  const startProgressCycle = useCallback(() => {
    setActiveStep(0);
    setStepCycle((cycle) => cycle + 1);
  }, []);

  const loadOptimizationData = useCallback(async () => {
    startProgressCycle();
    setLoading(true);
    setError(null);

    try {
      const analysisRes = await axios.get('/optimization/analyze');
      setAnalysis(analysisRes.data);

      const [tipsRes, goalsRes] = await Promise.all([
        axios.get('/optimization/tips'),
        axios.get('/savings/goals').catch(() => ({ data: [] }))
      ]);

      setTips(Array.isArray(tipsRes.data) ? tipsRes.data : []);
      setGoals(Array.isArray(goalsRes.data) ? goalsRes.data : []);
    } catch (err) {
      console.error('Error loading optimization data:', err);
      setError('We could not complete your financial check-up. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [startProgressCycle]);

  const refreshAnalysis = async () => {
    startProgressCycle();
    setAnalyzing(true);
    setError(null);

    try {
      const analysisRes = await axios.get('/optimization/analyze');
      setAnalysis(analysisRes.data);

      const tipsRes = await axios.get('/optimization/tips');
      setTips(Array.isArray(tipsRes.data) ? tipsRes.data : []);
    } catch (err) {
      console.error('Error refreshing analysis:', err);
      setError('Failed to refresh analysis. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    loadOptimizationData();
  }, [loadOptimizationData]);

  const inProgress = (loading && !error) || analyzing;

  useEffect(() => {
    if (!inProgress) {
      return undefined;
    }

    let stepIndex = 0;
    setActiveStep(0);
    const timer = setInterval(() => {
      stepIndex += 1;
      setActiveStep((current) => {
        const nextStep = Math.min(stepIndex, ANALYSIS_STEPS.length - 1);
        return current === nextStep ? current : nextStep;
      });
      if (stepIndex >= ANALYSIS_STEPS.length - 1) {
        clearInterval(timer);
      }
    }, 1200);

    return () => clearInterval(timer);
  }, [inProgress, stepCycle]);

  const recommendationMetaMap = useMemo(() => {
    if (!analysis?.recommendations) {
      return {};
    }

    return analysis.recommendations.reduce((acc, item) => {
      const keys = buildRecommendationKeys(item);
      keys.forEach((key) => {
        acc[key] = item;
      });
      return acc;
    }, {});
  }, [analysis]);

  const opportunities = useMemo(() => {
    const source = tips.length > 0 ? tips : (analysis?.recommendations || []);

    return source.map((item, index) => {
      const baseItem = {
        ...item,
        tip_type: item.tip_type || item.type || 'general',
        id: item.id || `recommendation-${index}`
      };

      const keys = buildRecommendationKeys(baseItem);
      const metaKey = keys.find((key) => recommendationMetaMap[key]);
      const meta = metaKey ? recommendationMetaMap[metaKey] : (tips.length === 0 ? baseItem : null);

      if (baseItem.tip_type === 'goal_based' && meta) {
        return enhanceGoalOpportunity(baseItem, meta);
      }

      return {
        ...baseItem,
        meta
      };
    });
  }, [tips, analysis, recommendationMetaMap]);

  const groupedOpportunities = useMemo(() => {
    return opportunities.reduce((acc, opportunity) => {
      const type = opportunity.tip_type || 'general';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(opportunity);
      return acc;
    }, {});
  }, [opportunities]);

  const wins = useMemo(() => {
    if (!analysis) {
      return [];
    }

    const list = [];
    const variances = Array.isArray(analysis.budgetVariances) ? analysis.budgetVariances : [];
    const patterns = analysis.patterns || {};

    variances
      .filter((variance) => Number(variance.variance) < -0.05)
      .slice(0, 3)
      .forEach((variance) => {
        list.push({
          id: `variance-${variance.name}-${variance.month}`,
          Icon: Trophy,
          iconClass: 'text-emerald-500',
          title: `You stayed under budget in ${variance.name}`,
          highlight: `${formatCurrencySafe(variance.budgetAmount - variance.actualAmount)} saved`,
          description: `${formatMonthLabel(variance.month)} budget: ${formatCurrencySafe(variance.actualAmount)} spent of ${formatCurrencySafe(variance.budgetAmount)}`
        });
      });

    Object.entries(patterns).forEach(([category, pattern]) => {
      if (pattern?.trend === 'decreasing') {
        list.push({
          id: `pattern-${category}`,
          Icon: TrendingDown,
          iconClass: 'text-sky-500',
          title: `${category} spending is trending down`,
          highlight: `${Math.abs(Number(pattern.enhancedTrend?.percentageChange || 0))}% lower`,
          description: 'Great job keeping this category in check.'
        });
      }
    });

    goals
      .filter((goal) => Number(goal.current_amount) > 0 && Number(goal.target_amount) > 0)
      .slice(0, 2)
      .forEach((goal) => {
        const progress = Math.min(100, Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100));
        list.push({
          id: `goal-${goal.id}`,
          Icon: PiggyBank,
          iconClass: 'text-emerald-500',
          title: `Progress on ${goal.goal_name}`,
          highlight: `${progress}% complete`,
          description: `Saved ${formatCurrencySafe(goal.current_amount)} of ${formatCurrencySafe(goal.target_amount)} so far.`
        });
      });

    return list.slice(0, 4);
  }, [analysis, goals]);

  const topOpportunity = useMemo(() => {
    if (!opportunities.length) {
      return null;
    }

    const sorted = [...opportunities].sort((a, b) => {
      const confidenceDiff = Number(b.confidence_score || 0) - Number(a.confidence_score || 0);
      if (confidenceDiff !== 0) {
        return confidenceDiff;
      }
      return Number(b.impact_amount || 0) - Number(a.impact_amount || 0);
    });

    return sorted[0];
  }, [opportunities]);

  const headline = useMemo(() => {
    if (topOpportunity) {
      const type = topOpportunity.tip_type;
      const category = topOpportunity.category;

      switch (type) {
        case 'reduction':
          return category
            ? `Your ${category} spending needs a closer look. Let’s explore ways to save.`
            : 'We found a spending category that could unlock quick savings.';
        case 'reallocation':
          return 'You have room to rebalance your budget for greater impact.';
        case 'seasonal':
          return category
            ? `Heads up—${category} spending may spike soon. Here’s how to stay ahead.`
            : 'We spotted a seasonal pattern in your spending. Let’s get prepared.';
        case 'goal_based':
          return 'You are close to hitting a savings milestone. Keep the momentum going!';
        default:
          break;
      }
    }

    if (wins.length) {
      return `Great work! ${wins[0].title}`;
    }

    return 'Your Financial Check-up is ready.';
  }, [topOpportunity, wins]);

  const handleSeeTransactions = (opportunity) => {
    if (!opportunity?.category) {
      navigate('/expenses');
      return;
    }

    const category = categoryMap[opportunity.category];
    const categoryId = category?.id;
    const latestMonth = getLatestMonthForCategory(analysis, opportunity.category);

    const params = new URLSearchParams();
    if (categoryId) {
      params.set('category', categoryId);
    }

    if (latestMonth) {
      const [year, month] = latestMonth.split('-');
      params.set('year', year);
      params.set('month', month);
    } else if (currentYear && currentMonth) {
      params.set('year', currentYear);
      params.set('month', String(currentMonth).padStart(2, '0'));
    }

    const query = params.toString();
    navigate(`/expenses${query ? `?${query}` : ''}`);
  };

  const handleAdjustBudget = (opportunity) => {
    if (!opportunity?.category || !onAdjustBudget) {
      return;
    }
    onAdjustBudget(opportunity.category);
  };

  const handleDismissTip = async (opportunity, action = 'dismiss') => {
    if (!opportunity?.id) {
      return;
    }

    try {
      setTipActionBusy(`${opportunity.id}-${action}`);
      await axios.post(`/optimization/tips/${opportunity.id}/dismiss`);
      setTips((prev) => prev.filter((tip) => tip.id !== opportunity.id));
    } catch (err) {
      console.error('Error updating tip:', err);
      setError('We could not update that insight. Please try again.');
    } finally {
      setTipActionBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="relative bg-white/90 backdrop-blur rounded-3xl shadow-xl p-10 flex flex-col items-center justify-center min-h-[420px]">
        <AnalysisProgress currentStep={activeStep} />
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden">
      {analyzing && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur">
          <AnalysisProgress currentStep={activeStep} />
        </div>
      )}

      <div className="px-8 py-10">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-500 font-semibold">Your Financial Check-up</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mt-1">{headline}</h2>
            <p className="text-sm text-slate-500 mt-2">We combined your latest budgets, expenses, and goals to surface the most helpful insights.</p>
          </div>
          <button
            onClick={refreshAnalysis}
            disabled={analyzing}
            className="inline-flex items-center gap-2 self-start md:self-auto bg-gradient-to-r from-blue-500 to-sky-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition disabled:opacity-50"
          >
            {analyzing ? 'Running check-up…' : 'Run Check-up again'}
          </button>
        </header>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-12">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Your wins this period</h3>
          {wins.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {wins.map((win) => (
                <div key={win.id} className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-5 shadow-sm">
                  {win.Icon ? (
                    <win.Icon className={`h-5 w-5 ${win.iconClass || 'text-emerald-500'}`} />
                  ) : (
                    <Sparkles className="h-5 w-5 text-emerald-500" />
                  )}
                  <h4 className="mt-3 text-base font-semibold text-slate-800">{win.title}</h4>
                  <p className="mt-1 text-sm font-medium text-emerald-600">{win.highlight}</p>
                  <p className="mt-2 text-sm text-slate-500">{win.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-6 text-emerald-700">
              Everything looks balanced—keep doing what works! We will let you know when we spot a new opportunity.
            </div>
          )}
        </section>

        <section className="space-y-10">
          {Object.keys(groupedOpportunities).length ? (
            Object.entries(groupedOpportunities).map(([type, items]) => {
              const config = TIP_TYPE_CONFIG[type] || TIP_TYPE_CONFIG.general;
              const HeaderIcon = config.Icon || TIP_TYPE_CONFIG.general.Icon;
              return (
                <div key={type}>
                  <div className={`rounded-3xl bg-gradient-to-r ${config.accentClass} px-6 py-5 mb-5 border border-slate-100 flex items-center gap-3 shadow-sm`}>
                    <HeaderIcon className={`h-5 w-5 ${config.iconClass || TIP_TYPE_CONFIG.general.iconClass}`} />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{config.label}</h3>
                      <p className="text-sm text-slate-600">{copyForType(type)}</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {items.map((item) => (
                      <OpportunityCard
                        key={item.id || item.title}
                        opportunity={item}
                        type={type}
                        analysis={analysis}
                        goals={goals}
                        onSeeTransactions={() => handleSeeTransactions(item)}
                        onAdjustBudget={() => handleAdjustBudget(item)}
                        onSnooze={() => handleDismissTip(item, 'snooze')}
                        onDismiss={() => handleDismissTip(item, 'dismiss')}
                        actionBusyId={tipActionBusy}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-blue-100 bg-blue-50 px-6 py-10 text-center">
              <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-emerald-500" />
              <h3 className="text-xl font-semibold text-slate-800">Your financial health is strong!</h3>
              <p className="mt-2 text-sm text-slate-600">We analyzed your recent spending and everything looks perfectly balanced. Keep it up and check back soon.</p>
              <button
                onClick={refreshAnalysis}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:shadow-lg"
              >
                Run check-up again
              </button>
            </div>
          )}
        </section>

        {analysis?.patterns && Object.keys(analysis.patterns).length > 0 && (
          <section className="mt-12">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Explore spending trends</h3>
                <p className="text-sm text-slate-600">Review the full pattern analysis and click any category to focus the opportunities above.</p>
              </div>
              <button
                onClick={() => setShowPatterns((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:shadow-md"
              >
                {showPatterns ? 'Hide chart' : 'View detailed trends'}
              </button>
            </div>

            {showPatterns && (
              <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <SpendingPatternsChart patterns={analysis.patterns} />
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

const OpportunityCard = ({
  opportunity,
  type,
  analysis,
  goals,
  onSeeTransactions,
  onAdjustBudget,
  onSnooze,
  onDismiss,
  actionBusyId
}) => {
  const confidence = Number(opportunity.confidence_score || 0);
  const impact = Number(opportunity.impact_amount || 0);
  const patternSeries = opportunity.category ? buildTrendSeries(analysis?.patterns?.[opportunity.category]) : null;
  const reallocation = type === 'reallocation' ? buildReallocationData(opportunity, analysis) : null;
  const goalPlan = type === 'goal_based' ? opportunity.meta : null;
  const goalInfo = type === 'goal_based' ? resolveGoalInfo(opportunity, goals) : null;
  const actionDisabled = !opportunity.id;

  return (
    <div className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-lg font-semibold text-slate-900">{opportunity.title}</h4>
              <p className="mt-2 text-sm text-slate-600">{opportunity.description}</p>
            </div>
            <ConfidenceBadge score={confidence} />
          </div>

          {impact > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
              {type === 'goal_based' && goalPlan ? 'Suggested monthly contribution: ' : 'Potential impact: '}
              {formatCurrencySafe(impact)}
            </div>
          )}
      </div>

        {type === 'reduction' && patternSeries && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <h5 className="text-xs font-semibold uppercase text-slate-500">Recent trend</h5>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={patternSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(value) => formatCurrencyShort(value)} />
                  <Tooltip content={<TrendTooltip />} />
                  <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {type === 'seasonal' && patternSeries && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">
            <h5 className="text-xs font-semibold uppercase text-amber-600">Seasonal pattern</h5>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={patternSeries}>
                  <defs>
                    <linearGradient id="seasonalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fcd34d" />
                  <XAxis dataKey="label" stroke="#f59e0b" fontSize={11} />
                  <YAxis stroke="#f59e0b" fontSize={11} tickFormatter={(value) => formatCurrencyShort(value)} />
                  <Tooltip content={<TrendTooltip />} />
                  <Area type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={2} fill="url(#seasonalGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {type === 'reallocation' && reallocation && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-3">
            <h5 className="text-xs font-semibold uppercase text-indigo-600">Budget comparison</h5>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reallocation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c7d2fe" />
                  <XAxis dataKey="label" stroke="#6366f1" fontSize={11} />
                  <YAxis stroke="#6366f1" fontSize={11} tickFormatter={(value) => formatCurrencyShort(value)} />
                  <Tooltip content={<TrendTooltip />} />
                  <Bar dataKey="budget" fill="#a5b4fc" radius={[4, 4, 0, 0]} name="Budget" />
                  <Bar dataKey="actual" fill="#4338ca" radius={[4, 4, 0, 0]} name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {type === 'goal_based' && goalInfo && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <h5 className="text-xs font-semibold uppercase text-emerald-600">{goalInfo.goal_name}</h5>
            <p className="mt-1 text-sm text-slate-600">Target: {formatCurrencySafe(goalInfo.target_amount)} · Saved: {formatCurrencySafe(goalInfo.current_amount)}</p>
            <div className="mt-3 h-2 rounded-full bg-white">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${goalInfo.progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-medium text-emerald-700">{goalInfo.progress}% complete</p>
            {goalPlan?.months_remaining && goalPlan?.remaining_amount !== null && (
              <p className="mt-2 text-xs text-emerald-700">
                {goalPlan.months_remaining} {goalPlan.months_remaining === 1 ? 'month' : 'months'} remaining · Remaining balance {formatCurrencySafe(goalPlan.remaining_amount)}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2 text-sm">
          <ActionButton
            label="See transactions"
            onClick={onSeeTransactions}
            disabled={!opportunity.category}
          />
          <ActionButton
            label="Adjust budget"
            onClick={onAdjustBudget}
            disabled={!opportunity.category || !onAdjustBudget}
          />
          <ActionButton
            label="Snooze 30 days"
            onClick={onSnooze}
            disabled={actionDisabled}
            loading={actionBusyId === `${opportunity.id}-snooze`}
          />
          <ActionButton
            label="Not helpful"
            onClick={onDismiss}
            disabled={actionDisabled}
            loading={actionBusyId === `${opportunity.id}-dismiss`}
          />
        </div>
      </div>
    </div>
  );
};

const AnalysisProgress = ({ currentStep }) => (
  <div className="w-full max-w-md">
    <p className="text-sm font-semibold uppercase tracking-wide text-blue-500 text-center mb-6">Running your financial check-up</p>
    <div className="space-y-3">
      {ANALYSIS_STEPS.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        return (
          <div
            key={step}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            <span
              className={`h-3 w-3 rounded-full ${
                isCompleted ? 'bg-emerald-500' : isActive ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="text-sm font-medium">{step}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const ConfidenceBadge = ({ score }) => {
  if (Number.isNaN(score) || score <= 0) {
    return null;
  }

  const percent = Math.round(score * 100);
  const tone = percent >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : percent >= 60 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200';

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>
      {percent}% confidence
    </span>
  );
};

const ActionButton = ({ label, onClick, disabled, loading }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium transition ${
      disabled || loading
        ? 'text-slate-400 bg-slate-100 cursor-not-allowed'
        : 'text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300'
    }`}
  >
    {loading ? 'Working…' : label}
  </button>
);

const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const value = payload[0].value;

  return (
    <div className="rounded-lg bg-white px-3 py-2 shadow border border-slate-200 text-xs text-slate-600">
      <div className="font-semibold text-slate-700">{label}</div>
      <div>{formatCurrencySafe(value)}</div>
    </div>
  );
};

const buildTrendSeries = (pattern) => {
  if (!pattern?.data) {
    return null;
  }

  const sorted = [...pattern.data].sort((a, b) => a.month.localeCompare(b.month));
  return sorted.map((point) => ({
    label: formatMonthShort(point.month),
    amount: Number(point.amount || 0)
  }));
};

const buildReallocationData = (opportunity, analysis) => {
  if (!opportunity?.description || !analysis?.budgetVariances) {
    return null;
  }

  const match = opportunity.description.match(/from (.+?) to (.+)$/i);
  if (!match) {
    return null;
  }

  const fromCategory = match[1]?.replace(/['".]/g, '').trim();
  const toCategory = match[2]?.replace(/['".]/g, '').trim();

  const from = getLatestVariance(analysis, fromCategory);
  const to = getLatestVariance(analysis, toCategory);

  if (!from && !to) {
    return null;
  }

  return [from, to]
    .filter(Boolean)
    .map((item) => ({
      label: item.name,
      budget: Number(item.budgetAmount || 0),
      actual: Number(item.actualAmount || 0)
    }));
};

const resolveGoalInfo = (opportunity, goals = []) => {
  const meta = opportunity?.meta || {};
  const inferredName = meta.goal_name || extractGoalNameFromTitle(opportunity?.title);

  const normalize = (value) => (value === null || value === undefined ? null : String(value).trim().toLowerCase());

  const findGoalMatch = () => {
    if (!Array.isArray(goals) || goals.length === 0) {
      return null;
    }

    if (meta.goal_id !== undefined && meta.goal_id !== null) {
      const byId = goals.find((goal) => String(goal.id) === String(meta.goal_id));
      if (byId) {
        return byId;
      }
    }

    if (inferredName) {
      const targetName = normalize(inferredName);
      const byName = goals.find((goal) => normalize(goal.goal_name) === targetName);
      if (byName) {
        return byName;
      }
    }

    if (meta.target_amount) {
      const target = Number(meta.target_amount);
      const byTarget = goals.find((goal) => Math.abs(Number(goal.target_amount || 0) - target) < 1);
      if (byTarget) {
        return byTarget;
      }
    }

    return goals.length === 1 ? goals[0] : null;
  };

  const matchedGoal = findGoalMatch();

  if (matchedGoal) {
    const target = Number(matchedGoal.target_amount || meta.target_amount || 0);
    const current = Number(matchedGoal.current_amount || meta.current_amount || 0);
    const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    return {
      goal_name: matchedGoal.goal_name || inferredName || 'Savings goal',
      target_amount: target,
      current_amount: current,
      progress
    };
  }

  if (meta.target_amount) {
    const target = Number(meta.target_amount);
    const current = Number(meta.current_amount || 0);
    const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    return {
      goal_name: inferredName || 'Savings goal',
      target_amount: target,
      current_amount: current,
      progress
    };
  }

  if (inferredName) {
    return {
      goal_name: inferredName,
      target_amount: null,
      current_amount: null,
      progress: 0
    };
  }

  return null;
};

const copyForType = (type) => {
  switch (type) {
    case 'reduction':
      return 'These categories are running hot. See the data and take action in seconds.';
    case 'reallocation':
      return 'Shift unused budget to the categories that need it most.';
    case 'seasonal':
      return 'We spotted seasonal trends so you can plan ahead with confidence.';
    case 'goal_based':
      return 'Stay on track with a clearer monthly contribution plan for your goals.';
    default:
      return 'Explore opportunities tailored to your current spending patterns.';
  }
};

const getLatestMonthForCategory = (analysis, category) => {
  const pattern = analysis?.patterns?.[category];
  if (!pattern?.data || !pattern.data.length) {
    return null;
  }
  const sorted = [...pattern.data].sort((a, b) => a.month.localeCompare(b.month));
  return sorted[sorted.length - 1].month;
};

const getLatestVariance = (analysis, category) => {
  if (!category || !analysis?.budgetVariances) {
    return null;
  }
  const matches = analysis.budgetVariances.filter((item) => item.name === category);
  if (!matches.length) {
    return null;
  }
  const sorted = matches.sort((a, b) => a.month.localeCompare(b.month));
  return sorted[sorted.length - 1];
};

const formatMonthLabel = (value) => {
  if (!value) {
    return '';
  }
  const [year, month] = value.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('en', { month: 'long', year: 'numeric' });
};

const formatMonthShort = (value) => {
  if (!value) {
    return '';
  }
  const [year, month] = value.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('en', { month: 'short' });
};

const formatCurrencySafe = (value) => {
  const amount = Number(value) || 0;
  return formatCurrency(amount);
};

const enhanceGoalOpportunity = (opportunity, meta) => {
  const sanitizedMeta = sanitizeGoalMeta(meta);
  const description = buildGoalOpportunityDescription(sanitizedMeta, opportunity.description);
  const impactAmount = sanitizedMeta.recommended_monthly || sanitizedMeta.monthly_needed || opportunity.impact_amount;

  return {
    ...opportunity,
    description,
    impact_amount: impactAmount,
    meta: sanitizedMeta
  };
};

const sanitizeGoalMeta = (meta = {}) => {
  const numberOr = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    ...meta,
    target_amount: numberOr(meta.target_amount) ?? null,
    current_amount: numberOr(meta.current_amount) ?? null,
    remaining_amount: numberOr(meta.remaining_amount) ?? null,
    months_remaining: meta.months_remaining ? Math.max(0, Math.round(Number(meta.months_remaining))) : null,
    recommended_monthly: numberOr(meta.recommended_monthly) ?? null,
    monthly_needed: numberOr(meta.monthly_needed) ?? null
  };
};

const buildGoalOpportunityDescription = (meta = {}, fallback) => {
  const {
    months_remaining: monthsRemaining,
    recommended_monthly: recommendedMonthly,
    monthly_needed: monthlyNeeded
  } = meta;

  if (!monthsRemaining || !recommendedMonthly) {
    return fallback;
  }

  const monthsLabel = monthsRemaining === 1 ? 'month' : 'months';
  const recommendedText = formatCurrencySafe(recommendedMonthly);
  const neededText = monthlyNeeded ? formatCurrencySafe(monthlyNeeded) : null;

  if (monthsRemaining <= 2 && neededText) {
    return `Only ${monthsRemaining} ${monthsLabel} left to hit this goal. You would need about ${neededText} each month—try to set aside at least ${recommendedText} or adjust the target date.`;
  }

  if (neededText) {
    return `You have ${monthsRemaining} ${monthsLabel} remaining. Setting aside roughly ${recommendedText} each month keeps you on track (target pace: ${neededText}).`;
  }

  return `You have ${monthsRemaining} ${monthsLabel} remaining. Setting aside roughly ${recommendedText} each month keeps you on track.`;
};

const extractGoalNameFromTitle = (title) => {
  if (!title) {
    return null;
  }
  const match = String(title).match(/keep\s+(.+?)\s+on\s+track/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
};

const formatCurrencyShort = (value) => {
  const amount = Number(value) || 0;
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k`;
  }
  return Math.round(amount).toString();
};

export default BudgetOptimizationTips;
