import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import { useScope } from '@/context/ScopeContext';

interface AnalyticsWithScopeProps {
  onNavigate: (view: string) => void;
}

export const AnalyticsWithScope: React.FC<AnalyticsWithScopeProps> = ({ onNavigate }) => {
  const { currentScope, isPartnerConnected, isLoading } = useScope();
  const [timeRange, setTimeRange] = useState('3months');
  const [chartType, setChartType] = useState('spending');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[oklch(var(--theme-teal))] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const scopeTitle = currentScope === 'ours' ? 'Our' : currentScope === 'mine' ? 'My' : "Partner's";
  
  const mockAnalyticsData = {
    totalSpent: 3245.67,
    totalBudget: 5000.00,
    savingsRate: 35.1,
    topCategory: 'Food',
    monthlyTrend: 12.3,
    categories: [
      { name: 'Food', amount: 892.45, percentage: 27.5 },
      { name: 'Housing', amount: 1200.00, percentage: 37.0 },
      { name: 'Transportation', amount: 456.78, percentage: 14.1 },
      { name: 'Entertainment', amount: 345.67, percentage: 10.6 },
      { name: 'Other', amount: 350.77, percentage: 10.8 }
    ]
  };

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? (
      <TrendingUp className="h-4 w-4 text-[oklch(var(--theme-coral))]" />
    ) : (
      <TrendingDown className="h-4 w-4 text-[oklch(var(--theme-teal))]" />
    );
  };

  const getTrendColor = (trend: number) => {
    return trend > 0 ? 'text-[oklch(var(--theme-coral))]' : 'text-[oklch(var(--theme-teal))]';
  };

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          {scopeTitle} Analytics
        </h1>
        <p className="text-muted-foreground">
          Track spending patterns and insights for your {currentScope} budget
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">Time Range:</label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">Chart Type:</label>
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spending">Spending</SelectItem>
              <SelectItem value="savings">Savings Rate</SelectItem>
              <SelectItem value="categories">Categories</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-foreground">
                  ${mockAnalyticsData.totalSpent.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-[oklch(var(--theme-teal))]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget</p>
                <p className="text-2xl font-bold text-foreground">
                  ${mockAnalyticsData.totalBudget.toFixed(2)}
                </p>
              </div>
              <PieChart className="h-8 w-8 text-[oklch(var(--theme-teal))]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Savings Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {mockAnalyticsData.savingsRate}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-[oklch(var(--theme-teal))]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Trend</p>
                <p className={`text-2xl font-bold ${getTrendColor(mockAnalyticsData.monthlyTrend)}`}>
                  {Math.abs(mockAnalyticsData.monthlyTrend)}%
                </p>
              </div>
              {getTrendIcon(mockAnalyticsData.monthlyTrend)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalyticsData.categories.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{category.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ${category.amount.toFixed(2)} ({category.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-[oklch(var(--theme-teal))] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Top Spending Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">
                {mockAnalyticsData.topCategory}
              </div>
              <p className="text-muted-foreground mb-4">
                ${mockAnalyticsData.categories.find(c => c.name === mockAnalyticsData.topCategory)?.amount.toFixed(2)} 
                <span className="text-sm text-muted-foreground ml-2">
                  ({mockAnalyticsData.categories.find(c => c.name === mockAnalyticsData.topCategory)?.percentage}%)
                </span>
              </p>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-[oklch(var(--theme-teal))] to-[oklch(var(--theme-teal)/0.8)] h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${mockAnalyticsData.categories.find(c => c.name === mockAnalyticsData.topCategory)?.percentage}%` 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights for {scopeTitle} Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-[oklch(var(--theme-indigo)/0.1)] rounded-lg">
              <div className="w-2 h-2 rounded-full bg-[oklch(var(--theme-indigo))] mt-2" />
              <div>
                <h4 className="font-medium text-foreground">Spending Trend</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your spending has increased by {Math.abs(mockAnalyticsData.monthlyTrend)}% compared to last month. 
                  Consider reviewing your {mockAnalyticsData.topCategory.toLowerCase()} expenses.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-[oklch(var(--theme-teal)/0.1)] rounded-lg">
              <div className="w-2 h-2 rounded-full bg-[oklch(var(--theme-teal))] mt-2" />
              <div>
                <h4 className="font-medium text-foreground">Good Savings Rate</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  You're saving {mockAnalyticsData.savingsRate}% of your income, which is above the recommended 20%. 
                  Keep up the great work!
                </p>
              </div>
            </div>

            {!isPartnerConnected && currentScope === 'ours' && (
              <div className="flex items-start gap-3 p-4 bg-[oklch(var(--theme-amber)/0.1)] rounded-lg">
                <div className="w-2 h-2 rounded-full bg-[oklch(var(--theme-amber))] mt-2" />
                <div>
                  <h4 className="font-medium text-foreground">Partner Not Connected</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Once your partner connects, you'll be able to see shared analytics and insights for your combined finances.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsWithScope;
