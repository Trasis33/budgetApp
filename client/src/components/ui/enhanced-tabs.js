"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "../../lib/utils"
import '../../styles/design-system.css'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // Base shadcn/ui classes for functionality
      "inline-flex h-auto items-center justify-center rounded-md text-muted-foreground",
      // Design system integration
      "glass-effect",
      className
    )}
    style={{
      background: 'var(--bg-card)',
      backdropFilter: 'var(--backdrop-blur)',
      borderColor: 'var(--border-color)',
      borderRadius: 'var(--border-radius-lg)',
      padding: 'var(--spacing-xs)',
      border: '1px solid var(--border-color)',
      gap: 'var(--spacing-xs)'
    }}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const [isActive, setIsActive] = React.useState(false)
  
  React.useEffect(() => {
    const element = ref?.current
    if (element) {
      const observer = new MutationObserver(() => {
        setIsActive(element.getAttribute('data-state') === 'active')
      })
      observer.observe(element, { attributes: true, attributeFilter: ['data-state'] })
      return () => observer.disconnect()
    }
  }, [ref])

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        // Base functionality classes
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        // Custom hover lift effect
        "hover-lift",
        className
      )}
      style={{
        padding: 'var(--spacing-3xl) var(--spacing-5xl)',
        fontSize: 'var(--font-size-base)',
        fontWeight: isActive ? 600 : 500,
        borderRadius: 'var(--border-radius-md)',
        transition: 'all 0.3s ease',
        background: isActive 
          ? 'var(--bg-gradient-primary)' 
          : isHovered 
            ? 'rgba(139, 92, 246, 0.1)' 
            : 'transparent',
        color: isActive 
          ? '#ffffff' 
          : isHovered 
            ? 'var(--color-primary)' 
            : 'var(--color-text-secondary)',
        transform: isActive 
          ? 'translateY(-1px)' 
          : isHovered 
            ? 'translateY(-2px)' 
            : 'translateY(0)',
        boxShadow: isActive 
          ? 'var(--shadow-hover)' 
          : isHovered 
            ? '0 6px 20px rgba(139, 92, 246, 0.15)' 
            : 'none',
        cursor: 'pointer',
        // Responsive design
        '@media (max-width: 768px)': {
          padding: 'var(--spacing-2xl) var(--spacing-3xl)',
          fontSize: 'var(--font-size-sm)'
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
