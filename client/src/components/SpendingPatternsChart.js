"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import formatCurrency from '../utils/formatCurrency';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import {
  Home,
  Car,
  Zap,
  Heart,
  Shirt,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3
} from 'lucide-react';
import '../styles/design-system.css';
import { ChartContainer } from './ui/chart';

// Dual Ledger token-based color palette for category lines
const tokenColors = [
  'var(--primary)',
  'var(--success)',
  'var(--warn)',
  'var(--danger)',
  'var(--ink)'
];

// Category icon mapping
const getCategoryIcon = (category) => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('mortgage') || categoryLower.includes('home')) {
    return { icon: Home, color: '#3b82f6' };
  } else if (categoryLower.includes('transport') || categoryLower.includes('car')) {
    return { icon: Car, color: '#ef4444' };
  } else if (categoryLower.includes('utilit')) {
    return { icon: Zap, color: '#06b6d4' };
  } else if (categoryLower.includes('healthcare') || categoryLower.includes('medical')) {
    return { icon: Heart, color: '#f59e0b' };
  } else if (categoryLower.includes('cloth') || categoryLower.includes('kid')) {
    return { icon: Shirt, color: '#8b5cf6' };
  } else if (categoryLower.includes('groc')) {
    return { icon: ShoppingCart, color: '#10b981' };
  }
  return { icon: BarChart3, color: '#64748b' };
};

