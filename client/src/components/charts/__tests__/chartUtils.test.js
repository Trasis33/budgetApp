import {
  buildDistributionData,
  buildBudgetActualData,
  computeYDomain,
  currencyTickFormatter
} from '../../charts/chartUtils'

describe('chartUtils', () => {
  describe('buildDistributionData', () => {
    it('returns sorted, filtered distribution with percentages', () => {
      const chartJsData = {
        labels: ['A', 'B', 'C'],
        datasets: [{ data: [100, 300, 0] }]
      }

      const result = buildDistributionData(chartJsData)
      expect(result).toHaveLength(2)
      // Sorted by value desc
      expect(result[0].category).toBe('B')
      expect(result[0].value).toBe(300)
      expect(result[1].category).toBe('A')
      expect(result[1].value).toBe(100)

      // Percentages (300/400=75%, 100/400=25%)
      const p0 = Number(result[0].percentage.toFixed(1))
      const p1 = Number(result[1].percentage.toFixed(1))
      expect(p0).toBeCloseTo(75.0, 1)
      expect(p1).toBeCloseTo(25.0, 1)
      expect(Number((p0 + p1).toFixed(1))).toBeCloseTo(100.0, 1)
    })

    it('handles empty or zero totals', () => {
      expect(buildDistributionData(null)).toEqual([])
      expect(buildDistributionData({ labels: [], datasets: [] })).toEqual([])
      const zero = buildDistributionData({ labels: ['A'], datasets: [{ data: [0] }] })
      expect(zero).toEqual([])
    })
  })

  describe('buildBudgetActualData', () => {
    it('maps budgeted vs actual and classifies status with colors', () => {
      const chartJsData = {
        labels: ['A', 'B', 'C', 'D'],
        datasets: [
          { label: 'Budgeted', data: [100, 100, 100, 0] },
          { label: 'Actual Spending', data: [120, 95, 70, 50] }
        ]
      }

      const result = buildBudgetActualData(chartJsData)
      expect(result).toHaveLength(4)

      const a = result.find(r => r.category === 'A')
      const b = result.find(r => r.category === 'B')
      const c = result.find(r => r.category === 'C')
      const d = result.find(r => r.category === 'D')

      expect(a.status).toBe('over-budget')
      expect(a.actual).toBe(120)
      expect(a.budgeted).toBe(100)
      expect(a.actualColor).toBe('#ef4444') // red

      expect(b.status).toBe('on-track')
      expect(b.actualColor).toBe('#f59e0b') // amber

      expect(c.status).toBe('under-budget')
      expect(c.actualColor).toBe('#22c55e') // green

      expect(d.status).toBe('no-budget')
      // falls back to amber for no-budget
      expect(d.actualColor).toBe('#f59e0b')
    })

    it('filters out rows with no values correctly', () => {
      const chartJsData = {
        labels: ['A', 'B'],
        datasets: [
          { label: 'Budgeted', data: [0, 0] },
          { label: 'Actual Spending', data: [0, 0] }
        ]
      }
      const result = buildBudgetActualData(chartJsData)
      expect(result).toEqual([])
    })
  })

  describe('computeYDomain', () => {
    it('computes padded domain from multiple keys', () => {
      const data = [
        { category: 'A', budgeted: 100, actual: 120 },
        { category: 'B', budgeted: 80, actual: 60 }
      ]
      const [min, max] = computeYDomain(data, ['budgeted', 'actual'], 0.15)
      expect(min).toBe(0)
      // 120 * 1.15 = 138; ceil -> 138
      expect(max).toBe(138)
    })

    it('returns [0,0] for empty', () => {
      expect(computeYDomain([], ['value'])).toEqual([0, 0])
    })
  })

  describe('currencyTickFormatter', () => {
    it('uses provided formatCurrency when available', () => {
      const formatCurrency = (v) => `SEK ${Number(v).toFixed(0)}`
      const fmt = currencyTickFormatter(formatCurrency, true)
      expect(fmt(1234)).toBe('SEK 1234')
    })

    it('falls back to Intl.NumberFormat on error', () => {
      const badFormatter = () => { throw new Error('nope') }
      const fmt = currencyTickFormatter(badFormatter, true)
      const out = fmt(1000)
      expect(typeof out).toBe('string')
      expect(out).toMatch(/kr|SEK| kr/) // locale-dependent
    })
  })
})