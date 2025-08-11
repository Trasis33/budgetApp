"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { Badge } from './ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import formatCurrency from '../utils/formatCurrency';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import '../styles/design-system.css';

const SavingsRateTracker = ({ timePeriod = '6months', startDate, endDate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingsData, setSavingsData] = useState(null);
  const { user } = useAuth();

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
        
        const monthsBack = timePeriod === '3months' ? 3 : timePeriod === '1year' ? 12 : 6;
        const startDateObj = new Date(now);
        startDateObj.setMonth(startDateObj.getMonth() - monthsBack);
        apiStartDate = startDateObj.toISOString().split('T')[0];
      }
      
      const response = await axios.get(`/analytics/savings-analysis/${apiStartDate}/${apiEndDate}`);
      
      // Transform the data to match our component's expected structure
      const data = response.data;
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
        goals: data.savingsGoals?.map(goal => ({
          name: goal.goal_name,
          targetAmount: goal.target_amount,
          currentAmount: goal.current_amount || 0,
          icon: '🎯'
        })) || [],
        targetRate: 20 // Default target savings rate
      };
      
      setSavingsData(transformedData);
    } catch (err) {
      console.error('Error fetching savings data:', err);
      setError('Failed to load savings data');
    } finally {
      setLoading(false);
    }
  }, [user, timePeriod, startDate, endDate]);

  useEffect(() => {
    fetchSavingsData();
  }, [fetchSavingsData]);

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
        <CardTitle className="section-title">💰 Savings Rate Tracker</CardTitle>
        <div className="chart-subtitle">
          {timePeriod ? timePeriod.replace('months', 'mo').replace('year', 'yr') : 'Period'}
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Grid with shadcn Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--spacing-4xl)', marginBottom: 'var(--spacing-6xl)' }}>
          {/* Average Savings Rate Card */}
          <Card className="stat-card">
            <CardContent>
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted)' }}>Average Savings Rate</div>
                <div style={{ fontSize: 'var(--font-size-lg)' }}>💰</div>
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>
                {savingsData.summary.averageSavingsRate.toFixed(1)}%
              </div>
              <Badge variant={getBadgeVariant(savingsData.summary.averageSavingsRate)}>
                {getSavingsRateStatus(savingsData.summary.averageSavingsRate)}
              </Badge>
            </CardContent>
          </Card>

          {/* Total Savings Card */}
          <Card className="stat-card">
            <CardContent>
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted)' }}>Total Savings</div>
                <div style={{ fontSize: 'var(--font-size-lg)' }}>💵</div>
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>
                {formatCurrency(savingsData.summary.totalSavings)}
              </div>
              <Badge variant="default">
                {savingsData.summary.totalSavings >= 0 ? 'Positive' : 'Negative'}
              </Badge>
            </CardContent>
          </Card>

          {/* Trend Card */}
          <Card className="stat-card">
            <CardContent>
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted)' }}>Trend</div>
                <div style={{ fontSize: 'var(--font-size-lg)' }}>📈</div>
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>
                {getTrendText(savingsData.summary.trend || 0)}
              </div>
              <Badge variant={getTrendBadgeVariant(savingsData.summary.trend || 0)}>
                {savingsData.summary.trend > 0 ? 'Improving' : savingsData.summary.trend < 0 ? 'Declining' : 'Stable'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Chart with shadcn ChartContainer */}
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
              <Legend />
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

        {/* Savings Goals Section */}
        {savingsData.goals && savingsData.goals.length > 0 && (
          <div>
            <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--spacing-4xl)' }}>Savings Goals</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--spacing-4xl)' }}>
              {savingsData.goals.map((goal, index) => (
                <Card key={index} className="stat-card">
                  <CardContent>
                    <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{goal.name}</div>
                      <div style={{ fontSize: 'var(--font-size-lg)' }}>{goal.icon || '🎯'}</div>
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </div>
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--border-color)', marginBottom: 'var(--spacing-lg)' }}>
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%`, backgroundColor: 'var(--primary)' }}
                      ></div>
                    </div>
                    <Badge variant={goal.currentAmount >= goal.targetAmount ? "success" : "secondary"}>
                      {((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}% Complete
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavingsRateTracker;
