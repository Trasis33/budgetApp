import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import '../../styles/design-system.css'
import { buildDistributionData, computeYDomain, currencyTickFormatter, distributionPalette, commonMargins } from "./chartUtils"

/**
 * EnhancedCategorySpendingChart
 *
 * Purpose: DISTINCT from BudgetActualChart.
 * - This chart communicates spending distribution across categories (magnitude and share),
 *   NOT a budget vs actual comparison (handled by BudgetActualChart).
 * - Single-series bar chart (amount per category) with share-of-total in tooltip and legend.
 *
 * Expected chartData (Chart.js-like):
 * {
 *   labels: [ "Food", "Rent", ... ],
 *   datasets: [{ data: [ 230, 800, ... ] }]
 * }
 *
 * Props:
 * - chartData: data object for the selected month
 * - formatCurrency: (number, compact?) => string
 * - selectedMonth: number (0-11)
 * - onMonthChange: (monthIndex: number) => void
 *
 * Differences vs BudgetActualChart:
 * - Series: single (value) vs grouped (budgeted vs actual)
 * - Focus: category magnitude and share vs performance comparison
 * - Tooltip: share-of-total badge vs variance/performance badge
 */
const EnhancedCategorySpendingChart = ({
  chartData,
  formatCurrency,
  selectedMonth,
  onMonthChange
}) => {
  // Build distribution dataset (sorted, filtered, with share%)
  const distributionData = React.useMemo(() => buildDistributionData(chartData), [chartData])

  // Axis/ticks config
  const yDomain = React.useMemo(() => computeYDomain(distributionData, ['value'], 0.15), [distributionData])
  const yTickFormatter = React.useMemo(() => currencyTickFormatter(formatCurrency, true), [formatCurrency])

  // Month switcher
  /* const MonthSwitcher = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const current = Number.isInteger(selectedMonth) ? selectedMonth : new Date().getMonth()

    const setPrev = () => onMonthChange && onMonthChange(current === 0 ? 11 : current - 1)
    const setNext = () => onMonthChange && onMonthChange(current === 11 ? 0 : current + 1)

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-lg)',
        marginTop: 'var(--spacing-sm)'
      }}>
        <button
          type="button"
          aria-label="Previous month"
          onClick={setPrev}
          style={navButtonStyle}
          onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg }}
          onMouseLeave={(e) => { e.currentTarget.style.background = baseBg }}
        >←</button>

        <select
          aria-label="Select month"
          value={current}
          onChange={(e) => onMonthChange && onMonthChange(parseInt(e.target.value))}
          style={selectStyle}
        >
          {months.map((m, idx) => (
            <option key={m} value={idx}>{m}</option>
          ))}
        </select>

        <button
          type="button"
          aria-label="Next month"
          onClick={setNext}
          style={navButtonStyle}
          onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg }}
          onMouseLeave={(e) => { e.currentTarget.style.background = baseBg }}
        >→</button>
      </div>
    )
  } */

  const EnhancedTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const d = payload[0]?.payload
    if (!d) return null

    return (
      <div style={tooltipContainerStyle}>
        <div style={{
          fontWeight: 600,
          color: 'var(--ink)',
          marginBottom: 'var(--spacing-lg)',
          fontSize: 'var(--font-size-base)'
        }}>{label}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <Row label="Amount" value={formatCurrency(d.value)} color="var(--primary)" />
          <Row label="Share" value={`${d.percentage.toFixed(1)}%`} color="var(--success)" />
        </div>
      </div>
    )
  }

  // Empty state
  if (!distributionData.length) {
    return (
      <div className="chart-card" style={{ paddingBlock: 'var(--spacing-6xl)' }}>
        <div className="chart-header">
          <h3 className="chart-title text-gradient">Spending Distribution by Category</h3>
          <p className="chart-subtitle">Relative spending by category</p>
        </div>

        {/* <MonthSwitcher /> */}

        <div className="loading-container" style={{ height: '400px' }}>
          <div style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-3xl)', filter: 'grayscale(0.3)' }}>📊</div>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--font-size-base)', textAlign: 'center' }}>
            No spending data available for this month
          </p>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-sm)', textAlign: 'center' }}>
            Add some expenses to see your category distribution
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-card" style={{ paddingBlock: 'var(--spacing-6xl)' }}>
      <div className="chart-header">
        <h3 className="chart-title text-gradient">Spending Distribution by Category</h3>
        <p className="chart-subtitle">Relative spending by category</p>
      </div>

      {/* <MonthSwitcher /> */}

      <div style={{ height: '420px', marginTop: 'var(--spacing-3xl)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={distributionData}
            margin={commonMargins}
            barCategoryGap="26%"
            barGap="10%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />

            <XAxis
              dataKey="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 'var(--font-size-xs)', fill: 'var(--muted)' }}
              angle={-45}
              textAnchor="end"
            />

            <YAxis
              domain={yDomain}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 'var(--font-size-xs)', fill: 'var(--muted)' }}
              tickFormatter={yTickFormatter}
            />

            <Tooltip content={<EnhancedTooltip />} cursor={false} />

            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
            >
              {distributionData.map((entry, index) => (
                <Cell key={`cell-${entry.category}-${index}`} fill={distributionPalette[index % distributionPalette.length]} />
              ))}
            </Bar>
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
        {distributionData.slice(0, 5).map((item, index) => (
          <LegendSwatch
            key={item.category}
            color={distributionPalette[index % distributionPalette.length]}
            label={`${item.category} (${item.percentage.toFixed(0)}%)`}
          />
        ))}
      </div> */}
    </div>
  )
}

/** UI helpers */
const tooltipContainerStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--border-radius-md)',
  padding: 'var(--spacing-3xl)',
  boxShadow: 'var(--shadow-lg)',
  minWidth: '260px'
}

const Row = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ color: 'var(--muted)' }}>{label}:</span>
    <span style={{ fontWeight: 600, color }}>{value}</span>
  </div>
)

export default EnhancedCategorySpendingChart