"use client"

import type { ReactNode } from "react"

// This component now allows mobile access and passes through all children
// All pages are responsive and work seamlessly on mobile, tablet, and desktop
export default function MobileRestriction({ children }: { children: ReactNode }) {
  // Simply render children without any mobile restrictions
  // All dashboard pages are fully responsive with Tailwind breakpoints
  return <>{children}</>
}