const SpendingPatternsChart = ({ patterns = null }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processedPatterns, setProcessedPatterns] = useState(null);
  
  // Enhanced feature: State for toggling additional features
  const [showTotal, setShowTotal] = useState(false);
  const [showAverages, setShowAverages] = useState(false);
  const [averageSpending, setAverageSpending] = useState(0);


  useEffect(() => {
    if (patterns === null) {
      setLoading(true);
      return;
    }

    try {
      // Process the patterns data
      const processed = {};
      
      // Debug: Log the patterns data to understand its structure
      
      // Ensure patterns is an object
      if (typeof patterns !== 'object' || patterns === null) {
        throw new Error('Invalid patterns data format');
      }

      // Process each category
      Object.keys(patterns).forEach(category => {
        const categoryObject = patterns[category];
        
        // Extract the data array from the category object
        const categoryData = categoryObject?.data;
        
        if (!Array.isArray(categoryData) || categoryData.length === 0) {
          console.log(`Skipping category ${category}: no data array or empty`);
          return; // Skip empty categories
        }
        
        // Debug: Check what properties are available in the raw data
        console.log(`Raw data sample for ${category}:`, categoryData[0]);
        console.log(`Available properties:`, Object.keys(categoryData[0] || {}));

        // Sort data by date (using month field)
        const sortedData = [...categoryData].sort((a, b) => {
          return new Date(a.month) - new Date(b.month);
        });

        // Calculate trend (percentage change from first to last month)
        const firstAmount = sortedData[0].amount;
        const lastAmount = sortedData[sortedData.length - 1].amount;
        let trend = 0;
        
        if (firstAmount !== 0) {
          trend = ((lastAmount - firstAmount) / Math.abs(firstAmount)) * 100;
        }

        // Calculate fallback enhanced trend (weighted recent months more heavily)
        let enhancedTrend = 0;
        if (sortedData.length >= 3) {
          const recentMonths = sortedData.slice(-3);
          const firstRecentAmount = recentMonths[0].amount;
          const lastRecentAmount = recentMonths[recentMonths.length - 1].amount;
          if (firstRecentAmount !== 0) {
            enhancedTrend = ((lastRecentAmount - firstRecentAmount) / Math.abs(firstRecentAmount)) * 100;
          }
        }

        // Prefer backend enhanced metrics when available
        const backendEnhanced = categoryObject?.enhancedTrend;
        if (backendEnhanced && typeof backendEnhanced === 'object' && typeof backendEnhanced.percentageChange === 'number') {
          trend = backendEnhanced.percentageChange;
          enhancedTrend = backendEnhanced.percentageChange;
        }

        // Format the data for display
        const formattedData = sortedData.map(item => {
          console.log(`Formatting date for ${category}:`, item.month, typeof item.month);
          const dateObj = new Date(item.month);
          console.log(`Date object:`, dateObj, `Is valid:`, !isNaN(dateObj.getTime()));
          
          return {
            month: dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            amount: item.amount,
            date: dateObj
          };
        });

        processed[category] = {
          data: formattedData,
          trend: parseFloat(trend.toFixed(1)),
          enhancedTrend: parseFloat(enhancedTrend.toFixed(1)),
          enhanced: backendEnhanced || null,
          lastAmount: lastAmount,
          direction: typeof categoryObject?.trend === 'string' ? categoryObject.trend : null
        };
      });

      setProcessedPatterns(processed);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error processing patterns data:', err);
      setError('Failed to process spending patterns data');
      setLoading(false);
    }
  }, [patterns]);
  
  // Calculate averages for enhanced features
  // Transform data for Recharts with enhanced metrics
  const getChartData = useCallback(() => {
    if (!processedPatterns || Object.keys(processedPatterns).length === 0) {
      console.log('getChartData: No processed patterns available');
      return [];
    }

    const categories = Object.keys(processedPatterns).slice(0, 4);
    const allMonths = [...new Set(
      categories.flatMap(cat => processedPatterns[cat]?.data ? processedPatterns[cat].data.map(d => d.month) : [])
    )].sort((a, b) => {
      // Sort months chronologically
      const dateA = processedPatterns[categories[0]]?.data.find(d => d.month === a)?.date || new Date();
      const dateB = processedPatterns[categories[0]]?.data.find(d => d.month === b)?.date || new Date();
      return dateA - dateB;
    });
    
    // Transform data for Recharts format (month-based objects with category values)
    const finalChartData = allMonths.map(month => {
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
    
    console.log('getChartData: Final chart data:', finalChartData);
    console.log('getChartData: Chart data length:', finalChartData.length);
    return finalChartData;
  }, [processedPatterns]); // Only recreate when processedPatterns changes

  useEffect(() => {
    if (processedPatterns && Object.keys(processedPatterns).length > 0) {
      const chartData = getChartData();
      const totalAvg = chartData.reduce((sum, item) => sum + item.totalSpending, 0) / chartData.length;
      setAverageSpending(totalAvg);
      console.log('Average spending calculated:', totalAvg);
    }
  }, [processedPatterns, getChartData]);


  
  /**
   * Get trend indicator information based on trend value
   */
  const getTrendIndicator = (trend = 0, enhancedTrend = 0, direction = null) => {
    // Determine trend value percentage from enhanced object if present
    let trendValue = 0;
    if (enhancedTrend && typeof enhancedTrend === 'object' && typeof enhancedTrend.percentageChange === 'number') {
      trendValue = enhancedTrend.percentageChange;
    } else if (typeof enhancedTrend === 'number' && enhancedTrend !== 0) {
      trendValue = enhancedTrend;
    } else {
      trendValue = typeof trend === 'number' ? trend : 0;
    }
    
    if (trendValue > 15) {
      return { icon: TrendingUp, label: 'Sharp Increase', color: 'var(--danger)' };
    } else if (trendValue > 5) {
      return { icon: TrendingUp, label: 'Increasing', color: 'var(--warn)' };
    } else if (trendValue > -5) {
      return { icon: Minus, label: 'Stable', color: 'var(--success)' };
    } else if (trendValue > -15) {
      return { icon: TrendingDown, label: 'Decreasing', color: 'var(--muted)' };
    } else {
      return { icon: TrendingDown, label: 'Sharp Decrease', color: 'var(--primary)' };
    }
  };

  /**
   * Get confidence level and insight text based on data quality
   */
  const getConfidenceInfo = (categoryData = [], enhanced = null) => {
    // Prefer backend-provided confidence when available
    if (enhanced && typeof enhanced === 'object' && typeof enhanced.confidence === 'number') {
      const level = Math.max(0, Math.min(100, enhanced.confidence));
      let text = 'Limited data available';
      if (level >= 80) text = 'Strong data foundation with recent activity';
      else if (level >= 60) text = 'Moderate data with recent trends';
      else if (level > 0) text = 'Limited data available';
      else text = 'Not enough data to calculate trend';
      return { level, text };
    }

    // Fallback heuristic if backend confidence is not available
    if (!categoryData || categoryData.length === 0) {
      return { level: 0, text: 'Not enough data to calculate trend' };
    }

    const dataPoints = categoryData.length;
    const hasRecentData = categoryData.some(item => {
      const itemDate = new Date(item.date || item.month);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return itemDate >= threeMonthsAgo;
    });

    if (dataPoints >= 6 && hasRecentData) {
      return { level: 85, text: 'Strong data foundation with recent activity' };
    } else if (dataPoints >= 3 && hasRecentData) {
      return { level: 65, text: 'Moderate data with recent trends' };
    } else if (dataPoints >= 2) {
      return { level: 45, text: 'Limited data available' };
    } else {
      return { level: 0, text: 'Not enough data to calculate trend' };
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="section-title">📊 Spending Patterns</h3>
          <div className="chart-subtitle">Monthly spending trends by category</div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p style={{ 
            fontSize: 'var(--font-size-sm)',
            color: 'var(--muted)',
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
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="section-title">📊 Spending Patterns</h3>
          <div className="chart-subtitle">Monthly spending trends by category</div>
        </div>
        <div className="banner banner-danger" style={{ marginTop: 'var(--spacing-md)' }}>
          <div className="icon">⚠️</div>
          <div>{error}</div>
        </div>
        <button 
          className="btn"
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              setError(null);
            }, 1000);
          }}
          style={{ marginTop: 'var(--spacing-lg)' }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Render empty state
  if (!processedPatterns || Object.keys(processedPatterns).length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="section-title">📊 Spending Patterns</h3>
          <div className="chart-subtitle">Monthly spending trends by category</div>
        </div>
        <div className="empty-container">
          <div className="empty-icon">📈</div>
          <p style={{ 
            fontSize: 'var(--font-size-sm)',
            color: 'var(--muted)',
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
  const renderCategories = Object.keys(processedPatterns || {}).slice(0, 4);
  console.log('Render categories:', renderCategories);
  
  return (
    <Card className="chart-card" style={{ paddingBlock: 'var(--spacing-6xl)' }}>
      <CardHeader>
        <CardTitle className="section-title">📊 Spending Patterns</CardTitle>
        <div className="chart-subtitle">Monthly spending trends by category</div>
      </CardHeader>
      <CardContent>
      {/* <div className="chart-container" style={{ 
        height: '280px', 
        flexShrink: 0,
        marginBottom: 'var(--spacing-8xl)'
      }}> */}
      <ChartContainer /* config={chartConfig} */ className="h-80" style={{ marginBottom: 'var(--spacing-6xl)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={getChartData()} 
          >
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
              tickFormatter={(value) => formatCurrency(value).replace('$', '')}
            />
            <Tooltip 
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: 'var(--spacing-md)',
                minWidth: '220px',
                maxWidth: '300px'
              }}
              labelStyle={{
                color: 'var(--ink)',
                marginBottom: 'var(--spacing-sm)',
                fontSize: 'var(--font-size-sm)',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: 'var(--spacing-xs)'
              }}
              itemStyle={{
                color: 'var(--muted)',
                fontSize: 'var(--font-size-xs)',
                padding: 'var(--spacing-xs) 0'
              }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                
                return (
                  <div style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                    minWidth: '200px',
                    maxWidth: '280px',
                    color: 'var(--ink)',
                    fontFamily: 'inherit'
                  }}>
                    {/* Month Label */}
                    <div style={{ 
                      fontWeight: 600, 
                      color: 'var(--ink)',
                      marginBottom: 'var(--spacing-sm)',
                      fontSize: 'var(--font-size-sm)',
                      borderBottom: '1px solid var(--border-color)',
                      paddingBottom: 'var(--spacing-xs)'
                    }}>
                      {label}
                    </div>

                    {/* Category Spending */}
                    {payload.map((entry, index) => {
                      if (entry.dataKey === 'totalSpending' || entry.dataKey === 'changePercentage') return null;
                      
                      return (
                        <div key={index} style={{ 
                          marginBottom: 'var(--spacing-lg)',
                          gap: 'var(--spacing-xs)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-xs)',
                          }}>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: entry.color
                            }}></div>
                            <span style={{ color: 'var(--muted)' }}>{entry.dataKey}: </span>
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                            {formatCurrency(entry.value)}
                          </span>
                        </div>
                      );
                    })}

                    {/* Total Spending */}
                    {payload.find(p => p.dataKey === 'totalSpending') && (
                      <div style={{
                        marginTop: 'var(--spacing-lg)',
                        paddingTop: 'var(--spacing-lg)',
                        borderTop: '1px solid var(--border-color)',
                        color: 'var(--muted)',
                        gap: 'var(--spacing-xs)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: payload.find(p => p.dataKey === 'totalSpending')?.color
                          }}></div>
                          <span>Total:</span>
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                          {formatCurrency(payload.find(p => p.dataKey === 'totalSpending')?.value || 0)}
                        </span>
                      </div>
                    )}

                    {/* Change Percentage */}
                    {payload.find(p => p.dataKey === 'changePercentage') && (
                      <div style={{
                        marginTop: 'var(--spacing-sm)',
                        color: 'var(--muted)',
                        fontSize: 'var(--font-size-xs)'
                      }}>
                        Month-over-month: {payload.find(p => p.dataKey === 'changePercentage')?.value?.toFixed(1) || 0}%
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <Legend 
              wrapperStyle={{ fontFamily: 'var(--font-primary)', fontSize: '12px' }}
            />
            

            
            {/* Enhanced feature: Add reference line for total spending */}
            {showTotal && (
              <ReferenceLine 
                y={getChartData().reduce((max, item) => Math.max(max, item.totalSpending || 0), 0) * 0.8} 
                stroke="var(--primary)" 
                strokeWidth={2}
                strokeDasharray="5 5" 
                label={{
                  value: `Avg Total: ${formatCurrency(getChartData().reduce((sum, item) => sum + (item.totalSpending || 0), 0) / Math.max(getChartData().length, 1))}`,
                  position: 'topLeft',
                  offset: 10,
                  fill: 'var(--primary)',
                  fontSize: 12,
                  fontWeight: 600,
                  style: {
                    textAnchor: 'start',
                    dominantBaseline: 'middle'
                  }
                }}
              />
            )}
            
            {/* Enhanced feature: Add reference line for average spending */}
            {showAverages && (
              <ReferenceLine 
                y={averageSpending} 
                stroke="var(--success)" 
                strokeWidth={2}
                strokeDasharray="3 3" 
                label={{
                  value: `Avg: ${formatCurrency(averageSpending)}`,
                  position: 'topRight',
                  offset: 10,
                  fill: 'var(--success)',
                  fontSize: 12,
                  fontWeight: 600,
                  style: {
                    textAnchor: 'start',
                    dominantBaseline: 'middle'
                  }
                }}
              />
            )}
            
            {/* Main category lines */}
            {renderCategories.map((category, index) => {
              const colors = tokenColors;
              return (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  strokeWidth={2}
                  stroke={colors[index % colors.length]}
                  dot={{ r: 4, strokeWidth: 1, fill: colors[index % colors.length], stroke: 'var(--surface)' }}
                  activeDot={{ r: 6, strokeWidth: 1, fill: colors[index % colors.length], stroke: 'var(--surface)' }}
                  animationDuration={500}
                  animationEasing="ease-out"
                />
              );
            })}
            
            {/* Enhanced feature: Optional total spending line */}
            {showTotal && (
              <Line
                type="monotone"
                dataKey="totalSpending"
                strokeWidth={3}
                stroke="var(--danger)"
                strokeDasharray="5 5"
                dot={false}
                animationDuration={500}
                animationEasing="ease-out"
              />
            )}
            

          </LineChart>
        </ResponsiveContainer>
        
        {/* Enhanced feature: Chart controls */}
        <div className="chart-controls" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 12,
          marginTop: '-20px',
          padding: 'var(--spacing-sm)',
          maxWidth: 'fit-content',
          margin: '0px auto var(--spacing-md)'
        }}>
          <button 
            className="control-button btn"
            onClick={() => setShowTotal(!showTotal)}
            aria-pressed={showTotal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg)',
              border: `1px solid ${showTotal ? 'var(--primary)' : 'var(--border-color)'}`,
              padding: '6px 12px',
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 700,
              color: showTotal ? 'var(--ink)' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: 9999, background: 'var(--danger)', display: 'inline-block' }} />
            Total
          </button>
          <button 
            className="control-button btn"
            onClick={() => setShowAverages(!showAverages)}
            aria-pressed={showAverages}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg)',
              border: `1px solid ${showAverages ? 'var(--primary)' : 'var(--border-color)'}`,
              padding: '6px 12px',
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 700,
              color: showAverages ? 'var(--ink)' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: 9999, background: 'var(--success)', display: 'inline-block' }} />
            Averages
          </button>
        </div>
        
      </ChartContainer>
      {/* </div> */}
      
      <div className="stats-container" style={{
        flex: 1,
        marginTop: '3.5rem'
      }}>
        <div className="stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--spacing-lg)',
          overflowY: 'auto',
          overflowX: 'hidden',
          maxHeight: '600px',
          padding: 'var(--spacing-lg)'
        }}>
        {Object.entries(processedPatterns || {}).slice(0, 6).map(([category, pattern]) => {
          const trendInfo = getTrendIndicator(
            pattern?.trend,
            (pattern?.enhanced || pattern?.enhancedTrend),
            pattern?.direction
          );
          const categoryIcon = getCategoryIcon(category);
          const categoryData = pattern?.data || [];
          
          // Calculate metrics for the new design
          const { level: confidenceLevel, text: confidenceText } = getConfidenceInfo(categoryData, pattern?.enhanced);
          
          // Calculate strength as percentage change magnitude
          const strengthValue = typeof pattern?.enhanced?.normalizedStrength === 'number'
            ? pattern.enhanced.normalizedStrength
            : Math.abs(pattern?.enhancedTrend || pattern?.trend || 0);
          
          return (
            <Card key={category} className="stat-card" style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '4px 4px 8px var(--shadow-color)',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <div className="stat-header" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div className="category-info" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div className="category-icon" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${categoryIcon.color}20`,
                    color: categoryIcon.color,
                    boxShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {React.createElement(categoryIcon.icon, { size: 20 })}
                  </div>
                  <div className="category-name" style={{
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: 'var(--ink)'
                  }}>
                    {category}
                  </div>
                </div>
                <div className="trend-indicator" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  backgroundColor: `${trendInfo.color}20`,
                  color: trendInfo.color
                }}>
                  {React.createElement(trendInfo.icon, { size: 14 })}
                  {trendInfo.label}
                </div>
              </div>
              
              <div className="stat-metrics" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div className="metric" style={{ textAlign: 'center' }}>
                  <div className="metric-label" style={{
                    fontSize: '0.75rem',
                    color: 'var(--muted)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.25rem'
                  }}>
                    Strength
                  </div>
                  <div className="metric-value" style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--ink)'
                  }}>
                    {strengthValue.toFixed(1)}%
                  </div>
                </div>
                <div className="metric" style={{ textAlign: 'center' }}>
                  <div className="metric-label" style={{
                    fontSize: '0.75rem',
                    color: 'var(--muted)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.25rem'
                  }}>
                    Change
                  </div>
                  <div className="metric-value" style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--ink)'
                  }}>
                    {(
                      typeof pattern?.enhanced?.percentageChange === 'number'
                        ? pattern.enhanced.percentageChange
                        : (pattern?.enhancedTrend || pattern?.trend || 0)
                    ).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="confidence-bar" style={{
                width: '100%',
                height: '4px',
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '2px',
                overflow: 'hidden',
                marginBottom: '0.5rem'
              }}>
                <div className="confidence-fill" style={{
                  height: '100%',
                  borderRadius: '2px',
                  backgroundColor: confidenceLevel > 70 ? 'var(--success)' : 
                                   confidenceLevel > 40 ? 'var(--warn)' : 'var(--danger)',
                  width: `${confidenceLevel}%`,
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              
              <div className="insight-text" style={{
                fontSize: '0.8rem',
                color: 'var(--muted)',
                fontStyle: 'italic',
                lineHeight: 1.4
              }}>
                {confidenceText}
              </div>
            </Card>
          );
        })}
        </div>
      </div>
      </CardContent>
    </Card>
  );
};

export default SpendingPatternsChart;
