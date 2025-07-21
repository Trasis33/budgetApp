import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import '../../styles/design-system.css'

const BudgetActualChart = ({ chartData, formatCurrency, categories = [] }) => {
  // Transform Chart.js data format to Recharts format
  const transformData = (chartJsData) => {
    if (!chartJsData?.labels || !chartJsData?.datasets) {
      return []
    }

    const budgetedData = chartJsData.datasets.find(d => d.label === 'Budgeted')
    const actualData = chartJsData.datasets.find(d => d.label === 'Actual Spending')

    return chartJsData.labels.map((label, index) => {
      const budgeted = budgetedData?.data[index] || 0
      const actual = actualData?.data[index] || 0
      const variance = budgeted > 0 ? ((actual - budgeted) / budgeted * 100) : 0
      
      const status = budgeted === 0 ? 'no-budget' : 
                     variance > 10 ? 'over-budget' : 
                     variance > -10 ? 'on-track' : 'under-budget'
      
      // Determine color based on status
      const actualColor = status === 'over-budget' ? '#ef4444' : // red
                          status === 'under-budget' ? '#22c55e' : // green  
                          '#f59e0b' // amber/warning
      
      return {
        category: label,
        budgeted,
        actual,
        variance,
        status,
        actualColor
      }
    }).filter(item => item.budgeted > 0 || item.actual > 0) // Only show categories with data
  }

  const barData = transformData(chartData)
  const hasData = barData.length > 0

  // Custom shape for actual spending bars with dynamic colors
  const ActualBar = (props) => {
    const { payload, x, y, width, height } = props
    if (!payload) return null
    
    const status = payload.status
    let fillColor = '#f59e0b' // amber/warning default
    
    if (status === 'over-budget') {
      fillColor = '#ef4444' // red
    } else if (status === 'under-budget') {
      fillColor = '#22c55e' // green
    }
    
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fillColor}
        rx={4}
        ry={4}
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
      />
    )
  }

  // Enhanced tooltip with budget performance insights
  const renderTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null

    const data = payload[0]?.payload
    const variance = data?.variance || 0
    const isOverBudget = variance > 10
    const isUnderBudget = variance < -10

    return (
      <div style={{
        background: 'var(--bg-card)',
        backdropFilter: 'var(--backdrop-blur)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-md)',
        padding: 'var(--spacing-3xl)',
        boxShadow: 'var(--shadow-lg)',
        fontSize: 'var(--font-size-sm)',
        minWidth: '220px'
      }}>
        <div style={{ 
          fontWeight: 600, 
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--spacing-lg)',
          fontSize: 'var(--font-size-base)'
        }}>
          {data?.category}
        </div>

        {/* Budgeted Amount */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }}></div>
            <span style={{ color: 'var(--color-text-secondary)' }}>Budgeted: </span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {formatCurrency(data?.budgeted || 0)}
            </span>
          </div>
        </div>

        {/* Actual Spending */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: isOverBudget ? 'var(--color-error)' : 
                               isUnderBudget ? 'var(--color-success)' : 'var(--color-warning)'
            }}></div>
            <span style={{ color: 'var(--color-text-secondary)' }}>Actual: </span>
            <span style={{ 
              fontWeight: 600, 
              color: isOverBudget ? 'var(--color-error)' : 
                     isUnderBudget ? 'var(--color-success)' : 'var(--color-warning)'
            }}>
              {formatCurrency(data?.actual || 0)}
            </span>
          </div>
        </div>

        {/* Variance */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>Variance: </span>
          <span style={{ 
            fontWeight: 600, 
            color: isOverBudget ? 'var(--color-error)' : 
                   isUnderBudget ? 'var(--color-success)' : 'var(--color-text-primary)'
          }}>
            {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
          </span>
        </div>

        {/* Budget Performance Badge */}
        <div style={{
          padding: 'var(--spacing-xs) var(--spacing-lg)',
          borderRadius: 'var(--border-radius-full)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 600,
          textAlign: 'center',
          ...(isOverBudget ? {
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(248, 113, 113, 0.1) 100%)',
            color: '#991b1b',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          } : isUnderBudget ? {
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
            color: '#166534',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          } : {
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%)',
            color: '#92400e',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          })
        }}>
          {isOverBudget ? '⚠️ Over Budget' : 
           isUnderBudget ? '💰 Under Budget' : '🎯 On Track'}
        </div>
      </div>
    )
  }

  // Empty state
  if (!hasData) {
    return (
      <div className="chart-card glass-effect hover-lift">
        <div className="chart-header">
          <h3 className="chart-title text-gradient">Budget vs. Actual Spending</h3>
          <p className="chart-subtitle">Budget performance by category</p>
        </div>
        <div className="loading-container" style={{ height: '320px' }}>
          <div style={{ 
            fontSize: 'var(--font-size-3xl)', 
            marginBottom: 'var(--spacing-3xl)',
            filter: 'grayscale(0.3)'
          }}>🎯</div>
          <p style={{ 
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-base)',
            textAlign: 'center'
          }}>
            No budget comparison data available
          </p>
          <p style={{ 
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-sm)',
            marginTop: 'var(--spacing-sm)',
            textAlign: 'center'
          }}>
            Set budgets for categories to see performance comparison
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-card glass-effect hover-lift">
      <div className="chart-header">
        <h3 className="chart-title text-gradient">Budget vs. Actual Spending</h3>
        <p className="chart-subtitle">
          {barData.filter(d => d.status === 'over-budget').length} categories over budget
        </p>
      </div>
      
      <div style={{ height: '350px', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(203, 213, 225, 0.3)" />
            <XAxis 
              dataKey="category" 
              axisLine={false}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
              style={{ fontSize: 'var(--font-size-xs)', fill: 'var(--color-text-secondary)' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              style={{ fontSize: 'var(--font-size-sm)', fill: 'var(--color-text-secondary)' }}
              tickFormatter={(value) => formatCurrency(value).replace('$', '$')}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }} />
            <Bar 
              dataKey="budgeted" 
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
            />
            <Bar 
              dataKey="actual"
              shape={ActualBar}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default BudgetActualChart
