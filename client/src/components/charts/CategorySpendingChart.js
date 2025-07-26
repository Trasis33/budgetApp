import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import '../../styles/design-system.css'

const CategorySpendingChart = ({ chartData, formatCurrency, budgets = {}, categories = [] }) => {
  // Transform Chart.js data format to Recharts format with filtering
  const transformData = (chartJsData) => {
    if (!chartJsData?.labels || !chartJsData?.datasets?.[0]) {
      return []
    }

    const { labels, datasets } = chartJsData
    const data = datasets[0].data
    const colors = datasets[0].backgroundColor

    // Filter out categories with no spending (amount <= 0) and sort by amount
    return labels
      .map((label, index) => ({
        category: label,
        value: data[index],
        fill: colors[index]
      }))
      .filter(item => item.value > 0) // Only show categories with actual expenses
      .sort((a, b) => b.value - a.value) // Sort by spending amount (highest first)
  }

  const pieData = transformData(chartData)

  // Design system color palette for chart
  const designSystemColors = [
    'var(--color-primary)',      // #8b5cf6
    'var(--color-secondary)',    // #06b6d4
    'var(--color-success)',      // #10b981
    'var(--color-warning)',      // #f59e0b
    'var(--color-error)',        // #ef4444
    '#8b5cf6',  // Purple variant
    '#ec4899',  // Pink
    '#f97316',  // Orange
    '#22c55e',  // Green variant
    '#6b7280'   // Gray
  ]

  // Apply design system colors to pie data
  const enhancedPieData = pieData.map((item, index) => ({
    ...item,
    fill: designSystemColors[index % designSystemColors.length]
  }))

  const totalValue = React.useMemo(() => {
    return enhancedPieData.reduce((acc, curr) => acc + curr.value, 0)
  }, [enhancedPieData])

  // Helper function to get budget information for a category
  const getBudgetInfo = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName)
    if (!category || !budgets[category.id]) {
      return null
    }
    
    const budget = parseFloat(budgets[category.id])
    return budget > 0 ? budget : null
  }

  // Calculate percentage of total spending
  const getSpendingPercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0
  }

  // Get budget utilization percentage
  const getBudgetUtilization = (spent, budget) => {
    return budget > 0 ? ((spent / budget) * 100).toFixed(1) : null
  }

  // Get budget status
  const getBudgetStatus = (spent, budget) => {
    if (!budget) return 'no-budget'
    const utilization = (spent / budget) * 100
    if (utilization > 100) return 'over-budget'
    if (utilization > 90) return 'near-budget'
    return 'under-budget'
  }

  // Empty state with design system styling
  if (!enhancedPieData || enhancedPieData.length === 0) {
    return (
      <div className="chart-card glass-effect hover-lift">
        <div className="chart-header">
          <h3 className="chart-title text-gradient">Spending by Category</h3>
          <p className="chart-subtitle">Breakdown of your expenses</p>
        </div>
        <div className="loading-container" style={{ height: '320px' }}>
          <div style={{ 
            fontSize: 'var(--font-size-3xl)', 
            marginBottom: 'var(--spacing-3xl)',
            filter: 'grayscale(0.3)'
          }}>🍰</div>
          <p style={{ 
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-base)',
            textAlign: 'center'
          }}>
            No spending data available
          </p>
          <p style={{ 
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-sm)',
            marginTop: 'var(--spacing-sm)',
            textAlign: 'center'
          }}>
            Add some expenses to see your spending breakdown by category
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-card glass-effect hover-lift">
      <div className="chart-header">
        <h3 className="chart-title text-gradient">Spending by Category</h3>
        <p className="chart-subtitle">
          Total: <span style={{ 
            fontWeight: 600, 
            color: 'var(--color-text-primary)' 
          }}>
            {formatCurrency(totalValue)}
          </span>
        </p>
      </div>
      
      <div style={{ height: '320px', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                
                const data = payload[0]
                const categoryName = data.payload.category
                const spentAmount = data.value
                const budget = getBudgetInfo(categoryName)
                const spendingPercentage = getSpendingPercentage(spentAmount, totalValue)
                const budgetUtilization = getBudgetUtilization(spentAmount, budget)
                const budgetStatus = getBudgetStatus(spentAmount, budget)

                return (
                  <div style={{
                    background: 'var(--bg-card)',
                    backdropFilter: 'var(--backdrop-blur)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: 'var(--spacing-3xl)',
                    boxShadow: 'var(--shadow-lg)',
                    fontSize: 'var(--font-size-sm)',
                    minWidth: '200px'
                  }}>
                    {/* Category Name */}
                    <div style={{ 
                      fontWeight: 600, 
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--spacing-sm)',
                      fontSize: 'var(--font-size-sm)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      paddingBottom: 'var(--spacing-xs)'
                    }}>
                      {categoryName}
                    </div>

                    {/* Spending Amount */}
                    <div style={{ 
                      marginBottom: 'var(--spacing-lg)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: data.payload.fill
                      }}></div>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Spent: </span>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {formatCurrency(spentAmount)}
                      </span>
                    </div>

                    {/* Percentage of Total */}
                    <div style={{ 
                      marginBottom: 'var(--spacing-lg)',
                      color: 'var(--color-text-secondary)'
                    }}>
                      {spendingPercentage}% of total expenses
                    </div>

                    {/* Budget Information */}
                    {budget ? (
                      <>
                        <div style={{ 
                          marginBottom: 'var(--spacing-sm)',
                          color: 'var(--color-text-secondary)'
                        }}>
                          Budget: {formatCurrency(budget)}
                        </div>
                        <div style={{ 
                          marginBottom: 'var(--spacing-lg)',
                          color: 'var(--color-text-secondary)'
                        }}>
                          Utilization: {budgetUtilization}%
                        </div>
                        
                        {/* Budget Status Badge */}
                        <div style={{
                          padding: 'var(--spacing-xs) var(--spacing-lg)',
                          borderRadius: 'var(--border-radius-full)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 600,
                          textAlign: 'center',
                          ...(budgetStatus === 'over-budget' && {
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(248, 113, 113, 0.1) 100%)',
                            color: '#991b1b',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                          }),
                          ...(budgetStatus === 'near-budget' && {
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%)',
                            color: '#92400e',
                            border: '1px solid rgba(245, 158, 11, 0.2)'
                          }),
                          ...(budgetStatus === 'under-budget' && {
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                            color: '#166534',
                            border: '1px solid rgba(34, 197, 94, 0.2)'
                          })
                        }}>
                          {budgetStatus === 'over-budget' && '⚠️ Over Budget'}
                          {budgetStatus === 'near-budget' && '⚡ Near Limit'}
                          {budgetStatus === 'under-budget' && '✅ On Track'}
                        </div>
                      </>
                    ) : (
                      <div style={{ 
                        color: 'var(--color-text-muted)',
                        fontStyle: 'italic',
                        fontSize: 'var(--font-size-xs)'
                      }}>
                        No budget set for this category
                      </div>
                    )}
                  </div>
                )
              }}
            />
            <Pie
              data={enhancedPieData}
              dataKey="value"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={130}
              paddingAngle={3}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth={2}
              animationDuration={500}
              animationEasing="ease-out"
            >
              {enhancedPieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.filter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15)) brightness(1.1)'
                    e.target.style.transform = 'scale(1.02)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                    e.target.style.transform = 'scale(1)'
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with design system styling */}
      <div style={{ 
        marginTop: 'var(--spacing-4xl)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 'var(--spacing-2xl)'
      }}>
        {enhancedPieData.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-lg)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-sm)',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid var(--border-color)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: item.fill,
              flexShrink: 0,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
            }}></div>
            <div style={{ 
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-primary)',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {item.category}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategorySpendingChart
