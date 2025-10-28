"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "../../lib/utils"

function MonthYearNavigator({
  className,
  month,
  year,
  onMonthChange,
  onYearChange,
  ...props
}) {
  const [showPicker, setShowPicker] = React.useState(false)
  
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

  const handleMonthSelect = (selectedMonth) => {
    onMonthChange(selectedMonth)
    setShowPicker(false)
  }

  const handleYearSelect = (selectedYear) => {
    onYearChange(selectedYear)
    setShowPicker(false)
  }

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  return (
    <div 
      className={cn("flex items-center gap-1 relative", className)}
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

      {/* Current Month/Year Display - Clickable */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="glass-effect hover-lift"
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
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--spacing-sm)'
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
        {months[month - 1]} {year}
        <ChevronDownIcon size={14} style={{ 
          transform: showPicker ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }} />
      </button>

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

      {/* Month/Year Picker Dropdown */}
      {showPicker && (
        <>
          {/* Backdrop to close picker */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10
            }}
            onClick={() => setShowPicker(false)}
          />
          
          {/* Picker Panel */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0, // Right-align with the navigator container
              marginTop: 'var(--spacing-xs)',
              background: 'var(--bg-card)',
              backdropFilter: 'var(--backdrop-blur)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-md)',
              padding: 'var(--spacing-xl)',
              zIndex: 20,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              width: '240px', // Fixed width to prevent overflow
              maxWidth: '90vw' // Responsive fallback
            }}
          >
            {/* Month Grid */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h4 style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--spacing-lg)',
                textAlign: 'center'
              }}>Select Month</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)', // 4 columns for better fit
                gap: 'var(--spacing-xs)' // Smaller gap
              }}>
                {months.map((monthName, index) => (
                  <button
                    key={monthName}
                    onClick={() => handleMonthSelect(index + 1)}
                    style={{
                      padding: 'var(--spacing-xs) var(--spacing-sm)', // More compact padding
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius-sm)',
                      background: month === index + 1 ? 'var(--bg-gradient-primary)' : 'transparent',
                      color: month === index + 1 ? '#ffffff' : 'var(--color-text-primary)',
                      fontSize: 'var(--font-size-xs)', // Smaller font
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      if (month !== index + 1) {
                        e.target.style.background = 'rgba(139, 92, 246, 0.1)'
                        e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                      }
                    }}
                    onMouseOut={(e) => {
                      if (month !== index + 1) {
                        e.target.style.background = 'transparent'
                        e.target.style.borderColor = 'var(--border-color)'
                      }
                    }}
                  >
                    {monthName.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Selection */}
            <div>
              <h4 style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--spacing-lg)',
                textAlign: 'center'
              }}>Select Year</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)', // 5 columns for more compact layout
                gap: 'var(--spacing-xs)', // Smaller gap
                maxHeight: '100px', // Reduced height
                overflowY: 'auto'
              }}>
                {yearOptions.map((yearOption) => (
                  <button
                    key={yearOption}
                    onClick={() => handleYearSelect(yearOption)}
                    style={{
                      padding: 'var(--spacing-xs)', // More compact padding
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius-sm)',
                      background: year === yearOption ? 'var(--bg-gradient-primary)' : 'transparent',
                      color: year === yearOption ? '#ffffff' : 'var(--color-text-primary)',
                      fontSize: 'var(--font-size-xs)', // Smaller font
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      if (year !== yearOption) {
                        e.target.style.background = 'rgba(139, 92, 246, 0.1)'
                        e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                      }
                    }}
                    onMouseOut={(e) => {
                      if (year !== yearOption) {
                        e.target.style.background = 'transparent'
                        e.target.style.borderColor = 'var(--border-color)'
                      }
                    }}
                  >
                    {yearOption}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export { MonthYearNavigator }
