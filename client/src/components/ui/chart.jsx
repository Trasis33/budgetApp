"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

const ChartContext = React.createContext(null)

const ChartContainer = React.forwardRef(({ children, config, className, ...props }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <div ref={ref} className={cn("h-full w-full", className)} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef(({ children, content, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("chart-tooltip", className)} {...props}>
      {content}
    </div>
  )
})
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef(({ active, payload, formatter, className, ...props }, ref) => {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg",
        className
      )}
      style={{
        padding: 'var(--spacing-md)',
        background: 'var(--surface)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow)',
        color: 'var(--ink)'
      }}
      {...props}
    >
      <div className="grid" style={{ gap: 'var(--spacing-xs)' }}>
        {payload.map((item, index) => {
          const { name, value, color, dataKey } = item
          if (!value) return null

          return (
            <div key={`item-${index}`} className="flex items-center" style={{ gap: 'var(--spacing-lg)' }}>
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--muted)' }}>
                {name}:
              </span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--ink)', fontWeight: 600 }}>
                {formatter ? formatter(value, dataKey) : value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef(({ className, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  return (
    <div
      ref={ref}
      className={cn("flex flex-wrap items-center", className)}
      style={{ color: 'var(--muted)', gap: 'var(--spacing-4xl)' }}
      {...props}
    >
      {Object.entries(config || {}).map(([key, value]) => {
        if (value.hidden) return null

        return (
          <div key={key} className="flex items-center" style={{ gap: 'var(--spacing-lg)' }}>
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: value.color }}
            />
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--muted)' }}>{value.label}</span>
          </div>
        )
      })}
    </div>
  )
})
ChartLegend.displayName = "ChartLegend"

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend }