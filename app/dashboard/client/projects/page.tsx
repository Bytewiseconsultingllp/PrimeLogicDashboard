"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Plus, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Loader2
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchProjects()
  }, [currentPage])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await getMyProjects(currentPage, 12)
      
      if (response.success) {
        setProjects(response.data.projects || [])
        setTotalPages(Math.ceil((response.data.pagination?.total || 0) / 12))
        
        if (response.data.projects?.length > 0) {
          toast.success(`Loaded ${response.data.projects.length} projects`)
        }
      } else {
        toast.error("Failed to load projects")
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast.error("Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCEEDED":
        return "bg-green-100 text-green-800 border-green-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "FAILED":
      case "CANCELED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.details.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.details.businessType.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === "all" || project.paymentStatus === filterStatus
    
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
        <p className="ml-3 text-muted-foreground">Loading your projects...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#003087]">My Projects</h1>
          <p className="text-muted-foreground">
            Manage and track all your projects in one place
          </p>
        </div>
        <Link href="/dashboard/client/create-project">
          <Button className="bg-gradient-to-r from-[#003087] to-[#FF6B35] hover:from-[#003087]/90 hover:to-[#FF6B35]/90">
            <Plus className="w-4 h-4 mr-2" />
            Create New Project
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search projects by company name or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                All Projects
              </Button>
              <Button
                variant={filterStatus === "SUCCEEDED" ? "default" : "outline"}
                onClick={() => setFilterStatus("SUCCEEDED")}
                size="sm"
              >
                Completed
              </Button>
              <Button
                variant={filterStatus === "PENDING" ? "default" : "outline"}
                onClick={() => setFilterStatus("PENDING")}
                size="sm"
              >
                In Progress
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== "all" 
                ? "No projects match your current filters. Try adjusting your search criteria."
                : "You haven't created any projects yet. Get started by creating your first project!"
              }
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Link href="/dashboard/client/create-project">
                <Button className="bg-[#003087] hover:bg-[#003087]/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
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
                        <CardDescription className="text-sm">
                          {project.details.businessType}
                        </CardDescription>
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
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
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
                      <span className="text-gray-600">Value:</span>
                      <span className="font-medium">${estimatedValue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600">Team:</span>
                      <span className="font-medium">{project.selectedFreelancers?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-600">Tasks:</span>
                      <span className="font-medium">{project.milestones?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Technologies:</p>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tech.category}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{project.technologies.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Link href={`/dashboard/client/projects/${project.id}`}>
                    <Button className="w-full bg-[#003087] hover:bg-[#003087]/90">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "bg-[#003087]" : ""}
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
