"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "../../lib/utils"

// Add CSS for data-state styling
const style = document.createElement('style')
if (typeof document !== 'undefined') {
  style.textContent = `
    [role="tab"] {
      padding: 8px 16px;
      font-size: 14px;
      border-radius: 9999px;
      transition: all 0.2s ease;
      cursor: pointer;
      border: 1px solid transparent;
    }
    
    [role="tab"][data-state="active"] {
      background-color: #ecfdf5 !important;
      color: #059669 !important;
      border: 1px solid #d1fae5 !important;
      font-weight: 600 !important;
    }
    
    [role="tab"][data-state="inactive"] {
      background-color: transparent !important;
      color: #64748b !important;
      border: 1px solid transparent !important;
      font-weight: 500 !important;
    }
    
    [role="tab"][data-state="inactive"]:hover {
      background-color: #f1f5f9 !important;
      color: #475569 !important;
    }
  `
  if (document.head) {
    document.head.appendChild(style)
  }
}

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-auto items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </TabsPrimitive.Trigger>
))
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
