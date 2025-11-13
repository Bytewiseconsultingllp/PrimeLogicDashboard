"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Briefcase, 
  Calendar, 
  DollarSign, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Eye,
  Github,
  MessageSquare,
  Star,
  TrendingUp
} from "lucide-react"
import { getUserDetails } from "@/lib/api/storage"
import { toast } from "sonner"

interface Project {
  id: string
  details: {
    fullName: string
    businessEmail: string
    companyName: string
    businessType?: string
    phoneNumber?: string
    companyWebsite?: string
  }
  services?: any[]
  industries?: any[]
  technologies?: any[]
  features?: any[]
  timeline?: {
    option?: string
    estimatedDays?: number
    description?: string
  }
  estimate?: {
    estimateFinalPriceMin: number
    estimateFinalPriceMax: number
  }
  paymentStatus: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED"
  calculatedTotal?: string | number
  milestones?: Array<{
    id: string
    title: string
    description: string
    progress: number
    status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED"
    dueDate: string
  }>
  createdAt: string
  updatedAt: string
}

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get authentication token
        const userDetails = getUserDetails()
        if (!userDetails) {
          throw new Error("No authentication found")
        }
        
        const token = userDetails.accessToken
        console.log("🔄 Fetching freelancer's assigned projects...")
        
        // Fetch projects assigned to this freelancer
        const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/api/v1/projects/my-projects?page=1&limit=20`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        })
        
        console.log("📡 My Projects API Response Status:", response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log("✅ My Projects API Response Data:", data)
          
          if (data.success && data.data?.projects) {
            setProjects(data.data.projects)
            toast.success(`Loaded ${data.data.projects.length} assigned projects`)
          } else {
            setProjects([])
            console.log("ℹ️ No assigned projects found")
          }
        } else {
          const errorData = await response.text()
          console.error("❌ My Projects API Error:", response.status, errorData)
          throw new Error(`Failed to load projects: ${response.status}`)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to fetch projects"
        setError(errorMsg)
        toast.error(errorMsg)
        console.error("Error fetching my projects:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMyProjects()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCEEDED": return "bg-green-500"
      case "PENDING": return "bg-yellow-500"
      case "FAILED": return "bg-red-500"
      case "CANCELED": return "bg-gray-500"
      default: return "bg-blue-500"
    }
  }

  const getProjectProgress = (project: Project) => {
    if (!project.milestones || project.milestones.length === 0) return 0
    const completedMilestones = project.milestones.filter(m => m.status === "COMPLETED").length
    return Math.round((completedMilestones / project.milestones.length) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#003087] mx-auto" />
          <p className="text-muted-foreground">Loading your assigned projects...</p>
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
            <h1 className="text-2xl md:text-3xl font-bold">My Projects</h1>
            <p className="text-white/80 mt-2">
              Projects you're currently working on ({projects.length} active)
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{projects.length}</div>
              <div className="text-sm text-white/80">Total Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {projects.filter(p => p.paymentStatus === "SUCCEEDED").length}
              </div>
              <div className="text-sm text-white/80">Paid Projects</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Projects Assigned</h3>
            <p className="text-muted-foreground mb-6">
              You don't have any assigned projects yet. Start by browsing available projects and placing bids.
            </p>
            <Link href="/dashboard/freelancer/projects">
              <Button className="bg-[#003087] hover:bg-[#003087]/90">
                Browse Available Projects
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => {
            const progress = getProjectProgress(project)
            const totalAmount = parseFloat(project.calculatedTotal?.toString() || "0")
            
            return (
              <Card key={project.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-[#003087]/20 overflow-hidden">
                {/* Header with gradient */}
                <CardHeader className="bg-gradient-to-r from-[#003087]/10 to-[#FF6B35]/10 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-[#003087] mb-1">
                        {project.details?.companyName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {project.details?.businessType}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(project.paymentStatus)} text-white`}>
                      {project.paymentStatus}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  {/* Client Info */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-[#003087] text-white">
                        {project.details?.fullName?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{project.details?.fullName}</p>
                      <p className="text-xs text-muted-foreground">{project.details?.businessEmail}</p>
                    </div>
                  </div>

                  {/* Project Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {project.milestones?.filter(m => m.status === "COMPLETED").length || 0} completed
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {project.milestones?.length || 0} total
                      </span>
                    </div>
                  </div>

                  {/* Project Value */}
                  {totalAmount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Project Value</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        ${totalAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Timeline */}
                  {project.timeline && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-[#003087]" />
                      <span className="text-muted-foreground">Timeline:</span>
                      <span className="font-medium">
                        {project.timeline.estimatedDays ? `${project.timeline.estimatedDays} days` : project.timeline.option || "N/A"}
                      </span>
                    </div>
                  )}

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Technologies</span>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech: any, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {typeof tech === 'string' ? tech : tech.name || tech.technology || 'Tech'}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{project.technologies.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/dashboard/freelancer/projects/${project.id}`} className="flex-1">
                      <Button variant="outline" className="w-full text-[#003087] border-[#003087] hover:bg-[#003087] hover:text-white">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="px-3"
                      onClick={() => toast.info("GitHub integration coming soon!")}
                    >
                      <Github className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="px-3"
                      onClick={() => toast.info("Discord integration coming soon!")}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Project ID */}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Project ID</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded block truncate flex-1">
                        {project.id}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(String(project.id)); }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Statistics Cards */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">
                    {projects.reduce((acc, p) => acc + (p.milestones?.filter(m => m.status === "COMPLETED").length || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">
                    {projects.reduce((acc, p) => acc + (p.milestones?.filter(m => m.status === "IN_PROGRESS").length || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-[#FF6B35]">
                    ${projects.reduce((acc, p) => acc + parseFloat(p.calculatedTotal?.toString() || "0"), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
