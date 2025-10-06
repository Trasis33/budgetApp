import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { commonMargins } from "./chartUtils"

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
          Monthly Financial Summary
        </div>

        {/* Income */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
            <span style={{ color: 'var(--muted)' }}>Income: </span>
            <span style={{ fontWeight: 600, color: 'var(--success)' }}>
              {formatCurrency(data?.income || 0)}
            </span>
          </div>
        </div>

        {/* Expenses */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warn)' }}></div>
            <span style={{ color: 'var(--muted)' }}>Expenses: </span>
            <span style={{ fontWeight: 600, color: 'var(--warn)' }}>
              {formatCurrency(data?.expenses || 0)}
            </span>
          </div>
        </div>

        {/* Net Amount */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <span style={{ color: 'var(--muted)' }}>Net: </span>
            <span style={{
              fontWeight: 600,
              color: isPositive ? 'var(--success)' : 'var(--danger)'
            }}>
              {isPositive ? '+' : ''}{formatCurrency(netAmount)}
            </span>
          </div>
        </div>

        {/* Savings Rate */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <span style={{ color: 'var(--muted)' }}>Savings Rate: </span>
          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
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
          background: 'transparent',
          ...(isPositive
            ? { color: 'var(--success)', border: '1px solid var(--success)' }
            : { color: 'var(--danger)', border: '1px solid var(--danger)' }
          )
        }}>
          {isPositive ? '💰 Saving Money' : '⚠️ Spending More Than Earning'}
        </div>
      </div>
    )
  }

  // Empty state
  if (!hasData) {
    return (
      <div className="chart-card" style={{ paddingBlock: 'var(--spacing-6xl)' }}>
        <div className="chart-header">
          <h3 className="chart-title" style={{ color: 'var(--ink)' }}>Income vs. Expenses</h3>
          <p className="chart-subtitle" style={{ color: 'var(--muted)' }}>Monthly financial overview</p>
        </div>
        <div className="loading-container" style={{ height: '320px' }}>
          <div style={{
            fontSize: 'var(--font-size-3xl)',
            marginBottom: 'var(--spacing-3xl)',
            filter: 'grayscale(0.3)'
          }}>💰</div>
          <p style={{
            color: 'var(--muted)',
            fontSize: 'var(--font-size-base)',
            textAlign: 'center'
          }}>
            No financial data available
          </p>
          <p style={{
            color: 'var(--muted)',
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
    <div className="chart-card" style={{ paddingBlock: 'var(--spacing-6xl)' }}>
      <div className="chart-header">
        <h3 className="chart-title text-gradient">Income vs. Expenses</h3>
        <p className="chart-subtitle">
          Net: <span style={{
            fontWeight: 600,
            color: barData[0].net >= 0 ? 'var(--success)' : 'var(--danger)'
          }}>
            {barData[0].net >= 0 ? '+' : ''}{formatCurrency(barData[0].net)}
          </span>
        </p>
      </div>

      <div style={{ height: '420px', marginTop: 'var(--spacing-3xl)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barData}
            margin={commonMargins}
            barCategoryGap="26%"
            barGap="10%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 'var(--font-size-xs)', fill: 'var(--color-text-secondary)' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 'var(--font-size-xs)', fill: 'var(--color-text-secondary)' }}
              tickFormatter={(value) => formatCurrency(value).replace('$', '$')}
            />
            <Tooltip content={renderTooltip} cursor={false} />
            <Bar
              dataKey="income"
              fill="var(--success)"
              radius={[4, 4, 0, 0]}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
            />
            <Bar
              dataKey="expenses"
              fill="var(--warn)"
              radius={[4, 4, 0, 0]}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend (top 5 categories) */}
      {/* <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 'var(--spacing-3xl)',
        marginTop: 'var(--spacing-3xl)',
        flexWrap: 'wrap'
      }}>
          <Legend
            key={"Income"}
            color="var(--color-success)"
            label="Income"
          />
          <Legend
            key={"Expenses"}
            color="var(--color-warning)"
            label="Expenses"
          />
      </div> */}
    </div>
  )
}

export default IncomeExpenseChart
