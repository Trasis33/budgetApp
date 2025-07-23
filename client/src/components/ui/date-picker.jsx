"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

function DatePicker({
  className,
  date,
  onDateChange,
  placeholder = "Pick a date",
  ...props
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            {...props}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              onDateChange(selectedDate)
              setOpen(false)
            }}
            captionLayout="dropdown"
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function MonthYearPicker({
  className,
  month,
  year,
  onMonthChange,
  onYearChange,
  ...props
}) {
  const [open, setOpen] = React.useState(false)
  
  // Create a date object from current month and year for the calendar
  const currentDate = React.useMemo(() => {
    return new Date(year, month - 1, 1)
  }, [month, year])

  const handleDateSelect = (selectedDate) => {
    if (selectedDate) {
      const newMonth = selectedDate.getMonth() + 1
      const newYear = selectedDate.getFullYear()
      
      if (onMonthChange) onMonthChange(newMonth)
      if (onYearChange) onYearChange(newYear)
      
      setOpen(false)
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[200px] justify-start text-left font-normal glass-effect"
            )}
            style={{
              background: 'var(--bg-card)',
              backdropFilter: 'var(--backdrop-blur)',
              border: '1px solid var(--border-color)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-sm)',
              height: '36px',
              padding: '0 var(--spacing-lg)'
            }}
            {...props}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(currentDate, "MMM yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 glass-effect" 
          align="end"
          style={{
            background: 'var(--bg-card)',
            backdropFilter: 'var(--backdrop-blur)',
            border: '1px solid var(--border-color)',
          }}
        >
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={handleDateSelect}
            captionLayout="dropdown"
            initialFocus
            fromYear={new Date().getFullYear() - 10}
            toYear={new Date().getFullYear() + 5}
            className="glass-effect"
            style={{
              background: 'var(--bg-card)',
              backdropFilter: 'var(--backdrop-blur-light)',
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { DatePicker, MonthYearPicker }
