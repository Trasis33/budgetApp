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
  ReferenceLine
} from "recharts";
import '../styles/design-system.css';

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
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: 'var(--spacing-md)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                minWidth: '220px',
                maxWidth: '300px'
              }}
              labelStyle={{
                color: 'var(--color-text-primary)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'var(--spacing-sm)',
                fontSize: 'var(--font-size-sm)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: 'var(--spacing-xs)'
              }}
              itemStyle={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-xs)',
                padding: 'var(--spacing-xs) 0'
              }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                
                return (
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    WebkitBackdropFilter: 'blur(10px)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    minWidth: '200px',
                    maxWidth: '280px',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'inherit'
                  }}>
                    {/* Month Label */}
                    <div style={{ 
                      fontWeight: 600, 
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--spacing-sm)',
                      fontSize: 'var(--font-size-sm)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
                            <span style={{ color: 'var(--color-text-secondary)' }}>{entry.dataKey}: </span>
                          </div>
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
                        color: 'var(--color-text-secondary)',
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
                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {formatCurrency(payload.find(p => p.dataKey === 'totalSpending')?.value || 0)}
                        </span>
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
            

            
            {/* Enhanced feature: Add reference line for total spending */}
            {showTotal && (
              <ReferenceLine 
                y={getChartData().reduce((max, item) => Math.max(max, item.totalSpending || 0), 0) * 0.8} 
                stroke="var(--color-accent)" 
                strokeWidth={2}
                strokeDasharray="5 5" 
                label={{
                  value: `Avg Total: ${formatCurrency(getChartData().reduce((sum, item) => sum + (item.totalSpending || 0), 0) / Math.max(getChartData().length, 1))}`,
                  position: 'topLeft',
                  offset: 10,
                  fill: 'var(--color-accent)',
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
                stroke="var(--color-secondary)" 
                strokeWidth={2}
                strokeDasharray="3 3" 
                label={{
                  value: `Avg: ${formatCurrency(averageSpending)}`,
                  position: 'topRight',
                  offset: 10,
                  fill: 'var(--color-secondary)',
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
            

          </LineChart>
        </ResponsiveContainer>
        
        {/* Enhanced feature: Chart controls */}
        <div className="chart-controls" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--spacing-sm)',
          marginTop: '-20px',
          padding: 'var(--spacing-sm)',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: '300px',
          margin: '-20px auto var(--spacing-md)'
        }}>
          <button 
            className="control-button glass-effect"
            onClick={() => setShowTotal(!showTotal)}
            style={{
              fontSize: 'var(--font-size-xs)',
              padding: 'var(--spacing-xs) var(--spacing-md)',
              borderRadius: 'var(--border-radius-md)',
              border: 'none',
              background: showTotal ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.1)',
              color: showTotal ? 'white' : 'var(--color-text-primary)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              fontWeight: 500,
              boxShadow: showTotal ? '0 4px 12px rgba(139, 92, 246, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(5px)'
            }}
          >
            {showTotal ? '✓ Total' : '◯ Total'}
          </button>
          <button 
            className="control-button glass-effect"
            onClick={() => setShowAverages(!showAverages)}
            style={{
              fontSize: 'var(--font-size-xs)',
              padding: 'var(--spacing-xs) var(--spacing-md)',
              borderRadius: 'var(--border-radius-md)',
              border: 'none',
              background: showAverages ? 'var(--color-secondary)' : 'rgba(255, 255, 255, 0.1)',
              color: showAverages ? 'white' : 'var(--color-text-primary)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              fontWeight: 500,
              boxShadow: showAverages ? '0 4px 12px rgba(34, 197, 94, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(5px)'
            }}
          >
            {showAverages ? '✓ Averages' : '◯ Averages'}
          </button>
        </div>
        

      </div>
      
      <div className="stats-container" style={{
        flex: 1,
        marginTop: 'var(--spacing-lg)'
      }}>
        <div className="stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(150px, 1fr))',
          gap: 'var(--spacing-lg)',
          overflowY: 'auto',
          overflowX: 'hidden',
          maxHeight: '350px',
          padding: 'var(--spacing-lg)'
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
    </div>
  );
};

export default SpendingPatternsChart;
