import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import '../../styles/design-system.css'

const IncomeExpenseChart = ({ chartData, formatCurrency }) => {
  // Transform Chart.js data format to Recharts format
  const transformData = (chartJsData) => {
    if (!chartJsData?.datasets) {
      return []
    }

    const incomeData = chartJsData.datasets.find(d => d.label === 'Income')
    const expenseData = chartJsData.datasets.find(d => d.label === 'Expenses')

    return [{
      name: 'Financial Overview',
      income: incomeData?.data[0] || 0,
      expenses: expenseData?.data[0] || 0,
      net: (incomeData?.data[0] || 0) - (expenseData?.data[0] || 0)
    }]
  }

  const barData = transformData(chartData)
  const hasData = barData.length > 0 && (barData[0].income > 0 || barData[0].expenses > 0)

  // Enhanced tooltip with financial insights
  const renderTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null

    const data = payload[0]?.payload
    const netAmount = data?.net || 0
    const isPositive = netAmount >= 0
    const savingsRate = data?.income > 0 ? ((netAmount / data.income) * 100).toFixed(1) : 0

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
        <div style={{ 
          fontWeight: 600, 
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--spacing-lg)',
          fontSize: 'var(--font-size-base)'
        }}>
          Monthly Financial Summary
        </div>

        {/* Income */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></div>
            <span style={{ color: 'var(--color-text-secondary)' }}>Income: </span>
            <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
              {formatCurrency(data?.income || 0)}
            </span>
          </div>
        </div>

        {/* Expenses */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }}></div>
            <span style={{ color: 'var(--color-text-secondary)' }}>Expenses: </span>
            <span style={{ fontWeight: 600, color: 'var(--color-warning)' }}>
              {formatCurrency(data?.expenses || 0)}
            </span>
          </div>
        </div>

        {/* Net Amount */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Net: </span>
            <span style={{ 
              fontWeight: 600, 
              color: isPositive ? 'var(--color-success)' : 'var(--color-error)'
            }}>
              {isPositive ? '+' : ''}{formatCurrency(netAmount)}
            </span>
          </div>
        </div>

        {/* Savings Rate */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>Savings Rate: </span>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {savingsRate}%
          </span>
        </div>

        {/* Financial Health Badge */}
        <div style={{
          padding: 'var(--spacing-xs) var(--spacing-lg)',
          borderRadius: 'var(--border-radius-full)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 600,
          textAlign: 'center',
          ...(isPositive ? {
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
            color: '#166534',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          } : {
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(248, 113, 113, 0.1) 100%)',
            color: '#991b1b',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          })
        }}>
          {isPositive ? '💰 Saving Money' : '⚠️ Spending More Than Earning'}
        </div>
      </div>
    )
  }

  // Empty state
  if (!hasData) {
    return (
      <div className="chart-card glass-effect hover-lift">
        <div className="chart-header">
          <h3 className="chart-title text-gradient">Income vs. Expenses</h3>
          <p className="chart-subtitle">Monthly financial overview</p>
        </div>
        <div className="loading-container" style={{ height: '320px' }}>
          <div style={{ 
            fontSize: 'var(--font-size-3xl)', 
            marginBottom: 'var(--spacing-3xl)',
            filter: 'grayscale(0.3)'
          }}>💰</div>
          <p style={{ 
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-base)',
            textAlign: 'center'
          }}>
            No financial data available
          </p>
          <p style={{ 
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-sm)',
            marginTop: 'var(--spacing-sm)',
            textAlign: 'center'
          }}>
            Add income and expenses to see your financial overview
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-card glass-effect hover-lift">
      <div className="chart-header">
        <h3 className="chart-title text-gradient">Income vs. Expenses</h3>
        <p className="chart-subtitle">
          Net: <span style={{ 
            fontWeight: 600, 
            color: barData[0].net >= 0 ? 'var(--color-success)' : 'var(--color-error)'
          }}>
            {barData[0].net >= 0 ? '+' : ''}{formatCurrency(barData[0].net)}
          </span>
        </p>
      </div>
      
      <div style={{ height: '320px', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(203, 213, 225, 0.3)" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              style={{ fontSize: 'var(--font-size-sm)', fill: 'var(--color-text-secondary)' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              style={{ fontSize: 'var(--font-size-sm)', fill: 'var(--color-text-secondary)' }}
              tickFormatter={(value) => formatCurrency(value).replace('$', '$')}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }} />
            <Bar 
              dataKey="income" 
              fill="var(--color-success)" 
              radius={[4, 4, 0, 0]}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
            />
            <Bar 
              dataKey="expenses" 
              fill="var(--color-warning)" 
              radius={[4, 4, 0, 0]}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default IncomeExpenseChart
