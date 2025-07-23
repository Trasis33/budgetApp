"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "../../lib/utils"

function MonthYearNavigator({
  className,
  month,
  year,
  onMonthChange,
  onYearChange,
  ...props
}) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const handlePrevious = () => {
    if (month === 1) {
      onMonthChange(12)
      onYearChange(year - 1)
    } else {
      onMonthChange(month - 1)
    }
  }

  const handleNext = () => {
    if (month === 12) {
      onMonthChange(1)
      onYearChange(year + 1)
    } else {
      onMonthChange(month + 1)
    }
  }

  return (
    <div 
      className={cn("flex items-center gap-1", className)}
      {...props}
    >
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        className="glass-effect hover-lift"
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'var(--backdrop-blur)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-sm)',
          padding: 'var(--spacing-md)',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-1px)'
          e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.15)'
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = 'none'
        }}
      >
        <ChevronLeftIcon size={16} />
      </button>

      {/* Current Month/Year Display */}
      <div
        className="glass-effect"
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'var(--backdrop-blur)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-sm)',
          padding: 'var(--spacing-md) var(--spacing-xl)',
          color: 'var(--color-text-primary)',
          fontSize: 'var(--font-size-base)',
          fontWeight: 500,
          minWidth: '140px',
          textAlign: 'center',
          userSelect: 'none'
        }}
      >
        {months[month - 1]} {year}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className="glass-effect hover-lift"
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'var(--backdrop-blur)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-sm)',
          padding: 'var(--spacing-md)',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-1px)'
          e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.15)'
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = 'none'
        }}
      >
        <ChevronRightIcon size={16} />
      </button>
    </div>
  )
}

export { MonthYearNavigator }
