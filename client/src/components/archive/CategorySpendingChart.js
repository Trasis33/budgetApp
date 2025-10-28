import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

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

  // Dual Ledger core token palette for chart (cycled)
  const tokenPalette = [
    'var(--primary)',
    'var(--success)',
    'var(--warn)',
    'var(--danger)',
    'var(--muted)'
  ]

  // Apply token palette colors to pie data
  const enhancedPieData = pieData.map((item, index) => ({
    ...item,
    fill: tokenPalette[index % tokenPalette.length]
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
      <div className="chart-card" style={{ paddingBlock: 'var(--spacing-6xl)' }}>
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
            color: 'var(--muted)',
            fontSize: 'var(--font-size-base)',
            textAlign: 'center'
          }}>
            No spending data available
          </p>
          <p style={{ 
            color: 'var(--muted)',
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
    <div className="chart-card" style={{ paddingBlock: 'var(--spacing-6xl)' }}>
      <div className="chart-header">
        <h3 className="chart-title text-gradient">Spending by Category</h3>
        <p className="chart-subtitle">
          Total: <span style={{ 
            fontWeight: 600, 
            color: 'var(--ink)'
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
                    background: 'var(--surface)',
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
                      color: 'var(--ink)',
                      marginBottom: 'var(--spacing-sm)',
                      fontSize: 'var(--font-size-sm)',
                      borderBottom: '1px solid var(--border-color)',
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
                      <span style={{ color: 'var(--muted)' }}>Spent: </span>
                      <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                        {formatCurrency(spentAmount)}
                      </span>
                    </div>

                    {/* Percentage of Total */}
                    <div style={{ 
                      marginBottom: 'var(--spacing-lg)',
                      color: 'var(--muted)'
                    }}>
                      {spendingPercentage}% of total expenses
                    </div>

                    {/* Budget Information */}
                    {budget ? (
                      <>
                        <div style={{ 
                          marginBottom: 'var(--spacing-sm)',
                          color: 'var(--muted)'
                        }}>
                          Budget: {formatCurrency(budget)}
                        </div>
                        <div style={{ 
                          marginBottom: 'var(--spacing-lg)',
                          color: 'var(--muted)'
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
                          background: 'transparent',
                          ...(budgetStatus === 'over-budget' && {
                            color: 'var(--danger)',
                            border: '1px solid var(--danger)'
                          }),
                          ...(budgetStatus === 'near-budget' && {
                            color: 'var(--warn)',
                            border: '1px solid var(--warn)'
                          }),
                          ...(budgetStatus === 'under-budget' && {
                            color: 'var(--success)',
                            border: '1px solid var(--success)'
                          })
                        }}>
                          {budgetStatus === 'over-budget' && '⚠️ Over Budget'}
                          {budgetStatus === 'near-budget' && '⚡ Near Limit'}
                          {budgetStatus === 'under-budget' && '✅ On Track'}
                        </div>
                      </>
                    ) : (
                      <div style={{ 
                        color: 'var(--muted)',
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
              stroke="var(--border-color)"
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

      {/* Legend with Dual Ledger styling */}
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
            background: 'var(--surface)',
            border: '1px solid var(--border-color)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--surface)'
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
              color: 'var(--ink)',
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
