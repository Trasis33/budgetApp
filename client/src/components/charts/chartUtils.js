/* Shared chart utilities to unify data mapping and chart configuration across charts.
   Distinguishes purposes:
   - BudgetActualChart: compare budgeted vs actual amounts by category (grouped bars).
   - EnhancedCategorySpendingChart: visualize spending distribution across categories (single-series amount with share in tooltip).

   All transforms accept Chart.js-like data:
   {
     labels: string[],
     datasets: [{ label?: string, data: number[] }]
   }
*/

export function buildDistributionData(chartJsData) {
  if (!chartJsData?.labels || !chartJsData?.datasets?.[0]) return []
  const { labels, datasets } = chartJsData
  const values = datasets[0].data || []
  const total = values.reduce((sum, v) => sum + Number(v || 0), 0)
  if (total === 0) return []

  return labels
    .map((label, i) => {
      const value = Number(values[i]) || 0
      return {
        category: label,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0
      }
    })
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
}

export function buildBudgetActualData(chartJsData) {
  if (!chartJsData?.labels || !chartJsData?.datasets) return []
  const budgetedData = chartJsData.datasets.find(d => d.label === 'Budgeted')
  const actualData = chartJsData.datasets.find(d => d.label === 'Actual Spending')

  const toNumber = v => Number(v || 0)

  return chartJsData.labels
    .map((label, index) => {
      const budgeted = toNumber(budgetedData?.data?.[index])
      const actual = toNumber(actualData?.data?.[index])
      const variance = budgeted > 0 ? ((actual - budgeted) / budgeted) * 100 : 0

      const status =
        budgeted === 0 ? 'no-budget' :
        variance > 10 ? 'over-budget' :
        variance > -10 ? 'on-track' : 'under-budget'

      const actualColor =
        status === 'over-budget' ? '#ef4444' :
        status === 'under-budget' ? '#22c55e' : '#f59e0b'

      return { category: label, budgeted, actual, variance, status, actualColor }
    })
    .filter(item => item.budgeted > 0 || item.actual > 0)
}

export function computeYDomain(data, keys, padRatio = 0.15) {
  if (!Array.isArray(data) || data.length === 0) return [0, 0]
  const max = data.reduce((m, d) => {
    const kmax = keys.reduce((km, k) => Math.max(km, Number(d[k] || 0)), 0)
    return Math.max(m, kmax)
  }, 0)
  const padded = max > 0 ? Math.ceil(max * (1 + padRatio)) : 0
  return [0, padded]
}

export function currencyTickFormatter(formatCurrency, compact) {
  return v => {
    try {
      return formatCurrency(v, compact)
    } catch {
      // Fallback to Intl if provided formatter doesn't accept compact flag
      return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(v)
    }
  }
}

// Shared design palette for per-category coloring
export const distributionPalette = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-error)',
  '#8b5cf6', // purple variant
  '#ec4899', // pink
  '#f97316', // orange
  '#22c55e', // green variant
  '#6b7280'  // gray
]

// Common margins for consistent look
export const commonMargins = { top: 20, right: 24, left: 12, bottom: 64 }