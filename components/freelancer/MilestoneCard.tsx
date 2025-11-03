"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle2, Clock, AlertCircle, Ban } from "lucide-react"

interface MilestoneCardProps {
  milestone: {
    id: string
    milestoneName: string
    description?: string
    deadline: string
    progress: number
    status: string
    isMilestoneCompleted: boolean
    deliverableUrl?: string
    estimatedHours?: number
    actualHours?: number
    startedAt?: string
    completedAt?: string
  }
}

export function MilestoneCard({ milestone }: MilestoneCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return {
          color: "bg-green-500",
          badgeClass: "bg-green-100 text-green-800",
          icon: CheckCircle2,
          iconColor: "text-green-500"
        }
      case "IN_PROGRESS":
        return {
          color: "bg-blue-500",
          badgeClass: "bg-blue-100 text-blue-800",
          icon: Clock,
          iconColor: "text-blue-500"
        }
      case "BLOCKED":
        return {
          color: "bg-red-500",
          badgeClass: "bg-red-100 text-red-800",
          icon: Ban,
          iconColor: "text-red-500"
        }
      case "PLANNED":
        return {
          color: "bg-gray-400",
          badgeClass: "bg-gray-100 text-gray-800",
          icon: Calendar,
          iconColor: "text-gray-500"
        }
      default:
        return {
          color: "bg-gray-400",
          badgeClass: "bg-gray-100 text-gray-800",
          icon: AlertCircle,
          iconColor: "text-gray-500"
        }
    }
  }

  const config = getStatusConfig(milestone.status)
  const StatusIcon = config.icon

  const isOverdue = new Date(milestone.deadline) < new Date() && !milestone.isMilestoneCompleted

  return (
    <Card className={`border-l-4 ${config.color} hover:shadow-lg transition-shadow`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <StatusIcon className={`w-5 h-5 mt-0.5 ${config.iconColor}`} />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base md:text-lg break-words">
                {milestone.milestoneName}
              </CardTitle>
              {milestone.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {milestone.description}
                </p>
              )}
            </div>
          </div>
          <Badge className={config.badgeClass}>
            {milestone.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Deadline</p>
            <p className={`font-medium text-sm ${isOverdue ? "text-red-600" : ""}`}>
              {new Date(milestone.deadline).toLocaleDateString()}
              {isOverdue && <span className="ml-1 text-xs">(Overdue)</span>}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Progress</p>
            <p className="font-medium text-sm">{milestone.progress}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`${config.color} h-2.5 rounded-full transition-all duration-300`}
            style={{ width: `${milestone.progress}%` }}
          />
        </div>

        {/* Hours Tracking */}
        {(milestone.estimatedHours || milestone.actualHours) && (
          <div className="grid grid-cols-2 gap-4 pt-3 border-t">
            {milestone.estimatedHours && (
              <div>
                <p className="text-xs text-muted-foreground">Estimated Hours</p>
                <p className="font-medium text-sm">{milestone.estimatedHours}h</p>
              </div>
            )}
            {milestone.actualHours && (
              <div>
                <p className="text-xs text-muted-foreground">Actual Hours</p>
                <p className="font-medium text-sm">{milestone.actualHours}h</p>
              </div>
            )}
          </div>
        )}

        {/* Dates */}
        {(milestone.startedAt || milestone.completedAt) && (
          <div className="grid grid-cols-2 gap-4 pt-3 border-t">
            {milestone.startedAt && (
              <div>
                <p className="text-xs text-muted-foreground">Started</p>
                <p className="text-xs">{new Date(milestone.startedAt).toLocaleDateString()}</p>
              </div>
            )}
            {milestone.completedAt && (
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-xs">{new Date(milestone.completedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        )}

        {/* Deliverable Link */}
        {milestone.deliverableUrl && (
          <div className="pt-3 border-t">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href={milestone.deliverableUrl} target="_blank" rel="noopener noreferrer">
                View Deliverable
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
