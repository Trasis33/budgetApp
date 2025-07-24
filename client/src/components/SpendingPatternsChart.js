"use client"

import React, { useState, useEffect, useCallback } from 'react';
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
} from "./ui/chart.jsx";
import '../styles/design-system.css';

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

        // Calculate enhanced trend (weighted recent months more heavily)
        let enhancedTrend = 0;
        if (sortedData.length >= 3) {
          const recentMonths = sortedData.slice(-3);
          const firstRecentAmount = recentMonths[0].amount;
          const lastRecentAmount = recentMonths[recentMonths.length - 1].amount;
          
          if (firstRecentAmount !== 0) {
            enhancedTrend = ((lastRecentAmount - firstRecentAmount) / Math.abs(firstRecentAmount)) * 100;
          }
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
          lastAmount: lastAmount
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
  const renderCategories = Object.keys(processedPatterns || {}).slice(0, 4);
  console.log('Render categories:', renderCategories);
  
  return (
    <div className="chart-card hover-lift">
      <div className="chart-header" style={{ flexShrink: 0 }}>
        <h3 className="chart-title text-gradient">📊 Spending Patterns</h3>
        <div className="chart-subtitle">Monthly spending trends by category</div>
      </div>
      
      <div className="chart-container" style={{ 
        height: '280px', 
        flexShrink: 0,
        marginBottom: 'var(--spacing-3xl)'
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={getChartData()} 
            margin={{ top: 15, right: 40, left: 15, bottom: 40 }} 
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
            <Tooltip 
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                
                return (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'var(--backdrop-blur)',
                    WebkitBackdropFilter: 'var(--backdrop-blur)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: 'var(--spacing-3xl)',
                    boxShadow: 'var(--shadow-lg)',
                    fontSize: 'var(--font-size-sm)',
                    minWidth: '200px'
                  }}>
                    {/* Month Label */}
                    <div style={{ 
                      fontWeight: 600, 
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--spacing-lg)',
                      fontSize: 'var(--font-size-base)'
                    }}>
                      {label}
                    </div>

                    {/* Category Spending */}
                    {payload.map((entry, index) => {
                      if (entry.dataKey === 'totalSpending' || entry.dataKey === 'changePercentage') return null;
                      
                      return (
                        <div key={index} style={{ 
                          marginBottom: 'var(--spacing-lg)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--spacing-xs)'
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: entry.color
                          }}></div>
                          <span style={{ color: 'var(--color-text-secondary)' }}>{entry.dataKey}: </span>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
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
                        color: 'var(--color-text-secondary)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Total:</span>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {formatCurrency(payload.find(p => p.dataKey === 'totalSpending')?.value || 0)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Change Percentage */}
                    {payload.find(p => p.dataKey === 'changePercentage') && (
                      <div style={{
                        marginTop: 'var(--spacing-sm)',
                        color: 'var(--color-text-secondary)',
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
            
            {/* Enhanced feature: Add a brush for time range selection */}
            <Brush 
              dataKey="month" 
              height={30} 
              stroke="var(--color-primary)" 
              fill="rgba(139, 92, 246, 0.1)"
              travellerWidth={8}
              style={{
                '.recharts-brush-slide': {
                  fill: 'var(--bg-card)',
                  stroke: 'var(--border-color)',
                  strokeWidth: 1
                },
                '.recharts-brush-traveller': {
                  fill: 'var(--color-primary)',
                  stroke: 'var(--color-primary)',
                  strokeWidth: 2
                },
                '.recharts-brush-texts': {
                  fill: 'var(--color-text-primary)',
                  fontSize: '12px'
                }
              }}
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
                stroke="#00ff00" 
                strokeWidth={2}
                strokeDasharray="3 3" 
                label={{
                  value: `Avg: ${formatCurrency(averageSpending)}`,
                  position: 'topRight',
                  offset: 10,
                  fill: '#00ff00',
                  fontSize: 12,
                  fontWeight: 500,
                  style: {
                    textAnchor: 'start',
                    dominantBaseline: 'middle'
                  }
                }}
              />
            )}
            
            {/* Debug: Log average line rendering */}
            {console.log('showAverages:', showAverages, 'averageSpending value:', averageSpending)}
            
            {/* Main category lines */}
            {renderCategories.map((category, index) => {
              const colors = [modernColors.primary, modernColors.secondary, modernColors.success, modernColors.warning, modernColors.error];
              return (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  strokeWidth={2}
                  stroke={colors[index % colors.length]}
                  dot={{ r: 4, strokeWidth: 1, fill: colors[index % colors.length], stroke: '#ffffff' }}
                  activeDot={{ r: 6, strokeWidth: 1, fill: colors[index % colors.length], stroke: '#ffffff' }}
                />
              );
            })}
            
            {/* Enhanced feature: Optional total spending line */}
            {showTotal && (
              <Line
                type="monotone"
                dataKey="totalSpending"
                strokeWidth={3}
                stroke="#ff6b6b"
                strokeDasharray="5 5"
                dot={false}
              />
            )}
            
            {/* Debug: Log when total line should render */}
            {console.log('showTotal:', showTotal, 'averageSpending:', averageSpending)}
          </LineChart>
        </ResponsiveContainer>
        
        {/* Enhanced feature: Chart controls */}
        <div className="chart-controls" style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 'var(--spacing-md)',
          marginTop: '-30px',
        }}>
          <button 
            className="control-button glass-effect"
            onClick={() => setShowTotal(!showTotal)}
            style={{
              fontSize: 'var(--font-size-xs)',
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              borderRadius: 'var(--border-radius-sm)',
              border: 'none',
              color: 'var(--color-text-primary)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
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
        maxHeight: '300px',
        padding: '30px',
        margin: '-30px'
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
            <div key={category} className="stat-card" style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
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
