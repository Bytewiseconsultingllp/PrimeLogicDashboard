"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  ArrowRight, 
  Loader2, 
  Briefcase, 
  Zap, 
  Code, 
  Users, 
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Target
} from "lucide-react"
import { getMyProjects } from "@/lib/api/client-projects"
import { toast } from "sonner"

interface Project {
  id: string
  clientId: string
  visitorId?: string | null
  discordChatUrl?: string
  paymentStatus: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED"
  acceptingBids: boolean
  details: {
    fullName: string
    businessEmail: string
    phoneNumber?: string
    companyName: string
    companyWebsite?: string
    businessAddress?: string
    businessType: string
    referralSource?: string
  }
  services?: Array<{
    name: string
    childServices: string[]
  }>
  technologies?: Array<{
    category: string
    technologies: string[]
  }>
  estimate?: {
    estimateAccepted: boolean
    estimateFinalPriceMin: number
    estimateFinalPriceMax: number
  }
  milestones?: Array<{
    id: string
    milestoneName: string
    progress: number
    isMilestoneCompleted: boolean
    status: string
  }>
  selectedFreelancers?: Array<{
    id: string
    details: {
      fullName: string
      email: string
    }
  }>
  createdAt: string
  updatedAt: string
}

export default function ProjectStatusPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const response = await getMyProjects(1, 20)
        
        if (response.success) {
          setProjects(response.data.projects || [])
          
          if (response.data.projects?.length > 0) {
            toast.success(`Loaded ${response.data.projects.length} projects`)
          }
        } else {
          throw new Error("Failed to fetch projects")
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Projects fetch error:", err)
        toast.error("Failed to load projects")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCEEDED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "FAILED":
      case "CANCELED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCEEDED":
        return <CheckCircle className="w-4 h-4" />
      case "PENDING":
        return <Clock className="w-4 h-4" />
      case "FAILED":
      case "CANCELED":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const calculateProjectProgress = (milestones?: Array<any>) => {
    if (!milestones || milestones.length === 0) return 0
    const totalProgress = milestones.reduce((sum, milestone) => sum + (milestone.progress || 0), 0)
    return Math.round(totalProgress / milestones.length)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
        <p className="ml-3 text-muted-foreground">Loading project status...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#003087]">Project Status</h1>
          <p className="text-muted-foreground mt-2">Monitor progress and manage all your projects</p>
        </div>
        <Link href="/dashboard/client/projects">
          <Button variant="outline" className="text-[#003087] border-[#003087] hover:bg-[#003087] hover:text-white">
            <Eye className="w-4 h-4 mr-2" />
            View All Projects
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-500 mb-6">You haven't created any projects yet. Get started by creating your first project!</p>
            <Link href="/dashboard/client/create-project">
              <Button className="bg-[#003087] hover:bg-[#003087]/90">
                Create Your First Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const progress = calculateProjectProgress(project.milestones)
            const estimatedValue = project.estimate 
              ? (project.estimate.estimateFinalPriceMin + project.estimate.estimateFinalPriceMax) / 2
              : 0

            return (
              <Card key={project.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-[#003087]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-[#003087] text-white">
                          {project.details.companyName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg text-gray-900 line-clamp-1">
                          {project.details.companyName}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{project.details.businessType}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(project.paymentStatus)}>
                      {getStatusIcon(project.paymentStatus)}
                      <span className="ml-1">
                        {project.paymentStatus === "SUCCEEDED" ? "Paid" : 
                         project.paymentStatus === "PENDING" ? "Pending" : "Unpaid"}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Project ID */}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-mono">ID: {project.id}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(String(project.id)); }}
                    >
                      Copy
                    </Button>
                  </div>
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-medium text-[#003087]">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#003087] to-[#FF6B35] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Project Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Estimated Value</p>
                        <p className="font-medium">${estimatedValue.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Team Size</p>
                        <p className="font-medium">{project.selectedFreelancers?.length || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-xs text-gray-500">Milestones</p>
                        <p className="font-medium">{project.milestones?.length || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Technologies:</p>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 2).map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tech.category.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {project.technologies.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{project.technologies.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Services */}
                  {project.services && project.services.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {project.services.slice(0, 2).map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service.name.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {project.services.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.services.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Link href={`/dashboard/client/projects/${project.id}`}>
                    <Button className="w-full bg-[#003087] hover:bg-[#003087]/90">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
