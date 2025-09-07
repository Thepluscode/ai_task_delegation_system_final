"use client"

import * as React from "react"

// Inline utility function to avoid import issues
const cn = (...classes) => classes.filter(Boolean).join(' ').trim()

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }
