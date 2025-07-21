import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import '../../styles/design-system.css'

const CategorySpendingChart = ({ chartData, formatCurrency }) => {
  // Transform Chart.js data format to Recharts format
  const transformData = (chartJsData) => {
    if (!chartJsData?.labels || !chartJsData?.datasets?.[0]) {
      return []
    }

    const { labels, datasets } = chartJsData
    const data = datasets[0].data
    const colors = datasets[0].backgroundColor

    return labels.map((label, index) => ({
      category: label,
      value: data[index],
      fill: colors[index]
    }))
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
            No category data available
          </p>
          <p style={{ 
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-sm)',
            marginTop: 'var(--spacing-sm)',
            textAlign: 'center'
          }}>
            Add some expenses to see your spending breakdown
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
