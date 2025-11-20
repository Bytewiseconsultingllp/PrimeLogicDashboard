"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Loader2, 
  ArrowRight, 
  Briefcase, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  DollarSign,
  User,
  Target,
  TrendingUp,
  Eye
} from "lucide-react"
import { getUserDetails } from "@/lib/api/storage"
import { toast } from "sonner"

interface Milestone {
  id: string
  title: string
  description: string
  progress: number
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED"
  dueDate: string
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  assignedFreelancerId?: string
  estimatedHours?: number
  actualHours?: number
  budgetEstimate?: number
}

interface ProjectWithMilestones {
  id: string
  details?: {
    companyName: string
    fullName: string
    businessEmail: string
    businessType?: string
  }
  services?: any[]
  technologies?: any[]
  timeline?: {
    estimatedDays?: number
    option?: string
  }
  estimate?: {
    estimateFinalPriceMin: number
    estimateFinalPriceMax: number
  }
  calculatedTotal?: string | number
  milestones?: Milestone[]
  paymentStatus?: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED"
  createdAt: string
  updatedAt: string
}

export default function ProjectStatusPage() {
  const [projects, setProjects] = useState<ProjectWithMilestones[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjectsAndMilestones = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get authentication token
        const userDetails = getUserDetails()
        if (!userDetails) {
          throw new Error("No authentication found")
        }
        
        const token = userDetails.accessToken
        console.log("🔄 Fetching freelancer's assigned projects with milestones...")
        
        // Fetch projects assigned to this freelancer
        const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/freelancer/my-projects?page=1&limit=20`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        })
        
        console.log("📡 Projects API Response Status:", response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log("✅ Projects API Response Data:", data)
          
          if (data.success && data.data?.projects) {
            // Fetch milestones for each project
            const projectsWithMilestones = await Promise.all(
              data.data.projects.map(async (project: any) => {
                try {
                  // Fetch milestones for this project
                  const milestonesResponse = await fetch(`${process.env.NEXT_PUBLIC_PLS}/freelancer/my-projects/${project.id}/milestones`, {
                    headers: { 
                      "Authorization": `Bearer ${token}`,
                      "Content-Type": "application/json"
                    },
                  })
                  
                  let milestones = []
                  if (milestonesResponse.ok) {
                    const milestonesData = await milestonesResponse.json()
                    milestones = milestonesData.success ? milestonesData.data : []
                  }
                  
                  return {
                    ...project,
                    milestones
                  }
                } catch (error) {
                  console.error(`Failed to fetch milestones for project ${project.id}:`, error)
                  return { ...project, milestones: [] }
                }
              })
            )

            setProjects(projectsWithMilestones)
            toast.success(`Loaded ${projectsWithMilestones.length} projects with milestones`)
          } else {
            setProjects([])
            console.log("ℹ️ No assigned projects found")
          }
        } else {
          const errorData = await response.text()
          console.error("❌ Projects API Error:", response.status, errorData)
          throw new Error(`Failed to load projects: ${response.status}`)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to fetch projects"
        setError(errorMsg)
        toast.error(errorMsg)
        console.error("Error fetching projects:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectsAndMilestones()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500 text-white"
      case "IN_PROGRESS":
        return "bg-blue-500 text-white"
      case "BLOCKED":
        return "bg-red-500 text-white"
      case "PLANNED":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-400 text-white"
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200"
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getProjectProgress = (project: ProjectWithMilestones) => {
    if (!project.milestones || project.milestones.length === 0) return 0
    const completedMilestones = project.milestones.filter(m => m.status === "COMPLETED").length
    return Math.round((completedMilestones / project.milestones.length) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#003087] mx-auto" />
          <p className="text-muted-foreground">Loading project status and milestones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003087] to-[#FF6B35] rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Project Status & Milestones</h1>
            <p className="text-white/80 mt-2">Track your active projects and milestone progress</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{projects.length}</div>
              <div className="text-sm text-white/80">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {projects.reduce((acc, p) => acc + (p.milestones?.filter(m => m.status === "COMPLETED").length || 0), 0)}
              </div>
              <div className="text-sm text-white/80">Completed Milestones</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Projects</h3>
            <p className="text-muted-foreground mb-6">You don't have any assigned projects with milestones yet.</p>
            <Link href="/dashboard/freelancer/projects">
              <Button className="bg-[#003087] hover:bg-[#003087]/90">
                Browse Available Projects
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {projects.map((project) => {
            const progress = getProjectProgress(project)
            const totalAmount = parseFloat(project.calculatedTotal?.toString() || "0")
            
            return (
              <div key={project.id} className="space-y-6">
                {/* Project Overview Card */}
                <Card className="border-2 border-[#003087]/20 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-[#003087]/10 to-[#FF6B35]/10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl md:text-2xl text-[#003087] mb-2">
                          {project.details?.companyName || "Project"}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>Client: {project.details?.fullName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {project.timeline?.estimatedDays 
                                ? `${project.timeline.estimatedDays} days` 
                                : project.timeline?.option || "Timeline TBD"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={project.paymentStatus === "SUCCEEDED" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}>
                          {project.paymentStatus || "PENDING"}
                        </Badge>
                        {totalAmount > 0 && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Project Value</p>
                            <p className="text-lg font-bold text-[#FF6B35]">${totalAmount.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Progress Overview */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Overall Progress</span>
                          <span className="text-sm text-muted-foreground">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {project.milestones?.filter(m => m.status === "COMPLETED").length || 0} completed
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-500" />
                            {project.milestones?.length || 0} total
                          </span>
                        </div>
                      </div>

                      {/* Milestone Stats */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Milestone Status</h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Completed:</span>
                            <span className="font-medium text-green-600">
                              {project.milestones?.filter(m => m.status === "COMPLETED").length || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>In Progress:</span>
                            <span className="font-medium text-blue-600">
                              {project.milestones?.filter(m => m.status === "IN_PROGRESS").length || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Planned:</span>
                            <span className="font-medium text-gray-600">
                              {project.milestones?.filter(m => m.status === "PLANNED").length || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Blocked:</span>
                            <span className="font-medium text-red-600">
                              {project.milestones?.filter(m => m.status === "BLOCKED").length || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <Link href={`/dashboard/freelancer/projects/${project.id}`} className="flex-1">
                          <Button variant="outline" className="w-full text-[#003087] border-[#003087] hover:bg-[#003087] hover:text-white">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => toast.info("Milestone management coming soon!")}
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Manage Milestones
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Milestones Grid */}
                {project.milestones && project.milestones.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.milestones.map((milestone) => (
                      <Card key={milestone.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-[#003087]">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base font-semibold text-[#003087] leading-tight">
                              {milestone.title}
                            </CardTitle>
                            <Badge className={getStatusColor(milestone.status)} variant="secondary">
                              {milestone.status}
                            </Badge>
                          </div>
                          {milestone.priority && (
                            <Badge className={getPriorityColor(milestone.priority)} variant="outline">
                              {milestone.priority}
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {milestone.description}
                          </p>
                          
                          {/* Progress */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Progress</span>
                              <span>{milestone.progress}%</span>
                            </div>
                            <Progress value={milestone.progress} className="h-2" />
                          </div>

                          {/* Due Date */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                          </div>

                          {/* Budget & Hours */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {milestone.budgetEstimate && (
                              <div>
                                <span className="text-muted-foreground">Budget:</span>
                                <p className="font-medium text-[#FF6B35]">${milestone.budgetEstimate.toLocaleString()}</p>
                              </div>
                            )}
                            {milestone.estimatedHours && (
                              <div>
                                <span className="text-muted-foreground">Est. Hours:</span>
                                <p className="font-medium">{milestone.estimatedHours}h</p>
                              </div>
                            )}
                          </div>

                          {milestone.status === "BLOCKED" && (
                            <div className="flex items-center gap-2 p-2 bg-red-50 rounded text-xs text-red-700">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Milestone is blocked</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">No milestones defined for this project yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
