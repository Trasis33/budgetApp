"use client"

import React, { useState, useEffect, useRef } from 'react';
import formatCurrency from '../utils/formatCurrency';
import { modernColors } from '../utils/chartConfig';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  Brush
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend
} from "@/components/ui/chart";
import '../styles/design-system.css';

/**
 * SpendingPatternsChart - Enhanced version with shadcn/ui and Recharts
 * 
 * This component visualizes spending patterns across different categories over time.
 * Enhanced features include:
 * - Time range selection with brush
 * - Toggle controls for total spending and averages
 * - Month-over-month change percentage
 * - Expanded stats grid with additional metrics
 * 
 * @param {Object} props - Component props
 * @param {Array|Object} props.patterns - Spending patterns data
 */
const SpendingPatternsChart = ({ patterns = null }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processedPatterns, setProcessedPatterns] = useState(null);
  
  // Enhanced feature: State for toggling additional features
  const [showTotal, setShowTotal] = useState(false);
  const [showAverages, setShowAverages] = useState(false);
  const [averageSpending, setAverageSpending] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);
  const [hoveredMonth, setHoveredMonth] = useState(null);

  useEffect(() => {
    if (!patterns) {
      setLoading(false);
      setProcessedPatterns(null);
      return;
    }

    try {
      setLoading(true);
      
      // Process the patterns data
      const processed = {};
      
      Object.entries(patterns).forEach(([category, data]) => {
        if (!data || !Array.isArray(data.monthly)) {
          return;
        }
        
        const monthlyData = data.monthly.map(item => ({
          month: item.month,
          amount: parseFloat(item.amount) || 0
        }));
        
        // Calculate trend
        let trend = 0;
        let enhancedTrend = 0;
        let lastAmount = 0;
        
        if (monthlyData.length >= 2) {
          const lastMonth = monthlyData[monthlyData.length - 1];
          const previousMonth = monthlyData[monthlyData.length - 2];
          
          lastAmount = lastMonth.amount;
          
          if (previousMonth.amount > 0) {
            trend = ((lastMonth.amount - previousMonth.amount) / previousMonth.amount) * 100;
          }
          
          // Enhanced trend calculation using more historical data
          if (monthlyData.length >= 4) {
            const last3Months = monthlyData.slice(-3);
            const previous3Months = monthlyData.slice(-6, -3);
            
            const last3MonthsAvg = last3Months.reduce((sum, item) => sum + item.amount, 0) / last3Months.length;
            const previous3MonthsAvg = previous3Months.reduce((sum, item) => sum + item.amount, 0) / previous3Months.length;
            
            if (previous3MonthsAvg > 0) {
              enhancedTrend = ((last3MonthsAvg - previous3MonthsAvg) / previous3MonthsAvg) * 100;
            }
          }
        }
        
        processed[category] = {
          data: monthlyData,
          trend,
          enhancedTrend,
          lastAmount
        };
      });
      
      setProcessedPatterns(processed);
      setError(null);
    } catch (err) {
      console.error('Error processing spending patterns:', err);
      setError('Failed to process spending patterns data');
    } finally {
      setLoading(false);
    }
  }, [patterns]);
  
  // Calculate averages for enhanced features
  useEffect(() => {
    if (processedPatterns && Object.keys(processedPatterns).length > 0) {
      const chartData = getChartData();
      const totalAvg = chartData.reduce((sum, item) => sum + item.totalSpending, 0) / chartData.length;
      setAverageSpending(totalAvg);
    }
  }, [processedPatterns]);

  /**
   * Transform data for Recharts format with enhanced metrics
   */
  const getChartData = () => {
    if (!processedPatterns || Object.keys(processedPatterns).length === 0) {
      return [];
    }

    const categories = Object.keys(processedPatterns).slice(0, 4);
    const allMonths = [...new Set(
      categories.flatMap(cat => processedPatterns[cat]?.data ? processedPatterns[cat].data.map(d => d.month) : [])
    )].sort();
    
    // Transform data for Recharts format (month-based objects with category values)
    return allMonths.map(month => {
      const monthData = { month };
      
      // Add category values
      categories.forEach(category => {
        const categoryData = processedPatterns[category]?.data || [];
        const monthEntry = categoryData.find(d => d.month === month);
        monthData[category] = monthEntry ? monthEntry.amount : 0;
      });
      
      // Add enhanced data points for better insights
      monthData.totalSpending = categories.reduce((sum, category) => {
        return sum + (monthData[category] || 0);
      }, 0);
      
      // Add month-over-month change percentage for total spending
      if (allMonths.indexOf(month) > 0) {
        const prevMonth = allMonths[allMonths.indexOf(month) - 1];
        const prevMonthData = allMonths.map(m => {
          const mData = { month: m };
          categories.forEach(category => {
            const categoryData = processedPatterns[category]?.data || [];
            const monthEntry = categoryData.find(d => d.month === m);
            mData[category] = monthEntry ? monthEntry.amount : 0;
          });
          return mData;
        }).find(d => d.month === prevMonth);
        
        const prevTotal = categories.reduce((sum, category) => {
          return sum + (prevMonthData[category] || 0);
        }, 0);
        
        monthData.changePercentage = prevTotal > 0 ? 
          ((monthData.totalSpending - prevTotal) / prevTotal) * 100 : 0;
      } else {
        monthData.changePercentage = 0;
      }
      
      return monthData;
    });
  };
  
  // Chart configuration for shadcn
  const chartConfig = {
    ...Object.keys(processedPatterns || {}).slice(0, 4).reduce((acc, category, index) => {
      const colors = [modernColors.primary, modernColors.secondary, modernColors.success, modernColors.warning, modernColors.error];
      acc[category] = {
        label: category,
        color: colors[index % colors.length]
      };
      return acc;
    }, {}),
    totalSpending: {
      label: 'Total Spending',
      color: 'var(--color-accent)',
      hidden: true
    },
    changePercentage: {
      label: 'MoM Change %',
      color: 'var(--color-info)',
      hidden: true
    }
  };
  
  // Get categories for lines
  const categories = processedPatterns ? Object.keys(processedPatterns).slice(0, 4) : [];
  
  /**
   * Handle mouse move for interactive features
   */
  const handleMouseMove = (e) => {
    if (e && e.activeTooltipIndex !== undefined) {
      const chartData = getChartData();
      if (chartData[e.activeTooltipIndex]) {
        setHoveredMonth(chartData[e.activeTooltipIndex].month);
      }
    }
  };
  
  /**
   * Get trend indicator information based on trend value
   */
  const getTrendIndicator = (trend = 0, enhancedTrend = 0) => {
    // Use enhanced trend if available, otherwise fall back to regular trend
    const trendValue = enhancedTrend !== 0 ? enhancedTrend : trend;
    
    if (trendValue > 15) {
      return { icon: '↑↑', label: 'Sharp Increase', color: 'var(--color-error)' };
    } else if (trendValue > 5) {
      return { icon: '↑', label: 'Increasing', color: 'var(--color-warning)' };
    } else if (trendValue > -5) {
      return { icon: '→', label: 'Stable', color: 'var(--color-success)' };
    } else if (trendValue > -15) {
      return { icon: '↓', label: 'Decreasing', color: 'var(--color-info)' };
    } else {
      return { icon: '↓↓', label: 'Sharp Decrease', color: 'var(--color-primary)' };
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="chart-card glass-effect hover-lift">
        <div className="chart-header">
          <h3 className="chart-title text-gradient">📊 Spending Patterns</h3>
          <div className="chart-subtitle">Monthly spending trends by category</div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p style={{ 
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            marginTop: 'var(--spacing-lg)'
          }}>
            Loading spending patterns...
          </p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="chart-card glass-effect hover-lift">
        <div className="chart-header">
          <h3 className="chart-title text-gradient">📊 Spending Patterns</h3>
          <div className="chart-subtitle">Monthly spending trends by category</div>
        </div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p style={{ 
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-error)',
            marginTop: 'var(--spacing-md)'
          }}>
            {error}
          </p>
          <button 
            className="retry-button glass-effect"
            onClick={() => {
              setLoading(true);
              // Retry loading data
              setTimeout(() => {
                // This would normally be a re-fetch of data
                setLoading(false);
                setError(null);
              }, 1000);
            }}
            style={{
              marginTop: 'var(--spacing-lg)',
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              borderRadius: 'var(--border-radius-md)',
              border: 'none',
              background: 'var(--color-primary-transparent)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!processedPatterns || Object.keys(processedPatterns).length === 0) {
    return (
      <div className="chart-card glass-effect hover-lift">
        <div className="chart-header">
          <h3 className="chart-title text-gradient">📊 Spending Patterns</h3>
          <div className="chart-subtitle">Monthly spending trends by category</div>
        </div>
        <div className="empty-container">
          <div className="empty-icon">📈</div>
          <p style={{ 
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            marginTop: 'var(--spacing-md)',
            textAlign: 'center'
          }}>
            No spending pattern data available yet.<br />
            Start tracking your expenses to see trends over time.
          </p>
        </div>
      </div>
    );
  }
  
  // Main render with chart and stats
  return (
    <div className="chart-card glass-effect hover-lift" style={{
      display: 'flex',
      flexDirection: 'column',
      padding: 'var(--spacing-xl)',
      borderRadius: 'var(--border-radius-lg)',
      background: 'var(--color-background-card)',
      boxShadow: 'var(--shadow-md)',
      gap: 'var(--spacing-lg)',
      height: '100%',
      overflow: 'hidden'
    }}>
      <div className="chart-header" style={{ flexShrink: 0 }}>
        <h3 className="chart-title text-gradient">📊 Spending Patterns</h3>
        <div className="chart-subtitle">Monthly spending trends by category</div>
      </div>
      
      <div className="chart-container" style={{ 
        height: '280px', 
        flexShrink: 0,
        marginBottom: 'var(--spacing-3xl)'
      }}>
        <ChartContainer config={chartConfig}>
          <LineChart 
            data={getChartData()} 
            margin={{ top: 10, right: 10, left: 5, bottom: 10 }}
            onMouseMove={handleMouseMove}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(203, 213, 225, 0.3)" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 9, fontFamily: 'var(--font-primary)', fill: '#897bceff' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 9, fontFamily: 'var(--font-primary)', fill: '#897bceff' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatCurrency(value).replace('$', '')}
            />
            <ChartTooltip 
              content={({ active, payload }) => (
                <ChartTooltipContent 
                  active={active} 
                  payload={payload} 
                  formatter={(value, name) => {
                    if (name === 'changePercentage') {
                      return (
                        <span style={{ fontFamily: 'var(--font-primary)' }}>
                          {value.toFixed(1)}%
                        </span>
                      );
                    }
                    return (
                      <span style={{ fontFamily: 'var(--font-primary)' }}>
                        {formatCurrency(value)}
                      </span>
                    );
                  }}
                />
              )}
            />
            <ChartLegend />
            
            {/* Enhanced feature: Add a brush for time range selection */}
            <Brush 
              dataKey="month" 
              height={30} 
              stroke="var(--color-primary)" 
              fill="var(--color-background-secondary)" 
              tickFormatter={(value) => value}
              onChange={(brushRange) => {
                if (brushRange && brushRange.startIndex !== undefined && brushRange.endIndex !== undefined) {
                  const chartData = getChartData();
                  setSelectedTimeRange({
                    start: chartData[brushRange.startIndex].month,
                    end: chartData[brushRange.endIndex].month
                  });
                }
              }}
            />
            
            {/* Enhanced feature: Add reference line for average spending */}
            {showAverages && (
              <ReferenceLine 
                y={averageSpending} 
                stroke="var(--color-info)" 
                strokeDasharray="3 3" 
                label={{
                  value: 'Avg',
                  position: 'right',
                  fill: 'var(--color-info)',
                  fontSize: 10
                }}
              />
            )}
            
            {/* Main category lines */}
            {categories.map((category, index) => (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 1, fill: `var(--color-${category})`, stroke: '#ffffff' }}
                activeDot={{ r: 6, strokeWidth: 1, fill: `var(--color-${category})`, stroke: '#ffffff' }}
              />
            ))}
            
            {/* Enhanced feature: Optional total spending line */}
            {showTotal && (
              <Line
                type="monotone"
                dataKey="totalSpending"
                strokeWidth={2.5}
                stroke="var(--color-accent)"
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        </ChartContainer>
        
        {/* Enhanced feature: Chart controls */}
        <div className="chart-controls" style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 'var(--spacing-sm)',
          marginTop: 'var(--spacing-sm)'
        }}>
          <button 
            className="control-button glass-effect"
            onClick={() => setShowTotal(!showTotal)}
            style={{
              fontSize: 'var(--font-size-xs)',
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              borderRadius: 'var(--border-radius-sm)',
              border: 'none',
              background: showTotal ? 'var(--color-accent-transparent)' : 'var(--color-background-secondary)',
              color: 'var(--color-text-primary)'
            }}
          >
            {showTotal ? '✓ Total' : '◯ Total'}
          </button>
          <button 
            className="control-button glass-effect"
            onClick={() => setShowAverages(!showAverages)}
            style={{
              fontSize: 'var(--font-size-xs)',
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              borderRadius: 'var(--border-radius-sm)',
              border: 'none',
              background: showAverages ? 'var(--color-info-transparent)' : 'var(--color-background-secondary)',
              color: 'var(--color-text-primary)'
            }}
          >
            {showAverages ? '✓ Averages' : '◯ Averages'}
          </button>
        </div>
        
        {/* Time range selection info */}
        {selectedTimeRange && (
          <div className="time-range-info" style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            marginTop: 'var(--spacing-xs)',
            textAlign: 'center'
          }}>
            Viewing: {selectedTimeRange.start} to {selectedTimeRange.end}
          </div>
        )}
      </div>
      
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--spacing-lg)',
        flex: 1,
        overflowY: 'auto',
        maxHeight: '300px'
      }}>
        {Object.entries(processedPatterns || {}).slice(0, 6).map(([category, pattern]) => {
          const trendInfo = getTrendIndicator(pattern?.trend, pattern?.enhancedTrend);
          
          // Enhanced feature: Calculate additional metrics
          const categoryData = pattern?.data || [];
          const totalSpent = categoryData.reduce((sum, item) => sum + item.amount, 0);
          const avgSpent = categoryData.length > 0 ? totalSpent / categoryData.length : 0;
          const maxSpent = categoryData.length > 0 ? Math.max(...categoryData.map(item => item.amount)) : 0;
          const maxMonth = categoryData.find(item => item.amount === maxSpent)?.month || '';
          
          return (
            <div key={category} className="stat-card glass-effect">
              <div className="stat-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-sm)'
              }}>
                <h4 style={{
                  margin: 0,
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-primary)'
                }}>{category}</h4>
                <div className="trend-indicator" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)',
                  fontSize: 'var(--font-size-sm)',
                  color: trendInfo.color
                }}>
                  {trendInfo.icon} {trendInfo.label}
                </div>
              </div>
              
              <div className="stat-body" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-xs)'
              }}>
                <div className="stat-row" style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    Average:
                  </span>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    {formatCurrency(avgSpent)}
                  </span>
                </div>
                
                <div className="stat-row" style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    Highest:
                  </span>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    {formatCurrency(maxSpent)}
                  </span>
                </div>
                
                {maxMonth && (
                  <div className="stat-row" style={{
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      Peak Month:
                    </span>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      {maxMonth}
                    </span>
                  </div>
                )}
                
                <div className="stat-row" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 'var(--spacing-xs)',
                  paddingTop: 'var(--spacing-xs)',
                  borderTop: '1px solid var(--color-border)'
                }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    Last Month:
                  </span>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    {formatCurrency(pattern?.lastAmount || 0)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpendingPatternsChart;