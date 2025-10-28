"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { PiggyBank, Wallet, TrendingUp, TrendingDown, PlusCircle, Calendar, Sparkles } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import formatCurrency from '../utils/formatCurrency';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import AddContributionModal from './AddContributionModal';
import { useScope } from '../context/ScopeContext';
import { cn } from '../lib/utils';
import { assignGoalColors, getGoalColorScheme } from '../utils/goalColorPalette';

const extractScopedValue = (payload, scope) => {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }
  const scoped = payload.scopes?.[scope];
  if (scoped) {
    return scoped;
  }
  return payload;
};

const SavingsRateTracker = ({ timePeriod = '6months', startDate, endDate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingsData, setSavingsData] = useState(null);
  const [contribOpen, setContribOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const { user } = useAuth();
  const { scope } = useScope();
  const [period, setPeriod] = useState(timePeriod);

  // Chart configuration
  const chartConfig = {
    savingsRate: {
      label: "Savings Rate",
      color: "#10b981",
    },
    target: {
      label: "Target",
      color: "#f59e0b",
    },
  };

  const fetchSavingsData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let apiStartDate = startDate;
      let apiEndDate = endDate;
      
      if (!apiStartDate || !apiEndDate) {
        const now = new Date();
        apiEndDate = now.toISOString().split('T')[0];
        
        const monthsBack = period === '3months' ? 3 : period === '1year' ? 12 : 6;
        const startDateObj = new Date(now);
        startDateObj.setMonth(startDateObj.getMonth() - monthsBack);
        apiStartDate = startDateObj.toISOString().split('T')[0];
      }
      
      const response = await axios.get(`/analytics/savings-analysis/${apiStartDate}/${apiEndDate}`, {
        params: { scope }
      });

      const payload = extractScopedValue(response.data, scope) || {};
      
      const data = payload;
      const transformedData = {
        summary: {
          averageSavingsRate: data.summary?.averageSavingsRate || 0,
          totalSavings: data.summary?.totalSavings || 0,
          trend: data.summary?.savingsRateTrend || 0
        },
        chartData: data.monthlyData?.map(month => ({
          month: month.month,
          savingsRate: month.savingsRate || 0
        })) || [],
        goals: data.savingsGoals?.map((goal, index) => {
          const colorIndex =
            typeof goal.color_index === 'number' && !Number.isNaN(goal.color_index)
              ? goal.color_index
              : index;
          return {
            id: goal.id,
            name: goal.goal_name,
            targetAmount: parseFloat(goal.target_amount || 0),
            currentAmount: parseFloat(goal.current_amount || 0),
            icon: '🎯',
            category: goal.category,
            targetDate: goal.target_date,
            colorIndex,
            color_index: colorIndex,
            isPinned: Boolean(goal.is_pinned)
          };
        }) || [],
        targetRate: 20
      };
      
      setSavingsData(transformedData);
    } catch (err) {
      console.error('Error fetching savings data:', err);
      setError('Failed to load savings data');
    } finally {
      setLoading(false);
    }
  }, [user, period, startDate, endDate, scope]);

  useEffect(() => {
    fetchSavingsData();
  }, [fetchSavingsData]);

  useEffect(() => {
    setPeriod(timePeriod);
  }, [timePeriod]);

  const goalAccents = useMemo(
    () => assignGoalColors(savingsData?.goals || []),
    [savingsData?.goals]
  );

  // Calculate confidence score
  const calculateConfidence = () => {
    if (!savingsData?.chartData) return 0;
    const dataPoints = savingsData.chartData.length;
    const hasGoals = savingsData.goals && savingsData.goals.length > 0;
    const hasTrend = Math.abs(savingsData.summary?.trend || 0) > 0;
    
    let confidence = 50;
    if (dataPoints >= 6) confidence += 30;
    else if (dataPoints >= 3) confidence += 15;
    if (hasGoals) confidence += 15;
    if (hasTrend) confidence += 5;
    
    return Math.min(confidence, 100);
  };

  const getConfidenceBadgeClass = (confidence) => {
    if (confidence >= 80) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (confidence >= 60) return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-slate-100 text-slate-600 border border-slate-200';
  };

  const getSavingsRateStatus = (rate) => {
    if (rate >= 20) return "Excellent";
    if (rate >= 10) return "Good";
    if (rate >= 0) return "Fair";
    return "Needs Improvement";
  };

  const getTrendText = (trend) => {
    if (trend > 0) return `↗ +${trend.toFixed(1)}%`;
    if (trend < 0) return `↘ ${trend.toFixed(1)}%`;
    return "→ No change";
  };

  const getStatusBadgeClass = (rate) => {
    if (rate >= 20) return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    if (rate >= 10) return 'bg-slate-100 text-slate-600 border border-slate-200';
    if (rate >= 0) return 'bg-amber-50 text-amber-600 border border-amber-100';
    return 'bg-rose-50 text-rose-600 border border-rose-100';
  };

  const getTrendBadgeClass = (trend) => {
    if (trend > 0) return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    if (trend < 0) return 'bg-rose-50 text-rose-600 border border-rose-100';
    return 'bg-slate-100 text-slate-600 border border-slate-200';
  };

  const computePercent = (g) => {
    const t = parseFloat(g?.targetAmount || 0);
    const c = parseFloat(g?.currentAmount || 0);
    if (!t || t <= 0) return 0;
    return Math.min((c / t) * 100, 100);
  };

  const openContribution = (goal) => {
    setSelectedGoal(goal);
    setContribOpen(true);
  };

  const onContributionSuccess = () => {
    fetchSavingsData();
  };

  // Section Banner Component
  const SectionBanner = ({ title, subtitle }) => (
    <div className="rounded-3xl bg-gradient-to-r from-emerald-100/50 via-white to-white px-6 py-5 border border-emerald-100/50 flex items-center gap-4 shadow-sm">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100">
        <PiggyBank className="w-6 h-6 text-emerald-600" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <SectionBanner 
          title="Your Financial Check-up" 
          subtitle="Loading your savings data..." 
        />
        <Card className="rounded-3xl border border-slate-100 bg-white p-8 shadow-md">
          <CardContent>
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="text-slate-600">Analyzing your savings...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <SectionBanner 
          title="Your Financial Check-up" 
          subtitle="Track your savings rate and progress toward your goals" 
        />
        <Card className="rounded-3xl border border-slate-100 bg-white p-8 shadow-md">
          <CardContent>
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 mb-4">
              <p className="text-sm text-rose-700">{error}</p>
            </div>
            <button 
              onClick={fetchSavingsData}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-all"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No data state
  if (!savingsData || !savingsData.chartData || savingsData.chartData.length === 0) {
    return (
      <div className="space-y-6">
        <SectionBanner 
          title="Your Financial Check-up" 
          subtitle="Track your savings rate and progress toward your goals" 
        />
        <Card className="rounded-3xl border border-slate-100 bg-white p-8 shadow-md">
          <CardContent>
            <div className="text-center py-12">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No savings data available yet</h3>
              <p className="text-sm text-slate-600 mb-6">
                Start tracking your expenses to see savings analysis
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const confidence = calculateConfidence();
  const avgRate = savingsData.summary.averageSavingsRate || 0;
  const totalSavings = savingsData.summary.totalSavings || 0;
  const trend = savingsData.summary.trend || 0;

  return (
    <div className="space-y-6">
      {/* Section Banner */}
      <SectionBanner 
        title="Your Financial Check-up" 
        subtitle="Track your savings rate and progress toward your goals" 
      />

      {/* Main Card */}
      <Card className="rounded-3xl border border-slate-100 bg-white p-8 shadow-md hover:shadow-lg transition-shadow">
        {/* Header with Confidence Badge */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">Savings Rate Tracker</h3>
            <p className="text-sm text-slate-600">Your monthly savings performance over time</p>
          </div>
          <div className={cn('rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider', getConfidenceBadgeClass(confidence))}>
            {confidence}% Confidence
          </div>
        </div>

        {/* Body Copy */}
        <p className="text-sm text-slate-700 leading-relaxed mb-4">
          You're maintaining a {avgRate >= 20 ? 'healthy' : avgRate >= 10 ? 'moderate' : 'developing'} savings rate of <strong>{avgRate.toFixed(1)}%</strong> over the past {period === '3months' ? '3 months' : period === '1year' ? 'year' : '6 months'}.
          {trend > 0 && (
            <> Your trend is improving by <strong>+{trend.toFixed(1)}%</strong>, {avgRate >= 20 ? 'keeping you on track' : 'moving you toward your goals'}.</>
          )}
          {trend < 0 && (
            <> Your trend is declining by <strong>{trend.toFixed(1)}%</strong>, consider reviewing your budget.</>
          )}
          {trend === 0 && <> Your savings rate has remained stable.</>}
        </p>

        {/* Impact Chip */}
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600 border border-emerald-100 mb-6">
          <Wallet className="w-4 h-4" />
          Total saved: {formatCurrency(totalSavings)}
        </div>

        <CardContent className="px-0">
          {/* Chart Container */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 mb-6">
            <div className="text-xs uppercase tracking-wider text-slate-600 font-semibold mb-3">
              {period === '3months' ? '3-MONTH' : period === '1year' ? '12-MONTH' : '6-MONTH'} TREND
            </div>
            <ChartContainer config={chartConfig} className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={savingsData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    stroke="#94a3b8"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    stroke="#94a3b8"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="savingsRate" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', stroke: 'white', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
                    name="Savings Rate"
                  />
                  {savingsData.targetRate && (
                    <ReferenceLine 
                      y={savingsData.targetRate} 
                      stroke="#f59e0b" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{ 
                        value: `Target: ${savingsData.targetRate}%`, 
                        position: 'topRight',
                        fill: '#f59e0b',
                        fontSize: 11,
                        fontWeight: 600
                      }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {/* Average Savings Rate Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider text-slate-600 font-semibold">Avg Savings Rate</span>
                <PiggyBank className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-3">
                {avgRate.toFixed(1)}%
              </div>
              <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold', getStatusBadgeClass(avgRate))}>
                {getSavingsRateStatus(avgRate)}
              </span>
            </div>

            {/* Total Savings Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider text-slate-600 font-semibold">Total Savings</span>
                <Wallet className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-3">
                {formatCurrency(totalSavings)}
              </div>
              <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold', totalSavings >= 0 ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-rose-50 text-rose-600 border border-rose-100')}>
                {totalSavings >= 0 ? 'Positive' : 'Negative'}
              </span>
            </div>

            {/* Trend Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider text-slate-600 font-semibold">Trend</span>
                {trend >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-3">
                {getTrendText(trend)}
              </div>
              <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold', getTrendBadgeClass(trend))}>
                {trend > 0 ? 'Improving' : trend < 0 ? 'Declining' : 'Stable'}
              </span>
            </div>
          </div>

          {/* Savings Goals Section */}
          {savingsData.goals && savingsData.goals.length > 0 && (
            <div className="border-t border-slate-100 pt-8">
              <h4 className="text-lg font-semibold text-slate-900 mb-6">Savings Goals</h4>
              <div className="grid gap-5 md:grid-cols-2">
                {savingsData.goals.map((goal, index) => {
                  const accent =
                    goalAccents[goal.id] || getGoalColorScheme(goal.colorIndex ?? index);
                  const percent = computePercent(goal);

                  return (
                    <div
                      key={goal.id || index}
                      className={cn(
                        'rounded-3xl p-6 hover:shadow-lg transition-all',
                        accent.surface,
                        accent.border,
                        goal.isPinned && 'ring-2',
                        goal.isPinned && accent.ring
                      )}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className={cn('text-xs uppercase tracking-wider font-semibold mb-2', accent.accent)}>
                            {goal.category || 'GOAL'}
                          </div>
                          <h5 className="text-lg font-semibold text-slate-900">{goal.name}</h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => openContribution(goal)}
                          className={cn(
                            'rounded-full px-3 py-1.5 text-sm font-medium flex items-center gap-2 transition-all',
                            accent.quickButton,
                            'bg-white'
                          )}
                        >
                          <PlusCircle className="h-4 w-4" /> Add
                        </button>
                      </div>
                      
                      <div className="text-2xl font-bold text-slate-900 mb-4">
                        {formatCurrency(goal.currentAmount)} <span className="text-base font-normal text-slate-600">/ {formatCurrency(goal.targetAmount)}</span>
                      </div>
                      
                      <div className={cn('h-2 w-full rounded-full mb-4', accent.progressTrack)}>
                        <div
                          className={cn('h-full rounded-full transition-all duration-500', accent.progressBar)}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="font-semibold">{percent.toFixed(1)}% Complete</span>
                        {goal.targetDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" /> Target:{' '}
                            {new Date(goal.targetDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Pills */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-100">
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all">
              See All Transactions
            </button>
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all">
              Adjust Budget
            </button>
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all">
              Not Helpful
            </button>
          </div>
        </CardContent>

        <AddContributionModal
          open={contribOpen}
          onClose={() => setContribOpen(false)}
          goal={selectedGoal}
          onSuccess={onContributionSuccess}
          capAmount={selectedGoal ? Math.max(0, parseFloat(selectedGoal.targetAmount) - parseFloat(selectedGoal.currentAmount || 0)) : null}
          enforceCap={true}
        />
      </Card>
    </div>
  );
};

export default SavingsRateTracker;
