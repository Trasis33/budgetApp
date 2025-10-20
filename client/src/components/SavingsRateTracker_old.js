"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { PiggyBank, Wallet, TrendingUp, TrendingDown, PlusCircle, Calendar, Sparkles } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
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
  // Modal state must be declared before any conditional returns
  const [contribOpen, setContribOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const { user } = useAuth();
  const { scope } = useScope();
  // Local period state to control the time filter UI and fetching
  const [period, setPeriod] = useState(timePeriod);

  // Chart configuration for shadcn
  const chartConfig = {
    savingsRate: {
      label: "Savings Rate",
      color: "var(--primary)",
    },
    target: {
      label: "Target",
      color: "var(--muted)",
    },
  };

  const fetchSavingsData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Calculate date range based on timePeriod if not provided
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
      
      // Transform the data to match our component's expected structure
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
        targetRate: 20 // Default target savings rate
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

  // Sync local period if parent prop changes
  useEffect(() => {
    setPeriod(timePeriod);
  }, [timePeriod]);

  const goalAccents = useMemo(
    () => assignGoalColors(savingsData?.goals || []),
    [savingsData?.goals]
  );

  // Helper functions for badge variants
  const getBadgeVariant = (rate) => {
    if (rate >= 20) return "success";
    if (rate >= 10) return "default"; 
    if (rate >= 0) return "warning";
    return "destructive";
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

  const getTrendBadgeVariant = (trend) => {
    if (trend > 0) return "success";
    if (trend < 0) return "destructive";
    return "secondary";
  };

  // Segmented control inline styles (clean, non-glass)
  const segmentedStyles = {
    display: 'inline-flex',
    background: 'rgba(148,163,184,0.10)',
    border: '1px solid var(--border-color)',
    borderRadius: 9999,
    padding: 4,
    gap: 4,
  };
  const segBtn = (active) => ({
    border: 0,
    background: active ? 'var(--surface)' : 'transparent',
    padding: '6px 10px',
    borderRadius: 9999,
    color: active ? 'var(--primary)' : 'var(--muted)',
    fontWeight: 700,
    fontSize: 12,
    cursor: 'pointer',
    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
  });

  // Pill styles to mirror design iteration
  const pillBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 700,
  };
  const getPillStyle = (variant) => {
    switch (variant) {
      case 'success':
        return { ...pillBase, background: 'rgba(16,185,129,0.12)', color: 'var(--success)' };
      case 'warning':
        return { ...pillBase, background: 'rgba(245,158,11,0.12)', color: 'var(--warn)' };
      case 'destructive':
        return { ...pillBase, background: 'rgba(229,72,77,0.12)', color: 'var(--danger)' };
      default:
        return { ...pillBase, background: 'rgba(148,163,184,0.2)', color: 'var(--muted)' };
    }
  };
  const toPill = (v) => (v === 'default' || v === 'secondary') ? 'neutral' : v;
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

  // Loading state
  if (loading) {
    return (
      <Card className="chart-card">
        <CardHeader>
          <CardTitle className="section-title">💰 Savings Rate Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p style={{ color: 'var(--muted)' }}>Loading savings data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="chart-card">
        <CardHeader>
          <CardTitle className="section-title">💰 Savings Rate Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="banner banner-danger" style={{ marginTop: 'var(--spacing-md)' }}>
            <div className="icon">⚠️</div>
            <div>{error}</div>
          </div>
          <button 
            onClick={fetchSavingsData}
            className="btn"
            style={{ marginTop: 'var(--spacing-lg)' }}
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!savingsData || !savingsData.chartData || savingsData.chartData.length === 0) {
    return (
      <Card className="chart-card">
        <CardHeader>
          <CardTitle className="section-title">💰 Savings Rate Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="empty-container">
            <div className="empty-icon">📊</div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted)', marginTop: 'var(--spacing-md)' }}>
              No savings data available yet
            </p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--muted)' }}>
              Start tracking your expenses to see savings analysis
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="chart-card" style={{ paddingBlock: 'var(--spacing-6xl)' }}>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap" style={{ gap: 8 }}>
          <div>
            <CardTitle className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <PiggyBank size={18} /> Savings Rate Tracker
            </CardTitle>
            <div className="chart-subtitle">Monthly savings rate</div>
          </div>
          <div>
            <div style={segmentedStyles} role="tablist" aria-label="Time range">
              <button
                style={segBtn(period === '3months')}
                onClick={() => setPeriod('3months')}
                role="tab"
                aria-selected={period === '3months'}
              >
                3M
              </button>
              <button
                style={segBtn(period === '6months')}
                onClick={() => setPeriod('6months')}
                role="tab"
                aria-selected={period === '6months'}
              >
                6M
              </button>
              <button
                style={segBtn(period === '1year')}
                onClick={() => setPeriod('1year')}
                role="tab"
                aria-selected={period === '1year'}
              >
                1Y
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart now sits on top for alignment with dashboard */}
        <ChartContainer config={chartConfig} className="h-80" style={{ marginBottom: 'var(--spacing-6xl)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={savingsData.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 9, fontFamily: 'var(--font-primary)', fill: 'var(--muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 9, fontFamily: 'var(--font-primary)', fill: 'var(--muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ fontFamily: 'var(--font-primary)', fontSize: 12 }} />
              <Line 
                type="monotone" 
                dataKey="savingsRate" 
                stroke="var(--primary)" 
                strokeWidth={3}
                dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'var(--primary)', strokeWidth: 2 }}
                name="Savings Rate"
              />
              {savingsData.targetRate && (
                <ReferenceLine 
                  y={savingsData.targetRate} 
                  stroke="var(--warn)" 
                  strokeDasharray="5 5"
                  label={{ value: `Target: ${savingsData.targetRate}%`, position: "topRight" }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Stats Grid following design iteration (clean card, pill labels) */}
        <div className="two-col-grid" style={{ marginBottom: 'var(--spacing-6xl)' }}>
          {/* Average Savings Rate Card */}
          <Card className="stat-card" style={{ border: '1px solid var(--border-color)' }}>
            <CardContent>
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted)' }}>Avg Savings Rate</div>
                <PiggyBank size={18} color="var(--muted)" />
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--spacing-md)' }}>
                {savingsData.summary.averageSavingsRate.toFixed(1)}%
              </div>
              <span style={getPillStyle(toPill(getBadgeVariant(savingsData.summary.averageSavingsRate)))}>
                {getSavingsRateStatus(savingsData.summary.averageSavingsRate)}
              </span>
            </CardContent>
          </Card>

          {/* Total Savings Card */}
          <Card className="stat-card" style={{ border: '1px solid var(--border-color)' }}>
            <CardContent>
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted)' }}>Total Savings</div>
                <Wallet size={18} color="var(--muted)" />
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--spacing-md)' }}>
                {formatCurrency(savingsData.summary.totalSavings)}
              </div>
              <span style={getPillStyle(savingsData.summary.totalSavings >= 0 ? 'neutral' : 'destructive')}>
                {savingsData.summary.totalSavings >= 0 ? 'Positive' : 'Negative'}
              </span>
            </CardContent>
          </Card>

          {/* Trend Card */}
          <Card className="stat-card" style={{ border: '1px solid var(--border-color)' }}>
            <CardContent>
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted)' }}>Trend</div>
                {(savingsData.summary.trend || 0) >= 0 ? (
                  <TrendingUp size={18} color="var(--muted)" />
                ) : (
                  <TrendingDown size={18} color="var(--muted)" />
                )}
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--spacing-md)' }}>
                {getTrendText(savingsData.summary.trend || 0)}
              </div>
              <span style={getPillStyle(toPill(getTrendBadgeVariant(savingsData.summary.trend || 0)))}>
                {savingsData.summary.trend > 0 ? 'Improving' : savingsData.summary.trend < 0 ? 'Declining' : 'Stable'}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Savings Goals Section */}
        {savingsData.goals && savingsData.goals.length > 0 && (
          <div className="mt-10">
            <h4 className="text-lg font-semibold text-slate-900 mb-6">Savings Goals</h4>
            <div className="grid gap-4 md:grid-cols-2">
              {savingsData.goals.map((goal, index) => {
                const accent =
                  goalAccents[goal.id] || getGoalColorScheme(goal.colorIndex ?? index);
                const percent = computePercent(goal);

                return (
                  <Card
                    key={goal.id || index}
                    className={cn(
                      'hover:shadow-lg transition-shadow rounded-3xl border shadow-sm',
                      accent.surface,
                      accent.border
                    )}
                  >
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className={cn('text-sm font-semibold', accent.heading)}>{goal.name}</div>
                        <button
                          type="button"
                          onClick={() => openContribution(goal)}
                          className={cn(
                            'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium',
                            accent.quickButton,
                            'bg-white'
                          )}
                        >
                          <PlusCircle className="h-4 w-4" /> Add
                        </button>
                      </div>
                      <div className={cn('text-xl font-semibold', accent.heading)}>
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </div>
                      <div className={cn('h-2 w-full rounded-full', accent.progressTrack)}>
                        <div
                          className={cn('h-full rounded-full transition-all duration-300', accent.progressBar)}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className={cn('flex items-center justify-between text-xs', accent.body)}>
                        <span>{percent.toFixed(1)}% Complete</span>
                        {goal.targetDate && (
                          <span className="inline-flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Target:{' '}
                            {new Date(goal.targetDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
        <AddContributionModal
          open={contribOpen}
          onClose={() => setContribOpen(false)}
          goal={selectedGoal}
          onSuccess={onContributionSuccess}
          capAmount={selectedGoal ? Math.max(0, parseFloat(selectedGoal.targetAmount) - parseFloat(selectedGoal.currentAmount || 0)) : null}
          enforceCap={true}
        />
      </CardContent>
    </Card>
  );
};

export default SavingsRateTracker;
