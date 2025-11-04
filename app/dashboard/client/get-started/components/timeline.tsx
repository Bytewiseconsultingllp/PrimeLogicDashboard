"use client"

import React from "react"
import { Check, Clock, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Define timeline options
const timelineOptions = [
  {
    id: "standard",
    label: "Standard Build (2 Months)",
    value: "standard",
    description: "Ideal for full-featured projects with a steady pace and full QA cycle.",
    rushFee: "+0% Rush Fee",
  },
  {
    id: "priority",
    label: "Priority Build (1.5 Months / ~45 Days)",
    value: "priority",
    description: "Balanced speed for projects needing slightly earlier launch.",
    rushFee: "+5% Rush Fee",
  },
  {
    id: "accelerated",
    label: "Accelerated Build (6 Weeks / ~42 Days)",
    value: "accelerated",
    description: "Faster execution with early feedback cycles and quick sprints.",
    rushFee: "+10% Rush Fee",
  },
  {
    id: "rapid",
    label: "Rapid Build (1 Month / 30 Days)",
    value: "rapid",
    description: "Expedited timeline with concentrated team effort.",
    rushFee: "+15% Rush Fee",
  },
  {
    id: "fast-track",
    label: "Fast-Track Build (25 Days)",
    value: "fast-track",
    description: "Ultra-priority delivery for urgent launches. Includes daily updates.",
    rushFee: "+20% Rush Fee",
  },
]

interface TimelineProps {
  selectedTimeline?: string
  onUpdate?: (timeline: string) => void
}

export default function Timeline({ selectedTimeline = "standard", onUpdate }: TimelineProps) {
  // Use a ref to track if this is the first render
  const isFirstRender = React.useRef(true)

  // Initialize state with the prop value or fallback to "standard"
  const [localSelectedTimeline, setLocalSelectedTimeline] = React.useState(() => {
    // Validate the selectedTimeline prop
    const isValidTimeline = timelineOptions.some((option) => option.value === selectedTimeline)
    return isValidTimeline ? selectedTimeline : "standard"
  })

  // Handle timeline selection change
  const handleTimelineChange = React.useCallback(
    (value: string) => {
      try {
        setLocalSelectedTimeline(value)

        // Call onUpdate with the new timeline value if it exists
        if (typeof onUpdate === "function") {
          onUpdate(value)
        }
      } catch (error) {
        console.error("Error in handleTimelineChange:", error)
      }
    },
    [onUpdate],
  )

  // Sync with prop changes, but skip the first render to avoid loops
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (selectedTimeline && selectedTimeline !== localSelectedTimeline) {
      const isValidTimeline = timelineOptions.some((option) => option.value === selectedTimeline)
      if (isValidTimeline) {
        setLocalSelectedTimeline(selectedTimeline)
      }
    }
  }, [selectedTimeline, localSelectedTimeline])

  // Find the selected option safely
  const getSelectedOption = React.useMemo(() => {
    return timelineOptions.find((option) => option.value === localSelectedTimeline) || timelineOptions[0]
  }, [localSelectedTimeline])

  // Error boundary
  if (!timelineOptions || timelineOptions.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p>Timeline options are not available. Please try again later.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">How Fast Would You Like To Get Your Project Delivered?</CardTitle>
        <CardDescription>Choose your preferred project timeline</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Simple radio buttons instead of RadioGroup if that's causing issues */}
        <div className="space-y-4">
          {timelineOptions.map((option) => (
            <div key={option.id} className="flex items-start space-x-2">
              <input
                type="radio"
                id={option.id}
                name="timeline"
                value={option.value}
                checked={localSelectedTimeline === option.value}
                onChange={() => handleTimelineChange(option.value)}
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none w-full">
                <div className="flex items-center justify-between w-full">
                  <label
                    htmlFor={option.id}
                    className={cn(
                      "text-base font-medium flex items-center gap-2",
                      localSelectedTimeline === option.value && "font-semibold",
                    )}
                  >
                    {option.value === "fast-track" ? (
                      <Zap className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    {option.label}
                  </label>

                  <Badge
                    variant="outline"
                    className={cn(
                      "border-[#FF6B35]",
                      option.value === "standard" ? "bg-gray-50 text-gray-700" : "bg-[#FF6B35] text-white",
                      option.value === "fast-track" && "bg-[#FF6B35]",
                    )}
                  >
                    {option.rushFee}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground ml-0.5 mt-1">{option.description}</p>
              </div>
            </div>
          ))}
        </div>

        {localSelectedTimeline !== "standard" && (
          <div className="mt-4 p-4 bg-[#FF6B35] border border-[#FF6B35] rounded-md">
            <div className="flex items-start gap-2">
              <div className="bg-white rounded-full p-1 mt-0.5">
                <Check className="h-4 w-4 text-[#FF6B35]" />
              </div>
              <div>
                <p className="font-medium text-white">You selected: {getSelectedOption.label}</p>
                <p className="text-sm text-white mt-1">
                  {localSelectedTimeline === "fast-track"
                    ? "System adds VIP Tag internally — your project will get high-priority assignment with daily updates."
                    : "Your project will receive prioritized resource allocation based on your selected timeline."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="font-medium mb-2">Additional Notes</h3>
          <p className="text-sm text-muted-foreground">
            Timeline estimates are based on project complexity and resource availability. Faster delivery options
            include priority resource allocation, expedited review processes, and more frequent updates. Rush fees help
            us allocate additional resources to meet your timeline requirements.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <div>
          <p className="text-sm font-medium">Selected Timeline:</p>
          <p className="text-sm text-muted-foreground">
            {getSelectedOption.label}
            {localSelectedTimeline === "fast-track" && " (VIP)"}
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
