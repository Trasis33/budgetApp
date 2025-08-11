import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import '../../styles/design-system.css'
import { buildBudgetActualData, computeYDomain, currencyTickFormatter, commonMargins } from "./chartUtils"

const BudgetActualChart = ({ chartData, formatCurrency }) => {
  // Transform using shared utils
  const barData = React.useMemo(() => buildBudgetActualData(chartData), [chartData])
  const hasData = barData.length > 0

  // Scales and ticks
  const yDomain = React.useMemo(() => computeYDomain(barData, ['budgeted', 'actual'], 0.15), [barData])
  const yTickFormatter = React.useMemo(() => currencyTickFormatter(formatCurrency, true), [formatCurrency])

  // Custom shape for actual spending bars with dynamic colors
  const ActualBar = (props) => {
    const { payload, x, y, width, height } = props
    if (!payload) return null
    
    const status = payload.status
    let fillColor = 'var(--warn)' // token warning default
    
    if (status === 'over-budget') {
      fillColor = 'var(--danger)'
    } else if (status === 'under-budget') {
      fillColor = 'var(--success)'
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
        background: 'var(--surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-md)',
        padding: 'var(--spacing-3xl)',
        boxShadow: 'var(--shadow-lg)',
        fontSize: 'var(--font-size-sm)',
        minWidth: '220px'
      }}>
        <div style={{ 
          fontWeight: 600, 
          color: 'var(--ink)',
          marginBottom: 'var(--spacing-lg)',
          fontSize: 'var(--font-size-base)'
        }}>
          {data?.category}
        </div>

        {/* Budgeted Amount */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>
            <span style={{ color: 'var(--muted)' }}>Budgeted: </span>
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
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
              backgroundColor: isOverBudget ? 'var(--danger)' : 
                               isUnderBudget ? 'var(--success)' : 'var(--warn)'
            }}></div>
            <span style={{ color: 'var(--muted)' }}>Actual: </span>
            <span style={{ 
              fontWeight: 600, 
              color: isOverBudget ? 'var(--danger)' : 
                     isUnderBudget ? 'var(--success)' : 'var(--warn)'
            }}>
              {formatCurrency(data?.actual || 0)}
            </span>
          </div>
        </div>

        {/* Variance */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <span style={{ color: 'var(--muted)' }}>Variance: </span>
          <span style={{ 
            fontWeight: 600, 
            color: isOverBudget ? 'var(--danger)' : 
                   isUnderBudget ? 'var(--success)' : 'var(--ink)'
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
            color: 'var(--danger)',
            border: '1px solid var(--danger)',
            background: 'transparent'
          } : isUnderBudget ? {
            color: 'var(--success)',
            border: '1px solid var(--success)',
            background: 'transparent'
          } : {
            color: 'var(--warn)',
            border: '1px solid var(--warn)',
            background: 'transparent'
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
      <div className="chart-card" style={{ paddingBlock: 'var(--spacing-6xl)' }}>
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
            color: 'var(--muted)',
            fontSize: 'var(--font-size-base)',
            textAlign: 'center'
          }}>
            No budget comparison data available
          </p>
          <p style={{ 
            color: 'var(--muted)',
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
    <div className="chart-card" style={{ paddingBlock: 'var(--spacing-6xl)' }}>
      <div className="chart-header">
        <h3 className="chart-title text-gradient">Budget vs. Actual Spending</h3>
        <p className="chart-subtitle">
          {barData.filter(d => d.status === 'over-budget').length} categories over budget
        </p>
      </div>
      
      <div style={{ height: '350px', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={commonMargins} barCategoryGap="30%" barGap="10%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis 
              dataKey="category" 
              axisLine={false}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              style={{ fontSize: 'var(--font-size-xs)', fill: 'var(--muted)' }}
            />
            <YAxis
              domain={yDomain}
              axisLine={false}
              tickLine={false}
              style={{ fontSize: 'var(--font-size-sm)', fill: 'var(--muted)' }}
              tickFormatter={yTickFormatter}
            />
            <Tooltip content={renderTooltip} cursor={false} />
            <Bar
              dataKey="budgeted"
              fill="var(--primary)"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
            />
            <Bar
              dataKey="actual"
              shape={ActualBar}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default BudgetActualChart
