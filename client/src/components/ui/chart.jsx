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
        "rounded-lg border bg-background p-2 shadow-md",
        className
      )}
      {...props}
    >
      <div className="grid gap-0.5">
        {payload.map((item, index) => {
          const { name, value, color, dataKey } = item
          if (!value) return null

          return (
            <div key={`item-${index}`} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs font-medium">
                {name}:
              </span>
              <span className="text-xs font-medium">
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
      className={cn("flex flex-wrap items-center gap-4", className)}
      {...props}
    >
      {Object.entries(config || {}).map(([key, value]) => {
        if (value.hidden) return null

        return (
          <div key={key} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: value.color }}
            />
            <span className="text-xs font-medium">{value.label}</span>
          </div>
        )
      })}
    </div>
  )
})
ChartLegend.displayName = "ChartLegend"

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend }